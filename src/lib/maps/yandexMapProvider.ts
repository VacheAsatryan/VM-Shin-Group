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
  private scriptLoadingPromise: Promise<void> | null = null;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || "";
  }

  public get isApiKeyAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private loadScript(): Promise<void> {
    if (!this.isApiKeyAvailable) {
      return Promise.reject(new Error("Yandex Maps API Key missing"));
    }

    if (window.ymaps) {
      return Promise.resolve();
    }

    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/2.1/?lang=en_US&apikey=${this.apiKey}`;
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if (window.ymaps) {
          window.ymaps.ready(() => resolve());
        } else {
          resolve();
        }
      };
      script.onerror = (err) => reject(err);
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
