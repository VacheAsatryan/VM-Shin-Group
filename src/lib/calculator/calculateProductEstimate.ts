import type {
  ProductCategoryConfig,
  ProductVariantConfig,
  CalculatorProductInput,
  CalculationMetrics,
  CalculationResult,
} from "./calculator.types";
import { calculateWallBlocks } from "./strategies/calculateWallBlocks";
import { calculatePavingArea } from "./strategies/calculatePavingArea";
import { calculateCurbstones } from "./strategies/calculateCurbstones";
import { calculateConcreteVolume } from "./strategies/calculateConcreteVolume";
import { calculateQuantityProduct } from "./strategies/calculateQuantityProduct";
import { calculateFloorSlabs } from "./strategies/calculateFloorSlabs";
import { calculateProductPrice } from "./pricing/calculateProductPrice";
import { calculateDeliveryPrice } from "./pricing/calculateDeliveryPrice";
import { PRODUCT_DETAILS } from "@/config/productDetails";

export function calculateProductEstimate(
  categoryConfig: ProductCategoryConfig,
  input: CalculatorProductInput,
  variant: ProductVariantConfig
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
    case "floor_slabs":
      metrics = calculateFloorSlabs(input, variant);
      break;
  }

  let accessoriesTotalPerUnit = 0;
  if (input.accessories && Object.keys(input.accessories).length > 0) {
    const productDetail = Object.values(PRODUCT_DETAILS).find(
      (p) => p.calculatorProductId === categoryConfig.id
    );
    if (productDetail && productDetail.accessoryGroups) {
      for (const [groupId, optionId] of Object.entries(input.accessories)) {
        const group = productDetail.accessoryGroups.find((g) => g.id === groupId);
        if (group) {
          const option = group.options.find((o) => o.id === optionId);
          if (option) {
            accessoriesTotalPerUnit += option.priceAmount;
          }
        }
      }
    }
  }

  const baseProductSubtotal = calculateProductPrice(metrics, variant);
  const accessoriesTotal = accessoriesTotalPerUnit * (metrics.primaryQuantity || 1);
  const productSubtotal = baseProductSubtotal + accessoriesTotal;
  
  const deliveryEstimate = calculateDeliveryPrice();
  const estimatedTotal = productSubtotal + (deliveryEstimate || 0);

  return {
    category: categoryConfig.id,
    variant,
    input,
    metrics,
    pricing: {
      productSubtotal,
      accessoriesTotal,
      deliveryEstimate,
      estimatedTotal,
      currency: "AMD",
      isDemoPricing: true,
      priceStatus: variant.priceStatus,
    },
  };
}
