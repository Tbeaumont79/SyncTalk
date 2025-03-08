import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/authentification/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  protected registerForm: FormGroup;
  protected errorMessage = '';
  protected isLoading = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  constructor() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      terms: [false, Validators.requiredTrue],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      if (this.registerForm.get('terms')?.invalid) {
        this.errorMessage = 'Please accept the terms and conditions';
      } else {
        this.errorMessage = 'Please check all required fields';
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.registerForm.value;

    this.authService.register(email, password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 409) {
          this.errorMessage = 'This email is already registered';
        } else if (error.status === 0) {
          this.errorMessage =
            'Unable to connect to the server. Please check your internet connection.';
        } else {
          this.errorMessage = error.message || 'An unexpected error occurred';
        }
        console.error('Registration error:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  get emailControl() {
    return this.registerForm.get('email');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }

  get termsControl() {
    return this.registerForm.get('terms');
  }
}
