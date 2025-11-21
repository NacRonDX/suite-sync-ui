import { TestBed } from '@angular/core/testing';

import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the API base URL', () => {
    const baseUrl = service.getApiBaseUrl();
    expect(baseUrl).toBe(
      'https://suite-sync-api-bcad89967ee2.herokuapp.com/api/v1'
    );
  });

  it('should construct API URLs correctly', () => {
    const url = service.getApiUrl('users/123/activate');
    expect(url).toBe(
      'https://suite-sync-api-bcad89967ee2.herokuapp.com/api/v1/users/123/activate'
    );
  });

  it('should handle endpoints with leading slash', () => {
    const url = service.getApiUrl('/auth/login');
    expect(url).toBe(
      'https://suite-sync-api-bcad89967ee2.herokuapp.com/api/v1/auth/login'
    );
  });
});
