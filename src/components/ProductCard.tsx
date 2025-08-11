import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { strings } from "@/content/strings.de";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  
  return (
    <article className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow">
      <img src={product.images[0]} alt={product.title + " image"} className="w-full h-48 object-cover" loading="lazy" />
      <div className="p-4">
        <h3 className="font-playfair text-xl">{product.title}</h3>
        <p className="text-muted-foreground text-sm mt-1">{product.teaser}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-medium">{(product.price / 100).toFixed(2)} €</span>
          <Button asChild size="sm">
            <Link to={`/product/${product.slug}`}>{strings.product.ctaDetails}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
