import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Booking, Hotel, Room, RoomFilter, RoomType } from './hotel';

const BASE = 'https://hotelbooking.stepprojects.ge/api';

@Injectable({
  providedIn: 'root',
})
export class Apilinks {
  private http = inject(HttpClient);

  private rooms$?: Observable<Room[]>;

  getHotels() {
    return this.http.get<Hotel[]>(`${BASE}/Hotels/GetAll`);
  }

  getHotel(id: number) {
    return this.http.get<Hotel>(`${BASE}/Hotels/GetHotel/${id}`);
  }

  getRooms() {
    return (this.rooms$ ??= this.http.get<Room[]>(`${BASE}/Rooms/GetAll`).pipe(shareReplay(1)));
  }

  getRoomTypes() {
    return this.http.get<RoomType[]>(`${BASE}/Rooms/GetRoomTypes`);
  }

  filterRooms(filter: RoomFilter) {
    return this.http.post<Room[]>(`${BASE}/Rooms/GetFiltered`, filter);
  }

  bookRoom(booking: Booking) {
    return this.http.post(`${BASE}/Booking`, booking, { responseType: 'text' });
  }

  getBookings() {
    return this.http.get<Booking[]>(`${BASE}/Booking`);
  }

  deleteBooking(id: number) {
    return this.http.delete(`${BASE}/Booking/${id}`, { responseType: 'text' });
  }
}