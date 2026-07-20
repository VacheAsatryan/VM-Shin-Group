import type { FactoryOriginConfig } from "@/config/delivery";

export interface MapRouteEstimate {
  origin: FactoryOriginConfig;
  destinationAddress: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  isDemoProvider: boolean;
}

export interface MapProvider {
  calculateRoute(destinationAddress: string): Promise<MapRouteEstimate>;
}
