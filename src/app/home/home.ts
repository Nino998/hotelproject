import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Apilinks } from '../aplinks';
import { Hotel } from '../hotel';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private api = inject(Apilinks);
  private router = inject(Router);

  hotels = signal<Hotel[]>([]);

  ngOnInit() {
    forkJoin([
      this.api.getHotel(1),
      this.api.getHotel(2),
      this.api.getHotel(3)
    ]).subscribe({
      next: (res) => this.hotels.set(res),
      error: (err) => console.error('Error loading hotels:', err)
    });
  }

  selectHotel(hotelId: number) {

    this.router.navigate(['/rooms'], { queryParams: { hotelId } });
  }
}