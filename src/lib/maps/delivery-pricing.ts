import { DELIVERY_CONFIG } from "@/config/delivery";

export interface DeliveryPricingResult {
  price: number | null;
  currency: string;
  isApproximate: boolean;
  requiresManagerConfirmation: boolean;
  distanceKm: number;
}

export function computeDeliveryPrice(
  distanceKm: number,
  enabled: boolean = true
): DeliveryPricingResult {
  const currency = DELIVERY_CONFIG.currency || "AMD";

  if (!enabled || distanceKm <= 0) {
    return {
      price: null,
      currency,
      isApproximate: true,
      requiresManagerConfirmation: false,
      distanceKm: 0,
    };
  }

  // Temporary test tariff: deliveryPrice = distanceKm * 300 AMD (rounded to whole AMD)
  const price = Math.round(distanceKm * DELIVERY_CONFIG.costPerKm);

  return {
    price,
    currency,
    isApproximate: true,
    requiresManagerConfirmation: false,
    distanceKm,
  };
}
