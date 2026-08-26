import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the multilingual personalized shop", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang=["']de["']/i);
  assert.match(html, /Saafi Gravur/);
  assert.doesNotMatch(html, /Feine Gravur/);
  assert.match(html, /Geschenke mit Gravur/);
  assert.match(html, /christmas-baubles-main\.jpeg/);
  assert.match(html, /Gravierte Weihnachtskugeln/);
  assert.match(html, /Holz-Lesezeichen/);
  assert.match(html, /Holz-Anhänger/);
  assert.match(html, /Holz-Flaschenöffner/);
  assert.match(html, /Holz-Kugelschreiber/);
  assert.doesNotMatch(html, /Produkt ansehen/);
  assert.match(html, /\/produkt\/weihnachtskugeln/);
  assert.match(html, /\/produkty/);
  assert.match(html, /\/kosik/);
  assert.match(html, /\/agb/);
  assert.match(html, />DE</);
  assert.match(html, />EN</);
  assert.match(html, />CS</);
  assert.match(html, />FR</);
  assert.match(html, />IT</);
  assert.match(html, />Start</);
  assert.match(html, />Produkte</);
  assert.match(html, /Warenkorb/);
  assert.match(html, />AGB</);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("fallback routes serve product and cart paths for client routing", async () => {
  const productResponse = await render("/produkt/weihnachtskugeln");
  assert.equal(productResponse.status, 200);
  const productHtml = await productResponse.text();
  assert.match(productHtml, /Saafi Gravur/);
  assert.doesNotMatch(productHtml, /Feine Gravur/);
  assert.match(productHtml, /Gravierte Weihnachtskugeln/);
  assert.match(productHtml, /Logo-Motiv/);
  assert.match(productHtml, /Text bis[\s\S]*12[\s\S]*Zeichen/);
  assert.match(productHtml, /In den Warenkorb/);
  assert.match(productHtml, /Weitere Produkte/);
  assert.doesNotMatch(productHtml, /Produkt ansehen/);

  const productsResponse = await render("/produkty");
  assert.equal(productsResponse.status, 200);
  const productsHtml = await productsResponse.text();
  assert.match(productsHtml, /Personalisierbare Produkte/);
  assert.match(productsHtml, /catalog-product-card/);
  assert.match(productsHtml, /Gravierte Weihnachtskugeln/);
  assert.match(productsHtml, /Holz-Kugelschreiber/);

  const cartResponse = await render("/kosik");
  assert.equal(cartResponse.status, 200);
  const cartHtml = await cartResponse.text();
  assert.match(cartHtml, /Warenkorb/);
  assert.match(cartHtml, /Deine Auswahl/);
  assert.match(cartHtml, /view-cart/);
  assert.match(cartHtml, /cart-toolbar/);
  assert.match(cartHtml, /Checkout/);
  assert.doesNotMatch(cartHtml, /Allgemeine Geschäftsbedingungen/);

  const termsResponse = await render("/agb");
  assert.equal(termsResponse.status, 200);
  const termsHtml = await termsResponse.text();
  assert.match(termsHtml, /Allgemeine Geschäftsbedingungen/);
  assert.match(termsHtml, /Geltungsbereich/);
  assert.match(termsHtml, /Zur Startseite/);
});

test("starter preview files and dependencies are removed", async () => {
  const [page, routeFallback, layout, packageJson, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/[...path]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const openerProductStart = page.indexOf('id: "flaschenoeffner"');
  const penProductStart = page.indexOf('id: "kugelschreiber"');
  const pageTypesStart = page.indexOf('type PageView');
  assert.notEqual(openerProductStart, -1);
  assert.notEqual(penProductStart, -1);
  assert.notEqual(pageTypesStart, -1);
  const openerProductBlock = page.slice(openerProductStart, penProductStart);
  const penProductBlock = page.slice(penProductStart, pageTypesStart);

  assert.match(page, /const TEXT_LIMIT = 12;/);
  assert.match(page, /type LanguageCode = "de" \| "en" \| "cs" \| "fr" \| "it";/);
  assert.match(page, /useState<LanguageCode>\("de"\)/);
  assert.match(page, /language-switcher/);
  assert.match(page, /document\.documentElement\.lang = language/);
  assert.match(page, /const homeCopy/);
  assert.match(page, /const flowCopy/);
  assert.match(page, /initialPath/);
  assert.match(page, /intro-gallery/);
  assert.match(page, /id="produkte"/);
  assert.match(page, /scrollIntoView/);
  assert.match(page, /className={`product-card/);
  assert.match(page, /productHref/);
  assert.match(page, /parseRoute/);
  assert.match(page, /return `\$\{value\.toFixed\(2\)\} €`;/);
  assert.doesNotMatch(page, /style: "currency"/);
  assert.match(page, /type PageView = "home" \| "products" \| "product" \| "cart" \| "terms";/);
  assert.match(page, /navigateProducts/);
  assert.match(page, /href="\/produkty"/);
  assert.match(page, /catalog-product-card/);
  assert.match(page, /catalogPageLead/);
  assert.match(page, /section-heading-left/);
  assert.match(page, /navigateTerms/);
  assert.match(page, /href="\/agb"/);
  assert.match(page, /productId: "flaschenoeffner",\s+src: "\/products\/wood-opener\.jpeg"/);
  assert.match(openerProductBlock, /src: "\/products\/wood-opener\.jpeg"/);
  assert.doesNotMatch(openerProductBlock, /wood-opener-pen-set\.jpeg/);
  assert.match(page, /productId: "kugelschreiber"/);
  assert.match(page, /productId: "kugelschreiber",\s+src: "\/products\/wood-pen\.jpeg"/);
  assert.match(penProductBlock, /src: "\/products\/wood-pen\.jpeg"/);
  assert.doesNotMatch(penProductBlock, /wood-opener-pen-set\.jpeg/);
  assert.doesNotMatch(page, /wood-opener-pen-set\.jpeg/);
  assert.match(page, /CART_STORAGE_KEY = "saafi-gravur-cart"/);
  assert.match(page, /LEGACY_CART_STORAGE_KEY = "feine-gravur-cart"/);
  assert.match(page, /className={`shop-shell view-\$\{currentView\}`}/);
  assert.match(page, /cart-toolbar/);
  assert.match(page, /showCartChoice/);
  assert.match(page, /cart-choice/);
  assert.match(page, /removeCartItem/);
  assert.match(page, /cart-page/);
  assert.match(page, /Gravírované vánoční ozdoby/);
  assert.match(page, /Engraved Christmas Baubles/);
  assert.match(page, /Boules de Noël gravées/);
  assert.match(page, /Palline di Natale incise/);
  assert.match(page, /navLabel: "Home"/);
  assert.match(page, /navLabel: "Úvod"/);
  assert.match(page, /navLabel: "Accueil"/);
  assert.match(page, /navLabel: "Inizio"/);
  assert.match(page, /assortment: "Products"/);
  assert.match(page, /assortment: "Produkty"/);
  assert.match(page, /assortment: "Produits"/);
  assert.match(page, /assortment: "Prodotti"/);
  assert.match(page, /terms: "Terms"/);
  assert.match(page, /terms: "Podmínky"/);
  assert.match(page, /terms: "CGV"/);
  assert.match(page, /terms: "Condizioni"/);
  assert.match(page, /logoLabel: "Logo design"/);
  assert.doesNotMatch(page, /viewProduct|card-action|footerSubtitle|Produkt ansehen/);
  assert.doesNotMatch(page, /Demo-Shop|Demo shop for personalised engraved gifts|Boutique démo|Demo obchod/);
  assert.doesNotMatch(styles, /shop-footer div/);
  assert.match(styles, /\.view-cart \.cart-page-grid/);
  assert.match(styles, /\.view-cart \.checkout-panel/);
  assert.match(styles, /\.product-photo-frame img[\s\S]*object-fit: contain/);
  assert.match(styles, /\.catalog-main-photo img[\s\S]*object-fit: contain/);
  assert.match(styles, /\.catalog-detail-photos img[\s\S]*object-fit: contain/);
  assert.match(styles, /\.product-card img[\s\S]*object-fit: contain/);
  assert.match(styles, /\.intro-photo img[\s\S]*object-fit: contain/);
  assert.match(styles, /grid-template-columns: minmax\(220px, 1fr\) minmax\(450px, 540px\) minmax\(330px, 1fr\);/);
  assert.match(styles, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/);
  assert.match(page, /maxLength={TEXT_LIMIT}/);
  assert.doesNotMatch(page, /kosik#agb|sortiment-title|id="sortiment"|Selected motivs|Choose a motiv|chosen motiv|custom motiv|reading motiv|Motiv series|Motiv style|motiv engraving|engraved motivs/);
  assert.match(routeFallback, /CatchAllPage/);
  assert.match(routeFallback, /initialPath/);
  assert.match(layout, /Saafi Gravur/);
  assert.match(packageJson, /"name": "saafi-gravur-shop"/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview|codex-preview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await access(new URL("../public/products/christmas-baubles-main.jpeg", import.meta.url));
  await access(new URL("../app/[...path]/page.tsx", import.meta.url));
  await assert.rejects(access(new URL("app/_sites-preview", templateRoot)));
});
