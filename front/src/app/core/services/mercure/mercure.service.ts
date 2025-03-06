import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root',
})
export class MercureService {
  private hubUrl = 'https://localhost:3000/.well-known/mercure';
  private isBrowser: boolean;
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  subscribe(topic: string): Observable<any> {
    if (!this.isBrowser) {
      console.warn("EventSource n'est pas disponible côté serveur");
      return of(null);
    }
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
