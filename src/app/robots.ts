import type { MetadataRoute } from "next";
import { CANONICAL_DOMAIN } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/*/admin",
          "/*/admin/*",
          "/admin",
          "/admin/*",
          "/api/*",
          "/_next/*",
        ],
      },
    ],
    sitemap: `${CANONICAL_DOMAIN}/sitemap.xml`,
    host: CANONICAL_DOMAIN,
  };
}
