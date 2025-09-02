import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { strings } from "@/content/strings.de";
import type { Product } from "@/data/products";
import { getCardImage, getCardImageAlt } from "@/lib/card-image";
import type { Database } from "@/integrations/supabase/types";

type ProductWithImages = Database['public']['Tables']['products']['Row'] & {
  product_images?: Database['public']['Tables']['product_images']['Row'][];
};

export function ProductCard({ product }: { product: Product | ProductWithImages }) {
  // Handle both old Product type and new database type
  const cardImageSrc = 'card_image_mode' in product ? 
    getCardImage(product as ProductWithImages) : 
    (product.images?.[0] || product.main_image_url);
  
  const cardImageAlt = 'card_image_mode' in product ? 
    getCardImageAlt(product as ProductWithImages) : 
    `${product.title} Produktbild`;

  const price = 'price' in product ? product.price : 
    ('base_price' in product ? product.base_price : 0);
  
  return (
    <article className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] bg-muted/50">
        {cardImageSrc ? (
          <img 
            src={cardImageSrc} 
            alt={cardImageAlt} 
            className="w-full h-full object-contain" 
            loading="lazy"
            sizes="(max-width: 640px) 560px, (max-width: 1024px) 640px, 760px"
            srcSet={`${cardImageSrc}?w=280 280w, ${cardImageSrc}?w=320 320w, ${cardImageSrc}?w=380 380w, ${cardImageSrc}?w=560 560w, ${cardImageSrc}?w=640 640w, ${cardImageSrc}?w=760 760w`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Kein Bild verfügbar
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-playfair text-xl">{product.title}</h3>
        <p className="text-muted-foreground text-sm mt-1">
          {'teaser' in product ? product.teaser : 
           (product.description ? product.description.slice(0, 100) + '...' : '')}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-medium">{(price / 100).toFixed(2)} €</span>
          <Button asChild size="sm">
            <Link to={`/product/${product.slug}`}>{strings.product.ctaDetails}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
