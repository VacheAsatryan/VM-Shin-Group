"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { FACTORY_COORDINATES } from "@/lib/maps/coordinates";
import type { Coordinates, DeliveryRoute } from "@/lib/maps/geoapify/types";
import { FACTORY_ORIGIN } from "@/config/delivery";

const emptySubscribe = () => () => {};

// Custom Gold Factory Icon (divIcon)
const createFactoryIcon = () =>
  L.divIcon({
    className: "custom-leaflet-factory-icon",
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        background: #111111;
        border: 2px solid #F5C21B;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(245, 194, 27, 0.5);
      ">
        <span style="font-size: 18px;">🏭</span>
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #F5C21B;
        "></div>
      </div>
    `,
    iconSize: [38, 44],
    iconAnchor: [19, 44],
    popupAnchor: [0, -44],
  });

// Custom Gold Destination Icon (divIcon)
const createDestinationIcon = () =>
  L.divIcon({
    className: "custom-leaflet-destination-icon",
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        background: #171717;
        border: 2px solid #FFE259;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(255, 226, 89, 0.6);
        cursor: grab;
      ">
        <span style="font-size: 16px;">📍</span>
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #FFE259;
        "></div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
  });

interface MapControllerProps {
  factoryCoords: Coordinates;
  destinationCoords: Coordinates | null;
  route: DeliveryRoute | null;
  onMapClick: (coords: Coordinates) => void;
}

function MapController({
  factoryCoords,
  destinationCoords,
  route,
  onMapClick,
}: MapControllerProps) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (!map) return;

    if (route && route.geometry.length > 0) {
      const bounds = L.latLngBounds(route.geometry);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (destinationCoords) {
      const bounds = L.latLngBounds([
        [factoryCoords.lat, factoryCoords.lon],
        [destinationCoords.lat, destinationCoords.lon],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView([factoryCoords.lat, factoryCoords.lon], 11);
    }
  }, [map, factoryCoords, destinationCoords, route]);

  return null;
}

interface DeliveryCalculatorMapProps {
  destinationCoords: Coordinates | null;
  destinationAddress?: string;
  route: DeliveryRoute | null;
  onConfirmCoordinates: (coords: Coordinates) => void;
  isInteractive?: boolean;
  className?: string;
}

export default function DeliveryCalculatorMap({
  destinationCoords,
  destinationAddress,
  route,
  onConfirmCoordinates,
  className = "w-full h-[320px] sm:h-[380px] rounded-xl overflow-hidden border border-gold-border bg-surface relative shadow-2xl z-0",
}: DeliveryCalculatorMapProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const markerRef = useRef<L.Marker | null>(null);

  if (!isClient) {
    return (
      <div className={className}>
        <div className="absolute inset-0 bg-surface flex items-center justify-center text-xs font-mono text-text-secondary animate-pulse">
          ⚡ Initializing Map...
        </div>
      </div>
    );
  }

  const factoryPos: [number, number] = [FACTORY_COORDINATES.lat, FACTORY_COORDINATES.lon];
  const destPos: [number, number] | null = destinationCoords
    ? [destinationCoords.lat, destinationCoords.lon]
    : null;

  const handleDragEnd = () => {
    const marker = markerRef.current;
    if (marker) {
      const latLng = marker.getLatLng();
      onConfirmCoordinates({ lat: latLng.lat, lon: latLng.lng });
    }
  };

  const handleMapClick = (coords: Coordinates) => {
    onConfirmCoordinates(coords);
  };

  return (
    <div className={className}>
      <MapContainer
        center={factoryPos}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ background: "#111111" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer">Geoapify</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          factoryCoords={FACTORY_COORDINATES}
          destinationCoords={destinationCoords}
          route={route}
          onMapClick={handleMapClick}
        />

        {/* Factory Origin Marker */}
        <Marker position={factoryPos} icon={createFactoryIcon()}>
          <Popup className="custom-leaflet-popup">
            <div className="p-1 font-sans text-xs">
              <p className="font-bold text-black">{FACTORY_ORIGIN.name}</p>
              <p className="text-gray-600">{FACTORY_ORIGIN.address}, {FACTORY_ORIGIN.city}</p>
            </div>
          </Popup>
        </Marker>

        {/* Customer Destination Marker */}
        {destPos && (
          <Marker
            position={destPos}
            icon={createDestinationIcon()}
            draggable={true}
            ref={markerRef}
            eventHandlers={{ dragend: handleDragEnd }}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1 font-sans text-xs">
                <p className="font-bold text-black">
                  📍 {destinationAddress || "Selected Destination"}
                </p>
                <p className="text-gray-500 text-[10px] italic mt-1">
                  Drag marker to adjust exact delivery point
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driving Route Polyline */}
        {route && route.geometry.length > 0 && (
          <Polyline
            positions={route.geometry}
            pathOptions={{
              color: "#F5C21B",
              weight: 5,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
