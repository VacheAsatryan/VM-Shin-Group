import type {
  ProductCategoryConfig,
  ProductVariantConfig,
  CalculatorProductInput,
  CalculationResult,
  CalculationMetrics,
} from "./calculator.types";
import { calculateWallBlocks } from "./strategies/calculateWallBlocks";
import { calculatePavingArea } from "./strategies/calculatePavingArea";
import { calculateCurbstones } from "./strategies/calculateCurbstones";
import { calculateConcreteVolume } from "./strategies/calculateConcreteVolume";
import { calculateQuantityProduct } from "./strategies/calculateQuantityProduct";
import { calculateProductPrice } from "./pricing/calculateProductPrice";
import { calculateDeliveryPrice } from "./pricing/calculateDeliveryPrice";
import { DELIVERY_CONFIG } from "@/config/delivery";

export function calculateProductEstimate(
  categoryConfig: ProductCategoryConfig,
  input: CalculatorProductInput,
  variant: ProductVariantConfig,
  deliveryEnabled: boolean = true,
  distanceKm: number = DELIVERY_CONFIG.defaultDistanceKm
): CalculationResult {
  let metrics: CalculationMetrics;

  switch (input.type) {
    case "wall_blocks":
      metrics = calculateWallBlocks(input, variant);
      break;
    case "paving_area":
      metrics = calculatePavingArea(input, variant);
      break;
    case "curbstones":
      metrics = calculateCurbstones(input, variant);
      break;
    case "concrete_volume":
      metrics = calculateConcreteVolume(input);
      break;
    case "quantity_product":
      metrics = calculateQuantityProduct(input, variant);
      break;
  }

  const productSubtotal = calculateProductPrice(metrics, variant);
  const deliveryEstimate = calculateDeliveryPrice(distanceKm, deliveryEnabled);
  const estimatedTotal = productSubtotal + deliveryEstimate;

  return {
    category: categoryConfig.id,
    variant,
    metrics,
    pricing: {
      productSubtotal,
      deliveryEstimate,
      estimatedTotal,
      currency: "AMD",
      isDemoPricing: true,
    },
  };
}
