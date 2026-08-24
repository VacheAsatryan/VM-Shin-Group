import type { FloorSlabsInput, CalculationMetrics } from "../calculator.types";

export function calculateFloorSlabs(
  input: FloorSlabsInput
): CalculationMetrics {
  const rawArea = Math.max(0, input.areaSqMeters || 0);
  const reserve = Math.max(0, input.reservePercent || 0) / 100;

  const coverageAreaSqMeters = Number((rawArea * (1 + reserve)).toFixed(4));

  return {
    primaryQuantity: coverageAreaSqMeters,
    primaryUnitKey: "m2",
    coverageAreaSqMeters,
  };
}
