import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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

  private storeTokens(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    const expirationTime = Date.now() + response.expiresIn;
    localStorage.setItem(this.EXPIRES_IN_KEY, expirationTime.toString());
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    const expiresIn = localStorage.getItem(this.EXPIRES_IN_KEY);

    if (!token || !expiresIn) {
      return false;
    }

    const expirationTime = parseInt(expiresIn, 10);
    return Date.now() < expirationTime;
  }
}
