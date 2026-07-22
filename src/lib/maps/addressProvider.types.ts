export interface AddressSuggestion {
  id: string;
  label: string;
  subtitle?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AddressProvider {
  fetchSuggestions(query: string): Promise<AddressSuggestion[]>;
}
