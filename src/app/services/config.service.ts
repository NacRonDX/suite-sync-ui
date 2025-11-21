import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly API_BASE_URL =
    'https://suite-sync-api-bcad89967ee2.herokuapp.com/api/v1';

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
}
