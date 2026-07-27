import { fetchGeoapifyJson } from "./client";
import { normalizeDeliveryRoute } from "./normalize";
import type { Coordinates, DeliveryRoute } from "./types";

export interface CalculateRouteOptions {
  signal?: AbortSignal;
  mode?: "drive";
}

export async function calculateDrivingRoute(
  origin: Coordinates,
  destination: Coordinates,
  options?: CalculateRouteOptions
): Promise<DeliveryRoute> {
  const waypoints = `${origin.lat},${origin.lon}|${destination.lat},${destination.lon}`;
  const mode = options?.mode || "drive";

  const params: Record<string, string> = {
    waypoints,
    mode,
  };

  const response = await fetchGeoapifyJson<unknown>(
    "/routing",
    params,
    options?.signal
  );

  const route = normalizeDeliveryRoute(response);
  if (!route) {
    throw new Error("No driving route found between origin and destination");
  }

  return route;
}
