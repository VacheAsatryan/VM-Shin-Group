import { FACTORY_ORIGIN } from "@/config/delivery";
import type { MapProvider, MapRouteEstimate } from "./mapProvider.types";
import { unavailableMapProvider } from "./unavailableMapProvider";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ymaps?: any;
  }
}

export class YandexMapProvider implements MapProvider {
  private apiKey: string;
  private suggestApiKey: string;
  private scriptLoadingPromise: Promise<void> | null = null;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || "";
    this.suggestApiKey = process.env.NEXT_PUBLIC_YANDEX_SUGGEST_API_KEY || "";

    if (process.env.NODE_ENV !== "production") {
      console.log("Yandex Maps key configured:", Boolean(this.apiKey));
      console.log("Yandex Suggest key configured:", Boolean(this.suggestApiKey));
      console.log("Yandex Suggest key length:", this.suggestApiKey.length);
    }
  }

  public get isApiKeyAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public get isSuggestApiKeyAvailable(): boolean {
    return Boolean(
      this.suggestApiKey &&
      this.suggestApiKey.trim().length > 0
    );
  }

  public loadScript(): Promise<void> {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("Yandex Maps can only load in browser"));
    }

    if (!this.isApiKeyAvailable) {
      return Promise.reject(new Error("Yandex Maps API key missing"));
    }

    if (window.ymaps) {
      return new Promise((resolve) => {
        window.ymaps.ready(resolve);
      });
    }

    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[data-yandex-maps="true"]'
      ) as HTMLScriptElement | null;

      const handleReady = () => {
        if (!window.ymaps) {
          reject(new Error("Yandex script loaded but window.ymaps is unavailable"));
          return;
        }

        window.ymaps.ready(() => resolve());
      };

      if (existingScript) {
        existingScript.addEventListener("load", handleReady, { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Existing Yandex Maps script failed")),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.dataset.yandexMaps = "true";
      
      const url = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(this.apiKey)}&suggest_apikey=${encodeURIComponent(this.suggestApiKey)}&lang=ru_RU`;

      script.src = url;
      script.async = true;

      script.onload = handleReady;
      script.onerror = () => {
        this.scriptLoadingPromise = null;
        reject(new Error("Failed to load Yandex Maps JavaScript API"));
      };

      document.head.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  async calculateRoute(destinationAddress: string): Promise<MapRouteEstimate> {
    if (!this.isApiKeyAvailable || !destinationAddress.trim()) {
      return unavailableMapProvider.calculateRoute(destinationAddress);
    }

    try {
      await this.loadScript();

      if (!window.ymaps || !window.ymaps.route) {
        return unavailableMapProvider.calculateRoute(destinationAddress);
      }

      const originCoord = [FACTORY_ORIGIN.coordinates.lat, FACTORY_ORIGIN.coordinates.lng];

      // Request automobile route via Yandex Maps JS API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const routeResult: any = await new Promise((resolve, reject) => {
        window.ymaps.route([originCoord, destinationAddress], { mapStateAutoApply: true }).then(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (route: any) => resolve(route),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (err: any) => reject(err)
        );
      });

      const distanceMeters = routeResult.getLength();
      const distanceKm = Number((distanceMeters / 1000).toFixed(1));
      const durationSeconds = routeResult.getTime();
      const estimatedDurationMinutes = Math.round(durationSeconds / 60);

      return {
        origin: FACTORY_ORIGIN,
        destinationAddress,
        distanceKm,
        estimatedDurationMinutes,
        isAvailable: true,
      };
    } catch (err) {
      console.warn("Yandex Maps route calculation fallback:", err);
      return {
        origin: FACTORY_ORIGIN,
        destinationAddress,
        distanceKm: 0,
        estimatedDurationMinutes: 0,
        isAvailable: false,
        statusMessageKey: "mapUnavailable",
        error: String(err),
      };
    }
  }
}

export const yandexMapProvider = new YandexMapProvider();
