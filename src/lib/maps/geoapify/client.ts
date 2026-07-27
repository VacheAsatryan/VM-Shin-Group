export const GEOAPIFY_BASE_URL = "https://api.geoapify.com/v1";

export function getGeoapifyApiKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  const keyExists = key !== undefined;
  const isEmptyString = key === "";

  if (typeof window !== "undefined") {
    console.log("[Geoapify Key Check]", {
      keyExists,
      isEmptyString,
      keyLength: key ? key.length : 0,
    });
  }

  if (!key || key.trim() === "") {
    return undefined;
  }
  return key.trim();
}

export function isGeoapifyConfigured(): boolean {
  const configured = getGeoapifyApiKey() !== undefined;
  if (typeof window !== "undefined") {
    console.log("[Geoapify Configured Check]", { configured });
  }
  return configured;
}

export class GeoapifyError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "GeoapifyError";
  }
}

export async function fetchGeoapifyJson<T>(
  endpoint: string,
  params: Record<string, string>,
  signal?: AbortSignal
): Promise<T> {
  const apiKey = getGeoapifyApiKey();
  if (!apiKey) {
    throw new GeoapifyError("Geoapify API key is missing", 401, "MISSING_API_KEY");
  }

  const searchParams = new URLSearchParams({
    ...params,
    apiKey,
  });

  const url = `${GEOAPIFY_BASE_URL}${endpoint}?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new GeoapifyError("Geoapify rate limit exceeded", 429, "RATE_LIMIT");
      }
      if (response.status === 401 || response.status === 403) {
        throw new GeoapifyError("Invalid or unauthorized Geoapify API key", response.status, "AUTH_ERROR");
      }
      throw new GeoapifyError(
        `Geoapify API request failed with status ${response.status}`,
        response.status,
        "API_ERROR"
      );
    }

    const data = await response.json();
    if (!data) {
      throw new GeoapifyError("Empty response received from Geoapify", 500, "INVALID_RESPONSE");
    }

    return data as T;
  } catch (err) {
    if (err instanceof GeoapifyError) {
      throw err;
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw err;
    }
    throw new GeoapifyError(
      err instanceof Error ? err.message : "Failed to connect to Geoapify API",
      500,
      "NETWORK_ERROR"
    );
  }
}
