import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  constructor(private http: HttpClient) {}

  register() {
    if (this.email && this.password) {
      this.http
        .post('http://localhost:3000/api/auth/register', {
          email: this.email,
          password: this.password,
        })
        .subscribe(
          (response) => {
            console.log('Registration successful');
          },
          (error) => {
            console.error('Registration failed', error);
          }
        );
  }

  }
}
