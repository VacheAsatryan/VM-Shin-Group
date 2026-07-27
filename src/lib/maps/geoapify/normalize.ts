import type { AddressSuggestion, DeliveryRoute } from "./types";

interface RawGeoapifyFeature {
  properties?: {
    place_id?: string;
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    district?: string;
    state?: string;
    region?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  geometry?: {
    coordinates?: [number, number];
  };
}

interface RawGeoapifyAutocompleteResponse {
  features?: RawGeoapifyFeature[];
}

export function normalizeAddressSuggestions(
  response: unknown
): AddressSuggestion[] {
  if (!response || typeof response !== "object") {
    return [];
  }

  const rawData = response as RawGeoapifyAutocompleteResponse;
  if (!Array.isArray(rawData.features)) {
    return [];
  }

  const suggestions: AddressSuggestion[] = [];

  for (let i = 0; i < rawData.features.length; i++) {
    const feature = rawData.features[i];
    if (!feature || !feature.properties) continue;

    const props = feature.properties;

    // Get coordinates from properties or geometry
    let lat = props.lat;
    let lon = props.lon;

    if (
      (lat === undefined || lon === undefined) &&
      feature.geometry?.coordinates &&
      Array.isArray(feature.geometry.coordinates) &&
      feature.geometry.coordinates.length >= 2
    ) {
      lon = feature.geometry.coordinates[0];
      lat = feature.geometry.coordinates[1];
    }

    if (
      typeof lat !== "number" ||
      typeof lon !== "number" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      continue;
    }

    const formatted = props.formatted || props.address_line1 || [props.city, props.country].filter(Boolean).join(", ");
    if (!formatted) continue;

    suggestions.push({
      id: props.place_id || `geoapify-suggestion-${i}-${lat}-${lon}`,
      formatted,
      addressLine1: props.address_line1,
      addressLine2: props.address_line2,
      city: props.city,
      district: props.district,
      region: props.state || props.region,
      country: props.country,
      coordinates: { lat, lon },
    });
  }

  return suggestions;
}

interface RawGeoapifyRoutingFeature {
  properties?: {
    distance?: number; // in meters
    time?: number;     // in seconds
  };
  geometry?: {
    type?: string;
    coordinates?: [number, number][][] | [number, number][]; // MultiLineString or LineString
  };
}

interface RawGeoapifyRoutingResponse {
  features?: RawGeoapifyRoutingFeature[];
}

export function normalizeDeliveryRoute(response: unknown): DeliveryRoute | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const rawData = response as RawGeoapifyRoutingResponse;
  if (!Array.isArray(rawData.features) || rawData.features.length === 0) {
    return null;
  }

  const feature = rawData.features[0];
  if (!feature || !feature.properties || !feature.geometry) {
    return null;
  }

  const distanceMeters = feature.properties.distance || 0;
  const durationSeconds = feature.properties.time || 0;

  if (distanceMeters <= 0) {
    return null;
  }

  const rawCoords = feature.geometry.coordinates;
  const geometry: [number, number][] = [];

  if (Array.isArray(rawCoords) && rawCoords.length > 0) {
    // Check if it's MultiLineString (array of arrays of coordinates) or LineString
    const lineStringCoords = Array.isArray(rawCoords[0]) && Array.isArray((rawCoords[0] as number[])[0])
      ? (rawCoords as [number, number][][]).flat()
      : (rawCoords as [number, number][]);

    for (const point of lineStringCoords) {
      if (Array.isArray(point) && point.length >= 2) {
        const lon = point[0];
        const lat = point[1];
        if (typeof lat === "number" && typeof lon === "number" && Number.isFinite(lat) && Number.isFinite(lon)) {
          geometry.push([lat, lon]);
        }
      }
    }
  }

  const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
  const durationMinutes = Math.round(durationSeconds / 60);

  return {
    distanceMeters,
    distanceKm,
    durationSeconds,
    durationMinutes,
    geometry,
  };
}
