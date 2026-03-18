import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { RestorationService } from '../../services/restoration.service';
import { FilterService } from '../../services/filter.service';
import type { RestorationRecord } from '../../models/restoration.model';
import { MetricCardComponent } from '../../components/metric-card/metric-card.component';
import { AmazonMapComponent } from '../../components/amazon-map/amazon-map.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    MetricCardComponent,
    AmazonMapComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent implements OnInit {
  private readonly restorationService = inject(RestorationService);
  protected readonly filterService = inject(FilterService);

  protected readonly data = signal<RestorationRecord[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filteredData = computed(() =>
    this.filterService.filterRecords(this.data())
  );

  protected readonly uniqueYears = computed(() => {
    const years = [...new Set(this.data().map((r) => r.year))].sort(
      (a, b) => a - b
    );
    return years;
  });

  protected readonly uniqueRegions = computed(() => {
    return [...new Set(this.data().map((r) => r.region))].sort();
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
          backgroundColor: 'rgba(34, 139, 34, 0.75)',
          borderColor: 'rgb(34, 139, 34)',
          borderWidth: 1,
        },
      ],
    };
  });

  protected readonly carbonChartData = computed<
    ChartConfiguration<'line'>['data']
  >(() => {
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
          backgroundColor: 'rgba(46, 125, 50, 0.25)',
          borderColor: 'rgb(46, 125, 50)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(46, 125, 50)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  });

  protected readonly areaChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Área restaurada por ano' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} ha`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Hectares' },
      },
      x: {
        title: { display: true, text: 'Ano' },
      },
    },
  };

  protected readonly carbonChartOptions: ChartConfiguration<'line'>['options'] =
    {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      plugins: {
        legend: { display: true, position: 'top' },
        title: { display: true, text: 'Sequestro de carbono por ano' },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y} tCO₂e`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'tCO₂e' },
        },
        x: {
          title: { display: true, text: 'Ano' },
        },
      },
    };

  ngOnInit(): void {
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

  onYearChange(event: Event): void {
    const el = event.target as HTMLSelectElement;
    const v = el.value;
    this.filterService.setYearFilter(v === '' ? null : parseInt(v, 10));
  }

  onRegionChange(event: Event): void {
    const el = event.target as HTMLSelectElement;
    this.filterService.setRegionFilter(el.value === '' ? null : el.value);
  }

  clearFilters(): void {
    this.filterService.clearFilters();
  }
}
