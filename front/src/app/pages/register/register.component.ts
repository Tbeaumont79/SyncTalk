import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  register() {
    console.log(this.email, this.password, 'Inscription');
    this.authService
      .register(this.email, this.password)
      .pipe(
        catchError((error) => {
          console.error('Erreur lors de l’inscription', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => console.log('Inscription réussie', response),
        error: (err) => console.error('Erreur', err),
      });
  }
}
