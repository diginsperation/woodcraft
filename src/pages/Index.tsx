import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-wood.jpg";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { Seo } from "@/components/Seo";
import { categories } from "@/data/products";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";

const Index = () => {
  const { t } = useI18n();
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 6);
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${t("brand.name")} – ${t("hero.title")}`}
        description={t("seo.homeDescription")}
        canonicalPath="/"
      />
      <header className="relative">
        <div className="h-[420px] md:h-[520px] w-full overflow-hidden rounded-b-lg">
          <img
            src={heroImage}
            alt={t("hero.alt")}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-3xl px-6">
            <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-primary-foreground drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              {t("hero.title")}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/90">
              {t("hero.subtitle")}
            </p>
            <Button asChild className="mt-8">
              <Link to="#products-section">{t("cta.viewProducts")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container py-12 md:py-16" aria-labelledby="categories">
          <h2 id="categories" className="font-playfair text-3xl md:text-4xl mb-6">
            {t("home.categories")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryCard key={c.slug} category={c} />
            ))}
          </div>
        </section>

        <section id="products-section" className="container py-12 md:py-16" aria-labelledby="bestsellers">
          <h2 id="bestsellers" className="font-playfair text-3xl md:text-4xl mb-6">
            {t("home.bestsellers")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </section>

        <section className="container py-12 md:py-16" aria-labelledby="process">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 id="process" className="font-playfair text-3xl md:text-4xl mb-4">
                {t("home.processTitle")}
              </h2>
              <p className="text-muted-foreground mb-4">{t("home.processText")}</p>
              <Button variant="outline" asChild>
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noreferrer">
                  {t("home.watchVideo")}
                </a>
              </Button>
            </div>
            <div className="rounded-lg bg-accent aspect-video" aria-hidden />
          </div>
        </section>

        <section className="container py-12 md:py-16" aria-labelledby="contact-icons">
          <h2 id="contact-icons" className="font-playfair text-3xl md:text-4xl mb-6">
            {t("home.contact")}
          </h2>
          <div className="flex flex-wrap gap-4">
            <a className="hover-scale rounded-md border px-4 py-2" href="#" aria-label="Email">Email</a>
            <a className="hover-scale rounded-md border px-4 py-2" href="#" aria-label="WhatsApp">WhatsApp</a>
            <a className="hover-scale rounded-md border px-4 py-2" href="#" aria-label="Instagram">Instagram</a>
            <a className="hover-scale rounded-md border px-4 py-2" href="#" aria-label="Messenger">Messenger</a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
