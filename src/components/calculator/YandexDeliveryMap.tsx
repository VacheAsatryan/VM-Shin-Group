"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { FACTORY_ORIGIN } from "@/config/delivery";
import type { MapRouteEstimate } from "@/lib/maps/mapProvider.types";
import { yandexMapProvider } from "@/lib/maps/yandexMapProvider";
import type { Coordinates } from "@/lib/routing/types";

import type { RouteStatus } from "@/hooks/useDeliveryRoute";

interface YandexDeliveryMapProps {
  routeStatus: RouteStatus;
  routeGeometry: Coordinates[] | null;
  destinationCoords: Coordinates | null;
  routeEstimate: MapRouteEstimate | null;
  onConfirmCoordinates?: (coords: Coordinates) => void;
  onMapError?: (key: string) => void;
}

type MapStatus = "loading" | "ready" | "error";

export default function YandexDeliveryMap({
  routeStatus,
  routeGeometry,
  destinationCoords,
  onConfirmCoordinates,
  onMapError,
}: YandexDeliveryMapProps) {
  const t = useTranslations("calculator.delivery");
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  
  const [status, setStatus] = useState<MapStatus>("loading");
  
  // Required refs for managing Yandex map instance lifecycle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routePolylineRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const destinationPlacemarkRef = useRef<any>(null);

  // Load script on mount
  useEffect(() => {
    let cancelled = false;
    
    yandexMapProvider
      .loadScript()
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch((error) => {
        console.error("Yandex map load error:", error);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCoordinates = useCallback((lat: number, lng: number) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    
    if (lat >= 38.8 && lat <= 41.4 && lng >= 43.4 && lng <= 46.7) {
      if (onConfirmCoordinates) {
        onConfirmCoordinates({ latitude: lat, longitude: lng });
      }
    } else {
      if (onMapError) {
        onMapError("addressOutsideArmenia");
      }
    }
  }, [onConfirmCoordinates, onMapError]);

  // Handle map rendering and initialization
  useEffect(() => {
    if (status !== "ready" || !window.ymaps || !mapContainerRef.current) {
      return;
    }

    const originCoord = [FACTORY_ORIGIN.coordinates.lat, FACTORY_ORIGIN.coordinates.lng];

    if (!mapInstanceRef.current) {
      try {
        window.ymaps.ready(() => {
          if (!mapContainerRef.current) return;
          mapContainerRef.current.innerHTML = ""; // clear previous renders

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const map = new (window.ymaps.Map as any)(mapContainerRef.current, {
            center: originCoord,
            zoom: 12,
            controls: ["zoomControl", "fullscreenControl"],
          });
          mapInstanceRef.current = map;
          
          // Initial marker
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const factoryPlacemark = new (window.ymaps.Placemark as any)(
            originCoord,
            { balloonContent: FACTORY_ORIGIN.name, iconCaption: FACTORY_ORIGIN.name },
            { preset: "islands#icon", iconColor: "#F5B800" }
          );
          map.geoObjects.add(factoryPlacemark);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          map.events.add('click', (e: any) => {
            if (routeStatus !== "selectingOnMap" && routeStatus !== "ready" && routeStatus !== "error") {
               // Only allow click updates when explicitly selecting or changing
               return;
            }
            const coords = e.get('coords');
            handleCoordinates(coords[0], coords[1]);
          });
        });
      } catch (err) {
        console.warn("Yandex map initialization error:", err);
      }
    }
  }, [status, routeStatus, handleCoordinates]);

  // Handle route overlay and destination marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.ymaps) return;

    try {
      window.ymaps.ready(() => {
        // Cleanup old objects
        if (routePolylineRef.current) {
          map.geoObjects.remove(routePolylineRef.current);
          routePolylineRef.current = null;
        }
        
        // Remove destination placemark if we're not selecting or confirmed
        if (routeStatus === "idle") {
          if (destinationPlacemarkRef.current) {
            map.geoObjects.remove(destinationPlacemarkRef.current);
            destinationPlacemarkRef.current = null;
          }
          return;
        }

        if (destinationCoords) {
          const destArr = [destinationCoords.latitude, destinationCoords.longitude];
          
          if (!destinationPlacemarkRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newPlacemark = new (window.ymaps.Placemark as any)(
              destArr,
              {},
              { preset: "islands#redIcon", draggable: true }
            );
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            newPlacemark.events.add('dragend', (e: any) => {
               const target = e.get('target');
               const coords = target.geometry.getCoordinates();
               handleCoordinates(coords[0], coords[1]);
            });

            destinationPlacemarkRef.current = newPlacemark;
            map.geoObjects.add(newPlacemark);
          } else {
            destinationPlacemarkRef.current.geometry.setCoordinates(destArr);
          }
        }

        if (routeGeometry && routeGeometry.length > 0) {
          const routeArr = routeGeometry.map(c => [c.latitude, c.longitude]);
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newPolyline = new (window.ymaps.Polyline as any)(
            routeArr,
            {},
            {
              strokeColor: "#22C55E",
              strokeWidth: 6,
              strokeOpacity: 0.9
            }
          );
          
          routePolylineRef.current = newPolyline;
          map.geoObjects.add(newPolyline);
          
          map.setBounds(newPolyline.geometry.getBounds(), { checkZoomRange: true, zoomMargin: 30 });
        } else if (destinationCoords && destinationPlacemarkRef.current) {
          // If we only have destination, just center there
          const originCoord = [FACTORY_ORIGIN.coordinates.lat, FACTORY_ORIGIN.coordinates.lng];
          const destArr = [destinationCoords.latitude, destinationCoords.longitude];
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const boundsObj = new (window.ymaps.GeoObjectCollection as any)();
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          boundsObj.add(new (window.ymaps.Placemark as any)(originCoord));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          boundsObj.add(new (window.ymaps.Placemark as any)(destArr));
          
          map.setBounds(boundsObj.getBounds(), { checkZoomRange: true, zoomMargin: 30 });
        }
      });
    } catch (err) {
      console.warn("Yandex map render notice:", err);
    }
  }, [routeGeometry, destinationCoords, routeStatus, handleCoordinates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current && typeof mapInstanceRef.current.destroy === "function") {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-primary-yellow font-bold uppercase flex items-center gap-2">
          {(status === "loading" || routeStatus === "selectingOnMap" || routeStatus === "buildingRoute") && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary-yellow animate-pulse" />
          )}
          {t("mapPlaceholderTitle")}
        </span>
      </div>

      {status === "error" ? (
        <div className="w-full p-6 rounded-xl bg-background/60 border border-gold-border flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
          <div className="w-10 h-10 rounded-full bg-primary-yellow/10 border border-primary-yellow/30 flex items-center justify-center text-primary-yellow text-lg font-mono">
            🗺
          </div>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md leading-relaxed font-mono">
            {t("mapUnavailable")}
          </p>
        </div>
      ) : (
        <div 
          ref={mapContainerRef} 
          className="w-full h-[300px] min-h-[300px] rounded-xl overflow-hidden border border-gold-border bg-surface relative"
        >
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-surface">
              <span className="text-xs font-mono text-text-secondary animate-pulse">
                Loading map...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
