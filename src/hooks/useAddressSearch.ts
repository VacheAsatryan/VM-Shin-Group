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
    id: "yerevan",
    formatted: "Երևան, Հայաստան (Yerevan, Armenia)",
    coordinates: { lat: 40.1872, lon: 44.5152 },
    city: "Yerevan",
    country: "Armenia",
  },
  {
    id: "gyumri",
    formatted: "Գյումրի, Շիրակի մարզ, Հայաստան (Gyumri)",
    coordinates: { lat: 40.7889, lon: 43.8475 },
    city: "Gyumri",
    region: "Shirak",
    country: "Armenia",
  },
  {
    id: "vanadzor",
    formatted: "Վանաձոր, Լոռու մարզ, Հայաստան (Vanadzor)",
    coordinates: { lat: 40.8074, lon: 44.4971 },
    city: "Vanadzor",
    region: "Lori",
    country: "Armenia",
  },
  {
    id: "etchmiadzin",
    formatted: "Վաղարշապատ (Էջմիածին), Արմավիրի մարզ, Հայաստան",
    coordinates: { lat: 40.1654, lon: 44.2939 },
    city: "Vagharshapat",
    region: "Armavir",
    country: "Armenia",
  },
  {
    id: "armavir",
    formatted: "Արմավիր, Արմավիրի մարզ, Հայաստան (Armavir)",
    coordinates: { lat: 40.1544, lon: 44.0384 },
    city: "Armavir",
    region: "Armavir",
    country: "Armenia",
  },
  {
    id: "abovyan",
    formatted: "Աբովյան, Կոտայքի մարզ, Հայաստան (Abovyan)",
    coordinates: { lat: 40.2736, lon: 44.6292 },
    city: "Abovyan",
    region: "Kotayk",
    country: "Armenia",
  },
  {
    id: "hrazdan",
    formatted: "Հրազդան, Կոտայքի մարզ, Հայաստան (Hrazdan)",
    coordinates: { lat: 40.5003, lon: 44.7661 },
    city: "Hrazdan",
    region: "Kotayk",
    country: "Armenia",
  },
  {
    id: "artashat",
    formatted: "Արտաշատ, Արարատի մարզ, Հայաստան (Artashat)",
    coordinates: { lat: 39.9614, lon: 44.5444 },
    city: "Artashat",
    region: "Ararat",
    country: "Armenia",
  },
  {
    id: "ashtarak",
    formatted: "Աշտարակ, Արագածոտնի մարզ, Հայաստան (Ashtarak)",
    coordinates: { lat: 40.2986, lon: 44.3622 },
    city: "Ashtarak",
    region: "Aragatsotn",
    country: "Armenia",
  },
  {
    id: "sevan",
    formatted: "Սևան, Գեղարքունիքի մարզ, Հայաստան (Sevan)",
    coordinates: { lat: 40.5547, lon: 44.9547 },
    city: "Sevan",
    region: "Gegharkunik",
    country: "Armenia",
  },
  {
    id: "dilijan",
    formatted: "Դիլիջան, Տավուշի մարզ, Հայաստան (Dilijan)",
    coordinates: { lat: 40.7414, lon: 44.8636 },
    city: "Dilijan",
    region: "Tavush",
    country: "Armenia",
  },
  {
    id: "ijevan",
    formatted: "Իջևան, Տավուշի մարզ, Հայաստան (Ijevan)",
    coordinates: { lat: 40.8789, lon: 45.1483 },
    city: "Ijevan",
    region: "Tavush",
    country: "Armenia",
  },
  {
    id: "kapan",
    formatted: "Կապան, Սյունիքի մարզ, Հայաստան (Kapan)",
    coordinates: { lat: 39.2074, lon: 46.4064 },
    city: "Kapan",
    region: "Syunik",
    country: "Armenia",
  },
  {
    id: "goris",
    formatted: "Գորիս, Սյունիքի մարզ, Հայաստան (Goris)",
    coordinates: { lat: 39.5089, lon: 46.3389 },
    city: "Goris",
    region: "Syunik",
    country: "Armenia",
  },
  {
    id: "masis",
    formatted: "Մասիս, Արարատի մարզ, Հայաստան (Masis)",
    coordinates: { lat: 40.0683, lon: 44.4367 },
    city: "Masis",
    region: "Ararat",
    country: "Armenia",
  },
  {
    id: "metsamor",
    formatted: "Մեծամոր, Արմավիրի մարզ, Հայաստան (Metsamor)",
    coordinates: { lat: 40.1417, lon: 44.1167 },
    city: "Metsamor",
    region: "Armavir",
    country: "Armenia",
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
  const latestQueryRef = useRef<string>("");
  const isConfigured = isGeoapifyConfigured();
  const safeQuery = typeof query === "string" ? query : "";
  const trimmed = safeQuery.trim();
  const isSearchable = trimmed.length >= minChars;

  useEffect(() => {
    if (!isSearchable) {
      const resetTimer = setTimeout(() => {
        setSuggestions([]);
        setIsOpen(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const timer = setTimeout(async () => {
      const requestId = Math.random().toString(36).substring(2, 9);
      latestQueryRef.current = trimmed;

      if (typeof window !== "undefined") {
        console.log("[AddressSearch] Request Details:", {
          query: trimmed,
          requestId,
          provider: isConfigured ? "Geoapify" : "Fallback Offline List",
        });
      }

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
        if (trimmed !== latestQueryRef.current) return;

        if (typeof window !== "undefined") {
          console.log("[AddressSearch] Response Succeeded:", {
            query: trimmed,
            requestId,
            responseCount: results.length,
            provider: isConfigured ? "Geoapify" : "Fallback Offline List",
          });
        }

        setSuggestions(results);
        setIsOpen(results.length > 0);
        setHighlightedIndex(-1);
        setHasSearched(true);
      } catch (err) {
        if (abortController.signal.aborted) return;
        if (trimmed !== latestQueryRef.current) return;
        setSuggestions([]);
        setIsOpen(false);
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!abortController.signal.aborted && trimmed === latestQueryRef.current) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [trimmed, isSearchable, isConfigured, locale, debounceMs, minChars]);

  const selectSuggestion = useCallback((suggestion: AddressSuggestion) => {
    if (typeof window !== "undefined") {
      console.log("[AddressSearch] Selected:", {
        label: suggestion.formatted,
        lat: suggestion.coordinates?.lat,
        lon: suggestion.coordinates?.lon,
      });
    }
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
