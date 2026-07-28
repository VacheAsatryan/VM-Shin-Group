import { CALCULATOR_PRODUCTS } from "@/config/calculatorProducts";
import type { ProductCategoryConfig, ProductVariantConfig } from "@/lib/calculator/calculator.types";
import type { LocaleCode } from "./order.types";
import hyMessages from "../../../messages/hy.json";
import ruMessages from "../../../messages/ru.json";
import enMessages from "../../../messages/en.json";

// Typed translation dictionary map for locale resolution
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MESSAGES: Record<LocaleCode, any> = {
  hy: hyMessages,
  ru: ruMessages,
  en: enMessages,
};

export interface ResolvedProductData {
  isValid: boolean;
  reason?: string;
  category?: ProductCategoryConfig;
  variant?: ProductVariantConfig | null;
  canonicalProductName: string;
  canonicalVariantName: string | null;
  canonicalUnit: string;
  canonicalUnitPrice: number;
}

/**
 * Resolves submitted productSlug and variant identifier against the authoritative server-side catalog.
 * Guarantees commercial pricing, localized titles, and product metadata are server-controlled.
 */
export function resolveCanonicalProduct(
  productSlug: string,
  variantIdOrName?: string | null,
  locale: LocaleCode = "hy"
): ResolvedProductData {
  const trimmedSlug = (productSlug || "").trim();
  if (!trimmedSlug) {
    return {
      isValid: false,
      reason: "Product ID / Slug is required.",
      canonicalProductName: "",
      canonicalVariantName: null,
      canonicalUnit: "pcs",
      canonicalUnitPrice: 0,
    };
  }

  // 1. Strict Locale Validation
  if (!["hy", "ru", "en"].includes(locale)) {
    return {
      isValid: false,
      reason: `Unsupported locale: '${locale}'. Acceptable values: 'hy', 'ru', 'en'.`,
      canonicalProductName: "",
      canonicalVariantName: null,
      canonicalUnit: "pcs",
      canonicalUnitPrice: 0,
    };
  }

  const localeMessages = MESSAGES[locale] || MESSAGES.hy;

  // 2. Locate Product Category
  const category = CALCULATOR_PRODUCTS.find((p) => p.id === trimmedSlug);
  if (!category) {
    return {
      isValid: false,
      reason: `Unknown product ID: '${trimmedSlug}'`,
      canonicalProductName: "",
      canonicalVariantName: null,
      canonicalUnit: "pcs",
      canonicalUnitPrice: 0,
    };
  }

  // 3. Resolve Localized Category Title
  const categoryNameKey = category.nameKey || category.id;
  const canonicalProductName: string =
    localeMessages?.calculator?.categories?.[categoryNameKey] ||
    categoryNameKey;

  // 4. Resolve Unit
  const canonicalUnit = (category.unitLabelKey || "pcs").slice(0, 20);

  // 5. Resolve Variant
  const trimmedVariant = (variantIdOrName || "").trim();
  let matchedVariant: ProductVariantConfig | null = null;

  if (trimmedVariant) {
    matchedVariant =
      category.variants.find(
        (v) => v.id === trimmedVariant || v.nameKey === trimmedVariant
      ) || null;

    if (!matchedVariant) {
      return {
        isValid: false,
        reason: `Variant '${trimmedVariant}' does not belong to product '${trimmedSlug}'`,
        canonicalProductName,
        canonicalVariantName: null,
        canonicalUnit,
        canonicalUnitPrice: 0,
      };
    }
  } else if (category.variants.length > 0) {
    matchedVariant = category.variants[0];
  }

  const variantNameKey = matchedVariant?.nameKey || matchedVariant?.id;
  const canonicalVariantName: string | null = variantNameKey
    ? localeMessages?.calculator?.blocks?.[variantNameKey] || variantNameKey
    : null;

  // 6. Enforce Non-Zero Commercial Price
  const canonicalUnitPrice = matchedVariant ? matchedVariant.pricePerUnit : 0;
  if (
    !matchedVariant ||
    canonicalUnitPrice <= 0 ||
    matchedVariant.priceStatus === "to_be_confirmed"
  ) {
    return {
      isValid: false,
      reason: `Commercial price is not available for product '${trimmedSlug}' / variant '${trimmedVariant}'. Zero-price commercial orders are forbidden.`,
      canonicalProductName,
      canonicalVariantName,
      canonicalUnit,
      canonicalUnitPrice: 0,
    };
  }

  return {
    isValid: true,
    category,
    variant: matchedVariant,
    canonicalProductName: canonicalProductName.slice(0, 150),
    canonicalVariantName: canonicalVariantName ? canonicalVariantName.slice(0, 150) : null,
    canonicalUnit,
    canonicalUnitPrice: Math.round(canonicalUnitPrice),
  };
}
