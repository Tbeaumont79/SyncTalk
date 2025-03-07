import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/authentification/auth.service';
import { throwError, catchError, takeUntil, Subject, finalize } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {}

  login() {
    if (this.email === '' || this.password === '') {
      this.errorMessage = 'Please enter your email and password';
      return;
    }
    this.isLoading = true;
    this.authService
      .login(this.email, this.password)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          if (error.status === 401) {
            this.errorMessage = 'Invalid username or password';
          } else if (error.status === 0) {
            this.errorMessage =
              'An error occured, please check your internet connection';
          } else {
            this.errorMessage = 'An error occured';
          }
          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
      });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
