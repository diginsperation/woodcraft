import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sort_order: number;
}

interface ProductGalleryProps {
  productId: string;
  mainImageUrl?: string;
  productTitle: string;
  videoMode?: string;
  videoUrl?: string;
}

function toYouTubeEmbed(url?: string | null): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    let id = '';
    if (host === 'youtu.be') {
      id = u.pathname.slice(1);
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname === '/watch') {
        id = u.searchParams.get('v') || '';
      } else if (u.pathname.startsWith('/shorts/')) {
        id = u.pathname.split('/')[2] || '';
      } else if (u.pathname.startsWith('/embed/')) {
        return `https://www.youtube-nocookie.com${u.pathname}${u.search}`;
      }
    } else if (host === 'youtube-nocookie.com' && u.pathname.startsWith('/embed/')) {
      return url;
    }
    if (!id) return '';
    const params = new URLSearchParams(u.search);
    if (!params.has('rel')) params.set('rel', '0');
    if (!params.has('modestbranding')) params.set('modestbranding', '1');
    return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
  } catch {
    return '';
  }
}

export function ProductGallery({ productId, mainImageUrl, productTitle, videoMode, videoUrl }: ProductGalleryProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create media items array (images + optional video)
  const mediaItems = [
    // Main image first if available
    ...(mainImageUrl ? [{
      type: 'image' as const,
      url: mainImageUrl,
      alt: productTitle,
      isMain: true
    }] : []),
    // Additional images
    ...images.map(img => ({
      type: 'image' as const,
      url: img.url,
      alt: img.alt || `${productTitle} Bild`,
      isMain: false
    })),
    // Video if available
    ...(videoMode !== 'none' && videoUrl ? [{
      type: 'video' as const,
      url: videoUrl,
      alt: `${productTitle} Video`,
      isMain: false
    }] : [])
  ];

  const activeMedia = mediaItems[activeIndex];

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('product_images')
          .select('id, url, alt, sort_order')
          .eq('product_id', productId)
          .order('sort_order');

        if (error) throw error;
        setImages(data || []);
      } catch (error) {
        console.error('Error fetching product images:', error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [productId]);

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else if (e.key === 'ArrowRight' && activeIndex < mediaItems.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (e.key === 'Escape') {
      setShowLightbox(false);
    }
  };

  const renderMainContent = () => {
    if (!activeMedia) return null;

    if (activeMedia.type === 'video') {
      if (videoMode === 'youtube') {
        const embedUrl = toYouTubeEmbed(activeMedia.url);
        return (
          <iframe
            className="w-full h-full object-cover"
            src={embedUrl}
            title={activeMedia.alt}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      } else if (videoMode === 'upload') {
        return (
          <video
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          >
            <source src={activeMedia.url} type="video/mp4" />
            Ihr Browser unterstützt das Video-Element nicht.
          </video>
        );
      }
    }

    return (
        <img
          src={activeMedia.url}
          alt={activeMedia.alt}
          className="w-full h-full object-contain cursor-zoom-in"
          loading={activeIndex === 0 ? "eager" : "lazy"}
          onClick={() => setShowLightbox(true)}
          sizes="(max-width: 640px) 400px, (max-width: 768px) 500px, (max-width: 1024px) 600px, (max-width: 1280px) 800px, 1000px"
          srcSet={`${activeMedia.url}?w=400 400w, ${activeMedia.url}?w=500 500w, ${activeMedia.url}?w=600 600w, ${activeMedia.url}?w=800 800w, ${activeMedia.url}?w=1000 1000w, ${activeMedia.url}?w=1600 1600w`}
        />
    );
  };

  // Adaptive thumbnail sizing based on count and viewport
  const getThumbnailSize = () => {
    const count = mediaItems.length;
    if (count <= 4) return 'w-24 h-24 sm:w-20 sm:h-20'; // 100px desktop, 80px mobile
    if (count <= 8) return 'w-20 h-20 sm:w-16 sm:h-16'; // 80px desktop, 64px mobile  
    return 'w-16 h-16 sm:w-12 sm:h-12'; // 64px desktop, 48px mobile
  };

  const renderThumbnail = (item: typeof mediaItems[0], index: number) => {
    const isActive = index === activeIndex;
    const sizeClasses = getThumbnailSize();
    
    return (
      <button
        key={`${item.type}-${index}`}
        className={`relative ${sizeClasses} overflow-hidden rounded-md border-2 transition-all duration-200 hover:opacity-90 flex-shrink-0 ${
          isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border'
        }`}
        onClick={() => handleThumbnailClick(index)}
      >
        {item.type === 'video' ? (
          <div className="relative w-full h-full">
            {videoMode === 'youtube' ? (
              // Generate YouTube thumbnail from video ID
              (() => {
                let videoId = '';
                try {
                  const url = new URL(item.url);
                  const host = url.hostname.replace(/^www\./, '');
                  if (host === 'youtu.be') {
                    videoId = url.pathname.slice(1);
                  } else if (host === 'youtube.com' || host === 'm.youtube.com') {
                    if (url.pathname === '/watch') {
                      videoId = url.searchParams.get('v') || '';
                    } else if (url.pathname.startsWith('/shorts/')) {
                      videoId = url.pathname.split('/')[2] || '';
                    }
                  }
                } catch (e) {
                  // Fallback if URL parsing fails
                }
                
                return (
                  <img
                    src={videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WaWRlbzwvdGV4dD48L3N2Zz4='}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                );
              })()
            ) : (
              <video className="w-full h-full object-cover" muted>
                <source src={item.url} type="video/mp4" />
              </video>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="aspect-square w-full bg-muted animate-pulse rounded-lg" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-24 h-24 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Keine Bilder verfügbar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Main Display Area - Amazon-like responsive sizing */}
      <div className="relative aspect-square w-full min-w-[280px] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto overflow-hidden rounded-lg border bg-background">
        {renderMainContent()}
        
        {/* Navigation Arrows (Desktop) */}
        {mediaItems.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => setActiveIndex(Math.min(mediaItems.length - 1, activeIndex + 1))}
              disabled={activeIndex === mediaItems.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Strip - Responsive grid with adaptive sizing */}
      {mediaItems.length > 1 && (
        <div className="flex gap-1 sm:gap-2 justify-center overflow-x-auto px-2 pb-2">
          <div className="flex gap-1 sm:gap-2 min-w-fit">
            {mediaItems.map((item, index) => renderThumbnail(item, index))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          {activeMedia?.type === 'image' && (
            <img
              src={activeMedia.url}
              alt={activeMedia.alt}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}