import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/config/products";
import { routing } from "@/i18n/routing";
import { CANONICAL_DOMAIN } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const publicRoutes = [
    "",
    "/products",
    "/documents",
    "/news",
    "/careers",
    "/privacy-policy",
    "/terms",
    "/cookie-policy",
  ];

  for (const route of publicRoutes) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${CANONICAL_DOMAIN}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : route === "/products" ? 0.9 : 0.7,
      });
    }
  }

  for (const product of PRODUCTS) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${CANONICAL_DOMAIN}/${locale}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
