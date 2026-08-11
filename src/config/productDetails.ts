/**
 * Future Naming & File Placement Rule:
 * Every product image must be stored inside its dedicated product category folder:
 * - public/images/products/pumice-blocks/
 * - public/images/products/concrete-blocks/
 * - public/images/products/ready-mix-concrete/
 * - public/images/products/paving-stones/
 * - public/images/products/curbstones/
 * - public/images/products/manholes/
 * - public/images/products/tiles/
 * 
 * Future real images must never be added directly to public/images/products/.
 */

export interface VariantPrice {
  amount: number;
  currency: string;
  unitKey: string; // e.g., "pcs" or "m3"
}

export interface VariantSpecification {
  labelKey: string;
  valueRaw: string;
}

export interface VariantCalculatorConfiguration {
  calculatorProductId: string;
  calculatorVariantId: string;
  lengthMeters: number;
  heightMeters: number;
  thicknessCm: number;
  itemsPerPallet: number;
  pricePerUnit: number;
  weightKg: number;
}

export interface PavingStoneSizeOption {
  id: string;
  heightMm: number;
  widthMm: number;
  lengthMm: number;
  display: string;
}

export interface PavingStoneColorOption {
  id: string;
  nameKey: string;
  hex?: string;
}

export interface ProductVariant {
  id: string;
  slug: string;
  sizeLabel: string; // e.g. "6 × 20 × 40"
  sizeLabelKey?: string;
  subtitleKey: string; // e.g. "variants.subtitle6"
  dimensions: string; // "400 × 60 × 200 мм"
  price: VariantPrice;
  priceStatus?: "to_be_confirmed" | "confirmed";
  weightKg: number;
  itemsPerPallet: number;
  inStock: boolean;
  badgeKey?: string;
  image: string; // "/images/products/pumice-6x20x40.webp"
  thumbnail?: string; // "/images/products/pumice-6x20x40.webp"
  altKey?: string; // "variants.alt6"
  fallbackImage: string; // "/images/products/pemzablok.png"
  descriptionKey: string;
  specs: VariantSpecification[];
  calculatorConfig: VariantCalculatorConfiguration;
  type?: "manhole" | "cover";
  size?: "1000" | "1500";
  titleKey?: string;
  availableSizes?: PavingStoneSizeOption[];
  availableColors?: PavingStoneColorOption[];
}

export interface ProductSpec {
  labelKey: string;
  valueKey?: string;
  valueRaw?: string;
}

export interface ProductFeature {
  icon: "eco" | "shield" | "flame" | "ruler" | "coins" | "layers" | "truck" | "check";
  titleKey: string;
  descKey: string;
}

export interface ProductAccessoryOption {
  id: string;
  labelKey: string;
  priceAmount: number;
}

export interface ProductAccessoryGroup {
  id: string;
  nameKey: string;
  options: ProductAccessoryOption[];
}

export interface ProductDetailData {
  id: string;

  slug: string;
  translationKey: string;
  image: string;
  galleryImages: string[];
  badgeKey: string;
  calculatorProductId?: string;
  defaultVariantId: string;
  variants: ProductVariant[];
  specs: ProductSpec[];
  features: ProductFeature[];
  applicationKeys: string[];
  accessoryGroups?: ProductAccessoryGroup[];
}

export const PRODUCT_DETAILS: Record<string, ProductDetailData> = {
  pemzablok: {
    id: "pemzablok",
    slug: "pemzablok",
    translationKey: "pemzablok",
    image: "/images/products/pumice-blocks/pemzablok.png",
    galleryImages: ["/images/products/pumice-blocks/pemzablok.png"],
    badgeKey: "inStockFactory",
    calculatorProductId: "pemzablok",
    defaultVariantId: "pumice-20x20x40",
    variants: [
      {
        id: "pumice-6x20x40",
        slug: "pumice-6x20x40",
        sizeLabel: "6 × 20 × 40",
        subtitleKey: "variants.partitionThin",
        dimensions: "400 × 60 × 200 мм",
        price: { amount: 150, currency: "AMD", unitKey: "perPcs" },
        weightKg: 5.5,
        itemsPerPallet: 150,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/pumice-blocks/pumice-6x20x40.webp",
        thumbnail: "/images/products/pumice-blocks/pumice-6x20x40.webp",
        altKey: "calculator.blocks.block6",
        fallbackImage: "/images/products/pumice-blocks/pemzablok.png",
        descriptionKey: "variants.desc6",
        specs: [
          { labelKey: "dimensions", valueRaw: "400 × 60 × 200 мм" },
          { labelKey: "density", valueRaw: "800 - 850 кг/м³" },
          { labelKey: "weightPerUnit", valueRaw: "5.5 кг" },
          { labelKey: "compressiveStrength", valueRaw: "M35" },
          { labelKey: "thermalConductivity", valueRaw: "0.18 Вт/(м·°C)" },
          { labelKey: "soundInsulation", valueRaw: "44 дБ" },
          { labelKey: "fireResistance", valueRaw: "REI 120" },
          { labelKey: "palletCapacity", valueRaw: "150 шт" },
        ],
        calculatorConfig: {
          calculatorProductId: "pemzablok",
          calculatorVariantId: "pumice-6x20x40",
          lengthMeters: 0.4,
          heightMeters: 0.2,
          thicknessCm: 6,
          itemsPerPallet: 150,
          pricePerUnit: 150,
          weightKg: 5.5,
        },
      },
      {
        id: "pumice-10x20x40",
        slug: "pumice-10x20x40",
        sizeLabel: "10 × 20 × 40",
        subtitleKey: "variants.partitionStandard",
        dimensions: "400 × 100 × 200 мм",
        price: { amount: 155, currency: "AMD", unitKey: "perPcs" },
        weightKg: 8.0,
        itemsPerPallet: 100,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/pumice-blocks/pumice-10x20x40.webp",
        thumbnail: "/images/products/pumice-blocks/pumice-10x20x40.webp",
        altKey: "calculator.blocks.block10",
        fallbackImage: "/images/products/pumice-blocks/pemzablok.png",
        descriptionKey: "variants.desc10",
        specs: [
          { labelKey: "dimensions", valueRaw: "400 × 100 × 200 мм" },
          { labelKey: "density", valueRaw: "850 - 900 кг/м³" },
          { labelKey: "weightPerUnit", valueRaw: "8.0 кг" },
          { labelKey: "compressiveStrength", valueRaw: "M35" },
          { labelKey: "thermalConductivity", valueRaw: "0.19 Вт/(м·°C)" },
          { labelKey: "soundInsulation", valueRaw: "48 дБ" },
          { labelKey: "fireResistance", valueRaw: "REI 180" },
          { labelKey: "palletCapacity", valueRaw: "100 шт" },
        ],
        calculatorConfig: {
          calculatorProductId: "pemzablok",
          calculatorVariantId: "pumice-10x20x40",
          lengthMeters: 0.4,
          heightMeters: 0.2,
          thicknessCm: 10,
          itemsPerPallet: 100,
          pricePerUnit: 155,
          weightKg: 8.0,
        },
      },
      {
        id: "pumice-15x20x40",
        slug: "pumice-15x20x40",
        sizeLabel: "15 × 20 × 40",
        subtitleKey: "variants.semiBearing",
        dimensions: "400 × 150 × 200 мм",
        price: { amount: 200, currency: "AMD", unitKey: "perPcs" },
        weightKg: 11.5,
        itemsPerPallet: 75,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/pumice-blocks/pumice-15x20x40.webp",
        thumbnail: "/images/products/pumice-blocks/pumice-15x20x40.webp",
        altKey: "calculator.blocks.block15",
        fallbackImage: "/images/products/pumice-blocks/pemzablok.png",
        descriptionKey: "variants.desc15",
        specs: [
          { labelKey: "dimensions", valueRaw: "400 × 150 × 200 мм" },
          { labelKey: "density", valueRaw: "900 - 950 кг/м³" },
          { labelKey: "weightPerUnit", valueRaw: "11.5 кг" },
          { labelKey: "compressiveStrength", valueRaw: "M50" },
          { labelKey: "thermalConductivity", valueRaw: "0.20 Вт/(м·°C)" },
          { labelKey: "soundInsulation", valueRaw: "50 дБ" },
          { labelKey: "fireResistance", valueRaw: "REI 180" },
          { labelKey: "palletCapacity", valueRaw: "75 шт" },
        ],
        calculatorConfig: {
          calculatorProductId: "pemzablok",
          calculatorVariantId: "pumice-15x20x40",
          lengthMeters: 0.4,
          heightMeters: 0.2,
          thicknessCm: 15,
          itemsPerPallet: 75,
          pricePerUnit: 200,
          weightKg: 11.5,
        },
      },
      {
        id: "pumice-20x20x40",
        slug: "pumice-20x20x40",
        sizeLabel: "20 × 20 × 40",
        subtitleKey: "variants.loadBearingStandard",
        dimensions: "400 × 200 × 200 мм",
        price: { amount: 225, currency: "AMD", unitKey: "perPcs" },
        weightKg: 14.0,
        itemsPerPallet: 60,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/pumice-blocks/pumice-20x20x40.webp",
        thumbnail: "/images/products/pumice-blocks/pumice-20x20x40.webp",
        altKey: "calculator.blocks.block20",
        fallbackImage: "/images/products/pumice-blocks/pemzablok.png",
        descriptionKey: "variants.desc20",
        specs: [
          { labelKey: "dimensions", valueRaw: "400 × 200 × 200 мм" },
          { labelKey: "density", valueRaw: "950 - 1000 кг/м³" },
          { labelKey: "weightPerUnit", valueRaw: "14.0 кг" },
          { labelKey: "compressiveStrength", valueRaw: "M50" },
          { labelKey: "thermalConductivity", valueRaw: "0.21 Вт/(м·°C)" },
          { labelKey: "soundInsulation", valueRaw: "52 дБ" },
          { labelKey: "fireResistance", valueRaw: "REI 180" },
          { labelKey: "palletCapacity", valueRaw: "60 шт" },
        ],
        calculatorConfig: {
          calculatorProductId: "pemzablok",
          calculatorVariantId: "pumice-20x20x40",
          lengthMeters: 0.4,
          heightMeters: 0.2,
          thicknessCm: 20,
          itemsPerPallet: 60,
          pricePerUnit: 225,
          weightKg: 14.0,
        },
      },
      {
        id: "pumice-20x20x40-groove",
        slug: "pumice-20x20x40-groove",
        sizeLabel: "20 × 20 × 40 (Groove)",
        subtitleKey: "variants.loadBearingGroove",
        dimensions: "400 × 200 × 200 мм (Բաց / Паз)",
        price: { amount: 215, currency: "AMD", unitKey: "perPcs" },
        weightKg: 13.8,
        itemsPerPallet: 60,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/pumice-blocks/pumice-20x20x40-groove.webp",
        thumbnail: "/images/products/pumice-blocks/pumice-20x20x40-groove.webp",
        altKey: "calculator.blocks.block20Groove",
        fallbackImage: "/images/products/pumice-blocks/pemzablok.png",
        descriptionKey: "variants.desc20Groove",
        specs: [
          { labelKey: "dimensions", valueRaw: "400 × 200 × 200 мм (Шпунтованный)" },
          { labelKey: "density", valueRaw: "950 - 1000 кг/м³" },
          { labelKey: "weightPerUnit", valueRaw: "13.8 кг" },
          { labelKey: "compressiveStrength", valueRaw: "M50" },
          { labelKey: "thermalConductivity", valueRaw: "0.20 Вт/(м·°C)" },
          { labelKey: "soundInsulation", valueRaw: "53 дБ" },
          { labelKey: "fireResistance", valueRaw: "REI 180" },
          { labelKey: "palletCapacity", valueRaw: "60 шт" },
        ],
        calculatorConfig: {
          calculatorProductId: "pemzablok",
          calculatorVariantId: "pumice-20x20x40-groove",
          lengthMeters: 0.4,
          heightMeters: 0.2,
          thicknessCm: 20,
          itemsPerPallet: 60,
          pricePerUnit: 215,
          weightKg: 13.8,
        },
      },
    ],
    specs: [
      { labelKey: "dimensions", valueRaw: "400 × (60-200) × 200 мм" },
      { labelKey: "density", valueRaw: "800 - 1000 кг/м³" },
      { labelKey: "compressiveStrength", valueRaw: "M35 - M50" },
      { labelKey: "thermalConductivity", valueRaw: "0.18 - 0.22 Вт/(м·°C)" },
      { labelKey: "soundInsulation", valueRaw: "44 - 53 дБ" },
      { labelKey: "frostResistance", valueRaw: "F50+" },
      { labelKey: "fireResistance", valueRaw: "REI 180" },
    ],
    features: [
      {
        icon: "eco",
        titleKey: "features.ecoPumice.title",
        descKey: "features.ecoPumice.desc",
      },
      {
        icon: "shield",
        titleKey: "features.thermalInsulation.title",
        descKey: "features.thermalInsulation.desc",
      },
      {
        icon: "flame",
        titleKey: "features.fireproof.title",
        descKey: "features.fireproof.desc",
      },
      {
        icon: "ruler",
        titleKey: "features.preciseGeometry.title",
        descKey: "features.preciseGeometry.desc",
      },
      {
        icon: "layers",
        titleKey: "features.soundproofing.title",
        descKey: "features.soundproofing.desc",
      },
      {
        icon: "coins",
        titleKey: "features.costEffective.title",
        descKey: "features.costEffective.desc",
      },
    ],
    applicationKeys: [
      "applications.exteriorWalls",
      "applications.interiorPartitions",
      "applications.monolithicFill",
      "applications.soundproofWalls",
      "applications.privateResidential",
      "applications.commercialBuildings",
    ],
  },

  "concrete-block": {
    id: "concrete-block",
    slug: "concrete-block",
    translationKey: "concrete-block",
    image: "/images/products/concrete-blocks/concrete-block.png",
    galleryImages: ["/images/products/concrete-blocks/concrete-block.png"],
    badgeKey: "inStockFactory",
    calculatorProductId: "concrete-block",
    defaultVariantId: "slab-120",
    variants: [
      {
        id: "slab-120",
        slug: "slab-120",
        titleKey: "variants.slab120",
        sizeLabel: "1.20 մ",
        subtitleKey: "variants.slab120Subtitle",
        dimensions: "Լայնություն՝ 1.20 մ, Երկարություն՝ 2.90–6.30 մ",
        price: { amount: 8500, currency: "AMD", unitKey: "perSqM" },
        weightKg: 350,
        itemsPerPallet: 1,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/concrete-blocks/concrete-block.png",
        fallbackImage: "/images/products/concrete-blocks/concrete-block.png",
        descriptionKey: "descriptions.concrete-block",
        specs: [
          { labelKey: "width", valueRaw: "1.20 մ" },
          { labelKey: "lengthRange", valueRaw: "2.90 - 6.30 մ" },
        ],
        calculatorConfig: {
          calculatorProductId: "concrete-block",
          calculatorVariantId: "slab-120",
          lengthMeters: 3.0,
          heightMeters: 0.22,
          thicknessCm: 22,
          itemsPerPallet: 1,
          pricePerUnit: 8500,
          weightKg: 350,
        },
      },
      {
        id: "slab-060",
        slug: "slab-060",
        titleKey: "variants.slab060",
        sizeLabel: "0.60 մ",
        subtitleKey: "variants.slab060Subtitle",
        dimensions: "Լայնություն՝ 0.60 մ, Երկարություն՝ 2.90–6.30 մ",
        price: { amount: 8500, currency: "AMD", unitKey: "perSqM" },
        weightKg: 175,
        itemsPerPallet: 1,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/concrete-blocks/concrete-block.png",
        fallbackImage: "/images/products/concrete-blocks/concrete-block.png",
        descriptionKey: "descriptions.concrete-block",
        specs: [
          { labelKey: "width", valueRaw: "0.60 մ" },
          { labelKey: "lengthRange", valueRaw: "2.90 - 6.30 մ" },
        ],
        calculatorConfig: {
          calculatorProductId: "concrete-block",
          calculatorVariantId: "slab-060",
          lengthMeters: 3.0,
          heightMeters: 0.22,
          thicknessCm: 22,
          itemsPerPallet: 1,
          pricePerUnit: 8500,
          weightKg: 175,
        },
      },
    ],
    specs: [
      { labelKey: "width", valueRaw: "1.20 մ / 0.60 մ" },
      { labelKey: "lengthRange", valueRaw: "2.90 մ - 6.30 մ" },
    ],
    features: [
      {
        icon: "shield",
        titleKey: "features.highStrength.title",
        descKey: "features.highStrength.desc",
      },
    ],
    applicationKeys: ["applications.monolithicStructures"],
  },

  concrete: {
    id: "concrete",
    slug: "concrete",
    translationKey: "concrete",
    image: "/images/products/ready-mix-concrete/concrete.png",
    galleryImages: ["/images/products/ready-mix-concrete/concrete.png"],
    badgeKey: "inStockFactory",
    calculatorProductId: "concrete",
    defaultVariantId: "concrete-m300",
    variants: [
      {
        id: "concrete-m100",
        slug: "concrete-m100",
        sizeLabel: "M100 (B7.5)",
        subtitleKey: "variants.concreteM100",
        dimensions: "1 м³",
        price: { amount: 25000, currency: "AMD", unitKey: "perM3" },
        weightKg: 2400,
        itemsPerPallet: 1,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/ready-mix-concrete/concrete.png",
        fallbackImage: "/images/products/ready-mix-concrete/concrete.png",
        descriptionKey: "descriptions.concrete",
        specs: [{ labelKey: "grades", valueRaw: "M100 (B7.5)" }],
        calculatorConfig: {
          calculatorProductId: "concrete",
          calculatorVariantId: "concrete-m100",
          lengthMeters: 1,
          heightMeters: 1,
          thicknessCm: 100,
          itemsPerPallet: 1,
          pricePerUnit: 25000,
          weightKg: 2400,
        },
      },
      {
        id: "concrete-m150",
        slug: "concrete-m150",
        sizeLabel: "M150 (B12.5)",
        subtitleKey: "variants.concreteM150",
        dimensions: "1 м³",
        price: { amount: 27000, currency: "AMD", unitKey: "perM3" },
        weightKg: 2400,
        itemsPerPallet: 1,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/ready-mix-concrete/concrete.png",
        fallbackImage: "/images/products/ready-mix-concrete/concrete.png",
        descriptionKey: "descriptions.concrete",
        specs: [{ labelKey: "grades", valueRaw: "M150 (B12.5)" }],
        calculatorConfig: {
          calculatorProductId: "concrete",
          calculatorVariantId: "concrete-m150",
          lengthMeters: 1,
          heightMeters: 1,
          thicknessCm: 100,
          itemsPerPallet: 1,
          pricePerUnit: 27000,
          weightKg: 2400,
        },
      },
      {
        id: "concrete-m200",
        slug: "concrete-m200",
        sizeLabel: "M200 (B15)",
        subtitleKey: "variants.concreteM200",
        dimensions: "1 м³",
        price: { amount: 30000, currency: "AMD", unitKey: "perM3" },
        weightKg: 2400,
        itemsPerPallet: 1,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/ready-mix-concrete/concrete.png",
        fallbackImage: "/images/products/ready-mix-concrete/concrete.png",
        descriptionKey: "descriptions.concrete",
        specs: [{ labelKey: "grades", valueRaw: "M200 (B15)" }],
        calculatorConfig: {
          calculatorProductId: "concrete",
          calculatorVariantId: "concrete-m200",
          lengthMeters: 1,
          heightMeters: 1,
          thicknessCm: 100,
          itemsPerPallet: 1,
          pricePerUnit: 30000,
          weightKg: 2400,
        },
      },
      {
        id: "concrete-m250",
        slug: "concrete-m250",
        sizeLabel: "M250 (B20)",
        subtitleKey: "variants.concreteM250",
        dimensions: "1 м³",
        price: { amount: 31000, currency: "AMD", unitKey: "perM3" },
        weightKg: 2400,
        itemsPerPallet: 1,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/ready-mix-concrete/concrete.png",
        fallbackImage: "/images/products/ready-mix-concrete/concrete.png",
        descriptionKey: "descriptions.concrete",
        specs: [{ labelKey: "grades", valueRaw: "M250 (B20)" }],
        calculatorConfig: {
          calculatorProductId: "concrete",
          calculatorVariantId: "concrete-m250",
          lengthMeters: 1,
          heightMeters: 1,
          thicknessCm: 100,
          itemsPerPallet: 1,
          pricePerUnit: 31000,
          weightKg: 2400,
        },
      },
      {
        id: "concrete-m300",
        slug: "concrete-m300",
        sizeLabel: "M300 (B22.5)",
        subtitleKey: "variants.concreteM300",
        dimensions: "1 м³",
        price: { amount: 32000, currency: "AMD", unitKey: "perM3" },
        weightKg: 2400,
        itemsPerPallet: 1,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/ready-mix-concrete/concrete.png",
        fallbackImage: "/images/products/ready-mix-concrete/concrete.png",
        descriptionKey: "descriptions.concrete",
        specs: [{ labelKey: "grades", valueRaw: "M300 (B22.5)" }],
        calculatorConfig: {
          calculatorProductId: "concrete",
          calculatorVariantId: "concrete-m300",
          lengthMeters: 1,
          heightMeters: 1,
          thicknessCm: 100,
          itemsPerPallet: 1,
          pricePerUnit: 32000,
          weightKg: 2400,
        },
      },
      {
        id: "concrete-m350",
        slug: "concrete-m350",
        sizeLabel: "M350 (B25)",
        subtitleKey: "variants.concreteM350",
        dimensions: "1 м³",
        price: { amount: 34000, currency: "AMD", unitKey: "perM3" },
        weightKg: 2400,
        itemsPerPallet: 1,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/ready-mix-concrete/concrete.png",
        fallbackImage: "/images/products/ready-mix-concrete/concrete.png",
        descriptionKey: "descriptions.concrete",
        specs: [{ labelKey: "grades", valueRaw: "M350 (B25)" }],
        calculatorConfig: {
          calculatorProductId: "concrete",
          calculatorVariantId: "concrete-m350",
          lengthMeters: 1,
          heightMeters: 1,
          thicknessCm: 100,
          itemsPerPallet: 1,
          pricePerUnit: 34000,
          weightKg: 2400,
        },
      },
      {
        id: "concrete-m400",
        slug: "concrete-m400",
        sizeLabel: "M400 (B30)",
        subtitleKey: "variants.concreteM400",
        dimensions: "1 м³",
        price: { amount: 38000, currency: "AMD", unitKey: "perM3" },
        weightKg: 2400,
        itemsPerPallet: 1,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/ready-mix-concrete/concrete.png",
        fallbackImage: "/images/products/ready-mix-concrete/concrete.png",
        descriptionKey: "descriptions.concrete",
        specs: [{ labelKey: "grades", valueRaw: "M400 (B30)" }],
        calculatorConfig: {
          calculatorProductId: "concrete",
          calculatorVariantId: "concrete-m400",
          lengthMeters: 1,
          heightMeters: 1,
          thicknessCm: 100,
          itemsPerPallet: 1,
          pricePerUnit: 38000,
          weightKg: 2400,
        },
      },
    ],
    specs: [{ labelKey: "grades", valueRaw: "M100 - M400 (B7.5 - B30)" }],
    features: [
      {
        icon: "truck",
        titleKey: "features.expressDelivery.title",
        descKey: "features.expressDelivery.desc",
      },
    ],
    applicationKeys: [
      "applications.monolithicStructures",
      "applications.foundations",
    ],
  },

  "paving-stones": {
    id: "paving-stones",
    slug: "paving-stones",
    translationKey: "paving-stones",
    image: "/images/products/paving-stones/paving-stone-type-1.png",
    galleryImages: [
      "/images/products/paving-stones/paving-stone-type-1.png",
      "/images/products/paving-stones/paving-stone-type-2.png",
    ],
    badgeKey: "inStockFactory",
    calculatorProductId: "paving-stones",
    defaultVariantId: "paving-type-1",
    variants: [
      {
        id: "paving-type-1",
        slug: "paving-type-1",
        titleKey: "variants.pavingType1Title",
        sizeLabel: "55 × 130 × 130 – 55 × 230 × 265 mm",
        subtitleKey: "variants.pavingStonesSubtitle",
        dimensions: "55 × 130 × 130, 55 × 130 × 165, 55 × 130 × 230, 55 × 230 × 265 mm",
        price: { amount: 4000, currency: "AMD", unitKey: "perSqM" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/paving-stones/paving-stone-type-1.png",
        fallbackImage: "/images/products/paving-stones/paving-stones.png",
        descriptionKey: "descriptions.paving-stones",
        specs: [{ labelKey: "thickness", valueRaw: "55 mm" }],
        calculatorConfig: {
          calculatorProductId: "paving-stones",
          calculatorVariantId: "paving-type-1",
          lengthMeters: 0,
          heightMeters: 0.055,
          thicknessCm: 5.5,
          itemsPerPallet: 0,
          pricePerUnit: 4000,
          weightKg: 0,
        },
        availableSizes: [
          { id: "55-130-130", heightMm: 55, widthMm: 130, lengthMm: 130, display: "55 × 130 × 130 mm" },
          { id: "55-130-165", heightMm: 55, widthMm: 130, lengthMm: 165, display: "55 × 130 × 165 mm" },
          { id: "55-130-230", heightMm: 55, widthMm: 130, lengthMm: 230, display: "55 × 130 × 230 mm" },
          { id: "55-230-265", heightMm: 55, widthMm: 230, lengthMm: 265, display: "55 × 230 × 265 mm" },
        ],
        availableColors: [
          { id: "gray", nameKey: "colors.gray", hex: "#8E949B" },
          { id: "light-gray", nameKey: "colors.lightGray", hex: "#C6CCD3" },
          { id: "dark-gray", nameKey: "colors.darkGray", hex: "#4E545B" },
          { id: "red", nameKey: "colors.red", hex: "#9E3838" },
          { id: "brown", nameKey: "colors.brown", hex: "#6B4337" },
          { id: "sand", nameKey: "colors.sand", hex: "#D6B887" },
          { id: "mix", nameKey: "colors.mix", hex: "linear-gradient(135deg, #9E3838 0%, #6B4337 50%, #D6B887 100%)" },
        ],
      },
      {
        id: "paving-type-2",
        slug: "paving-type-2",
        titleKey: "variants.pavingType2Title",
        sizeLabel: "55 × 100 × 200 mm",
        subtitleKey: "variants.pavingStonesSubtitle",
        dimensions: "55 × 100 × 200 mm",
        price: { amount: 4000, currency: "AMD", unitKey: "perSqM" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/paving-stones/paving-stone-type-2.png",
        fallbackImage: "/images/products/paving-stones/paving-stones.png",
        descriptionKey: "descriptions.paving-stones",
        specs: [{ labelKey: "thickness", valueRaw: "55 mm" }],
        calculatorConfig: {
          calculatorProductId: "paving-stones",
          calculatorVariantId: "paving-type-2",
          lengthMeters: 0.2,
          heightMeters: 0.055,
          thicknessCm: 5.5,
          itemsPerPallet: 0,
          pricePerUnit: 4000,
          weightKg: 0,
        },
        availableSizes: [
          { id: "55-100-200", heightMm: 55, widthMm: 100, lengthMm: 200, display: "55 × 100 × 200 mm" },
        ],
        availableColors: [
          { id: "gray", nameKey: "colors.gray", hex: "#8E949B" },
          { id: "light-gray", nameKey: "colors.lightGray", hex: "#C6CCD3" },
          { id: "dark-gray", nameKey: "colors.darkGray", hex: "#4E545B" },
          { id: "red", nameKey: "colors.red", hex: "#9E3838" },
          { id: "brown", nameKey: "colors.brown", hex: "#6B4337" },
          { id: "sand", nameKey: "colors.sand", hex: "#D6B887" },
          { id: "mix", nameKey: "colors.mix", hex: "linear-gradient(135deg, #9E3838 0%, #6B4337 50%, #D6B887 100%)" },
        ],
      },
    ],
    specs: [{ labelKey: "thickness", valueRaw: "55 мм" }],
    features: [
      {
        icon: "shield",
        titleKey: "features.highWearResistance.title",
        descKey: "features.highWearResistance.desc",
      },
    ],
    applicationKeys: ["applications.pedestrianWalkways"],
  },

  curbstones: {
    id: "curbstones",
    slug: "curbstones",
    translationKey: "curbstones",
    image: "/images/products/curbstones/curbstones.png",
    galleryImages: ["/images/products/curbstones/curbstones.png"],
    badgeKey: "inStockFactory",
    calculatorProductId: "curbstones",
    defaultVariantId: "curbstone-road",
    variants: [
      {
        id: "curbstone-road",
        slug: "curbstone-road",
        sizeLabel: "80 × 15 × 30",
        subtitleKey: "variants.curbstoneRoad",
        dimensions: "80 × 15 × 30 cm",
        price: { amount: 4000, currency: "AMD", unitKey: "perSqM" },
        weightKg: 85,
        itemsPerPallet: 18,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/curbstones/curbstones.png",
        fallbackImage: "/images/products/curbstones/curbstones.png",
        descriptionKey: "descriptions.curbstoneRoad",
        specs: [{ labelKey: "dimensions", valueRaw: "80 × 15 × 30 cm" }],
        calculatorConfig: {
          calculatorProductId: "curbstones",
          calculatorVariantId: "curbstone-road",
          lengthMeters: 0.8,
          heightMeters: 0.3,
          thicknessCm: 15,
          itemsPerPallet: 18,
          pricePerUnit: 4000,
          weightKg: 85,
        },
      },
      {
        id: "curbstone-garden",
        slug: "curbstone-garden",
        sizeLabel: "80 × 8 × 20",
        subtitleKey: "variants.curbstoneGarden",
        dimensions: "80 × 8 × 20 cm",
        price: { amount: 4000, currency: "AMD", unitKey: "perSqM" },
        weightKg: 30,
        itemsPerPallet: 36,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/curbstones/curbstones.png",
        fallbackImage: "/images/products/curbstones/curbstones.png",
        descriptionKey: "descriptions.curbstoneGarden",
        specs: [{ labelKey: "dimensions", valueRaw: "80 × 8 × 20 cm" }],
        calculatorConfig: {
          calculatorProductId: "curbstones",
          calculatorVariantId: "curbstone-garden",
          lengthMeters: 0.8,
          heightMeters: 0.2,
          thicknessCm: 8,
          itemsPerPallet: 36,
          pricePerUnit: 4000,
          weightKg: 30,
        },
      },
    ],
    specs: [
      {
        labelKey: "dimensions",
        valueRaw: "80 × 15 × 30 cm / 80 × 8 × 20 cm",
      },
    ],
    features: [
      {
        icon: "shield",
        titleKey: "features.roadGradeDurability.title",
        descKey: "features.roadGradeDurability.desc",
      },
    ],
    applicationKeys: ["applications.roadBordering", "applications.sidewalkEdge"],
  },

  manholes: {
    id: "manholes",
    slug: "manholes",
    translationKey: "manholes",
    image: "/images/products/manholes/manhole-small-v1.webp",
    galleryImages: ["/images/products/manholes/manhole-small-v1.webp"],
    badgeKey: "inStockFactory",
    calculatorProductId: "manholes",
    defaultVariantId: "manhole-small-v1",
    variants: [
      {
        id: "manhole-small-v1",
        slug: "manhole-small-v1",
        titleKey: "variants.manholeSmallV1",
        sizeLabel: "1000 мм",
        subtitleKey: "variants.manholeSubtitle",
        dimensions: "1000 мм",
        price: { amount: 18000, currency: "AMD", unitKey: "perPcs" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/manholes/manhole-small-v1.webp",
        fallbackImage: "/images/products/manholes/manholes.png",
        descriptionKey: "descriptions.manholes",
        specs: [{ labelKey: "dimensions", valueRaw: "1000 мм" }],
        calculatorConfig: {
          calculatorProductId: "manholes",
          calculatorVariantId: "manhole-small-v1",
          lengthMeters: 1.0,
          heightMeters: 0,
          thicknessCm: 0,
          itemsPerPallet: 0,
          pricePerUnit: 18000,
          weightKg: 0,
        },
      },
      {
        id: "manhole-large-v1",
        slug: "manhole-large-v1",
        titleKey: "variants.manholeLargeV1",
        sizeLabel: "1500 мм",
        subtitleKey: "variants.manholeSubtitle",
        dimensions: "1500 мм",
        price: { amount: 32000, currency: "AMD", unitKey: "perPcs" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/manholes/manhole-small-v1.webp",
        fallbackImage: "/images/products/manholes/manholes.png",
        descriptionKey: "descriptions.manholes",
        specs: [{ labelKey: "dimensions", valueRaw: "1500 мм" }],
        calculatorConfig: {
          calculatorProductId: "manholes",
          calculatorVariantId: "manhole-large-v1",
          lengthMeters: 1.5,
          heightMeters: 0,
          thicknessCm: 0,
          itemsPerPallet: 0,
          pricePerUnit: 32000,
          weightKg: 0,
        },
      },
      {
        id: "manhole-single-cover-v1-small",
        slug: "manhole-single-cover-v1-small",
        titleKey: "variants.manholeSingleCoverV1Small",
        sizeLabel: "1000 мм",
        subtitleKey: "variants.manholeSubtitle",
        dimensions: "1000 мм",
        price: { amount: 68000, currency: "AMD", unitKey: "perPcs" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/manholes/manhole-single-cover-v1-small.webp",
        fallbackImage: "/images/products/manholes/manholes.png",
        descriptionKey: "descriptions.manholes",
        specs: [{ labelKey: "dimensions", valueRaw: "1000 мм" }],
        calculatorConfig: {
          calculatorProductId: "manholes",
          calculatorVariantId: "manhole-single-cover-v1-small",
          lengthMeters: 1.0,
          heightMeters: 0,
          thicknessCm: 0,
          itemsPerPallet: 0,
          pricePerUnit: 68000,
          weightKg: 0,
        },
      },
      {
        id: "manhole-double-cover-v1-small",
        slug: "manhole-double-cover-v1-small",
        titleKey: "variants.manholeDoubleCoverV1Small",
        sizeLabel: "1500 мм",
        subtitleKey: "variants.manholeSubtitle",
        dimensions: "1500 мм",
        price: { amount: 75000, currency: "AMD", unitKey: "perPcs" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/manholes/manhole-double-cover-v1-small.webp",
        fallbackImage: "/images/products/manholes/manholes.png",
        descriptionKey: "descriptions.manholes",
        specs: [{ labelKey: "dimensions", valueRaw: "1500 мм" }],
        calculatorConfig: {
          calculatorProductId: "manholes",
          calculatorVariantId: "manhole-double-cover-v1-small",
          lengthMeters: 1.5,
          heightMeters: 0,
          thicknessCm: 0,
          itemsPerPallet: 0,
          pricePerUnit: 75000,
          weightKg: 0,
        },
      },
      {
        id: "manhole-cover-square-opening-v1-small",
        slug: "manhole-cover-square-opening-v1-small",
        titleKey: "variants.manholeCoverSquareOpeningV1Small",
        sizeLabel: "1000 мм",
        subtitleKey: "variants.manholeSubtitle",
        dimensions: "1000 мм",
        price: { amount: 18000, currency: "AMD", unitKey: "perPcs" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/manholes/manhole-cover-square-opening-v1-small.webp",
        fallbackImage: "/images/products/manholes/manholes.png",
        descriptionKey: "descriptions.manholes",
        specs: [{ labelKey: "dimensions", valueRaw: "1000 мм" }],
        calculatorConfig: {
          calculatorProductId: "manholes",
          calculatorVariantId: "manhole-cover-square-opening-v1-small",
          lengthMeters: 1.0,
          heightMeters: 0,
          thicknessCm: 0,
          itemsPerPallet: 0,
          pricePerUnit: 18000,
          weightKg: 0,
        },
      },
      {
        id: "manhole-cover-slot-v1-small",
        slug: "manhole-cover-slot-v1-small",
        titleKey: "variants.manholeCoverSlotV1Small",
        sizeLabel: "1000 мм",
        subtitleKey: "variants.manholeSubtitle",
        dimensions: "1000 мм",
        price: { amount: 18000, currency: "AMD", unitKey: "perPcs" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/manholes/manhole-cover-slot-v1-small.webp",
        fallbackImage: "/images/products/manholes/manholes.png",
        descriptionKey: "descriptions.manholes",
        specs: [{ labelKey: "dimensions", valueRaw: "1000 мм" }],
        calculatorConfig: {
          calculatorProductId: "manholes",
          calculatorVariantId: "manhole-cover-slot-v1-small",
          lengthMeters: 1.0,
          heightMeters: 0,
          thicknessCm: 0,
          itemsPerPallet: 0,
          pricePerUnit: 18000,
          weightKg: 0,
        },
      },
      {
        id: "manhole-cover-round-hole-v1-small",
        slug: "manhole-cover-round-hole-v1-small",
        titleKey: "variants.manholeCoverRoundHoleV1Small",
        sizeLabel: "1000 мм",
        subtitleKey: "variants.manholeSubtitle",
        dimensions: "1000 мм",
        price: { amount: 18000, currency: "AMD", unitKey: "perPcs" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/manholes/manhole-cover-round-hole-v1-small.webp",
        fallbackImage: "/images/products/manholes/manholes.png",
        descriptionKey: "descriptions.manholes",
        specs: [{ labelKey: "dimensions", valueRaw: "1000 мм" }],
        calculatorConfig: {
          calculatorProductId: "manholes",
          calculatorVariantId: "manhole-cover-round-hole-v1-small",
          lengthMeters: 1.0,
          heightMeters: 0,
          thicknessCm: 0,
          itemsPerPallet: 0,
          pricePerUnit: 18000,
          weightKg: 0,
        },
      },
      {
        id: "manhole-cover-square-opening-v1-large",
        slug: "manhole-cover-square-opening-v1-large",
        titleKey: "variants.manholeCoverSquareOpeningV1Large",
        sizeLabel: "1500 мм",
        subtitleKey: "variants.manholeSubtitle",
        dimensions: "1500 мм",
        price: { amount: 32000, currency: "AMD", unitKey: "perPcs" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/manholes/manhole-cover-square-opening-v1-small.webp",
        fallbackImage: "/images/products/manholes/manholes.png",
        descriptionKey: "descriptions.manholes",
        specs: [{ labelKey: "dimensions", valueRaw: "1500 мм" }],
        calculatorConfig: {
          calculatorProductId: "manholes",
          calculatorVariantId: "manhole-cover-square-opening-v1-large",
          lengthMeters: 1.5,
          heightMeters: 0,
          thicknessCm: 0,
          itemsPerPallet: 0,
          pricePerUnit: 32000,
          weightKg: 0,
        },
      },
      {
        id: "manhole-cover-slot-v1-large",
        slug: "manhole-cover-slot-v1-large",
        titleKey: "variants.manholeCoverSlotV1Large",
        sizeLabel: "1500 мм",
        subtitleKey: "variants.manholeSubtitle",
        dimensions: "1500 мм",
        price: { amount: 32000, currency: "AMD", unitKey: "perPcs" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/manholes/manhole-cover-slot-v1-small.webp",
        fallbackImage: "/images/products/manholes/manholes.png",
        descriptionKey: "descriptions.manholes",
        specs: [{ labelKey: "dimensions", valueRaw: "1500 мм" }],
        calculatorConfig: {
          calculatorProductId: "manholes",
          calculatorVariantId: "manhole-cover-slot-v1-large",
          lengthMeters: 1.5,
          heightMeters: 0,
          thicknessCm: 0,
          itemsPerPallet: 0,
          pricePerUnit: 32000,
          weightKg: 0,
        },
      },
      {
        id: "manhole-cover-round-hole-v1-large",
        slug: "manhole-cover-round-hole-v1-large",
        titleKey: "variants.manholeCoverRoundHoleV1Large",
        sizeLabel: "1500 мм",
        subtitleKey: "variants.manholeSubtitle",
        dimensions: "1500 мм",
        price: { amount: 32000, currency: "AMD", unitKey: "perPcs" },
        weightKg: 0,
        itemsPerPallet: 0,
        inStock: true,
        badgeKey: "inStockFactory",
        image: "/images/products/manholes/manhole-cover-round-hole-v1-small.webp",
        fallbackImage: "/images/products/manholes/manholes.png",
        descriptionKey: "descriptions.manholes",
        specs: [{ labelKey: "dimensions", valueRaw: "1500 мм" }],
        calculatorConfig: {
          calculatorProductId: "manholes",
          calculatorVariantId: "manhole-cover-round-hole-v1-large",
          lengthMeters: 1.5,
          heightMeters: 0,
          thicknessCm: 0,
          itemsPerPallet: 0,
          pricePerUnit: 32000,
          weightKg: 0,
        },
      },
    ],
    specs: [{ labelKey: "diameter", valueRaw: "700 мм - 1500 мм" }],
    features: [
      {
        icon: "shield",
        titleKey: "features.heavyDutyConstruction.title",
        descKey: "features.heavyDutyConstruction.desc",
      },
    ],
    applicationKeys: ["applications.sewerageWells"],
  },
};

export function getProductDetail(slug: string): ProductDetailData | null {
  return PRODUCT_DETAILS[slug] || null;
}
