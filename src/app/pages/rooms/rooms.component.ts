import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  RoomService,
  Room,
  CreateRoomRequest,
  AvailabilityResponse,
} from '../../services/room.service';
import { AuthService } from '../../services/auth.service';
import {
  BookingService,
  CreateBookingRequest,
} from '../../services/booking.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class RoomsComponent implements OnInit {
  private roomService = inject(RoomService);
  private bookingService = inject(BookingService);
  private router = inject(Router);
  private authService = inject(AuthService);
  rooms: Room[] = [];
  isLoading = true;
  errorMessage = '';
  currentImageIndexes = new Map<number, number>();
  showCreateModal = false;
  isCreating = false;
  createErrorMessage = '';

  showBookingModal = false;
  selectedRoom: Room | null = null;
  checkInDate = '';
  checkOutDate = '';
  numberOfGuests = 1;
  specialRequests = '';
  availability: AvailabilityResponse | null = null;
  isCheckingAvailability = false;
  isBooking = false;
  bookingErrorMessage = '';
  availabilityErrorMessage = '';
  bookingSuccessMessage = '';

  newRoom: CreateRoomRequest = {
    roomNumber: '',
    roomType: 'SINGLE',
    maxOccupancy: 1,
    pricePerNight: 0,
    size: 0,
    floor: 0,
    description: '',
    amenities: [],
    images: [],
  };

  amenityInput = '';
  imageInput = '';

  roomTypes = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'PENTHOUSE'];

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
  viewRoomDetails(roomId: number): void {
    this.router.navigate(['/rooms', roomId]);
  }

  getCurrentImageIndex(roomId: number): number {
    return this.currentImageIndexes.get(roomId) || 0;
  }

  setImageIndex(roomId: number, index: number, event: Event): void {
    event.stopPropagation();
    this.currentImageIndexes.set(roomId, index);
  }

  nextImage(roomId: number, totalImages: number, event: Event): void {
    event.stopPropagation();
    const currentIndex = this.getCurrentImageIndex(roomId);
    const nextIndex = (currentIndex + 1) % totalImages;
    this.currentImageIndexes.set(roomId, nextIndex);
  }

  prevImage(roomId: number, totalImages: number, event: Event): void {
    event.stopPropagation();
    const currentIndex = this.getCurrentImageIndex(roomId);
    const prevIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
    this.currentImageIndexes.set(roomId, prevIndex);
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.createErrorMessage = '';
    this.resetForm();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newRoom = {
      roomNumber: '',
      roomType: 'SINGLE',
      maxOccupancy: 1,
      pricePerNight: 0,
      size: 0,
      floor: 0,
      description: '',
      amenities: [],
      images: [],
    };
    this.amenityInput = '';
    this.imageInput = '';
  }

  addAmenity(): void {
    if (
      this.amenityInput.trim() &&
      !this.newRoom.amenities?.includes(this.amenityInput.trim())
    ) {
      if (!this.newRoom.amenities) {
        this.newRoom.amenities = [];
      }
      this.newRoom.amenities.push(this.amenityInput.trim());
      this.amenityInput = '';
    }
  }

  removeAmenity(amenity: string): void {
    if (this.newRoom.amenities) {
      this.newRoom.amenities = this.newRoom.amenities.filter(
        (a) => a !== amenity
      );
    }
  }

  addImage(): void {
    if (
      this.imageInput.trim() &&
      !this.newRoom.images?.includes(this.imageInput.trim())
    ) {
      if (!this.newRoom.images) {
        this.newRoom.images = [];
      }
      this.newRoom.images.push(this.imageInput.trim());
      this.imageInput = '';
    }
  }

  removeImage(image: string): void {
    if (this.newRoom.images) {
      this.newRoom.images = this.newRoom.images.filter((img) => img !== image);
    }
  }

  createRoom(): void {
    this.isCreating = true;
    this.createErrorMessage = '';

    this.roomService.createRoom(this.newRoom).subscribe({
      next: (room) => {
        this.isCreating = false;
        this.rooms.unshift(room);
        this.closeCreateModal();
      },
      error: (error: any) => {
        this.isCreating = false;
        this.createErrorMessage =
          error.error?.message || 'Failed to create room. Please try again.';
      },
    });
  }

  openBookingModal(room: Room, event: Event): void {
    event.stopPropagation();
    this.selectedRoom = room;
    this.showBookingModal = true;
    this.resetBookingForm();
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.selectedRoom = null;
    this.resetBookingForm();
  }

  resetBookingForm(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    this.checkInDate = tomorrow.toISOString().split('T')[0];
    this.checkOutDate = dayAfter.toISOString().split('T')[0];
    this.numberOfGuests = 1;
    this.specialRequests = '';
    this.availability = null;
    this.bookingErrorMessage = '';
    this.availabilityErrorMessage = '';
    this.bookingSuccessMessage = '';
  }

  checkAvailability(): void {
    if (!this.selectedRoom) return;

    this.isCheckingAvailability = true;
    this.availabilityErrorMessage = '';
    this.availability = null;

    this.roomService
      .checkRoomAvailability(
        this.selectedRoom.id,
        this.checkInDate,
        this.checkOutDate
      )
      .subscribe({
        next: (response) => {
          this.isCheckingAvailability = false;
          this.availability = response;
        },
        error: (error: any) => {
          this.isCheckingAvailability = false;
          this.availabilityErrorMessage =
            error.error?.message ||
            'Failed to check availability. Please try again.';
        },
      });
  }

  bookRoom(): void {
    if (!this.selectedRoom || !this.availability) return;

    this.isBooking = true;
    this.bookingErrorMessage = '';
    this.bookingSuccessMessage = '';

    const bookingRequest: CreateBookingRequest = {
      roomId: this.selectedRoom.id,
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      numberOfGuests: this.numberOfGuests,
      specialRequests: this.specialRequests || undefined,
    };

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (booking) => {
        this.isBooking = false;
        this.bookingSuccessMessage = 'Booking created successfully!';
        setTimeout(() => {
          this.closeBookingModal();
        }, 2000);
      },
      error: (error: any) => {
        this.isBooking = false;
        this.bookingErrorMessage =
          error.error?.message || 'Failed to create booking. Please try again.';
      },
    });
  }

  get minCheckInDate(): string {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  }

  get minCheckOutDate(): string {
    if (!this.checkInDate) return this.minCheckInDate;
    const checkIn = new Date(this.checkInDate);
    checkIn.setDate(checkIn.getDate() + 1);
    return checkIn.toISOString().split('T')[0];
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
