import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private http = inject(HttpClient);

  register(username: string, password: string): Observable<any> {
    // definir le type plus tard
    console.log(username, password, 'dans le service');
    return this.http
      .post(
        'http://localhost:8000/api/register',
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        tap((response) => {
          console.log('Registration successful', response);
        }),
        catchError((error) => {
          console.error('Registration failed', error);
          return throwError(() => error);
        })
      );
  }
}
