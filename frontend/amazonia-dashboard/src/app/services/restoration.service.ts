import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { RestorationRecord } from '../models/restoration.model';

const API_URL = 'http://localhost:8000';

@Injectable({ providedIn: 'root' })
export class RestorationService {
  private readonly http = inject(HttpClient);

  getRestorationData(): Observable<RestorationRecord[]> {
    return this.http.get<RestorationRecord[]>(`${API_URL}/restoration`);
  }
}
