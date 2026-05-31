import { apiFetch } from "../utils/api";
import type { AuthUser } from "./auth";

export const userService = {
  getById: (id: string) => apiFetch<AuthUser>(`/user/${id}`),

  updateProfile: (id: string, data: Partial<AuthUser>) =>
    apiFetch<AuthUser>(`/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};