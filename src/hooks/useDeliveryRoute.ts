import { useState, useRef, useCallback, useEffect } from "react";
import { FACTORY_COORDINATES, isWithinArmenia } from "@/lib/maps/coordinates";
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

export function useDeliveryRoute(): UseDeliveryRouteReturn {
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
      if (route !== null || destinationCoords !== null) {
        invalidateRoute();
      }
    },
    [route, destinationCoords, invalidateRoute]
  );

  const executeRouteCalculation = useCallback(
    async (dest: Coordinates) => {
      if (!isConfigured) {
        setStatus("error");
        setErrorMessageKey("serviceNotConfigured");
        return;
      }

      if (!isWithinArmenia(dest)) {
        setStatus("error");
        setErrorMessageKey("addressOutsideArmenia");
        setRoute(null);
        setPricing(null);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setStatus("buildingRoute");
      setErrorMessageKey(null);

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

        const pricingResult = computeDeliveryPrice(routeResult.distanceKm);

        setRoute(routeResult);
        setPricing(pricingResult);
        setStatus("routeReady");
      } catch (err: unknown) {
        if (abortController.signal.aborted) return;

        console.warn("Geoapify Route Calculation failed:", err);
        setStatus("error");
        setRoute(null);
        setPricing(null);
        setErrorMessageKey("routeBuildFailed");
      }
    },
    [isConfigured]
  );

  const selectSuggestion = useCallback(
    async (suggestion: AddressSuggestion) => {
      setSelectedSuggestion(suggestion);
      setSelectedAddress(suggestion.formatted);
      setDestinationCoords(suggestion.coordinates);
      setDeliveryLocationAdjustedManually(false);
      setStatus("addressSelected");

      await executeRouteCalculation(suggestion.coordinates);
    },
    [executeRouteCalculation]
  );

  const adjustDestinationCoordinates = useCallback(
    async (newCoords: Coordinates) => {
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
