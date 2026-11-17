import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Room } from '../hotel';

@Component({
  selector: 'app-room-card',
  imports: [RouterLink],
  templateUrl: './room-card.html',
  styleUrl: './room-card.css',
})
export class RoomCard {
  room = input.required<Room>();

  getRoomImage(): string {
    const images = this.room().images;
    if (images && images.length > 0 && images[0].source) {
      const src = images[0].source;
      return src.startsWith('http') ? src : `https://hotelbooking.stepprojects.ge${src}`;
    }
    return 'https://placehold.co/400x300?text=No+Image';
  }

  onImgError(event: any) {
    event.target.src = 'https://placehold.co/400x300?text=No+Image';
  }
}