import { fetchGeoapifyJson } from "./client";
import { normalizeAddressSuggestions } from "./normalize";
import type { AddressSuggestion } from "./types";

export interface GeocodeAutocompleteOptions {
  signal?: AbortSignal;
  lang?: string;
  limit?: number;
}

export async function autocompleteAddress(
  text: string,
  options?: GeocodeAutocompleteOptions
): Promise<AddressSuggestion[]> {
  const query = text.trim();
  if (query.length < 3) {
    return [];
  }

  const limit = options?.limit || 6;
  const lang = options?.lang || "hy";

  const params: Record<string, string> = {
    text: query,
    filter: "countrycode:am",
    bias: "countrycode:am",
    limit: limit.toString(),
    lang,
  };

  const response = await fetchGeoapifyJson<unknown>(
    "/geocode/autocomplete",
    params,
    options?.signal
  );

  return normalizeAddressSuggestions(response);
}
