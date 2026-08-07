import type { FloorSlabsInput, ProductVariantConfig, CalculationMetrics } from "../calculator.types";

export function calculateFloorSlabs(
  input: FloorSlabsInput,
  variant: ProductVariantConfig
): CalculationMetrics {
  const widthMeters = variant.widthMeters || 1.20;

  // Validate length boundaries: 2.90m to 6.30m
  const rawLength =
    typeof input.lengthMeters === "number" && !isNaN(input.lengthMeters)
      ? input.lengthMeters
      : 2.90;
  const lengthMeters = Math.min(6.30, Math.max(2.90, rawLength));

  // Validate positive integer quantity
  const rawQuantity =
    typeof input.quantity === "number" && !isNaN(input.quantity)
      ? input.quantity
      : 1;
  const quantity = Math.max(1, Math.floor(rawQuantity));

  const areaOfOnePanel = Number((widthMeters * lengthMeters).toFixed(4));
  const coverageAreaSqMeters = Number((quantity * areaOfOnePanel).toFixed(4));

  return {
    primaryQuantity: quantity,
    primaryUnitKey: "pcs",
    secondaryQuantity: coverageAreaSqMeters,
    secondaryUnitKey: "m2",
    coverageAreaSqMeters,
  };
}
