import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class MercureService {
  private hubUrl = 'https://localhost:3000/.well-known/mercure';
  constructor() {}

  subscribe(topic: string): Observable<any> {
    return new Observable((observer) => {
      const url = new URL(this.hubUrl);
      url.searchParams.append('topic', topic);
      const eventSource = new EventSource(url);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        observer.next(data);
      };

      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    });
  }
}
