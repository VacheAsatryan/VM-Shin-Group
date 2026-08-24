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
        ],
      },
    ],
    sitemap: `${CANONICAL_DOMAIN}/sitemap.xml`,
    host: CANONICAL_DOMAIN,
  };
}
