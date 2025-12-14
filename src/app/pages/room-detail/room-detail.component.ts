import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  RoomService,
  Room,
  UpdateRoomRequest,
} from '../../services/room.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.scss',
})
export class RoomDetailComponent implements OnInit {
  private roomService = inject(RoomService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  room: Room | null = null;
  isLoading = true;
  errorMessage = '';
  isEditModalOpen = false;
  isSaving = false;
  editForm: UpdateRoomRequest = {};
  newAmenity = '';
  newImage = '';
  currentDetailImageIndex = 0;
  showDeleteConfirm = false;
  isDeleting = false;

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  roomTypes = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'PENTHOUSE'];
  roomStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_SERVICE'];

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.loadRoom(+roomId);
    } else {
      this.router.navigate(['/not-found']);
    }
  }

  loadRoom(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentDetailImageIndex = 0;

    this.roomService.getRoomById(id).subscribe({
      next: (room) => {
        this.room = room;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        } else {
          this.errorMessage =
            error.error?.message ||
            'Failed to load room details. Please try again later.';
        }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  goBack(): void {
    this.router.navigate(['/rooms']);
  }

  openEditModal(): void {
    if (!this.room) return;

    this.editForm = {
      roomType: this.room.roomType,
      maxOccupancy: this.room.maxOccupancy,
      pricePerNight: this.room.pricePerNight,
      size: this.room.size,
      floor: this.room.floor,
      description: this.room.description,
      status: this.room.status,
      amenities: [...(this.room.amenities || [])],
      images: [...(this.room.images || [])],
    };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editForm = {};
    this.newAmenity = '';
    this.newImage = '';
  }

  addAmenity(): void {
    if (this.newAmenity.trim() && this.editForm.amenities) {
      this.editForm.amenities.push(this.newAmenity.trim());
      this.newAmenity = '';
    }
  }

  removeAmenity(index: number): void {
    if (this.editForm.amenities) {
      this.editForm.amenities.splice(index, 1);
    }
  }

  addImage(): void {
    if (this.newImage.trim() && this.editForm.images) {
      this.editForm.images.push(this.newImage.trim());
      this.newImage = '';
    }
  }

  removeImage(index: number): void {
    if (this.editForm.images) {
      this.editForm.images.splice(index, 1);
    }
  }
  saveRoom(): void {
    if (!this.room || this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';

    this.roomService.updateRoom(this.room.id, this.editForm).subscribe({
      next: (updatedRoom) => {
        this.room = updatedRoom;
        this.isSaving = false;
        this.closeEditModal();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.errorMessage =
          error.error?.message ||
          'Failed to update room. Please try again later.';
      },
    });
  }

  setDetailImageIndex(index: number): void {
    this.currentDetailImageIndex = index;
  }

  nextDetailImage(totalImages: number): void {
    this.currentDetailImageIndex =
      (this.currentDetailImageIndex + 1) % totalImages;
  }

  prevDetailImage(totalImages: number): void {
    this.currentDetailImageIndex =
      this.currentDetailImageIndex === 0
        ? totalImages - 1
        : this.currentDetailImageIndex - 1;
  }

  openDeleteConfirm(): void {
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
  }

  deleteRoom(): void {
    if (!this.room || this.isDeleting) return;

    this.isDeleting = true;
    this.errorMessage = '';

    this.roomService.deleteRoom(this.room.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/rooms']);
      },
      error: (error: any) => {
        this.isDeleting = false;
        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        } else {
          this.errorMessage =
            error.error?.message ||
            'Failed to delete room. Please try again later.';
          this.closeDeleteConfirm();
        }
      },
    });
  }
}
