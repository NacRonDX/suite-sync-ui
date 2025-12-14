import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export interface CreateBookingRequest {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface UpdateBookingRequest {
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  specialRequests?: string;
}

export interface BookingResponse {
  id: number;
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  status: BookingStatus;
  specialRequests?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingPageResponse {
  content: BookingResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  getAllBookings(
    status?: BookingStatus,
    page: number = 0,
    size: number = 20
  ): Observable<BookingPageResponse> {
    const bookingsUrl = this.configService.getApiUrl('bookings');
    const params: any = { page: page.toString(), size: size.toString() };
    if (status) {
      params.status = status;
    }
    return this.http.get<BookingPageResponse>(bookingsUrl, { params });
  }

  getBookingById(bookingId: number): Observable<BookingResponse> {
    const bookingUrl = this.configService.getApiUrl(`bookings/${bookingId}`);
    return this.http.get<BookingResponse>(bookingUrl);
  }

  createBooking(request: CreateBookingRequest): Observable<BookingResponse> {
    const bookingsUrl = this.configService.getApiUrl('bookings');
    return this.http.post<BookingResponse>(bookingsUrl, request);
  }

  updateBooking(
    bookingId: number,
    request: UpdateBookingRequest
  ): Observable<BookingResponse> {
    const bookingUrl = this.configService.getApiUrl(`bookings/${bookingId}`);
    return this.http.put<BookingResponse>(bookingUrl, request);
  }

  cancelBooking(bookingId: number): Observable<BookingResponse> {
    const cancelUrl = this.configService.getApiUrl(
      `bookings/${bookingId}/cancel`
    );
    return this.http.post<BookingResponse>(cancelUrl, {});
  }
}
