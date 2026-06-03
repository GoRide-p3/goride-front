import { apiFetch } from "./api";

export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    return await apiFetch<{ lat: number; lng: number }>(
      `/geocode?address=${encodeURIComponent(address)}`,
    );
  } catch {
    return null;
  }
}