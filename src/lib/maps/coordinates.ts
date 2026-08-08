import { VM_SHIN_GROUP_FACTORY_COORDINATES } from "./mapConstants";
import type { Coordinates } from "./geoapify/types";

// Armenia Bounding Box Coordinates
export const ARMENIA_BOUNDS = {
  minLat: 38.8,
  maxLat: 41.4,
  minLon: 43.4,
  maxLon: 46.7,
};

// Factory Coordinates Constant (Lat, Lon object)
export const FACTORY_COORDINATES: Coordinates = {
  lat: VM_SHIN_GROUP_FACTORY_COORDINATES[0],
  lon: VM_SHIN_GROUP_FACTORY_COORDINATES[1],
};

export function isWithinArmenia(coords: Coordinates): boolean {
  return (
    coords.lat >= ARMENIA_BOUNDS.minLat &&
    coords.lat <= ARMENIA_BOUNDS.maxLat &&
    coords.lon >= ARMENIA_BOUNDS.minLon &&
    coords.lon <= ARMENIA_BOUNDS.maxLon
  );
}

export function isValidCoordinates(coords: unknown): coords is Coordinates {
  if (!coords || typeof coords !== "object") return false;
  const c = coords as Record<string, unknown>;
  if (typeof c.lat !== "number" || typeof c.lon !== "number") return false;
  if (!Number.isFinite(c.lat) || !Number.isFinite(c.lon)) return false;
  return c.lat >= -90 && c.lat <= 90 && c.lon >= -180 && c.lon <= 180;
}

export function formatCoordinates(coords: Coordinates): string {
  return `${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}`;
}

export function calculateDistanceKm(from: Coordinates, to: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lon - from.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  // Apply estimated road network multiplier (~1.3x)
  return Math.round(straightLine * 1.3 * 10) / 10;
}
