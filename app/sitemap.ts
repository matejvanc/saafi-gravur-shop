import type { MetadataRoute } from "next";

const siteOrigin = "https://saafi-gravur-shop.vancmatej.workers.dev";
const publicPaths = [
  "/",
  "/produkty",
  "/produkt/kule-jednostranna-1",
  "/produkt/kule-jednostranna-2",
  "/produkt/kule-dvojstranna-1",
  "/produkt/kule-dvojstranna-2",
  "/produkt/lesezeichen",
  "/produkt/anhaenger",
  "/produkt/flaschenoeffner",
  "/produkt/kugelschreiber",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: new URL(path, siteOrigin).toString(),
    changeFrequency: path.startsWith("/produkt/") ? "monthly" : "yearly",
  }));
}
