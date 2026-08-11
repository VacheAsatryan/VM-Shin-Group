import { computeDeliveryPrice } from "@/lib/maps/delivery-pricing";

export function calculateDeliveryPrice(
  distanceKm?: number,
  isConcrete: boolean = false
): number | null {
  if (distanceKm === undefined || distanceKm <= 0) {
    return null;
  }
  return computeDeliveryPrice(distanceKm, isConcrete).price;
}
