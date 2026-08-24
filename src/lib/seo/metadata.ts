import { FACTORY_ORIGIN } from "@/config/delivery";

export const CANONICAL_DOMAIN = "https://www.vmshingroup.am";

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
 * Returns canonical Schema.org JSON-LD graph for VM Shin Group.
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
          "streetAddress": FACTORY_ORIGIN.address,
          "addressLocality": FACTORY_ORIGIN.city,
          "addressCountry": "AM",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": FACTORY_ORIGIN.coordinates.lat,
          "longitude": FACTORY_ORIGIN.coordinates.lng,
        },
      },
    ],
  };
}
