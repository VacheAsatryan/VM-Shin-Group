"use client";

import { useTranslations } from "next-intl";
import { FACTORY_ORIGIN } from "@/config/delivery";

interface MapPreviewProps {
  destinationAddress: string;
  distanceKm: number;
}

export default function MapPreview({
  destinationAddress,
  distanceKm,
}: MapPreviewProps) {
  const t = useTranslations("calculator.delivery");

  return (
    <div className="relative w-full aspect-[21/9] rounded-lg border border-gold-border bg-surface overflow-hidden flex flex-col justify-between p-4 shadow-inner">
      {/* Grid Pattern Simulating Map Coordinates */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,184,0,0.08)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(245,194,27,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,194,27,0.06)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Simulated Route Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <line x1="20%" y1="70%" x2="80%" y2="30%" stroke="#F5B800" strokeWidth="2" strokeDasharray="4,4" />
        <circle cx="20%" cy="70%" r="4" fill="#F5B800" />
        <circle cx="80%" cy="30%" r="4" fill="#FFD45A" />
      </svg>

      {/* Origin Pin Tag */}
      <div className="relative z-10 self-start bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-primary-yellow/30 text-[10px] font-mono text-primary-yellow">
        📍 {FACTORY_ORIGIN.city} ({FACTORY_ORIGIN.coordinates.lat.toFixed(2)}, {FACTORY_ORIGIN.coordinates.lng.toFixed(2)})
      </div>

      {/* Map Status Badge */}
      <div className="relative z-10 self-end bg-black/80 backdrop-blur-md px-3 py-1 rounded border border-gold-border text-[10px] font-mono text-text-secondary flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary-yellow animate-pulse" />
        <span>{t("mapPlaceholderTitle")}</span>
        {destinationAddress && <span className="text-primary-yellow font-bold">({distanceKm} km)</span>}
      </div>
    </div>
  );
}
