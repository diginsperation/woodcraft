import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { strings } from "@/content/strings.de";
import { supabase } from "@/integrations/supabase/client";


export default function Header() {
  const [headerData, setHeaderData] = useState<any>(null);

  useEffect(() => {
    // Load header data
    supabase.from("homepage_header").select("*").eq("is_active", true).maybeSingle()
      .then(({ data }) => setHeaderData(data));
  }, []);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md transition-colors ${isActive ? "bg-accent text-foreground" : "hover:bg-accent"}`;
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="font-playfair text-xl font-semibold">
          {headerData?.logo_image_url ? (
            <img src={headerData.logo_image_url} alt={headerData.logo_text || strings.brandName} className="h-8" />
          ) : (
            headerData?.logo_text || strings.brandName
          )}
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
