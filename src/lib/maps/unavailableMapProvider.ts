import { FACTORY_ORIGIN } from "@/config/delivery";
import type { MapProvider, MapRouteEstimate } from "./mapProvider.types";

export class UnavailableMapProvider implements MapProvider {
  async calculateRoute(destinationAddress: string): Promise<MapRouteEstimate> {
    return {
      origin: FACTORY_ORIGIN,
      destinationAddress,
      distanceKm: 0,
      estimatedDurationMinutes: 0,
      isAvailable: false,
      statusMessageKey: "mapUnavailable",
    };
  }
}

export const unavailableMapProvider = new UnavailableMapProvider();
