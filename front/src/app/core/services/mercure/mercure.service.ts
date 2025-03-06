import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from '../storage/storage.service';
import { MercureMessage } from '../../interfaces/mercureMessage';
@Injectable({
  providedIn: 'root',
})
export class MercureService {
  private hubUrl = 'http://localhost:3000/.well-known/mercure';
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(StorageService) private storageService: StorageService
  ) {
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

    console.log('Attempting to subscribe to Mercure hub:', this.hubUrl);
    console.log('Topic:', topic);

    return new Observable<MercureMessage>((observer) => {
      let eventSource: EventSource | null = null;
      const cleanup = (): void => {
        if (eventSource) {
          console.log('Closing EventSource connection');
          eventSource.close();
          eventSource = null;
        }
      };

      try {
        const url = new URL(this.hubUrl);
        url.searchParams.append('topic', topic);

        const token = this.storageService.getItem('token');
        console.log('Token available:', !!token);

        let eventSourceUrl: string;
        if (token) {
          eventSourceUrl = `${url.toString()}?authorization=Bearer ${token}`;
        } else {
          eventSourceUrl = url.toString();
        }

        console.log('Connecting to EventSource URL:', eventSourceUrl);
        eventSource = new EventSource(eventSourceUrl, {
          withCredentials: false,
        });

        eventSource.onopen = () => {
          console.log('EventSource connection opened');
        };

        eventSource.onmessage = (event: MessageEvent) => {
          console.log('Received raw event:', event);
          try {
            const data = JSON.parse(event.data) as MercureMessage;
            console.log('Parsed Mercure message:', data);
            observer.next(data);
          } catch (error) {
            console.error('Error parsing Mercure message:', error);
            observer.error(error);
          }
        };

        eventSource.onerror = (error: Event) => {
          console.error('Mercure connection error:', error);
          cleanup();
          setTimeout(() => {
            if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
              console.log('Attempting to reconnect...');
              this.subscribe(topic).subscribe({
                next: (data) => {
                  if (data) {
                    observer.next(data);
                  }
                },
                error: (err) => observer.error(err),
              });
            }
          }, 1000);
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
