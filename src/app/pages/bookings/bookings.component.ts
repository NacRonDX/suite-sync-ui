import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  BookingService,
  BookingResponse,
  BookingStatus,
} from '../../services/booking.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
})
export class BookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  bookings: BookingResponse[] = [];
  isLoading = true;
  errorMessage = '';
  selectedStatus: BookingStatus | '' = '';
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  statusOptions: { value: BookingStatus | ''; label: string }[] = [
    { value: '', label: 'All Bookings' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'CHECKED_IN', label: 'Checked In' },
    { value: 'CHECKED_OUT', label: 'Checked Out' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const status = this.selectedStatus || undefined;

    this.bookingService
      .getAllBookings(status, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.bookings = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage =
            error.error?.message ||
            'Failed to load bookings. Please try again later.';
        },
      });
  }

  onStatusChange(): void {
    this.currentPage = 0;
    this.loadBookings();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadBookings();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadBookings();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadBookings();
  }

  getStatusClass(status: BookingStatus): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'CHECKED_IN':
        return 'status-checked-in';
      case 'CHECKED_OUT':
        return 'status-checked-out';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(status: BookingStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'CHECKED_IN':
        return 'Checked In';
      case 'CHECKED_OUT':
        return 'Checked Out';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  viewRoomDetails(roomId: number): void {
    this.router.navigate(['/rooms', roomId]);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
