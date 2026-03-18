import { Injectable, signal } from '@angular/core';
import type { RestorationRecord } from '../models/restoration.model';

@Injectable({ providedIn: 'root' })
export class FilterService {
  readonly yearFilter = signal<number | null>(null);
  readonly regionFilter = signal<string | null>(null);
  readonly restorationTypeFilter = signal<string | null>(null);

  setYearFilter(year: number | null): void {
    this.yearFilter.set(year);
  }

  setRegionFilter(region: string | null): void {
    this.regionFilter.set(region);
  }

  setRestorationTypeFilter(type: string | null): void {
    this.restorationTypeFilter.set(type);
  }

  clearFilters(): void {
    this.yearFilter.set(null);
    this.regionFilter.set(null);
    this.restorationTypeFilter.set(null);
  }

  /** True se algum filtro estiver ativo (mapa e indicadores usam para decidir dados). */
  hasActiveFilters(): boolean {
    return (
      this.yearFilter() != null ||
      this.regionFilter() != null ||
      this.restorationTypeFilter() != null
    );
  }

  filterRecords(records: RestorationRecord[]): RestorationRecord[] {
    const year = this.yearFilter();
    const region = this.regionFilter();
    const type = this.restorationTypeFilter();
    return records.filter(
      (r) =>
        (year == null || r.year === year) &&
        (region == null || r.region === region) &&
        (type == null ||
          ((r as unknown as { restoration_type?: string }).restoration_type ??
            'Não informado') === type)
    );
  }

  /** Filtra por ano e tipo, mas não por região. Usado pelo mapa para manter todos os marcadores visíveis. */
  filterRecordsWithoutRegion(records: RestorationRecord[]): RestorationRecord[] {
    const year = this.yearFilter();
    const type = this.restorationTypeFilter();
    return records.filter(
      (r) =>
        (year == null || r.year === year) &&
        (type == null ||
          ((r as unknown as { restoration_type?: string }).restoration_type ??
            'Não informado') === type)
    );
  }
}
