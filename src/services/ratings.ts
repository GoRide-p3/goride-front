import { apiFetch } from "../utils/api";

export interface ApiRating {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  fromUser?: {
    id: string;
    name: string;
    rating: number;
    totalRatings: number;
  };
  toUser?: {
    id: string;
    name: string;
    rating: number;
    totalRatings: number;
  };
  ride?: {
    id: string;
    driverId?: string;
    origin?: string;
    destination?: string;
    date?: string;
  };
}

export const ratingsService = {
  create: (data: {
    fromUserId: string;
    toUserId: string;
    rideId: string;
    rating: number;
    comment?: string;
  }) =>
    apiFetch<ApiRating>("/ratings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listByUser: (userId: string) =>
    apiFetch<ApiRating[]>(`/ratings/users/${userId}`),

  listByRide: (rideId: string) =>
    apiFetch<ApiRating[]>(`/ratings/rides/${rideId}`),
};
