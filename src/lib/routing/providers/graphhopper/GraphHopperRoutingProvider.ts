import "server-only";
import type { Coordinates, RouteResult } from "../../types";
import type { RoutingProvider } from "../../RoutingProvider";
import { RoutingError } from "../../errors";

interface GraphHopperResponse {
  paths?: Array<{
    distance: number;
    time: number;
    points: {
      type: string;
      coordinates: Array<[number, number]>;
    };
  }>;
  message?: string;
}

export class GraphHopperRoutingProvider implements RoutingProvider {
  constructor(private readonly apiKey: string) {
    if (!apiKey || apiKey.trim() === "") {
      throw new RoutingError("CONFIG_ERROR", "GraphHopper API key is missing");
    }
  }

  async buildRoute(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<RouteResult> {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;

    const url = new URL("https://graphhopper.com/api/1/route");
    url.searchParams.append("point", originStr);
    url.searchParams.append("point", destStr);
    url.searchParams.append("vehicle", "car");
    url.searchParams.append("locale", "en");
    url.searchParams.append("instructions", "false"); // Minimize payload
    url.searchParams.append("calc_points", "true");
    url.searchParams.append("points_encoded", "false"); // Get raw GeoJSON coordinates
    url.searchParams.append("key", this.apiKey);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });
    } catch {
      throw new RoutingError("UPSTREAM_ERROR", "Failed to connect to GraphHopper API");
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new RoutingError("PROVIDER_ERROR", "GraphHopper API key is invalid or unauthorized");
      }
      if (response.status === 429) {
        throw new RoutingError("PROVIDER_ERROR", "GraphHopper API rate limit exceeded");
      }
      if (response.status === 400) {
        throw new RoutingError("INVALID_COORDINATES", "Invalid coordinates or points too far");
      }
      throw new RoutingError("UPSTREAM_ERROR", `GraphHopper API error: ${response.status}`);
    }

    const data = (await response.json()) as GraphHopperResponse;

    if (!data.paths || data.paths.length === 0) {
      throw new RoutingError("ROUTE_NOT_FOUND", "No route found between the given points");
    }

    const path = data.paths[0];

    // GeoJSON returns [longitude, latitude], our domain uses { latitude, longitude }
    const geometry: Coordinates[] = path.points.coordinates.map((coord) => ({
      latitude: coord[1],
      longitude: coord[0]
    }));

    const distanceMeters = path.distance;
    const distanceKm = distanceMeters / 1000;
    
    // time is in milliseconds
    const durationSeconds = Math.round(path.time / 1000);

    return {
      originCoordinates: origin,
      destinationCoordinates: destination,
      distanceMeters,
      distanceKm,
      durationSeconds,
      geometry
    };
  }
}
