import { NextResponse } from "next/server";
import { GraphHopperRoutingProvider } from "@/lib/routing/providers/graphhopper/GraphHopperRoutingProvider";
import { RoutingError } from "@/lib/routing/errors";
import type { Coordinates } from "@/lib/routing/types";

// Type definitions for the incoming request body
interface RouteRequestBody {
  origin?: {
    latitude?: unknown;
    longitude?: unknown;
  };
  destination?: {
    latitude?: unknown;
    longitude?: unknown;
  };
}

function isValidCoordinate(coord: unknown): coord is Coordinates {
  if (!coord || typeof coord !== "object") return false;
  const c = coord as Record<string, unknown>;
  if (typeof c.latitude !== "number" || typeof c.longitude !== "number") return false;
  if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude)) return false;
  if (c.latitude < -90 || c.latitude > 90) return false;
  if (c.longitude < -180 || c.longitude > 180) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RouteRequestBody;

    if (!isValidCoordinate(body.origin)) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Invalid or missing origin coordinates" } },
        { status: 400 }
      );
    }

    if (!isValidCoordinate(body.destination)) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Invalid or missing destination coordinates" } },
        { status: 400 }
      );
    }

    if (
      body.origin.latitude === body.destination.latitude &&
      body.origin.longitude === body.destination.longitude
    ) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Origin and destination cannot be identical" } },
        { status: 400 }
      );
    }

    const apiKey = process.env.GRAPHHOPPER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: { code: "CONFIG_ERROR", message: "Server routing configuration is missing" } },
        { status: 500 }
      );
    }

    // TODO: Add rate limiting here

    const provider = new GraphHopperRoutingProvider(apiKey);
    const result = await provider.buildRoute(body.origin, body.destination);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Invalid JSON body" } },
        { status: 400 }
      );
    }

    if (error instanceof RoutingError) {
      let status = 500;
      if (error.code === "INVALID_COORDINATES") status = 400;
      if (error.code === "ROUTE_NOT_FOUND") status = 404;
      if (error.code === "PROVIDER_ERROR") {
        status = error.message.includes("rate limit") ? 429 : 502; // Map auth error to 502 to avoid exposing client
      }
      if (error.code === "UPSTREAM_ERROR") status = 502;

      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status }
      );
    }

    console.error("Unhandled routing error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
