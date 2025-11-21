import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ActivateComponent } from './pages/activate/activate.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'api/v1/users/:userId/activate',
    component: ActivateComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
