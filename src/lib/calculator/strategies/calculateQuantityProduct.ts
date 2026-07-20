import type { QuantityProductInput, ProductVariantConfig, CalculationMetrics } from "../calculator.types";

export function calculateQuantityProduct(
  input: QuantityProductInput,
  variant: ProductVariantConfig
): CalculationMetrics {
  const primaryQuantity = Math.max(1, Math.ceil(input.quantity || 1));

  const palletsCount =
    variant.itemsPerPallet && variant.itemsPerPallet > 0
      ? Math.ceil(primaryQuantity / variant.itemsPerPallet)
      : undefined;

  return {
    primaryQuantity,
    primaryUnitKey: "pcs",
    palletsCount,
  };
}
