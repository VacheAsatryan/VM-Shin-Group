import { DELIVERY_CONFIG } from "@/config/delivery";

export function calculateDeliveryPrice(
  distanceKm: number,
  isAvailable: boolean,
  enabled: boolean = false
): number | null {
  if (!enabled || !isAvailable || distanceKm <= 0) {
    return null;
  }

  const cost = DELIVERY_CONFIG.baseCost + distanceKm * DELIVERY_CONFIG.costPerKm;
  return Math.round(cost);
}
