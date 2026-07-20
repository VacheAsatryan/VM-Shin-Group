export interface ProductItem {
  id: string;
  slug: string;
  translationKey: string;
  image: string;
}

export const PRODUCTS: ProductItem[] = [
  {
    id: "pemzablok",
    slug: "pemzablok",
    translationKey: "pemzablok",
    image: "/images/products/placeholders/pemzablok.svg",
  },
  {
    id: "concrete-block",
    slug: "concrete-block",
    translationKey: "concrete-block",
    image: "/images/products/placeholders/concrete-block.svg",
  },
  {
    id: "concrete",
    slug: "concrete",
    translationKey: "concrete",
    image: "/images/products/placeholders/concrete.svg",
  },
  {
    id: "paving-stones",
    slug: "paving-stones",
    translationKey: "paving-stones",
    image: "/images/products/placeholders/paving-stones.svg",
  },
  {
    id: "tiles",
    slug: "tiles",
    translationKey: "tiles",
    image: "/images/products/placeholders/tiles.svg",
  },
  {
    id: "curbstones",
    slug: "curbstones",
    translationKey: "curbstones",
    image: "/images/products/placeholders/curbstones.svg",
  },
  {
    id: "manholes",
    slug: "manholes",
    translationKey: "manholes",
    image: "/images/products/placeholders/manholes.svg",
  },
];
