import { apiFetch } from "../utils/api";

export interface RideRequestResponse {
  id: string;
  rideId: string;
  passengerId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  passenger: {
    id: string;
    name: string;
    rating: number;
    totalRatings: number;
    gender: string;
    phone: string | null;
  };
  ride: {
    id: string;
    origin: string;
    destination: string;
    date: string;
    departureTimeStart: string;
    departureTimeEnd: string;
    price: number;
    driver: {
      id: string;
      name: string;
      rating: number;
      totalRatings: number;
    };
  };
}

export const rideRequestsService = {
  create: (rideId: string, passengerId: string) =>
    apiFetch<RideRequestResponse>(`/rides/${rideId}/requests`, {
      method: "POST",
      body: JSON.stringify({ passengerId }),
    }),

  listByRide: (rideId: string) =>
    apiFetch<RideRequestResponse[]>(`/rides/${rideId}/requests`),

  listByPassenger: (passengerId: string) =>
    apiFetch<RideRequestResponse[]>(`/passengers/${passengerId}/requests`),

  update: (requestId: string, status: "accepted" | "rejected", driverId: string) =>
    apiFetch<RideRequestResponse>(`/requests/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, driverId }),
    }),
};