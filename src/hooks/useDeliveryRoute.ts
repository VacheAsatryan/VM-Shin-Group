import { useState, useRef, useCallback, useEffect } from "react";
import { FACTORY_ORIGIN } from "@/config/delivery";
import type { MapRouteEstimate } from "@/lib/maps/mapProvider.types";
import { buildRoute } from "@/lib/routing/client/buildRoute";
import type { Coordinates } from "@/lib/routing/types";
import { VM_SHIN_GROUP_FACTORY_COORDINATES } from "@/lib/maps/mapConstants";

export type RouteStatus = "idle" | "selectingOnMap" | "buildingRoute" | "ready" | "error";

export interface UseDeliveryRouteResult {
  status: RouteStatus;
  routeEstimate: MapRouteEstimate | null;
  routeGeometry: Coordinates[] | null;
  destinationCoords: Coordinates | null;
  destinationAddress: string | null;
  startMapSelection: (address: string) => void;
  confirmCoordinates: (coords: Coordinates) => void;
  clearRoute: () => void;
  errorMessageKey?: string;
}

export function useDeliveryRoute(isMapAvailable: boolean): UseDeliveryRouteResult {
  const [status, setStatus] = useState<RouteStatus>("idle");
  const [routeEstimate, setRouteEstimate] = useState<MapRouteEstimate | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<Coordinates[] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<string | null>(null);
  const [errorMessageKey, setErrorMessageKey] = useState<string | undefined>(undefined);

  const abortControllerRef = useRef<AbortController | null>(null);

  const clearRoute = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus("idle");
    setRouteEstimate(null);
    setRouteGeometry(null);
    setDestinationCoords(null);
    setDestinationAddress(null);
    setErrorMessageKey(undefined);
  }, []);

  const startMapSelection = useCallback((address: string) => {
    if (!isMapAvailable || !address.trim()) {
      clearRoute();
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setDestinationAddress(address);
    setDestinationCoords(null);
    setRouteGeometry(null);
    setRouteEstimate(null);
    setErrorMessageKey(undefined);
    setStatus("selectingOnMap");
  }, [isMapAvailable, clearRoute]);

  const confirmCoordinates = useCallback(async (coords: Coordinates) => {
    if (!destinationAddress) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setErrorMessageKey(undefined);
    setDestinationCoords(coords);
    setStatus("buildingRoute");

    try {
      const origin: Coordinates = {
        latitude: VM_SHIN_GROUP_FACTORY_COORDINATES[0],
        longitude: VM_SHIN_GROUP_FACTORY_COORDINATES[1]
      };

      const result = await buildRoute({
        origin,
        destination: coords,
        signal: abortController.signal
      });

      if (abortController.signal.aborted) return;

      if (result.distanceKm > 500) {
        throw new Error("Route distance exceeds maximum allowed limit for local delivery (500km)");
      }

      setRouteGeometry(result.geometry);
      
      setRouteEstimate({
        origin: FACTORY_ORIGIN,
        destinationAddress,
        distanceKm: result.distanceKm,
        estimatedDurationMinutes: Math.round((result.durationSeconds || 0) / 60),
        isAvailable: true,
      });

      setStatus("ready");
    } catch (err: unknown) {
      if (abortController.signal.aborted) return;
      
      console.warn("Route build failed:", err);
      setStatus("error");
      setRouteGeometry(null);
      setRouteEstimate(null);
      
      if (err instanceof Error && err.message.includes("exceeds maximum allowed limit")) {
        setErrorMessageKey("addressResolveFailed");
      } else {
        setErrorMessageKey("routeBuildFailed");
      }
    }
  }, [destinationAddress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    status,
    routeEstimate,
    routeGeometry,
    destinationCoords,
    destinationAddress,
    startMapSelection,
    confirmCoordinates,
    clearRoute,
    errorMessageKey,
  };
}
