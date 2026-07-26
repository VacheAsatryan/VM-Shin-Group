export type RoutingErrorCode =
  | "CONFIG_ERROR"
  | "INVALID_COORDINATES"
  | "PROVIDER_ERROR"
  | "ROUTE_NOT_FOUND"
  | "UPSTREAM_ERROR";

export class RoutingError extends Error {
  constructor(
    public code: RoutingErrorCode,
    message: string
  ) {
    super(message);
    this.name = "RoutingError";
  }
}
