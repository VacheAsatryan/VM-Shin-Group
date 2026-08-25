import type { ProductDetailData } from "@/config/productDetails";

export const CANONICAL_DOMAIN = "https://www.vmshingroup.am";
export const PRODUCTION_LATITUDE = 40.15352297545384;
export const PRODUCTION_LONGITUDE = 44.01886409660212;

/**
 * Returns canonical URL and language alternates (hreflang) for a given path and locale.
 */
export function getSeoAlternates(path: string = "", currentLocale: string = "hy") {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";

  return {
    canonical: `${CANONICAL_DOMAIN}/${currentLocale}${cleanPath}`,
    languages: {
      hy: `${CANONICAL_DOMAIN}/hy${cleanPath}`,
      ru: `${CANONICAL_DOMAIN}/ru${cleanPath}`,
      en: `${CANONICAL_DOMAIN}/en${cleanPath}`,
      "x-default": `${CANONICAL_DOMAIN}/hy${cleanPath}`,
    },
  };
}

/**
 * Returns canonical Schema.org JSON-LD graph for VM Shin Group homepage.
 */
export function getHomepageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${CANONICAL_DOMAIN}/#website`,
        "url": CANONICAL_DOMAIN,
        "name": "VM Shin Group",
        "publisher": {
          "@id": `${CANONICAL_DOMAIN}/#organization`,
        },
        "inLanguage": ["hy", "ru", "en"],
      },
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": `${CANONICAL_DOMAIN}/#organization`,
        "name": "VM Shin Group",
        "url": CANONICAL_DOMAIN,
        "logo": `${CANONICAL_DOMAIN}/images/logo.png`,
        "telephone": "+37493186077",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Armavir",
          "addressCountry": "AM",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": PRODUCTION_LATITUDE,
          "longitude": PRODUCTION_LONGITUDE,
        },
      },
    ],
  };
}

/**
 * Returns Schema.org BreadcrumbList JSON-LD graph for a product detail page.
 */
export function getBreadcrumbJsonLd({
  productName,
  slug,
  locale,
  homeLabel,
  productsLabel,
}: {
  productName: string;
  slug: string;
  locale: string;
  homeLabel: string;
  productsLabel: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": homeLabel,
        "item": `${CANONICAL_DOMAIN}/${locale}`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": productsLabel,
        "item": `${CANONICAL_DOMAIN}/${locale}/products`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": productName,
        "item": `${CANONICAL_DOMAIN}/${locale}/products/${slug}`,
      },
    ],
  };
}

/**
 * Generates Schema.org Offer or AggregateOffer object for product structured data.
 */
export function getProductOffers(
  productDetail: ProductDetailData,
  locale: string
): Record<string, unknown> | undefined {
  // EXCEPTION: Do NOT expose concrete prices in structured data per website owner requirement.
  if (productDetail.id === "concrete") {
    return undefined;
  }

  const sellableVariants = productDetail.variants.filter(
    (v) => v.priceStatus !== "to_be_confirmed" && v.price.amount > 0
  );

  if (sellableVariants.length === 0) {
    return undefined;
  }

  const prices = sellableVariants.map((v) => v.price.amount);
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);
  const url = `${CANONICAL_DOMAIN}/${locale}/products/${productDetail.slug}`;
  const hasInStock = sellableVariants.some((v) => v.inStock);
  const availability = hasInStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const seller = {
    "@type": "Organization",
    "@id": `${CANONICAL_DOMAIN}/#organization`,
    name: "VM Shin Group",
  };

  const isPerSqM = sellableVariants.some(
    (v) => v.price.unitKey === "perSqM" || v.price.unitKey === "perM2"
  );

  if (isPerSqM) {
    // Square metre pricing using UN/CEFACT unit code MTK
    const priceSpec = {
      "@type": "UnitPriceSpecification",
      price: lowPrice,
      priceCurrency: "AMD",
      unitCode: "MTK",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: 1,
        unitCode: "MTK",
      },
    };

    if (lowPrice === highPrice) {
      return {
        "@type": "Offer",
        url,
        priceCurrency: "AMD",
        price: lowPrice,
        availability,
        seller,
        priceSpecification: priceSpec,
      };
    } else {
      return {
        "@type": "AggregateOffer",
        url,
        priceCurrency: "AMD",
        lowPrice,
        highPrice,
        offerCount: sellableVariants.length,
        availability,
        seller,
        priceSpecification: priceSpec,
      };
    }
  }

  // Per piece (or standard unit) pricing
  if (sellableVariants.length === 1 || lowPrice === highPrice) {
    return {
      "@type": "Offer",
      url,
      priceCurrency: "AMD",
      price: lowPrice,
      availability,
      seller,
    };
  }

  return {
    "@type": "AggregateOffer",
    url,
    priceCurrency: "AMD",
    lowPrice,
    highPrice,
    offerCount: sellableVariants.length,
    availability,
    seller,
  };
}

/**
 * Returns Schema.org Product JSON-LD graph for an individual product detail page.
 */
export function getProductJsonLd({
  name,
  description,
  image,
  slug,
  locale,
  offers,
}: {
  name: string;
  description: string;
  image: string;
  slug: string;
  locale: string;
  offers?: Record<string, unknown>;
}) {
  const url = `${CANONICAL_DOMAIN}/${locale}/products/${slug}`;
  const imageUrl = image.startsWith("http") ? image : `${CANONICAL_DOMAIN}${image}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name,
    description,
    image: [imageUrl],
    brand: {
      "@type": "Brand",
      name: "VM Shin Group",
    },
    manufacturer: {
      "@type": "Organization",
      "@id": `${CANONICAL_DOMAIN}/#organization`,
      name: "VM Shin Group",
      url: CANONICAL_DOMAIN,
      telephone: "+37493186077",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Armavir",
        addressCountry: "AM",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: PRODUCTION_LATITUDE,
        longitude: PRODUCTION_LONGITUDE,
      },
    },
  };

  if (offers) {
    jsonLd.offers = offers;
  }

  return jsonLd;
}

