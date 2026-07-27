export interface Coordinates {
  lat: number;
  lon: number;
}

export interface AddressSuggestion {
  id: string;
  formatted: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  region?: string;
  country?: string;
  coordinates: Coordinates;
}

export interface DeliveryRoute {
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  geometry: [number, number][]; // Array of [lat, lon] coordinates for polyline
}

export type DeliveryStateStatus =
  | "idle"
  | "searchingAddress"
  | "addressResults"
  | "addressSelected"
  | "buildingRoute"
  | "routeReady"
  | "error";
