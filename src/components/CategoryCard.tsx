import { Link } from "react-router-dom";
import type { Category } from "@/data/products";
import { strings } from "@/content/strings.de";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow">
      <AspectRatio ratio={7/4}>
        <img src={category.image} alt={category.title + " image"} className="w-full h-full object-cover" loading="lazy" />
      </AspectRatio>
      <div className="p-4">
        <h3 className="font-playfair text-lg">{category.title}</h3>
        <p className="text-muted-foreground text-sm mt-1">{category.teaser}</p>
        <a className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-3 mt-3"
           href={`/products?category=${encodeURIComponent(category.slug)}`}>{strings.category.view}</a>
      </div>
    </article>
  );
}
