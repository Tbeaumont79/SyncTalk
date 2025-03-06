import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../core/interfaces/user';
import { Subscription } from 'rxjs';
import { StorageService } from '../../core/services/storage/storage.service';
import { MercureService } from '../../core/services/mercure/mercure.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(
    private storageService: StorageService,
    private mercureService: MercureService,
    private http: HttpClient
  ) {
    const user = this.storageService.getItem('user');
    if (user) {
      this.user = JSON.parse(user) as User;
    }
  }

  ngOnInit() {
    if (this.mercureService.isBrowserEnvironment()) {
      this.subscribeToMessages();
    }
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
          console.log('Received message:', data);
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
    console.log('Sending message:', this.message);
    this.http
      .post(
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
          console.log('Message sent successfully:', response);
          this.message = ''; // Clear the input after sending
        },
        error: (error) => {
          console.error('Error sending message:', error);
        },
      });
  }
}
