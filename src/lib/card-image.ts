import type { Database } from "@/integrations/supabase/types";

type ProductWithImages = Database['public']['Tables']['products']['Row'] & {
  product_images?: Database['public']['Tables']['product_images']['Row'][];
};

/**
 * Card Image Configuration:
 * 
 * RATIOS & BREAKPOINTS:
 * - Product Cards: 4:3 aspect ratio (stable for product showcase)
 * - Category Cards: 5:4 aspect ratio (slightly taller for category imagery)
 * 
 * BREAKPOINTS & SIZES:
 * - Mobile (< 640px): 280px width
 * - Tablet (640-1024px): 320px width  
 * - Desktop (> 1024px): 380px width
 * 
 * IMAGE OPTIMIZATION:
 * - Target resolutions: 280w, 320w, 380w, 560w (2x), 640w (2x), 760w (2x)
 * - Format: WebP preferred, JPEG fallback
 * - object-fit: cover with center positioning
 */

export function getCardImage(product: ProductWithImages): string | null {
  // Priority 1: Dedicated card image
  if ('card_image_url' in product && product.card_image_url) {
    return product.card_image_url;
  }

  // Priority 2: Handle different card image modes
  switch (product.card_image_mode) {
    case 'main':
      return product.main_image_url || null;
    
    case 'gallery':
      if (product.card_image_image_id && product.product_images) {
        const selectedImage = product.product_images.find(
          img => img.id === product.card_image_image_id
        );
        if (selectedImage) {
          return selectedImage.url;
        }
      }
      // Fallback to auto behavior
      break;
    
    case 'auto':
    default:
      break;
  }

  // Priority 3: Auto mode logic - main_image_url, then first gallery image by sort_order
  if (product.main_image_url) {
    return product.main_image_url;
  }

  if (product.product_images && product.product_images.length > 0) {
    const sortedImages = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order);
    return sortedImages[0].url;
  }

  return null;
}

export function getCardImageAlt(product: ProductWithImages): string {
  // Try to get alt text from selected gallery image
  if (product.card_image_mode === 'gallery' && product.card_image_image_id && product.product_images) {
    const selectedImage = product.product_images.find(
      img => img.id === product.card_image_image_id
    );
    if (selectedImage && selectedImage.alt) {
      return selectedImage.alt;
    }
  }

  // Fallback to product title
  return `${product.title} Produktbild`;
}