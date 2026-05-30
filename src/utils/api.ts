import { getToken } from "./auth";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(
    `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}${path}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json();
}