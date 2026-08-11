import { PRODUCT_DETAILS } from "@/config/productDetails";
import { CALCULATOR_PRODUCTS } from "@/config/calculatorProducts";
import { PRODUCTS } from "@/config/products";
import { PAVING_STONE_IMAGE_MAP } from "@/config/pavingStoneImages";

const DEFAULT_FALLBACK_IMAGE = "/images/products/pumice-blocks/pemzablok.png";

/**
 * Resolves the display image for a calculator product or variant using stable IDs.
 * Supporting color- and size-specific custom asset lookup for paving stones.
 */
export function getProductImage(
  categoryId?: string,
  variantId?: string,
  colorId?: string,
  sizeId?: string
): string {
  if (!categoryId) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  // 1. Paving Stones configuration-specific asset lookup
  if (categoryId === "paving-stones" && variantId) {
    const defaultSize = variantId === "paving-type-1" ? "55-130-130" : "55-100-200";
    const resolvedSize = sizeId || defaultSize;
    const resolvedColor = colorId || "gray";
    
    const customImage = PAVING_STONE_IMAGE_MAP[variantId]?.[resolvedSize]?.[resolvedColor];
    if (customImage) {
      return customImage;
    }
  }

  // 2. Check PRODUCT_DETAILS
  const detailConfig = PRODUCT_DETAILS[categoryId];
  if (detailConfig && detailConfig.variants && detailConfig.variants.length > 0) {
    if (variantId) {
      const matchedVariant = detailConfig.variants.find(
        (v) => v.id === variantId || v.calculatorConfig?.calculatorVariantId === variantId
      );
      if (matchedVariant?.image) {
        return matchedVariant.image;
      }
    }
    const defaultVariant =
      detailConfig.variants.find((v) => v.id === detailConfig.defaultVariantId) ||
      detailConfig.variants[0];
    if (defaultVariant?.image) {
      return defaultVariant.image;
    }
  }

  // 3. Check CALCULATOR_PRODUCTS
  const calcCat = CALCULATOR_PRODUCTS.find((p) => p.id === categoryId);
  if (calcCat) {
    if (variantId && calcCat.variants) {
      const calcVariant = calcCat.variants.find((v) => v.id === variantId);
      if (calcVariant?.image && !calcVariant.image.endsWith(".svg")) {
        return calcVariant.image;
      }
    }
    if (calcCat.image && !calcCat.image.endsWith(".svg")) {
      return calcCat.image;
    }
  }

  // 4. Check PRODUCTS catalog list
  const catalogProduct = PRODUCTS.find((p) => p.id === categoryId || p.slug === categoryId);
  if (catalogProduct?.image && !catalogProduct.image.endsWith(".svg")) {
    return catalogProduct.image;
  }

  // 5. Default Fallback
  return DEFAULT_FALLBACK_IMAGE;
}
