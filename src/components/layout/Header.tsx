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
}

export default function Header() {
  const [headerData, setHeaderData] = useState<LogoData | null>(null);

  useEffect(() => {
    // Load header data with new logo fields
    supabase.from("homepage_header")
      .select("logo_text, logo_font, logo_color_light, logo_color_dark, logo_image_url, logo_alt, use_text_logo_if_image_fails")
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => setHeaderData(data));
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
    // If we have an image URL, try to use it
    if (headerData?.logo_image_url) {
      return (
        <img 
          src={headerData.logo_image_url} 
          alt={headerData.logo_alt || `${headerData.logo_text || strings.brandName} Logo`}
          className="h-8 object-contain"
          onError={(e) => {
            // If image fails to load and fallback is enabled, hide the image
            if (headerData.use_text_logo_if_image_fails) {
              e.currentTarget.style.display = 'none';
              // Show text logo as fallback - this would need more complex state management in real app
              console.log('Logo image failed, should show text fallback');
            }
          }}
        />
      );
    }

    // Use text logo with configured styling
    const isDarkMode = document.documentElement.classList.contains('dark');
    const currentColor = isDarkMode 
      ? (headerData?.logo_color_dark || '#F5F5F5')
      : (headerData?.logo_color_light || '#1F2937');

    return (
      <span 
        className="font-semibold text-xl"
        style={{ 
          fontFamily: getFontFamily(headerData?.logo_font),
          color: currentColor
        }}
      >
        {headerData?.logo_text || strings.brandName}
      </span>
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
