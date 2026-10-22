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
  assert.match(html, /Weihnachtskugel/);
  assert.match(html, /Holz-Lesezeichen/);
  assert.match(html, /Holz-Anhänger/);
  assert.match(html, /Holz-Flaschenöffner/);
  assert.match(html, /Holz-Kugelschreiber/);
  assert.doesNotMatch(html, /Produkt ansehen/);
  assert.match(html, /\/produkt\/kule-jednostranna-1/);
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
  assert.doesNotMatch(html, /class="main-nav"/);
  assert.match(html, /class="account-shortcut"/);
  assert.doesNotMatch(html, /home-shortcut/);
  assert.doesNotMatch(html, /<nav class="footer-links"[^>]*>[\s\S]*?href="\/"/);
  assert.doesNotMatch(html, /<nav class="footer-links"[^>]*>[\s\S]*?href="\/produkty"/);
  assert.doesNotMatch(html, /<nav class="footer-links"[^>]*>[\s\S]*?href="\/kosik"/);
  assert.match(html, /<nav class="footer-links"[^>]*>[\s\S]*?href="\/agb"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("fallback routes serve product and cart paths for client routing", async () => {
  const productResponse = await render("/produkt/kule-jednostranna-1");
  assert.equal(productResponse.status, 200);
  const productHtml = await productResponse.text();
  assert.match(productHtml, /Saafi Gravur/);
  assert.doesNotMatch(productHtml, /Feine Gravur/);
  assert.match(productHtml, /Weihnachtskugel/);
  assert.match(productHtml, /preview-row/);
  assert.match(productHtml, /Einseitig/);
  assert.match(productHtml, /Kugelset/);
  assert.match(productHtml, /Doppelseitig/);
  assert.match(productHtml, /Ausführung/);
  assert.match(productHtml, /Farbe/);
  assert.match(productHtml, /Oberfläche/);
  assert.doesNotMatch(productHtml, /product-switcher/);
  assert.match(productHtml, /Logo-Motiv/);
  assert.match(productHtml, /Text bis[\s\S]*12[\s\S]*Zeichen/);
  assert.match(productHtml, /CHF 7\.00/);
  assert.match(productHtml, /Geschenkverpackung/);
  assert.match(productHtml, /\+ CHF 1\.00 pro Stück/);
  assert.doesNotMatch(productHtml, /Holz natur/);
  assert.match(productHtml, /In den Warenkorb/);
  assert.match(productHtml, /Weitere Produkte/);
  assert.doesNotMatch(productHtml, /Produkt ansehen/);

  const doubleProductResponse = await render("/produkt/kule-dvojstranna-1");
  assert.equal(doubleProductResponse.status, 200);
  const doubleProductHtml = await doubleProductResponse.text();
  assert.match(doubleProductHtml, /Weihnachtskugel/);
  assert.match(doubleProductHtml, /Doppelseitig/);
  assert.match(doubleProductHtml, /Rückseiten-Gravur/);
  assert.match(doubleProductHtml, /Merry Christmas/);
  assert.match(doubleProductHtml, /Frohe Weihnachten/);
  assert.match(doubleProductHtml, /Veselé Vánoce/);
  assert.match(doubleProductHtml, /Joyeux Noël/);
  assert.match(doubleProductHtml, /Buon Natale/);
  assert.doesNotMatch(doubleProductHtml, /Sretan Božić|Merry Christmas 2026/);
  assert.match(doubleProductHtml, /class="language-menu engraving-menu"/);
  assert.match(doubleProductHtml, /<summary[^>]*aria-label="Rückseiten-Gravur"[^>]*>\s*<span>Frohe Weihnachten<\/span>/);
  assert.match(doubleProductHtml, /CHF 9\.00/);
  assert.match(doubleProductHtml, /Geschenkverpackung/);
  assert.doesNotMatch(doubleProductHtml, /Holz natur/);

  const productsResponse = await render("/produkty");
  assert.equal(productsResponse.status, 200);
  const productsHtml = await productsResponse.text();
  assert.match(productsHtml, /Personalisierbare Produkte/);
  assert.match(productsHtml, /catalog-product-card/);
  assert.match(productsHtml, /Weihnachtskugel/);
  assert.doesNotMatch(productsHtml, /Beidseitig gravierte Weihnachtskugel/);
  assert.equal((productsHtml.match(/catalog-product-card/g) ?? []).length, 5);
  assert.match(productsHtml, /Holz-Kugelschreiber/);

  const cartResponse = await render("/kosik");
  assert.equal(cartResponse.status, 200);
  const cartHtml = await cartResponse.text();
  assert.match(cartHtml, /Warenkorb/);
  assert.match(cartHtml, /Deine Auswahl/);
  assert.match(cartHtml, /view-cart/);
  assert.match(cartHtml, /cart-toolbar/);
  assert.match(cartHtml, /Checkout/);
  assert.match(cartHtml, /Ich stimme der Verarbeitung meiner Angaben/);
  assert.match(cartHtml, /Ich akzeptiere die Allgemeinen Geschäftsbedingungen/);
  assert.match(cartHtml, /Ich habe die Cookie-Hinweise gelesen/);
  assert.doesNotMatch(cartHtml, /Geltungsbereich/);

  const termsResponse = await render("/agb");
  assert.equal(termsResponse.status, 200);
  const termsHtml = await termsResponse.text();
  assert.match(termsHtml, /Allgemeine Geschäftsbedingungen/);
  assert.match(termsHtml, /Geltungsbereich/);
  assert.match(termsHtml, /Zustimmung zur Datenverarbeitung/);
  assert.match(termsHtml, /Cookie-Hinweise/);
  assert.match(termsHtml, /Zur Startseite/);
});

test("starter preview files and dependencies are removed", async () => {
  const [page, routeFallback, layout, packageJson, styles, accountAuth, worker, favicon] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/[...path]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/account-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/favicon.svg", import.meta.url), "utf8"),
  ]);

  const openerProductStart = page.indexOf('id: "flaschenoeffner"');
  const penProductStart = page.indexOf('id: "kugelschreiber"');
  const pageTypesStart = page.indexOf('type PageView');
  const footerStart = page.indexOf('<footer className="shop-footer"');
  const footerEnd = page.indexOf("</footer>", footerStart);
  assert.notEqual(openerProductStart, -1);
  assert.notEqual(penProductStart, -1);
  assert.notEqual(pageTypesStart, -1);
  assert.notEqual(footerStart, -1);
  assert.notEqual(footerEnd, -1);
  const openerProductBlock = page.slice(openerProductStart, penProductStart);
  const penProductBlock = page.slice(penProductStart, pageTypesStart);
  const footerBlock = page.slice(footerStart, footerEnd);

  assert.match(page, /const TEXT_LIMIT = 12;/);
  assert.match(page, /type LanguageCode = "de" \| "en" \| "cs" \| "fr" \| "it";/);
  assert.match(page, /useState<LanguageCode>\("de"\)/);
  assert.doesNotMatch(page, /className="main-nav"/);
  assert.match(page, /className="language-menu"/);
  assert.match(page, /function closeMenusOutside\(event: PointerEvent\)/);
  assert.match(page, /document\.addEventListener\("pointerdown", closeMenusOutside\)/);
  assert.match(page, /const christmasBackEngravingOptions: BackEngravingOption\[\]/);
  assert.match(page, /christmasBackEngravingByLanguage/);
  assert.match(page, /getDefaultBackEngravingId\(\s*selectedProductId,\s*language,\s*selectedBaubleVariantId/);
  assert.match(page, /getLocalizedBackEngravingId\(variant\.backEngravingOptions \?\? \[\], language\)/);
  assert.match(page, /className="language-menu engraving-menu"/);
  assert.match(page, /className="account-shortcut"/);
  assert.doesNotMatch(page, /className="home-shortcut"/);
  assert.match(page, /signInWithOtp/);
  assert.match(page, /auth\.signOut\(\)/);
  assert.match(page, /<dialog/);
  assert.match(accountAuth, /persistSession: true/);
  assert.match(accountAuth, /detectSessionInUrl: true/);
  assert.match(worker, /url\.pathname === "\/api\/auth-config"/);
  assert.match(worker, /isPublishableSupabaseKey/);
  assert.doesNotMatch(worker, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(page, /const languageMenuRef = useRef<HTMLDetailsElement>\(null\);/);
  assert.match(page, /function closeLanguageMenu\(\)[\s\S]*?removeAttribute\("open"\)/);
  assert.match(page, /document\.documentElement\.lang = language/);
  assert.match(page, /const homeCopy/);
  assert.match(page, /const flowCopy/);
  assert.match(page, /initialPath/);
  assert.match(page, /intro-gallery/);
  assert.match(page, /const introProductIds = \[[\s\S]*?"lesezeichen"[\s\S]*?"anhaenger"[\s\S]*?\];[\s\S]*?const mainPhoto = product\.photos\[0\];[\s\S]*?<img src=\{mainPhoto\.src\} alt=\{productCopy\.name\}/);
  assert.match(page, /id="produkte"/);
  assert.match(favicon, /<text[^>]*>S<\/text>/);
  assert.match(favicon, /<text[^>]*>G<\/text>/);
  assert.match(layout, /icon: "\/favicon\.svg\?v=2"/);
  assert.match(page, /scrollIntoView/);
  assert.match(page, /className={`product-card/);
  assert.match(page, /productHref/);
  assert.match(page, /parseRoute/);
  assert.match(page, /return `CHF \$\{value\.toFixed\(2\)\}`;/);
  assert.doesNotMatch(page, /style: "currency"/);
  assert.match(page, /type PageView = "home" \| "products" \| "product" \| "cart" \| "terms";/);
  assert.match(page, /navigateProducts/);
  assert.match(page, /href="\/produkty"/);
  assert.match(page, /catalog-product-card/);
  assert.match(page, /catalogPageLead/);
  assert.match(page, /section-heading-left/);
  assert.match(page, /navigateTerms/);
  assert.match(page, /href="\/agb"/);
  assert.match(page, /className="page-toolbar product-toolbar"[\s\S]*?\{renderCartSummary\(\)\}[\s\S]*?<section className="product-section"/);
  assert.match(page, /className="cart-summary cart-summary-compact"/);
  assert.match(page, /className="product-photo-open"[\s\S]*?photoDialogRef\.current\?\.showModal\(\)/);
  assert.match(page, /className="photo-dialog"[\s\S]*?changeSelectedPhoto\(-1\)[\s\S]*?changeSelectedPhoto\(1\)/);
  assert.match(page, /onCancel=\{\(event\) => \{\s+event\.preventDefault\(\);\s+event\.currentTarget\.close\(\);/);
  assert.match(page, /if \(event\.key === "Escape"\) \{\s+event\.preventDefault\(\);\s+event\.currentTarget\.close\(\);/);
  assert.match(page, /className="photo-lightbox-thumbs"/);
  assert.match(page, /function changeSelectedPhoto\(direction: -1 \| 1\)/);
  assert.match(styles, /grid-template-columns: minmax\(0, 1\.08fr\) minmax\(330px, 0\.92fr\)/);
  assert.match(styles, /max-height: min\(54vh, 500px\)/);
  assert.match(styles, /\.photo-dialog::backdrop/);
  assert.match(page, /const introProductIds = \[[\s\S]*?"flaschenoeffner"[\s\S]*?"kugelschreiber"[\s\S]*?\];/);
  assert.match(openerProductBlock, /src: "\/products\/wood-opener\.jpeg"/);
  assert.doesNotMatch(openerProductBlock, /wood-opener-pen-set\.jpeg/);
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
  assert.match(page, /name: "Vánoční koule"/);
  assert.match(page, /const availableProducts = products\.filter/);
  assert.match(page, /const baubleVariants = products/);
  assert.match(page, /const baubleColors = \[/);
  assert.match(page, /const baubleSurfaces = \[/);
  assert.doesNotMatch(page, /className="product-switcher"/);
  assert.match(page, /backEngravingOptions/);
  assert.match(page, /Merry Christmas/);
  assert.match(page, /Frohe Weihnachten/);
  assert.match(page, /Veselé Vánoce/);
  assert.match(page, /Joyeux Noël/);
  assert.match(page, /Buon Natale/);
  assert.match(page, /supportsGiftWrap: true/);
  assert.match(page, /GIFT_WRAP_PRICE = 1/);
  assert.match(page, /dataConsentLabel/);
  assert.match(page, /cookiesCards/);
  assert.doesNotMatch(page, /Holz natur|Natural wood|Přírodní dřevo|Bois naturel|Legno naturale/);
  assert.match(page, /name: "Christmas bauble"/);
  assert.match(page, /name: "Boule de Noël"/);
  assert.match(page, /name: "Pallina di Natale"/);
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
  assert.doesNotMatch(footerBlock, /href="\/"|href="\/produkty"|href="\/kosik"/);
  assert.match(footerBlock, /href="\/agb"/);
  assert.doesNotMatch(styles, /\.main-nav/);
  assert.match(styles, /\.view-cart \.cart-page-grid/);
  assert.match(styles, /\.view-cart \.checkout-panel/);
  assert.match(styles, /\.consent-list/);
  assert.match(styles, /\.option-check/);
  assert.match(styles, /\.legal-section/);
  assert.match(styles, /--cranberry: #a62f3d/);
  assert.match(styles, /--brass: #bd9146/);
  assert.match(styles, /radial-gradient\(circle, rgba\(189, 145, 70/);
  assert.doesNotMatch(page, /top-notice/);
  assert.match(page, /className="term-number"/);
  assert.match(styles, /\.product-photo-frame img[\s\S]*object-fit: contain/);
  assert.match(styles, /\.product-photo-frame \{\s+aspect-ratio: 1\.2[\s\S]*max-height: min\(54vh, 500px\)/);
  assert.match(styles, /\.gallery-column \{\s+align-self: start;\s+max-height: none;\s+overflow: visible;\s+position: sticky/);
  assert.match(styles, /\.engraving-menu \.language-options/);
  assert.match(styles, /\.gallery-column[\s\S]*position: sticky/);
  assert.doesNotMatch(styles, /\.product-photo-frame img[\s\S]*hue-rotate|mix-blend-mode: multiply/);
  assert.match(page, /<img\s+src=\{selectedPhoto\.src\}\s+alt=\{selectedPhoto\.alt\[language\]\}\s*\/>/);
  assert.match(page, /setSelectedPhotoId\(nextProduct\.photos\[0\]\.id\)/);
  assert.match(styles, /\.catalog-main-photo img[\s\S]*object-fit: contain/);
  assert.match(styles, /\.catalog-detail-photos img[\s\S]*object-fit: contain/);
  assert.match(styles, /\.product-card img[\s\S]*object-fit: contain/);
  assert.match(styles, /\.intro-photo img[\s\S]*object-fit: contain/);
  assert.match(styles, /\.home-hero[\s\S]*var\(--hero-image\)/);
  assert.ok(page.includes(`"--hero-image": "url('/products/christmas-baubles-main.jpeg')"`));
  assert.match(styles, /radial-gradient\(ellipse at 4% 8%, rgba\(166, 47, 61, 0\.2\)/);
  assert.match(styles, /radial-gradient\(ellipse at 96% 22%, rgba\(30, 81, 59, 0\.21\)/);
  assert.match(styles, /grid-template-columns: minmax\(0, 1\.08fr\) minmax\(330px, 0\.92fr\);/);
  assert.match(styles, /grid-template-columns: repeat\(6, minmax\(0, 1fr\)\);/);
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
