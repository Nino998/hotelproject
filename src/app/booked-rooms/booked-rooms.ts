import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Apilinks } from '../aplinks';
import { Booking, Room } from '../hotel';

@Component({
  selector: 'app-booked-rooms',
  imports: [DatePipe],
  templateUrl: './booked-rooms.html',
  styleUrl: './booked-rooms.css',
})
export class BookedRooms implements OnInit {
  private api = inject(Apilinks);

  bookings = signal<Booking[]>([]);
  rooms = signal<Room[]>([]);

  ngOnInit() {
    // ერთდროულად ვქაჩავთ სამივე სასტუმროს ოთახებს, რომ ID-ით ძებნისას არასდროს აირიოს
    forkJoin([
      this.api.getHotel(1),
      this.api.getHotel(2),
      this.api.getHotel(3)
    ]).subscribe({
      next: (hotels) => {
        const allRooms = hotels.flatMap(h => h.rooms || []);
        this.rooms.set(allRooms);
      }
    });

    this.load();
  }

  load() {
    this.api.getBookings().subscribe(b => this.bookings.set(b));
  }

  roomName(id: number) {
    return this.rooms().find(r => r.id === id)?.name ?? `Room #${id}`;
  }

  cancel(id: number) {
    this.api.deleteBooking(id).subscribe(() => this.load());
  }
}