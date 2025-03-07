import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { User } from '../../core/interfaces/user';
import { Subscription } from 'rxjs';
import { StorageService } from '../../core/services/storage/storage.service';
import { MercureService } from '../../core/services/mercure/mercure.service';
import { MessageService } from '../../core/services/messages/message.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message.component.html',
})
export class MessageComponent implements OnInit, OnDestroy {
  user: User = {
    id: 0,
    username: '',
    email: '',
  };
  message: string = '';
  messages: any[] = [];
  private subscription: Subscription | null = null;
  private topic = 'https://example.com/messages';
  private isBrowser: boolean;
  private router = Inject(Router);
  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(StorageService) private storageService: StorageService,
    @Inject(MercureService) private mercureService: MercureService,
    @Inject(MessageService) private messageService: MessageService,
    private http: HttpClient
  ) {
    console.log('MessageComponent constructor called');
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('Is browser environment:', this.isBrowser);

    if (this.isBrowser) {
      const user = this.storageService.getItem('user');
      console.log('User from storage:', user);
      if (user) {
        this.user = JSON.parse(user) as User;
      }
    }
  }

  ngOnInit() {
    this.loadInitialMessages();
    if (this.isBrowser) {
      console.log('Mercure service is browser environment');
      this.subscribeToMessages();
    }
  }

  private loadInitialMessages() {
    this.messageService.getMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      },
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private subscribeToMessages() {
    this.subscription = this.mercureService.subscribe(this.topic).subscribe({
      next: (data) => {
        if (data) {
          console.log('Received message from mercure:', data);
          this.messages.push(data);
        }
      },
      error: (error) => {
        console.error('Error receiving message:', error);
      },
    });
  }

  sendMessage() {
    const token = this.storageService.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    this.http
      .post<{
        id: number;
        content: string;
        author: string;
        created_at: string;
      }>(
        'http://localhost:8000/api/message',
        { content: this.message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .subscribe({
        next: (response) => {
          console.log('Message sent successfully: ', response);
        },
        error: (error) => {
          console.error('Error sending message:', error);
          if (error.status === 401) {
            console.log('Unauthorized');
            this.router.navigate(['/login']);
          }
        },
      });
  }
}
