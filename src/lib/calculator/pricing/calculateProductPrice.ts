import type { CalculationMetrics, ProductVariantConfig } from "../calculator.types";

export function calculateProductPrice(
  metrics: CalculationMetrics,
  variant: ProductVariantConfig
): number {
  const price = variant.pricePerUnit || 0;

  switch (variant.pricingUnit) {
    case "per_item":
      return Math.round(metrics.primaryQuantity * price);
    case "per_sq_meter":
      return Math.round((metrics.coverageAreaSqMeters || metrics.primaryQuantity) * price);
    case "per_linear_meter":
      return Math.round((metrics.coverageLinearMeters || metrics.primaryQuantity) * price);
    case "per_cubic_meter":
      return Math.round((metrics.volumeM3 || metrics.primaryQuantity) * price);
    case "per_pallet":
      return Math.round((metrics.palletsCount || 1) * price);
    default:
      return Math.round(metrics.primaryQuantity * price);
  }
}
