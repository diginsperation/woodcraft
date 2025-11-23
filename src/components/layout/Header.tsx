import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { strings } from "@/content/strings.de";
import { supabase } from "@/integrations/supabase/client";

interface LogoData {
  logo_text?: string;
  logo_font?: string;
  logo_color_light?: string;
  logo_color_dark?: string;
  logo_image_url?: string;
  logo_alt?: string;
  use_text_logo_if_image_fails?: boolean;
  show_text_with_image?: boolean;
  logo_max_height?: number;
  logo_max_width?: string;
  logo_gap?: number;
}

export default function Header() {
  const [headerData, setHeaderData] = useState<LogoData | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    // Load header data with new logo fields
    supabase.from("homepage_header")
      .select("logo_text, logo_font, logo_color_light, logo_color_dark, logo_image_url, logo_alt, use_text_logo_if_image_fails, show_text_with_image, logo_max_height, logo_max_width, logo_gap")
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        setHeaderData(data);
        setImageLoadError(false); // Reset error state when data changes
      });
  }, []);

  const getFontFamily = (font?: string) => {
    switch (font) {
      case 'Fraunces': return 'Fraunces, serif';
      case 'Playfair Display': return 'Playfair Display, serif';
      case 'Inter': return 'Inter, sans-serif';
      case 'System': return 'system-ui, sans-serif';
      default: return 'Inter, sans-serif';
    }
  };

  const LogoComponent = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const currentColor = isDarkMode 
      ? (headerData?.logo_color_dark || '#F5F5F5')
      : (headerData?.logo_color_light || '#1F2937');

    const hasImage = headerData?.logo_image_url && !imageLoadError;
    const showText = headerData?.logo_text && (
      !headerData?.logo_image_url || 
      (headerData?.show_text_with_image === true) ||
      (imageLoadError && headerData?.use_text_logo_if_image_fails)
    );

    // Responsive sizing
    const baseHeight = headerData?.logo_max_height || 40;
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
    
    let effectiveHeight = baseHeight;
    if (isMobile) {
      effectiveHeight = Math.min(baseHeight, 28);
    } else if (isTablet) {
      effectiveHeight = Math.min(baseHeight, 32);
    }

    const logoMaxHeight = `${effectiveHeight}px`;
    const logoMaxWidth = headerData?.logo_max_width === 'auto' || !headerData?.logo_max_width 
      ? 'auto' 
      : `${headerData.logo_max_width}px`;
    const logoGap = `${Math.min(headerData?.logo_gap || 8, isMobile ? 8 : 999)}px`;

    return (
      <div 
        className="flex items-center" 
        style={{ gap: logoGap }}
      >
        {hasImage && (
          <img 
            src={headerData.logo_image_url} 
            alt={headerData.logo_alt || `${headerData.logo_text || strings.brandName} Logo`}
            style={{
              maxHeight: logoMaxHeight,
              maxWidth: logoMaxWidth,
              height: 'auto',
              width: 'auto',
              objectFit: 'contain',
              objectPosition: 'center left'
            }}
            onError={() => {
              if (headerData?.use_text_logo_if_image_fails) {
                setImageLoadError(true);
              }
            }}
          />
        )}
        
        {(showText || !hasImage) && (
          <span 
            className="font-semibold text-xl"
            style={{ 
              fontFamily: getFontFamily(headerData?.logo_font),
              color: currentColor
            }}
          >
            {headerData?.logo_text || strings.brandName}
          </span>
        )}
      </div>
    );
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md transition-colors ${isActive ? "bg-accent text-foreground" : "hover:bg-accent"}`;
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <LogoComponent />
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          <NavLink end to="/" className={linkCls}>{strings.nav.home}</NavLink>
          <NavLink to="/products" className={linkCls}>{strings.nav.products}</NavLink>
          <a href="#contact" className="px-3 py-2 rounded-md hover:bg-accent">{strings.nav.contact}</a>
        </nav>

        <div className="flex items-center gap-2" />
      </div>
    </header>
  );
}
