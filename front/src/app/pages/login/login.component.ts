import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/authentification/auth.service';
import { throwError, catchError } from 'rxjs';
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
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(Router) private router: Router
  ) {}

  login() {
    this.authService
      .login(this.email, this.password)
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Invalid username or password';
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.router.navigate(['/']);
        },
        error: (err) => console.error('Login failed', err),
      });
    console.log(this.email, this.password);
  }
}
