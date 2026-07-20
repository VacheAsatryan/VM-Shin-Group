import type { CurbstonesInput, ProductVariantConfig, CalculationMetrics } from "../calculator.types";

export function calculateCurbstones(
  input: CurbstonesInput,
  variant: ProductVariantConfig
): CalculationMetrics {
  const linearLength = Math.max(0, input.linearLengthMeters || 0);
  const reserve = Math.max(0, input.reservePercent || 0) / 100;

  const coverageLinearMeters = Number((linearLength * (1 + reserve)).toFixed(2));
  const itemsPerLinearMeter = variant.itemsPerLinearMeter || (variant.lengthMeters ? 1 / variant.lengthMeters : 1);

  const primaryQuantity = Math.ceil(coverageLinearMeters * itemsPerLinearMeter);

  const palletsCount =
    variant.itemsPerPallet && variant.itemsPerPallet > 0
      ? Math.ceil(primaryQuantity / variant.itemsPerPallet)
      : undefined;

  return {
    primaryQuantity,
    primaryUnitKey: "pcs",
    coverageLinearMeters,
    palletsCount,
  };
}
