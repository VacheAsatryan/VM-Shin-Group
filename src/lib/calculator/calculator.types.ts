export type ProductCategoryType =
  | "pemzablok"
  | "concrete-block"
  | "concrete"
  | "paving-stones"
  | "tiles"
  | "curbstones"
  | "manholes";

export type PricingUnit =
  | "per_item"
  | "per_sq_meter"
  | "per_linear_meter"
  | "per_cubic_meter"
  | "per_pallet";

export interface ProductVariantConfig {
  id: string;
  nameKey: string;
  image?: string;
  lengthMeters?: number;
  widthMeters?: number;
  heightMeters?: number;
  thicknessCm?: number;
  itemsPerSqMeter?: number;
  itemsPerLinearMeter?: number;
  itemsPerPallet?: number;
  pricePerUnit: number;
  pricingUnit: PricingUnit;
  priceStatus?: "to_be_confirmed" | "confirmed";
}

export interface ProductCategoryConfig {
  id: ProductCategoryType;
  nameKey: string;
  unitLabelKey: string;
  image: string;
  calculationType: "wall_blocks" | "paving_area" | "curbstones" | "concrete_volume" | "quantity_product";
  variants: ProductVariantConfig[];
}

// Discriminated Unions for Inputs
export interface WallBlockInput {
  type: "wall_blocks";
  mode?: "dimensions" | "quantity";
  lengthMeters: number;
  heightMeters: number;
  wallCount: number;
  quantity?: number;
  variantId: string;
  reservePercent: number;
  accessories?: Record<string, string>;
}

export interface PavingAreaInput {
  type: "paving_area";
  mode?: "dimensions" | "quantity";
  lengthMeters: number;
  widthMeters: number;
  quantity?: number;
  variantId: string;
  reservePercent: number;
  accessories?: Record<string, string>;
}

export interface CurbstonesInput {
  type: "curbstones";
  mode?: "dimensions" | "quantity";
  linearLengthMeters: number;
  quantity?: number;
  variantId: string;
  reservePercent: number;
  accessories?: Record<string, string>;
}

export interface ConcreteVolumeInput {
  type: "concrete_volume";
  mode: "direct" | "dimensions";
  directVolumeM3: number;
  lengthMeters: number;
  widthMeters: number;
  depthMeters: number;
  variantId: string;
  reservePercent: number;
  accessories?: Record<string, string>;
}

export interface QuantityProductInput {
  type: "quantity_product";
  quantity: number;
  variantId: string;
  accessories?: Record<string, string>;
}

export type CalculatorProductInput =
  | WallBlockInput
  | PavingAreaInput
  | CurbstonesInput
  | ConcreteVolumeInput
  | QuantityProductInput;

// Calculation Output Data
export interface CalculationMetrics {
  primaryQuantity: number;
  primaryUnitKey: string;
  secondaryQuantity?: number;
  secondaryUnitKey?: string;
  palletsCount?: number;
  coverageAreaSqMeters?: number;
  coverageLinearMeters?: number;
  volumeM3?: number;
}

export interface PricingBreakdown {
  productSubtotal: number;
  accessoriesTotal?: number;
  deliveryEstimate: number | null;
  estimatedTotal: number;
  currency: string;
  isDemoPricing: boolean;
  priceStatus?: "to_be_confirmed" | "confirmed";
}

export interface CalculationResult {
  category: ProductCategoryType;
  variant: ProductVariantConfig;
  input: CalculatorProductInput;
  metrics: CalculationMetrics;
  pricing: PricingBreakdown;
}

export interface EstimateSummaryPayload {
  category: ProductCategoryType;
  variantId: string;
  input: CalculatorProductInput;
  metrics: CalculationMetrics;
  pricing: PricingBreakdown;
  accessories?: Record<string, string>;
  deliveryAddress?: string;
  estimatedDistanceKm?: number;
  isDemoData: true;
  timestamp: string;
  productName?: string;
  variantName?: string;
  imageFilename?: string;
  note?: string;
}
