import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ActivateComponent } from './pages/activate/activate.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { RoomDetailComponent } from './pages/room-detail/room-detail.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
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
  },
  {
    path: 'rooms/:id',
    component: RoomDetailComponent,
  },
  {
    path: 'bookings',
    component: BookingsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'api/v1/users/:userId/activate',
    component: ActivateComponent,
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
