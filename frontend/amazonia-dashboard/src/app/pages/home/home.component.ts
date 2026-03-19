import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration, ChartData } from 'chart.js';

/** Valor numérico do tooltip (barras horizontais usam `x`, verticais/linha usam `y`). */
function tooltipParsedValue(
  ctx: { parsed?: { x?: number | null; y?: number | null } },
  horizontal: boolean
): number {
  const p = ctx.parsed;
  if (!p) return 0;
  if (horizontal) return Number(p.x ?? p.y ?? 0);
  return Number(p.y ?? p.x ?? 0);
}
import { RestorationService } from '../../services/restoration.service';
import { FilterService } from '../../services/filter.service';
import type { RestorationRecord } from '../../models/restoration.model';
import { AmazonMapComponent } from '../../components/amazon-map/amazon-map.component';
import { ChartCardComponent } from '../../components/chart-card/chart-card.component';
import { DataTableComponent } from '../../components/data-table/data-table.component';
import { HighlightCardComponent } from '../../components/highlight-card/highlight-card.component';
import { LogoCapoeiraComponent } from '../../components/logo-capoeira/logo-capoeira.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { LanguageService } from '../../services/language.service';
import { TranslationService } from '../../services/translation.service';
import { SubscriberService } from '../../services/subscriber.service';
import { AnalysisService } from '../../services/analysis.service';
import type { ScientificInsight } from '../../models/analysis.model';

type RestorationType =
  | 'Regeneração natural'
  | 'Plantio de nativas'
  | 'Sistema agroflorestal'
  | 'Não informado';

function restorationTypeForRegion(region: string): RestorationType {
  // Heurística leve para habilitar o filtro "tipo" sem alterar a fonte CSV.
  // Pode ser substituída futuramente quando o dataset tiver a coluna oficial.
  switch (region) {
    case 'Pará':
      return 'Plantio de nativas';
    case 'Acre':
      return 'Regeneração natural';
    case 'Rondônia':
      return 'Sistema agroflorestal';
    case 'Amazonas':
      return 'Regeneração natural';
    default:
      return 'Não informado';
  }
}

type EnrichedRecord = RestorationRecord & { restoration_type: RestorationType };

export interface CatalogItem {
  id: string;
  name: string;
  institution: string;
  year: number;
  type: string;
  status: string;
  description: string;
}

const MOCK_CATALOG: CatalogItem[] = [
  {
    id: '1',
    name: 'Área restaurada por região e ano',
    institution: 'Embrapa Amazônia Oriental',
    year: 2023,
    type: 'Restauração',
    status: 'Publicado',
    description: 'Área em hectares e carbono sequestrado por região e ano.',
  },
  {
    id: '2',
    name: 'Indicadores de carbono na Amazônia',
    institution: 'Centro CAPOEIRA',
    year: 2022,
    type: 'Carbono',
    status: 'Publicado',
    description: 'Estoque de carbono (tCO₂e) nos sítios de restauração.',
  },
  {
    id: '3',
    name: 'Sítios de monitoramento',
    institution: 'Parceiros CAPOEIRA',
    year: 2021,
    type: 'Monitoramento',
    status: 'Publicado',
    description: 'Localização e características dos sítios de estudo.',
  },
  {
    id: '4',
    name: 'Dados de regeneração natural',
    institution: 'Embrapa Amazônia Oriental',
    year: 2020,
    type: 'Regeneração',
    status: 'Publicado',
    description: 'Taxas de regeneração por método e região.',
  },
  {
    id: '5',
    name: 'Inventário Florestal - Paragominas',
    institution: 'Embrapa - Pará',
    year: 2024,
    type: 'Restauração',
    status: 'Publicado',
    description: 'Inventário de espécies e área em restauração na região de Paragominas.',
  },
  {
    id: '6',
    name: 'Monitoramento de Carbono - Amazônia Central',
    institution: 'INPA - Amazonas',
    year: 2023,
    type: 'Carbono',
    status: 'Publicado',
    description: 'Séries temporais de estoque de carbono em parcelas permanentes.',
  },
  {
    id: '7',
    name: 'Biodiversidade em áreas em recuperação',
    institution: 'MPEG - Pará',
    year: 2025,
    type: 'Regeneração',
    status: 'Em revisão',
    description: 'Levantamento de espécies em áreas de regeneração natural (em revisão pelos pares).',
  },
  {
    id: '8',
    name: 'Remote sensing of restoration areas',
    institution: 'CAPOEIRA / INPE',
    year: 2024,
    type: 'Monitoramento',
    status: 'Processando',
    description: 'Dados de sensoriamento remoto para mapeamento de áreas em restauração (em processamento).',
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    AmazonMapComponent,
    ChartCardComponent,
    DataTableComponent,
    HighlightCardComponent,
    LogoCapoeiraComponent,
    ScrollRevealDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly restorationService = inject(RestorationService);
  protected readonly filterService = inject(FilterService);
  private readonly languageService = inject(LanguageService);
  private readonly translation = inject(TranslationService);
  private readonly subscriberService = inject(SubscriberService);
  private readonly analysisService = inject(AnalysisService);

  /**
   * Telas estreitas (mobile): gráficos do laboratório em 1 coluna + barras horizontais.
   */
  protected readonly isLabCompactLayout = signal(false);
  private mediaCleanup?: () => void;

  protected readonly data = signal<RestorationRecord[]>([]);
  /** Scientific insights from analysis API (dynamic when available). */
  protected readonly scientificInsights = signal<ScientificInsight[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly subscriberName = signal('');
  protected readonly subscriberEmail = signal('');
  protected readonly subscriberStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  protected readonly subscriberError = signal<string | null>(null);

  /** Região selecionada no mapa para exibir no painel lateral */
  protected readonly selectedRegionForPanel = signal<string | null>(null);

  protected readonly catalogItems = MOCK_CATALOG;
  protected readonly catalogSearch = signal('');
  protected readonly catalogYearFilter = signal<number | null>(null);
  protected readonly catalogTypeFilter = signal<string | null>(null);
  protected readonly catalogStatusFilter = signal<string | null>(null);

  private static readonly CATALOG_TYPE_KEYS: Record<string, string> = {
    'Restauração': 'catalog_type_restoration',
    'Carbono': 'catalog_type_carbon',
    'Monitoramento': 'catalog_type_monitoring',
    'Regeneração': 'catalog_type_regeneration',
  };
  private static readonly CATALOG_STATUS_KEYS: Record<string, string> = {
    'Publicado': 'catalog_status_published',
    'Em revisão': 'catalog_status_in_review',
    'Processando': 'catalog_status_processing',
  };

  /** Catálogo com textos traduzidos (name, institution, type, status, description) conforme idioma. */
  protected readonly translatedCatalogItems = computed(() => {
    this.languageService.current();
    const t = this.translation.get.bind(this.translation);
    return this.catalogItems.map((item) => ({
      ...item,
      name: t(`catalog_${item.id}_name`),
      institution: t(`catalog_${item.id}_institution`),
      typeDisplay: t(`catalog_${item.id}_type`),
      statusDisplay: t(`catalog_${item.id}_status`),
      description: t(`catalog_${item.id}_description`),
    }));
  });

  protected readonly filteredCatalog = computed(() => {
    const search = this.catalogSearch().toLowerCase();
    const year = this.catalogYearFilter();
    const type = this.catalogTypeFilter();
    const status = this.catalogStatusFilter();
    return this.translatedCatalogItems().filter((item) => {
      if (search && !(item.name + item.description + item.institution).toLowerCase().includes(search)) return false;
      if (year != null && item.year !== year) return false;
      if (type != null && item.type !== type) return false;
      if (status != null && item.status !== status) return false;
      return true;
    });
  });

  protected readonly catalogUniqueYears = computed(() =>
    [...new Set(this.catalogItems.map((i) => i.year))].sort((a, b) => b - a)
  );
  protected readonly catalogUniqueTypes = computed(() =>
    [...new Set(this.catalogItems.map((i) => i.type))].sort()
  );
  protected readonly catalogUniqueStatuses = computed(() =>
    [...new Set(this.catalogItems.map((i) => i.status))].sort()
  );

  /** Contagem por status no resultado filtrado (para pills "N publicado", etc.). */
  protected readonly catalogStatusCounts = computed(() => {
    const list = this.filteredCatalog();
    const counts: Record<string, number> = {};
    for (const item of list) {
      counts[item.status] = (counts[item.status] ?? 0) + 1;
    }
    return counts;
  });

  /** Ordem dos status para exibir as pills (publicado, em revisão, processando). */
  protected readonly catalogStatusOrder: string[] = ['Publicado', 'Em revisão', 'Processando'];

  protected catalogTypeLabel(rawType: string): string {
    const key = HomeComponent.CATALOG_TYPE_KEYS[rawType];
    return key ? this.translation.get(key) : rawType;
  }

  protected catalogStatusLabel(rawStatus: string): string {
    const key = HomeComponent.CATALOG_STATUS_KEYS[rawStatus];
    return key ? this.translation.get(key) : rawStatus;
  }

  protected readonly enrichedData = computed<EnrichedRecord[]>(() =>
    this.data().map((r) => ({
      ...r,
      restoration_type: restorationTypeForRegion(r.region),
    }))
  );

  protected readonly filteredData = computed(() =>
    this.filterService.filterRecords(this.enrichedData() as unknown as RestorationRecord[])
  );

  /** Dados exibidos no mapa: todos os sítios quando nenhum filtro está ativo, senão dados filtrados. */
  protected readonly mapRecords = computed(() =>
    this.filterService.hasActiveFilters()
      ? this.filteredData()
      : (this.enrichedData() as unknown as RestorationRecord[])
  );

  /** Registros para marcadores do mapa: sempre todas as regiões (filtro de região não esconde outros marcadores). */
  protected readonly mapMarkerRecords = computed(() =>
    this.filterService.filterRecordsWithoutRegion(
      this.enrichedData() as unknown as RestorationRecord[]
    )
  );

  /** Resumo para a legenda do mapa: contagem por região. */
  protected readonly mapRegionCounts = computed(() => {
    const records = this.mapRecords();
    const byRegion = new Map<string, number>();
    for (const r of records) {
      byRegion.set(r.region, (byRegion.get(r.region) ?? 0) + 1);
    }
    return [...byRegion.entries()]
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => a.region.localeCompare(b.region));
  });

  protected readonly uiText = computed(() => {
    this.languageService.current();
    const t = this.translation.get.bind(this.translation);
    return {
      heroTagline: t('hero_tagline'),
      heroTitle: t('hero_title'),
      heroSubtitle: t('hero_subtitle'),
      exploreButton: t('explore_data'),
      panoramaTitle: t('panorama_title'),
      panoramaSubtitle: t('panorama_subtitle'),
      panoramaFiltersIntro: t('panorama_filters_intro'),
      panoramaFiltersMapHint: t('panorama_filters_map_hint'),
      laboratorioTitle: t('laboratorio_title'),
      laboratorioSubtitle: t('laboratorio_subtitle'),
      mapTitle: t('map_title'),
      mapSubtitle: t('map_subtitle'),
      basesTitle: t('bases_title'),
      basesSubtitle: t('bases_subtitle'),
      insightsTitle: t('insights_title'),
      insightsSubtitle: t('insights_subtitle'),
      centroTitle: t('centro_title'),
      centroSubtitle: t('centro_subtitle'),
      centroBody: t('centro_body'),
      centroTeam: t('centro_team'),
      contactTitle: t('contact_title'),
      contactSubtitle: t('contact_subtitle'),
      contactNameLabel: t('contact_name_label'),
      contactEmailLabel: t('contact_email_label'),
      contactButton: t('contact_button'),
      contactSuccess: t('contact_success'),
      contactError: t('contact_error'),
      filterYear: t('filter_year'),
      filterRegion: t('filter_region'),
      filterRestorationType: t('filter_restoration_type'),
      filterAll: t('filter_all'),
      filterClear: t('filter_clear'),
      mapPanelRestored: t('map_panel_restored'),
      mapPanelCarbon: t('map_panel_carbon'),
      mapPanelRecords: t('map_panel_records'),
      mapPanelClose: t('map_panel_close'),
      mapSeeCharts: t('map_see_charts'),
      mapSitesDisplayed: t('map_sites_displayed'),
      mapRecordsInRegions: t('map_records_in_regions'),
      mapRegions: t('map_regions'),
      mapClickMarkerHint: t('map_click_marker_hint'),
      labChartsHint: t('lab_charts_hint'),
      catalogSearchPlaceholder: t('catalog_search_placeholder'),
      catalogType: t('catalog_type'),
      catalogStatus: t('catalog_status'),
      catalogExplore: t('catalog_explore'),
      catalogCountFound: t('catalog_count_found'),
      insight1Title: t('insight1_title'),
      insight1Lead: t('insight1_lead'),
      insight1_1: t('insight1_1'),
      insight1_2: t('insight1_2'),
      insight2Title: t('insight2_title'),
      insight2Lead: t('insight2_lead'),
      insight2_1: t('insight2_1'),
      insight2_2: t('insight2_2'),
      insight2_3: t('insight2_3'),
      insight3Title: t('insight3_title'),
      insight3Lead: t('insight3_lead'),
      insight3_1: t('insight3_1'),
      insight3_2: t('insight3_2'),
      loadingMessage: t('loading_message'),
      errorBackendHint: t('error_backend_hint'),
      panoramaAreaTitle: t('panorama_area_title'),
      panoramaAreaSubtitle: t('panorama_area_subtitle'),
      panoramaCarbonTitle: t('panorama_carbon_title'),
      panoramaCarbonSubtitle: t('panorama_carbon_subtitle'),
      panoramaBiodiversityTitle: t('panorama_biodiversity_title'),
      panoramaBiodiversitySubtitle: t('panorama_biodiversity_subtitle'),
      panoramaRegenerationTitle: t('panorama_regeneration_title'),
      panoramaRegenerationSubtitle: t('panorama_regeneration_subtitle'),
      panoramaSitesTitle: t('panorama_sites_title'),
      panoramaSitesSubtitle: t('panorama_sites_subtitle'),
      panoramaInstitutionsTitle: t('panorama_institutions_title'),
      panoramaInstitutionsSubtitle: t('panorama_institutions_subtitle'),
    };
  });

  protected readonly uniqueYears = computed(() => {
    const years = [...new Set(this.data().map((r) => r.year))].sort(
      (a, b) => a - b
    );
    return years;
  });

  protected readonly uniqueRegions = computed(() =>
    [...new Set(this.data().map((r) => r.region))].sort()
  );

  protected readonly uniqueRestorationTypes = computed(() => {
    const types = [
      ...new Set(this.enrichedData().map((r) => r.restoration_type)),
    ].sort();
    return types;
  });

  protected readonly totalRestored = computed(() =>
    this.filteredData().reduce((s, r) => s + r.area_restored, 0)
  );
  protected readonly totalCarbon = computed(() =>
    this.filteredData().reduce((s, r) => s + r.carbon, 0)
  );
  protected readonly regionCount = computed(
    () => new Set(this.filteredData().map((r) => r.region)).size
  );
  protected readonly yearCount = computed(
    () => new Set(this.filteredData().map((r) => r.year)).size
  );

  protected readonly restorationTrend = computed(() => {
    const records = this.filteredData();
    if (records.length < 2) return '—';
    const sorted = [...records].sort((a, b) => a.year - b.year);
    const firstYear = sorted[0].year;
    const lastYear = sorted[sorted.length - 1].year;
    const firstTotal = sorted
      .filter((r) => r.year === firstYear)
      .reduce((s, r) => s + r.area_restored, 0);
    const lastTotal = sorted
      .filter((r) => r.year === lastYear)
      .reduce((s, r) => s + r.area_restored, 0);
    if (firstTotal === 0) return lastTotal > 0 ? 'Crescente' : '—';
    const pct = Math.round(((lastTotal - firstTotal) / firstTotal) * 100);
    if (pct > 0) return `+${pct}%`;
    if (pct < 0) return `${pct}%`;
    return 'Estável';
  });

  /** Área total monitorada (ha) */
  protected readonly areaTotalMonitorada = computed(() =>
    this.filteredData().reduce((s, r) => s + r.area_restored, 0)
  );
  /** Estoque médio de carbono (tCO₂e) — média simples dos registros */
  protected readonly estoqueMedioCarbono = computed(() => {
    const d = this.filteredData();
    if (!d.length) return 0;
    const total = d.reduce((s, r) => s + r.carbon, 0);
    return Math.round((total / d.length) * 10) / 10;
  });
  /** Índice de biodiversidade (0–1) estimado a partir de carbono/ha */
  protected readonly indiceBiodiversidade = computed(() => {
    const d = this.filteredData();
    if (!d.length) return 0;
    const avgCarbonPerHa =
      d.reduce((s, r) => s + (r.area_restored > 0 ? r.carbon / r.area_restored : 0), 0) / d.length;
    return Math.min(0.95, Math.round((0.4 + avgCarbonPerHa * 8) * 100) / 100);
  });
  /** Taxa média de regeneração (%) estimada */
  protected readonly taxaMediaRegeneracao = computed(() => {
    const d = this.filteredData();
    if (!d.length) return 0;
    const avgCarbonPerHa =
      d.reduce((s, r) => s + (r.area_restored > 0 ? r.carbon / r.area_restored : 0), 0) / d.length;
    return Math.min(95, Math.round(40 + avgCarbonPerHa * 600));
  });
  /** Número de sítios de estudo (regiões únicas) */
  protected readonly numeroSitios = computed(
    () => new Set(this.filteredData().map((r) => r.region)).size
  );
  /** Número de instituições participantes (estimado pelas regiões no dataset) */
  protected readonly numeroInstituicoes = computed(
    () => new Set(this.filteredData().map((r) => r.region)).size
  );

  protected readonly panoramaVariationArea = computed(() => {
    const all = this.enrichedData();
    const filtered = this.filteredData();
    if (all.length === 0 || filtered.length === 0) return '';
    const totalAll = all.reduce((s, r) => s + r.area_restored, 0);
    const totalF = filtered.reduce((s, r) => s + r.area_restored, 0);
    if (totalAll === 0) return '';
    const pct = Math.round(((totalF - totalAll) / totalAll) * 100);
    if (pct === 0) return '0%';
    return pct > 0 ? `+${pct}%` : `${pct}%`;
  });
  /** Tendência do carbono (primeiro vs último ano) para tooltip de variação */
  protected readonly carbonTrendVariation = computed(() => {
    const records = this.filteredData();
    if (records.length < 2) return '';
    const sorted = [...records].sort((a, b) => a.year - b.year);
    const firstYear = sorted[0].year;
    const lastYear = sorted[sorted.length - 1].year;
    const firstC = sorted.filter((r) => r.year === firstYear).reduce((s, r) => s + r.carbon, 0);
    const lastC = sorted.filter((r) => r.year === lastYear).reduce((s, r) => s + r.carbon, 0);
    if (firstC === 0) return lastC > 0 ? '+100%' : '';
    const pct = Math.round(((lastC - firstC) / firstC) * 100);
    if (pct === 0) return '0%';
    return pct > 0 ? `+${pct}%` : `${pct}%`;
  });
  protected readonly panoramaVariationCarbon = computed(() => this.carbonTrendVariation());
  protected readonly panoramaVariationSites = computed(() => '');

  protected readonly areaChartData = computed<
    ChartConfiguration<'bar'>['data']
  >(() => {
    const records = this.filteredData();
    if (!records.length) return { labels: [], datasets: [] };
    const sorted = [...records].sort((a, b) => a.year - b.year);
    return {
      labels: sorted.map((r) => r.year.toString()),
      datasets: [
        {
          label: 'Área restaurada (ha)',
          data: sorted.map((r) => r.area_restored),
          backgroundColor: 'rgba(30, 60, 50, 0.75)',
          borderColor: 'rgb(30, 60, 50)',
          borderWidth: 1,
        },
      ],
    };
  });

  /** Mesmos dados servem para linha (desktop) e barras horizontais (mobile). */
  protected readonly carbonChartData = computed((): ChartData<'bar' | 'line'> => {
    const records = this.filteredData();
    if (!records.length) return { labels: [], datasets: [] };
    const sorted = [...records].sort((a, b) => a.year - b.year);
    return {
      labels: sorted.map((r) => r.year.toString()),
      datasets: [
        {
          label: 'Carbono sequestrado (tCO₂e)',
          data: sorted.map((r) => r.carbon),
          fill: true,
          tension: 0.35,
          backgroundColor: 'rgba(74, 107, 90, 0.2)',
          borderColor: 'rgb(74, 107, 90)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(74, 107, 90)',
          pointBorderColor: '#fdfcfa',
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    } as ChartData<'bar' | 'line'>;
  });

  protected readonly areaChartOptions = computed<
    ChartConfiguration<'bar'>['options']
  >(() => {
    const compact = this.isLabCompactLayout();
    const records = [...this.filteredData()].sort((a, b) => a.year - b.year);
    const value = (ctx: { parsed?: { x?: number | null; y?: number | null } }) =>
      tooltipParsedValue(ctx, compact);
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: compact ? 'y' : 'x',
      animation: { duration: 600 },
      plugins: {
        legend: {
          display: true,
          position: compact ? 'bottom' : 'top',
          labels: { boxWidth: compact ? 10 : 40, font: { size: compact ? 10 : 12 } },
        },
        title: {
          display: true,
          text: 'Área restaurada por ano',
          font: { size: compact ? 13 : 14 },
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const i = items[0]?.dataIndex ?? 0;
              const r = records[i] as unknown as EnrichedRecord | undefined;
              return r ? `${r.region} — ${r.year}` : 'Detalhes';
            },
            label: (ctx) => `Área restaurada: ${value(ctx)} ha`,
            afterLabel: (ctx) => {
              const i = ctx.dataIndex ?? 0;
              const r = records[i] as unknown as EnrichedRecord | undefined;
              if (!r) return '';
              const carbonPerHa =
                r.area_restored > 0 ? r.carbon / r.area_restored : 0;
              const biodiversityEst = Math.min(0.95, 0.4 + carbonPerHa * 8);
              const regenEst = Math.min(95, 40 + carbonPerHa * 600);
              return [
                `Tipo (estimado): ${r.restoration_type}`,
                `Carbono: ${r.carbon} tCO₂e`,
                `Índice de biodiversidade (estimado): ${biodiversityEst.toFixed(2)}`,
                `Taxa de regeneração (estimada): ${Math.round(regenEst)}%`,
              ];
            },
          },
        },
      },
      scales: compact
        ? {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'Hectares', font: { size: 11 } },
              ticks: { font: { size: 10 } },
            },
            y: {
              title: { display: true, text: 'Ano', font: { size: 11 } },
              ticks: { font: { size: 10 } },
            },
          }
        : {
            y: { beginAtZero: true, title: { display: true, text: 'Hectares' } },
            x: { title: { display: true, text: 'Ano' } },
          },
    };
  });

  /** No mobile usamos barras horizontais (mesmos dados) para leitura mais clara. */
  protected readonly labCarbonChartType = computed<'line' | 'bar'>(() =>
    this.isLabCompactLayout() ? 'bar' : 'line'
  );

  protected readonly carbonChartOptions = computed<
    ChartConfiguration<'bar' | 'line'>['options']
  >(() => {
    const compact = this.isLabCompactLayout();
    const records = [...this.filteredData()].sort((a, b) => a.year - b.year);
    const carbonVal = (ctx: { parsed?: { x?: number | null; y?: number | null } }) =>
      tooltipParsedValue(ctx, compact);
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: compact ? 'y' : ('x' as const),
      animation: { duration: 600 },
      plugins: {
        legend: {
          display: true,
          position: compact ? 'bottom' : 'top',
          labels: { boxWidth: compact ? 10 : 40, font: { size: compact ? 10 : 12 } },
        },
        title: {
          display: true,
          text: 'Sequestro de carbono por ano',
          font: { size: compact ? 13 : 14 },
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const i = items[0]?.dataIndex ?? 0;
              const r = records[i] as unknown as EnrichedRecord | undefined;
              return r ? `${r.region} — ${r.year}` : 'Detalhes';
            },
            label: (ctx) => `Carbono: ${carbonVal(ctx)} tCO₂e`,
            afterLabel: (ctx) => {
              const i = ctx.dataIndex ?? 0;
              const r = records[i] as unknown as EnrichedRecord | undefined;
              if (!r) return '';
              const carbonPerHa =
                r.area_restored > 0 ? r.carbon / r.area_restored : 0;
              return [
                `Área restaurada: ${r.area_restored} ha`,
                `Tipo (estimado): ${r.restoration_type}`,
                `Estoque estimado de carbono (tCO₂e/ha): ${carbonPerHa.toFixed(3)}`,
              ];
            },
          },
        },
      },
      scales: compact
        ? {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'tCO₂e', font: { size: 11 } },
              ticks: { font: { size: 10 } },
            },
            y: {
              title: { display: true, text: 'Ano', font: { size: 11 } },
              ticks: { font: { size: 10 } },
            },
          }
        : {
            y: { beginAtZero: true, title: { display: true, text: 'tCO₂e' } },
            x: { title: { display: true, text: 'Ano' } },
          },
    };
  });

  /** Estoque de carbono por região (barras) */
  protected readonly carbonByRegionData = computed<
    ChartConfiguration<'bar'>['data']
  >(() => {
    const records = this.filteredData();
    if (!records.length) return { labels: [], datasets: [] };
    const byRegion = new Map<string, number>();
    for (const r of records) {
      byRegion.set(r.region, (byRegion.get(r.region) ?? 0) + r.carbon);
    }
    const regions = [...byRegion.keys()].sort();
    return {
      labels: regions,
      datasets: [
        {
          label: 'Carbono (tCO₂e)',
          data: regions.map((reg) => byRegion.get(reg) ?? 0),
          backgroundColor: ['#1e3c32', '#4a6b5a', '#6b5344', '#8b7355'].map((c) => c + 'dd'),
          borderColor: ['#1e3c32', '#4a6b5a', '#6b5344', '#8b7355'],
          borderWidth: 1,
        },
      ],
    };
  });

  protected readonly carbonByRegionOptions = computed<
    ChartConfiguration<'bar'>['options']
  >(() => {
    const compact = this.isLabCompactLayout();
    const val = (ctx: { parsed?: { x?: number | null; y?: number | null } }) =>
      tooltipParsedValue(ctx, compact);
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: compact ? 'y' : 'x',
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Estoque de carbono por região',
          font: { size: compact ? 13 : 14 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `Total carbono: ${val(ctx)} tCO₂e`,
          },
        },
      },
      scales: compact
        ? {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'tCO₂e', font: { size: 11 } },
              ticks: { font: { size: 10 } },
            },
            y: {
              title: { display: true, text: 'Região', font: { size: 11 } },
              ticks: { font: { size: 10 }, autoSkip: false },
            },
          }
        : {
            y: { beginAtZero: true, title: { display: true, text: 'tCO₂e' } },
            x: { title: { display: true, text: 'Região' } },
          },
    };
  });

  /** Comparação por método de restauração */
  protected readonly restorationTypeChartData = computed<
    ChartConfiguration<'bar'>['data']
  >(() => {
    const records = this.filteredData() as unknown as EnrichedRecord[];
    if (!records.length) return { labels: [], datasets: [] };
    const byType = new Map<string, number>();
    for (const r of records) {
      const t = r.restoration_type;
      byType.set(t, (byType.get(t) ?? 0) + r.area_restored);
    }
    const types = [...byType.keys()].sort();
    return {
      labels: types,
      datasets: [
        {
          label: 'Área restaurada (ha)',
          data: types.map((t) => byType.get(t) ?? 0),
          backgroundColor: ['#1e3c32', '#4a6b5a', '#6b5344', '#8b7355'].map((c) => c + 'cc'),
          borderColor: ['#1e3c32', '#4a6b5a', '#6b5344', '#8b7355'],
          borderWidth: 1,
        },
      ],
    };
  });

  protected readonly restorationTypeChartOptions = computed<
    ChartConfiguration<'bar'>['options']
  >(() => {
    const compact = this.isLabCompactLayout();
    const val = (ctx: { parsed?: { x?: number | null; y?: number | null } }) =>
      tooltipParsedValue(ctx, compact);
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: compact ? 'y' : 'x',
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Área por método de restauração',
          font: { size: compact ? 12 : 14 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `Área: ${val(ctx)} ha`,
          },
        },
      },
      scales: compact
        ? {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'ha', font: { size: 11 } },
              ticks: { font: { size: 10 } },
            },
            y: {
              title: { display: true, text: 'Método', font: { size: 11 } },
              ticks: {
                font: { size: 9 },
                autoSkip: false,
                callback: (tickValue: string | number) => {
                  const s = String(tickValue);
                  return s.length > 22 ? s.slice(0, 20) + '…' : s;
                },
              },
            },
          }
        : {
            y: { beginAtZero: true, title: { display: true, text: 'ha' } },
            x: { title: { display: true, text: 'Método' } },
          },
    };
  });

  constructor() {
    effect(() => {
      this.languageService.current();
      this.analysisService.getInsights().subscribe({
        next: (insights) => this.scientificInsights.set(insights),
      });
    });
  }

  ngOnInit(): void {
    if (typeof matchMedia !== 'undefined') {
      const mq = matchMedia('(max-width: 768px)');
      const apply = () => this.isLabCompactLayout.set(mq.matches);
      apply();
      mq.addEventListener('change', apply);
      this.mediaCleanup = () => mq.removeEventListener('change', apply);
    }

    this.restorationService.getRestorationData().subscribe({
      next: (records) => {
        this.data.set(records);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Falha ao carregar dados de restauração.');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.mediaCleanup?.();
  }

  onYearChange(event: Event): void {
    const el = event.target as HTMLSelectElement;
    this.filterService.setYearFilter(
      el.value === '' ? null : parseInt(el.value, 10)
    );
  }

  onRegionChange(event: Event): void {
    const el = event.target as HTMLSelectElement;
    this.filterService.setRegionFilter(el.value === '' ? null : el.value);
  }

  onRestorationTypeChange(event: Event): void {
    const el = event.target as HTMLSelectElement;
    this.filterService.setRestorationTypeFilter(el.value === '' ? null : el.value);
  }

  clearFilters(): void {
    this.filterService.clearFilters();
    this.selectedRegionForPanel.set(null);
  }

  onRegionSelectedFromMap(region: string): void {
    this.filterService.setRegionFilter(region);
    this.selectedRegionForPanel.set(region);
  }

  closeMapPanel(): void {
    this.selectedRegionForPanel.set(null);
  }

  /** Clique em gráfico: aplica filtro conforme o gráfico e o índice da barra clicada. */
  onChartClick(
    ev: { active?: object[] },
    chartId: 'area' | 'carbon' | 'carbonByRegion' | 'restorationType'
  ): void {
    const first = ev?.active?.[0] as { index?: number; datasetIndex?: number } | undefined;
    if (first == null || typeof first.index !== 'number') return;

    const index = first.index;
    if (chartId === 'carbonByRegion') {
      const labels = this.carbonByRegionData().labels as string[];
      const region = labels[index];
      if (region) {
        this.filterService.setRegionFilter(region);
        this.selectedRegionForPanel.set(region);
        this.scrollToSection('panorama');
      }
    } else if (chartId === 'restorationType') {
      const labels = this.restorationTypeChartData().labels as string[];
      const type = labels[index];
      if (type) {
        this.filterService.setRestorationTypeFilter(type);
        this.scrollToSection('panorama');
      }
    } else if (chartId === 'area' || chartId === 'carbon') {
      const labels = this.areaChartData().labels as string[];
      const yearStr = labels[index];
      if (yearStr) {
        const year = parseInt(yearStr, 10);
        if (!Number.isNaN(year)) {
          this.filterService.setYearFilter(year);
          this.scrollToSection('panorama');
        }
      }
    }
  }

  onCatalogSearch(event: Event): void {
    this.catalogSearch.set((event.target as HTMLInputElement).value);
  }
  onCatalogYearChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.catalogYearFilter.set(v === '' ? null : parseInt(v, 10));
  }
  onCatalogTypeChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.catalogTypeFilter.set(v === '' ? null : v);
  }
  onCatalogStatusChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.catalogStatusFilter.set(v === '' ? null : v);
  }

  onCatalogStatusPillClick(status: string): void {
    const current = this.catalogStatusFilter();
    this.catalogStatusFilter.set(current === status ? null : status);
  }
  exploreCatalogData(): void {
    this.scrollToSection('laboratorio');
    const table = document.querySelector('#laboratorio app-data-table');
    table?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onSubscriberNameChange(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.subscriberName.set(el.value);
  }

  onSubscriberEmailChange(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.subscriberEmail.set(el.value);
  }

  onSubscribeSubmit(event: Event): void {
    event.preventDefault();

    const name = this.subscriberName().trim();
    const email = this.subscriberEmail().trim();

    if (!name || !email) {
      this.subscriberError.set('Preencha nome e e-mail para continuar.');
      this.subscriberStatus.set('error');
      return;
    }

    this.subscriberStatus.set('loading');
    this.subscriberError.set(null);

    this.subscriberService.addSubscriber({ name, email }).subscribe({
      next: () => {
        this.subscriberStatus.set('success');
        this.subscriberName.set('');
        this.subscriberEmail.set('');
      },
      error: () => {
        this.subscriberStatus.set('error');
        this.subscriberError.set(this.uiText().contactError);
      },
    });
  }
}
