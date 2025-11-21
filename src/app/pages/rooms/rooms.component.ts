import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService, Room } from '../../services/room.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class RoomsComponent implements OnInit {
  private roomService = inject(RoomService);

  rooms: Room[] = [];
  isLoading = true;
  errorMessage = '';

  get availableRooms(): number {
    return this.rooms.filter((r) => r.status === 'AVAILABLE').length;
  }

  get occupiedRooms(): number {
    return this.rooms.filter((r) => r.status === 'OCCUPIED').length;
  }

  get maintenanceRooms(): number {
    return this.rooms.filter((r) => r.status === 'MAINTENANCE').length;
  }

  get outOfServiceRooms(): number {
    return this.rooms.filter((r) => r.status === 'OUT_OF_SERVICE').length;
  }

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message ||
          'Failed to load rooms. Please try again later.';
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'status-available';
      case 'OCCUPIED':
        return 'status-occupied';
      case 'MAINTENANCE':
        return 'status-maintenance';
      case 'OUT_OF_SERVICE':
        return 'status-out-of-service';
      default:
        return 'status-unavailable';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'OCCUPIED':
        return 'Occupied';
      case 'MAINTENANCE':
        return 'Maintenance';
      case 'OUT_OF_SERVICE':
        return 'Out of Service';
      default:
        return 'Unknown';
    }
  }

  getRoomTypeDisplay(roomType: string): string {
    switch (roomType) {
      case 'SINGLE':
        return 'Single';
      case 'DOUBLE':
        return 'Double';
      case 'SUITE':
        return 'Suite';
      case 'DELUXE':
        return 'Deluxe';
      case 'PENTHOUSE':
        return 'Penthouse';
      default:
        return roomType;
    }
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
