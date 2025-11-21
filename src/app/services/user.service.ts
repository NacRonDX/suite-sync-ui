import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_BASE_URL =
    'https://suite-sync-api-bcad89967ee2.herokuapp.com/api/v1';

  constructor(private http: HttpClient) {}

  activateAccount(userId: string, token: string): Observable<any> {
    return this.http.post(
      `${this.API_BASE_URL}/users/${userId}/activate?token=${token}`,
      {}
    );
  }
}
