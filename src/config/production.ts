export interface ProductionFactItem {
  id: string;
  number: string;
  key: string;
}

export interface ProductionConfig {
  mainImage: string;
  secondaryImage: string;
  imageAltKey: string;
  badgeKey: string;
  facts: ProductionFactItem[];
}

export const PRODUCTION_CONFIG: ProductionConfig = {
  mainImage: "/images/production/placeholders/factory-main.svg",
  secondaryImage: "/images/production/placeholders/factory-detail.svg",
  imageAltKey: "mainImageAlt",
  badgeKey: "badge",
  facts: [
    {
      id: "equipment",
      number: "01",
      key: "equipment",
    },
    {
      id: "process",
      number: "02",
      key: "process",
    },
    {
      id: "capacity",
      number: "03",
      key: "capacity",
    },
  ],
};
