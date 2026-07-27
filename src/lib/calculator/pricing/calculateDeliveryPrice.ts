import { DELIVERY_CONFIG } from "@/config/delivery";

export function calculateDeliveryPrice(
  distanceKm?: number,
  enabled: boolean = true
): number | null {
  if (!enabled || !distanceKm || distanceKm <= 0) {
    return null;
  }
  return Math.round(distanceKm * DELIVERY_CONFIG.costPerKm);
}
