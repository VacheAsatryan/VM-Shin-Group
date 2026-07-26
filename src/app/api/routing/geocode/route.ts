import { NextResponse } from "next/server";

interface GeocodeRequestPayload {
  query: string;
  locale?: "hy" | "ru" | "en";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body as GeocodeRequestPayload;

    if (!payload.query || typeof payload.query !== "string") {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Query string is required" } },
        { status: 400 }
      );
    }

    const query = payload.query.trim();
    if (query.length === 0) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Query cannot be empty" } },
        { status: 400 }
      );
    }

    if (query.length > 300) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Query is too long" } },
        { status: 400 }
      );
    }

    const apiKey = process.env.GRAPHHOPPER_API_KEY;
    if (!apiKey) {
      console.error("GRAPHHOPPER_API_KEY is not configured.");
      return NextResponse.json(
        { error: { code: "MISSING_CONFIG", message: "Routing service is misconfigured on the server." } },
        { status: 500 }
      );
    }

    // 1. Keep only safe normalization
    // query: clean spaces
    const cleanQuery = query.replace(/\s+/g, ' ').trim();
    // fallback: optionally remove house numbers (digits possibly with slashes/letters after a comma)
    const fallbackQuery = cleanQuery.replace(/,\s*\d+[\/\d\w]*\s*/g, '');

    const queriesToTry = [cleanQuery];
    if (fallbackQuery !== cleanQuery) {
      queriesToTry.push(fallbackQuery);
    }

    let data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hit: any;

    for (const q of queriesToTry) {
      if (!q.trim()) continue;

      const url = new URL("https://graphhopper.com/api/1/geocode");
      url.searchParams.set("q", q);
      // Request GH geocoding with limit=5 and countrycode=am
      url.searchParams.set("limit", "5");
      url.searchParams.set("countrycode", "am");
      url.searchParams.set("key", apiKey);
      
      if (payload.locale) {
        url.searchParams.set("locale", payload.locale);
      }

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      if (res.status === 429) {
        return NextResponse.json(
          { error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests to the routing service." } },
          { status: 429 }
        );
      }

      if (!res.ok) continue;

      data = await res.json();
      
      if (data.hits && data.hits.length > 0) {
        // Validate every candidate strictly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hit = data.hits.find((h: any) => {
          const lat = h.point?.lat;
          const lng = h.point?.lng;
          
          if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) return false;
          if (lat < 38.8 || lat > 41.4) return false;
          if (lng < 43.4 || lng > 46.7) return false;
          
          const isAM = h.countrycode?.toUpperCase() === 'AM' || 
                       ['Armenia', 'Հայաստան', 'Армения'].includes(h.country);
          
          return isAM;
        });

        if (hit) {
          break; // found valid Armenian candidate!
        }
      }
    }

    if (!hit) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "No coordinates found for the given address." } },
        { status: 404 }
      );
    }

    const { lat, lng } = hit.point;
    const formattedAddress = [hit.name, hit.street, hit.city, hit.country].filter(Boolean).join(", ");

    return NextResponse.json({
      coordinates: {
        latitude: lat,
        longitude: lng
      },
      formattedAddress: formattedAddress || hit.name
    });
  } catch (error) {
    console.error("Geocode API error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred during geocoding." } },
      { status: 500 }
    );
  }
}
