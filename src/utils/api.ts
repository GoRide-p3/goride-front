import { clearSession, getToken } from "./auth";

const PUBLIC_AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return `${window.location.protocol}//${window.location.hostname}:3000`;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(
    `${getApiBaseUrl()}${path}`,
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

    if (response.status === 401 && !PUBLIC_AUTH_PATHS.has(window.location.pathname)) {
      clearSession();
      window.location.assign("/login");
    }

    throw new Error(body.message ?? `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json();
}
