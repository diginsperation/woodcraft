import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-wood.jpg";
import { Button } from "@/components/ui/button";
import { strings } from "@/content/strings.de";
import { Seo } from "@/components/Seo";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import wood1 from "@/assets/wood-board-1.jpg"; // placeholder image for DB-backed cards


const Index = () => {
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [heroData, setHeroData] = useState<any>(null);
  const [processData, setProcessData] = useState<any>(null);
  const [contactActions, setContactActions] = useState<any[]>([]);

  useEffect(() => {
    // fetch categories
    supabase.from("categories").select("slug,name,description,sort_order").order("sort_order", { ascending: true })
      .then(({ data }) => setDbCategories(data ?? []));
    // fetch featured products for bestsellers section
    supabase.from("products").select("id,slug,title,description,base_price,created_at,active,is_home_featured").eq("active", true).eq("is_home_featured", true).order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => setDbProducts(data ?? []));
    // fetch hero data
    supabase.from("homepage_hero").select("*").eq("is_active", true).maybeSingle()
      .then(({ data }) => setHeroData(data));
    // fetch process data
    supabase.from("home_process").select("*").maybeSingle()
      .then(({ data }) => setProcessData(data));
    // fetch contact actions
    supabase.from("contact_actions").select("*").eq("is_enabled", true).order("sort_order")
      .then(({ data }) => setContactActions(data ?? []));
    // check if current user is admin (for empty states)
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin");
      setIsAdmin((roles?.length ?? 0) > 0);
    });
  }, []);

  const adaptedCategories = dbCategories.map((c) => ({
    slug: c.slug,
    title: c.name,
    teaser: c.description ?? "",
    image: wood1,
  }));

  const bestsellers = dbProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    teaser: (p.description ?? "").slice(0, 120),
    price: Math.round(Number(p.base_price) * 100),
    images: [wood1],
    bestseller: false,
    story: "",
    material: "",
    care: "",
  }));

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${strings.brandName} – ${strings.hero.title}`}
        description={strings.seo.homeDescription}
        canonicalPath="/"
      />
      <header className="relative">
        <div className="h-[420px] md:h-[520px] w-full overflow-hidden rounded-b-lg">
          <img
            src={heroData?.background_image_url || heroImage}
            alt={heroData?.title || strings.hero.alt}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-3xl px-6">
            <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-primary-foreground drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              {heroData?.title || strings.hero.title}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/90">
              {heroData?.subtitle || strings.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild>
                <Link to={heroData?.button_primary_link || "/products"}>
                  {heroData?.button_primary_label || strings.hero.cta}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href={heroData?.button_secondary_link || "#process"}>
                  {heroData?.button_secondary_label || strings.home.processCta}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="container py-12 md:py-16" aria-labelledby="categories">
          <h2 id="categories" className="font-playfair text-3xl md:text-4xl mb-6">
            {strings.home.categories}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {adaptedCategories.map((c) => (
              <CategoryCard key={c.slug} category={c as any} />
            ))}
          </div>
        </section>

        <section id="products-section" className="container py-12 md:py-16" aria-labelledby="bestsellers">
          <h2 id="bestsellers" className="font-playfair text-3xl md:text-4xl mb-6">
            {strings.home.bestsellers}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p as any} />)
            )}
          </div>
        </section>

        {(processData || true) && (
          <section className="container py-12 md:py-16" aria-labelledby="process">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 id="process" className="font-playfair text-3xl md:text-4xl mb-4">
                  {processData?.title || strings.home.processTitle}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {processData?.subtitle || strings.home.processText}
                </p>
                <Button variant="outline" asChild>
                  <a 
                    href={processData?.button_link || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    {processData?.button_label || strings.home.watchVideo}
                  </a>
                </Button>
              </div>
              <div className="rounded-lg bg-accent aspect-video" aria-hidden />
            </div>
          </section>
        )}

        <section className="container py-12 md:py-16" aria-labelledby="contact-icons">
          <h2 id="contact-icons" className="font-playfair text-3xl md:text-4xl mb-6">
            {strings.home.contact}
          </h2>
          <div className="flex flex-wrap gap-4">
            {contactActions.length > 0 ? (
              contactActions.map((contact) => (
                <a 
                  key={contact.id}
                  className="hover-scale rounded-md border px-4 py-2" 
                  href={contact.url} 
                  aria-label={contact.label}
                  target={contact.url.startsWith('http') ? '_blank' : undefined}
                  rel={contact.url.startsWith('http') ? 'noreferrer' : undefined}
                >
                  {contact.label}
                </a>
              ))
            ) : (
              <>
                <a className="hover-scale rounded-md border px-4 py-2" href="#" aria-label="Email">Email</a>
                <a className="hover-scale rounded-md border px-4 py-2" href="#" aria-label="WhatsApp">WhatsApp</a>
                <a className="hover-scale rounded-md border px-4 py-2" href="#" aria-label="Instagram">Instagram</a>
                <a className="hover-scale rounded-md border px-4 py-2" href="#" aria-label="Messenger">Messenger</a>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
