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
