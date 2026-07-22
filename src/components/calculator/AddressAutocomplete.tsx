"use client";

import { useState, useEffect, useRef, useCallback, KeyboardEvent, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import type { AddressSuggestion } from "@/lib/maps/addressProvider.types";
import { yandexAddressProvider } from "@/lib/maps/yandexAddressProvider";

interface AddressAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (suggestion: AddressSuggestion) => void;
  onInvalidateAddress: () => void;
  isMapAvailable: boolean;
}

export default function AddressAutocomplete({
  value,
  onChangeText,
  onSelectSuggestion,
  onInvalidateAddress,
  isMapAvailable,
}: AddressAutocompleteProps) {
  const t = useTranslations("calculator.delivery");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Debounced Suggestion Fetching
  const fetchSuggestionsDebounced = useCallback(
    async (query: string) => {
      if (!isMapAvailable || query.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const results = await yandexAddressProvider.fetchSuggestions(query);
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setHighlightedIndex(-1);
      } catch (err) {
        console.warn("Autocomplete fetch error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isMapAvailable]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim().length >= 2) {
        fetchSuggestionsDebounced(value);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, fetchSuggestionsDebounced]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChangeText(text);
    onInvalidateAddress();
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChangeText(suggestion.label);
    onSelectSuggestion(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full flex flex-col gap-1">
      <label
        htmlFor="address-autocomplete-input"
        className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase"
      >
        {t("destinationLabel")}
      </label>

      <div className="relative flex items-center">
        {/* Search / Location Icon */}
        <span className="absolute left-3.5 text-text-secondary pointer-events-none text-sm">
          📍
        </span>

        <input
          id="address-autocomplete-input"
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="autocomplete-suggestions-list"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t("autocompletePlaceholder")}
          className="w-full bg-background/90 text-text-primary text-sm font-semibold rounded-lg pl-10 pr-10 py-3 border border-white/10 focus:border-primary-yellow/60 focus:ring-1 focus:ring-primary-yellow/40 outline-none transition-all duration-200"
        />

        {/* Loading Spinner */}
        {isLoading && (
          <span className="absolute right-3.5 text-primary-yellow text-xs animate-spin" aria-hidden="true">
            ⚙
          </span>
        )}
      </div>

      {/* Dropdown Suggestions Menu */}
      {isOpen && (
        <ul
          id="autocomplete-suggestions-list"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl bg-surface-elevated/95 border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <li
                key={suggestion.id}
                role="option"
                aria-selected={isHighlighted}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-4 py-3 cursor-pointer text-xs transition-colors flex flex-col border-b border-white/5 last:border-b-0 ${
                  isHighlighted ? "bg-primary-yellow/15 text-primary-yellow font-bold" : "text-text-primary hover:bg-white/5"
                }`}
              >
                <span className="font-semibold">{suggestion.label}</span>
                {suggestion.subtitle && (
                  <span className="text-[10px] text-text-secondary">{suggestion.subtitle}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* No Suggestions State */}
      {hasSearched && !isLoading && value.trim().length >= 2 && suggestions.length === 0 && isMapAvailable && (
        <p className="text-[11px] text-text-secondary font-mono pt-1">
          ℹ {t("noSuggestionsFound")}
        </p>
      )}

      {/* Map Unavailable State Notice */}
      {!isMapAvailable && (
        <p className="text-[11px] text-primary-yellow/80 font-mono pt-1">
          ℹ {t("mapUnavailable")}
        </p>
      )}
    </div>
  );
}
