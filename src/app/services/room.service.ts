import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface Room {
  id: number;
  roomNumber: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE' | 'PENTHOUSE';
  maxOccupancy: number;
  pricePerNight: number;
  size: number;
  floor: number;
  description: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  amenities: string[];
  images: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoomsResponse {
  content: Room[];
  pageable?: any;
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  size?: number;
  number?: number;
  sort?: any;
  numberOfElements?: number;
  first?: boolean;
  empty?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  getAllRooms(): Observable<Room[]> {
    const roomsUrl = this.configService.getApiUrl('rooms');
    return this.http
      .get<RoomsResponse>(roomsUrl)
      .pipe(map((response) => response.content));
  }

  getRoomById(id: number): Observable<Room> {
    const roomUrl = this.configService.getApiUrl(`rooms/${id}`);
    return this.http.get<Room>(roomUrl);
  }
}
