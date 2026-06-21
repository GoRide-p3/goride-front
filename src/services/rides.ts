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
  availableSeats: number;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
}

export const ridesService = {
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
};