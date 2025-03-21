import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MessageComponent } from './pages/message/message.component';
import { authGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    component: MessageComponent,
    canActivate: [authGuard],
  },
];
