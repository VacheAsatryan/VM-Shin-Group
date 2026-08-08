import { useState, useEffect, useRef, useCallback } from "react";
import { autocompleteAddress } from "@/lib/maps/geoapify/geocoding";
import { isGeoapifyConfigured } from "@/lib/maps/geoapify/client";
import type { AddressSuggestion } from "@/lib/maps/geoapify/types";

export interface UseAddressSearchOptions {
  query: string;
  locale?: string;
  minChars?: number;
  debounceMs?: number;
}

const ARMENIA_CITY_SUGGESTIONS: AddressSuggestion[] = [
  {
    placeId: "yerevan",
    formatted: "Երևան, Հայաստան (Yerevan, Armenia)",
    coordinates: { lat: 40.1872, lon: 44.5152 },
    addressComponents: { city: "Yerevan", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "gyumri",
    formatted: "Գյումրի, Շիրակի մարզ, Հայաստան (Gyumri)",
    coordinates: { lat: 40.7889, lon: 43.8475 },
    addressComponents: { city: "Gyumri", state: "Shirak", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "vanadzor",
    formatted: "Վանաձոր, Լոռու մարզ, Հայաստան (Vanadzor)",
    coordinates: { lat: 40.8074, lon: 44.4971 },
    addressComponents: { city: "Vanadzor", state: "Lori", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "etchmiadzin",
    formatted: "Վաղարշապատ (Էջմիածին), Արմավիրի մարզ, Հայաստան",
    coordinates: { lat: 40.1654, lon: 44.2939 },
    addressComponents: { city: "Vagharshapat", state: "Armavir", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "armavir",
    formatted: "Արմավիր, Արմավիրի մարզ, Հայաստան (Armavir)",
    coordinates: { lat: 40.1544, lon: 44.0384 },
    addressComponents: { city: "Armavir", state: "Armavir", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "abovyan",
    formatted: "Աբովյան, Կոտայքի մարզ, Հայաստան (Abovyan)",
    coordinates: { lat: 40.2736, lon: 44.6292 },
    addressComponents: { city: "Abovyan", state: "Kotayk", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "hrazdan",
    formatted: "Հրազդան, Կոտայքի մարզ, Հայաստան (Hrazdan)",
    coordinates: { lat: 40.5003, lon: 44.7661 },
    addressComponents: { city: "Hrazdan", state: "Kotayk", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "artashat",
    formatted: "Արտաշատ, Արարատի մարզ, Հայաստան (Artashat)",
    coordinates: { lat: 39.9614, lon: 44.5444 },
    addressComponents: { city: "Artashat", state: "Ararat", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "ashtarak",
    formatted: "Աշտարակ, Արագածոտնի մարզ, Հայաստան (Ashtarak)",
    coordinates: { lat: 40.2986, lon: 44.3622 },
    addressComponents: { city: "Ashtarak", state: "Aragatsotn", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "sevan",
    formatted: "Սևան, Գեղարքունիքի մարզ, Հայաստան (Sevan)",
    coordinates: { lat: 40.5547, lon: 44.9547 },
    addressComponents: { city: "Sevan", state: "Gegharkunik", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "dilijan",
    formatted: "Դիլիջան, Տավուշի մարզ, Հայաստան (Dilijan)",
    coordinates: { lat: 40.7414, lon: 44.8636 },
    addressComponents: { city: "Dilijan", state: "Tavush", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "ijevan",
    formatted: "Իջևան, Տավուշի մարզ, Հայաստան (Ijevan)",
    coordinates: { lat: 40.8789, lon: 45.1483 },
    addressComponents: { city: "Ijevan", state: "Tavush", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "kapan",
    formatted: "Կապան, Սյունիքի մարզ, Հայաստան (Kapan)",
    coordinates: { lat: 39.2074, lon: 46.4064 },
    addressComponents: { city: "Kapan", state: "Syunik", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "goris",
    formatted: "Գորիս, Սյունիքի մարզ, Հայաստան (Goris)",
    coordinates: { lat: 39.5089, lon: 46.3389 },
    addressComponents: { city: "Goris", state: "Syunik", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "masis",
    formatted: "Մասիս, Արարատի մարզ, Հայաստան (Masis)",
    coordinates: { lat: 40.0683, lon: 44.4367 },
    addressComponents: { city: "Masis", state: "Ararat", country: "Armenia" },
    source: "fallback",
  },
  {
    placeId: "metsamor",
    formatted: "Մեծամոր, Արմավիրի մարզ, Հայաստան (Metsamor)",
    coordinates: { lat: 40.1417, lon: 44.1167 },
    addressComponents: { city: "Metsamor", state: "Armavir", country: "Armenia" },
    source: "fallback",
  },
];

function searchFallbackCities(query: string): AddressSuggestion[] {
  const norm = query.toLowerCase();
  return ARMENIA_CITY_SUGGESTIONS.filter((item) =>
    item.formatted.toLowerCase().includes(norm)
  );
}

export function useAddressSearch({
  query,
  locale = "hy",
  minChars = 2,
  debounceMs = 300,
}: UseAddressSearchOptions) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isConfigured = isGeoapifyConfigured();
  const safeQuery = typeof query === "string" ? query : "";
  const trimmed = safeQuery.trim();
  const isSearchable = trimmed.length >= minChars;

  useEffect(() => {
    if (!isSearchable) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        let results: AddressSuggestion[] = [];

        if (isConfigured) {
          try {
            results = await autocompleteAddress(trimmed, {
              signal: abortController.signal,
              lang: locale,
              limit: 6,
            });
          } catch {
            results = searchFallbackCities(trimmed);
          }
        } else {
          results = searchFallbackCities(trimmed);
        }

        if (abortController.signal.aborted) return;

        setSuggestions(results);
        setIsOpen(results.length > 0);
        setHighlightedIndex(-1);
        setHasSearched(true);
      } catch (err) {
        if (abortController.signal.aborted) return;
        setSuggestions([]);
        setIsOpen(false);
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [trimmed, isSearchable, isConfigured, locale, debounceMs]);

  const selectSuggestion = useCallback((suggestion: AddressSuggestion) => {
    setIsOpen(false);
    setSuggestions([]);
    return suggestion;
  }, []);

  const closeSuggestions = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    suggestions,
    isLoading,
    isOpen,
    setIsOpen,
    highlightedIndex,
    setHighlightedIndex,
    hasSearched,
    error,
    selectSuggestion,
    closeSuggestions,
  };
}
