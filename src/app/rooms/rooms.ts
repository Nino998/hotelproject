import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Apilinks } from '../aplinks';
import { Hotel, Room, RoomFilter } from '../hotel';
import { RoomCard } from '../room-card/room-card';

@Component({
  selector: 'app-rooms',
  imports: [FormsModule, RoomCard],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms implements OnInit {
  private api = inject(Apilinks);
  private route = inject(ActivatedRoute);

  hotels = signal<Hotel[]>([]);
  selectedHotelId = signal<number>(1);
  rooms = signal<Room[]>([]);

  roomTypes = [
    { id: 0, name: 'All' },
    { id: 1, name: 'Single Room' },
    { id: 2, name: 'Double Room' },
    { id: 3, name: 'Deluxe Room' },
  ];

  filter: RoomFilter = {
    roomTypeId: 0,
    priceFrom: 0,
    priceTo: 1000,
    maximumGuests: 1,
    checkIn: '',
    checkOut: '',
  };

  ngOnInit() {
    
    forkJoin([
      this.api.getHotel(1),
      this.api.getHotel(2),
      this.api.getHotel(3)
    ]).subscribe({
      next: (res) => {
        this.hotels.set(res);

        this.route.queryParams.subscribe(params => {
          const hId = Number(params['hotelId']);
          if (hId && res.some(h => h.id === hId)) {
            this.selectedHotelId.set(hId);
          } else {
            this.selectedHotelId.set(res[0].id);
          }
          this.updateDisplayedRooms();
        });
      }
    });
  }

  onHotelChange(event: any) {
    const id = Number(event.target.value);
    this.selectedHotelId.set(id);
    this.resetFilterValues();
    this.updateDisplayedRooms();
  }

  updateDisplayedRooms() {
    const hotel = this.hotels().find(h => h.id === this.selectedHotelId());
    this.rooms.set(hotel?.rooms || []);
  }

  applyFilter() {
    const currentHotelId = this.selectedHotelId();
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const body: RoomFilter = {
      roomTypeId: Number(this.filter.roomTypeId) || 0,
      priceFrom: Number(this.filter.priceFrom) || 0,
      priceTo: Number(this.filter.priceTo) || 1000,
      maximumGuests: Number(this.filter.maximumGuests) || 1,
      checkIn: this.filter.checkIn ? new Date(this.filter.checkIn).toISOString() : today.toISOString(),
      checkOut: this.filter.checkOut ? new Date(this.filter.checkOut).toISOString() : tomorrow.toISOString(),
    };

    this.api.filterRooms(body).subscribe({
      next: res => {
        if (res && res.length > 0) {
          const filtered = res.filter(r => r.hotelId === currentHotelId);
          this.rooms.set(filtered);
        } else {
          this.rooms.set(this.localFilter());
        }
      },
      error: () => {
        this.rooms.set(this.localFilter());
      },
    });
  }

  private localFilter(): Room[] {
    const hotel = this.hotels().find(h => h.id === this.selectedHotelId());
    const all = hotel?.rooms ?? [];
    const type = Number(this.filter.roomTypeId);

    return all.filter(r => {
      if (type !== 0 && r.roomTypeId !== type) return false;
      if (r.pricePerNight < this.filter.priceFrom) return false;
      if (this.filter.priceTo && r.pricePerNight > this.filter.priceTo) return false;
      if (r.maximumGuests < this.filter.maximumGuests) return false;
      return true;
    });
  }

  resetFilterValues() {
    this.filter = {
      roomTypeId: 0,
      priceFrom: 0,
      priceTo: 1000,
      maximumGuests: 1,
      checkIn: '',
      checkOut: '',
    };
  }

  reset() {
    this.resetFilterValues();
    this.updateDisplayedRooms();
  }
}