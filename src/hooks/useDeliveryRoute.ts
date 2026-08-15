import { useState, useRef, useCallback } from "react";
import { FACTORY_COORDINATES, isWithinArmenia, calculateDistanceKm } from "@/lib/maps/coordinates";
import { calculateDrivingRoute } from "@/lib/maps/geoapify/routing";
import { isGeoapifyConfigured } from "@/lib/maps/geoapify/client";
import { computeDeliveryPrice, type DeliveryPricingResult } from "@/lib/maps/delivery-pricing";
import type {
  AddressSuggestion,
  Coordinates,
  DeliveryRoute,
  DeliveryStateStatus,
} from "@/lib/maps/geoapify/types";

export interface UseDeliveryRouteReturn {
  status: DeliveryStateStatus;
  selectedAddress: string;
  selectedSuggestion: AddressSuggestion | null;
  destinationCoords: Coordinates | null;
  route: DeliveryRoute | null;
  pricing: DeliveryPricingResult | null;
  deliveryLocationAdjustedManually: boolean;
  errorMessageKey: string | null;
  isConfigured: boolean;
  setSelectedAddress: (text: string) => void;
  selectSuggestion: (suggestion: AddressSuggestion) => Promise<void>;
  adjustDestinationCoordinates: (coords: Coordinates) => Promise<void>;
  clearRoute: () => void;
  invalidateRoute: () => void;
  resetAll: () => void;
}

export interface UseDeliveryRouteOptions {
  isConcrete?: boolean;
  volumeM3?: number;
}

export function useDeliveryRoute(options?: UseDeliveryRouteOptions): UseDeliveryRouteReturn {
  const isConcrete = !!options?.isConcrete;
  const volumeM3 = options?.volumeM3;
  const [status, setStatus] = useState<DeliveryStateStatus>("idle");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<DeliveryRoute | null>(null);
  const [deliveryLocationAdjustedManually, setDeliveryLocationAdjustedManually] = useState<boolean>(false);
  const [errorMessageKey, setErrorMessageKey] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isConfigured = isGeoapifyConfigured();

  // Derive pricing directly from route, isConcrete, and volumeM3
  const pricing: DeliveryPricingResult | null = route
    ? computeDeliveryPrice(route.distanceKm, isConcrete, volumeM3)
    : null;

  const clearRoute = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus("idle");
    setRoute(null);
    setErrorMessageKey(null);
  }, []);

  const invalidateRoute = useCallback(() => {
    setRoute(null);
    setStatus("idle");
    setErrorMessageKey(null);
  }, []);

  const resetAll = useCallback(() => {
    clearRoute();
    setSelectedAddress("");
    setSelectedSuggestion(null);
    setDestinationCoords(null);
    setDeliveryLocationAdjustedManually(false);
  }, [clearRoute]);

  const executeRouteCalculation = useCallback(
    async (dest: Coordinates) => {
      if (!isWithinArmenia(dest)) {
        setStatus("error");
        setErrorMessageKey("addressOutsideArmenia");
        setRoute(null);
        return;
      }

      if (!isConfigured) {
        const distKm = Math.max(1, calculateDistanceKm(FACTORY_COORDINATES, dest));
        const durMins = Math.round((distKm / 45) * 60);
        setRoute({
          distanceMeters: Math.round(distKm * 1000),
          distanceKm: distKm,
          durationSeconds: durMins * 60,
          durationMinutes: durMins,
          geometry: [
            [FACTORY_COORDINATES.lat, FACTORY_COORDINATES.lon],
            [dest.lat, dest.lon],
          ],
        });
        setStatus("routeReady");
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setStatus("buildingRoute");
      setErrorMessageKey(null);

      if (typeof window !== "undefined") {
        console.log("[Routing] Started Calculation:", {
          origin: FACTORY_COORDINATES,
          destination: dest,
          provider: isConfigured ? "Geoapify" : "Fallback Straight Line",
        });
      }

      try {
        const routeResult = await calculateDrivingRoute(
          FACTORY_COORDINATES,
          dest,
          { signal: abortController.signal }
        );

        if (abortController.signal.aborted) return;

        if (routeResult.distanceKm > 500) {
          setStatus("error");
          setErrorMessageKey("addressOutsideArmenia");
          setRoute(null);
          return;
        }

        if (typeof window !== "undefined") {
          console.log("[Routing] Succeeded:", {
            origin: FACTORY_COORDINATES,
            destination: dest,
            distanceKm: routeResult.distanceKm,
            durationMinutes: routeResult.durationMinutes,
            provider: "Geoapify",
          });
        }

        setRoute(routeResult);
        setStatus("routeReady");
      } catch (err: unknown) {
        if (abortController.signal.aborted) return;

        console.warn("Geoapify Route Calculation fallback:", err);
        const distKm = Math.max(1, calculateDistanceKm(FACTORY_COORDINATES, dest));
        const durMins = Math.round((distKm / 45) * 60);

        if (typeof window !== "undefined") {
          console.warn("[Routing] Fallback Triggered:", {
            origin: FACTORY_COORDINATES,
            destination: dest,
            distanceKm: distKm,
            provider: "Fallback Straight Line",
            error: err instanceof Error ? err.message : String(err),
          });
        }

        setRoute({
          distanceMeters: Math.round(distKm * 1000),
          distanceKm: distKm,
          durationSeconds: durMins * 60,
          durationMinutes: durMins,
          geometry: [
            [FACTORY_COORDINATES.lat, FACTORY_COORDINATES.lon],
            [dest.lat, dest.lon],
          ],
        });
        setStatus("routeReady");
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [isConfigured]
  );

  const selectSuggestion = useCallback(
    async (suggestion: AddressSuggestion) => {
      setSelectedAddress(suggestion.formatted);
      setSelectedSuggestion(suggestion);
      setDestinationCoords(suggestion.coordinates);
      setDeliveryLocationAdjustedManually(false);
      await executeRouteCalculation(suggestion.coordinates);
    },
    [executeRouteCalculation]
  );

  const adjustDestinationCoordinates = useCallback(
    async (coords: Coordinates) => {
      setDestinationCoords(coords);
      setDeliveryLocationAdjustedManually(true);
      if (selectedSuggestion) {
        setSelectedAddress(
          `${selectedSuggestion.formatted} (📍 Adjusted Location)`
        );
      }
      await executeRouteCalculation(coords);
    },
    [selectedSuggestion, executeRouteCalculation]
  );

  return {
    status,
    selectedAddress,
    selectedSuggestion,
    destinationCoords,
    route,
    pricing,
    deliveryLocationAdjustedManually,
    errorMessageKey,
    isConfigured,
    setSelectedAddress,
    selectSuggestion,
    adjustDestinationCoordinates,
    clearRoute,
    invalidateRoute,
    resetAll,
  };
}
