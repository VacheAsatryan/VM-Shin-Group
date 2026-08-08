"use client";

import { useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import type { AddressSuggestion } from "@/lib/maps/geoapify/types";

interface DeliveryAddressSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (suggestion: AddressSuggestion) => void;
  onInvalidateAddress: () => void;
  isConfigured: boolean;
  locale?: string;
}

export default function DeliveryAddressSearch({
  value = "",
  onChangeText,
  onSelectSuggestion,
  onInvalidateAddress,
  isConfigured,
  locale = "hy",
}: DeliveryAddressSearchProps) {
  const t = useTranslations("calculator.delivery");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    suggestions,
    isLoading,
    isOpen,
    setIsOpen,
    highlightedIndex,
    setHighlightedIndex,
    hasSearched,
    selectSuggestion,
    closeSuggestions,
  } = useAddressSearch({ query: value, locale });

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSuggestions();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeSuggestions]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChangeText(text);
    onInvalidateAddress();
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    const selected = selectSuggestion(suggestion);
    onSelectSuggestion(selected);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(highlightedIndex < suggestions.length - 1 ? highlightedIndex + 1 : 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(highlightedIndex > 0 ? highlightedIndex - 1 : suggestions.length - 1);
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      closeSuggestions();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full flex flex-col gap-1.5">
      <label
        htmlFor="delivery-address-search-input"
        className="text-xs font-mono font-semibold tracking-wider text-text-secondary uppercase"
      >
        {t("destinationLabel")}
      </label>

      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-text-secondary pointer-events-none text-sm">
          📍
        </span>

        <input
          id="delivery-address-search-input"
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="delivery-address-suggestions-list"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t("autocompletePlaceholder")}
          className="w-full bg-background/90 text-text-primary text-sm font-semibold rounded-lg pl-10 pr-10 py-3 border border-gold-border focus:border-primary-yellow/60 focus:ring-1 focus:ring-primary-yellow/40 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {isLoading && (
          <span className="absolute right-3.5 text-primary-yellow text-xs animate-spin" aria-hidden="true">
            ⚙
          </span>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          id="delivery-address-suggestions-list"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl bg-surface-elevated/95 border border-gold-border shadow-2xl backdrop-blur-md overflow-hidden max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <li
                key={suggestion.placeId || suggestion.id || index}
                role="option"
                aria-selected={isHighlighted}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(suggestion);
                }}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-4 py-3 cursor-pointer text-xs transition-colors flex flex-col border-b border-gold-border/30 last:border-b-0 ${
                  isHighlighted
                    ? "bg-primary-yellow/15 text-primary-yellow font-bold"
                    : "text-text-primary hover:bg-white/5"
                }`}
              >
                <span className="font-semibold">{suggestion.formatted}</span>
                {suggestion.city && suggestion.city !== suggestion.formatted && (
                  <span className="text-[10px] text-text-secondary">
                    {[suggestion.district, suggestion.city, suggestion.region, suggestion.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Empty Search Results State */}
      {hasSearched && !isLoading && value.trim().length >= 3 && suggestions.length === 0 && isConfigured && (
        <p className="text-[11px] text-text-secondary font-mono pt-1">
          ℹ {t("noSuggestionsFound")}
        </p>
      )}
    </div>
  );
}
