import { Link } from "react-router-dom";
import type { Category } from "@/data/products";
import { Button } from "@/components/ui/button";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow">
      <img src={category.image} alt={category.title + " image"} className="w-full h-40 object-cover" loading="lazy" />
      <div className="p-4">
        <h3 className="font-playfair text-lg">{category.title}</h3>
        <p className="text-muted-foreground text-sm mt-1">{category.teaser}</p>
        <Button asChild size="sm" className="mt-3">
          <Link to={`/products?category=${encodeURIComponent(category.slug)}`}>Ansehen</Link>
        </Button>
      </div>
    </article>
  );
}
