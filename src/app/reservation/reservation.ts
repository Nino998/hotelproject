import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Apilinks } from '../aplinks';
import { Booking, Room } from '../hotel';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation.html',
  styleUrl: './reservation.css',
})
export class Reservation implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(Apilinks);

  room = signal<Room | null>(null);
  error = signal(''); 
  formError = signal(''); 
  saving = signal(false);

  current = signal(0);
  failed = signal<number[]>([]);
  tab = signal<'overview' | 'facilities' | 'extra'>('overview');

  
  isLoggedIn = signal(false);

  today = new Date().toISOString().slice(0, 10);

  form = {
    checkIn: '',
    checkOut: '',
    customerName: '',
    customerPhone: '',
    password: '',
    isRegistering: true,
  };

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.error.set('ოთახის ID არ არის მითითებული');
      return;
    }

    
    forkJoin([
      this.api.getHotel(1),
      this.api.getHotel(2),
      this.api.getHotel(3)
    ]).subscribe({
      next: (hotels) => {
        const allRooms = hotels.flatMap(h => h.rooms || []);
        const found = allRooms.find(r => r.id === id);

        if (found) {
          this.room.set(found);
        } else {
          this.error.set('მოთხოვნილი ოთახი ვერ მოიძებნა');
        }
      },
      error: (err) => {
        console.error('Hotels load failed:', err);
        this.error.set('ოთახის დეტალების ჩატვირთვა ვერ მოხერხდა');
      }
    });
  }

  url(src: string) {
    if (!src) return '';
    return src.startsWith('http') ? src : `https://hotelbooking.stepprojects.ge${src}`;
  }

  markFailed(i: number) {
    this.failed.update((f) => (f.includes(i) ? f : [...f, i]));
    if (this.current() === i) {
      const images = this.room()?.images ?? [];
      const nextValid = images.findIndex((_, idx) => !this.failed().includes(idx));
      if (nextValid !== -1) {
        this.current.set(nextValid);
      }
    }
  }

  selectImage(i: number) {
    this.current.set(i);
  }

  
  authenticate() {
    if (!this.form.customerName.trim() || !this.form.customerPhone.trim() || !this.form.password) {
      this.formError.set('გთხოვთ, შეავსოთ სახელი, ტელეფონი და პაროლი!');
      return;
    }

    this.formError.set('');

    if (this.form.isRegistering) {
      const newUser = {
        name: this.form.customerName,
        phone: this.form.customerPhone,
        password: this.form.password,
      };
      localStorage.setItem('registered_user', JSON.stringify(newUser));
    }

    this.isLoggedIn.set(true);
  }

  nights() {
    if (!this.form.checkIn || !this.form.checkOut) return 0;
    const diff = new Date(this.form.checkOut).getTime() - new Date(this.form.checkIn).getTime();
    return Math.max(0, Math.round(diff / 86400000));
  }

  total() {
    return this.nights() * (this.room()?.pricePerNight ?? 0);
  }

  book() {
    const room = this.room();
    if (!room) return;

    if (!this.form.checkIn || !this.form.checkOut || this.nights() < 1) {
      this.formError.set('გთხოვთ, აირჩიოთ სწორი თარიღები');
      return;
    }

    this.formError.set('');

    const booking: Booking = {
      id: 0,
      roomID: room.id,
      checkInDate: this.form.checkIn,   
      checkOutDate: this.form.checkOut, 
      totalPrice: this.total(),
      isConfirmed: true,
      customerName: this.form.customerName.trim(),
      customerId: '0',
      customerPhone: this.form.customerPhone.trim(),
    };

    this.saving.set(true);
    this.api.bookRoom(booking).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/booked']);
      },
      error: (err) => {
        this.saving.set(false);
        console.error('Booking failed:', err);
        this.formError.set(`დაჯავშნა ვერ მოხერხდა (${err.status}).`);
      },
    });
  }
}