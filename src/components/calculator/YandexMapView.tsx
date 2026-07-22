"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { FACTORY_ORIGIN } from "@/config/delivery";
import type { MapRouteEstimate } from "@/lib/maps/mapProvider.types";

interface YandexMapViewProps {
  destinationAddress: string;
  isAvailable: boolean;
  routeEstimate: MapRouteEstimate | null;
}

export default function YandexMapView({
  destinationAddress,
  isAvailable,
  routeEstimate,
}: YandexMapViewProps) {
  const t = useTranslations("calculator.delivery");
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAvailable || !window.ymaps || !mapContainerRef.current || !destinationAddress.trim()) {
      return;
    }

    let mapInstance: unknown = null;

    try {
      window.ymaps.ready(() => {
        if (!mapContainerRef.current) return;
        mapContainerRef.current.innerHTML = "";

        const originCoord = [FACTORY_ORIGIN.coordinates.lat, FACTORY_ORIGIN.coordinates.lng];

        // Create MultiRoute for automobile driving road calculation
        const multiRoute = new window.ymaps.multiRouter.MultiRoute(
          {
            referencePoints: [originCoord, destinationAddress],
            params: {
              routingMode: "auto",
            },
          },
          {
            boundsAutoApply: true,
            wayPointStartIconColor: "#F5B800",
            wayPointFinishIconColor: "#FFD45A",
            routeActiveStrokeColor: "#F5B800",
            routeActiveStrokeWidth: 4,
          }
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map = new (window.ymaps.Map as any)(mapContainerRef.current, {
          center: originCoord,
          zoom: 9,
          controls: ["zoomControl"],
        });

        map.geoObjects.add(multiRoute);
        mapInstance = map;
      });
    } catch (err) {
      console.warn("Yandex map render notice:", err);
    }

    return () => {
      if (mapInstance && typeof (mapInstance as { destroy?: () => void }).destroy === "function") {
        (mapInstance as { destroy: () => void }).destroy();
      }
    };
  }, [destinationAddress, isAvailable]);

  if (!isAvailable) {
    return (
      <div className="w-full p-6 rounded-xl bg-background/60 border border-white/10 flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
        <div className="w-10 h-10 rounded-full bg-primary-yellow/10 border border-primary-yellow/30 flex items-center justify-center text-primary-yellow text-lg font-mono">
          🗺
        </div>
        <p className="text-xs sm:text-sm text-text-secondary max-w-md leading-relaxed font-mono">
          {t("mapUnavailable")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-primary-yellow font-bold uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-yellow animate-pulse" />
          {t("mapPlaceholderTitle")}
        </span>
        {routeEstimate?.distanceKm ? (
          <span className="text-text-primary font-bold font-mono">
            ~{routeEstimate.distanceKm} km
          </span>
        ) : null}
      </div>

      <div
        ref={mapContainerRef}
        className="w-full aspect-[21/9] rounded-xl border border-white/10 overflow-hidden bg-surface shadow-inner min-h-[200px]"
      />
    </div>
  );
}
