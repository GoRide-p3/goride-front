export type Gender = "Masculino" | "Feminino" | "Outro";

export interface Driver {
  id: string;
  name: string;
  rating: number;
  totalRatings: number;
  gender: Gender;
}

export interface Ride {
  id: string;
  driver: Driver;
  departure: string;
  date: string;
  origin: string;
  destination: string;
  price: number;
  availableSeats: number;
  confirmedPassengers: number;
  departureTimeStart: string;
  departureTimeEnd: string;
}
