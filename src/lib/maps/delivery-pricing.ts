export interface DeliveryPricingResult {
  price: number | null;
  currency: string;
  isApproximate: boolean;
  requiresManagerConfirmation: boolean;
  distanceKm: number;
}

/**
 * Computes delivery pricing using final tier-based rules.
 * 
 * Boundary pricing tiers:
 * - 0 < distance <= 5 km   -> 2,000 AMD
 * - 5 < distance <= 10 km  -> 3,000 AMD
 * - 10 < distance <= 15 km -> 4,000 AMD
 * - 15 < distance <= 20 km -> 5,000 AMD
 * - 20 < distance <= 30 km -> 6,000 AMD
 * - 30 < distance <= 40 km -> 8,000 AMD
 * - distance > 40 km       -> null (determined after order)
 * 
 * Ready-mix concrete ALWAYS returns null (determined after order).
 */
export function computeDeliveryPrice(
  distanceKm: number,
  isConcrete: boolean = false
): DeliveryPricingResult {
  const currency = "AMD";

  // Tariffs apply EXCLUSIVELY to ready-mix concrete
  if (!isConcrete || distanceKm <= 0) {
    return {
      price: null,
      currency,
      isApproximate: false,
      requiresManagerConfirmation: !isConcrete || distanceKm > 40,
      distanceKm: distanceKm <= 0 ? 0 : distanceKm,
    };
  }

  let price: number | null = null;

  if (distanceKm <= 5) {
    price = 2000;
  } else if (distanceKm <= 10) {
    price = 3000;
  } else if (distanceKm <= 15) {
    price = 4000;
  } else if (distanceKm <= 20) {
    price = 5000;
  } else if (distanceKm <= 30) {
    price = 6000;
  } else if (distanceKm <= 40) {
    price = 8000;
  }

  return {
    price,
    currency,
    isApproximate: false,
    requiresManagerConfirmation: price === null,
    distanceKm,
  };
}
