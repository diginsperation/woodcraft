import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ProductCard";
import { strings } from "@/content/strings.de";
import { Seo } from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { getCardImage, getCardImageAlt } from "@/lib/card-image";
import wood1 from "@/assets/wood-board-1.jpg";

export default function ProductList() {
  const [params, setParams] = useSearchParams();
  const active = params.get("category") || "all";

  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("categories").select("id,slug,name,description,sort_order").order("sort_order", { ascending: true })
      .then(({ data }) => setDbCategories(data ?? []));
    supabase.from("products").select(`
      id,slug,title,description,base_price,active,category_id,main_image_url,card_image_mode,card_image_image_id,
      product_images (*)
    `).eq("active", true)
      .then(({ data }) => setDbProducts(data ?? []));
  }, []);

  const selectedCategoryId = useMemo(() => dbCategories.find((c) => c.slug === active)?.id, [dbCategories, active]);

  const filtered = useMemo(() => {
    const base = active === "all" ? dbProducts : dbProducts.filter((p) => p.category_id === selectedCategoryId);
    return base.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      teaser: (p.description ?? "").slice(0, 120),
      price: Math.round(Number(p.base_price) * 100),
      images: [],
      main_image_url: getCardImage(p),
      bestseller: false,
      story: "",
      material: "",
      care: "",
    }));
  }, [dbProducts, active, selectedCategoryId]);

  return (
    <div className="container py-10">
      <Seo title={`${strings.brandName} – ${strings.productList.title}`} description={strings.seo.homeDescription} canonicalPath="/products" />
      <h1 className="font-playfair text-3xl md:text-4xl mb-6">{strings.productList.title}</h1>
      <Tabs value={active} onValueChange={(v) => setParams(v === "all" ? {} : { category: v })}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{strings.productList.all}</TabsTrigger>
          {dbCategories.map((c) => (
            <TabsTrigger key={c.slug} value={c.slug}>{c.name}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p as any} />
        ))}
      </div>
    </div>
  );
}
