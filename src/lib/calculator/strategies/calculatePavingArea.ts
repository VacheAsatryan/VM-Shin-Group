import type { PavingAreaInput, ProductVariantConfig, CalculationMetrics } from "../calculator.types";

export function calculatePavingArea(
  input: PavingAreaInput,
  variant: ProductVariantConfig
): CalculationMetrics {
  const length = Math.max(0, input.lengthMeters || 0);
  const width = Math.max(0, input.widthMeters || 0);
  const reserve = Math.max(0, input.reservePercent || 0) / 100;

  const rawArea = length * width;
  const coverageAreaSqMeters = Number((rawArea * (1 + reserve)).toFixed(2));

  const itemsPerSqM = variant.itemsPerSqMeter || 50;
  const secondaryQuantity = Math.ceil(coverageAreaSqMeters * itemsPerSqM);

  const palletsCount =
    variant.itemsPerPallet && variant.itemsPerPallet > 0
      ? Math.ceil(secondaryQuantity / variant.itemsPerPallet)
      : undefined;

  return {
    primaryQuantity: coverageAreaSqMeters,
    primaryUnitKey: "m2",
    secondaryQuantity,
    secondaryUnitKey: "pcs",
    coverageAreaSqMeters,
    palletsCount,
  };
}
