import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly API_BASE_URL = environment.apiBaseUrl;

  constructor() {}

  getApiBaseUrl(): string {
    return this.API_BASE_URL;
  }

  getApiUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;
    return `${this.API_BASE_URL}/${cleanEndpoint}`;
  }

  isProduction(): boolean {
    return environment.production;
  }
}
