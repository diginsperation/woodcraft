import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/data/products";
import { strings } from "@/content/strings.de";
import { Seo } from "@/components/Seo";

export default function ProductList() {
  
  const [params, setParams] = useSearchParams();
  const active = params.get("category") || "all";
  const filtered = useMemo(() => (active === "all" ? products : products.filter((p) => p.categories.includes(active))), [active]);
  return (
    <div className="container py-10">
      <Seo title={`${strings.brandName} – ${strings.productList.title}`} description={strings.seo.homeDescription} canonicalPath="/products" />
      <h1 className="font-playfair text-3xl md:text-4xl mb-6">{strings.productList.title}</h1>
      <Tabs value={active} onValueChange={(v) => setParams(v === "all" ? {} : { category: v })}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{strings.productList.all}</TabsTrigger>
          {categories.map((c) => (
            <TabsTrigger key={c.slug} value={c.slug}>{c.title}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
