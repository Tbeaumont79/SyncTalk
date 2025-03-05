import { Component } from '@angular/core';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [],
  templateUrl: './message.component.html',
})
export class MessageComponent {
  user: any = JSON.parse(localStorage.getItem('user') || '{}');
}
