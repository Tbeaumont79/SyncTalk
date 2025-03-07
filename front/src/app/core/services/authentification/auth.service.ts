import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, catchError, throwError } from 'rxjs';
import { StorageService } from '../storage/storage.service';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = 'http://localhost:8000/api';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    const token = storageService.getItem('token');
    const user = storageService.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }
  register(email: string, password: string): Observable<any> {
    const username = email.split('@')[0];
    return this.http
      .post(`${this.API_URL}/register`, { username, password })
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

  login(email: string, password: string): Observable<any> {
    const username = email.split('@')[0];
    return this.http
      .post(`${this.API_URL}/login_check`, {
        username,
        password,
      })
      .pipe(
        tap((response: any) => {
          console.log('Login successful', response.token);
          this.storageService.setItem('token', response.token);
          this.storageService.setItem('refresh_token', response.refresh_token);

          const payload = JSON.parse(atob(response.token.split('.')[1]));
          const user = { username: payload.username, roles: payload.roles };
          this.storageService.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  refreshToken(): Observable<any> {
    const refresh_token = localStorage.getItem('refresh_token');
    return this.http
      .post(`${this.API_URL}/token/refresh`, { refresh_token })
      .pipe(
        tap((response: any) => {
          localStorage.setItem('token', response.token);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.storageService.getItem('token');
    return token !== null && token !== undefined;
  }

  getToken(): string | null {
    return this.storageService.getItem('token');
  }
}
