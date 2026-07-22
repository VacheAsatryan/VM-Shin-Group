import type { AddressProvider, AddressSuggestion } from "./addressProvider.types";

export class UnavailableAddressProvider implements AddressProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchSuggestions(_query: string): Promise<AddressSuggestion[]> {
    return [];
  }
}

export const unavailableAddressProvider = new UnavailableAddressProvider();
