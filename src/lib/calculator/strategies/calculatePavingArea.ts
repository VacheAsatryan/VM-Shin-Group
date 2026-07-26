import type { PavingAreaInput, ProductVariantConfig, CalculationMetrics } from "../calculator.types";

export function calculatePavingArea(
  input: PavingAreaInput,
  variant: ProductVariantConfig
): CalculationMetrics {
  const length = Math.max(0, input.lengthMeters || 0);
  const width = Math.max(0, input.widthMeters || 0);
  const reserve = Math.max(0, input.reservePercent || 0) / 100;

  const itemsPerSqM = variant.itemsPerSqMeter || 50;

  let coverageAreaSqMeters = 0;
  let secondaryQuantity = 0;

  if (input.mode === "quantity") {
    secondaryQuantity = Math.max(0, input.quantity || 0);
    coverageAreaSqMeters = Number((secondaryQuantity / itemsPerSqM).toFixed(2));
  } else {
    const rawArea = length * width;
    coverageAreaSqMeters = Number((rawArea * (1 + reserve)).toFixed(2));
    secondaryQuantity = Math.ceil(coverageAreaSqMeters * itemsPerSqM);
  }

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
