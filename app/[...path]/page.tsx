import Home from "../page";
import type { Metadata } from "next";
import { headers } from "next/headers";

type CatchAllProps = {
  params: Promise<{ path?: string[] }> | { path?: string[] };
};

export async function generateMetadata({ params }: CatchAllProps): Promise<Metadata> {
  const resolvedParams = await params;
  const path = resolvedParams.path ?? [];
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? (host.includes("localhost") ? "http" : "https");
  const canonical = new URL(`/${path.map(encodeURIComponent).join("/")}`, `${protocol}://${host}`).toString();
  const route = `/${path.join("/")}`;
  const titles: Record<string, string> = {
    "/produkty": "Personalisierbare Produkte",
    "/produkt/kule-jednostranna-1": "Weihnachtskugel mit Gravur",
    "/produkt/kule-jednostranna-2": "Weihnachtskugel-Set mit Gravur",
    "/produkt/kule-dvojstranna-1": "Beidseitig gravierte Weihnachtskugel",
    "/produkt/kule-dvojstranna-2": "Festlich beidseitig gravierte Weihnachtskugel",
    "/produkt/lesezeichen": "Holz-Lesezeichen mit Gravur",
    "/produkt/anhaenger": "Holz-Anhänger mit Gravur",
    "/produkt/flaschenoeffner": "Holz-Flaschenöffner mit Gravur",
    "/produkt/kugelschreiber": "Holz-Kugelschreiber mit Gravur",
    "/kosik": "Warenkorb",
    "/pokladna": "Lieferung und Zahlung",
    "/agb": "Allgemeine Geschäftsbedingungen",
    "/datenschutz": "Datenschutzerklärung",
    "/cookies": "Cookies und ähnliche Technologien",
    "/impressum": "Impressum",
  };
  const title = titles[route];
  const description = title
    ? `${title} persönlich gestalten. Produktdetails und CHF-Preis bei Saafi Gravur ansehen.`
    : "Saafi Gravur – personalisierte Geschenke mit Gravur.";
  return {
    ...(title ? { title: `${title} | Saafi Gravur` } : {}),
    description,
    openGraph: { title: title ? `${title} | Saafi Gravur` : "Saafi Gravur", description, url: canonical },
    twitter: { title: title ? `${title} | Saafi Gravur` : "Saafi Gravur", description },
    ...(route === "/kosik" || route === "/pokladna" || route.startsWith("/impressum") || route.startsWith("/agb") || route.startsWith("/datenschutz") || route.startsWith("/cookies")
      ? { robots: { index: false, follow: true } }
      : {}),
    alternates: { canonical },
  };
}

export default async function CatchAllPage({ params }: CatchAllProps) {
  const resolvedParams = await params;
  const path = resolvedParams.path ?? [];

  return <Home initialPath={`/${path.join("/")}`} />;
}
