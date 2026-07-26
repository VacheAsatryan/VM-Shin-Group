import type { Coordinates, RouteResult } from "./types";

export interface RoutingProvider {
  buildRoute(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<RouteResult>;
}
