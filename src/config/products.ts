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
    image: "/images/products/pumice-blocks/pemzablok.png",
  },
  {
    id: "concrete-block",
    slug: "concrete-block",
    translationKey: "concrete-block",
    image: "/images/products/concrete-blocks/concrete-block.png",
  },
  {
    id: "concrete",
    slug: "concrete",
    translationKey: "concrete",
    image: "/images/products/ready-mix-concrete/concrete.png",
  },
  {
    id: "paving-stones",
    slug: "paving-stones",
    translationKey: "paving-stones",
    image: "/images/products/paving-stones/paving-stones.png",
  },

  {
    id: "curbstones",
    slug: "curbstones",
    translationKey: "curbstones",
    image: "/images/products/curbstones/curbstones.png",
  },
  {
    id: "manholes",
    slug: "manholes",
    translationKey: "manholes",
    image: "/images/products/manholes/manholes.png",
  },
];
