import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Render (production) backend URL
const API_URL = 'https://capoeira-amazonia-dashboard.onrender.com';

export interface SubscriberPayload {
  name: string;
  email: string;
}

export interface SubscriberResponse {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriberService {
  private readonly http = inject(HttpClient);

  addSubscriber(
    payload: SubscriberPayload
  ): Observable<SubscriberResponse> {
    return this.http.post<SubscriberResponse>(
      `${API_URL}/subscribers`,
      payload
    );
  }
}

