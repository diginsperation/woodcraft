import { Mail, MessageCircle, Instagram, MessageSquare, Phone, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { strings } from "@/content/strings.de";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  mail: Mail,
  "message-circle": MessageCircle,
  instagram: Instagram,
  "message-square": MessageSquare,
  phone: Phone,
  facebook: Facebook,
  twitter: Twitter,
  link: LinkIcon,
};

interface LogoData {
  logo_text?: string;
  logo_font?: string;
  logo_color_light?: string;
  logo_color_dark?: string;
  logo_image_url?: string;
  logo_alt?: string;
  use_text_logo_if_image_fails?: boolean;
}

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [footerContact, setFooterContact] = useState<any>(null);
  const [logoData, setLogoData] = useState<LogoData | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    // fetch social links
    supabase.from("social_links").select("*").eq("is_enabled", true).order("sort_order")
      .then(({ data }) => setSocialLinks(data ?? []));
    // fetch footer contact
    supabase.from("footer_contact_block").select("*").maybeSingle()
      .then(({ data }) => setFooterContact(data));
    // fetch logo data
    supabase.from("homepage_header")
      .select("logo_text, logo_font, logo_color_light, logo_color_dark, logo_image_url, logo_alt, use_text_logo_if_image_fails")
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        setLogoData(data);
        setImageLoadError(false);
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
      ? (logoData?.logo_color_dark || '#F5F5F5')
      : (logoData?.logo_color_light || '#1F2937');

    const shouldShowImage = logoData?.logo_image_url && !imageLoadError;
    const shouldShowText = !logoData?.logo_image_url || 
                           (imageLoadError && logoData?.use_text_logo_if_image_fails);

    return (
      <Link to="/" className="inline-block mb-4">
        {shouldShowImage && (
          <img 
            src={logoData.logo_image_url} 
            alt={logoData.logo_alt || `${logoData.logo_text || strings.brandName} Logo`}
            className="h-8 object-contain"
            onError={() => {
              if (logoData?.use_text_logo_if_image_fails) {
                setImageLoadError(true);
              }
            }}
          />
        )}
        
        {shouldShowText && (
          <span 
            className="font-semibold text-xl"
            style={{ 
              fontFamily: getFontFamily(logoData?.logo_font),
              color: currentColor
            }}
          >
            {logoData?.logo_text || strings.brandName}
          </span>
        )}
      </Link>
    );
  };

  return (
    <footer id="contact" className="border-t bg-background">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div>
          <LogoComponent />
          <h3 className="font-playfair text-xl mb-3">{strings.nav.contact}</h3>
          {footerContact?.content_rich ? (
            <div 
              className="text-muted-foreground" 
              dangerouslySetInnerHTML={{ __html: footerContact.content_rich }} 
            />
          ) : (
            <>
              <p className="text-muted-foreground">Email: info@example.com</p>
              <p className="text-muted-foreground">Tel: +49 000 000000</p>
            </>
          )}
        </div>
        <div>
          <h3 className="font-playfair text-xl mb-3">Social</h3>
          <div className="flex gap-3">
            {socialLinks.length > 0 ? (
              socialLinks.map((social) => {
                const IconComponent = iconMap[social.icon] || LinkIcon;
                return (
                  <a 
                    key={social.id}
                    href={social.url} 
                    aria-label={social.label} 
                    className="hover-scale p-2 rounded-md border"
                    target={social.url.startsWith('http') ? '_blank' : undefined}
                    rel={social.url.startsWith('http') ? 'noreferrer' : undefined}
                  >
                    <IconComponent />
                  </a>
                );
              })
            ) : (
              <>
                <a href="#" aria-label="Email" className="hover-scale p-2 rounded-md border"><Mail /></a>
                <a href="#" aria-label="WhatsApp" className="hover-scale p-2 rounded-md border"><MessageCircle /></a>
                <a href="#" aria-label="Instagram" className="hover-scale p-2 rounded-md border"><Instagram /></a>
                <a href="#" aria-label="Messenger" className="hover-scale p-2 rounded-md border"><MessageSquare /></a>
              </>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-playfair text-xl mb-3">Rechtliches</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/impressum">Impressum</Link></li>
            <li><Link to="/datenschutz">Datenschutz</Link></li>
            <li><Link to="/widerruf">Widerrufsbelehrung</Link></li>
            <li><Link to="/agb">AGB</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
