import { apiFetch } from "../utils/api";

export interface CreateRidePayload {
  driverId?: string;
  origin: string;
  destination: string;
  date: string;
  departureTimeStart: string;
  departureTimeEnd: string;
  price: number;
  totalSeats: number;
  routeId?: string;
  routeName?: string;
  routePolyline?: string;
  sameGenderOnly: boolean;
}

export interface Ride extends CreateRidePayload {
  id: string;
  driver?: {
    id: string;
    name: string;
    rating: number;
    totalRatings: number;
    gender?: string;
  };
  availableSeats: number;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
}

export interface RideHistoryResponse {
  offered: Ride[];
  requested: {
    id: string;
    status: "pending" | "accepted" | "rejected";
    requestedAt: string;
    ride: Ride;
  }[];
}

export const ridesService = {
  geocode: (address: string) =>
    apiFetch<{ lat: number; lng: number }>(`/geocode?address=${encodeURIComponent(address)}`),

  create: (data: CreateRidePayload) =>
    apiFetch<Ride>("/rides", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Ride[]>(`/rides${query}`);
  },

  getById: (id: string) => apiFetch<Ride>(`/rides/${id}`),

  update: (id: string, data: Partial<CreateRidePayload>) =>
    apiFetch<Ride>(`/rides/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiFetch<void>(`/rides/${id}`, { method: "DELETE" }),

  history: (userId: string) =>
    apiFetch<RideHistoryResponse>(`/rides/history/${userId}`),
};
