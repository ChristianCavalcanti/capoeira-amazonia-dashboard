import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import type {
  RestorationTrend,
  CarbonEfficiency,
  RegionPerformance,
  MethodContribution,
  ScientificInsight,
} from '../models/analysis.model';
import { LanguageService } from './language.service';

// Render (production) backend URL
const API_URL = 'https://capoeira-amazonia-dashboard.onrender.com';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private readonly http = inject(HttpClient);
  private readonly languageService = inject(LanguageService);

  getTrends(): Observable<RestorationTrend[]> {
    return this.http
      .get<RestorationTrend[]>(`${API_URL}/api/analysis/trends`)
      .pipe(catchError(() => of([])));
  }

  getCarbonEfficiency(): Observable<CarbonEfficiency[]> {
    return this.http
      .get<CarbonEfficiency[]>(`${API_URL}/api/analysis/carbon-efficiency`)
      .pipe(catchError(() => of([])));
  }

  getRegionPerformance(): Observable<RegionPerformance[]> {
    return this.http
      .get<RegionPerformance[]>(`${API_URL}/api/analysis/region-performance`)
      .pipe(catchError(() => of([])));
  }

  getMethodContribution(): Observable<MethodContribution[]> {
    return this.http
      .get<MethodContribution[]>(`${API_URL}/api/analysis/method-contribution`)
      .pipe(catchError(() => of([])));
  }

  /** Insights with text in current UI language. */
  getInsights(): Observable<ScientificInsight[]> {
    const lang = this.languageService.current() === 'pt' ? 'pt-BR' : 'en';
    return this.http
      .get<ScientificInsight[]>(`${API_URL}/api/analysis/insights`, {
        headers: { 'Accept-Language': lang },
      })
      .pipe(catchError(() => of([])));
  }
}
