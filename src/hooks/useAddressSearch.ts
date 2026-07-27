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

export function useAddressSearch({
  query,
  locale = "hy",
  minChars = 3,
  debounceMs = 450,
}: UseAddressSearchOptions) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isConfigured = isGeoapifyConfigured();

  const trimmed = query.trim();
  const isSearchable = isConfigured && trimmed.length >= minChars;

  useEffect(() => {
    if (!isSearchable) {
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
        const results = await autocompleteAddress(trimmed, {
          signal: abortController.signal,
          lang: locale,
          limit: 6,
        });

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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [trimmed, isSearchable, locale, debounceMs]);

  const selectSuggestion = useCallback((suggestion: AddressSuggestion) => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    return suggestion;
  }, []);

  const closeSuggestions = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  return {
    suggestions: isSearchable ? suggestions : [],
    isLoading: isSearchable ? isLoading : false,
    isOpen: isSearchable ? isOpen : false,
    setIsOpen,
    highlightedIndex: isSearchable ? highlightedIndex : -1,
    setHighlightedIndex,
    hasSearched: isSearchable ? hasSearched : false,
    error,
    isConfigured,
    selectSuggestion,
    closeSuggestions,
  };
}
