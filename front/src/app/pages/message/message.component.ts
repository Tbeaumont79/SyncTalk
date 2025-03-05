import { Component } from '@angular/core';
import { User } from '../../core/interfaces/user';
import { StorageService } from '../../core/services/storage.service';
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
  constructor(private storageService: StorageService) {
    const user = this.storageService.getItem('user');
    if (user) {
      this.user = JSON.parse(user) as User;
    }
  }
}
