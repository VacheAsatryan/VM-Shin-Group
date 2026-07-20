import { FACTORY_ORIGIN, DELIVERY_CONFIG } from "@/config/delivery";
import type { MapProvider, MapRouteEstimate } from "./mapProvider.types";

export class DemoMapProvider implements MapProvider {
  async calculateRoute(destinationAddress: string): Promise<MapRouteEstimate> {
    const distanceKm = destinationAddress.trim().length > 0
      ? DELIVERY_CONFIG.defaultDistanceKm
      : 0;

    return {
      origin: FACTORY_ORIGIN,
      destinationAddress,
      distanceKm,
      estimatedDurationMinutes: Math.round(distanceKm * 1.5),
      isDemoProvider: true,
    };
  }
}

export const demoMapProvider = new DemoMapProvider();
