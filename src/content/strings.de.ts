// Zentrale deutsche UI-Texte
// HINWEIS: Diese Strings werden in Schritt 2/3 aus der Supabase-Datenbank geladen und sind im Admin-Bereich pflegbar
// inkl. Option für Englisch.

export const strings = {
  brandName: "Holzmanufaktur",
  nav: {
    home: "Start",
    products: "Produkte",
    contact: "Kontakt",
  },
  hero: {
    title: "Holzhandwerk mit Charakter.",
    subtitle: "Personalisiert. Hochwertig. Handgemacht.",
    alt: "Holzwerkstatt mit warmem Licht",
    cta: "Produkte ansehen",
  },
  home: {
    categories: "Kategorien",
    bestsellers: "Unsere Bestseller",
    processTitle: "So entsteht dein Produkt",
    processText: "Vom Rohholz bis zum fertigen Unikat – mit viel Liebe zum Detail.",
    watchVideo: "Video ansehen",
    contact: "Kontakt",
  },
  productList: {
    title: "Produkte",
    all: "Alle",
  },
  category: {
    view: "Ansehen",
  },
  product: {
    priceInclVat: "inkl. MwSt.",
    description: "Produktbeschreibung",
    story: "Story",
    material: "Material",
    care: "Pflege",
    ctaDetails: "Details ansehen",
    ctaInquiry: "Anfrage",
  },
  personalization: {
    toggle: "Personalisierung hinzufügen?",
    name: "Dein Name",
    partner: "Partnername",
    date: "Datum",
    hint: "Die Gravur-Vorschau ist symbolisch. Wir gravieren exakt nach deinen Angaben.",
  },
  checkout: {
    title: "Anfrage",
    summary: "Zusammenfassung",
    customer: "Kontaktdaten",
    address: "Lieferadresse",
    name: "Name",
    email: "E-Mail",
    phone: "Telefon",
    street: "Straße",
    zip: "PLZ",
    city: "Ort",
    country: "Land",
    notes: "Hinweise",
    submit: "Anfrage absenden",
    shippingNote: "Versand kostenlos · Preis inkl. MwSt.",
    personalization: "Personalisierung",
    qty: "Menge",
    unitPrice: "Einzelpreis",
    total: "Summe",
  },
  thank: {
    headline: "Danke für deine Anfrage!",
    text: "Wir melden uns persönlich mit den nächsten Schritten.",
    backHome: "Zur Startseite",
    moreProducts: "Weitere Produkte ansehen",
  },
  seo: {
    homeDescription: "Personalisierte Holzprodukte – handgemacht mit Liebe zum Detail.",
  },
} as const;
