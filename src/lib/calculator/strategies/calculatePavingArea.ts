import type { PavingAreaInput, ProductVariantConfig, CalculationMetrics } from "../calculator.types";
import { getPavingStonePieceAreaM2 } from "../pavingStoneGeometry";

export function calculatePavingArea(
  input: PavingAreaInput,
  variant: ProductVariantConfig
): CalculationMetrics {
  const length = Math.max(0, input.lengthMeters || 0);
  const width = Math.max(0, input.widthMeters || 0);
  const reserve = Math.max(0, input.reservePercent || 0) / 100;

  const pieceAreaM2 = getPavingStonePieceAreaM2(variant.id, input.sizeId);

  let coverageAreaSqMeters = 0;
  let secondaryQuantity = 0;

  if (input.mode === "quantity") {
    secondaryQuantity = Math.max(0, input.quantity || 0);
    // Full float precision preserves exact subtotal = coverageAreaSqMeters * pricePerUnit (4,000 AMD/m²)
    coverageAreaSqMeters = secondaryQuantity * pieceAreaM2;
  } else {
    const rawArea = length * width;
    coverageAreaSqMeters = rawArea * (1 + reserve);
    secondaryQuantity = pieceAreaM2 > 0 ? Math.ceil(coverageAreaSqMeters / pieceAreaM2) : 0;
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
