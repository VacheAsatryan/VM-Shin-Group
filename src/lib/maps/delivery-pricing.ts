export interface DeliveryPricingResult {
  ratePerM3: number | null;
  totalDeliveryPrice: number | null;
  price: number | null; // For backward compatibility (equals totalDeliveryPrice)
  currency: string;
  isApproximate: boolean;
  requiresManagerConfirmation: boolean;
  distanceKm: number;
}

/**
 * Determines distance tier rate per 1 m³ for READY-MIX CONCRETE ONLY:
 * - 0 < distance <= 5 km   -> 2,000 AMD / m³
 * - 5 < distance <= 10 km  -> 3,000 AMD / m³
 * - 10 < distance <= 15 km -> 4,000 AMD / m³
 * - 15 < distance <= 20 km -> 5,000 AMD / m³
 * - 20 < distance <= 30 km -> 6,000 AMD / m³
 * - 30 < distance <= 40 km -> 8,000 AMD / m³
 * - distance > 40 km       -> null (determined after order / manager confirmation)
 */
export function getDeliveryRatePerM3(distanceKm: number): number | null {
  if (distanceKm <= 0) return null;
  if (distanceKm <= 5) return 2000;
  if (distanceKm <= 10) return 3000;
  if (distanceKm <= 15) return 4000;
  if (distanceKm <= 20) return 5000;
  if (distanceKm <= 30) return 6000;
  if (distanceKm <= 40) return 8000;
  return null;
}

/**
 * Computes delivery pricing for ready-mix concrete.
 * Total delivery price = concrete volume (m³) × delivery rate per m³ (AMD/m³).
 */
export function computeDeliveryPrice(
  distanceKm: number,
  isConcrete: boolean = false,
  volumeM3?: number
): DeliveryPricingResult {
  const currency = "AMD";

  // Tariffs apply EXCLUSIVELY to ready-mix concrete
  if (!isConcrete || distanceKm <= 0) {
    return {
      ratePerM3: null,
      totalDeliveryPrice: null,
      price: null,
      currency,
      isApproximate: false,
      requiresManagerConfirmation: true,
      distanceKm: distanceKm <= 0 ? 0 : distanceKm,
    };
  }

  const ratePerM3 = getDeliveryRatePerM3(distanceKm);

  if (ratePerM3 === null) {
    return {
      ratePerM3: null,
      totalDeliveryPrice: null,
      price: null,
      currency,
      isApproximate: false,
      requiresManagerConfirmation: true,
      distanceKm,
    };
  }

  const totalDeliveryPrice =
    typeof volumeM3 === "number" && volumeM3 > 0
      ? Math.round(volumeM3 * ratePerM3)
      : null;

  return {
    ratePerM3,
    totalDeliveryPrice,
    price: totalDeliveryPrice,
    currency,
    isApproximate: false,
    requiresManagerConfirmation: false,
    distanceKm,
  };
}
