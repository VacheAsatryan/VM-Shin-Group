import { PRODUCT_DETAILS } from "@/config/productDetails";
import { CALCULATOR_PRODUCTS } from "@/config/calculatorProducts";
import { PRODUCTS } from "@/config/products";

const DEFAULT_FALLBACK_IMAGE = "/images/products/pumice-blocks/pemzablok.png";

/**
 * Resolves the display image for a calculator product or variant using stable IDs.
 *
 * Lookup order:
 * 1. PRODUCT_DETAILS[categoryId] -> exact matching variant image by ID or calculatorVariantId
 * 2. PRODUCT_DETAILS[categoryId] -> default variant image
 * 3. CALCULATOR_PRODUCTS -> exact matching variant image
 * 4. CALCULATOR_PRODUCTS -> category image (if not a placeholder SVG)
 * 5. PRODUCTS catalog image
 * 6. Fallback generic image
 */
export function getProductImage(categoryId?: string, variantId?: string): string {
  if (!categoryId) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  // 1. Check PRODUCT_DETAILS
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

  // 2. Check CALCULATOR_PRODUCTS
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

  // 3. Check PRODUCTS catalog list
  const catalogProduct = PRODUCTS.find((p) => p.id === categoryId || p.slug === categoryId);
  if (catalogProduct?.image && !catalogProduct.image.endsWith(".svg")) {
    return catalogProduct.image;
  }

  // 4. Default Fallback
  return DEFAULT_FALLBACK_IMAGE;
}
