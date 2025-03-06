import { Component } from '@angular/core';
import { User } from '../../core/interfaces/user';
import { StorageService } from '../../core/services/storage/storage.service';
import { MercureService } from '../../core/services/mercure/mercure.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-message',
  standalone: true,
  imports: [],
  templateUrl: './message.component.html',
})
export class MessageComponent {
  user: User = {
    id: 0,
    username: '',
    email: '',
  };
  message: string = '';
  private subscription: Subscription | null = null;

  constructor(
    private storageService: StorageService,
    private mercureService: MercureService
  ) {
    const user = this.storageService.getItem('user');
    if (user) {
      this.user = JSON.parse(user) as User;
    }
  }

  ngOnInit() {
    this.subscription = this.mercureService.subscribe('message').subscribe(
      (data) => {
        console.log(data);
      }
    );
  }
}
