import { PRODUCT_DETAILS } from "@/config/productDetails";

export interface PavingStoneDimensions {
  widthMm: number;
  lengthMm: number;
}

/**
 * Resolves physical width and length (in mm) for a given paving stone variant and size ID.
 * Thickness (55mm) is excluded as it does not participate in 2D surface area calculations.
 */
export function getPavingStoneDimensions(
  variantId: string,
  sizeId?: string
): PavingStoneDimensions {
  const pavingConfig = PRODUCT_DETAILS["paving-stones"];
  const variantObj =
    pavingConfig?.variants.find((v) => v.id === variantId) ||
    pavingConfig?.variants[0];

  if (variantObj && variantObj.availableSizes && variantObj.availableSizes.length > 0) {
    const matchedSize =
      variantObj.availableSizes.find((s) => s.id === sizeId) ||
      variantObj.availableSizes[0];
    if (matchedSize) {
      return { widthMm: matchedSize.widthMm, lengthMm: matchedSize.lengthMm };
    }
  }

  // Fallback parsing if sizeId follows the "55-W-L" naming convention (e.g. "55-130-165")
  if (sizeId) {
    const parts = sizeId.split("-").map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      return { widthMm: parts[1], lengthMm: parts[2] };
    }
  }

  // Default size fallbacks
  if (variantId === "paving-type-2") {
    return { widthMm: 100, lengthMm: 200 };
  }
  return { widthMm: 130, lengthMm: 130 };
}

/**
 * Calculates the exact surface area of 1 paving stone piece in m².
 * Area = (widthMm / 1000) * (lengthMm / 1000)
 */
export function getPavingStonePieceAreaM2(
  variantId: string,
  sizeId?: string
): number {
  const { widthMm, lengthMm } = getPavingStoneDimensions(variantId, sizeId);
  return (widthMm / 1000) * (lengthMm / 1000);
}
