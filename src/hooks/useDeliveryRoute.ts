import { useState, useRef, useCallback, useEffect } from "react";
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
}

export function useDeliveryRoute(options?: UseDeliveryRouteOptions): UseDeliveryRouteReturn {
  const isConcrete = !!options?.isConcrete;
  const [status, setStatus] = useState<DeliveryStateStatus>("idle");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<DeliveryRoute | null>(null);
  const [pricing, setPricing] = useState<DeliveryPricingResult | null>(null);
  const [deliveryLocationAdjustedManually, setDeliveryLocationAdjustedManually] = useState<boolean>(false);
  const [errorMessageKey, setErrorMessageKey] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isConfigured = isGeoapifyConfigured();

  const clearRoute = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus("idle");
    setRoute(null);
    setPricing(null);
    setErrorMessageKey(null);
  }, []);

  const invalidateRoute = useCallback(() => {
    clearRoute();
    setSelectedSuggestion(null);
    setDestinationCoords(null);
    setDeliveryLocationAdjustedManually(false);
  }, [clearRoute]);

  const resetAll = useCallback(() => {
    clearRoute();
    setSelectedAddress("");
    setSelectedSuggestion(null);
    setDestinationCoords(null);
    setDeliveryLocationAdjustedManually(false);
  }, [clearRoute]);

  const updateAddressText = useCallback(
    (text: string) => {
      setSelectedAddress(text);
      if (selectedSuggestion && text !== selectedSuggestion.formatted) {
        invalidateRoute();
      }
    },
    [selectedSuggestion, invalidateRoute]
  );

  const executeRouteCalculation = useCallback(
    async (dest: Coordinates) => {
      if (!isWithinArmenia(dest)) {
        setStatus("error");
        setErrorMessageKey("addressOutsideArmenia");
        setRoute(null);
        setPricing(null);
        return;
      }

      if (!isConfigured) {
        const distKm = Math.max(1, calculateDistanceKm(FACTORY_COORDINATES, dest));
        const pricingResult = computeDeliveryPrice(distKm, isConcrete);
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
        setPricing(pricingResult);
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
          setPricing(null);
          return;
        }

        const pricingResult = computeDeliveryPrice(routeResult.distanceKm, isConcrete);

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
        setPricing(pricingResult);
        setStatus("routeReady");
      } catch (err: unknown) {
        if (abortController.signal.aborted) return;

        console.warn("Geoapify Route Calculation fallback:", err);
        const distKm = Math.max(1, calculateDistanceKm(FACTORY_COORDINATES, dest));
        const pricingResult = computeDeliveryPrice(distKm, isConcrete);
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
        setPricing(pricingResult);
        setStatus("routeReady");
      }
    },
    [isConfigured, isConcrete]
  );

  const selectSuggestion = useCallback(
    async (suggestion: AddressSuggestion) => {
      if (!suggestion || !suggestion.coordinates) return;
      
      const coords = suggestion.coordinates;
      if (typeof coords.lat !== "number" || typeof coords.lon !== "number" || isNaN(coords.lat) || isNaN(coords.lon)) {
        return;
      }

      setSelectedSuggestion(suggestion);
      setSelectedAddress(suggestion.formatted || "");
      setDestinationCoords(coords);
      setDeliveryLocationAdjustedManually(false);
      setStatus("addressSelected");

      await executeRouteCalculation(coords);
    },
    [executeRouteCalculation]
  );

  const adjustDestinationCoordinates = useCallback(
    async (newCoords: Coordinates) => {
      if (!newCoords || typeof newCoords.lat !== "number" || typeof newCoords.lon !== "number" || isNaN(newCoords.lat) || isNaN(newCoords.lon)) {
        return;
      }

      setDestinationCoords(newCoords);
      setDeliveryLocationAdjustedManually(true);

      await executeRouteCalculation(newCoords);
    },
    [executeRouteCalculation]
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
    setSelectedAddress: updateAddressText,
    selectSuggestion,
    adjustDestinationCoordinates,
    clearRoute,
    invalidateRoute,
    resetAll,
  };
}
