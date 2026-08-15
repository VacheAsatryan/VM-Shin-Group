import { getDeliveryRatePerM3 } from "@/lib/maps/delivery-pricing";

export function calculateDeliveryPrice(
  distanceKm?: number,
  isConcrete: boolean = false,
  volumeM3?: number
): number | null {
  if (
    !isConcrete ||
    distanceKm === undefined ||
    distanceKm <= 0 ||
    volumeM3 === undefined ||
    volumeM3 <= 0
  ) {
    return null;
  }

  const ratePerM3 = getDeliveryRatePerM3(distanceKm);
  if (ratePerM3 === null) {
    return null;
  }

  return Math.round(volumeM3 * ratePerM3);
}
