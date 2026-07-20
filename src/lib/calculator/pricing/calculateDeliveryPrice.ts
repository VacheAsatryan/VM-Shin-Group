import { DELIVERY_CONFIG } from "@/config/delivery";

export function calculateDeliveryPrice(
  distanceKm: number = DELIVERY_CONFIG.defaultDistanceKm,
  enabled: boolean = true
): number {
  if (!enabled || distanceKm <= 0) return 0;

  const cost = DELIVERY_CONFIG.baseCost + distanceKm * DELIVERY_CONFIG.costPerKm;
  return Math.round(cost);
}
