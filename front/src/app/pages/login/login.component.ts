import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { throwError, catchError } from 'rxjs';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  constructor(private authService: AuthService) {}

  login() {
    this.authService
      .login(this.email, this.password)
      .pipe(
        catchError((error) => {
          console.error('Login failed', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => console.log('Login successful', response),
        error: (err) => console.error('Login failed', err),
      });
    console.log(this.email, this.password);
  }
}
