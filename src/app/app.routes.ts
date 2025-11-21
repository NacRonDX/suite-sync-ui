import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ActivateComponent } from './pages/activate/activate.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

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
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'rooms',
    component: RoomsComponent,
    canActivate: [roleGuard(['STAFF', 'ADMIN'])],
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
