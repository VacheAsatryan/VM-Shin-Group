import type { AddressProvider, AddressSuggestion } from "./addressProvider.types";
import { unavailableAddressProvider } from "./unavailableAddressProvider";

export class YandexAddressProvider implements AddressProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || "";
  }

  public get isApiKeyAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async fetchSuggestions(query: string): Promise<AddressSuggestion[]> {
    if (!this.isApiKeyAvailable || !query || query.trim().length < 2) {
      return unavailableAddressProvider.fetchSuggestions(query);
    }

    if (typeof window === "undefined" || !window.ymaps || !window.ymaps.suggest) {
      return unavailableAddressProvider.fetchSuggestions(query);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawResults: any[] = await window.ymaps.suggest(query, {
        results: 5,
        boundedBy: [
          [38.8, 43.4],
          [41.3, 46.6],
        ], // Armenia bounding box constraint
      });

      return rawResults.map((item, idx) => ({
        id: `yandex-suggest-${idx}-${item.value}`,
        label: item.displayName || item.value,
        subtitle: item.value !== item.displayName ? item.value : undefined,
      }));
    } catch (err) {
      console.warn("Yandex address suggest error:", err);
      return [];
    }
  }
}

export const yandexAddressProvider = new YandexAddressProvider();
