export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  rideId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface PassengerRequest {
  id: string;
  passenger: {
    id: string;
    name: string;
    gender: string;
    rating: number;
    totalRatings: number;
    phone: string;
  };
  status: "pending" | "accepted" | "rejected";
  requestedAt: string;
  ratingGiven?: Rating;
}

export interface MyRide {
  id: string;
  origin: string;
  destination: string;
  date: string;
  departureTimeStart: string;
  departureTimeEnd: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  routeId: string;
  routeName: string;
  status: "active" | "completed" | "cancelled";
  sameGenderOnly: boolean;
  requests: PassengerRequest[];
  confirmedPassengers: PassengerRequest[];
  createdAt: string;
  completedAt?: string;
  driverRatingsGiven?: boolean;
}

// Tipo para caronas solicitadas (como passageiro)
export interface MyRideAsPassenger {
  id: string;
  rideId?: string;
  origin: string;
  destination: string;
  date: string;
  departureTimeStart: string;
  departureTimeEnd: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  routeName: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  sameGenderOnly: boolean;
  driver: {
    id: string;
    name: string;
    rating: number;
    totalRatings: number;
    phone: string;
  };
  otherPassengers: {
    id: string;
    name: string;
    gender: string;
    rating: number;
  }[];
  boardingTime: string | null;
  boardingAddress: string | null;
  seenBoardingModal: boolean;
  requestedAt: string;
  completedAt?: string;
  passengerRatingGiven?: Rating;
}
