import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';

interface RegisterForm {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface PasswordValidation {
  minLength: boolean;
  maxLength: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  @ViewChild('countrySearchInput')
  countrySearchInput?: ElementRef<HTMLInputElement>;

  formData: RegisterForm = {
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    countryCode: '+1',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  };

  countryCodes = [
    { code: '+1', flag: '🇺🇸', country: 'USA' },
    { code: '+1', flag: '🇨🇦', country: 'Canada' },
    { code: '+33', flag: '🇫🇷', country: 'France' },
    { code: '+34', flag: '🇪🇸', country: 'Spain' },
    { code: '+39', flag: '🇮🇹', country: 'Italy' },
    { code: '+40', flag: '🇷🇴', country: 'Romania' },
    { code: '+44', flag: '🇬🇧', country: 'UK' },
    { code: '+49', flag: '🇩🇪', country: 'Germany' },
    { code: '+52', flag: '🇲🇽', country: 'Mexico' },
    { code: '+55', flag: '🇧🇷', country: 'Brazil' },
    { code: '+61', flag: '🇦🇺', country: 'Australia' },
    { code: '+81', flag: '🇯🇵', country: 'Japan' },
    { code: '+86', flag: '🇨🇳', country: 'China' },
    { code: '+91', flag: '🇮🇳', country: 'India' },
  ];

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  showCountryDropdown = false;
  countrySearchTerm = '';
  filteredCountryCodes = [...this.countryCodes];

  get selectedCountry() {
    return (
      this.countryCodes.find((c) => c.code === this.formData.countryCode) ||
      this.countryCodes[0]
    );
  }

  get passwordValidation(): PasswordValidation {
    const password = this.formData.password;
    return {
      minLength: password.length >= 8,
      maxLength: password.length <= 16,
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%]/.test(password),
    };
  }

  get isPasswordValid(): boolean {
    const validation = this.passwordValidation;
    return (
      validation.minLength &&
      validation.maxLength &&
      validation.hasNumber &&
      validation.hasSpecialChar
    );
  }

  get passwordsMatch(): boolean {
    return (
      this.formData.password === this.formData.confirmPassword &&
      this.formData.confirmPassword.length > 0
    );
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  toggleCountryDropdown(): void {
    this.showCountryDropdown = !this.showCountryDropdown;
    if (this.showCountryDropdown) {
      this.countrySearchTerm = '';
      this.filteredCountryCodes = [...this.countryCodes];
      setTimeout(() => {
        this.countrySearchInput?.nativeElement.focus();
      }, 0);
    }
  }

  selectCountry(country: {
    code: string;
    flag: string;
    country: string;
  }): void {
    this.formData.countryCode = country.code;
    this.showCountryDropdown = false;
    this.countrySearchTerm = '';
  }

  filterCountries(): void {
    const searchLower = this.countrySearchTerm.toLowerCase();
    this.filteredCountryCodes = this.countryCodes.filter(
      (c) =>
        c.country.toLowerCase().includes(searchLower) ||
        c.code.includes(searchLower)
    );
  }

  onCountryDropdownBlur(event: FocusEvent): void {
    setTimeout(() => {
      const relatedTarget = event.relatedTarget as HTMLElement;
      if (
        !relatedTarget ||
        !relatedTarget.closest('.country-dropdown-container')
      ) {
        this.showCountryDropdown = false;
      }
    }, 200);
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    const registrationData = {
      email: this.formData.email,
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      phoneNumber: `${this.formData.countryCode}${this.formData.phoneNumber}`,
      password: this.formData.password,
      address: this.formData.address,
    };

    this.userService.registerUser(registrationData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage =
          'Registration successful! Please check your email to verify your account. You will receive a verification link shortly.';
        this.resetForm();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message ||
          'Registration failed. Please try again or contact support.';
      },
    });
  }

  private validateForm(): boolean {
    if (
      !this.formData.email ||
      !this.formData.firstName ||
      !this.formData.lastName ||
      !this.formData.phoneNumber ||
      !this.formData.password ||
      !this.formData.confirmPassword
    ) {
      this.errorMessage = 'Please fill in all required fields.';
      return false;
    }

    if (!this.isPasswordValid) {
      this.errorMessage = 'Password does not meet the requirements.';
      return false;
    }

    if (!this.passwordsMatch) {
      this.errorMessage = 'Passwords do not match.';
      return false;
    }

    if (!this.isValidEmail(this.formData.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    if (
      !this.formData.address.street ||
      !this.formData.address.city ||
      !this.formData.address.state ||
      !this.formData.address.postalCode ||
      !this.formData.address.country
    ) {
      this.errorMessage = 'Please fill in all address fields.';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private resetForm(): void {
    this.formData = {
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      countryCode: '+1',
      password: '',
      confirmPassword: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    };
  }
}
