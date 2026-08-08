"use client";

import { useRef, useEffect, KeyboardEvent, ChangeEvent, useState, PointerEvent } from "react";
import { createPortal } from "react-dom";
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownContainerRef = useRef<HTMLDivElement | null>(null);

  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  // Pointer position tracking to distinguish scrolling from clicking/tapping
  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);

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

  const shouldShow = isOpen && suggestions.length > 0;

  // Setup Portal Container
  useEffect(() => {
    const div = document.createElement("div");
    div.id = "delivery-address-search-portal";
    document.body.appendChild(div);
    
    // Set state asynchronously to avoid synchronous effect setState cascading warning
    const timer = setTimeout(() => {
      setPortalContainer(div);
    }, 0);

    return () => {
      clearTimeout(timer);
      if (div.parentNode) {
        div.parentNode.removeChild(div);
      }
    };
  }, []);

  // Click / Touch Outside Handler (including checking the portal container)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      if (dropdownContainerRef.current && dropdownContainerRef.current.contains(target)) {
        return;
      }
      closeSuggestions();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [closeSuggestions]);

  // Recalculate dropdown coordinates relative to the input box and visualViewport bounds
  useEffect(() => {
    const inputElement = inputRef.current;
    if (!shouldShow || !inputElement) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      const inputRect = inputElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      const inputDocTop = inputRect.top + scrollTop;
      const inputDocBottom = inputRect.bottom + scrollTop;
      const inputDocLeft = inputRect.left + scrollLeft;

      // Track iOS visualViewport pageTop and height to avoid getting covered by the keyboard
      const vvTop = window.visualViewport ? window.visualViewport.pageTop : scrollTop;
      const vvHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const vvBottom = vvTop + vvHeight;

      const spaceBelow = vvBottom - inputDocBottom;
      const spaceAbove = inputDocTop - vvTop;

      const minSpaceNeeded = 220; // Safe height threshold
      let openUpward = false;

      if (spaceBelow < minSpaceNeeded && spaceAbove > spaceBelow) {
        openUpward = true;
      }

      if (openUpward) {
        const allowedMaxHeight = Math.max(120, spaceAbove - 15);
        setCoords({
          bottom: document.documentElement.scrollHeight - inputDocTop + 4,
          left: inputDocLeft,
          width: inputRect.width,
          maxHeight: allowedMaxHeight,
        });
      } else {
        const allowedMaxHeight = Math.max(120, spaceBelow - 15);
        setCoords({
          top: inputDocBottom + 4,
          left: inputDocLeft,
          width: inputRect.width,
          maxHeight: allowedMaxHeight,
        });
      }
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updatePosition);
      window.visualViewport.addEventListener("scroll", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updatePosition);
        window.visualViewport.removeEventListener("scroll", updatePosition);
      }
    };
  }, [shouldShow, suggestions]);



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

  const handlePointerDown = (e: PointerEvent<HTMLLIElement>) => {
    pointerStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: PointerEvent<HTMLLIElement>, suggestion: AddressSuggestion) => {
    if (!pointerStartPos.current) return;
    const diffX = Math.abs(e.clientX - pointerStartPos.current.x);
    const diffY = Math.abs(e.clientY - pointerStartPos.current.y);

    // If displacement is less than 10 pixels, trigger selection and prevent input blur issues
    if (diffX < 10 && diffY < 10) {
      e.preventDefault();
      handleSelect(suggestion);
    }
    pointerStartPos.current = null;
  };

  const getDropdownStyle = (): React.CSSProperties => {
    if (!coords) return { display: "none" };
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${coords.left}px`,
      width: `${coords.width}px`,
      maxHeight: `${coords.maxHeight}px`,
      zIndex: 99999,
    };

    if (coords.bottom !== undefined) {
      return {
        ...baseStyle,
        bottom: `${coords.bottom}px`,
        top: "auto",
      };
    }

    return {
      ...baseStyle,
      top: `${coords.top}px`,
      bottom: "auto",
    };
  };

  return (
    <div ref={containerRef} className="relative z-30 w-full flex flex-col gap-1.5">
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
          ref={inputRef}
          id="delivery-address-search-input"
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="delivery-address-suggestions-list"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
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

      {shouldShow && portalContainer && createPortal(
        <div
          ref={dropdownContainerRef}
          style={getDropdownStyle()}
          className="rounded-xl bg-surface-elevated border border-gold-border shadow-2xl overflow-hidden flex flex-col"
        >
          <ul
            id="delivery-address-suggestions-list"
            role="listbox"
            className="w-full overflow-y-auto"
            style={{ maxHeight: coords ? coords.maxHeight : "auto" }}
          >
            {suggestions.map((suggestion, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <li
                  key={suggestion.id || index}
                  role="option"
                  aria-selected={isHighlighted}
                  onPointerDown={handlePointerDown}
                  onPointerUp={(e) => handlePointerUp(e, suggestion)}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelect(suggestion);
                  }}
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
        </div>,
        portalContainer
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
