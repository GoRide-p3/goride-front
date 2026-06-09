export interface HistoryRideAsPassenger {
  id: string;
  date: string;
  departureTimeStart: string;
  departureTimeEnd: string;
  origin: string;
  destination: string;
  driver: {
    id?: string;
    name: string;
    rating: number;
    totalRatings: number;
    gender: string;
    phone: string;
  };
  price: number;
  otherPassengers: {
    id: string;
    name: string;
    gender: string;
    rating: number;
  }[];
  sameGenderOnly: boolean;
  route: {
    name: string;
    distance: string;
    duration: string;
    waypoints: string[];
  };
  status: "active" | "completed" | "cancelled";
}
export interface HistoryRideAsDriver {
  id: string;
  date: string;
  departureTimeStart: string;
  departureTimeEnd: string;
  origin: string;
  destination: string;
  route: {
    name: string;
    distance: string;
    duration: string;
    waypoints: string[];
  };
  price: number;
  totalSeats: number;
  passengers: {
    id: string;
    name: string;
    rating: number;
    gender: string;
  }[];
  sameGenderOnly: boolean;
  status: "active" | "completed" | "cancelled";
}
