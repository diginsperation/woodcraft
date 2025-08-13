import { Mail, MessageCircle, Instagram, MessageSquare } from "lucide-react";
import { strings } from "@/content/strings.de";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer id="contact" className="border-t bg-background">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-playfair text-xl mb-3">{strings.nav.contact}</h3>
          <p className="text-muted-foreground">Email: info@example.com</p>
          <p className="text-muted-foreground">Tel: +49 000 000000</p>
        </div>
        <div>
          <h3 className="font-playfair text-xl mb-3">Social</h3>
          <div className="flex gap-3">
            <a href="#" aria-label="Email" className="hover-scale p-2 rounded-md border"><Mail /></a>
            <a href="#" aria-label="WhatsApp" className="hover-scale p-2 rounded-md border"><MessageCircle /></a>
            <a href="#" aria-label="Instagram" className="hover-scale p-2 rounded-md border"><Instagram /></a>
            <a href="#" aria-label="Messenger" className="hover-scale p-2 rounded-md border"><MessageSquare /></a>
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
