import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private http = inject(HttpClient);

  register(email: string, password: string): Observable<any> { // definir le type plus tard
    console.log(email, password, 'dans le service');
    return this.http
      .post('http://localhost:8000/register', { email, password })
      .pipe(
        tap((response) => {
          console.log('Registration successful', response);
        }),
        tap((error) => {
          console.error('Registration failed', error);
        })
      );
  }
}
