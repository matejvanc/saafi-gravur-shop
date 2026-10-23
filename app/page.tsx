"use client";

import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { accountCopy } from "./account-copy";
import { loadAccountAuthClient } from "./account-auth";
import { detailedLegalCopy } from "./legal-copy";

const TEXT_LIMIT = 12;
const GIFT_WRAP_PRICE = 1;
const BRAND_NAME = "Saafi Gravur";
const CART_STORAGE_KEY = "saafi-gravur-cart";
const LEGACY_CART_STORAGE_KEY = "feine-gravur-cart";
const LANGUAGE_STORAGE_KEY = "saafi-gravur-language";

type LanguageCode = "de" | "en" | "cs" | "fr" | "it";

const languages: Array<{ code: LanguageCode; label: string; name: string }> = [
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "en", label: "EN", name: "English" },
  { code: "cs", label: "CS", name: "Čeština" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "it", label: "IT", name: "Italiano" },
];

const ui = {
  de: {
    pageTitle: `${BRAND_NAME} | Personalisierte Geschenke`,
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
    taxNote: "Preis in CHF · Versand kommt hinzu",
    contactPending: "Kontaktangaben werden ergänzt",
    customTextLabel: "Name oder kurzer Text",
    baubleMaterialRequired: "Bitte wähle ein Material aus.",
    cartMaterialMissing: "Material fehlt – bitte Artikel entfernen und mit Materialwahl erneut hinzufügen.",
    customTextPlaceholder: "z. B. Emilia",
    logoLabel: "Logo-Motiv",
    giftWrapLabel: "Geschenkverpackung",
    giftWrapPriceNote: `+ ${formatPrice(GIFT_WRAP_PRICE)} pro Stück`,
    giftWrapCartLabel: "Geschenkverpackung",
    backEngravingLabel: "Rückseiten-Gravur",
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
    compactCartEmpty: "Warenkorb leer",
    enlargePhoto: "Foto vergrößern",
    closePhoto: "Foto schließen",
    previousPhoto: "Vorheriges Foto",
    nextPhoto: "Nächstes Foto",
    selectProduct: "Auswählen",
    service: [
      ["Mit Namen graviert", "Persönliche Details machen jedes Geschenk einzigartig."],
      ["Mit Liebe gestaltet", "Wähle Motiv, Farbe und Ausführung passend zum Anlass."],
      ["Geschenke aus Holz & Glas", "Weihnachtskugeln, Lesezeichen, Anhänger und mehr."],
    ],
    assortmentKicker: "Sortiment",
    assortmentTitle: "Personalisierbare Produkte",
    detailsKicker: "Produktdetails",
    detailsTitle: "Kleine Geschenke, große Freude",
    detailCards: [
      [
        "Für den Weihnachtsbaum",
        "Gestalte deine Weihnachtskugel mit Namen, Wunschmotiv und einer Farbe, die zu deiner Festtagsdekoration passt.",
      ],
      [
        "Für Leseratten",
        "Ein graviertes Holzlesezeichen mit farbigem Quastenband begleitet Lieblingsbücher und eignet sich als persönliche Aufmerksamkeit.",
      ],
      [
        "Für jeden Tag",
        "Holzanhänger, Flaschenöffner und Kugelschreiber erhalten mit einer individuellen Gravur eine persönliche Note.",
      ],
    ],
    termsKicker: "AGB",
    termsTitle: "Allgemeine Geschäftsbedingungen",
    terms: [
      [
        "1. Geltungsbereich",
        `Diese Allgemeinen Geschäftsbedingungen regeln den Verkauf von personalisierten Gravurprodukten über den Online-Shop ${BRAND_NAME}. Sie gelten für alle Bestellungen und ergänzen die gesetzlichen Vorschriften. Abweichende Vereinbarungen sind nur wirksam, wenn sie schriftlich bestätigt wurden.`,
      ],
      [
        "2. Bestellung und Vertragsschluss",
        "Der Kunde wählt Produkt, Menge, Personalisierung und Lieferadresse aus. Mit dem Absenden der Bestellung kommt ein verbindlicher Kaufvertrag zustande. Vor dem Abschluss können Angaben überprüft und korrigiert werden.",
      ],
      [
        "3. Personalisierte Waren",
        "Gravierte Produkte werden nach den vom Kunden angegebenen Texten und Motiven gefertigt. Übermittelte Texte sind verbindlich. Schreibfehler, falsche Angaben oder Änderungen nach Produktionsbeginn können zusätzliche Kosten oder Lieferverzögerungen verursachen.",
      ],
      [
        "4. Preise, Versand und Zahlung",
        "Preise, Steuerstatus, Versandkosten und Zahlungsmethoden müssen vor dem Start vom Betreiber bestätigt und im Checkout vollständig angezeigt werden.",
      ],
      [
        "5. Lieferzeiten",
        "Die Lieferzeit richtet sich nach Produkt, Auftragslage und Personalisierungsaufwand. Für Verzögerungen, die durch unklare oder unvollständige Kundendaten entstehen, übernimmt der Shop keine Haftung.",
      ],
      [
        "6. Gewährleistung und Reklamation",
        "Es gelten die gesetzlichen Gewährleistungsrechte. Mängel oder Transportschäden sind unverzüglich, idealerweise mit Foto, zu melden. Bei Produktionsfehlern wird nach Absprache eine Rückgabe, Nacharbeit oder Ersatzlösung vereinbart.",
      ],
    ],
    dataConsentLabel:
      "Ich stimme der Verarbeitung meiner Angaben zur Bearbeitung der Bestellung zu.",
    termsConsentLabel: "Ich akzeptiere die Allgemeinen Geschäftsbedingungen.",
    cookiesConsentLabel: "Ich habe die Cookie-Hinweise gelesen.",
    consentWarning:
      "Bitte bestätige Datenschutz, AGB und Cookie-Hinweise, bevor du die Bestellung vorbereitest.",
    privacyKicker: "Datenschutz",
    privacyTitle: "Zustimmung zur Datenverarbeitung",
    privacyCards: [
      [
        "Bestelldaten",
        "Name, Kontaktangaben, Produktwahl und Gravurtexte werden ausschließlich zur Bearbeitung der Anfrage und Bestellung verwendet.",
      ],
      [
        "Personalisierte Gravur",
        "Übermittelte Texte werden für die Fertigung gespeichert und nur so lange aufbewahrt, wie es für Bestellung, Nachfragen und gesetzliche Pflichten nötig ist.",
      ],
      [
        "Kontakt",
        "Bei Fragen zur Speicherung oder Löschung personenbezogener Daten kann der Shop direkt kontaktiert werden.",
      ],
    ],
    cookiesKicker: "Cookies",
    cookiesTitle: "Cookie-Hinweise",
    cookiesCards: [
      [
        "Notwendige Cookies",
        "Der Warenkorb nutzt lokale Speicherung im Browser, damit die Produktauswahl während des Besuchs erhalten bleibt.",
      ],
      [
        "Analyse",
        "Analyse- oder Marketing-Cookies sind im Prototyp nicht aktiv. Falls sie später genutzt werden, muss eine separate Auswahl ergänzt werden.",
      ],
      [
        "Kontrolle",
        "Browserdaten und lokale Shopdaten können jederzeit über die Browsereinstellungen gelöscht werden.",
      ],
    ],
  },
  en: {
    pageTitle: `${BRAND_NAME} | Personalised Gifts`,
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
    taxNote: "Price in CHF · shipping added separately",
    contactPending: "Contact details to be added",
    customTextLabel: "Name or short text",
    baubleMaterialRequired: "Please choose a material.",
    cartMaterialMissing: "Material missing — remove this item and add it again after choosing a material.",
    customTextPlaceholder: "e.g. Emilia",
    logoLabel: "Logo design",
    giftWrapLabel: "Gift wrapping",
    giftWrapPriceNote: `+ ${formatPrice(GIFT_WRAP_PRICE)} per piece`,
    giftWrapCartLabel: "Gift wrapping",
    backEngravingLabel: "Back engraving",
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
    compactCartEmpty: "Cart is empty",
    enlargePhoto: "Enlarge photo",
    closePhoto: "Close photo",
    previousPhoto: "Previous photo",
    nextPhoto: "Next photo",
    selectProduct: "Select",
    service: [
      ["Made personal", "Add a name or short message to make a gift your own."],
      ["Thoughtful details", "Choose a design, colour and style to suit the occasion."],
      ["Wood and glass gifts", "Christmas baubles, bookmarks, keychains and more."],
    ],
    assortmentKicker: "Products",
    assortmentTitle: "Personalised products",
    detailsKicker: "Product details",
    detailsTitle: "Small gifts, lasting memories",
    detailCards: [
      [
        "For the Christmas tree",
        "Personalise a Christmas bauble with a name and motif, then choose a colour and finish for your festive decorations.",
      ],
      [
        "For book lovers",
        "A birch plywood bookmark with a colourful tassel makes a thoughtful gift for readers and a keepsake for favourite books.",
      ],
      [
        "Made for everyday use",
        "Engraved wooden keychains, bottle openers and ballpoint pens bring a personal touch to useful everyday gifts.",
      ],
    ],
    termsKicker: "Terms",
    termsTitle: "General Terms and Conditions",
    terms: [
      [
        "1. Scope",
        `These General Terms apply to all sales of personalised engraved products via the ${BRAND_NAME} online shop. They apply alongside mandatory statutory provisions and only differ by written agreement.`,
      ],
      [
        "2. Order and contract formation",
        "The customer selects the product, quantity, personalisation and delivery details. Once the order is submitted, a binding purchase contract is formed. Details can still be checked and corrected before final submission.",
      ],
      [
        "3. Personalised goods",
        "Each engraved item is produced according to the customer's submitted text and motif selections. Submitted details are binding. Wrong spelling, incomplete information or changes after production starts may lead to additional costs or delays.",
      ],
      [
        "4. Prices, shipping and payment",
        "The seller must confirm the tax status, shipping charges and payment methods before launch and display the complete payable price before an order is placed.",
      ],
      [
        "5. Delivery times",
        "Delivery times depend on the product, production load and complexity of the personalisation. Delays caused by unclear or incomplete customer information are not considered a defect of the shop.",
      ],
      [
        "6. Warranty and complaint handling",
        "Statutory warranty rights apply. Transport damage or production defects must be reported promptly, ideally with photos. In such cases, a return, remake or replacement solution will be agreed upon.",
      ],
    ],
    dataConsentLabel:
      "I agree that my details may be processed to handle the order.",
    termsConsentLabel: "I accept the general terms and conditions.",
    cookiesConsentLabel: "I have read the cookie notice.",
    consentWarning:
      "Please confirm data processing, terms and cookie notice before preparing the order.",
    privacyKicker: "Privacy",
    privacyTitle: "Consent to Data Processing",
    privacyCards: [
      [
        "Order data",
        "Name, contact details, product choices and engraving text are used only to process the request and order.",
      ],
      [
        "Personalised engraving",
        "Submitted text is stored for production and kept only as long as needed for the order, questions and legal duties.",
      ],
      [
        "Contact",
        "For questions about storing or deleting personal data, customers can contact the shop directly.",
      ],
    ],
    cookiesKicker: "Cookies",
    cookiesTitle: "Cookie Notice",
    cookiesCards: [
      [
        "Necessary cookies",
        "The cart uses local browser storage so the product selection remains available during the visit.",
      ],
      [
        "Analytics",
        "Analytics or marketing cookies are not active in this prototype. If they are added later, a separate choice should be included.",
      ],
      [
        "Control",
        "Browser data and local shop data can be deleted at any time through browser settings.",
      ],
    ],
  },
  cs: {
    pageTitle: `${BRAND_NAME} | Personalizované dárky`,
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
    taxNote: "Cena v CHF · doprava se připočítá",
    contactPending: "Kontaktní údaje budou doplněny",
    customTextLabel: "Jméno nebo krátký text",
    baubleMaterialRequired: "Vyberte prosím materiál.",
    cartMaterialMissing: "Chybí materiál – položku odeberte a přidejte znovu s vybraným materiálem.",
    customTextPlaceholder: "např. Emilia",
    logoLabel: "Logo motiv",
    giftWrapLabel: "Dárkové balení",
    giftWrapPriceNote: `+ ${formatPrice(GIFT_WRAP_PRICE)} za kus`,
    giftWrapCartLabel: "Dárkové balení",
    backEngravingLabel: "Gravírování zadní strany",
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
    compactCartEmpty: "Košík je prázdný",
    enlargePhoto: "Zvětšit fotku",
    closePhoto: "Zavřít fotku",
    previousPhoto: "Předchozí fotka",
    nextPhoto: "Další fotka",
    selectProduct: "Vybrat",
    service: [
      ["Dárek se jménem", "Jméno nebo krátké věnování promění dárek v osobní vzpomínku."],
      ["Promyšlené detaily", "Vyberte motiv, barvu a provedení podle příležitosti."],
      ["Dřevo i sklo", "Vánoční koule, záložky, přívěšky a další dárky."],
    ],
    assortmentKicker: "Produkty",
    assortmentTitle: "Personalizovatelné produkty",
    detailsKicker: "Produktové detaily",
    detailsTitle: "Malé dárky s osobním příběhem",
    detailCards: [
      [
        "Na vánoční stromeček",
        "Vánoční kouli ozdobte jménem či motivem a zvolte barvu i povrch, které ladí s vaší sváteční výzdobou.",
      ],
      [
        "Pro milovníky knih",
        "Dřevěná záložka z březové překližky s barevným střapcem potěší čtenáře a označí stránku v oblíbené knize.",
      ],
      [
        "Pro každý den",
        "Dřevěný přívěšek, otvírák nebo propiska s gravírováním promění praktickou věc v osobní dárek.",
      ],
    ],
    termsKicker: "Podmínky",
    termsTitle: "Obecné obchodní podmínky",
    terms: [
      [
        "1. Rozsah platnosti",
        `Tyto všeobecné obchodní podmínky upravují prodej personalizovaných gravírovaných výrobků prostřednictvím online obchodu ${BRAND_NAME}. Platí vedle povinných zákonných ustanovení a mohou být odlišně upraveny pouze písemnou dohodou.`,
      ],
      [
        "2. Objednávka a uzavření smlouvy",
        "Zákazník vybere produkt, množství, personalizaci a údaje pro doručení. Po odeslání objednávky vzniká závazná kupní smlouva. Údaje je možné ještě před dokončením objednávky zkontrolovat a upravit.",
      ],
      [
        "3. Personalizované zboží",
        "Gravírované výrobky se vyrábějí podle textů a motivů, které zákazník zadá. Odeslané údaje jsou závazné. Chybný překlep, neúplné informace nebo změna po zahájení výroby mohou vést k dodatečným nákladům nebo prodloužení dodací lhůty.",
      ],
      [
        "4. Ceny, doprava a platba",
        "Daňový režim, cena dopravy a platební metody musí prodávající před spuštěním ověřit a úplnou cenu zobrazit před odesláním objednávky.",
      ],
      [
        "5. Dodací lhůty",
        "Dodací lhůty závisí na výrobku, vytížení výroby a složitosti personalizace. Zpoždění vzniklá z důvodu nejasných nebo neúplných údajů zákazníka nejsou považována za vadu obchodu.",
      ],
      [
        "6. Záruka a reklamace",
        "Platí zákonná práva z vadného plnění. Poškození při dopravě nebo výrobní vady je nutné nahlásit neprodleně, ideálně s fotografiemi. V takových případech se dohodne vrácení, oprava, dodělání nebo náhrada.",
      ],
    ],
    dataConsentLabel:
      "Souhlasím se zpracováním údajů pro vyřízení objednávky.",
    termsConsentLabel: "Souhlasím s obchodními podmínkami.",
    cookiesConsentLabel: "Beru na vědomí používání cookies.",
    consentWarning:
      "Před přípravou objednávky potvrď souhlas se zpracováním údajů, podmínky a cookies.",
    privacyKicker: "Ochrana údajů",
    privacyTitle: "Souhlas se zpracováním údajů",
    privacyCards: [
      [
        "Objednávkové údaje",
        "Jméno, kontaktní údaje, výběr produktu a texty pro gravírování se používají pouze pro vyřízení poptávky a objednávky.",
      ],
      [
        "Personalizované gravírování",
        "Odeslané texty se ukládají pro výrobu a jen po dobu potřebnou pro objednávku, dotazy a zákonné povinnosti.",
      ],
      [
        "Kontakt",
        "S dotazy ke zpracování nebo smazání osobních údajů lze obchod kontaktovat přímo.",
      ],
    ],
    cookiesKicker: "Cookies",
    cookiesTitle: "Informace o cookies",
    cookiesCards: [
      [
        "Nezbytné cookies",
        "Košík používá lokální uložení v prohlížeči, aby výběr produktů zůstal během návštěvy zachovaný.",
      ],
      [
        "Analytika",
        "Analytické ani marketingové cookies nejsou v prototypu aktivní. Pokud se později doplní, bude potřeba samostatná volba.",
      ],
      [
        "Kontrola",
        "Data prohlížeče i lokální data obchodu lze kdykoliv smazat v nastavení prohlížeče.",
      ],
    ],
  },
  fr: {
    pageTitle: `${BRAND_NAME} | Cadeaux personnalisés`,
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
    taxNote: "Prix en CHF · livraison en sus",
    contactPending: "Coordonnées à compléter",
    customTextLabel: "Nom ou texte court",
    baubleMaterialRequired: "Veuillez choisir un matériau.",
    cartMaterialMissing: "Matériau manquant — supprimez cet article et ajoutez-le à nouveau après avoir choisi un matériau.",
    customTextPlaceholder: "p. ex. Emilia",
    logoLabel: "Motif logo",
    giftWrapLabel: "Emballage cadeau",
    giftWrapPriceNote: `+ ${formatPrice(GIFT_WRAP_PRICE)} par pièce`,
    giftWrapCartLabel: "Emballage cadeau",
    backEngravingLabel: "Gravure verso",
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
    compactCartEmpty: "Le panier est vide",
    enlargePhoto: "Agrandir la photo",
    closePhoto: "Fermer la photo",
    previousPhoto: "Photo précédente",
    nextPhoto: "Photo suivante",
    selectProduct: "Choisir",
    service: [
      ["Un cadeau à votre image", "Ajoutez un prénom ou un petit mot pour le rendre unique."],
      ["Des détails choisis", "Sélectionnez un motif, une couleur et une finition adaptés à l'occasion."],
      ["Bois et verre", "Boules de Noël, marque-pages, porte-clés et cadeaux utiles."],
    ],
    assortmentKicker: "Produits",
    assortmentTitle: "Produits personnalisables",
    detailsKicker: "Détails produit",
    detailsTitle: "De petites attentions qui restent",
    detailCards: [
      [
        "Pour le sapin",
        "Personnalisez votre boule de Noël avec un prénom ou un motif, puis choisissez sa couleur et sa finition.",
      ],
      [
        "Pour les lecteurs",
        "Un marque-page en contreplaqué de bouleau avec pompon coloré accompagne les romans préférés et les nouvelles découvertes.",
      ],
      [
        "Pour tous les jours",
        "Porte-clés, décapsuleurs et stylos en bois gravés deviennent des petits cadeaux vraiment personnels.",
      ],
    ],
    termsKicker: "CGV",
    termsTitle: "Conditions générales de vente",
    terms: [
      [
        "1. Champ d'application",
        `Ces conditions générales s'appliquent à toutes les ventes de produits gravés personnalisés via la boutique en ligne ${BRAND_NAME}. Elles s'appliquent en plus des règles légales obligatoires et ne peuvent être modifiées que par accord écrit.`,
      ],
      [
        "2. Commande et conclusion du contrat",
        "Le client choisit le produit, la quantité, la personnalisation et les données de livraison. Une fois la commande envoyée, un contrat d'achat est conclu. Les informations peuvent encore être vérifiées et modifiées avant l'envoi final.",
      ],
      [
        "3. Produits personnalisés",
        "Les articles gravés sont fabriqués selon les textes et motifs transmis par le client. Les indications fournies sont définitives. Une erreur orthographique, des informations incomplètes ou une modification après le début de la production peuvent entraîner des coûts supplémentaires ou des retards.",
      ],
      [
        "4. Prix, livraison et paiement",
        "Tous les prix incluent la TVA applicable, sauf indication contraire. Les frais de livraison sont affichés de manière transparente au moment du paiement. Les paiements sont effectués selon les moyens de paiement disponibles dans le shop.",
      ],
      [
        "5. Délais de livraison",
        "Les délais de livraison dépendent du produit, de la charge de production et de la complexité de la personnalisation. Les retards causés par des données client incomplètes ou imprécises ne sont pas considérés comme un défaut du shop.",
      ],
      [
        "6. Garantie et réclamations",
        "Les droits légaux à la garantie s'appliquent. Les dommages de transport ou défauts de fabrication doivent être signalés rapidement, idéalement avec photos. Un échange, une reprise ou une solution de remplacement sera alors convenu.",
      ],
    ],
    dataConsentLabel:
      "J'accepte le traitement de mes données pour la gestion de la commande.",
    termsConsentLabel: "J'accepte les conditions générales de vente.",
    cookiesConsentLabel: "J'ai lu les informations sur les cookies.",
    consentWarning:
      "Veuillez confirmer le traitement des données, les conditions et les cookies avant de préparer la commande.",
    privacyKicker: "Confidentialité",
    privacyTitle: "Consentement au traitement des données",
    privacyCards: [
      [
        "Données de commande",
        "Le nom, les coordonnées, le choix du produit et les textes de gravure sont utilisés uniquement pour traiter la demande et la commande.",
      ],
      [
        "Gravure personnalisée",
        "Les textes transmis sont conservés pour la fabrication uniquement le temps nécessaire à la commande, aux questions et aux obligations légales.",
      ],
      [
        "Contact",
        "Pour toute question sur l'enregistrement ou la suppression des données personnelles, la boutique peut être contactée directement.",
      ],
    ],
    cookiesKicker: "Cookies",
    cookiesTitle: "Informations sur les cookies",
    cookiesCards: [
      [
        "Cookies nécessaires",
        "Le panier utilise le stockage local du navigateur afin de conserver la sélection pendant la visite.",
      ],
      [
        "Analyse",
        "Les cookies d'analyse ou de marketing ne sont pas actifs dans ce prototype. S'ils sont ajoutés plus tard, un choix séparé devra être prévu.",
      ],
      [
        "Contrôle",
        "Les données du navigateur et les données locales de la boutique peuvent être supprimées à tout moment dans les paramètres du navigateur.",
      ],
    ],
  },
  it: {
    pageTitle: `${BRAND_NAME} | Regali personalizzati`,
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
    taxNote: "Prezzo in CHF · spedizione a parte",
    contactPending: "Dati di contatto da completare",
    customTextLabel: "Nome o testo breve",
    baubleMaterialRequired: "Seleziona un materiale.",
    cartMaterialMissing: "Materiale mancante: rimuovi l’articolo e aggiungilo di nuovo dopo aver scelto il materiale.",
    customTextPlaceholder: "es. Emilia",
    logoLabel: "Motivo logo",
    giftWrapLabel: "Confezione regalo",
    giftWrapPriceNote: `+ ${formatPrice(GIFT_WRAP_PRICE)} al pezzo`,
    giftWrapCartLabel: "Confezione regalo",
    backEngravingLabel: "Incisione retro",
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
    compactCartEmpty: "Il carrello è vuoto",
    enlargePhoto: "Ingrandisci foto",
    closePhoto: "Chiudi foto",
    previousPhoto: "Foto precedente",
    nextPhoto: "Foto successiva",
    selectProduct: "Scegli",
    service: [
      ["Un regalo personale", "Aggiungi un nome o un breve messaggio per renderlo unico."],
      ["Dettagli scelti da te", "Scegli motivo, colore e finitura per l'occasione."],
      ["Legno e vetro", "Palline di Natale, segnalibri, portachiavi e regali utili."],
    ],
    assortmentKicker: "Prodotti",
    assortmentTitle: "Prodotti personalizzabili",
    detailsKicker: "Dettagli prodotto",
    detailsTitle: "Piccoli regali, ricordi speciali",
    detailCards: [
      [
        "Per l'albero di Natale",
        "Personalizza la pallina natalizia con un nome o un motivo e scegli colore e finitura per le tue decorazioni.",
      ],
      [
        "Per chi ama leggere",
        "Un segnalibro in compensato di betulla con nappina colorata è un pensiero personale per ogni lettore.",
      ],
      [
        "Per ogni giorno",
        "Portachiavi, apribottiglie e penne in legno incisi aggiungono un tocco personale a oggetti pratici.",
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
        "Il venditore deve verificare il regime fiscale, le spese di spedizione e i metodi di pagamento e mostrare il prezzo completo prima dell’ordine.",
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
    dataConsentLabel:
      "Acconsento al trattamento dei miei dati per la gestione dell'ordine.",
    termsConsentLabel: "Accetto le condizioni generali di vendita.",
    cookiesConsentLabel: "Ho letto le informazioni sui cookie.",
    consentWarning:
      "Conferma trattamento dati, condizioni e cookie prima di preparare l'ordine.",
    privacyKicker: "Privacy",
    privacyTitle: "Consenso al trattamento dei dati",
    privacyCards: [
      [
        "Dati ordine",
        "Nome, contatti, scelta del prodotto e testi di incisione sono usati solo per gestire richiesta e ordine.",
      ],
      [
        "Incisione personalizzata",
        "I testi inviati sono salvati per la produzione e conservati solo per il tempo necessario a ordine, domande e obblighi legali.",
      ],
      [
        "Contatto",
        "Per domande su conservazione o cancellazione dei dati personali è possibile contattare direttamente il negozio.",
      ],
    ],
    cookiesKicker: "Cookie",
    cookiesTitle: "Informazioni sui cookie",
    cookiesCards: [
      [
        "Cookie necessari",
        "Il carrello usa l'archiviazione locale del browser per mantenere la selezione durante la visita.",
      ],
      [
        "Analisi",
        "Cookie analitici o marketing non sono attivi nel prototipo. Se aggiunti in seguito, servirà una scelta separata.",
      ],
      [
        "Controllo",
        "I dati del browser e i dati locali del negozio possono essere eliminati in qualsiasi momento dalle impostazioni del browser.",
      ],
    ],
  },
};

const homeCopy = {
  de: {
    navLabel: "Start",
    eyebrow: "Geschenke mit Gravur",
    title: BRAND_NAME,
    lead:
      "Persönliche Weihnachtskugeln und liebevoll gravierte Geschenke aus Holz – gestaltet für festliche Momente und kleine Freuden im Alltag.",
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
      "Personalised Christmas baubles and thoughtfully engraved wooden gifts, made to bring a little warmth to the festive season and beyond.",
    primaryCta: "Start configuring",
    secondaryCta: "View products",
    highlights: ["Custom text", "Choose a design", "Packed with care"],
    galleryLabel: "Product glimpses",
  },
  cs: {
    navLabel: "Úvod",
    eyebrow: "Dárky s gravírováním",
    title: BRAND_NAME,
    lead:
      "Vánoční koule s vlastním motivem i pečlivě gravírované dřevěné dárky pro sváteční chvíle a každodenní radost.",
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
      "Boules de Noël personnalisées et cadeaux en bois gravés avec soin, pour les fêtes comme pour les petits plaisirs du quotidien.",
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
      "Palline di Natale personalizzate e regali in legno incisi con cura, per le feste e per i piccoli momenti di ogni giorno.",
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
    checkoutCta: "Zur Kassen-Vorschau",
    checkoutNote:
      "Dies ist nur eine Vorschau. Der Shop übermittelt noch keine Bestellungen und löst keine Zahlung aus.",
    legalAcknowledgement: "Ich akzeptiere die",
    termsLinkLabel: "Allgemeinen Geschäftsbedingungen",
    privacyPrefix: "und bestätige, dass ich die",
    privacyLinkLabel: "Datenschutzhinweise",
    privacyAcknowledgement: "gelesen habe.",
    cookiesLinkLabel: "Informationen zu Cookies",
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
    checkoutCta: "Open checkout preview",
    checkoutNote:
      "This is a preview only. The shop does not submit orders or process payments yet.",
    legalAcknowledgement: "I accept the",
    termsLinkLabel: "Terms and conditions",
    privacyPrefix: "and confirm that I have read the",
    privacyLinkLabel: "Privacy notice",
    privacyAcknowledgement: ".",
    cookiesLinkLabel: "Cookie information",
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
    checkoutCta: "Otevřít náhled pokladny",
    checkoutNote:
      "Jde pouze o náhled. Obchod zatím nepřijímá objednávky ani nezpracovává platby.",
    legalAcknowledgement: "Souhlasím s",
    termsLinkLabel: "obchodními podmínkami",
    privacyPrefix: "a potvrzuji, že jsem se seznámil/a s",
    privacyLinkLabel: "informacemi o ochraně osobních údajů",
    privacyAcknowledgement: ".",
    cookiesLinkLabel: "Informace o cookies",
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
    checkoutCta: "Voir l’aperçu du paiement",
    checkoutNote:
      "Le paiement est préparé. Les moyens de paiement, la livraison et les mentions légales seront ajoutés plus tard.",
    legalAcknowledgement: "J’accepte les",
    termsLinkLabel: "conditions générales",
    privacyPrefix: "et confirme avoir lu les",
    privacyLinkLabel: "informations sur la confidentialité",
    privacyAcknowledgement: ".",
    cookiesLinkLabel: "Informations sur les cookies",
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
    checkoutCta: "Apri anteprima checkout",
    checkoutNote:
      "Questa è solo un’anteprima. Il negozio non invia ancora ordini né elabora pagamenti.",
    legalAcknowledgement: "Accetto le",
    termsLinkLabel: "condizioni generali",
    privacyPrefix: "e confermo di aver letto l’",
    privacyLinkLabel: "informativa sulla privacy",
    privacyAcknowledgement: ".",
    cookiesLinkLabel: "Informazioni sui cookie",
    checkoutMessage:
      "Grazie. Il prossimo passo sarà il vero flusso di ordine e pagamento.",
  },
};

const checkoutCopy = {
  de: {
    kicker: "Kasse", title: "Lieferung und Zahlung", lead: "Wohin dürfen wir deine persönliche Gravur liefern?",
    contact: "Kontaktdaten", delivery: "Lieferadresse", firstName: "Vorname", lastName: "Nachname",
    email: "E-Mail-Adresse", phone: "Telefon", street: "Strasse und Hausnummer", postalCode: "PLZ", city: "Ort",
    country: "Land", switzerland: "Schweiz", payment: "Zahlungsart auswählen", twint: "TWINT",
    card: "Kredit- oder Debitkarte", bank: "Vorauszahlung per Banküberweisung",
    paymentNotice: "Die Zahlungsart wird vorgemerkt. Eine Zahlungsabwicklung ist noch nicht angeschlossen.",
    orderSummary: "Bestellübersicht", subtotal: "Zwischensumme", shipping: "Versand",
    shippingLater: "Der Versandtarif ist noch nicht konfiguriert; daher wird keine Endsumme berechnet", total: "Zwischentotal ohne Versand", save: "Lieferdaten speichern", notActive: "Noch nicht verfügbar: Es werden keine Bestellungen übermittelt und keine Zahlungen ausgelöst.",
    saved: "Die Angaben sind im Formular übernommen. Es wurde noch keine Bestellung übermittelt und keine Zahlung ausgelöst.",
    note: "Bestellnotiz", optional: "optional",
    shippingMethod: "Versandart", economy: "Swiss Post PostPac Economy", economyDescription: "Lieferzeit ab Versand; konkrete Laufzeit vor Bestellung zu bestätigen.",
    priority: "Swiss Post PostPac Priority", priorityDescription: "Priorisierte Zustellung ab Versand; konkrete Laufzeit vor Bestellung zu bestätigen.",
    pickup: "Swiss Post PickPost / My Post 24", pickupDescription: "Abholung an einer PickPost-Stelle oder einem My Post 24 Automaten.",
    pickupLocation: "Gewünschte Abholstelle oder My Post 24 Standort", pickupPlaceholder: "Ort, Postleitzahl oder Name eingeben",
    shippingUnselected: "Bitte Versandart auswählen", pickupSearching: "Suche nach Swiss Post Standorten …",
    pickupNoResults: "Keine passenden Abholstellen gefunden.", pickupSearchError: "Standortsuche ist gerade nicht verfügbar.",
    pickupSelectResult: "Bitte wähle einen Standort aus den Suchergebnissen aus.", locationSource: "Standortdaten von Swiss Post",
    bestMatch: "Beste Übereinstimmung",
    back: "Zurück zum Warenkorb",
  },
  en: {
    kicker: "Checkout", title: "Delivery and payment", lead: "Where should we deliver your personalised engraving?",
    contact: "Contact details", delivery: "Delivery address", firstName: "First name", lastName: "Last name",
    email: "Email address", phone: "Phone", street: "Street and house number", postalCode: "Postcode", city: "City",
    country: "Country", switzerland: "Switzerland", payment: "Choose a payment method", twint: "TWINT",
    card: "Credit or debit card", bank: "Bank transfer in advance",
    paymentNotice: "Your choice will be noted. Payment processing is not connected yet.", orderSummary: "Order summary",
    subtotal: "Subtotal", shipping: "Shipping", shippingLater: "Shipping rates are not configured; no final total is available", total: "Subtotal excluding shipping",
    save: "Save delivery details", notActive: "Not available yet: no order is submitted and no payment is processed.", saved: "Your details are in the form. No order was submitted and no payment was made.",
    note: "Order note", optional: "optional",
    shippingMethod: "Delivery method", economy: "Swiss Post PostPac Economy", economyDescription: "Transit time starts after dispatch; confirm the current estimate before ordering.",
    priority: "Swiss Post PostPac Priority", priorityDescription: "Priority transit starts after dispatch; confirm the current estimate before ordering.",
    pickup: "Swiss Post PickPost / My Post 24", pickupDescription: "Collect from a PickPost location or My Post 24 parcel locker.",
    pickupLocation: "Preferred PickPost or My Post 24 location", pickupPlaceholder: "Enter a town, postcode or location name",
    shippingUnselected: "Choose a delivery method", pickupSearching: "Searching Swiss Post locations…",
    pickupNoResults: "No matching collection points found.", pickupSearchError: "Location search is temporarily unavailable.",
    pickupSelectResult: "Please select a location from the search results.", locationSource: "Location data from Swiss Post",
    bestMatch: "Best match",
    back: "Back to cart",
  },
  cs: {
    kicker: "Pokladna", title: "Doručení a platba", lead: "Kam máme doručit tvůj personalizovaný výrobek?",
    contact: "Kontaktní údaje", delivery: "Doručovací adresa", firstName: "Jméno", lastName: "Příjmení",
    email: "E-mailová adresa", phone: "Telefon", street: "Ulice a číslo domu", postalCode: "PSČ", city: "Město",
    country: "Země", switzerland: "Švýcarsko", payment: "Vyber způsob platby", twint: "TWINT",
    card: "Platební nebo kreditní karta", bank: "Platba předem bankovním převodem",
    paymentNotice: "Zvolený způsob platby se pouze zaznamená. Platební brána zatím není připojená.", orderSummary: "Shrnutí objednávky",
    subtotal: "Mezisoučet", shipping: "Doprava", shippingLater: "Sazby dopravy nejsou nastavené; konečná částka není dostupná", total: "Mezisoučet bez dopravy",
    save: "Uložit doručovací údaje", notActive: "Zatím není dostupné: objednávka se neodesílá a platba se nezpracuje.", saved: "Údaje zůstaly ve formuláři. Objednávka nebyla odeslána a platba neproběhla.",
    note: "Poznámka k objednávce", optional: "nepovinné",
    shippingMethod: "Způsob dopravy", economy: "Swiss Post PostPac Economy", economyDescription: "Doba přepravy začíná po odeslání; aktuální odhad ověřte před objednávkou.",
    priority: "Swiss Post PostPac Priority", priorityDescription: "Prioritní přeprava začíná po odeslání; aktuální odhad ověřte před objednávkou.",
    pickup: "Swiss Post PickPost / My Post 24", pickupDescription: "Vyzvednutí na pobočce PickPost nebo v samoobslužném boxu My Post 24.",
    pickupLocation: "Vybraná pobočka PickPost nebo box My Post 24", pickupPlaceholder: "Zadej město, PSČ nebo název místa",
    shippingUnselected: "Vyber způsob dopravy", pickupSearching: "Hledám pobočky Swiss Post…",
    pickupNoResults: "Nenašel jsem žádné odpovídající výdejní místo.", pickupSearchError: "Vyhledávání míst je dočasně nedostupné.",
    pickupSelectResult: "Vyber prosím místo z nabídnutých výsledků.", locationSource: "Údaje o místech poskytuje Swiss Post",
    bestMatch: "Nejlepší shoda",
    back: "Zpět do košíku",
  },
  fr: {
    kicker: "Commande", title: "Livraison et paiement", lead: "Où livrer votre article personnalisé ?",
    contact: "Coordonnées", delivery: "Adresse de livraison", firstName: "Prénom", lastName: "Nom",
    email: "Adresse e-mail", phone: "Téléphone", street: "Rue et numéro", postalCode: "Code postal", city: "Ville",
    country: "Pays", switzerland: "Suisse", payment: "Choisir un moyen de paiement", twint: "TWINT",
    card: "Carte de crédit ou de débit", bank: "Virement bancaire à l'avance",
    paymentNotice: "Votre choix sera noté. Le traitement des paiements n'est pas encore connecté.", orderSummary: "Récapitulatif",
    subtotal: "Sous-total", shipping: "Livraison", shippingLater: "Les tarifs ne sont pas configurés ; le total final est indisponible", total: "Sous-total hors livraison",
    save: "Enregistrer l'adresse", saved: "Les informations restent dans le formulaire. Aucune commande ni aucun paiement n'a été transmis.",
    note: "Note de commande", optional: "facultatif",
    shippingMethod: "Mode de livraison", economy: "Swiss Post PostPac Economy", economyDescription: "Le délai commence après expédition ; confirmer l’estimation actuelle avant la commande.",
    priority: "Swiss Post PostPac Priority", priorityDescription: "Le délai prioritaire commence après expédition ; confirmer l’estimation actuelle avant la commande.",
    pickup: "Swiss Post PickPost / My Post 24", pickupDescription: "Retrait dans un point PickPost ou un automate My Post 24.",
    pickupLocation: "Point PickPost ou automate My Post 24 souhaité", pickupPlaceholder: "Saisissez une ville, un code postal ou un lieu",
    shippingUnselected: "Choisissez un mode de livraison", pickupSearching: "Recherche des points Swiss Post…",
    pickupNoResults: "Aucun point de retrait correspondant trouvé.", pickupSearchError: "La recherche est temporairement indisponible.",
    pickupSelectResult: "Veuillez choisir un lieu parmi les résultats.", locationSource: "Données des points fournies par Swiss Post",
    bestMatch: "Meilleure correspondance",
    back: "Retour au panier",
  },
  it: {
    kicker: "Cassa", title: "Consegna e pagamento", lead: "Dove dobbiamo consegnare il tuo prodotto personalizzato?",
    contact: "Dati di contatto", delivery: "Indirizzo di consegna", firstName: "Nome", lastName: "Cognome",
    email: "Indirizzo e-mail", phone: "Telefono", street: "Via e numero civico", postalCode: "CAP", city: "Città",
    country: "Paese", switzerland: "Svizzera", payment: "Scegli il metodo di pagamento", twint: "TWINT",
    card: "Carta di credito o debito", bank: "Bonifico bancario anticipato",
    paymentNotice: "La scelta verrà annotata. Il sistema di pagamento non è ancora collegato.", orderSummary: "Riepilogo ordine",
    subtotal: "Subtotale", shipping: "Spedizione", shippingLater: "Le tariffe non sono configurate; il totale finale non è disponibile", total: "Subtotale, spedizione esclusa",
    save: "Salva i dati di consegna", notActive: "Non ancora disponibile: l’ordine non viene inviato e il pagamento non viene elaborato.", saved: "I dati restano nel modulo. Non è stato inviato alcun ordine né effettuato alcun pagamento.",
    note: "Nota sull'ordine", optional: "facoltativo",
    shippingMethod: "Metodo di consegna", economy: "Swiss Post PostPac Economy", economyDescription: "Il tempo di transito inizia dopo la spedizione; verificare la stima attuale prima dell’ordine.",
    priority: "Swiss Post PostPac Priority", priorityDescription: "Il transito prioritario inizia dopo la spedizione; verificare la stima attuale prima dell’ordine.",
    pickup: "Swiss Post PickPost / My Post 24", pickupDescription: "Ritiro presso un punto PickPost o un armadietto My Post 24.",
    pickupLocation: "Punto PickPost o armadietto My Post 24 preferito", pickupPlaceholder: "Inserisci città, CAP o nome del punto",
    shippingUnselected: "Scegli un metodo di consegna", pickupSearching: "Ricerca dei punti Swiss Post…",
    pickupNoResults: "Nessun punto di ritiro corrispondente trovato.", pickupSearchError: "Ricerca temporaneamente non disponibile.",
    pickupSelectResult: "Seleziona una sede dai risultati della ricerca.", locationSource: "Dati delle sedi forniti da Swiss Post",
    bestMatch: "Corrispondenza migliore",
    back: "Torna al carrello",
  },
} satisfies Record<LanguageCode, Record<string, string>>;

const legalCopy = {
  de: {
    impressumTitle: "Impressum",
    incomplete: "Diese Pflichtangaben sind noch nicht vollständig. Der Shop darf nicht live Bestellungen annehmen, bevor die verantwortliche Person bzw. das Unternehmen, eine ladungsfähige Postanschrift und eine funktionierende E-Mail-Adresse ergänzt und geprüft wurden. UID nur angeben, falls vorhanden bzw. vorgeschrieben.",
    agbTitle: "Allgemeine Geschäftsbedingungen",
    agb: "Entwurf für den Schweizer Markt. Verkäuferidentität, Vertragsannahme, verbindlicher Bestellschritt, Liefergebiet, tatsächliche Versandtarife, Produktions- und Transportzeiten, Steuerstatus, Zahlungsanbieter, Reklamationskontakt und freiwillige Rückgaberegeln müssen vor Veröffentlichung bestätigt werden. Der aktuelle Shop übermittelt noch keine Bestellung und versendet keine Bestätigungs-E-Mail. Nach Schweizer Recht besteht grundsätzlich kein allgemeines Widerrufsrecht bei Onlinekäufen. Anwendbares Recht und eine etwaige freiwillige Rückgaberegelung müssen für den Verkäufer konkret bestätigt werden. Eine freiwillige Rückgabefrist wird nicht zugesagt.",
    privacyTitle: "Datenschutzerklärung",
    privacy: "Verantwortliche Person und Kontaktadresse fehlen und müssen vor Veröffentlichung ergänzt werden. Cloudflare Workers stellt die Website bereit. Der Browser speichert Warenkorb, Konfiguration und Sprache in localStorage. Eine Suche nach Abholorten wird über den Worker an Swiss Post übermittelt. Bei optionaler Anmeldung erhält Supabase Auth die eingegebene E-Mail-Adresse; die Sitzung bleibt im Browser. Checkout-Felder, Notizen, Zahlungswahl, Bestellungen und Zahlungen werden derzeit nicht an den Shop gesendet oder dort gespeichert. Nach Schweizer DSG können Betroffene Auskunft und Berichtigung verlangen sowie – soweit gesetzlich zulässig – Löschung oder Einschränkung beantragen; GDPR-Rechte gelten nur, sofern die GDPR anwendbar ist. Betreiber müssen Zwecke und Rechtsgrundlagen, Speicher-/Löschfristen, technische Protokolle, tatsächliche Auftragsbearbeiter, Länder und Transfergarantien ergänzen. Anfragen benötigen eine verifizierte Kontaktadresse.",
    cookiesTitle: "Cookies und ähnliche Technologien",
    cookies: "Im Anwendungscode sind keine Analyse- oder Marketing-Tags eingebunden. Der Shop nutzt localStorage für Sprache, Warenkorb und die optionale Authentifizierungssitzung; das sind Browserspeicher und nicht automatisch Cookies. Swiss-Post-Suche und Supabase Auth sind externe Dienste und erhalten die dafür notwendigen Anfragen. Das tatsächliche Cookie-Verhalten der Hosting- und Authentifizierungsdienste ist vor Veröffentlichung im Browser und in deren Einstellungen zu prüfen. Eine Cookie-Einwilligungs-Checkbox ist deshalb nicht Teil der Bestellvoraussetzungen.",
  },
  en: {
    impressumTitle: "Seller information",
    incomplete: "These required details are incomplete. Do not accept live orders until the responsible person or company, a valid postal address and a working email address have been added and checked. Add a UID only if one exists or is required.",
    agbTitle: "Terms and conditions",
    agb: "Draft for the Swiss market. Confirm the seller identity, contract acceptance, binding order step, delivery area, actual shipping rates, production and transit times, tax status, payment provider, complaints contact and any voluntary returns policy before publication. The current shop does not submit orders or send confirmation emails. Swiss law generally does not provide a right of withdrawal for online purchases. The applicable law and any voluntary returns policy must be confirmed for this seller. No voluntary return period is promised.",
    privacyTitle: "Privacy notice",
    privacy: "The controller and contact address are missing and must be added before publication. Cloudflare Workers serves the site. The browser stores the cart, product configuration and language in localStorage. A pickup-location search is sent through the Worker to Swiss Post. Optional sign-in sends the entered email address to Supabase Auth; the session stays in browser storage. Checkout fields, notes, payment choice, orders and payments are not currently sent to or stored by the shop. Under the Swiss FADP, people may request information and correction and, where legally available, deletion or restriction. GDPR rights apply only where the GDPR covers this shop. The operator must add purposes and legal bases, storage/deletion periods, technical logs, actual processors, processing countries and transfer safeguards. Requests need a verified contact address.",
    cookiesTitle: "Cookies and similar technologies",
    cookies: "No analytics or marketing tags are included in the application code. The shop uses localStorage for language, cart and the optional authentication session; browser storage is not automatically a cookie. Swiss Post search and Supabase Auth are external services and receive the requests needed for those features. Check the actual cookie behaviour of the hosting and authentication services in a browser and in their settings before publication. A cookie-consent checkbox is therefore not a condition for preparing an order.",
  },
  cs: {
    impressumTitle: "Identifikace prodávajícího",
    incomplete: "Tyto povinné údaje zatím nejsou úplné. Před spuštěním objednávek je nutné doplnit a ověřit odpovědnou osobu nebo firmu, platnou poštovní adresu a funkční e-mail. UID doplňte jen tehdy, pokud existuje nebo je vyžadováno.",
    agbTitle: "Obchodní podmínky",
    agb: "Návrh pro švýcarský trh. Před zveřejněním je nutné potvrdit totožnost prodávajícího, okamžik přijetí smlouvy, závazný krok objednávky, oblast doručení, skutečné sazby dopravy, dobu výroby a přepravy, daňový režim, platební službu, kontakt pro reklamace a případná dobrovolná pravidla vrácení. Současný web objednávky neodesílá ani neposílá potvrzovací e-maily. Švýcarské právo obecně nestanoví právo odstoupit od online nákupu. Rozhodné právo a případná dobrovolná pravidla vrácení je nutné potvrdit pro konkrétního prodávajícího. Dobrovolná lhůta pro vrácení se neslibuje.",
    privacyTitle: "Zásady ochrany osobních údajů",
    privacy: "Správce a kontaktní adresa chybí a před zveřejněním se musí doplnit. Web zajišťuje Cloudflare Workers. Prohlížeč ukládá košík, konfiguraci produktu a jazyk do localStorage. Při hledání výdejního místa se dotaz přes Worker odešle Swiss Post. Při volitelném přihlášení obdrží Supabase Auth zadaný e-mail; relace zůstává v úložišti prohlížeče. Údaje formuláře pokladny, poznámky, volba platby, objednávky ani platby se nyní obchodu neodesílají ani se zde neukládají. Podle švýcarského DSG lze žádat o informace a opravu a tam, kde to zákon umožňuje, o výmaz nebo omezení zpracování. Práva GDPR platí pouze tehdy, pokud se na obchod vztahuje. Provozovatel musí doplnit účely a právní základy, dobu uložení a výmazu, technické záznamy, skutečné zpracovatele, země zpracování a záruky přeshraničního přenosu. Žádosti vyžadují ověřený kontaktní údaj.",
    cookiesTitle: "Cookies a podobné technologie",
    cookies: "V aplikačním kódu nejsou zapojeny analytické ani marketingové měřicí skripty. Web používá localStorage pro jazyk, košík a volitelnou přihlašovací relaci; úložiště prohlížeče není automaticky cookie. Swiss Post a Supabase Auth jsou externí služby a dostávají požadavky potřebné pro své funkce. Před zveřejněním ověřte skutečné cookies hostingu a přihlašovací služby v prohlížeči i jejich nastaveních. Potvrzení cookies proto není podmínkou přípravy objednávky.",
  },
  fr: {
    impressumTitle: "Informations sur le vendeur",
    incomplete: "Ces informations obligatoires sont incomplètes. Avant toute commande réelle, ajoutez et vérifiez la personne ou l’entreprise responsable, une adresse postale valable et une adresse e-mail fonctionnelle. N’indiquez un UID que s’il existe ou est requis.",
    agbTitle: "Conditions générales",
    agb: "Projet pour le marché suisse. Avant publication, confirmez l’identité du vendeur, l’acceptation du contrat, l’étape de commande engageante, la zone de livraison, les tarifs réels, les délais de fabrication et de transport, le statut fiscal, le prestataire de paiement, le contact pour les réclamations et toute politique de retour volontaire. La boutique actuelle ne transmet pas de commandes et n’envoie pas d’e-mails de confirmation. Le droit suisse ne prévoit généralement pas de droit de révocation pour les achats en ligne. Le droit applicable et toute politique de retour volontaire doivent être confirmés pour ce vendeur. Aucun délai de retour volontaire n’est promis.",
    privacyTitle: "Politique de confidentialité",
    privacy: "Le responsable et son adresse de contact manquent et doivent être ajoutés avant publication. Le site est fourni par Cloudflare Workers. Le navigateur stocke le panier, la configuration du produit et la langue dans localStorage. Une recherche de point de retrait est transmise à Swiss Post par le Worker. Pour la connexion facultative, Supabase Auth reçoit l’adresse e-mail saisie; la session reste dans le navigateur. Les champs de commande, notes, choix de paiement, commandes et paiements ne sont actuellement ni transmis ni enregistrés par la boutique. Selon la LPD suisse, les personnes peuvent demander des renseignements et une rectification et, lorsque la loi le permet, l’effacement ou la limitation du traitement. Les droits RGPD ne s’appliquent que si le RGPD couvre cette boutique. L’exploitant doit préciser les finalités et bases légales, durées de conservation et d’effacement, journaux techniques, sous-traitants réels, pays de traitement et garanties de transfert. Les demandes nécessitent une adresse de contact vérifiée.",
    cookiesTitle: "Cookies et technologies similaires",
    cookies: "Aucun outil d’analyse ou de marketing n’est intégré au code de l’application. La boutique utilise localStorage pour la langue, le panier et la session facultative; ce stockage du navigateur n’est pas automatiquement un cookie. Swiss Post et Supabase Auth sont des services externes qui reçoivent les requêtes nécessaires à leurs fonctions. Vérifiez le comportement réel des cookies de l’hébergement et de l’authentification dans un navigateur et dans leurs paramètres avant publication. Une case d’acceptation des cookies n’est donc pas une condition pour préparer une commande.",
  },
  it: {
    impressumTitle: "Informazioni sul venditore",
    incomplete: "Questi dati obbligatori sono incompleti. Prima di accettare ordini reali, inserire e verificare la persona o l’azienda responsabile, un indirizzo postale valido e un’e-mail funzionante. Inserire l’UID solo se esistente o richiesto.",
    agbTitle: "Condizioni generali",
    agb: "Bozza per il mercato svizzero. Prima della pubblicazione confermare l’identità del venditore, l’accettazione del contratto, il passaggio che vincola l’ordine, l’area di consegna, i costi di spedizione effettivi, i tempi di produzione e trasporto, il regime fiscale, il gestore dei pagamenti, il contatto reclami e ogni politica volontaria di reso. Il negozio attuale non invia ordini né e-mail di conferma. Il diritto svizzero generalmente non prevede un diritto di recesso per gli acquisti online. La legge applicabile e ogni politica volontaria di reso devono essere confermate per questo venditore. Non viene promesso un periodo volontario di reso.",
    privacyTitle: "Informativa sulla privacy",
    privacy: "Il titolare e l’indirizzo di contatto mancano e devono essere aggiunti prima della pubblicazione. Il sito è fornito da Cloudflare Workers. Il browser salva carrello, configurazione del prodotto e lingua in localStorage. Una ricerca di un punto di ritiro viene inoltrata a Swiss Post tramite il Worker. Per l’accesso facoltativo, Supabase Auth riceve l’indirizzo e-mail inserito; la sessione resta nel browser. I campi checkout, le note, la scelta di pagamento, gli ordini e i pagamenti non vengono attualmente inviati né conservati dal negozio. Secondo la LPD svizzera è possibile chiedere informazioni e rettifica e, ove previsto dalla legge, cancellazione o limitazione del trattamento. I diritti GDPR valgono solo se il GDPR si applica a questo negozio. Il gestore deve indicare finalità e basi giuridiche, periodi di conservazione e cancellazione, registri tecnici, responsabili del trattamento effettivi, Paesi e garanzie per i trasferimenti. Le richieste richiedono un recapito verificato.",
    cookiesTitle: "Cookie e tecnologie simili",
    cookies: "Nel codice dell’applicazione non sono inclusi tag di analisi o marketing. Il negozio usa localStorage per lingua, carrello e sessione facoltativa; l’archiviazione del browser non è automaticamente un cookie. Swiss Post e Supabase Auth sono servizi esterni e ricevono le richieste necessarie alle loro funzioni. Prima della pubblicazione verificare nel browser e nelle relative impostazioni l’uso effettivo dei cookie da parte di hosting e autenticazione. La casella cookie non è quindi una condizione per preparare un ordine.",
  },
} satisfies Record<LanguageCode, Record<string, string>>;

const introProductIds = [
  "kule-jednostranna-1",
  "lesezeichen",
  "anhaenger",
  "flaschenoeffner",
  "kugelschreiber",
];

const logoOptions = [
  {
    id: "herz",
    mark: "♥",
    label: { de: "Herz", en: "Heart", cs: "Srdce", fr: "Cœur", it: "Cuore" },
  },
  {
    id: "fisch",
    mark: "◌",
    label: { de: "Fisch", en: "Fish", cs: "Ryba", fr: "Poisson", it: "Pesce" },
  },
  {
    id: "auto",
    mark: "◇",
    label: { de: "Auto", en: "Car", cs: "Auto", fr: "Voiture", it: "Auto" },
  },
  {
    id: "zug",
    mark: "▣",
    label: { de: "Zug", en: "Train", cs: "Vlak", fr: "Train", it: "Treno" },
  },
  {
    id: "srdicko",
    mark: "❤",
    label: { de: "Herz", en: "Heart", cs: "Srdíčko", fr: "Cœur", it: "Cuore" },
  },
  {
    id: "tlapka",
    mark: "✦",
    label: { de: "Pfote", en: "Paw", cs: "Tlapka", fr: "Patte", it: "Zampa" },
  },
];

type ProductTranslation = {
  category: string;
  badge: string;
  name: string;
  shortName: string;
  delivery: string;
  material: string;
  size: string;
  lead: string;
  personalization: string;
  finishLabel: string;
};

type ProductOption = {
  id: string;
  hex: string;
  edge: string;
  label: Record<LanguageCode, string>;
};

type ProductPhoto = {
  id: string;
  src: string;
  alt: Record<LanguageCode, string>;
};

type BackEngravingOption = {
  id: string;
  text: string;
};

const christmasBackEngravingOptions: BackEngravingOption[] = [
  { id: "merry-christmas", text: "Merry Christmas" },
  { id: "frohe-weihnachten", text: "Frohe Weihnachten" },
  { id: "vesele-vanoce", text: "Veselé Vánoce" },
  { id: "joyeux-noel", text: "Joyeux Noël" },
  { id: "buon-natale", text: "Buon Natale" },
];

const christmasBackEngravingByLanguage: Record<LanguageCode, string> = {
  en: "merry-christmas",
  de: "frohe-weihnachten",
  cs: "vesele-vanoce",
  fr: "joyeux-noel",
  it: "buon-natale",
};

type Product = {
  id: string;
  price: number;
  previewClass: string;
  supportsGiftWrap?: boolean;
  translations: Record<LanguageCode, ProductTranslation>;
  finishes: ProductOption[];
  photos: ProductPhoto[];
  backEngravingOptions?: BackEngravingOption[];
};

const products: Product[] = [
  {
    id: "kule-jednostranna-1",
    price: 7,
    previewClass: "circle",
    supportsGiftWrap: true,
    translations: {
      de: {
        category: "Kugeln",
        badge: "Personalisierbar",
        name: "Weihnachtskugel",
        shortName: "Weihnachtskugel",
        delivery: "4-7 Werktage",
        material: "Glas oder Holz",
        size: "ca. 8 cm",
        lead: "Gestalte eine Weihnachtskugel mit einem Namen oder kurzen Gruß. Du kannst zwischen einseitiger Gravur, einem Kugelset und zwei doppelseitigen Ausführungen wählen und anschließend Farbe und Oberfläche bestimmen.",
        personalization: "Name oder kurzer Gruß; Ausführung und Kugelfarbe auswählbar",
        finishLabel: "Farbe / Oberfläche",
      },
      en: {
        category: "Baubles",
        badge: "Personalised",
        name: "Christmas bauble",
        shortName: "Christmas bauble",
        delivery: "4-7 working days",
        material: "Glass or wood",
        size: "approx. 8 cm",
        lead: "Create a Christmas bauble engraved with a name or short greeting. Choose a one-sided design, a bauble set or one of two double-sided styles, then select the colour and finish.",
        personalization: "Name or short greeting; choose the style and bauble colour",
        finishLabel: "Colour / finish",
      },
      cs: {
        category: "Koule",
        badge: "Personalizovatelná",
        name: "Vánoční koule",
        shortName: "Vánoční koule",
        delivery: "4-7 pracovních dnů",
        material: "Sklo nebo dřevo",
        size: "cca 8 cm",
        lead: "Vytvořte vánoční kouli se jménem nebo krátkým přáním. Vyberte jednostranné provedení, set koulí nebo jednu ze dvou oboustranných variant a potom barvu a povrch.",
        personalization: "Jméno nebo krátké přání; volba provedení a barvy",
        finishLabel: "Barva / povrch",
      },
      fr: {
        category: "Boules",
        badge: "Personnalisable",
        name: "Boule de Noël",
        shortName: "Boule de Noël",
        delivery: "4-7 jours ouvrés",
        material: "Verre ou bois",
        size: "env. 8 cm",
        lead: "Créez une boule de Noël gravée avec un prénom ou un court message. Choisissez un modèle simple face, un lot ou l'une des deux versions double face, puis la couleur et la finition.",
        personalization: "Prénom ou court message; modèle et couleur au choix",
        finishLabel: "Couleur / finition",
      },
      it: {
        category: "Palline",
        badge: "Personalizzabile",
        name: "Pallina di Natale",
        shortName: "Pallina di Natale",
        delivery: "4-7 giorni lavorativi",
        material: "Vetro o legno",
        size: "ca. 8 cm",
        lead: "Crea una pallina di Natale incisa con un nome o un breve augurio. Scegli il modello a un lato, il set o una delle due versioni fronte-retro, poi colore e finitura.",
        personalization: "Nome o breve augurio; modello e colore a scelta",
        finishLabel: "Colore / finitura",
      },
    },
    finishes: [
      { id: "zelena-glanz", hex: "#3d7f5d", edge: "#1f4830", label: { de: "Grün glänzend", en: "Green gloss", cs: "Zelená lesklá", fr: "Vert brillant", it: "Verde lucido" } },
      { id: "zelena-mat", hex: "#3d7f5d", edge: "#1f4830", label: { de: "Grün matt", en: "Green matte", cs: "Zelená matná", fr: "Vert mat", it: "Verde opaco" } },
      { id: "cervena-glanz", hex: "#b03636", edge: "#671a1a", label: { de: "Rot glänzend", en: "Red gloss", cs: "Červená lesklá", fr: "Rouge brillant", it: "Rosso lucido" } },
      { id: "cervena-mat", hex: "#b03636", edge: "#671a1a", label: { de: "Rot matt", en: "Red matte", cs: "Červená matná", fr: "Rouge mat", it: "Rosso opaco" } },
      { id: "zlata-glanz", hex: "#d4b15d", edge: "#88652c", label: { de: "Gold glänzend", en: "Gold gloss", cs: "Zlatá lesklá", fr: "Or brillant", it: "Oro lucido" } },
      { id: "zlata-mat", hex: "#d4b15d", edge: "#88652c", label: { de: "Gold matt", en: "Gold matte", cs: "Zlatá matná", fr: "Or mat", it: "Oro opaco" } },
      { id: "hneda-glanz", hex: "#8d5d39", edge: "#53311d", label: { de: "Braun glänzend", en: "Brown gloss", cs: "Hnědá lesklá", fr: "Brun brillant", it: "Marrone lucido" } },
      { id: "hneda-mat", hex: "#8d5d39", edge: "#53311d", label: { de: "Braun matt", en: "Brown matte", cs: "Hnědá matná", fr: "Brun mat", it: "Marrone opaco" } },
      { id: "ruzova-glanz", hex: "#d8709a", edge: "#7a3c59", label: { de: "Rosa glänzend", en: "Pink gloss", cs: "Růžová lesklá", fr: "Rose brillant", it: "Rosa lucido" } },
      { id: "ruzova-mat", hex: "#d8709a", edge: "#7a3c59", label: { de: "Rosa matt", en: "Pink matte", cs: "Růžová matná", fr: "Rose mat", it: "Rosa opaco" } },
      { id: "modra-glanz", hex: "#3b6fa9", edge: "#1d3557", label: { de: "Blau glänzend", en: "Blue gloss", cs: "Modrá lesklá", fr: "Bleu brillant", it: "Blu lucido" } },
      { id: "modra-mat", hex: "#3b6fa9", edge: "#1d3557", label: { de: "Blau matt", en: "Blue matte", cs: "Modrá matná", fr: "Bleu mat", it: "Blu opaco" } },
    ],
    photos: [
      { id: "main", src: "/products/christmas-baubles-main.jpeg", alt: { de: "Hauptgrafik für einseitig gravierte Weihnachtskugel", en: "Main graphic for one-sided engraved bauble", cs: "Hlavní grafika pro jednostranně gravírovanou kouli", fr: "Visuel principal pour boule gravée sur une face", it: "Grafica principale per pallina incisa su un lato" } },
      { id: "wrapped", src: "/products/christmas-baubles-wrapped.jpeg", alt: { de: "Einseitig gravierte Kugel mit Schleife", en: "One-sided engraved bauble with bow", cs: "Jednostranně gravírovaná koule s mašlí", fr: "Boule gravée sur une face avec ruban", it: "Pallina incisa su un lato con fiocco" } },
      { id: "set", src: "/products/christmas-baubles-color-set.jpeg", alt: { de: "Set einseitig gravierter Kugeln in mehreren Farben", en: "Set of one-sided engraved baubles in several colours", cs: "Sada jednostranně gravírovaných koulí v několika barvách", fr: "Ensemble de boules gravées sur une face en plusieurs couleurs", it: "Set di palline incise su un lato in più colori" } },
    ],
  },
  {
    id: "kule-jednostranna-2",
    price: 8,
    previewClass: "circle",
    supportsGiftWrap: true,
    translations: {
      de: {
        category: "Kugeln",
        badge: "Einseitig",
        name: "Personalisiertes Kugelset",
        shortName: "Kugelset",
        delivery: "4-7 Werktage",
        material: "Glas oder Holz",
        size: "ca. 8 cm",
        lead: "Ein abgestimmtes Set personalisierter Weihnachtskugeln mit Namen oder kurzem Gruß – eine schöne Erinnerung für die Familie oder ein gemeinsames Geschenk.",
        personalization: "Namen oder kurze Grüße für ein persönliches Kugelset",
        finishLabel: "Farbe / Oberfläche",
      },
      en: {
        category: "Baubles",
        badge: "One-sided",
        name: "Personalised Bauble Set",
        shortName: "Bauble set",
        delivery: "4-7 working days",
        material: "Glass or wood",
        size: "approx. 8 cm",
        lead: "A coordinated set of personalised Christmas baubles engraved with names or short greetings, made for family trees and thoughtful shared gifts.",
        personalization: "Names or short greetings across a bauble set",
        finishLabel: "Colour / finish",
      },
      cs: {
        category: "Koule",
        badge: "Jednostranná",
        name: "Personalizovaný set koulí",
        shortName: "Set koulí",
        delivery: "4-7 pracovních dnů",
        material: "Sklo nebo dřevo",
        size: "cca 8 cm",
        lead: "Ladící set personalizovaných vánočních koulí se jmény nebo krátkým přáním potěší rodinu i jako společný dárek.",
        personalization: "Jména nebo krátká přání na set koulí",
        finishLabel: "Barva / povrch",
      },
      fr: {
        category: "Boules",
        badge: "Simple face",
        name: "Set de boules personnalisées",
        shortName: "Set de boules",
        delivery: "4-7 jours ouvrés",
        material: "Verre ou bois",
        size: "env. 8 cm",
        lead: "Un ensemble assorti de boules de Noël gravées avec des prénoms ou de courts messages, à offrir en famille ou à garder comme souvenir.",
        personalization: "Prénoms ou courts messages pour un ensemble",
        finishLabel: "Couleur / finition",
      },
      it: {
        category: "Palline",
        badge: "Una faccia",
        name: "Set di palline personalizzate",
        shortName: "Set palline",
        delivery: "4-7 giorni lavorativi",
        material: "Vetro o legno",
        size: "ca. 8 cm",
        lead: "Un set coordinato di palline natalizie incise con nomi o brevi auguri, ideale per l'albero di famiglia o come regalo condiviso.",
        personalization: "Nomi o brevi auguri per un set di palline",
        finishLabel: "Colore / finitura",
      },
    },
    finishes: [
      { id: "zelena-glanz", hex: "#3d7f5d", edge: "#1f4830", label: { de: "Grün glänzend", en: "Green gloss", cs: "Zelená lesklá", fr: "Vert brillant", it: "Verde lucido" } },
      { id: "zelena-mat", hex: "#3d7f5d", edge: "#1f4830", label: { de: "Grün matt", en: "Green matte", cs: "Zelená matná", fr: "Vert mat", it: "Verde opaco" } },
      { id: "cervena-glanz", hex: "#b03636", edge: "#671a1a", label: { de: "Rot glänzend", en: "Red gloss", cs: "Červená lesklá", fr: "Rouge brillant", it: "Rosso lucido" } },
      { id: "cervena-mat", hex: "#b03636", edge: "#671a1a", label: { de: "Rot matt", en: "Red matte", cs: "Červená matná", fr: "Rouge mat", it: "Rosso opaco" } },
      { id: "zlata-glanz", hex: "#d4b15d", edge: "#88652c", label: { de: "Gold glänzend", en: "Gold gloss", cs: "Zlatá lesklá", fr: "Or brillant", it: "Oro lucido" } },
      { id: "zlata-mat", hex: "#d4b15d", edge: "#88652c", label: { de: "Gold matt", en: "Gold matte", cs: "Zlatá matná", fr: "Or mat", it: "Oro opaco" } },
      { id: "hneda-glanz", hex: "#8d5d39", edge: "#53311d", label: { de: "Braun glänzend", en: "Brown gloss", cs: "Hnědá lesklá", fr: "Brun brillant", it: "Marrone lucido" } },
      { id: "hneda-mat", hex: "#8d5d39", edge: "#53311d", label: { de: "Braun matt", en: "Brown matte", cs: "Hnědá matná", fr: "Brun mat", it: "Marrone opaco" } },
      { id: "ruzova-glanz", hex: "#d8709a", edge: "#7a3c59", label: { de: "Rosa glänzend", en: "Pink gloss", cs: "Růžová lesklá", fr: "Rose brillant", it: "Rosa lucido" } },
      { id: "ruzova-mat", hex: "#d8709a", edge: "#7a3c59", label: { de: "Rosa matt", en: "Pink matte", cs: "Růžová matná", fr: "Rose mat", it: "Rosa opaco" } },
      { id: "modra-glanz", hex: "#3b6fa9", edge: "#1d3557", label: { de: "Blau glänzend", en: "Blue gloss", cs: "Modrá lesklá", fr: "Bleu brillant", it: "Blu lucido" } },
      { id: "modra-mat", hex: "#3b6fa9", edge: "#1d3557", label: { de: "Blau matt", en: "Blue matte", cs: "Modrá matná", fr: "Bleu mat", it: "Blu opaco" } },
    ],
    photos: [
      { id: "main", src: "/products/christmas-baubles-main.jpeg", alt: { de: "Grafik für die personalisierte Kugel", en: "Graphic for the personalised bauble", cs: "Grafika pro personalizovanou kouli", fr: "Visuel pour boule personnalisée", it: "Grafica per pallina personalizzata" } },
      { id: "wrapped", src: "/products/christmas-baubles-wrapped.jpeg", alt: { de: "Personalisiertes Kugelset mit Schleife", en: "Personalised bauble set with bow", cs: "Personalizovaný set koulí s mašlí", fr: "Set de boules personnalisées avec ruban", it: "Set di palline personalizzate con fiocco" } },
      { id: "set", src: "/products/christmas-baubles-color-set.jpeg", alt: { de: "Mehrfarbiges Kugelset", en: "Multi-colour bauble set", cs: "Vícebarevný set koulí", fr: "Set de boules multicolores", it: "Set di palline multicolori" } },
    ],
  },
  {
    id: "kule-dvojstranna-1",
    price: 9,
    previewClass: "circle",
    supportsGiftWrap: true,
    translations: {
      de: {
        category: "Kugeln",
        badge: "Beidseitig",
        name: "Beidseitig gravierte Kugel",
        shortName: "Kugel beidseitig",
        delivery: "4-7 Werktage",
        material: "Glas oder Holz",
        size: "ca. 8 cm",
        lead: "Vorderseite mit Namen und Motiv, Rückseite mit festlichem Spruch. Perfekt für besondere Gaben.",
        personalization: "Vorderseite mit Namen und Motiv, Rückseite mit Wunschtext",
        finishLabel: "Farbe / Oberfläche",
      },
      en: {
        category: "Baubles",
        badge: "Double-sided",
        name: "Double-Sided Engraved Bauble",
        shortName: "Double bauble",
        delivery: "4-7 working days",
        material: "Glass or wood",
        size: "approx. 8 cm",
        lead: "Front side with name and motif, back side with festive message. Ideal for special gifts.",
        personalization: "Front with name and motif, back with custom text",
        finishLabel: "Colour / finish",
      },
      cs: {
        category: "Koule",
        badge: "Oboustranná",
        name: "Oboustranně gravírovaná koule",
        shortName: "Koule oboustranná",
        delivery: "4-7 pracovních dnů",
        material: "Sklo nebo dřevo",
        size: "cca 8 cm",
        lead: "Přední strana s jménem a motivem, zadní strana se svátečním textem. Ideální pro speciální dárky.",
        personalization: "Přední strana se jménem a motivem, zadní strana s přáním",
        finishLabel: "Barva / povrch",
      },
      fr: {
        category: "Boules",
        badge: "Double face",
        name: "Boule gravée double face",
        shortName: "Boule double face",
        delivery: "4-7 jours ouvrés",
        material: "Verre ou bois",
        size: "env. 8 cm",
        lead: "Face avant avec prénom et motif, dos avec message festif. Idéal pour cadeaux spéciaux.",
        personalization: "Face avant avec nom et motif, dos avec texte souhaité",
        finishLabel: "Couleur / finition",
      },
      it: {
        category: "Palline",
        badge: "Fronte-retro",
        name: "Pallina incisa fronte-retro",
        shortName: "Pallina fronte-retro",
        delivery: "4-7 giorni lavorativi",
        material: "Vetro o legno",
        size: "ca. 8 cm",
        lead: "Fronte con nome e motivo, retro con messaggio festivo. Perfetta per regali speciali.",
        personalization: "Fronte con nome e motivo, retro con testo personalizzato",
        finishLabel: "Colore / finitura",
      },
    },
    finishes: [
      { id: "zelena-glanz", hex: "#3d7f5d", edge: "#1f4830", label: { de: "Grün glänzend", en: "Green gloss", cs: "Zelená lesklá", fr: "Vert brillant", it: "Verde lucido" } },
      { id: "zelena-mat", hex: "#3d7f5d", edge: "#1f4830", label: { de: "Grün matt", en: "Green matte", cs: "Zelená matná", fr: "Vert mat", it: "Verde opaco" } },
      { id: "cervena-glanz", hex: "#b03636", edge: "#671a1a", label: { de: "Rot glänzend", en: "Red gloss", cs: "Červená lesklá", fr: "Rouge brillant", it: "Rosso lucido" } },
      { id: "cervena-mat", hex: "#b03636", edge: "#671a1a", label: { de: "Rot matt", en: "Red matte", cs: "Červená matná", fr: "Rouge mat", it: "Rosso opaco" } },
      { id: "zlata-glanz", hex: "#d4b15d", edge: "#88652c", label: { de: "Gold glänzend", en: "Gold gloss", cs: "Zlatá lesklá", fr: "Or brillant", it: "Oro lucido" } },
      { id: "zlata-mat", hex: "#d4b15d", edge: "#88652c", label: { de: "Gold matt", en: "Gold matte", cs: "Zlatá matná", fr: "Or mat", it: "Oro opaco" } },
      { id: "hneda-glanz", hex: "#8d5d39", edge: "#53311d", label: { de: "Braun glänzend", en: "Brown gloss", cs: "Hnědá lesklá", fr: "Brun brillant", it: "Marrone lucido" } },
      { id: "hneda-mat", hex: "#8d5d39", edge: "#53311d", label: { de: "Braun matt", en: "Brown matte", cs: "Hnědá matná", fr: "Brun mat", it: "Marrone opaco" } },
      { id: "ruzova-glanz", hex: "#d8709a", edge: "#7a3c59", label: { de: "Rosa glänzend", en: "Pink gloss", cs: "Růžová lesklá", fr: "Rose brillant", it: "Rosa lucido" } },
      { id: "ruzova-mat", hex: "#d8709a", edge: "#7a3c59", label: { de: "Rosa matt", en: "Pink matte", cs: "Růžová matná", fr: "Rose mat", it: "Rosa opaco" } },
      { id: "modra-glanz", hex: "#3b6fa9", edge: "#1d3557", label: { de: "Blau glänzend", en: "Blue gloss", cs: "Modrá lesklá", fr: "Bleu brillant", it: "Blu lucido" } },
      { id: "modra-mat", hex: "#3b6fa9", edge: "#1d3557", label: { de: "Blau matt", en: "Blue matte", cs: "Modrá matná", fr: "Bleu mat", it: "Blu opaco" } },
    ],
    backEngravingOptions: christmasBackEngravingOptions,
    photos: [
      { id: "main", src: "/products/christmas-baubles-main.jpeg", alt: { de: "Hauptgrafik für beidseitig gravierte Kugel", en: "Main graphic for double-sided engraved bauble", cs: "Hlavní grafika pro oboustranně gravírovanou kouli", fr: "Visuel principal pour boule gravée double face", it: "Grafica principale per pallina incisa fronte-retro" } },
      { id: "wrapped", src: "/products/christmas-baubles-wrapped.jpeg", alt: { de: "Beidseitig gravierte Kugel mit Schleife", en: "Double-sided engraved bauble with bow", cs: "Oboustranně gravírovaná koule s mašlí", fr: "Boule gravée double face avec ruban", it: "Pallina incisa fronte-retro con fiocco" } },
      { id: "set", src: "/products/christmas-baubles-color-set.jpeg", alt: { de: "Set beidseitig gravierter Kugeln in mehreren Farben", en: "Set of double-sided engraved baubles in several colours", cs: "Sada oboustranně gravírovaných koulí v několika barvách", fr: "Set de boules gravées double face en plusieurs couleurs", it: "Set di palline incise fronte-retro in più colori" } },
    ],
  },
  {
    id: "kule-dvojstranna-2",
    price: 10,
    previewClass: "circle",
    supportsGiftWrap: true,
    translations: {
      de: {
        category: "Kugeln",
        badge: "Beidseitig",
        name: "Festliche Doppelseiten-Kugel",
        shortName: "Doppelseiten-Kugel",
        delivery: "4-7 Werktage",
        material: "Glas oder Holz",
        size: "ca. 8 cm",
        lead: "Zwei schöne Seiten für Namen, Spruch und weihnachtliche Grüße. Ideal für besondere Momente.",
        personalization: "Vorderseite mit Namen und Motiv, Rückseite mit Wunschtext",
        finishLabel: "Farbe / Oberfläche",
      },
      en: {
        category: "Baubles",
        badge: "Double-sided",
        name: "Festive Double-Sided Bauble",
        shortName: "Double-sided bauble",
        delivery: "4-7 working days",
        material: "Glass or wood",
        size: "approx. 8 cm",
        lead: "Two beautiful sides for names, wishes and festive greetings. Ideal for special moments.",
        personalization: "Front with name and motif, back with custom text",
        finishLabel: "Colour / finish",
      },
      cs: {
        category: "Koule",
        badge: "Oboustranná",
        name: "Sváteční oboustranná koule",
        shortName: "Oboustranná koule",
        delivery: "4-7 pracovních dnů",
        material: "Sklo nebo dřevo",
        size: "cca 8 cm",
        lead: "Dvě hezké strany pro jméno, přání a vánoční pozdrav. Ideální pro zvláštní chvíle.",
        personalization: "Přední strana se jménem a motivem, zadní strana s přáním",
        finishLabel: "Barva / povrch",
      },
      fr: {
        category: "Boules",
        badge: "Double face",
        name: "Boule festive double face",
        shortName: "Boule festive",
        delivery: "4-7 jours ouvrés",
        material: "Verre ou bois",
        size: "env. 8 cm",
        lead: "Deux belles faces pour prénom, texte et souhait festif. Idéal pour moments spéciaux.",
        personalization: "Face avant avec nom et motif, dos avec texte souhaité",
        finishLabel: "Couleur / finition",
      },
      it: {
        category: "Palline",
        badge: "Fronte-retro",
        name: "Pallina festiva fronte-retro",
        shortName: "Pallina festiva",
        delivery: "4-7 giorni lavorativi",
        material: "Vetro o legno",
        size: "ca. 8 cm",
        lead: "Due bellissimi lati per nome, augurio e messaggio festivo. Perfetta per momenti speciali.",
        personalization: "Fronte con nome e motivo, retro con testo personalizzato",
        finishLabel: "Colore / finitura",
      },
    },
    finishes: [
      { id: "zelena-glanz", hex: "#3d7f5d", edge: "#1f4830", label: { de: "Grün glänzend", en: "Green gloss", cs: "Zelená lesklá", fr: "Vert brillant", it: "Verde lucido" } },
      { id: "zelena-mat", hex: "#3d7f5d", edge: "#1f4830", label: { de: "Grün matt", en: "Green matte", cs: "Zelená matná", fr: "Vert mat", it: "Verde opaco" } },
      { id: "cervena-glanz", hex: "#b03636", edge: "#671a1a", label: { de: "Rot glänzend", en: "Red gloss", cs: "Červená lesklá", fr: "Rouge brillant", it: "Rosso lucido" } },
      { id: "cervena-mat", hex: "#b03636", edge: "#671a1a", label: { de: "Rot matt", en: "Red matte", cs: "Červená matná", fr: "Rouge mat", it: "Rosso opaco" } },
      { id: "zlata-glanz", hex: "#d4b15d", edge: "#88652c", label: { de: "Gold glänzend", en: "Gold gloss", cs: "Zlatá lesklá", fr: "Or brillant", it: "Oro lucido" } },
      { id: "zlata-mat", hex: "#d4b15d", edge: "#88652c", label: { de: "Gold matt", en: "Gold matte", cs: "Zlatá matná", fr: "Or mat", it: "Oro opaco" } },
      { id: "hneda-glanz", hex: "#8d5d39", edge: "#53311d", label: { de: "Braun glänzend", en: "Brown gloss", cs: "Hnědá lesklá", fr: "Brun brillant", it: "Marrone lucido" } },
      { id: "hneda-mat", hex: "#8d5d39", edge: "#53311d", label: { de: "Braun matt", en: "Brown matte", cs: "Hnědá matná", fr: "Brun mat", it: "Marrone opaco" } },
      { id: "ruzova-glanz", hex: "#d8709a", edge: "#7a3c59", label: { de: "Rosa glänzend", en: "Pink gloss", cs: "Růžová lesklá", fr: "Rose brillant", it: "Rosa lucido" } },
      { id: "ruzova-mat", hex: "#d8709a", edge: "#7a3c59", label: { de: "Rosa matt", en: "Pink matte", cs: "Růžová matná", fr: "Rose mat", it: "Rosa opaco" } },
      { id: "modra-glanz", hex: "#3b6fa9", edge: "#1d3557", label: { de: "Blau glänzend", en: "Blue gloss", cs: "Modrá lesklá", fr: "Bleu brillant", it: "Blu lucido" } },
      { id: "modra-mat", hex: "#3b6fa9", edge: "#1d3557", label: { de: "Blau matt", en: "Blue matte", cs: "Modrá matná", fr: "Bleu mat", it: "Blu opaco" } },
    ],
    backEngravingOptions: christmasBackEngravingOptions,
    photos: [
      { id: "main", src: "/products/christmas-baubles-main.jpeg", alt: { de: "Hauptgrafik für festliche Doppelseiten-Kugel", en: "Main graphic for festive double-sided bauble", cs: "Hlavní grafika pro sváteční oboustrannou kouli", fr: "Visuel principal pour boule festive double face", it: "Grafica principale per pallina festiva fronte-retro" } },
      { id: "wrapped", src: "/products/christmas-baubles-wrapped.jpeg", alt: { de: "Festliche doppelseitige Kugel mit Schleife", en: "Festive double-sided bauble with bow", cs: "Sváteční oboustranná koule s mašlí", fr: "Boule festive double face avec ruban", it: "Pallina festiva fronte-retro con fiocco" } },
      { id: "set", src: "/products/christmas-baubles-color-set.jpeg", alt: { de: "Set festlicher doppelseitiger Kugeln", en: "Set of festive double-sided baubles", cs: "Sada svátečních oboustranných koulí", fr: "Set de boules festives double face", it: "Set di palline festive fronte-retro" } },
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
        lead: "Schmales Lesezeichen aus Birkensperrholz mit individueller Namensgravur oder kurzem Zitat. Ein farbiges Quastenband markiert die Seite und macht es zum persönlichen Geschenk für Leser.",
        personalization: "Name oder kurzer Buchtitel; Quastenfarbe auswählbar",
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
        lead: "A slim birch plywood bookmark engraved with a name or a short favourite quote. Choose a coloured tassel to make a thoughtful gift for a book lover.",
        personalization: "Name or short book quote; choose a tassel colour",
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
        lead: "Úzká záložka z březové překližky s gravírovaným jménem nebo krátkým citátem. Barevný střapec pomůže rychle najít rozečtenou stránku a potěší každého čtenáře.",
        personalization: "Jméno nebo krátký citát; výběr barvy střapce",
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
        lead: "Un marque-page fin en contreplaqué de bouleau, gravé avec un prénom ou une courte citation. Choisissez un pompon coloré pour retrouver facilement votre page et offrir un cadeau attentionné.",
        personalization: "Prénom ou courte citation; couleur du pompon au choix",
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
        lead: "Un segnalibro sottile in compensato di betulla, inciso con un nome o una breve citazione. Scegli una nappina colorata per ritrovare la pagina e fare un regalo pensato per chi ama leggere.",
        personalization: "Nome o breve citazione; scegli il colore della nappina",
        finishLabel: "Nappina",
      },
    },
    finishes: [
      { id: "orange", hex: "#e59a2f", edge: "#a96513", label: { de: "Orange", en: "Orange", cs: "Oranžová", fr: "Orange", it: "Arancione" } },
      { id: "violett", hex: "#5c3c98", edge: "#362260", label: { de: "Violett", en: "Purple", cs: "Fialová", fr: "Violet", it: "Viola" } },
      { id: "natur", hex: "#c7a577", edge: "#80623f", label: { de: "Naturband", en: "Natural cord", cs: "Přírodní šňůrka", fr: "Cordon naturel", it: "Cordino naturale" } },
    ],
    photos: [
      { id: "name", src: "/products/wood-bookmark-name.jpeg", alt: { de: "Holz-Lesezeichen mit Namensgravur und gelber Quaste", en: "Wooden bookmark with name engraving and yellow tassel", cs: "Dřevěná záložka s gravírovaným jménem a žlutým střapcem", fr: "Marque-page en bois avec prénom gravé et pompon jaune", it: "Segnalibro in legno con nome inciso e nappina gialla" } },
      { id: "page", src: "/products/wood-bookmark-page.jpeg", alt: { de: "Holz-Lesezeichen mit graviertem Lesespruch", en: "Wooden bookmark with engraved reading quote", cs: "Dřevěná záložka s gravírovaným čtecím nápisem", fr: "Marque-page en bois avec citation de lecture gravée", it: "Segnalibro in legno con frase di lettura incisa" } },
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
        lead: "Runder Anhänger aus Holz mit fein graviertem Sternzeichen-, klassischen oder minimalistischen Motiv. Ein kurzer Name auf der Rückseite macht den Schlüsselanhänger zu einem persönlichen Begleiter.",
        personalization: "Motivstil wählen; kurzer Name auf der Rückseite",
        finishLabel: "Motivwelt",
      },
      en: {
        category: "Keys",
        badge: "Design series",
        name: "Wooden Keychain",
        shortName: "Keychain",
        delivery: "3-6 working days",
        material: "Round wooden disc",
        size: "approx. 5 cm",
        lead: "A round wooden keychain engraved with a zodiac, classic or minimal design. Add a short name to the reverse to make this useful little keepsake your own.",
        personalization: "Choose a design style; add a short name on the back",
        finishLabel: "Design style",
      },
      cs: {
        category: "Klíče",
        badge: "Motivová série",
        name: "Dřevěný přívěšek",
        shortName: "Přívěšek",
        delivery: "3-6 pracovních dnů",
        material: "Kulaté dřevěné kolečko",
        size: "cca 5 cm",
        lead: "Kulatý dřevěný přívěšek s jemným motivem ve stylu znamení zvěrokruhu, klasiky nebo minimalismu. Krátké jméno na zadní straně z něj udělá osobní ozdobu na klíče.",
        personalization: "Výběr stylu motivu; krátké jméno na zadní straně",
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
        lead: "Un porte-clés rond en bois orné d'une gravure au choix: signe astrologique, style classique ou minimaliste. Ajoutez un prénom court au verso pour le rendre vraiment personnel.",
        personalization: "Choix du style; prénom court au verso",
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
        lead: "Un portachiavi rotondo in legno con incisione in stile zodiacale, classico o minimalista. Aggiungi un nome breve sul retro per un ricordo davvero personale.",
        personalization: "Scegli lo stile; nome breve sul retro",
        finishLabel: "Stile motivo",
      },
    },
    finishes: [
      { id: "zodiac", hex: "#d8bd8b", edge: "#8d6a37", label: { de: "Sternzeichen", en: "Zodiac", cs: "Znamení", fr: "Zodiaque", it: "Zodiaco" } },
      { id: "classic", hex: "#cfa66d", edge: "#805a2f", label: { de: "Klassisch", en: "Classic", cs: "Klasické", fr: "Classique", it: "Classico" } },
      { id: "minimal", hex: "#eee1c6", edge: "#9a7a50", label: { de: "Minimal", en: "Minimal", cs: "Minimal", fr: "Minimal", it: "Minimal" } },
    ],
    photos: [
      { id: "zodiac", src: "/products/wood-pendants-zodiac.jpeg", alt: { de: "Mehrere runde Holz-Anhänger mit gravierten Motiven", en: "Several round wooden keychains with engraved designs", cs: "Více kulatých dřevěných přívěšků s gravírovanými motivy", fr: "Plusieurs porte-clés ronds en bois avec motifs gravés", it: "Diversi portachiavi rotondi in legno con motivi incisi" } },
      { id: "detail", src: "/products/wood-pendant-detail.jpeg", alt: { de: "Detailaufnahme eines runden Holz-Anhängers mit Gravur", en: "Close-up of a round wooden keychain with engraving", cs: "Detail kulatého dřevěného přívěšku s gravírováním", fr: "Gros plan d'un porte-clés rond en bois gravé", it: "Dettaglio di un portachiavi rotondo in legno inciso" } },
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
        lead: "Robuster Flaschenöffner mit glattem Holzgriff und Metallkopf. Verleihe dem Griff mit einem Namen oder kurzen Text sowie einer Schriftart deiner Wahl eine persönliche Note.",
        personalization: "Name oder kurzer Text; Schriftart auswählbar",
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
        lead: "A sturdy bottle opener with a smooth wooden handle and metal opener. Personalise the handle with a name or short message in your choice of lettering style.",
        personalization: "Name or short message; choose a lettering style",
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
        lead: "Pevný otvírák s hladkou dřevěnou rukojetí a kovovou hlavicí. Vygravíruj na rukojeť jméno nebo krátký text a zvol si styl písma.",
        personalization: "Jméno nebo krátký text; volba stylu písma",
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
        lead: "Un décapsuleur robuste avec un manche en bois lisse et une tête en métal. Faites graver un prénom ou un court message dans le style d'écriture de votre choix.",
        personalization: "Prénom ou court message; style d'écriture au choix",
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
        lead: "Un robusto apribottiglie con manico in legno liscio e testa in metallo. Personalizza il manico con un nome o un breve messaggio e scegli lo stile di scrittura.",
        personalization: "Nome o breve messaggio; scegli lo stile di scrittura",
        finishLabel: "Stile incisione",
      },
    },
    finishes: [
      { id: "script", hex: "#bf8f56", edge: "#76512c", label: { de: "Schreibschrift", en: "Script", cs: "Psací písmo", fr: "Écriture", it: "Corsivo" } },
      { id: "bold", hex: "#c8a06f", edge: "#7d5632", label: { de: "Kräftig", en: "Bold", cs: "Výrazné", fr: "Marqué", it: "Marcato" } },
      { id: "classic", hex: "#d4b785", edge: "#8a673b", label: { de: "Klassisch", en: "Classic", cs: "Klasické", fr: "Classique", it: "Classico" } },
    ],
    photos: [
      { id: "single", src: "/products/wood-opener.jpeg", alt: { de: "Holz-Flaschenöffner mit graviertem Namen", en: "Wooden bottle opener with engraved name", cs: "Dřevěný otvírák s gravírovaným jménem", fr: "Décapsuleur en bois avec prénom gravé", it: "Apribottiglie in legno con nome inciso" } },
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
        lead: "Kugelschreiber in Bambusoptik mit Metallclip und persönlicher Gravur. Der Name oder kurze Gruß macht ihn zu einem praktischen Begleiter und einer passenden Aufmerksamkeit für Büro oder Schule.",
        personalization: "Name oder kurzer Gruß; Metallclip auswählen",
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
        lead: "A bamboo-look wooden ballpoint pen with a metal clip and personal engraving. Add a name or short greeting for a useful desk companion or a thoughtful gift for work and study.",
        personalization: "Name or short greeting; choose the metal clip",
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
        lead: "Dřevěná propiska s bambusovým vzhledem, kovovým klipem a osobním gravírováním. Jméno nebo krátké věnování z ní udělá praktického společníka do kanceláře i do školy.",
        personalization: "Jméno nebo krátké věnování; volba kovového klipu",
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
        lead: "Un stylo bille en bois d'aspect bambou, avec clip métallique et gravure personnalisée. Un prénom ou un court message en fait un compagnon utile au bureau ou pour les études.",
        personalization: "Prénom ou court message; choix du clip métallique",
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
        lead: "Una penna a sfera in legno effetto bambù, con clip in metallo e incisione personalizzata. Un nome o una breve dedica la rende utile in ufficio, a scuola o come regalo.",
        personalization: "Nome o breve dedica; scegli la clip in metallo",
        finishLabel: "Colore clip",
      },
    },
    finishes: [
      { id: "silber", hex: "#d4d8da", edge: "#858c90", label: { de: "Silber", en: "Silver", cs: "Stříbrná", fr: "Argent", it: "Argento" } },
      { id: "chrom", hex: "#b9c0c2", edge: "#6b7275", label: { de: "Chrom", en: "Chrome", cs: "Chrom", fr: "Chrome", it: "Cromo" } },
      { id: "natur", hex: "#d7b679", edge: "#8b6332", label: { de: "Natur", en: "Natural", cs: "Přírodní", fr: "Naturel", it: "Naturale" } },
    ],
    photos: [
      { id: "single", src: "/products/wood-pen.jpeg", alt: { de: "Holz-Kugelschreiber mit graviertem Namen", en: "Wooden ballpoint pen with engraved name", cs: "Dřevěná propiska s gravírovaným jménem", fr: "Stylo bille en bois avec prénom gravé", it: "Penna a sfera in legno con nome inciso" } },
    ],
  },
];

const BAUBLE_PRODUCT_ID = "kule-jednostranna-1";
const baubleProductIds = [
  BAUBLE_PRODUCT_ID,
  "kule-jednostranna-2",
  "kule-dvojstranna-1",
  "kule-dvojstranna-2",
];
const baubleVariantLabels: Record<string, Record<LanguageCode, string>> = {
  [BAUBLE_PRODUCT_ID]: {
    de: "Einseitig",
    en: "One-sided",
    cs: "Jednostranná",
    fr: "Simple face",
    it: "Un lato",
  },
  "kule-jednostranna-2": {
    de: "Kugelset",
    en: "Bauble set",
    cs: "Set koulí",
    fr: "Set de boules",
    it: "Set palline",
  },
  "kule-dvojstranna-1": {
    de: "Doppelseitig",
    en: "Double-sided",
    cs: "Oboustranná",
    fr: "Double face",
    it: "Fronte-retro",
  },
  "kule-dvojstranna-2": {
    de: "Festlich doppelseitig",
    en: "Festive double-sided",
    cs: "Sváteční oboustranná",
    fr: "Double face festive",
    it: "Fronte-retro festiva",
  },
};
const baubleVariants = products
  .filter((product) => baubleProductIds.includes(product.id))
  .map((product) => ({
    id: product.id,
    price: product.price,
    label: baubleVariantLabels[product.id],
    backEngravingOptions: product.backEngravingOptions,
  }));
const availableProducts = products.filter(
  (product) => !baubleProductIds.includes(product.id) || product.id === BAUBLE_PRODUCT_ID,
);
const baubleColors = [
  {
    id: "zelena",
    hex: "#3d7f5d",
    edge: "#1f4830",
    label: { de: "Grün", en: "Green", cs: "Zelená", fr: "Vert", it: "Verde" },
  },
  {
    id: "cervena",
    hex: "#b03636",
    edge: "#671a1a",
    label: { de: "Rot", en: "Red", cs: "Červená", fr: "Rouge", it: "Rosso" },
  },
  {
    id: "zlata",
    hex: "#d4b15d",
    edge: "#88652c",
    label: { de: "Gold", en: "Gold", cs: "Zlatá", fr: "Or", it: "Oro" },
  },
  {
    id: "hneda",
    hex: "#8d5d39",
    edge: "#53311d",
    label: { de: "Braun", en: "Brown", cs: "Hnědá", fr: "Brun", it: "Marrone" },
  },
  {
    id: "ruzova",
    hex: "#d8709a",
    edge: "#7a3c59",
    label: { de: "Rosa", en: "Pink", cs: "Růžová", fr: "Rose", it: "Rosa" },
  },
  {
    id: "modra",
    hex: "#3b6fa9",
    edge: "#1d3557",
    label: { de: "Blau", en: "Blue", cs: "Modrá", fr: "Bleu", it: "Blu" },
  },
];
const baubleSurfaces = [
  {
    id: "glanz",
    label: { de: "Glänzend", en: "Glossy", cs: "Lesklá", fr: "Brillante", it: "Lucida" },
  },
  {
    id: "mat",
    label: { de: "Matt", en: "Matte", cs: "Matná", fr: "Mate", it: "Opaca" },
  },
];
const baubleOptionLabels = {
  de: { variant: "Ausführung", material: "Material", glass: "Glas", wood: "Holz", color: "Farbe", surface: "Oberfläche" },
  en: { variant: "Style", material: "Material", glass: "Glass", wood: "Wood", color: "Colour", surface: "Finish" },
  cs: { variant: "Provedení", material: "Materiál", glass: "Sklo", wood: "Dřevo", color: "Barva", surface: "Povrch" },
  fr: { variant: "Modèle", material: "Matériau", glass: "Verre", wood: "Bois", color: "Couleur", surface: "Finition" },
  it: { variant: "Modello", material: "Materiale", glass: "Vetro", wood: "Legno", color: "Colore", surface: "Finitura" },
} satisfies Record<LanguageCode, { variant: string; material: string; glass: string; wood: string; color: string; surface: string }>;

type PageView = "home" | "products" | "product" | "cart" | "checkout" | "terms";
type LegalPage = "agb" | "datenschutz" | "cookies" | "impressum";
type SwissShippingMethod = "economy" | "priority" | "pickup";
type SwissPostLocation = {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
};

type RouteState = {
  view: PageView;
  productId?: string;
  baubleVariantId?: string;
  legalPage?: LegalPage;
};

function productHref(productId: string) {
  return `/produkt/${productId}`;
}

function parseRoute(pathname: string): RouteState {
  const [firstSegment, secondSegment] = pathname.split("/").filter(Boolean);

  if (firstSegment === "produkt" && secondSegment && products.some((product) => product.id === secondSegment)) {
    return {
      view: "product",
      productId: baubleProductIds.includes(secondSegment) ? BAUBLE_PRODUCT_ID : secondSegment,
      baubleVariantId: baubleProductIds.includes(secondSegment) ? secondSegment : undefined,
    };
  }

  if (firstSegment === "kosik") {
    return { view: "cart" };
  }

  if (firstSegment === "pokladna") {
    return { view: "checkout" };
  }

  if (firstSegment === "produkty") {
    return { view: "products" };
  }

  if (["agb", "datenschutz", "cookies", "impressum"].includes(firstSegment ?? "")) {
    return { view: "terms", legalPage: firstSegment as LegalPage };
  }

  return { view: "home" };
}

function getInitialRoute(initialPath = "/"): RouteState {
  if (typeof window === "undefined") {
    return parseRoute(initialPath);
  }

  return parseRoute(window.location.pathname);
}

function getInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return "de";
  }

  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLanguage && languages.some((option) => option.code === storedLanguage)
      ? (storedLanguage as LanguageCode)
      : "de";
  } catch {
    return "de";
  }
}

type CartItem = {
  id: number;
  productId: string;
  baubleVariantId?: string;
  baubleMaterial?: "glass" | "wood";
  customText: string;
  finishId: string;
  logoId: string;
  backEngravingText?: string;
  giftWrap?: boolean;
  quantity: number;
  price: number;
};

function formatPrice(value: number) {
  return `CHF ${value.toFixed(2)}`;
}

function getProduct(productId: string) {
  const canonicalProductId = baubleProductIds.includes(productId) ? BAUBLE_PRODUCT_ID : productId;
  return products.find((product) => product.id === canonicalProductId) ?? products[0];
}

function getBaubleVariant(variantId: string) {
  return baubleVariants.find((variant) => variant.id === variantId) ?? baubleVariants[0];
}

function getLogo(logoId: string) {
  return logoOptions.find((logo) => logo.id === logoId) ?? logoOptions[0];
}

function getFinish(productId: string, finishId: string) {
  const product = getProduct(productId);
  return product.finishes.find((finish) => finish.id === finishId) ?? product.finishes[0];
}

function getBackEngravingOptions(product: Product) {
  return product.backEngravingOptions ?? [];
}

function getLocalizedBackEngravingId(
  options: BackEngravingOption[],
  language: LanguageCode,
) {
  return (
    options.find((option) => option.id === christmasBackEngravingByLanguage[language])
      ?.id ?? options[0]?.id ?? ""
  );
}

function getDefaultBackEngravingId(
  productId: string,
  language: LanguageCode = "de",
  baubleVariantId?: string,
) {
  const options =
    productId === BAUBLE_PRODUCT_ID && baubleVariantId
      ? getBaubleVariant(baubleVariantId).backEngravingOptions ?? []
      : getBackEngravingOptions(getProduct(productId));
  return getLocalizedBackEngravingId(options, language);
}

function getCartItemUnitPrice(item: CartItem) {
  const product = getProduct(item.productId);
  const basePrice = baubleProductIds.includes(item.productId)
    ? getBaubleVariant(item.baubleVariantId ?? item.productId).price
    : product.price;
  return basePrice + (item.giftWrap && product.supportsGiftWrap ? GIFT_WRAP_PRICE : 0);
}

function isValidCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<CartItem>;
  const product = products.find((candidate) => candidate.id === item.productId);
  if (!product || !Number.isSafeInteger(item.id) || (item.id ?? 0) < 1) return false;
  if (typeof item.customText !== "string" || Array.from(item.customText.normalize("NFC")).length > TEXT_LIMIT) return false;
  if (!Number.isInteger(item.quantity) || (item.quantity ?? 0) < 1 || (item.quantity ?? 0) > 12) return false;
  if (!product.finishes.some((finish) => finish.id === item.finishId)) return false;
  if (!logoOptions.some((logo) => logo.id === item.logoId)) return false;
  if (item.giftWrap !== undefined && typeof item.giftWrap !== "boolean") return false;
  if (item.giftWrap && !product.supportsGiftWrap) return false;
  if (baubleProductIds.includes(product.id)) {
    const variant = baubleVariants.find((candidate) => candidate.id === item.baubleVariantId);
    if (!variant) return false;
    if (item.baubleMaterial !== undefined && item.baubleMaterial !== "glass" && item.baubleMaterial !== "wood") return false;
    if (item.backEngravingText && !variant.backEngravingOptions?.some((option) => option.text === item.backEngravingText)) return false;
  } else if (item.baubleVariantId || item.baubleMaterial || (item.backEngravingText && !product.backEngravingOptions?.some((option) => option.text === item.backEngravingText))) {
    return false;
  }
  return true;
}

type HomeProps = {
  initialPath?: string;
};

export default function Home({ initialPath = "/" }: HomeProps = {}) {
  const initialRoute = getInitialRoute(initialPath);
  const initialProductId = initialRoute.productId ?? products[0].id;
  const [language, setLanguage] = useState<LanguageCode>("de");
  const [currentView, setCurrentView] = useState<PageView>(() => initialRoute.view);
  const [legalPage, setLegalPage] = useState<LegalPage>(() => initialRoute.legalPage ?? "agb");
  const [selectedProductId, setSelectedProductId] = useState(() => initialProductId);
  const [selectedBaubleVariantId, setSelectedBaubleVariantId] = useState(
    () => initialRoute.baubleVariantId ?? BAUBLE_PRODUCT_ID,
  );
  const [selectedPhotoId, setSelectedPhotoId] = useState(
    () => getProduct(initialProductId).photos[0].id,
  );
  const [selectedFinishId, setSelectedFinishId] = useState(
    () => getProduct(initialProductId).finishes[0].id,
  );
  const [selectedBaubleMaterial, setSelectedBaubleMaterial] = useState<"glass" | "wood" | "">("");
  const [baubleMaterialError, setBaubleMaterialError] = useState(false);
  const [customText, setCustomText] = useState("Mila");
  const [selectedLogoId, setSelectedLogoId] = useState(logoOptions[0].id);
  const [selectedBackEngravingId, setSelectedBackEngravingId] = useState(() =>
    getDefaultBackEngravingId(
      initialProductId,
      "de",
      initialRoute.baubleVariantId,
    ),
  );
  const [selectedGiftWrap, setSelectedGiftWrap] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [legalAcknowledged, setLegalAcknowledged] = useState(false);
  const [showCartChoice, setShowCartChoice] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<SwissShippingMethod>("economy");
  const [pickupLocation, setPickupLocation] = useState("");
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<SwissPostLocation | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<SwissPostLocation[]>([]);
  const [pickupSearchStatus, setPickupSearchStatus] = useState<"idle" | "loading" | "ready" | "empty" | "error">("idle");
  const [pickupSelectionError, setPickupSelectionError] = useState(false);
  const [accountAuthClient, setAccountAuthClient] =
    useState<SupabaseClient | null>(null);
  const [accountStatus, setAccountStatus] = useState<
    "loading" | "ready" | "unconfigured" | "sending" | "sent" | "error"
  >("loading");
  const [accountMessage, setAccountMessage] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [accountRetryCount, setAccountRetryCount] = useState(0);
  const accountDialogRef = useRef<HTMLDialogElement>(null);
  const photoDialogRef = useRef<HTMLDialogElement>(null);
  const languageMenuRef = useRef<HTMLDetailsElement>(null);
  const backEngravingMenuRef = useRef<HTMLDetailsElement>(null);

  const t = ui[language];
  const account = accountCopy[language];
  const home = homeCopy[language];
  const holidayMessage = {
    de: "Mit Liebe graviert · Das persönlichste Geschenk unter dem Weihnachtsbaum",
    en: "Engraved with care · A personal gift for under the Christmas tree",
    cs: "S láskou gravírováno · Osobní dárek pod každý vánoční stromeček",
    fr: "Gravé avec soin · Un cadeau personnel sous le sapin",
    it: "Inciso con cura · Un regalo personale sotto l’albero",
  }[language];
  const flow = flowCopy[language];
  const legalTitle = legalPage === "agb"
    ? legalCopy[language].agbTitle
    : legalPage === "datenschutz"
      ? legalCopy[language].privacyTitle
      : legalCopy[language][`${legalPage}Title`];
  const legalSections = legalPage === "impressum"
    ? [{ heading: legalTitle, points: [legalCopy[language].incomplete] }]
    : detailedLegalCopy[language][legalPage];
  const legalNotice = legalPage === "impressum" ? "" : detailedLegalCopy[language].notice;
  const selectedProduct = getProduct(selectedProductId);
  const selectedProductCopy = selectedProduct.translations[language];
  const isBaubleProduct = selectedProduct.id === BAUBLE_PRODUCT_ID;
  const selectedBaubleVariant = getBaubleVariant(selectedBaubleVariantId);
  const selectedProductSupportsGiftWrap = selectedProduct.supportsGiftWrap === true;
  const configuredProductPrice = isBaubleProduct
    ? selectedBaubleVariant.price
    : selectedProduct.price;
  const configuredUnitPrice =
    configuredProductPrice +
    (selectedProductSupportsGiftWrap && selectedGiftWrap ? GIFT_WRAP_PRICE : 0);
  const selectedPhoto =
    selectedProduct.photos.find((photo) => photo.id === selectedPhotoId) ??
    selectedProduct.photos[0];
  const selectedFinish =
    selectedProduct.finishes.find((finish) => finish.id === selectedFinishId) ??
    selectedProduct.finishes[0];
  const backEngravingOptions = isBaubleProduct
    ? selectedBaubleVariant.backEngravingOptions ?? []
    : getBackEngravingOptions(selectedProduct);
  const selectedBackEngraving =
    backEngravingOptions.find((option) => option.id === selectedBackEngravingId) ??
    backEngravingOptions[0];
  const selectedLogo = getLogo(selectedLogoId);
  const previewText = customText.trim() || t.previewFallback;
  const previewNameSize =
    previewText.length > 10 ? "0.9rem" : previewText.length > 7 ? "1.04rem" : "1.18rem";
  const backPreviewNameSize =
    selectedBackEngraving && selectedBackEngraving.text.length > 18
      ? "0.62rem"
      : selectedBackEngraving && selectedBackEngraving.text.length > 14
        ? "0.72rem"
        : "0.8rem";

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + getCartItemUnitPrice(item) * item.quantity, 0),
    [cartItems],
  );
  const cartQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  useEffect(() => {
    const storedLanguage = getInitialLanguage();
    if (storedLanguage !== language) {
      setLanguage(storedLanguage);
      setSelectedBackEngravingId(
        getDefaultBackEngravingId(
          selectedProductId,
          storedLanguage,
          selectedBaubleVariantId,
        ),
      );
    }
  }, []);

  useEffect(() => {
    setSelectedBackEngravingId(
      getDefaultBackEngravingId(
        selectedProductId,
        language,
        selectedBaubleVariantId,
      ),
    );
  }, [language]);

  useEffect(() => {
    function closeMenusOutside(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!languageMenuRef.current?.contains(target)) {
        languageMenuRef.current?.removeAttribute("open");
      }
      if (!backEngravingMenuRef.current?.contains(target)) {
        backEngravingMenuRef.current?.removeAttribute("open");
      }
    }

    document.addEventListener("pointerdown", closeMenusOutside);
    return () => document.removeEventListener("pointerdown", closeMenusOutside);
  }, []);

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
            ? `${legalTitle} | ${BRAND_NAME}`
            : t.pageTitle;
  }, [
    currentView,
    legalPage,
    language,
    selectedProductCopy.name,
    t.assortmentTitle,
    t.cartTitle,
    t.pageTitle,
    t.termsTitle,
    legalTitle,
  ]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Language selection remains active for the current page view.
    }
  }, [language]);

  useEffect(() => {
    const query = pickupLocation.trim();
    if (
      currentView !== "checkout" ||
      shippingMethod !== "pickup" ||
      query.length < 2 ||
      selectedPickupLocation?.name === pickupLocation
    ) {
      setPickupSuggestions([]);
      setPickupSearchStatus("idle");
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setPickupSearchStatus("loading");
      try {
        const searchLanguage = language === "cs" ? "de" : language;
        const params = new URLSearchParams({ q: query, lang: searchLanguage });
        const response = await fetch(`/api/post-locations?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Swiss Post lookup failed");
        const result = (await response.json()) as { locations?: SwissPostLocation[] };
        const locations = result.locations ?? [];
        setPickupSuggestions(locations);
        setPickupSearchStatus(locations.length ? "ready" : "empty");
      } catch {
        if (!controller.signal.aborted) {
          setPickupSuggestions([]);
          setPickupSearchStatus("error");
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [currentView, language, pickupLocation, selectedPickupLocation?.name, shippingMethod]);

  useEffect(() => {
    let isActive = true;
    let unsubscribe: (() => void) | undefined;

    async function initializeAccountAuth() {
      try {
        const client = await loadAccountAuthClient();
        if (!isActive) return;
        if (!client) {
          setAccountStatus("unconfigured");
          return;
        }

        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        if (!isActive) return;

        setAccountAuthClient(client);
        setSignedInEmail(data.session?.user.email ?? null);
        setAccountStatus("ready");

        const { data: authState } = client.auth.onAuthStateChange((_event, session) => {
          if (isActive) {
            setSignedInEmail(session?.user.email ?? null);
            setAccountStatus("ready");
            setAccountMessage("");
          }
        });
        unsubscribe = () => authState.subscription.unsubscribe();
      } catch (error) {
        if (!isActive) return;
        setAccountStatus("error");
        setAccountMessage(
          error instanceof Error ? error.message : "Unknown authentication error.",
        );
      }
    }

    void initializeAccountAuth();

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, [accountRetryCount]);

  useEffect(() => {
    const dialog = accountDialogRef.current;
    if (!dialog) return;
    if (showAccountDialog && !dialog.open) dialog.showModal();
    if (!showAccountDialog && dialog.open) dialog.close();
  }, [showAccountDialog]);

  useEffect(() => {
    try {
      const storedCart =
        window.localStorage.getItem(CART_STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart) as CartItem[];
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart.filter(isValidCartItem));
        }
      }
    } catch {
      try {
        window.localStorage.removeItem(CART_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
      } catch {
        // Keep the in-memory cart usable when browser storage is unavailable.
      }
    } finally {
      setCartHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!cartHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      // The current session still works if persistent browser storage is blocked.
    }
  }, [cartHydrated, cartItems]);

  useEffect(() => {
    function syncRoute() {
      const route = parseRoute(window.location.pathname);
      closeLanguageMenu();
      setCurrentView(route.view);
      setLegalPage(route.legalPage ?? "agb");
      setShowCartChoice(false);

      if (route.productId) {
        applyProductSelection(route.productId, route.baubleVariantId);
      }
    }

    window.addEventListener("popstate", syncRoute);
    syncRoute();

    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  function applyProductSelection(productId: string, baubleVariantId?: string) {
    const nextProduct = getProduct(productId);
    setSelectedProductId(nextProduct.id);
    setSelectedPhotoId(nextProduct.photos[0].id);
    setSelectedFinishId(nextProduct.finishes[0].id);
    const nextBaubleVariantId = nextProduct.id === BAUBLE_PRODUCT_ID
      ? getBaubleVariant(baubleVariantId ?? BAUBLE_PRODUCT_ID).id
      : BAUBLE_PRODUCT_ID;
    setSelectedBaubleVariantId(nextBaubleVariantId);
    setSelectedBaubleMaterial("");
    setBaubleMaterialError(false);
    const nextBackEngravingOptions = nextProduct.id === BAUBLE_PRODUCT_ID
      ? getBaubleVariant(nextBaubleVariantId).backEngravingOptions ?? []
      : getBackEngravingOptions(nextProduct);
    setSelectedBackEngravingId(
      getLocalizedBackEngravingId(nextBackEngravingOptions, language),
    );
    setSelectedGiftWrap(false);
    setCustomText("Mila");
  }

  function scrollToPageTop() {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function closeLanguageMenu() {
    languageMenuRef.current?.removeAttribute("open");
  }

  async function requestAccountSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accountAuthClient) return;

    setAccountStatus("sending");
    setAccountMessage("");
    try {
      const { error } = await accountAuthClient.auth.signInWithOtp({
        email: accountEmail.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setAccountStatus("sent");
      setAccountMessage(account.success);
    } catch (error) {
      setAccountStatus("error");
      setAccountMessage(
        error instanceof Error ? error.message : "Unknown authentication error.",
      );
    }
  }

  async function signOutAccount() {
    if (!accountAuthClient) return;

    try {
      const { error } = await accountAuthClient.auth.signOut();
      if (error) throw error;
      setSignedInEmail(null);
      setAccountStatus("ready");
      setAccountMessage(account.signedOut);
    } catch (error) {
      setAccountStatus("error");
      setAccountMessage(
        error instanceof Error ? error.message : "Unknown authentication error.",
      );
    }
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
    closeLanguageMenu();
    setCurrentView("home");
    setShowCartChoice(false);
    window.history.pushState(null, "", sectionId ? `/#${sectionId}` : "/");

    if (sectionId) {
      scrollToSection(sectionId);
    } else {
      scrollToPageTop();
    }
  }

  function navigateProducts() {
    closeLanguageMenu();
    setCurrentView("products");
    setShowCartChoice(false);
    window.history.pushState(null, "", "/produkty");
    scrollToPageTop();
  }

  function navigateCart(sectionId?: string) {
    closeLanguageMenu();
    setCurrentView("cart");
    setShowCartChoice(false);
    window.history.pushState(null, "", sectionId ? `/kosik#${sectionId}` : "/kosik");

    if (sectionId) {
      scrollToSection(sectionId);
    } else {
      scrollToPageTop();
    }
  }

  function navigateCheckout() {
    closeLanguageMenu();
    setCurrentView("checkout");
    window.history.pushState(null, "", "/pokladna");
    scrollToPageTop();
  }

  function navigateTerms(page: LegalPage = "agb") {
    closeLanguageMenu();
    setCurrentView("terms");
    setLegalPage(page);
    setShowCartChoice(false);
    window.history.pushState(null, "", `/${page}`);
    scrollToPageTop();
  }

  function selectProduct(productId: string) {
    closeLanguageMenu();
    applyProductSelection(productId);
    setCurrentView("product");
    setShowCartChoice(false);
    window.history.pushState(null, "", productHref(productId));
    scrollToPageTop();
  }

  function selectBaubleVariant(variantId: string) {
    const variant = getBaubleVariant(variantId);
    setSelectedBaubleVariantId(variant.id);
    setSelectedBackEngravingId(
      getLocalizedBackEngravingId(variant.backEngravingOptions ?? [], language),
    );
  }

  function addToCart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customText.trim()) {
      setCustomText("");
      document.getElementById("custom-text")?.focus();
      return;
    }
    if (isBaubleProduct && !selectedBaubleMaterial) {
      setBaubleMaterialError(true);
      document.getElementById("bauble-material-label")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setCartItems((items) => [
      ...items,
      {
        id: Math.max(Date.now(), ...items.map((item) => item.id + 1)),
        productId: selectedProduct.id,
        baubleVariantId: isBaubleProduct ? selectedBaubleVariant.id : undefined,
        baubleMaterial: isBaubleProduct ? selectedBaubleMaterial : undefined,
        customText: customText.trim().normalize("NFC"),
        finishId: selectedFinish.id,
        logoId: selectedLogo.id,
        backEngravingText: selectedBackEngraving?.text,
        giftWrap: selectedProductSupportsGiftWrap && selectedGiftWrap,
        quantity,
        price: configuredProductPrice,
      },
    ]);
    setShowCartChoice(true);
  }

  function prepareCheckout() {
    navigateCheckout();
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
          <strong>{formatPrice(product.price)}</strong>
        </div>
      </button>
    );
  }

  function changeSelectedPhoto(direction: -1 | 1) {
    const photos = selectedProduct.photos;
    const currentIndex = photos.findIndex((photo) => photo.id === selectedPhoto.id);
    const nextIndex = (currentIndex + direction + photos.length) % photos.length;
    setSelectedPhotoId(photos[nextIndex].id);
  }

  return (
    <div className={`shop-shell view-${currentView}`}>
      <div className="holiday-ribbon" aria-label={holidayMessage}>
        <span aria-hidden="true">✳</span> {holidayMessage} <span aria-hidden="true">✳</span>
      </div>
      <header className="shop-header">
        <Link
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
        </Link>
        <div className="header-actions">
          <button
            className="account-shortcut"
            type="button"
            aria-label={account.account}
            title={account.account}
            aria-haspopup="dialog"
            aria-expanded={showAccountDialog}
            onClick={() => {
              closeLanguageMenu();
              setShowAccountDialog(true);
            }}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
          <details className="language-menu" ref={languageMenuRef}>
            <summary aria-label={t.languageLabel}>
              <span>{language.toUpperCase()}</span>
            </summary>
            <div className="language-options">
              {languages.map((option) => (
                <button
                  className={language === option.code ? "selected" : ""}
                  key={option.code}
                  type="button"
                  aria-pressed={language === option.code}
                  onClick={() => {
                    setLanguage(option.code);
                    setSelectedBackEngravingId(
                      getLocalizedBackEngravingId(backEngravingOptions, option.code),
                    );
                    closeLanguageMenu();
                  }}
                >
                  {option.label} — {option.name}
                </button>
              ))}
            </div>
          </details>
          <Link
            className="header-cart"
            href="/kosik"
            aria-label={cartQuantity > 0 ? `${t.cartTitle} (${cartQuantity})` : t.cartTitle}
            title={t.cartTitle}
            onClick={(event) => {
              event.preventDefault();
              navigateCart();
            }}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M3 4h2l2.1 11.1a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 1.9-1.4L21 8H6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
              <circle cx="9.5" cy="20" r="1.2" fill="currentColor" />
              <circle cx="18" cy="20" r="1.2" fill="currentColor" />
            </svg>
            {cartQuantity > 0 && <span className="header-cart-count">{cartQuantity}</span>}
          </Link>
        </div>
      </header>

      {showAccountDialog && (
        <dialog
          className="account-dialog"
          ref={accountDialogRef}
          aria-labelledby="account-dialog-title"
          onCancel={(event) => {
            event.preventDefault();
            setShowAccountDialog(false);
          }}
          onClose={() => setShowAccountDialog(false)}
        >
          <button
            className="account-dialog-close"
            type="button"
            aria-label={account.close}
            onClick={() => setShowAccountDialog(false)}
          >
            ×
          </button>
          <p className="section-kicker">{account.account}</p>
          <h2 id="account-dialog-title">{account.heading}</h2>
          {signedInEmail ? (
            <div className="account-signed-in">
              <p>{account.signedInAs}</p>
              <strong>{signedInEmail}</strong>
              <button className="secondary-button" type="button" onClick={() => void signOutAccount()}>
                {account.signOut}
              </button>
            </div>
          ) : (
            <>
              <p className="account-description">{account.description}</p>
              {accountAuthClient && (
                <form
                  className="account-form"
                  onSubmit={(event) => void requestAccountSignIn(event)}
                >
                  <label htmlFor="account-email">{account.email}</label>
                  <input
                    id="account-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={accountEmail}
                    onChange={(event) => setAccountEmail(event.target.value)}
                  />
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={accountStatus === "sending"}
                  >
                    {accountStatus === "sending" ? account.sending : account.sendLink}
                  </button>
                </form>
              )}
              {accountStatus === "loading" && (
                <p className="account-status" role="status">{account.loading}</p>
              )}
              {accountStatus === "unconfigured" && (
                <p className="account-status" role="status">{account.notConfigured}</p>
              )}
              {accountStatus === "sent" && (
                <p className="account-status" role="status">{accountMessage || account.emailSent}</p>
              )}
              {accountStatus === "error" && (
                <div className="account-error" role="alert">
                  <p>{account.error}: {accountMessage}</p>
                  {!accountAuthClient && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => {
                        setAccountStatus("loading");
                        setAccountRetryCount((count) => count + 1);
                      }}
                    >
                      {account.retry}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {accountStatus === "error" && signedInEmail && (
            <p className="account-error" role="alert">{account.error}: {accountMessage}</p>
          )}
          {accountStatus === "ready" && accountMessage && (
            <p className="account-status" role="status">{accountMessage}</p>
          )}
        </dialog>
      )}

      <main>
        {currentView === "home" && (
          <>
            <section
              className="home-hero"
              id="start"
              aria-labelledby="home-title"
              style={
                {
                  "--hero-image": "url('/products/christmas-baubles-wrapped.jpeg')",
                } as CSSProperties
              }
            >
              <div className="home-hero-copy">
                <p className="section-kicker">{home.eyebrow}</p>
                <h1 id="home-title">{home.title}</h1>
                <p>{home.lead}</p>
                <div className="hero-actions">
                  <Link
                    className="hero-primary"
                    href={productHref(products[0].id)}
                    onClick={(event) => {
                      event.preventDefault();
                      selectProduct(products[0].id);
                    }}
                  >
                    {home.primaryCta}
                  </Link>
                  <Link
                    className="hero-secondary"
                    href="/produkty"
                    onClick={(event) => {
                      event.preventDefault();
                      navigateProducts();
                    }}
                  >
                    {home.secondaryCta}
                  </Link>
                </div>
                <div className="hero-highlights" aria-label={home.galleryLabel}>
                  {home.highlights.map((highlight) => (
                    <span key={highlight}>{highlight}</span>
                  ))}
                </div>
              </div>
            </section>

            <section className="intro-gallery" id="produkte" aria-label={home.galleryLabel}>
              {introProductIds.map((productId) => {
                const product = getProduct(productId);
                const productCopy = product.translations[language];
                const mainPhoto = product.photos[0];

                return (
                  <button
                    className="intro-photo"
                    key={productId}
                    type="button"
                    onClick={() => selectProduct(product.id)}
                  >
                    <img src={mainPhoto.src} alt={productCopy.name} />
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
              <Link
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  navigateHome();
                }}
              >
                {flow.backHome}
              </Link>
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
                {availableProducts.map((product) => {
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
                          {formatPrice(product.price)}
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
            <div className="page-toolbar product-toolbar">
              <Link
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  navigateHome();
                }}
              >
                {flow.backHome}
              </Link>
            </div>

            <section className="product-section" id="produkt" aria-labelledby="product-title">
              <div className="gallery-column">
                <button
                  className="product-photo-open"
                  type="button"
                  aria-label={t.enlargePhoto}
                  onClick={() => photoDialogRef.current?.showModal()}
                >
                  <span className="product-photo-frame">
                    <img
                      src={selectedPhoto.src}
                      alt={selectedPhoto.alt[language]}
                    />
                  </span>
                </button>
                <div className="preview-row" aria-label={t.previewLabel}>
                  <div
                    className={`preview-stack ${
                      selectedBackEngraving ? "preview-stack-double" : ""
                    }`}
                  >
                    <div className={`engraving-card ${selectedProduct.previewClass}`}>
                      <span className="preview-logo">{selectedLogo.mark}</span>
                      <span className="preview-name" style={{ fontSize: previewNameSize }}>
                        {previewText}
                      </span>
                      <span className="preview-motif">{selectedLogo.label[language]}</span>
                    </div>
                    {selectedBackEngraving && (
                      <div className={`engraving-card ${selectedProduct.previewClass} reverse-card`}>
                        <span
                          className="preview-name"
                          style={{ fontSize: backPreviewNameSize }}
                        >
                          {selectedBackEngraving.text}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <strong>{selectedProductCopy.personalization}</strong>
                    <span>
                      {selectedFinish.label[language]} / {selectedLogo.label[language]}
                    </span>
                    {selectedBackEngraving && (
                      <span>
                        {t.backEngravingLabel}: {selectedBackEngraving.text}
                      </span>
                    )}
                  </div>
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
                <dialog
                  className={`photo-dialog ${selectedProduct.id === BAUBLE_PRODUCT_ID ? "photo-dialog-festive" : ""}`}
                  ref={photoDialogRef}
                  aria-label={selectedProductCopy.name}
                  onCancel={(event) => {
                    event.preventDefault();
                    event.currentTarget.close();
                  }}
                  onClick={(event) => {
                    if (event.target === event.currentTarget) event.currentTarget.close();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      event.currentTarget.close();
                    } else if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      changeSelectedPhoto(-1);
                    } else if (event.key === "ArrowRight") {
                      event.preventDefault();
                      changeSelectedPhoto(1);
                    }
                  }}
                >
                  <button
                    className="photo-dialog-close"
                    type="button"
                    aria-label={t.closePhoto}
                    onClick={() => photoDialogRef.current?.close()}
                  >
                    ×
                  </button>
                  <div className="photo-lightbox-view">
                    <button
                      className="photo-lightbox-arrow"
                      type="button"
                      aria-label={t.previousPhoto}
                      onClick={() => changeSelectedPhoto(-1)}
                    >
                      ‹
                    </button>
                    <img src={selectedPhoto.src} alt={selectedPhoto.alt[language]} />
                    <button
                      className="photo-lightbox-arrow"
                      type="button"
                      aria-label={t.nextPhoto}
                      onClick={() => changeSelectedPhoto(1)}
                    >
                      ›
                    </button>
                  </div>
                  <div className="photo-lightbox-thumbs" aria-label={t.detailPhoto}>
                    {selectedProduct.photos.map((photo) => (
                      <button
                        className={`thumb-button ${selectedPhoto.id === photo.id ? "active" : ""}`}
                        key={photo.id}
                        type="button"
                        aria-label={photo.alt[language]}
                        aria-pressed={selectedPhoto.id === photo.id}
                        onClick={() => setSelectedPhotoId(photo.id)}
                      >
                        <img src={photo.src} alt="" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </dialog>
              </div>

              <div className="purchase-panel">
                <p className="breadcrumbs">{t.breadcrumbs}</p>
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
                  <span className="price">{formatPrice(configuredUnitPrice)}</span>
                  <span className="tax-note">{t.taxNote}</span>
                </div>

                <form className="configurator" onSubmit={addToCart}>
                  {isBaubleProduct && (
                    <>
                      <div className="field-group">
                        <span>{baubleOptionLabels[language].variant}</span>
                        <div
                          className="phrase-grid"
                          role="radiogroup"
                          aria-label={baubleOptionLabels[language].variant}
                        >
                          {baubleVariants.map((variant) => (
                            <button
                              className={`phrase-option ${
                                selectedBaubleVariant.id === variant.id ? "selected" : ""
                              }`}
                              key={variant.id}
                              type="button"
                              aria-pressed={selectedBaubleVariant.id === variant.id}
                              onClick={() => selectBaubleVariant(variant.id)}
                            >
                              {variant.label[language]} · {formatPrice(variant.price)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="field-group">
                        <span id="bauble-material-label">{baubleOptionLabels[language].material} <b className="required-mark" aria-hidden="true">*</b></span>
                        <div className="phrase-grid" role="radiogroup" aria-labelledby="bauble-material-label" aria-describedby={baubleMaterialError ? "bauble-material-error" : undefined} aria-invalid={baubleMaterialError || undefined}>
                          {(["glass", "wood"] as const).map((material) => (
                            <button
                              className={`phrase-option ${selectedBaubleMaterial === material ? "selected" : ""}`}
                              key={material}
                              type="button"
                              role="radio"
                              aria-checked={selectedBaubleMaterial === material}
                              onClick={() => { setSelectedBaubleMaterial(material); setBaubleMaterialError(false); }}
                            >
                              {baubleOptionLabels[language][material]}
                            </button>
                          ))}
                        </div>
                        {baubleMaterialError && <small className="field-error" id="bauble-material-error" role="alert">{t.baubleMaterialRequired}</small>}
                      </div>
                      <div className="field-group">
                        <span>{baubleOptionLabels[language].color}</span>
                        <div
                          className="color-grid"
                          role="radiogroup"
                          aria-label={baubleOptionLabels[language].color}
                        >
                          {baubleColors.map((color) => (
                            <button
                              className={`color-option ${
                                selectedFinish.id.startsWith(`${color.id}-`) ? "selected" : ""
                              }`}
                              key={color.id}
                              type="button"
                              aria-pressed={selectedFinish.id.startsWith(`${color.id}-`)}
                              onClick={() => {
                                const surfaceId = selectedFinish.id.endsWith("-mat") ? "mat" : "glanz";
                                setSelectedFinishId(`${color.id}-${surfaceId}`);
                              }}
                            >
                              <span
                                className="swatch"
                                style={
                                  {
                                    "--swatch": color.hex,
                                    "--swatch-edge": color.edge,
                                  } as CSSProperties
                                }
                              />
                              <span>{color.label[language]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="field-group">
                        <span>{baubleOptionLabels[language].surface}</span>
                        <div
                          className="phrase-grid"
                          role="radiogroup"
                          aria-label={baubleOptionLabels[language].surface}
                        >
                          {baubleSurfaces.map((surface) => {
                            const selected = selectedFinish.id.endsWith(`-${surface.id}`);
                            return (
                              <button
                                className={`phrase-option ${selected ? "selected" : ""}`}
                                key={surface.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => {
                                  const colorId = selectedFinish.id.slice(
                                    0,
                                    selectedFinish.id.lastIndexOf("-"),
                                  );
                                  setSelectedFinishId(`${colorId}-${surface.id}`);
                                }}
                              >
                                {surface.label[language]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <label className="field-group" htmlFor="custom-text">
                    <span>{t.customTextLabel}</span>
                    <input
                      id="custom-text"
                      maxLength={TEXT_LIMIT}
                      required
                      value={customText}
                      onChange={(event) => setCustomText(Array.from(event.target.value.normalize("NFC")).slice(0, TEXT_LIMIT).join(""))}
                      placeholder={t.customTextPlaceholder}
                    />
                  </label>

                  {!isBaubleProduct && (
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
                  )}

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

                  {backEngravingOptions.length > 0 && (
                    <div className="field-group">
                      <span>{t.backEngravingLabel}</span>
                      <details
                        className="language-menu engraving-menu"
                        ref={backEngravingMenuRef}
                      >
                        <summary aria-label={t.backEngravingLabel}>
                          <span>{selectedBackEngraving?.text}</span>
                        </summary>
                        <div className="language-options">
                        {backEngravingOptions.map((option) => (
                          <button
                            className={
                              selectedBackEngraving?.id === option.id ? "selected" : ""
                            }
                            key={option.id}
                            type="button"
                            aria-pressed={selectedBackEngraving?.id === option.id}
                            onClick={() => {
                              setSelectedBackEngravingId(option.id);
                              backEngravingMenuRef.current?.removeAttribute("open");
                            }}
                          >
                            {option.text}
                          </button>
                        ))}
                        </div>
                      </details>
                    </div>
                  )}

                  {selectedProductSupportsGiftWrap && (
                    <label className="option-check">
                      <input
                        type="checkbox"
                        checked={selectedGiftWrap}
                        onChange={(event) => setSelectedGiftWrap(event.target.checked)}
                      />
                      <span>
                        <strong>{t.giftWrapLabel}</strong>
                        {t.giftWrapPriceNote}
                      </span>
                    </label>
                  )}

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
                {availableProducts
                  .filter((product) => product.id !== selectedProduct.id)
                  .map((product) => renderProductCard(product))}
              </div>
            </section>
          </>
        )}

        {currentView === "cart" && (
          <>
            <div className="page-toolbar cart-toolbar">
              <Link
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  navigateHome();
                }}
              >
                {flow.backHome}
              </Link>
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
                      const baubleVariant = baubleProductIds.includes(item.productId)
                        ? getBaubleVariant(item.baubleVariantId ?? item.productId)
                        : undefined;

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
                            {baubleVariant && (
                              <span>{baubleVariant.label[language]}</span>
                            )}
                            {baubleVariant && item.baubleMaterial && (
                              <span>{baubleOptionLabels[language].material}: {baubleOptionLabels[language][item.baubleMaterial]}</span>
                            )}
                            {baubleVariant && !item.baubleMaterial && <span className="field-error">{t.cartMaterialMissing}</span>}
                            <span>
                              {item.customText} / {logo.label[language]} /{" "}
                              {finish.label[language]}
                            </span>
                            {item.backEngravingText && (
                              <span>
                                {t.backEngravingLabel}: {item.backEngravingText}
                              </span>
                            )}
                            {item.giftWrap && (
                              <span>
                                {t.giftWrapCartLabel}: {formatPrice(GIFT_WRAP_PRICE)}
                              </span>
                            )}
                          </div>
                          <div className="cart-line-quantity">
                            <div className="stepper" aria-label={t.quantity}>
                              <button
                                type="button"
                                aria-label={t.decreaseQuantity}
                                disabled={item.quantity <= 1}
                                onClick={() => setCartItems((items) => items.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity - 1 } : entry))}
                              >−</button>
                              <output aria-live="polite">{item.quantity}</output>
                              <button
                                type="button"
                                aria-label={t.increaseQuantity}
                                disabled={item.quantity >= 12}
                                onClick={() => setCartItems((items) => items.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry))}
                              >+</button>
                            </div>
                            <strong>{formatPrice(item.quantity * getCartItemUnitPrice(item))}</strong>
                          </div>
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
                  <strong className="checkout-total">{formatPrice(cartTotal)}</strong>
                  <p>{flow.checkoutNote}</p>
                  <label className="legal-acknowledgement">
                    <input
                      type="checkbox"
                      checked={legalAcknowledged}
                      onChange={(event) => setLegalAcknowledged(event.target.checked)}
                      disabled={cartItems.length === 0}
                    />
                    <span>
                      {flow.legalAcknowledgement}{"\u00a0"}
                      <Link href="/agb" onClick={(event) => { event.preventDefault(); event.stopPropagation(); navigateTerms("agb"); }}>
                        {flow.termsLinkLabel}
                      </Link>{"\u00a0"}{flow.privacyPrefix}{"\u00a0"}
                      <Link href="/datenschutz" onClick={(event) => { event.preventDefault(); event.stopPropagation(); navigateTerms("datenschutz"); }}>
                        {flow.privacyLinkLabel}
                      </Link>{"\u00a0"}{flow.privacyAcknowledgement}
                    </span>
                  </label>
                  <p className="cart-legal-links">
                    <Link href="/cookies" onClick={(event) => { event.preventDefault(); navigateTerms("cookies"); }}>
                      {flow.cookiesLinkLabel}
                    </Link>
                  </p>
                  <button
                    className="primary-button"
                    type="button"
                    disabled={cartItems.length === 0 || !legalAcknowledged}
                    onClick={prepareCheckout}
                  >
                    {flow.checkoutCta}
                  </button>
                </aside>
              </div>
            </section>

            <section className="products-section" aria-labelledby="cart-more-title">
              <div className="section-heading">
                <p className="section-kicker">{t.assortmentKicker}</p>
                <h2 id="cart-more-title">{flow.otherProducts}</h2>
              </div>
              <div className="product-card-grid">
                {availableProducts.map((product) => renderProductCard(product, selectedProduct.id === product.id))}
              </div>
            </section>
          </>
        )}

        {currentView === "checkout" && (
          <>
            <div className="page-toolbar checkout-toolbar">
              <button type="button" onClick={() => navigateCart()}>
                {checkoutCopy[language].back}
              </button>
            </div>
            <section className="checkout-page" aria-labelledby="checkout-page-title">
              <div className="section-heading checkout-page-heading">
                <div>
                  <p className="section-kicker">{checkoutCopy[language].kicker}</p>
                  <h1 id="checkout-page-title">{checkoutCopy[language].title}</h1>
                </div>
                <p>{checkoutCopy[language].lead}</p>
              </div>
              <div className="checkout-page-grid">
                <form
                  className="checkout-form"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <fieldset className="checkout-fieldset">
                    <legend>{checkoutCopy[language].contact}</legend>
                    <div className="checkout-input-grid">
                      <label><span>{checkoutCopy[language].firstName}<b className="required-mark" aria-hidden="true">*</b></span><input name="given-name" autoComplete="given-name" required /></label>
                      <label><span>{checkoutCopy[language].lastName}<b className="required-mark" aria-hidden="true">*</b></span><input name="family-name" autoComplete="family-name" required /></label>
                      <label><span>{checkoutCopy[language].email}<b className="required-mark" aria-hidden="true">*</b></span><input name="email" type="email" autoComplete="email" required /></label>
                      <label><span>{checkoutCopy[language].phone}<b className="required-mark" aria-hidden="true">*</b></span><input name="tel" type="tel" autoComplete="tel" inputMode="tel" pattern="(?:\\+41|0041|0)[ .()-]?[1-9](?:[ .()-]?[0-9]){8}" title="Use a Swiss number, for example +41 79 123 45 67" placeholder="+41 79 123 45 67" required /></label>
                    </div>
                  </fieldset>
                  <fieldset className="checkout-fieldset">
                    <legend>{checkoutCopy[language].delivery}</legend>
                    <div className="checkout-input-grid">
                      <label className="checkout-input-wide"><span>{checkoutCopy[language].street}<b className="required-mark" aria-hidden="true">*</b></span><input name="address-line1" autoComplete="address-line1" required /></label>
                      <label><span>{checkoutCopy[language].postalCode}<b className="required-mark" aria-hidden="true">*</b></span><input name="postal-code" autoComplete="postal-code" inputMode="numeric" pattern="[1-9][0-9]{3}" minLength={4} maxLength={4} placeholder="8001" required /></label>
                      <label><span>{checkoutCopy[language].city}<b className="required-mark" aria-hidden="true">*</b></span><input name="address-level2" autoComplete="address-level2" required /></label>
                      <label><span>{checkoutCopy[language].country}<b className="required-mark" aria-hidden="true">*</b></span><input value={checkoutCopy[language].switzerland} readOnly /></label>
                    </div>
                  </fieldset>
                  <fieldset className="checkout-fieldset shipping-fieldset">
                    <legend>{checkoutCopy[language].shippingMethod}<b className="required-mark" aria-hidden="true">*</b></legend>
                    <div className="shipping-options">
                      {(["economy", "priority", "pickup"] as const).map((method) => (
                        <label className="shipping-option" aria-label={`${checkoutCopy[language][method]} ${checkoutCopy[language][`${method}Description`]}`} htmlFor={`shipping-${method}`} key={method}>
                          <input
                            id={`shipping-${method}`}
                            type="radio"
                            name="shipping-method"
                            value={method}
                            checked={shippingMethod === method}
                            required
                            onChange={() => {
                              setShippingMethod(method);
                            }}
                          />
                          <span>
                            <strong>{checkoutCopy[language][method]}</strong>
                            <small>{checkoutCopy[language][`${method}Description`]}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                    {shippingMethod === "pickup" && (
                      <div className="pickup-location-field">
                        <label htmlFor="pickup-location">{checkoutCopy[language].pickupLocation}<b className="required-mark" aria-hidden="true">*</b></label>
                        <input
                          id="pickup-location"
                          name="pickup-location"
                          value={pickupLocation}
                          role="combobox"
                          aria-autocomplete="list"
                          aria-expanded={pickupSuggestions.length > 0}
                          aria-controls="pickup-location-options"
                          aria-invalid={pickupSelectionError || undefined}
                          onChange={(event) => {
                            setPickupLocation(event.target.value);
                            setSelectedPickupLocation(null);
                            setPickupSelectionError(false);
                          }}
                          placeholder={checkoutCopy[language].pickupPlaceholder}
                          required
                        />
                        {selectedPickupLocation && (
                          <input type="hidden" name="pickup-location-id" value={selectedPickupLocation.id} />
                        )}
                        {pickupSearchStatus === "loading" && (
                          <small className="pickup-search-status" role="status">{checkoutCopy[language].pickupSearching}</small>
                        )}
                        {pickupSearchStatus === "empty" && (
                          <small className="pickup-search-status" role="status">{checkoutCopy[language].pickupNoResults}</small>
                        )}
                        {pickupSearchStatus === "error" && (
                          <small className="pickup-search-status pickup-search-error" role="alert">{checkoutCopy[language].pickupSearchError}</small>
                        )}
                        {pickupSuggestions.length > 0 && (
                          <div className="pickup-search-results" id="pickup-location-options" role="listbox">
                            {pickupSuggestions.map((location, index) => (
                              <button
                                className="pickup-search-result"
                                type="button"
                                role="option"
                                aria-selected="false"
                                key={location.id}
                                onClick={() => {
                                  setSelectedPickupLocation(location);
                                  setPickupLocation(location.name);
                                  setPickupSuggestions([]);
                                  setPickupSearchStatus("idle");
                                  setPickupSelectionError(false);
                                                              }}
                              >
                                {index === 0 && <small>{checkoutCopy[language].bestMatch}</small>}
                                <strong>{location.name}</strong>
                              </button>
                            ))}
                          </div>
                        )}
                        {pickupSelectionError && !selectedPickupLocation && (
                          <small className="pickup-search-error" role="alert">{checkoutCopy[language].pickupSelectResult}</small>
                        )}
                        <small className="pickup-search-attribution">
                          <a href="https://places.post.ch/location-search" target="_blank" rel="noreferrer">
                            {checkoutCopy[language].locationSource}
                          </a>
                        </small>
                      </div>
                    )}
                  </fieldset>
                  <fieldset className="checkout-fieldset payment-fieldset">
                    <legend>{checkoutCopy[language].payment}<b className="required-mark" aria-hidden="true">*</b></legend>
                    <div className="payment-options">
                      {([
                        ["twint", checkoutCopy[language].twint],
                        ["card", checkoutCopy[language].card],
                        ["bank", checkoutCopy[language].bank],
                      ] as const).map(([value, label]) => (
                        <label className="payment-option" key={value}>
                          <input type="radio" name="payment-method" value={value} required />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    <p className="payment-notice">{checkoutCopy[language].paymentNotice}</p>
                  </fieldset>
                  <label className="checkout-note-field">
                    <span>{checkoutCopy[language].note} <small>({checkoutCopy[language].optional})</small></span>
                    <textarea name="order-note" rows={4} />
                  </label>
                  <p className="checkout-warning" role="status">{checkoutCopy[language].notActive}</p>
                </form>
                <aside className="checkout-order-summary" aria-labelledby="checkout-summary-title">
                  <h2 id="checkout-summary-title">{checkoutCopy[language].orderSummary}</h2>
                  <ul>
                    {cartItems.map((item) => {
                      const product = getProduct(item.productId);
                      const variant = baubleProductIds.includes(item.productId)
                        ? getBaubleVariant(item.baubleVariantId ?? item.productId)
                        : undefined;
                      return (
                        <li key={item.id}>
                          <span>
                            {item.quantity} × {variant?.label[language] ?? product.translations[language].name}
                            {variant && item.baubleMaterial && ` · ${baubleOptionLabels[language][item.baubleMaterial]}`}
                            {variant && !item.baubleMaterial && ` · ${t.cartMaterialMissing}`}
                            {` · ${item.customText}`}
                          </span>
                          <strong>{formatPrice(getCartItemUnitPrice(item) * item.quantity)}</strong>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="checkout-summary-row">
                    <span>{checkoutCopy[language].subtotal}</span><strong>{formatPrice(cartTotal)}</strong>
                  </div>
                  <div className="checkout-summary-row checkout-shipping-row">
                    <span>{checkoutCopy[language].shipping}</span>
                    <small>{checkoutCopy[language][shippingMethod]} · {checkoutCopy[language].shippingLater}</small>
                  </div>
                </aside>
              </div>
            </section>
          </>
        )}

        {currentView === "terms" && (
          <>
            <div className="page-toolbar">
              <Link href="/" onClick={(event) => { event.preventDefault(); navigateHome(); }}>
                {flow.backHome}
              </Link>
              <button type="button" onClick={() => navigateCart()}>{flow.goToCart}</button>
            </div>
            <section className="terms-section terms-page" id={legalPage} aria-labelledby="legal-page-title">
              <div className="section-heading cart-page-heading">
                <div>
                  <p className="section-kicker">{legalPage === "agb" ? t.termsKicker : legalPage === "datenschutz" ? t.privacyKicker : legalPage === "cookies" ? t.cookiesKicker : legalCopy[language].impressumTitle}</p>
                  <h1 id="legal-page-title">{legalTitle}</h1>
                </div>
              </div>
              {legalNotice && <p className="legal-draft-notice">{legalNotice}</p>}
              <div className="terms-grid legal-document-grid">
                {legalSections.map((section) => (
                  <article key={section.heading}>
                    <h2>{section.heading}</h2>
                    <ul>{section.points.map((point, index) => <li key={index}>{point}</li>)}</ul>
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
          <Link
            href="/agb"
            onClick={(event) => {
              event.preventDefault();
              navigateTerms();
            }}
          >
            {t.nav.terms}
          </Link>
          <Link
            href="/datenschutz"
            onClick={(event) => {
              event.preventDefault();
              navigateTerms("datenschutz");
            }}
          >
            {t.privacyKicker}
          </Link>
          <Link
            href="/cookies"
            onClick={(event) => {
              event.preventDefault();
              navigateTerms("cookies");
            }}
          >
            {t.cookiesKicker}
          </Link>
          <Link href="/impressum" onClick={(event) => { event.preventDefault(); navigateTerms("impressum"); }}>{legalCopy[language].impressumTitle}</Link>
          <span>{t.contactPending}</span>
        </nav>
      </footer>
    </div>
  );
}
