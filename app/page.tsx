"use client";

import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

const TEXT_LIMIT = 12;
const BRAND_NAME = "Saafi Gravur";
const CART_STORAGE_KEY = "saafi-gravur-cart";
const LEGACY_CART_STORAGE_KEY = "feine-gravur-cart";

type LanguageCode = "de" | "en" | "cs" | "fr" | "it";

const languages: Array<{ code: LanguageCode; label: string; name: string }> = [
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "en", label: "EN", name: "English" },
  { code: "cs", label: "CS", name: "Čeština" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "it", label: "IT", name: "Italiano" },
];

const localeByLanguage: Record<LanguageCode, string> = {
  de: "de-DE",
  en: "en-GB",
  cs: "cs-CZ",
  fr: "fr-FR",
  it: "it-IT",
};

const ui = {
  de: {
    pageTitle: `${BRAND_NAME} | Personalisierte Geschenke`,
    notice:
      "Personalisierte Gravurgeschenke - deutsche Shopoberfläche, Produkttexte und Zahlarten werden im nächsten Schritt finalisiert.",
    brandSubtitle: "Personalisierte Geschenke",
    nav: {
      configurator: "Konfigurator",
      assortment: "Produkte",
      details: "Details",
      terms: "AGB",
    },
    languageLabel: "Sprache wechseln",
    cartTitle: "Warenkorb",
    breadcrumbs: "Startseite / Personalisierte Gravurgeschenke",
    textLimit: `Text bis ${TEXT_LIMIT} Zeichen`,
    taxNote: "inkl. MwSt., zzgl. Versand",
    customTextLabel: "Name oder kurzer Text",
    customTextPlaceholder: "z. B. Emilia",
    logoLabel: "Logo-Motiv",
    previewLabel: "Gravurvorschau",
    previewFallback: "Name",
    quantity: "Menge",
    decreaseQuantity: "Menge verringern",
    increaseQuantity: "Menge erhöhen",
    addToCart: "In den Warenkorb",
    cartHeading: "Aktuelle Auswahl",
    emptyCart: "Noch kein personalisiertes Produkt im Warenkorb.",
    subtotal: "Zwischensumme",
    checkoutSoon: "Checkout folgt",
    mainPhoto: "Hauptfoto",
    detailPhoto: "Detail",
    selectProduct: "Auswählen",
    service: [
      ["Kurze Personalisierung", "Bis 12 Zeichen für saubere Gravurflächen."],
      ["Ausgewählte Motive", "Logo-Auswahl pro Geschenk kombinierbar."],
      ["Mehrere Produktlinien", "Weihnachten, Lesen, Schlüssel und Holzschreibwaren."],
    ],
    assortmentKicker: "Sortiment",
    assortmentTitle: "Personalisierbare Produkte",
    detailsKicker: "Produktdetails",
    detailsTitle: "Vorbereitet für den Verkauf",
    detailCards: [
      [
        "Personalisierung",
        "Jedes Produkt nutzt denselben Bestellfluss: Text eingeben, Motiv wählen, Ausführung auswählen und in den Warenkorb legen.",
      ],
      [
        "Produktdaten",
        "Preise, Maße und Materialien sind als Produktdaten angelegt und können später direkt pro Artikel finalisiert werden.",
      ],
      [
        "Bestellung",
        "Der Checkout bleibt vorbereitet, bis Zahlungsarten, Versandkosten und rechtliche Pflichtangaben final feststehen.",
      ],
    ],
    termsKicker: "AGB",
    termsTitle: "Allgemeine Geschäftsbedingungen",
    terms: [
      [
        "1. Geltungsbereich",
        `Diese Bedingungen gelten für Bestellungen im Online-Shop ${BRAND_NAME}. Abweichende Regelungen gelten nur, wenn sie schriftlich bestätigt wurden.`,
      ],
      [
        "2. Bestellung",
        "Kundinnen und Kunden wählen Produkt, Menge und Personalisierung aus. Vor dem Absenden können Eingaben geprüft und korrigiert werden.",
      ],
      [
        "3. Personalisierte Waren",
        "Gravierte Artikel werden nach Kundenvorgabe gefertigt. Schreibfehler in übermittelten Texten werden nur korrigiert, wenn sie vor Produktionsbeginn gemeldet werden.",
      ],
      [
        "4. Preise und Zahlung",
        "Alle Preise verstehen sich inklusive gesetzlicher Umsatzsteuer zuzüglich Versandkosten. Die verfügbaren Zahlungsarten werden im Checkout angezeigt.",
      ],
      [
        "5. Lieferung",
        "Die Lieferzeit richtet sich nach Produkt und Auftragslage. Verzögerungen durch unklare Personalisierungsangaben können die Fertigung verlängern.",
      ],
      [
        "6. Gewährleistung",
        "Es gelten die gesetzlichen Gewährleistungsrechte. Bei Transportschäden oder Produktionsfehlern bitten wir um eine zeitnahe Nachricht mit Foto.",
      ],
    ],
    termsNote:
      "Mustertext für den Prototyp. Firmenangaben, Widerrufsbelehrung, Datenschutz, Versand und Zahlungsarten sollten vor Veröffentlichung rechtlich geprüft und ergänzt werden.",
  },
  en: {
    pageTitle: `${BRAND_NAME} | Personalised Gifts`,
    notice:
      "Personalised engraved gifts - product copy, payment methods and final shop details will be completed in the next step.",
    brandSubtitle: "Personalised gifts",
    nav: {
      configurator: "Configurator",
      assortment: "Products",
      details: "Details",
      terms: "Terms",
    },
    languageLabel: "Change language",
    cartTitle: "Cart",
    breadcrumbs: "Home / Personalised engraved gifts",
    textLimit: `Text up to ${TEXT_LIMIT} characters`,
    taxNote: "incl. VAT, plus shipping",
    customTextLabel: "Name or short text",
    customTextPlaceholder: "e.g. Emilia",
    logoLabel: "Logo motif",
    previewLabel: "Engraving preview",
    previewFallback: "Name",
    quantity: "Quantity",
    decreaseQuantity: "Decrease quantity",
    increaseQuantity: "Increase quantity",
    addToCart: "Add to cart",
    cartHeading: "Current selection",
    emptyCart: "No personalised product in the cart yet.",
    subtotal: "Subtotal",
    checkoutSoon: "Checkout coming soon",
    mainPhoto: "Main photo",
    detailPhoto: "Detail",
    selectProduct: "Select",
    service: [
      ["Short personalisation", "Up to 12 characters for clean engraving areas."],
      ["Selected motifs", "Combine each gift with a logo motif from the range."],
      ["Several product lines", "Christmas, reading, keychains and wooden stationery."],
    ],
    assortmentKicker: "Products",
    assortmentTitle: "Personalised products",
    detailsKicker: "Product details",
    detailsTitle: "Prepared for selling",
    detailCards: [
      [
        "Personalisation",
        "Every product uses the same order flow: enter text, choose a motif, select a finish and add it to the cart.",
      ],
      [
        "Product data",
        "Prices, dimensions and materials are stored as product data and can be finalised per item later.",
      ],
      [
        "Ordering",
        "Checkout is prepared and waiting for payment methods, shipping prices and final legal details.",
      ],
    ],
    termsKicker: "Terms",
    termsTitle: "General Terms and Conditions",
    terms: [
      [
        "1. Scope",
        `These terms apply to orders placed in the ${BRAND_NAME} online shop. Different arrangements apply only when confirmed in writing.`,
      ],
      [
        "2. Orders",
        "Customers choose the product, quantity and personalisation. Entries can be reviewed and corrected before submission.",
      ],
      [
        "3. Personalised goods",
        "Engraved items are made according to customer instructions. Spelling errors in submitted text can only be corrected before production begins.",
      ],
      [
        "4. Prices and payment",
        "All prices include statutory VAT and exclude shipping costs. Available payment methods will be shown during checkout.",
      ],
      [
        "5. Delivery",
        "Delivery time depends on the product and workload. Unclear personalisation details may extend production time.",
      ],
      [
        "6. Warranty",
        "Statutory warranty rights apply. For transport damage or production defects, please contact us promptly with a photo.",
      ],
    ],
    termsNote:
      "Sample text for the prototype. Business details, withdrawal policy, privacy, shipping and payment methods should be legally checked and completed before publication.",
  },
  cs: {
    pageTitle: `${BRAND_NAME} | Personalizované dárky`,
    notice:
      "Personalizované gravírované dárky - produktové texty, platební metody a finální údaje obchodu doplníme v dalším kroku.",
    brandSubtitle: "Personalizované dárky",
    nav: {
      configurator: "Konfigurátor",
      assortment: "Produkty",
      details: "Detaily",
      terms: "Podmínky",
    },
    languageLabel: "Změnit jazyk",
    cartTitle: "Košík",
    breadcrumbs: "Úvod / Personalizované gravírované dárky",
    textLimit: `Text do ${TEXT_LIMIT} znaků`,
    taxNote: "včetně DPH, bez dopravy",
    customTextLabel: "Jméno nebo krátký text",
    customTextPlaceholder: "např. Emilia",
    logoLabel: "Logo motiv",
    previewLabel: "Náhled gravírování",
    previewFallback: "Jméno",
    quantity: "Množství",
    decreaseQuantity: "Snížit množství",
    increaseQuantity: "Zvýšit množství",
    addToCart: "Přidat do košíku",
    cartHeading: "Aktuální výběr",
    emptyCart: "V košíku zatím není žádný personalizovaný produkt.",
    subtotal: "Mezisoučet",
    checkoutSoon: "Checkout doplníme",
    mainPhoto: "Hlavní foto",
    detailPhoto: "Detail",
    selectProduct: "Vybrat",
    service: [
      ["Krátká personalizace", "Do 12 znaků pro čisté gravírovací plochy."],
      ["Vybrané motivy", "Logo motiv lze kombinovat s každým dárkem."],
      ["Více produktových řad", "Vánoce, čtení, přívěšky a dřevěné psací potřeby."],
    ],
    assortmentKicker: "Produkty",
    assortmentTitle: "Personalizovatelné produkty",
    detailsKicker: "Produktové detaily",
    detailsTitle: "Připraveno pro prodej",
    detailCards: [
      [
        "Personalizace",
        "Každý produkt používá stejný objednávkový postup: zadat text, vybrat motiv, zvolit provedení a vložit do košíku.",
      ],
      [
        "Produktová data",
        "Ceny, rozměry a materiály jsou uložené jako produktová data a půjdou později doladit pro každý artikl.",
      ],
      [
        "Objednávka",
        "Checkout je připravený a čeká na platební metody, dopravu a finální právní údaje.",
      ],
    ],
    termsKicker: "Podmínky",
    termsTitle: "Obecné obchodní podmínky",
    terms: [
      [
        "1. Rozsah platnosti",
        `Tyto podmínky platí pro objednávky v online obchodě ${BRAND_NAME}. Odlišná ujednání platí pouze tehdy, pokud byla písemně potvrzena.`,
      ],
      [
        "2. Objednávka",
        "Zákazníci vybírají produkt, množství a personalizaci. Před odesláním lze údaje zkontrolovat a opravit.",
      ],
      [
        "3. Personalizované zboží",
        "Gravírované produkty se vyrábějí podle zadání zákazníka. Překlepy v odeslaném textu lze opravit jen před zahájením výroby.",
      ],
      [
        "4. Ceny a platba",
        "Všechny ceny jsou uvedeny včetně zákonné DPH a bez dopravy. Dostupné platební metody se zobrazí v checkoutu.",
      ],
      [
        "5. Dodání",
        "Doba dodání závisí na produktu a vytížení výroby. Nejasné údaje k personalizaci mohou výrobu prodloužit.",
      ],
      [
        "6. Záruka",
        "Platí zákonná práva z vadného plnění. U poškození při dopravě nebo výrobní vady prosíme o rychlou zprávu s fotografií.",
      ],
    ],
    termsNote:
      "Vzorový text pro prototyp. Údaje firmy, odstoupení od smlouvy, ochranu osobních údajů, dopravu a platby je potřeba před zveřejněním právně zkontrolovat a doplnit.",
  },
  fr: {
    pageTitle: `${BRAND_NAME} | Cadeaux personnalisés`,
    notice:
      "Cadeaux gravés personnalisés - les textes produits, les moyens de paiement et les informations finales de la boutique seront complétés ensuite.",
    brandSubtitle: "Cadeaux personnalisés",
    nav: {
      configurator: "Configurateur",
      assortment: "Produits",
      details: "Détails",
      terms: "CGV",
    },
    languageLabel: "Changer de langue",
    cartTitle: "Panier",
    breadcrumbs: "Accueil / Cadeaux gravés personnalisés",
    textLimit: `Texte jusqu'à ${TEXT_LIMIT} caractères`,
    taxNote: "TVA incluse, hors livraison",
    customTextLabel: "Nom ou texte court",
    customTextPlaceholder: "p. ex. Emilia",
    logoLabel: "Motif logo",
    previewLabel: "Aperçu de gravure",
    previewFallback: "Nom",
    quantity: "Quantité",
    decreaseQuantity: "Réduire la quantité",
    increaseQuantity: "Augmenter la quantité",
    addToCart: "Ajouter au panier",
    cartHeading: "Sélection actuelle",
    emptyCart: "Aucun produit personnalisé dans le panier pour le moment.",
    subtotal: "Sous-total",
    checkoutSoon: "Paiement à venir",
    mainPhoto: "Photo principale",
    detailPhoto: "Détail",
    selectProduct: "Choisir",
    service: [
      ["Personnalisation courte", "Jusqu'à 12 caractères pour une gravure nette."],
      ["Motifs sélectionnés", "Associez chaque cadeau à un motif de la sélection."],
      ["Plusieurs gammes", "Noël, lecture, porte-clés et papeterie en bois."],
    ],
    assortmentKicker: "Produits",
    assortmentTitle: "Produits personnalisables",
    detailsKicker: "Détails produit",
    detailsTitle: "Prêt pour la vente",
    detailCards: [
      [
        "Personnalisation",
        "Chaque produit suit le même parcours: saisir le texte, choisir un motif, sélectionner une finition et ajouter au panier.",
      ],
      [
        "Données produit",
        "Les prix, dimensions et matériaux sont enregistrés comme données produit et pourront être finalisés article par article.",
      ],
      [
        "Commande",
        "Le paiement est préparé et attend les moyens de paiement, les frais de livraison et les mentions légales finales.",
      ],
    ],
    termsKicker: "CGV",
    termsTitle: "Conditions générales de vente",
    terms: [
      [
        "1. Champ d'application",
        `Ces conditions s'appliquent aux commandes passées dans la boutique en ligne ${BRAND_NAME}. Les dispositions différentes ne s'appliquent que si elles sont confirmées par écrit.`,
      ],
      [
        "2. Commande",
        "Les clients choisissent le produit, la quantité et la personnalisation. Les informations peuvent être vérifiées et corrigées avant l'envoi.",
      ],
      [
        "3. Produits personnalisés",
        "Les articles gravés sont fabriqués selon les indications du client. Les erreurs dans le texte transmis ne peuvent être corrigées qu'avant le début de la production.",
      ],
      [
        "4. Prix et paiement",
        "Tous les prix incluent la TVA légale et n'incluent pas les frais de livraison. Les moyens de paiement disponibles seront affichés au paiement.",
      ],
      [
        "5. Livraison",
        "Le délai de livraison dépend du produit et de la charge de production. Des informations de personnalisation imprécises peuvent prolonger la fabrication.",
      ],
      [
        "6. Garantie",
        "Les droits légaux de garantie s'appliquent. En cas de dommage de transport ou de défaut de fabrication, merci de nous contacter rapidement avec une photo.",
      ],
    ],
    termsNote:
      "Texte exemple pour le prototype. Les informations de l'entreprise, le droit de rétractation, la confidentialité, la livraison et les moyens de paiement doivent être vérifiés juridiquement et complétés avant publication.",
  },
  it: {
    pageTitle: `${BRAND_NAME} | Regali personalizzati`,
    notice:
      "Regali incisi personalizzati - testi prodotto, metodi di pagamento e dettagli finali del negozio saranno completati nel prossimo passaggio.",
    brandSubtitle: "Regali personalizzati",
    nav: {
      configurator: "Configuratore",
      assortment: "Prodotti",
      details: "Dettagli",
      terms: "Condizioni",
    },
    languageLabel: "Cambia lingua",
    cartTitle: "Carrello",
    breadcrumbs: "Home / Regali incisi personalizzati",
    textLimit: `Testo fino a ${TEXT_LIMIT} caratteri`,
    taxNote: "IVA inclusa, spedizione esclusa",
    customTextLabel: "Nome o testo breve",
    customTextPlaceholder: "es. Emilia",
    logoLabel: "Motivo logo",
    previewLabel: "Anteprima incisione",
    previewFallback: "Nome",
    quantity: "Quantità",
    decreaseQuantity: "Diminuire quantità",
    increaseQuantity: "Aumentare quantità",
    addToCart: "Aggiungi al carrello",
    cartHeading: "Selezione attuale",
    emptyCart: "Nessun prodotto personalizzato nel carrello.",
    subtotal: "Subtotale",
    checkoutSoon: "Checkout in arrivo",
    mainPhoto: "Foto principale",
    detailPhoto: "Dettaglio",
    selectProduct: "Scegli",
    service: [
      ["Personalizzazione breve", "Fino a 12 caratteri per aree di incisione pulite."],
      ["Motivi selezionati", "Abbina ogni regalo a un motivo logo della selezione."],
      ["Più linee prodotto", "Natale, lettura, portachiavi e articoli in legno."],
    ],
    assortmentKicker: "Prodotti",
    assortmentTitle: "Prodotti personalizzabili",
    detailsKicker: "Dettagli prodotto",
    detailsTitle: "Pronto per la vendita",
    detailCards: [
      [
        "Personalizzazione",
        "Ogni prodotto usa lo stesso flusso d'ordine: inserisci il testo, scegli un motivo, seleziona la finitura e aggiungi al carrello.",
      ],
      [
        "Dati prodotto",
        "Prezzi, dimensioni e materiali sono salvati come dati prodotto e potranno essere finalizzati per ogni articolo.",
      ],
      [
        "Ordine",
        "Il checkout è pronto e attende metodi di pagamento, costi di spedizione e informazioni legali finali.",
      ],
    ],
    termsKicker: "Condizioni",
    termsTitle: "Condizioni generali di vendita",
    terms: [
      [
        "1. Ambito",
        `Queste condizioni si applicano agli ordini effettuati nel negozio online ${BRAND_NAME}. Accordi diversi valgono solo se confermati per iscritto.`,
      ],
      [
        "2. Ordine",
        "I clienti scelgono prodotto, quantità e personalizzazione. I dati possono essere controllati e corretti prima dell'invio.",
      ],
      [
        "3. Prodotti personalizzati",
        "Gli articoli incisi vengono realizzati secondo le indicazioni del cliente. Errori nel testo inviato possono essere corretti solo prima dell'inizio della produzione.",
      ],
      [
        "4. Prezzi e pagamento",
        "Tutti i prezzi includono l'IVA di legge e non includono la spedizione. I metodi di pagamento disponibili saranno mostrati nel checkout.",
      ],
      [
        "5. Consegna",
        "Il tempo di consegna dipende dal prodotto e dal carico di lavoro. Dati di personalizzazione poco chiari possono prolungare la produzione.",
      ],
      [
        "6. Garanzia",
        "Si applicano i diritti di garanzia previsti dalla legge. In caso di danni da trasporto o difetti di produzione, contattaci presto con una foto.",
      ],
    ],
    termsNote:
      "Testo campione per il prototipo. Dati aziendali, diritto di recesso, privacy, spedizione e metodi di pagamento devono essere verificati legalmente e completati prima della pubblicazione.",
  },
};

const homeCopy = {
  de: {
    navLabel: "Start",
    eyebrow: "Geschenke mit Gravur",
    title: BRAND_NAME,
    lead:
      "Personalisierte Kleinigkeiten aus Glas und Holz, die schnell bestellt sind und trotzdem sehr persönlich wirken.",
    primaryCta: "Jetzt konfigurieren",
    secondaryCta: "Sortiment ansehen",
    highlights: ["Eigener Text", "Motiv auswählen", "Liebevoll verpackt"],
    galleryLabel: "Einblicke ins Sortiment",
  },
  en: {
    navLabel: "Home",
    eyebrow: "Engraved gifts",
    title: BRAND_NAME,
    lead:
      "Personalised glass and wooden keepsakes that are easy to order and still feel truly personal.",
    primaryCta: "Start configuring",
    secondaryCta: "View products",
    highlights: ["Custom text", "Choose a motif", "Packed with care"],
    galleryLabel: "Product glimpses",
  },
  cs: {
    navLabel: "Úvod",
    eyebrow: "Dárky s gravírováním",
    title: BRAND_NAME,
    lead:
      "Personalizované drobnosti ze skla a dřeva, které se objednávají jednoduše a přitom působí opravdu osobně.",
    primaryCta: "Začít konfigurovat",
    secondaryCta: "Zobrazit produkty",
    highlights: ["Vlastní text", "Výběr motivu", "Pečlivě zabalené"],
    galleryLabel: "Ukázky sortimentu",
  },
  fr: {
    navLabel: "Accueil",
    eyebrow: "Cadeaux gravés",
    title: BRAND_NAME,
    lead:
      "De petites attentions personnalisées en verre et en bois, faciles à commander et vraiment personnelles.",
    primaryCta: "Configurer",
    secondaryCta: "Voir les produits",
    highlights: ["Texte personnalisé", "Choix du motif", "Emballé avec soin"],
    galleryLabel: "Aperçu des produits",
  },
  it: {
    navLabel: "Inizio",
    eyebrow: "Regali incisi",
    title: BRAND_NAME,
    lead:
      "Piccoli ricordi personalizzati in vetro e legno, semplici da ordinare e davvero personali.",
    primaryCta: "Configura ora",
    secondaryCta: "Vedi prodotti",
    highlights: ["Testo personalizzato", "Scegli il motivo", "Confezionato con cura"],
    galleryLabel: "Anteprima prodotti",
  },
};

const flowCopy = {
  de: {
    backHome: "Zur Startseite",
    otherProducts: "Weitere Produkte",
    catalogPageLead:
      "Hier findest du alle vorbereiteten Produktlinien. Jede Karte zeigt ein großes Produktfoto, weitere Detailbilder und eine kurze Orientierung zur Personalisierung.",
    addedTitle: "Produkt wurde hinzugefügt",
    addedBody:
      "Die personalisierte Auswahl liegt jetzt im Warenkorb. Du kannst weiter einkaufen oder direkt zum Warenkorb wechseln.",
    continueShopping: "Weiter einkaufen",
    goToCart: "Zum Warenkorb",
    cartPageKicker: "Warenkorb",
    cartPageTitle: "Deine Auswahl",
    cartPageLead:
      "Prüfe hier alle personalisierten Produkte. Zahlung, Versand und finale Bestelldaten werden im nächsten Schritt ergänzt.",
    removeItem: "Entfernen",
    cartEmptyAction: "Produkte ansehen",
    checkoutTitle: "Checkout",
    checkoutCta: "Bestellung vorbereiten",
    checkoutNote:
      "Der Checkout ist vorbereitet. Zahlungsarten, Versand und Pflichtangaben werden später ergänzt.",
    checkoutMessage:
      "Danke. Der nächste Schritt wird die echte Bestell- und Zahlungsabwicklung.",
  },
  en: {
    backHome: "Back to home",
    otherProducts: "More products",
    catalogPageLead:
      "Browse all prepared product lines here. Each card shows one large product photo, supporting detail images and a short guide to personalisation.",
    addedTitle: "Product added",
    addedBody:
      "Your personalised selection is now in the cart. You can keep shopping or go straight to the cart.",
    continueShopping: "Keep shopping",
    goToCart: "Go to cart",
    cartPageKicker: "Cart",
    cartPageTitle: "Your selection",
    cartPageLead:
      "Review all personalised products here. Payment, shipping and final order details will be added next.",
    removeItem: "Remove",
    cartEmptyAction: "View products",
    checkoutTitle: "Checkout",
    checkoutCta: "Prepare order",
    checkoutNote:
      "Checkout is prepared. Payment methods, shipping and legal details will be added later.",
    checkoutMessage:
      "Thank you. The next step will be the real order and payment flow.",
  },
  cs: {
    backHome: "Zpět na úvod",
    otherProducts: "Další produkty",
    catalogPageLead:
      "Tady najdeš všechny připravené produktové řady. Každá karta má velkou fotku produktu, detailní snímky a krátký orientační popis personalizace.",
    addedTitle: "Produkt je v košíku",
    addedBody:
      "Personalizovaný produkt je přidaný v košíku. Můžeš pokračovat v nákupu nebo přejít rovnou do košíku.",
    continueShopping: "Pokračovat v nákupu",
    goToCart: "Přejít do košíku",
    cartPageKicker: "Košík",
    cartPageTitle: "Tvůj výběr",
    cartPageLead:
      "Tady uvidíš všechny personalizované produkty. Platby, dopravu a finální objednávkové údaje doplníme v dalším kroku.",
    removeItem: "Odebrat",
    cartEmptyAction: "Zobrazit produkty",
    checkoutTitle: "Checkout",
    checkoutCta: "Připravit objednávku",
    checkoutNote:
      "Checkout je připravený. Platební metody, doprava a povinné údaje se doplní později.",
    checkoutMessage:
      "Děkujeme. Další krok bude skutečné odeslání objednávky a platba.",
  },
  fr: {
    backHome: "Retour à l'accueil",
    otherProducts: "Autres produits",
    catalogPageLead:
      "Retrouvez ici toutes les gammes de produits préparées. Chaque carte présente une grande photo, des détails et une courte description de la personnalisation.",
    addedTitle: "Produit ajouté",
    addedBody:
      "Votre sélection personnalisée est dans le panier. Vous pouvez continuer vos achats ou aller au panier.",
    continueShopping: "Continuer les achats",
    goToCart: "Aller au panier",
    cartPageKicker: "Panier",
    cartPageTitle: "Votre sélection",
    cartPageLead:
      "Vérifiez ici tous les produits personnalisés. Le paiement, la livraison et les détails finaux seront ajoutés ensuite.",
    removeItem: "Retirer",
    cartEmptyAction: "Voir les produits",
    checkoutTitle: "Paiement",
    checkoutCta: "Préparer la commande",
    checkoutNote:
      "Le paiement est préparé. Les moyens de paiement, la livraison et les mentions légales seront ajoutés plus tard.",
    checkoutMessage:
      "Merci. La prochaine étape sera le vrai parcours de commande et de paiement.",
  },
  it: {
    backHome: "Torna alla home",
    otherProducts: "Altri prodotti",
    catalogPageLead:
      "Qui trovi tutte le linee prodotto preparate. Ogni scheda mostra una foto grande, immagini di dettaglio e una breve descrizione della personalizzazione.",
    addedTitle: "Prodotto aggiunto",
    addedBody:
      "La selezione personalizzata è ora nel carrello. Puoi continuare gli acquisti o andare al carrello.",
    continueShopping: "Continua gli acquisti",
    goToCart: "Vai al carrello",
    cartPageKicker: "Carrello",
    cartPageTitle: "La tua selezione",
    cartPageLead:
      "Controlla qui tutti i prodotti personalizzati. Pagamento, spedizione e dati finali saranno aggiunti in seguito.",
    removeItem: "Rimuovi",
    cartEmptyAction: "Vedi prodotti",
    checkoutTitle: "Checkout",
    checkoutCta: "Prepara ordine",
    checkoutNote:
      "Il checkout è preparato. Metodi di pagamento, spedizione e dati legali saranno aggiunti più avanti.",
    checkoutMessage:
      "Grazie. Il prossimo passo sarà il vero flusso di ordine e pagamento.",
  },
};

const introPhotos = [
  {
    productId: "weihnachtskugeln",
    src: "/products/christmas-baubles-main.jpeg",
  },
  {
    productId: "lesezeichen",
    src: "/products/wood-bookmark-page.jpeg",
  },
  {
    productId: "anhaenger",
    src: "/products/wood-pendants-zodiac.jpeg",
  },
  {
    productId: "flaschenoeffner",
    src: "/products/wood-opener.jpeg",
  },
  {
    productId: "kugelschreiber",
    src: "/products/wood-pen.jpeg",
  },
];

const logoOptions = [
  {
    id: "herz",
    mark: "♡",
    label: { de: "Herz", en: "Heart", cs: "Srdce", fr: "Cœur", it: "Cuore" },
  },
  {
    id: "sterne",
    mark: "✦",
    label: { de: "Sterne", en: "Stars", cs: "Hvězdy", fr: "Étoiles", it: "Stelle" },
  },
  {
    id: "pfote",
    mark: "●",
    label: { de: "Pfote", en: "Paw", cs: "Tlapka", fr: "Patte", it: "Zampa" },
  },
  {
    id: "buch",
    mark: "▱",
    label: { de: "Buch", en: "Book", cs: "Kniha", fr: "Livre", it: "Libro" },
  },
  {
    id: "initiale",
    mark: "A",
    label: { de: "Initiale", en: "Initial", cs: "Iniciála", fr: "Initiale", it: "Iniziale" },
  },
  {
    id: "lineart",
    mark: "◎",
    label: { de: "Line-Art", en: "Line art", cs: "Linka", fr: "Line art", it: "Line art" },
  },
];

const products = [
  {
    id: "weihnachtskugeln",
    price: 7.9,
    previewClass: "circle",
    translations: {
      de: {
        category: "Weihnachten",
        badge: "Saisonfavorit",
        name: "Gravierte Weihnachtskugeln",
        shortName: "Weihnachtskugeln",
        delivery: "4-7 Werktage",
        material: "Glas oder Holz",
        size: "ca. 8 cm",
        lead:
          "Personalisierte Weihnachtskugeln mit Name, Kurztext und gewähltem Motiv. Ideal als kleines Geschenk oder für den eigenen Baum.",
        personalization: "Name, Jahr, Herz, Sterne oder Wunschmotiv",
        finishLabel: "Farbe / Form",
      },
      en: {
        category: "Christmas",
        badge: "Season favourite",
        name: "Engraved Christmas Baubles",
        shortName: "Baubles",
        delivery: "4-7 working days",
        material: "Glass or wood",
        size: "approx. 8 cm",
        lead:
          "Personalised Christmas baubles with a name, short text and chosen motif. Perfect as a small gift or for your own tree.",
        personalization: "Name, year, heart, stars or custom motif",
        finishLabel: "Colour / shape",
      },
      cs: {
        category: "Vánoce",
        badge: "Sezónní favorit",
        name: "Gravírované vánoční ozdoby",
        shortName: "Vánoční ozdoby",
        delivery: "4-7 pracovních dnů",
        material: "Sklo nebo dřevo",
        size: "cca 8 cm",
        lead:
          "Personalizované vánoční ozdoby se jménem, krátkým textem a vybraným motivem. Ideální jako malý dárek nebo na vlastní stromek.",
        personalization: "Jméno, rok, srdce, hvězdy nebo vlastní motiv",
        finishLabel: "Barva / tvar",
      },
      fr: {
        category: "Noël",
        badge: "Favori de saison",
        name: "Boules de Noël gravées",
        shortName: "Boules de Noël",
        delivery: "4-7 jours ouvrés",
        material: "Verre ou bois",
        size: "env. 8 cm",
        lead:
          "Boules de Noël personnalisées avec prénom, texte court et motif choisi. Idéales comme petit cadeau ou pour votre propre sapin.",
        personalization: "Prénom, année, cœur, étoiles ou motif au choix",
        finishLabel: "Couleur / forme",
      },
      it: {
        category: "Natale",
        badge: "Preferito stagionale",
        name: "Palline di Natale incise",
        shortName: "Palline di Natale",
        delivery: "4-7 giorni lavorativi",
        material: "Vetro o legno",
        size: "ca. 8 cm",
        lead:
          "Palline di Natale personalizzate con nome, testo breve e motivo scelto. Perfette come piccolo regalo o per il proprio albero.",
        personalization: "Nome, anno, cuore, stelle o motivo personalizzato",
        finishLabel: "Colore / forma",
      },
    },
    finishes: [
      {
        id: "rot",
        hex: "#a8323b",
        edge: "#681722",
        label: {
          de: "Rot glänzend",
          en: "Glossy red",
          cs: "Lesklá červená",
          fr: "Rouge brillant",
          it: "Rosso lucido",
        },
      },
      {
        id: "gold",
        hex: "#d6b26f",
        edge: "#8a642d",
        label: {
          de: "Gold matt",
          en: "Matte gold",
          cs: "Matná zlatá",
          fr: "Or mat",
          it: "Oro opaco",
        },
      },
      {
        id: "blau",
        hex: "#243f6e",
        edge: "#142642",
        label: {
          de: "Nachtblau",
          en: "Midnight blue",
          cs: "Noční modrá",
          fr: "Bleu nuit",
          it: "Blu notte",
        },
      },
      {
        id: "holz",
        hex: "#d9b982",
        edge: "#8a6435",
        label: {
          de: "Holz natur",
          en: "Natural wood",
          cs: "Přírodní dřevo",
          fr: "Bois naturel",
          it: "Legno naturale",
        },
      },
    ],
    photos: [
      {
        id: "main",
        src: "/products/christmas-baubles-main.jpeg",
        alt: {
          de: "Hauptgrafik für gravierte Weihnachtskugeln",
          en: "Main graphic for engraved Christmas baubles",
          cs: "Hlavní grafika pro gravírované vánoční ozdoby",
          fr: "Visuel principal pour boules de Noël gravées",
          it: "Grafica principale per palline di Natale incise",
        },
      },
      {
        id: "wrapped",
        src: "/products/christmas-baubles-wrapped.jpeg",
        alt: {
          de: "Rote personalisierte Weihnachtskugeln mit Schleife",
          en: "Red personalised Christmas baubles with bows",
          cs: "Červené personalizované vánoční ozdoby s mašlí",
          fr: "Boules de Noël rouges personnalisées avec ruban",
          it: "Palline di Natale rosse personalizzate con fiocco",
        },
      },
      {
        id: "set",
        src: "/products/christmas-baubles-color-set.jpeg",
        alt: {
          de: "Set gravierter Weihnachtskugeln in mehreren Farben",
          en: "Set of engraved Christmas baubles in several colours",
          cs: "Sada gravírovaných vánočních ozdob v několika barvách",
          fr: "Lot de boules de Noël gravées en plusieurs couleurs",
          it: "Set di palline di Natale incise in più colori",
        },
      },
    ],
  },
  {
    id: "lesezeichen",
    price: 9.9,
    previewClass: "bookmark",
    translations: {
      de: {
        category: "Lesen",
        badge: "Mit Quaste",
        name: "Holz-Lesezeichen",
        shortName: "Lesezeichen",
        delivery: "3-6 Werktage",
        material: "Birkensperrholz",
        size: "ca. 15 x 4 cm",
        lead:
          "Leichtes Holz-Lesezeichen mit Gravur und farbiger Quaste. Name und Motiv werden passend zur Form gesetzt.",
        personalization: "Name, kurzer Spruch oder Lesemotiv",
        finishLabel: "Quaste",
      },
      en: {
        category: "Reading",
        badge: "With tassel",
        name: "Wooden Bookmark",
        shortName: "Bookmark",
        delivery: "3-6 working days",
        material: "Birch plywood",
        size: "approx. 15 x 4 cm",
        lead:
          "Light wooden bookmark with engraving and coloured tassel. Name and motif are placed to suit the shape.",
        personalization: "Name, short quote or reading motif",
        finishLabel: "Tassel",
      },
      cs: {
        category: "Čtení",
        badge: "Se střapcem",
        name: "Dřevěná záložka",
        shortName: "Záložka",
        delivery: "3-6 pracovních dnů",
        material: "Březová překližka",
        size: "cca 15 x 4 cm",
        lead:
          "Lehká dřevěná záložka s gravírováním a barevným střapcem. Jméno a motiv jsou zasazené podle tvaru.",
        personalization: "Jméno, krátký citát nebo čtecí motiv",
        finishLabel: "Střapec",
      },
      fr: {
        category: "Lecture",
        badge: "Avec pompon",
        name: "Marque-page en bois",
        shortName: "Marque-page",
        delivery: "3-6 jours ouvrés",
        material: "Contreplaqué de bouleau",
        size: "env. 15 x 4 cm",
        lead:
          "Marque-page léger en bois avec gravure et pompon coloré. Le prénom et le motif sont placés selon la forme.",
        personalization: "Prénom, courte citation ou motif lecture",
        finishLabel: "Pompon",
      },
      it: {
        category: "Lettura",
        badge: "Con nappina",
        name: "Segnalibro in legno",
        shortName: "Segnalibro",
        delivery: "3-6 giorni lavorativi",
        material: "Compensato di betulla",
        size: "ca. 15 x 4 cm",
        lead:
          "Segnalibro leggero in legno con incisione e nappina colorata. Nome e motivo vengono posizionati in armonia con la forma.",
        personalization: "Nome, frase breve o motivo lettura",
        finishLabel: "Nappina",
      },
    },
    finishes: [
      {
        id: "orange",
        hex: "#e59a2f",
        edge: "#a96513",
        label: { de: "Orange", en: "Orange", cs: "Oranžová", fr: "Orange", it: "Arancione" },
      },
      {
        id: "violett",
        hex: "#5c3c98",
        edge: "#362260",
        label: { de: "Violett", en: "Purple", cs: "Fialová", fr: "Violet", it: "Viola" },
      },
      {
        id: "natur",
        hex: "#c7a577",
        edge: "#80623f",
        label: {
          de: "Naturband",
          en: "Natural cord",
          cs: "Přírodní šňůrka",
          fr: "Cordon naturel",
          it: "Cordino naturale",
        },
      },
    ],
    photos: [
      {
        id: "name",
        src: "/products/wood-bookmark-name.jpeg",
        alt: {
          de: "Holz-Lesezeichen mit Namensgravur und gelber Quaste",
          en: "Wooden bookmark with name engraving and yellow tassel",
          cs: "Dřevěná záložka s gravírovaným jménem a žlutým střapcem",
          fr: "Marque-page en bois avec prénom gravé et pompon jaune",
          it: "Segnalibro in legno con nome inciso e nappina gialla",
        },
      },
      {
        id: "page",
        src: "/products/wood-bookmark-page.jpeg",
        alt: {
          de: "Holz-Lesezeichen mit graviertem Lesespruch",
          en: "Wooden bookmark with engraved reading quote",
          cs: "Dřevěná záložka s gravírovaným čtecím nápisem",
          fr: "Marque-page en bois avec citation de lecture gravée",
          it: "Segnalibro in legno con frase di lettura incisa",
        },
      },
    ],
  },
  {
    id: "anhaenger",
    price: 8.9,
    previewClass: "pendant",
    translations: {
      de: {
        category: "Schlüssel",
        badge: "Motivserie",
        name: "Holz-Anhänger",
        shortName: "Anhänger",
        delivery: "3-6 Werktage",
        material: "Rundes Holzplättchen",
        size: "ca. 5 cm",
        lead:
          "Runder Holz-Anhänger mit feiner Motivgravur. Auf Wunsch mit kurzem Namen auf der Rückseite oder als schlichte Motivserie.",
        personalization: "Name, Initiale oder Symbol",
        finishLabel: "Motivwelt",
      },
      en: {
        category: "Keys",
        badge: "Motif series",
        name: "Wooden Keychain",
        shortName: "Keychain",
        delivery: "3-6 working days",
        material: "Round wooden disc",
        size: "approx. 5 cm",
        lead:
          "Round wooden keychain with fine motif engraving. Add a short name on the back or keep it as a clean motif piece.",
        personalization: "Name, initial or symbol",
        finishLabel: "Motif style",
      },
      cs: {
        category: "Klíče",
        badge: "Motivová série",
        name: "Dřevěný přívěšek",
        shortName: "Přívěšek",
        delivery: "3-6 pracovních dnů",
        material: "Kulaté dřevěné kolečko",
        size: "cca 5 cm",
        lead:
          "Kulatý dřevěný přívěšek s jemným gravírovaným motivem. Na přání se jménem na zadní straně nebo jako čistá motivová série.",
        personalization: "Jméno, iniciála nebo symbol",
        finishLabel: "Styl motivu",
      },
      fr: {
        category: "Clés",
        badge: "Série de motifs",
        name: "Porte-clés en bois",
        shortName: "Porte-clés",
        delivery: "3-6 jours ouvrés",
        material: "Disque rond en bois",
        size: "env. 5 cm",
        lead:
          "Porte-clés rond en bois avec gravure fine. Ajoutez un prénom court au verso ou gardez un motif épuré.",
        personalization: "Prénom, initiale ou symbole",
        finishLabel: "Univers motif",
      },
      it: {
        category: "Chiavi",
        badge: "Serie motivi",
        name: "Portachiavi in legno",
        shortName: "Portachiavi",
        delivery: "3-6 giorni lavorativi",
        material: "Disco rotondo in legno",
        size: "ca. 5 cm",
        lead:
          "Portachiavi rotondo in legno con fine incisione del motivo. Aggiungi un nome breve sul retro o lascialo come motivo essenziale.",
        personalization: "Nome, iniziale o simbolo",
        finishLabel: "Stile motivo",
      },
    },
    finishes: [
      {
        id: "zodiac",
        hex: "#d8bd8b",
        edge: "#8d6a37",
        label: { de: "Sternzeichen", en: "Zodiac", cs: "Znamení", fr: "Zodiaque", it: "Zodiaco" },
      },
      {
        id: "classic",
        hex: "#cfa66d",
        edge: "#805a2f",
        label: { de: "Klassisch", en: "Classic", cs: "Klasické", fr: "Classique", it: "Classico" },
      },
      {
        id: "minimal",
        hex: "#eee1c6",
        edge: "#9a7a50",
        label: { de: "Minimal", en: "Minimal", cs: "Minimal", fr: "Minimal", it: "Minimal" },
      },
    ],
    photos: [
      {
        id: "zodiac",
        src: "/products/wood-pendants-zodiac.jpeg",
        alt: {
          de: "Mehrere runde Holz-Anhänger mit gravierten Motiven",
          en: "Several round wooden keychains with engraved motifs",
          cs: "Více kulatých dřevěných přívěšků s gravírovanými motivy",
          fr: "Plusieurs porte-clés ronds en bois avec motifs gravés",
          it: "Diversi portachiavi rotondi in legno con motivi incisi",
        },
      },
      {
        id: "detail",
        src: "/products/wood-pendant-detail.jpeg",
        alt: {
          de: "Detailaufnahme eines runden Holz-Anhängers mit Gravur",
          en: "Close-up of a round wooden keychain with engraving",
          cs: "Detail kulatého dřevěného přívěšku s gravírováním",
          fr: "Gros plan d'un porte-clés rond en bois gravé",
          it: "Dettaglio di un portachiavi rotondo in legno inciso",
        },
      },
    ],
  },
  {
    id: "flaschenoeffner",
    price: 14.9,
    previewClass: "opener",
    translations: {
      de: {
        category: "Geschenke",
        badge: "Holzgriff",
        name: "Holz-Flaschenöffner",
        shortName: "Flaschenöffner",
        delivery: "4-7 Werktage",
        material: "Holzgriff & Metallkopf",
        size: "ca. 14 cm",
        lead:
          "Stabiler Flaschenöffner mit Holzgriff und persönlicher Gravur. Ein praktisches Geschenk für Feiern, Küche und Grillabende.",
        personalization: "Name oder kurzer Titel",
        finishLabel: "Gravurstil",
      },
      en: {
        category: "Gifts",
        badge: "Wooden handle",
        name: "Wooden Bottle Opener",
        shortName: "Bottle opener",
        delivery: "4-7 working days",
        material: "Wooden handle & metal head",
        size: "approx. 14 cm",
        lead:
          "Sturdy bottle opener with wooden handle and personal engraving. A practical gift for parties, kitchens and barbecues.",
        personalization: "Name or short title",
        finishLabel: "Engraving style",
      },
      cs: {
        category: "Dárky",
        badge: "Dřevěná rukojeť",
        name: "Dřevěný otvírák",
        shortName: "Otvírák",
        delivery: "4-7 pracovních dnů",
        material: "Dřevěná rukojeť a kovová hlavice",
        size: "cca 14 cm",
        lead:
          "Pevný otvírák s dřevěnou rukojetí a osobním gravírováním. Praktický dárek na oslavy, do kuchyně i ke grilu.",
        personalization: "Jméno nebo krátký titul",
        finishLabel: "Styl gravírování",
      },
      fr: {
        category: "Cadeaux",
        badge: "Manche en bois",
        name: "Décapsuleur en bois",
        shortName: "Décapsuleur",
        delivery: "4-7 jours ouvrés",
        material: "Manche en bois et tête métal",
        size: "env. 14 cm",
        lead:
          "Décapsuleur solide avec manche en bois et gravure personnelle. Un cadeau pratique pour les fêtes, la cuisine et les barbecues.",
        personalization: "Prénom ou petit titre",
        finishLabel: "Style de gravure",
      },
      it: {
        category: "Regali",
        badge: "Manico in legno",
        name: "Apribottiglie in legno",
        shortName: "Apribottiglie",
        delivery: "4-7 giorni lavorativi",
        material: "Manico in legno e testa in metallo",
        size: "ca. 14 cm",
        lead:
          "Apribottiglie robusto con manico in legno e incisione personale. Un regalo pratico per feste, cucina e grigliate.",
        personalization: "Nome o titolo breve",
        finishLabel: "Stile incisione",
      },
    },
    finishes: [
      {
        id: "script",
        hex: "#bf8f56",
        edge: "#76512c",
        label: { de: "Schreibschrift", en: "Script", cs: "Psací písmo", fr: "Écriture", it: "Corsivo" },
      },
      {
        id: "bold",
        hex: "#c8a06f",
        edge: "#7d5632",
        label: { de: "Kräftig", en: "Bold", cs: "Výrazné", fr: "Marqué", it: "Marcato" },
      },
      {
        id: "classic",
        hex: "#d4b785",
        edge: "#8a673b",
        label: { de: "Klassisch", en: "Classic", cs: "Klasické", fr: "Classique", it: "Classico" },
      },
    ],
    photos: [
      {
        id: "single",
        src: "/products/wood-opener.jpeg",
        alt: {
          de: "Holz-Flaschenöffner mit graviertem Namen",
          en: "Wooden bottle opener with engraved name",
          cs: "Dřevěný otvírák s gravírovaným jménem",
          fr: "Décapsuleur en bois avec prénom gravé",
          it: "Apribottiglie in legno con nome inciso",
        },
      },
    ],
  },
  {
    id: "kugelschreiber",
    price: 11.9,
    previewClass: "pen",
    translations: {
      de: {
        category: "Schreiben",
        badge: "Bambusoptik",
        name: "Holz-Kugelschreiber",
        shortName: "Kugelschreiber",
        delivery: "3-6 Werktage",
        material: "Holz & Metall",
        size: "ca. 14 cm",
        lead:
          "Eleganter Kugelschreiber aus Holz mit Namensgravur. Passt als kleines Dankeschön, Firmenpräsent oder persönliches Set.",
        personalization: "Name oder kurzer Gruß",
        finishLabel: "Clipfarbe",
      },
      en: {
        category: "Writing",
        badge: "Bamboo look",
        name: "Wooden Ballpoint Pen",
        shortName: "Pen",
        delivery: "3-6 working days",
        material: "Wood & metal",
        size: "approx. 14 cm",
        lead:
          "Elegant wooden ballpoint pen with name engraving. Ideal as a small thank-you, company gift or personal set.",
        personalization: "Name or short greeting",
        finishLabel: "Clip colour",
      },
      cs: {
        category: "Psaní",
        badge: "Bambusový vzhled",
        name: "Dřevěná propiska",
        shortName: "Propiska",
        delivery: "3-6 pracovních dnů",
        material: "Dřevo a kov",
        size: "cca 14 cm",
        lead:
          "Elegantní dřevěná propiska s gravírovaným jménem. Hodí se jako drobné poděkování, firemní dárek nebo osobní sada.",
        personalization: "Jméno nebo krátké věnování",
        finishLabel: "Barva klipu",
      },
      fr: {
        category: "Écriture",
        badge: "Aspect bambou",
        name: "Stylo bille en bois",
        shortName: "Stylo",
        delivery: "3-6 jours ouvrés",
        material: "Bois et métal",
        size: "env. 14 cm",
        lead:
          "Stylo bille élégant en bois avec gravure du prénom. Parfait comme petit merci, cadeau d'entreprise ou ensemble personnel.",
        personalization: "Prénom ou court message",
        finishLabel: "Couleur du clip",
      },
      it: {
        category: "Scrittura",
        badge: "Effetto bambù",
        name: "Penna a sfera in legno",
        shortName: "Penna",
        delivery: "3-6 giorni lavorativi",
        material: "Legno e metallo",
        size: "ca. 14 cm",
        lead:
          "Elegante penna a sfera in legno con nome inciso. Perfetta come piccolo grazie, regalo aziendale o set personale.",
        personalization: "Nome o breve dedica",
        finishLabel: "Colore clip",
      },
    },
    finishes: [
      {
        id: "silber",
        hex: "#d4d8da",
        edge: "#858c90",
        label: { de: "Silber", en: "Silver", cs: "Stříbrná", fr: "Argent", it: "Argento" },
      },
      {
        id: "chrom",
        hex: "#b9c0c2",
        edge: "#6b7275",
        label: { de: "Chrom", en: "Chrome", cs: "Chrom", fr: "Chrome", it: "Cromo" },
      },
      {
        id: "natur",
        hex: "#d7b679",
        edge: "#8b6332",
        label: { de: "Natur", en: "Natural", cs: "Přírodní", fr: "Naturel", it: "Naturale" },
      },
    ],
    photos: [
      {
        id: "single",
        src: "/products/wood-pen.jpeg",
        alt: {
          de: "Holz-Kugelschreiber mit graviertem Namen",
          en: "Wooden ballpoint pen with engraved name",
          cs: "Dřevěná propiska s gravírovaným jménem",
          fr: "Stylo bille en bois avec prénom gravé",
          it: "Penna a sfera in legno con nome inciso",
        },
      },
      {
        id: "set",
        src: "/products/wood-opener-pen-set.jpeg",
        alt: {
          de: "Set aus Holz-Kugelschreiber und Flaschenöffner",
          en: "Set with wooden pen and bottle opener",
          cs: "Sada dřevěné propisky a otvíráku",
          fr: "Ensemble stylo en bois et décapsuleur",
          it: "Set con penna in legno e apribottiglie",
        },
      },
    ],
  },
];

type PageView = "home" | "products" | "product" | "cart" | "terms";

type RouteState = {
  view: PageView;
  productId?: string;
};

function productHref(productId: string) {
  return `/produkt/${productId}`;
}

function parseRoute(pathname: string): RouteState {
  const [firstSegment, secondSegment] = pathname.split("/").filter(Boolean);

  if (firstSegment === "produkt" && secondSegment && products.some((product) => product.id === secondSegment)) {
    return { view: "product", productId: secondSegment };
  }

  if (firstSegment === "kosik") {
    return { view: "cart" };
  }

  if (firstSegment === "produkty") {
    return { view: "products" };
  }

  if (firstSegment === "agb") {
    return { view: "terms" };
  }

  return { view: "home" };
}

function getInitialRoute(initialPath = "/"): RouteState {
  if (typeof window === "undefined") {
    return parseRoute(initialPath);
  }

  return parseRoute(window.location.pathname);
}

type CartItem = {
  id: number;
  productId: string;
  customText: string;
  finishId: string;
  logoId: string;
  quantity: number;
  price: number;
};

function formatPrice(value: number, language: LanguageCode) {
  return new Intl.NumberFormat(localeByLanguage[language], {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function getProduct(productId: string) {
  return products.find((product) => product.id === productId) ?? products[0];
}

function getLogo(logoId: string) {
  return logoOptions.find((logo) => logo.id === logoId) ?? logoOptions[0];
}

function getFinish(productId: string, finishId: string) {
  const product = getProduct(productId);
  return product.finishes.find((finish) => finish.id === finishId) ?? product.finishes[0];
}

type HomeProps = {
  initialPath?: string;
};

export default function Home({ initialPath = "/" }: HomeProps = {}) {
  const initialRoute = getInitialRoute(initialPath);
  const [language, setLanguage] = useState<LanguageCode>("de");
  const [currentView, setCurrentView] = useState<PageView>(() => initialRoute.view);
  const [selectedProductId, setSelectedProductId] = useState(
    () => initialRoute.productId ?? products[0].id,
  );
  const [selectedPhotoId, setSelectedPhotoId] = useState(
    () => getProduct(initialRoute.productId ?? products[0].id).photos[0].id,
  );
  const [selectedFinishId, setSelectedFinishId] = useState(
    () => getProduct(initialRoute.productId ?? products[0].id).finishes[0].id,
  );
  const [customText, setCustomText] = useState("Mila");
  const [selectedLogoId, setSelectedLogoId] = useState(logoOptions[0].id);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [showCartChoice, setShowCartChoice] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState(false);

  const t = ui[language];
  const home = homeCopy[language];
  const flow = flowCopy[language];
  const selectedProduct = getProduct(selectedProductId);
  const selectedProductCopy = selectedProduct.translations[language];
  const selectedPhoto =
    selectedProduct.photos.find((photo) => photo.id === selectedPhotoId) ??
    selectedProduct.photos[0];
  const selectedFinish =
    selectedProduct.finishes.find((finish) => finish.id === selectedFinishId) ??
    selectedProduct.finishes[0];
  const selectedLogo = getLogo(selectedLogoId);
  const previewText = customText.trim() || t.previewFallback;
  const previewNameSize =
    previewText.length > 10 ? "0.9rem" : previewText.length > 7 ? "1.04rem" : "1.18rem";

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );
  const cartQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.title =
      currentView === "product"
        ? `${selectedProductCopy.name} | ${BRAND_NAME}`
        : currentView === "products"
          ? `${t.assortmentTitle} | ${BRAND_NAME}`
        : currentView === "cart"
          ? `${t.cartTitle} | ${BRAND_NAME}`
          : currentView === "terms"
            ? `${t.termsTitle} | ${BRAND_NAME}`
            : t.pageTitle;
  }, [
    currentView,
    language,
    selectedProductCopy.name,
    t.assortmentTitle,
    t.cartTitle,
    t.pageTitle,
    t.termsTitle,
  ]);

  useEffect(() => {
    try {
      const storedCart =
        window.localStorage.getItem(CART_STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart) as CartItem[];
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } finally {
      setCartHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!cartHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  }, [cartHydrated, cartItems]);

  useEffect(() => {
    function syncRoute() {
      const route = parseRoute(window.location.pathname);
      setCurrentView(route.view);
      setShowCartChoice(false);

      if (route.productId) {
        applyProductSelection(route.productId);
      }
    }

    window.addEventListener("popstate", syncRoute);
    syncRoute();

    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  function applyProductSelection(productId: string) {
    const nextProduct = getProduct(productId);
    setSelectedProductId(nextProduct.id);
    setSelectedPhotoId(nextProduct.photos[0].id);
    setSelectedFinishId(nextProduct.finishes[0].id);
  }

  function scrollToPageTop() {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function scrollToSection(sectionId: string) {
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function navigateHome(sectionId?: string) {
    setCurrentView("home");
    setShowCartChoice(false);
    setCheckoutMessage(false);
    window.history.pushState(null, "", sectionId ? `/#${sectionId}` : "/");

    if (sectionId) {
      scrollToSection(sectionId);
    } else {
      scrollToPageTop();
    }
  }

  function navigateProducts() {
    setCurrentView("products");
    setShowCartChoice(false);
    setCheckoutMessage(false);
    window.history.pushState(null, "", "/produkty");
    scrollToPageTop();
  }

  function navigateCart(sectionId?: string) {
    setCurrentView("cart");
    setShowCartChoice(false);
    window.history.pushState(null, "", sectionId ? `/kosik#${sectionId}` : "/kosik");

    if (sectionId) {
      scrollToSection(sectionId);
    } else {
      scrollToPageTop();
    }
  }

  function navigateTerms() {
    setCurrentView("terms");
    setShowCartChoice(false);
    setCheckoutMessage(false);
    window.history.pushState(null, "", "/agb");
    scrollToPageTop();
  }

  function selectProduct(productId: string) {
    applyProductSelection(productId);
    setCurrentView("product");
    setShowCartChoice(false);
    setCheckoutMessage(false);
    window.history.pushState(null, "", productHref(productId));
    scrollToPageTop();
  }

  function addToCart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCartItems((items) => [
      ...items,
      {
        id: Date.now(),
        productId: selectedProduct.id,
        customText: previewText,
        finishId: selectedFinish.id,
        logoId: selectedLogo.id,
        quantity,
        price: selectedProduct.price,
      },
    ]);
    setShowCartChoice(true);
  }

  function removeCartItem(itemId: number) {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
  }

  function renderProductCard(product: (typeof products)[number], selected = false) {
    const productCopy = product.translations[language];

    return (
      <button
        className={`product-card ${selected ? "selected" : ""}`}
        key={product.id}
        type="button"
        aria-pressed={selected}
        onClick={() => selectProduct(product.id)}
      >
        <img src={product.photos[0].src} alt={product.photos[0].alt[language]} />
        <div>
          <p className="section-kicker">{productCopy.category}</p>
          <h3>{productCopy.name}</h3>
          <p>{productCopy.personalization}</p>
        </div>
        <div className="card-bottom">
          <strong>{formatPrice(product.price, language)}</strong>
        </div>
      </button>
    );
  }

  function renderCartSummary() {
    return (
      <aside className="cart-summary" id="warenkorb" aria-label={t.cartTitle}>
        <div>
          <p className="section-kicker">{t.cartTitle}</p>
          <h2>{t.cartHeading}</h2>
        </div>
        {cartItems.length === 0 ? (
          <p className="empty-cart">{t.emptyCart}</p>
        ) : (
          <div className="cart-list" aria-live="polite">
            {cartItems.map((item) => {
              const product = getProduct(item.productId);
              const finish = getFinish(item.productId, item.finishId);
              const logo = getLogo(item.logoId);

              return (
                <article className="cart-line" key={item.id}>
                  <div>
                    <strong>{product.translations[language].shortName}</strong>
                    <span>
                      {item.customText} / {logo.label[language]}
                    </span>
                    <span>{finish.label[language]}</span>
                  </div>
                  <span>
                    {item.quantity} x {formatPrice(item.price, language)}
                  </span>
                </article>
              );
            })}
          </div>
        )}
        <div className="cart-total">
          <span>{t.subtotal}</span>
          <strong>{formatPrice(cartTotal, language)}</strong>
        </div>
        <button className="secondary-button" type="button" onClick={() => navigateCart()}>
          {flow.goToCart}
        </button>
      </aside>
    );
  }

  return (
    <div className={`shop-shell view-${currentView}`}>
      <div className="top-notice">{t.notice}</div>

      <header className="shop-header">
        <a
          className="brand"
          href="/"
          aria-label={BRAND_NAME}
          onClick={(event) => {
            event.preventDefault();
            navigateHome();
          }}
        >
          <span className="brand-mark">SG</span>
          <span>
            <strong>{BRAND_NAME}</strong>
            <small>{t.brandSubtitle}</small>
          </span>
        </a>
        <nav className="main-nav" aria-label={t.nav.assortment}>
          <a
            className={currentView === "home" ? "active" : ""}
            href="/"
            onClick={(event) => {
              event.preventDefault();
              navigateHome();
            }}
          >
            {home.navLabel}
          </a>
          <a
            className={currentView === "products" ? "active" : ""}
            href="/produkty"
            onClick={(event) => {
              event.preventDefault();
              navigateProducts();
            }}
          >
            {t.nav.assortment}
          </a>
          <a
            className={currentView === "cart" ? "active" : ""}
            href="/kosik"
            onClick={(event) => {
              event.preventDefault();
              navigateCart();
            }}
          >
            {t.cartTitle}
          </a>
          <a
            className={currentView === "terms" ? "active" : ""}
            href="/agb"
            onClick={(event) => {
              event.preventDefault();
              navigateTerms();
            }}
          >
            {t.nav.terms}
          </a>
        </nav>
        <div className="header-actions">
          <div className="language-switcher" aria-label={t.languageLabel}>
            {languages.map((option) => (
              <button
                className={language === option.code ? "selected" : ""}
                key={option.code}
                type="button"
                aria-label={option.name}
                aria-pressed={language === option.code}
                onClick={() => setLanguage(option.code)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <a
            className="header-cart"
            href="/kosik"
            onClick={(event) => {
              event.preventDefault();
              navigateCart();
            }}
          >
            {t.cartTitle} {cartQuantity > 0 ? `(${cartQuantity})` : ""}
          </a>
        </div>
      </header>

      <main>
        {currentView === "home" && (
          <>
            <section
              className="home-hero"
              id="start"
              aria-labelledby="home-title"
              style={
                {
                  "--hero-image": "url('/products/christmas-baubles-main.jpeg')",
                } as CSSProperties
              }
            >
              <div className="home-hero-copy">
                <p className="section-kicker">{home.eyebrow}</p>
                <h1 id="home-title">{home.title}</h1>
                <p>{home.lead}</p>
                <div className="hero-actions">
                  <a
                    className="hero-primary"
                    href={productHref(products[0].id)}
                    onClick={(event) => {
                      event.preventDefault();
                      selectProduct(products[0].id);
                    }}
                  >
                    {home.primaryCta}
                  </a>
                  <a
                    className="hero-secondary"
                    href="/produkty"
                    onClick={(event) => {
                      event.preventDefault();
                      navigateProducts();
                    }}
                  >
                    {home.secondaryCta}
                  </a>
                </div>
                <div className="hero-highlights" aria-label={home.galleryLabel}>
                  {home.highlights.map((highlight) => (
                    <span key={highlight}>{highlight}</span>
                  ))}
                </div>
              </div>
            </section>

            <section className="intro-gallery" id="produkte" aria-label={home.galleryLabel}>
              {introPhotos.map((photo) => {
                const product = getProduct(photo.productId);
                const productCopy = product.translations[language];

                return (
                  <button
                    className="intro-photo"
                    key={photo.productId}
                    type="button"
                    onClick={() => selectProduct(product.id)}
                  >
                    <img src={photo.src} alt={productCopy.name} />
                    <span>{productCopy.name}</span>
                  </button>
                );
              })}
            </section>
          </>
        )}

        {currentView === "products" && (
          <>
            <div className="page-toolbar catalog-toolbar">
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  navigateHome();
                }}
              >
                {flow.backHome}
              </a>
              <button type="button" onClick={() => navigateCart()}>
                {flow.goToCart}
              </button>
            </div>

            <section className="catalog-page" id="katalog" aria-labelledby="catalog-title">
              <div className="section-heading cart-page-heading">
                <div>
                  <p className="section-kicker">{t.assortmentKicker}</p>
                  <h1 id="catalog-title">{t.assortmentTitle}</h1>
                </div>
                <p>{flow.catalogPageLead}</p>
              </div>

              <div className="catalog-list">
                {products.map((product) => {
                  const productCopy = product.translations[language];
                  const [mainPhoto, ...detailPhotos] = product.photos;
                  const catalogDetails = detailPhotos.length > 0 ? detailPhotos : product.photos;

                  return (
                    <article className="catalog-product-card" key={product.id}>
                      <div className="catalog-media">
                        <button
                          className="catalog-main-photo"
                          type="button"
                          aria-label={`${t.selectProduct}: ${productCopy.name}`}
                          onClick={() => selectProduct(product.id)}
                        >
                          <img src={mainPhoto.src} alt={mainPhoto.alt[language]} />
                        </button>
                        <div className="catalog-detail-photos" aria-label={t.detailPhoto}>
                          {catalogDetails.map((photo) => (
                            <button
                              key={photo.id}
                              type="button"
                              aria-label={photo.alt[language]}
                              onClick={() => selectProduct(product.id)}
                            >
                              <img src={photo.src} alt="" aria-hidden="true" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="catalog-copy">
                        <p className="section-kicker">{productCopy.category}</p>
                        <h2>{productCopy.name}</h2>
                        <p>{productCopy.lead}</p>
                        <div className="catalog-meta">
                          <span>{productCopy.delivery}</span>
                          <span>{productCopy.material}</span>
                          <span>{productCopy.size}</span>
                          <span>{t.textLimit}</span>
                        </div>
                        <p className="catalog-personalization">
                          <strong>{productCopy.finishLabel}:</strong>{" "}
                          {productCopy.personalization}
                        </p>
                        <strong className="catalog-price">
                          {formatPrice(product.price, language)}
                        </strong>
                        <button
                          className="primary-button"
                          type="button"
                          onClick={() => selectProduct(product.id)}
                        >
                          {t.selectProduct}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {currentView === "product" && (
          <>
            <div className="page-toolbar">
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  navigateHome();
                }}
              >
                {flow.backHome}
              </a>
              <button type="button" onClick={() => navigateCart()}>
                {flow.goToCart}
              </button>
            </div>

            <section className="product-section" id="produkt" aria-labelledby="product-title">
              <div className="gallery-column">
                <div className="product-photo-frame">
                  <img src={selectedPhoto.src} alt={selectedPhoto.alt[language]} />
                </div>
                <div className="thumb-row" aria-label={t.detailPhoto}>
                  {selectedProduct.photos.map((photo) => (
                    <button
                      className={`thumb-button ${selectedPhoto.id === photo.id ? "active" : ""}`}
                      key={photo.id}
                      type="button"
                      aria-pressed={selectedPhoto.id === photo.id}
                      onClick={() => setSelectedPhotoId(photo.id)}
                    >
                      <img src={photo.src} alt="" aria-hidden="true" />
                      <span>
                        {photo.id === selectedProduct.photos[0].id ? t.mainPhoto : t.detailPhoto}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="purchase-panel">
                <p className="breadcrumbs">{t.breadcrumbs}</p>
                <div className="product-switcher" aria-label={t.nav.assortment}>
                  {products.map((product) => (
                    <button
                      className={selectedProduct.id === product.id ? "selected" : ""}
                      key={product.id}
                      type="button"
                      aria-pressed={selectedProduct.id === product.id}
                      onClick={() => selectProduct(product.id)}
                    >
                      {product.translations[language].shortName}
                    </button>
                  ))}
                </div>

                <p className="product-badge">{selectedProductCopy.badge}</p>
                <h1 id="product-title">{selectedProductCopy.name}</h1>
                <p className="product-lead">{selectedProductCopy.lead}</p>

                <div className="purchase-meta">
                  <span>{selectedProductCopy.delivery}</span>
                  <span>{selectedProductCopy.material}</span>
                  <span>{selectedProductCopy.size}</span>
                  <span>{t.textLimit}</span>
                </div>

                <div className="price-row">
                  <span className="price">{formatPrice(selectedProduct.price, language)}</span>
                  <span className="tax-note">{t.taxNote}</span>
                </div>

                <form className="configurator" onSubmit={addToCart}>
                  <label className="field-group" htmlFor="custom-text">
                    <span>{t.customTextLabel}</span>
                    <input
                      id="custom-text"
                      maxLength={TEXT_LIMIT}
                      value={customText}
                      onChange={(event) => setCustomText(event.target.value.slice(0, TEXT_LIMIT))}
                      placeholder={t.customTextPlaceholder}
                    />
                  </label>

                  <div className="field-group">
                    <span>{selectedProductCopy.finishLabel}</span>
                    <div
                      className="color-grid"
                      role="radiogroup"
                      aria-label={selectedProductCopy.finishLabel}
                    >
                      {selectedProduct.finishes.map((finish) => (
                        <button
                          className={`color-option ${
                            selectedFinish.id === finish.id ? "selected" : ""
                          }`}
                          key={finish.id}
                          type="button"
                          aria-pressed={selectedFinish.id === finish.id}
                          onClick={() => setSelectedFinishId(finish.id)}
                        >
                          <span
                            className="swatch"
                            style={
                              {
                                "--swatch": finish.hex,
                                "--swatch-edge": finish.edge,
                              } as CSSProperties
                            }
                          />
                          <span>{finish.label[language]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field-group">
                    <span>{t.logoLabel}</span>
                    <div className="logo-grid" role="radiogroup" aria-label={t.logoLabel}>
                      {logoOptions.map((logo) => (
                        <button
                          className={`logo-option ${
                            selectedLogo.id === logo.id ? "selected" : ""
                          }`}
                          key={logo.id}
                          type="button"
                          aria-pressed={selectedLogo.id === logo.id}
                          onClick={() => setSelectedLogoId(logo.id)}
                        >
                          <span className="logo-symbol" aria-hidden="true">
                            {logo.mark}
                          </span>
                          <span>{logo.label[language]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="preview-row" aria-label={t.previewLabel}>
                    <div className={`engraving-card ${selectedProduct.previewClass}`}>
                      <span className="preview-logo">{selectedLogo.mark}</span>
                      <span className="preview-name" style={{ fontSize: previewNameSize }}>
                        {previewText}
                      </span>
                    </div>
                    <div>
                      <strong>{selectedProductCopy.personalization}</strong>
                      <span>
                        {selectedFinish.label[language]} / {selectedLogo.label[language]}
                      </span>
                    </div>
                  </div>

                  <div className="quantity-row">
                    <span>{t.quantity}</span>
                    <div className="stepper" aria-label={t.quantity}>
                      <button
                        type="button"
                        aria-label={t.decreaseQuantity}
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      >
                        -
                      </button>
                      <output aria-live="polite">{quantity}</output>
                      <button
                        type="button"
                        aria-label={t.increaseQuantity}
                        onClick={() => setQuantity((current) => Math.min(12, current + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button className="primary-button" type="submit">
                    {t.addToCart}
                  </button>
                </form>
              </div>

              {renderCartSummary()}
            </section>

            <section
              className="products-section related-section"
              id="related-products"
              aria-labelledby="related-title"
            >
              <div className="section-heading section-heading-left">
                <h2 id="related-title">{flow.otherProducts}</h2>
              </div>
              <div className="product-card-grid">
                {products
                  .filter((product) => product.id !== selectedProduct.id)
                  .map((product) => renderProductCard(product))}
              </div>
            </section>
          </>
        )}

        {currentView === "cart" && (
          <>
            <div className="page-toolbar cart-toolbar">
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  navigateHome();
                }}
              >
                {flow.backHome}
              </a>
              <button type="button" onClick={() => navigateProducts()}>
                {t.nav.assortment}
              </button>
            </div>

            <section className="cart-page" id="warenkorb" aria-labelledby="cart-page-title">
              <div className="section-heading cart-page-heading">
                <div>
                  <p className="section-kicker">{flow.cartPageKicker}</p>
                  <h1 id="cart-page-title">{flow.cartPageTitle}</h1>
                </div>
                <p>{flow.cartPageLead}</p>
              </div>

              <div className="cart-page-grid">
                <div className="cart-page-list">
                  {cartItems.length === 0 ? (
                    <div className="empty-state">
                      <p>{t.emptyCart}</p>
                      <button type="button" onClick={() => navigateProducts()}>
                        {flow.cartEmptyAction}
                      </button>
                    </div>
                  ) : (
                    cartItems.map((item) => {
                      const product = getProduct(item.productId);
                      const finish = getFinish(item.productId, item.finishId);
                      const logo = getLogo(item.logoId);

                      return (
                        <article className="cart-page-line" key={item.id}>
                          <img
                            className="cart-line-photo"
                            src={product.photos[0].src}
                            alt={product.photos[0].alt[language]}
                          />
                          <div>
                            <p className="section-kicker">
                              {product.translations[language].category}
                            </p>
                            <h3>{product.translations[language].name}</h3>
                            <span>
                              {item.customText} / {logo.label[language]} /{" "}
                              {finish.label[language]}
                            </span>
                          </div>
                          <strong>
                            {item.quantity} x {formatPrice(item.price, language)}
                          </strong>
                          <button
                            className="remove-button"
                            type="button"
                            onClick={() => removeCartItem(item.id)}
                          >
                            {flow.removeItem}
                          </button>
                        </article>
                      );
                    })
                  )}
                </div>

                <aside className="checkout-panel" aria-labelledby="checkout-title">
                  <p className="section-kicker">{flow.checkoutTitle}</p>
                  <h2 id="checkout-title">{t.subtotal}</h2>
                  <strong className="checkout-total">{formatPrice(cartTotal, language)}</strong>
                  <p>{flow.checkoutNote}</p>
                  <button
                    className="primary-button"
                    type="button"
                    disabled={cartItems.length === 0}
                    onClick={() => setCheckoutMessage(true)}
                  >
                    {flow.checkoutCta}
                  </button>
                  {checkoutMessage && <p className="checkout-message">{flow.checkoutMessage}</p>}
                </aside>
              </div>
            </section>

            <section className="products-section" aria-labelledby="cart-more-title">
              <div className="section-heading">
                <p className="section-kicker">{t.assortmentKicker}</p>
                <h2 id="cart-more-title">{flow.otherProducts}</h2>
              </div>
              <div className="product-card-grid">
                {products.map((product) => renderProductCard(product, selectedProduct.id === product.id))}
              </div>
            </section>
          </>
        )}

        {currentView === "terms" && (
          <>
            <div className="page-toolbar">
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  navigateHome();
                }}
              >
                {flow.backHome}
              </a>
              <button type="button" onClick={() => navigateCart()}>
                {flow.goToCart}
              </button>
            </div>

            <section className="terms-section terms-page" id="agb" aria-labelledby="agb-title">
              <div className="section-heading cart-page-heading">
                <div>
                  <p className="section-kicker">{t.termsKicker}</p>
                  <h1 id="agb-title">{t.termsTitle}</h1>
                </div>
                <p>{t.termsNote}</p>
              </div>
              <div className="terms-grid">
                {t.terms.map(([title, body]) => (
                  <article key={title}>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {showCartChoice && (
        <div className="cart-choice" role="dialog" aria-modal="true" aria-labelledby="cart-choice-title">
          <div className="cart-choice-panel">
            <p className="section-kicker">{t.cartTitle}</p>
            <h2 id="cart-choice-title">{flow.addedTitle}</h2>
            <p>{flow.addedBody}</p>
            <div className="dialog-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setShowCartChoice(false)}
              >
                {flow.continueShopping}
              </button>
              <button className="primary-button" type="button" onClick={() => navigateCart()}>
                {flow.goToCart}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="shop-footer" id="kontakt">
        <nav className="footer-links" aria-label={t.nav.assortment}>
          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              navigateHome();
            }}
          >
            {home.navLabel}
          </a>
          <a
            href="/produkty"
            onClick={(event) => {
              event.preventDefault();
              navigateProducts();
            }}
          >
            {t.nav.assortment}
          </a>
          <a
            href="/kosik"
            onClick={(event) => {
              event.preventDefault();
              navigateCart();
            }}
          >
            {t.cartTitle}
          </a>
          <a
            href="/agb"
            onClick={(event) => {
              event.preventDefault();
              navigateTerms();
            }}
          >
            {t.nav.terms}
          </a>
          <a href="mailto:hallo@example.de">hallo@example.de</a>
        </nav>
      </footer>
    </div>
  );
}
