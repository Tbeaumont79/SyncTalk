import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { RegisterService } from '../services/register.service';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  username: string = '';
  password: string = '';

  constructor(private registerService: RegisterService) {}

  register() {
    console.log(this.username, this.password, 'Inscription');
    this.registerService
      .register(this.username, this.password)
      .pipe(
        catchError((error) => {
          console.error('Erreur lors de l’inscription', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Inscription réussie', response);
        },
        error: (err) => console.error('Erreur', err),
      });
  }
}
