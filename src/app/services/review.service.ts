import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: number;
  roomId: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  getReviewsByRoomId(roomId: number): Observable<ReviewResponse[]> {
    const url = this.configService.getApiUrl(`rooms/${roomId}/reviews`);
    return this.http.get<ReviewResponse[]>(url);
  }

  createReview(
    roomId: number,
    request: CreateReviewRequest
  ): Observable<ReviewResponse> {
    const url = this.configService.getApiUrl(`rooms/${roomId}/reviews`);
    return this.http.post<ReviewResponse>(url, request);
  }
}
