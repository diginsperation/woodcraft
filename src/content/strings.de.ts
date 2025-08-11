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
    processCta: "So entsteht dein Produkt",
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
    infoTitle: "So läuft’s bei Leonholz",
    infoText:
      "Wir fertigen dein Produkt in Handarbeit. Sobald wir starten, können personalisierte Produkte nicht mehr widerrufen werden. Du erhältst unsere Zahlungsinfos nach dem Absenden persönlich per E-Mail/WhatsApp.",
    withdrawalNotePersonalized:
      "Hinweis: Für individualisierte Produkte besteht kein Widerrufsrecht, sobald die Fertigung begonnen hat (§ 312g Abs. 2 Nr. 1 BGB).",
    withdrawalNoteStandard:
      "Für nicht personalisierte Produkte gilt das gesetzliche Widerrufsrecht (14 Tage ab Erhalt der Ware).",
    agree: {
      terms: "Ich habe die AGB und Datenschutzerklärung gelesen und akzeptiere sie.",
      withdrawalPersonal:
        "Ich habe die Widerrufsbelehrung gelesen und verstanden, dass bei personalisierten Produkten das Widerrufsrecht ausgeschlossen sein kann, sobald die Fertigung beginnt.",
      withdrawalStandard: "Ich habe die Widerrufsbelehrung gelesen und verstanden.",
      pay: "Ich bestelle zahlungspflichtig.",
    },
    confirmButton: "Jetzt zahlungspflichtig bestellen",
    modal: {
      title: "Bestellung prüfen",
      confirm: "Bestellung zahlungspflichtig absenden",
      back: "Zurück",
    },
  },
  thank: {
    headline: "Danke für deine Anfrage!",
    text: "Wir melden uns persönlich mit den nächsten Schritten.",
    backHome: "Zur Startseite",
    moreProducts: "Weitere Produkte ansehen",
    textPersonalized:
      "Danke! Deine zahlungspflichtige Bestellung ist eingegangen. Wir starten nach Zahlungseingang mit der individuellen Fertigung und senden dir die Zahlungsinfos persönlich.",
    textStandard:
      "Danke! Deine zahlungspflichtige Bestellung ist eingegangen. Du erhältst die Zahlungsinfos und Hinweise zum Widerruf per E-Mail/WhatsApp.",
  },
  legal: {
    agbTitle: "Allgemeine Geschäftsbedingungen (AGB)",
    agbDescription: "AGB – Platzhaltertext.",
    datenschutzTitle: "Datenschutzerklärung",
    datenschutzDescription: "Datenschutzerklärung – Platzhaltertext.",
    widerrufTitle: "Widerrufsbelehrung",
    widerrufDescription: "Widerrufsbelehrung – Platzhaltertext.",
  },
  seo: {
    homeDescription: "Personalisierte Holzprodukte – handgemacht mit Liebe zum Detail.",
  },
} as const;
