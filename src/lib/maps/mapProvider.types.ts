import type { FactoryOriginConfig } from "@/config/delivery";

export interface MapRouteEstimate {
  origin: FactoryOriginConfig;
  destinationAddress: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  isAvailable: boolean;
  statusMessageKey?: string;
  error?: string;
}

export interface MapProvider {
  calculateRoute(destinationAddress: string): Promise<MapRouteEstimate>;
}
