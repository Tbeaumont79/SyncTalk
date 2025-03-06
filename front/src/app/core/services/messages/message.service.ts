import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MercureMessage } from '../../interfaces/mercureMessage';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  messages: MercureMessage[] = [];
  constructor(@Inject(HttpClient) private http: HttpClient) {}

  getMessages() {
    return this.http
      .get<MercureMessage[]>('http://localhost:8000/api/message')
      .pipe(
        tap((messages: MercureMessage[]) => {
          this.messages = messages;
        }),
        catchError((error) => {
          console.error('Error fetching messages:', error);
          return throwError(() => new Error('Error fetching messages'));
        })
      );
  }
}
