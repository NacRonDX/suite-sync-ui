import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

interface RegisterUserData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  registerUser(userData: RegisterUserData): Observable<any> {
    const registerUrl = this.configService.getApiUrl('users');
    return this.http.post(registerUrl, userData);
  }

  activateAccount(userId: string, token: string): Observable<any> {
    const activateUrl = this.configService.getApiUrl(
      `users/${userId}/activate?token=${token}`
    );
    return this.http.post(activateUrl, {});
  }
}
