import hero from "@/assets/hero-wood.jpg";
import wood1 from "@/assets/wood-board-1.jpg";
import wood2 from "@/assets/wood-shop-1.jpg";
import wood3 from "@/assets/wood-detail-1.jpg";

export type Category = { slug: string; title: string; teaser: string; image: string };
export type Product = {
  id: string;
  slug: string;
  title: string;
  price: number; // cents
  teaser: string;
  categories: string[];
  images: string[];
  bestseller?: boolean;
  story: string;
  material: string;
  care: string;
};

export const categories: Category[] = [
  { slug: "gifts", title: "Geschenke", teaser: "Für besondere Momente.", image: wood2 },
  { slug: "serving", title: "Servierbretter", teaser: "Elegant servieren.", image: wood1 },
  { slug: "cutting", title: "Schneidebretter", teaser: "Robust im Alltag.", image: wood3 },
  { slug: "decor", title: "Deko", teaser: "Wärme für dein Zuhause.", image: hero },
];

export const products: Product[] = [
  {
    id: "p1",
    slug: "servierbrett-walnuss",
    title: "Servierbrett Walnuss",
    price: 8900,
    teaser: "Feine Maserung, geölt.",
    categories: ["serving", "gifts"],
    images: [wood1, wood2, wood3],
    bestseller: true,
    story: "Jedes Brett wird sorgfältig von Hand geölt.",
    material: "Massivholz Walnuss, lebensmittelecht geölt.",
    care: "Mit warmem Wasser reinigen, gelegentlich nachölen.",
  },
  {
    id: "p2",
    slug: "schneidebrett-eiche",
    title: "Schneidebrett Eiche",
    price: 6500,
    teaser: "Hart und langlebig.",
    categories: ["cutting"],
    images: [wood2, wood1, wood3],
    bestseller: true,
    story: "Aus regionalem Holz gefertigt.",
    material: "Eiche, fein geschliffen.",
    care: "Nicht spülmaschinengeeignet.",
  },
  {
    id: "p3",
    slug: "herzschale-kirsche",
    title: "Herzschale Kirsche",
    price: 4200,
    teaser: "Liebevolle Geschenkidee.",
    categories: ["gifts", "decor"],
    images: [wood3, wood2, wood1],
    story: "Handgeformt mit natürlicher Kante.",
    material: "Kirsche, naturbelassen.",
    care: "Mit trockenem Tuch abwischen.",
  },
  {
    id: "p4",
    slug: "untersetzer-set",
    title: "Untersetzer Set",
    price: 2900,
    teaser: "Set aus vier Unikaten.",
    categories: ["decor"],
    images: [wood1, wood3, wood2],
    story: "Jedes Stück ein Unikat.",
    material: "Gemischte Hölzer.",
    care: "Vor Feuchtigkeit schützen.",
  },
  {
    id: "p5",
    slug: "servierplatte-olive",
    title: "Servierplatte Olive",
    price: 11900,
    teaser: "Mediterraner Charme.",
    categories: ["serving"],
    images: [wood2, wood3, wood1],
    bestseller: true,
    story: "Besonders dichte Struktur.",
    material: "Olivenholz, geölt.",
    care: "Sanft reinigen, nachölen.",
  },
  {
    id: "p6",
    slug: "schneidebrett-endgrain",
    title: "Endgrain Schneidebrett",
    price: 14900,
    teaser: "Schonend für Messer.",
    categories: ["cutting"],
    images: [wood3, wood1, wood2],
    story: "Aufwendig verleimt.",
    material: "Hartholz-Stirnholz.",
    care: "Pflegeöl empfohlen.",
  },
];
