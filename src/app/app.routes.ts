import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Reservation } from './reservation/reservation';
import { BookedRooms } from './booked-rooms/booked-rooms';
import { Rooms } from './rooms/rooms';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'rooms', component: Rooms },
  { path: 'rooms/:hotelId', component: Rooms },
  { path: 'reservation/:id', component: Reservation },
  { path: 'booked', component: BookedRooms },
  { path: '**', redirectTo: '' },
];