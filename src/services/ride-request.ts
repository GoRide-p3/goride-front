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
  create: (rideId: string) =>
    apiFetch<RideRequestResponse>(`/rides/${rideId}/requests`, {
      method: "POST",
    }),

  listByRide: (rideId: string) =>
    apiFetch<RideRequestResponse[]>(`/rides/${rideId}/requests`),

  listByPassenger: () =>
    apiFetch<RideRequestResponse[]>("/passengers/me/requests"),

  update: (requestId: string, status: "accepted" | "rejected") =>
    apiFetch<RideRequestResponse>(`/requests/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
