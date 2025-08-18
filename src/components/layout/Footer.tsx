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

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [footerContact, setFooterContact] = useState<any>(null);

  useEffect(() => {
    // fetch social links
    supabase.from("social_links").select("*").eq("is_enabled", true).order("sort_order")
      .then(({ data }) => setSocialLinks(data ?? []));
    // fetch footer contact
    supabase.from("footer_contact_block").select("*").maybeSingle()
      .then(({ data }) => setFooterContact(data));
  }, []);

  return (
    <footer id="contact" className="border-t bg-background">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div>
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
