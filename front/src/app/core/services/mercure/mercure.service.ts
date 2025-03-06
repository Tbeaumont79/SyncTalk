import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

interface MercureMessage {
  status: string;
  author: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class MercureService {
  private hubUrl = 'http://localhost:3000/.well-known/mercure';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  isBrowserEnvironment(): boolean {
    return this.isBrowser;
  }

  subscribe(topic: string): Observable<MercureMessage | null> {
    if (!this.isBrowser) {
      console.warn(
        'Mercure: Running in server environment, returning empty observable'
      );
      return of(null);
    }

    return new Observable<MercureMessage>((observer) => {
      let eventSource: EventSource | null = null;
      const cleanup = (): void => eventSource?.close();

      try {
        const url = new URL(this.hubUrl);
        url.searchParams.append('topic', topic);

        eventSource = new EventSource(url.toString());

        eventSource.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data) as MercureMessage;
            observer.next(data);
          } catch (error) {
            console.error('Error parsing Mercure message:', error);
            observer.error(error);
          }
        };

        eventSource.onerror = (error: Event) => {
          console.error('Mercure connection error:', error);
          observer.error(error);
          cleanup();
        };

        return cleanup;
      } catch (error) {
        console.error('Error creating EventSource:', error);
        observer.error(error);
        cleanup();
        return cleanup;
      }
    });
  }
}
