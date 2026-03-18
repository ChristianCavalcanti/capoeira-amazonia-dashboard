import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { forkJoin } from 'rxjs';
import { RestorationService } from '../../services/restoration.service';
import { AnalysisService } from '../../services/analysis.service';
import type { RestorationRecord } from '../../models/restoration.model';
import type { RestorationTrend, RegionPerformance, MethodContribution, ScientificInsight } from '../../models/analysis.model';

@Component({
  selector: 'app-analysis-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './analysis-page.component.html',
  styleUrl: './analysis-page.component.css',
})
export class AnalysisPageComponent implements OnInit {
  private readonly restorationService = inject(RestorationService);
  private readonly analysisService = inject(AnalysisService);

  protected readonly data = signal<RestorationRecord[]>([]);
  protected readonly trends = signal<RestorationTrend[]>([]);
  protected readonly regionPerformance = signal<RegionPerformance[]>([]);
  protected readonly methodContribution = signal<MethodContribution[]>([]);
  protected readonly scientificInsights = signal<ScientificInsight[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly trendChartData = computed<
    ChartConfiguration<'line'>['data']
  >(() => {
    const records = this.data();
    if (!records.length) return { labels: [], datasets: [] };
    const sorted = [...records].sort((a, b) => a.year - b.year);
    return {
      labels: sorted.map((r) => `${r.region} (${r.year})`),
      datasets: [
        {
          label: 'Área restaurada (ha)',
          data: sorted.map((r) => r.area_restored),
          borderColor: 'rgb(34, 139, 34)',
          backgroundColor: 'rgba(34, 139, 34, 0.2)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Carbono (tCO₂e)',
          data: sorted.map((r) => r.carbon),
          borderColor: 'rgb(46, 125, 50)',
          backgroundColor: 'rgba(46, 125, 50, 0.2)',
          fill: true,
          tension: 0.3,
        },
      ],
    };
  });

  protected readonly regionComparisonData = computed<
    ChartConfiguration<'bar'>['data']
  >(() => {
    const perf = this.regionPerformance();
    if (perf.length) {
      return {
        labels: perf.map((p) => p.region),
        datasets: [
          {
            label: 'Área restaurada total (ha)',
            data: perf.map((p) => p.total_area_restored),
            backgroundColor: 'rgba(34, 139, 34, 0.7)',
            borderColor: 'rgb(34, 139, 34)',
            borderWidth: 1,
          },
          {
            label: 'Carbono total (tCO₂e)',
            data: perf.map((p) => p.total_carbon),
            backgroundColor: 'rgba(46, 125, 50, 0.7)',
            borderColor: 'rgb(46, 125, 50)',
            borderWidth: 1,
          },
        ],
      };
    }
    const records = this.data();
    if (!records.length) return { labels: [], datasets: [] };
    const byRegion = new Map<string, { area: number; carbon: number }>();
    for (const r of records) {
      const cur = byRegion.get(r.region) ?? { area: 0, carbon: 0 };
      cur.area += r.area_restored;
      cur.carbon += r.carbon;
      byRegion.set(r.region, cur);
    }
    const regions = [...byRegion.keys()].sort();
    return {
      labels: regions,
      datasets: [
        {
          label: 'Área restaurada total (ha)',
          data: regions.map((reg) => byRegion.get(reg)!.area),
          backgroundColor: 'rgba(34, 139, 34, 0.7)',
          borderColor: 'rgb(34, 139, 34)',
          borderWidth: 1,
        },
        {
          label: 'Carbono total (tCO₂e)',
          data: regions.map((reg) => byRegion.get(reg)!.carbon),
          backgroundColor: 'rgba(46, 125, 50, 0.7)',
          borderColor: 'rgb(46, 125, 50)',
          borderWidth: 1,
        },
      ],
    };
  });

  /** Carbon efficiency (tCO₂e/ha) by region from analysis API. */
  protected readonly carbonEfficiencyChartData = computed<
    ChartConfiguration<'bar'>['data']
  >(() => {
    const perf = this.regionPerformance();
    if (!perf.length) return { labels: [], datasets: [] };
    return {
      labels: perf.map((p) => p.region),
      datasets: [
        {
          label: 'Carbono por hectare (tCO₂e/ha)',
          data: perf.map((p) => p.mean_carbon_per_hectare),
          backgroundColor: 'rgba(46, 125, 50, 0.7)',
          borderColor: 'rgb(46, 125, 50)',
          borderWidth: 1,
        },
      ],
    };
  });

  /** Method contribution (percentage of area by restoration type). */
  protected readonly methodContributionChartData = computed<
    ChartConfiguration<'bar'>['data']
  >(() => {
    const methods = this.methodContribution();
    if (!methods.length) return { labels: [], datasets: [] };
    return {
      labels: methods.map((m) => m.restoration_type),
      datasets: [
        {
          label: 'Contribuição (%)',
          data: methods.map((m) => m.percentage),
          backgroundColor: ['rgba(34, 139, 34, 0.7)', 'rgba(46, 125, 50, 0.7)', 'rgba(70, 130, 70, 0.7)', 'rgba(85, 140, 85, 0.7)'],
          borderColor: ['rgb(34, 139, 34)', 'rgb(46, 125, 50)', 'rgb(70, 130, 70)', 'rgb(85, 140, 85)'],
          borderWidth: 1,
        },
      ],
    };
  });

  /** Restoration growth: area by year from trends API. */
  protected readonly growthTrendChartData = computed<
    ChartConfiguration<'line'>['data']
  >(() => {
    const t = this.trends();
    if (!t.length) return { labels: [], datasets: [] };
    const sorted = [...t].sort((a, b) => a.year - b.year);
    return {
      labels: sorted.map((x) => `${x.region} (${x.year})`),
      datasets: [
        {
          label: 'Área restaurada (ha)',
          data: sorted.map((x) => x.area_restored),
          borderColor: 'rgb(34, 139, 34)',
          backgroundColor: 'rgba(34, 139, 34, 0.2)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Taxa de crescimento (%)',
          data: sorted.map((x) => x.restoration_growth_rate_pct ?? 0),
          borderColor: 'rgb(120, 180, 120)',
          backgroundColor: 'rgba(120, 180, 120, 0.2)',
          fill: true,
          tension: 0.3,
        },
      ],
    };
  });

  protected readonly trendChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Tendência de restauração ao longo do tempo' },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ctx.dataset.label === 'Área restaurada (ha)'
              ? ` ${ctx.parsed.y} ha`
              : ` ${ctx.parsed.y} tCO₂e`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true },
      x: { title: { display: true, text: 'Região (Ano)' } },
    },
  };

  protected readonly comparisonChartOptions: ChartConfiguration<'bar'>['options'] =
    {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'Captura de carbono e restauração por região',
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ctx.dataset.label?.includes('Área')
                ? ` ${ctx.parsed.y} ha`
                : ` ${ctx.parsed.y} tCO₂e`,
          },
        },
      },
      scales: {
        y: { beginAtZero: true },
        x: { title: { display: true, text: 'Região' } },
      },
    };

  protected readonly carbonEfficiencyChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Eficiência de carbono por região (tCO₂e/ha)' },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} tCO₂e/ha` } },
    },
    scales: {
      y: { beginAtZero: true },
      x: { title: { display: true, text: 'Região' } },
    },
  };

  protected readonly methodContributionChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Contribuição por tipo de restauração (%)' },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y}%` } },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
      x: { title: { display: true, text: 'Tipo de restauração' } },
    },
  };

  protected readonly growthTrendChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Crescimento da restauração e taxa de crescimento' },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ctx.dataset.label?.includes('Taxa') ? ` ${ctx.parsed.y}%` : ` ${ctx.parsed.y} ha`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true },
      x: { title: { display: true, text: 'Região (Ano)' } },
    },
  };

  ngOnInit(): void {
    forkJoin({
      restoration: this.restorationService.getRestorationData(),
      trends: this.analysisService.getTrends(),
      regionPerformance: this.analysisService.getRegionPerformance(),
      methodContribution: this.analysisService.getMethodContribution(),
      insights: this.analysisService.getInsights(),
    }).subscribe({
      next: (res) => {
        this.data.set(res.restoration);
        this.trends.set(res.trends);
        this.regionPerformance.set(res.regionPerformance);
        this.methodContribution.set(res.methodContribution);
        this.scientificInsights.set(res.insights);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Falha ao carregar dados.');
        this.loading.set(false);
      },
    });
  }
}
