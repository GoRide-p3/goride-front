import { apiFetch } from "../utils/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  gender: string;
  phone: string | null;
  birthDate: string | null;
  rating: number;
  totalRatings: number;
  createdAt: string;
  avatar?: string | null;
  bio?: string | null;
  pix?: string | null;
  privateMode?: boolean;
  emailVerified?: boolean;
  savedAddresses?: { id: string; label: string; address: string }[];
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export const authService = {
  register: (data: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    gender: string;
    birthDate: string;
    password: string;
  }) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  forgotPassword: (data: { email: string }) =>
    apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resetPassword: (data: { token: string; password: string }) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch<{ message: string }>("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
