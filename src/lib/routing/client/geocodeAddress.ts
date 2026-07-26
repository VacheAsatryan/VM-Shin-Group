import type { Coordinates } from "../types";

export interface GeocodeResult {
  coordinates: Coordinates;
  formattedAddress: string;
}

export async function geocodeAddress(
  query: string,
  locale?: "hy" | "ru" | "en",
  signal?: AbortSignal
): Promise<GeocodeResult> {
  const res = await fetch("/api/routing/geocode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query, locale }),
    signal
  });

  if (!res.ok) {
    let errorMsg = `Server geocoding failed with status: ${res.status}`;
    try {
      const errData = await res.json();
      if (errData?.error?.message) {
        errorMsg = errData.error.message;
      }
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  return data as GeocodeResult;
}
