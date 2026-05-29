const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}${path}`;
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json();
}