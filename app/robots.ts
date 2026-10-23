import type { MetadataRoute } from "next";

const siteOrigin = "https://saafi-gravur-shop.vancmatej.workers.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/kosik", "/pokladna", "/konto"] }],
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
