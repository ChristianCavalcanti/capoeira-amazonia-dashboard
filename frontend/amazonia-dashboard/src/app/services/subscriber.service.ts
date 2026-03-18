import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8000';

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

