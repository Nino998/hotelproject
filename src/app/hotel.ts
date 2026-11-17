export interface Hotel {
  id: number;
  name: string;
  address: string;
  city?: string;
  featuredImage: string;
  rooms: Room[];
}

export interface Room {
  id: number;
  name: string;
  pricePerNight: number;
  maximumGuests: number;
  roomTypeId: number;
  hotelId: number;
  description?: string;
  images: { id: number; source: string }[];
  bookedDates?: { date: string }[];
}

export interface RoomType {
  id: number;
  name: string;
}

export interface RoomFilter {
  roomTypeId: number;
  priceFrom: number;
  priceTo: number;
  maximumGuests: number;
  checkIn: string;
  checkOut: string;
}

export interface Booking {
  id: number;
  roomID: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  isConfirmed: boolean;
  customerName: string;
  customerId: string;
  customerPhone: string;
}