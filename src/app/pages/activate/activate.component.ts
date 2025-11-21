import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './activate.component.html',
  styleUrl: './activate.component.scss',
})
export class ActivateComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  isActivating = true;
  activationSuccess = false;
  errorMessage = '';
  countdown = 3;
  private countdownInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!userId || !token) {
      this.isActivating = false;
      this.errorMessage =
        'Invalid activation link. Please check your email and try again.';
      return;
    }

    this.activateAccount(userId, token);
  }

  private activateAccount(userId: string, token: string): void {
    this.userService.activateAccount(userId, token).subscribe({
      next: () => {
        this.isActivating = false;
        this.activationSuccess = true;
        this.startCountdown();
      },
      error: (error: any) => {
        this.isActivating = false;
        this.activationSuccess = false;
        this.errorMessage =
          error.error?.message ||
          'Account activation failed. Please try again later or contact support.';
      },
    });
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.clearCountdown();
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }
}
