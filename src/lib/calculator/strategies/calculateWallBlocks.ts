import type { WallBlockInput, ProductVariantConfig, CalculationMetrics } from "../calculator.types";

export function calculateWallBlocks(
  input: WallBlockInput,
  variant: ProductVariantConfig
): CalculationMetrics {
  const length = Math.max(0, input.lengthMeters || 0);
  const height = Math.max(0, input.heightMeters || 0);
  const wallCount = Math.max(1, input.wallCount || 1);
  const reserve = Math.max(0, input.reservePercent || 0) / 100;

  const totalArea = Number((length * height * wallCount).toFixed(2));
  const blockFaceArea = (variant.lengthMeters || 0.4) * (variant.heightMeters || 0.2);
  const blocksPerSqMeter = blockFaceArea > 0 ? 1 / blockFaceArea : 12.5;

  const rawBlocks = totalArea * blocksPerSqMeter * (1 + reserve);
  const primaryQuantity = Math.ceil(rawBlocks);

  const palletsCount =
    variant.itemsPerPallet && variant.itemsPerPallet > 0
      ? Math.ceil(primaryQuantity / variant.itemsPerPallet)
      : undefined;

  return {
    primaryQuantity,
    primaryUnitKey: "blocks",
    coverageAreaSqMeters: totalArea,
    palletsCount,
  };
}
