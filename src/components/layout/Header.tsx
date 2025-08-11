import { Link, NavLink } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md transition-colors ${isActive ? "bg-accent text-foreground" : "hover:bg-accent"}`;
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="font-playfair text-xl font-semibold">{t("brand.name")}</Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          <NavLink end to="/" className={linkCls}>{t("nav.home")}</NavLink>
          <NavLink to="/products" className={linkCls}>{t("nav.products")}</NavLink>
          <a href="#contact" className="px-3 py-2 rounded-md hover:bg-accent">{t("nav.contact")}</a>
        </nav>

        <div className="flex items-center gap-2">
          <div role="group" aria-label="Language switch" className="border rounded-md p-0.5">
            <Button variant={lang === "de" ? "secondary" : "ghost"} size="sm" onClick={() => setLang("de")}>DE</Button>
            <Button variant={lang === "en" ? "secondary" : "ghost"} size="sm" onClick={() => setLang("en")}>EN</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
