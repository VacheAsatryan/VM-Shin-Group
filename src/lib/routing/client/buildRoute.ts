import type { Coordinates, RouteResult } from "../types";

export interface BuildRouteRequest {
  origin: Coordinates;
  destination: Coordinates;
  signal?: AbortSignal;
}

export async function buildRoute({ origin, destination, signal }: BuildRouteRequest): Promise<RouteResult> {
  const res = await fetch("/api/routing/route", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ origin, destination }),
    signal
  });

  if (!res.ok) {
    let errorMsg = `Server routing failed with status: ${res.status}`;
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
  return data as RouteResult;
}
