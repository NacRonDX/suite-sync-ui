import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, shareReplay } from 'rxjs/operators';
import { ConfigService } from './config.service';

interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly EXPIRES_IN_KEY = 'expires_in';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasValidToken()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private refreshTokenInProgress = false;
  private refreshTokenObservable: Observable<RefreshTokenResponse> | null =
    null;

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const loginUrl = this.configService.getApiUrl('auth/login');
    return this.http.post<LoginResponse>(loginUrl, credentials).pipe(
      tap((response) => {
        this.storeTokens(response);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_IN_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = this.decodeToken(token);
      return payload?.userType || null;
    } catch (error) {
      return null;
    }
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  isStaffOrAdmin(): boolean {
    const userRole = this.getUserRole();
    return userRole === 'STAFF' || userRole === 'ADMIN';
  }

  refreshAuthToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (this.refreshTokenObservable) {
      console.log('Token refresh already in progress, reusing observable');
      return this.refreshTokenObservable;
    }

    this.refreshTokenInProgress = true;
    const refreshUrl = this.configService.getApiUrl('auth/refresh');

    this.refreshTokenObservable = this.http
      .post<RefreshTokenResponse>(refreshUrl, { refreshToken })
      .pipe(
        tap((response) => {
          this.storeTokens(response);
          this.isAuthenticatedSubject.next(true);
          this.refreshTokenInProgress = false;
          this.refreshTokenObservable = null;
          console.log('Token refreshed successfully');
        }),
        catchError((error) => {
          this.refreshTokenInProgress = false;
          this.refreshTokenObservable = null;
          console.error('Token refresh failed:', error);
          return throwError(() => error);
        }),
        shareReplay(1)
      );

    return this.refreshTokenObservable;
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private storeTokens(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    const expirationTime = Date.now() + response.expiresIn * 1000;
    localStorage.setItem(this.EXPIRES_IN_KEY, expirationTime.toString());

    console.log('Token stored:', {
      expiresIn: response.expiresIn,
      expiresInMs: response.expiresIn * 1000,
      expirationTime: new Date(expirationTime).toISOString(),
      now: new Date().toISOString(),
    });
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    const expiresIn = localStorage.getItem(this.EXPIRES_IN_KEY);

    if (!token) {
      console.log('No token found');
      return false;
    }

    if (!expiresIn) {
      console.log('No expiration found');
      return false;
    }

    const expirationTime = parseInt(expiresIn, 10);

    if (isNaN(expirationTime)) {
      console.log('Invalid expiration time:', expiresIn);
      return false;
    }

    const now = Date.now();
    const isValid = now < expirationTime;

    console.log('Token validation:', {
      expirationTime: new Date(expirationTime).toISOString(),
      now: new Date(now).toISOString(),
      isValid,
      timeRemaining: expirationTime - now,
      timeRemainingMinutes: ((expirationTime - now) / 60000).toFixed(2),
    });

    return isValid;
  }
}
