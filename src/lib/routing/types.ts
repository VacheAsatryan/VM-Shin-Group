export type Coordinates = {
  latitude: number;
  longitude: number;
};

export interface RouteResult {
  originCoordinates: Coordinates;
  destinationCoordinates: Coordinates;

  distanceMeters: number;
  distanceKm: number;

  durationSeconds?: number;

  geometry: Coordinates[];
}
