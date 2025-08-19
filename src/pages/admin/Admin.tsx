import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Seo } from "@/components/Seo";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { ColorField } from "@/components/admin/ColorField";
import { ThemePreview } from "@/components/admin/ThemePreview";

// Admin roles helper
type AppRole = "admin" | "editor" | "viewer";

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const isAdmin = roles.includes("admin");
  const isEditor = isAdmin || roles.includes("editor");

  // Catalog state
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Homepage state
  const [headerData, setHeaderData] = useState<any>(null);
  const [heroData, setHeroData] = useState<any>(null);
  const [processData, setProcessData] = useState<any>(null);
  const [contactActions, setContactActions] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [footerContactData, setFooterContactData] = useState<any>(null);
  
  const [headerForm, setHeaderForm] = useState<any>({ logo_text: "", logo_image_url: "" });
  const [heroForm, setHeroForm] = useState<any>({
    title: "",
    subtitle: "",
    button_primary_label: "",
    button_primary_link: "",
    button_secondary_label: "",
    button_secondary_link: "",
    background_image_url: ""
  });
  const [processForm, setProcessForm] = useState<any>({
    title: "",
    subtitle: "",
    button_label: "",
    button_link: ""
  });
  const [contactForm, setContactForm] = useState<any>({
    label: "",
    url: "",
    sort_order: 0
  });
  const [socialForm, setSocialForm] = useState<any>({
    platform: "",
    label: "",
    url: "",
    icon: "",
    sort_order: 0
  });
  const [editingContact, setEditingContact] = useState<any>(null);
  const [editingSocial, setEditingSocial] = useState<any>(null);
  const [footerContactForm, setFooterContactForm] = useState<any>({ content_rich: "" });

  // Theme settings
  const { themeSettings, saveThemeSettings } = useThemeSettings();
  const [themeForm, setThemeForm] = useState({
    primary_color: "29 59% 48%",
    secondary_color: "38 36% 73%",
    background_color: "0 0% 100%",
    text_color: "0 0% 12%",
    accent_color: "22 52% 89%",
    button_bg: "29 59% 48%",
    button_text: "0 0% 100%",
    button_hover: "29 59% 42%",
    button_radius: 8,
    font_heading: "Playfair Display",
    font_body: "Inter",
    font_button: "Inter",
    section_padding_top: 80,
    section_padding_bottom: 80,
  });

  // Load theme settings into form when data is available
  useEffect(() => {
    if (themeSettings) {
      setThemeForm({
        primary_color: themeSettings.primary_color || "29 59% 48%",
        secondary_color: themeSettings.secondary_color || "38 36% 73%",
        background_color: themeSettings.background_color || "0 0% 100%",
        text_color: themeSettings.text_color || "0 0% 12%",
        accent_color: themeSettings.accent_color || "22 52% 89%",
        button_bg: themeSettings.button_bg || "29 59% 48%",
        button_text: themeSettings.button_text || "0 0% 100%",
        button_hover: themeSettings.button_hover || "29 59% 42%",
        button_radius: themeSettings.button_radius || 8,
        font_heading: themeSettings.font_heading || "Playfair Display",
        font_body: themeSettings.font_body || "Inter",
        font_button: themeSettings.font_button || "Inter",
        section_padding_top: themeSettings.section_padding_top || 80,
        section_padding_bottom: themeSettings.section_padding_bottom || 80,
      });
    }
  }, [themeSettings]);

  // Forms
  const [catForm, setCatForm] = useState<{ id?: string; name: string; slug?: string; description?: string; sort_order: number }>({ name: "", description: "", sort_order: 0 });
const [prodForm, setProdForm] = useState<any>({
  id: undefined,
  title: "",
  slug: "",
  category_id: "",
  description: "",
  base_price: 0,
  active: true,
  is_home_featured: false,
  youtube_url: "",
  seo_title: "",
  seo_description: "",
  details_story: "",
  details_material: "",
  details_care: "",
  details_imagesText: "",
});

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_evt, sess) => {
      const uid = sess?.user?.id ?? null;
      setSessionUserId(uid);
      if (!uid) {
        setRoles([]);
      }
    }).data.subscription;

    // initial fetch
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setSessionUserId(uid);
      if (uid) {
        const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", uid);
        setRoles((r ?? []).map((x) => x.role));
      }
    });

    loadCatalog();
    loadHomepageData();
    return () => sub.unsubscribe();
  }, []);

  const loadCatalog = async () => {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from("categories").select("id, name, slug, description, sort_order").order("sort_order", { ascending: true }),
      supabase.from("products").select("id, title, slug, category_id, description, base_price, active, youtube_url, seo_title, seo_description, details, is_home_featured").order("created_at", { ascending: false }),
    ]);
    setCategories(cats ?? []);
    setProducts(prods ?? []);
  };

  const loadHomepageData = async () => {
    const [{ data: header }, { data: hero }, { data: process }, { data: contacts }, { data: socials }, { data: footerContact }] = await Promise.all([
      supabase.from("homepage_header").select("*").eq("is_active", true).maybeSingle(),
      supabase.from("homepage_hero").select("*").eq("is_active", true).maybeSingle(),
      supabase.from("home_process").select("*").maybeSingle(),
      supabase.from("contact_actions").select("*").order("sort_order"),
      supabase.from("social_links").select("*").order("sort_order"),
      supabase.from("footer_contact_block").select("*").maybeSingle(),
    ]);
    setHeaderData(header);
    setHeroData(hero);
    setProcessData(process);
    setContactActions(contacts || []);
    setSocialLinks(socials || []);
    setFooterContactData(footerContact);
    
    if (header) {
      setHeaderForm({ logo_text: header.logo_text || "", logo_image_url: header.logo_image_url || "" });
    }
    if (hero) {
      setHeroForm({
        title: hero.title || "",
        subtitle: hero.subtitle || "",
        button_primary_label: hero.button_primary_label || "",
        button_primary_link: hero.button_primary_link || "",
        button_secondary_label: hero.button_secondary_label || "",
        button_secondary_link: hero.button_secondary_link || "",
        background_image_url: hero.background_image_url || ""
      });
    }
    if (process) {
      setProcessForm({
        title: process.title || "",
        subtitle: process.subtitle || "",
        button_label: process.button_label || "",
        button_link: process.button_link || ""
      });
    }
    if (footerContact) {
      setFooterContactForm({ content_rich: footerContact.content_rich || "" });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return toast.error(error.message);
    const { data: user } = await supabase.auth.getUser();
    const uid = user.user?.id;
    if (uid) {
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      setRoles((r ?? []).map((x) => x.role));
    }
    toast.success("Eingeloggt");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Abgemeldet");
  };

  // Theme settings save function
  const handleSaveThemeSettings = async () => {
    if (!isEditor) return;
    const result = await saveThemeSettings(themeForm);
    if (result.success) {
      toast.success("Theme-Einstellungen gespeichert");
    } else {
      toast.error("Fehler beim Speichern der Theme-Einstellungen");
    }
  };

  // Theme form handlers
  const handleThemeFormChange = (field: string, value: string | number) => {
    setThemeForm(prev => ({ ...prev, [field]: value }));
  };

  const resetThemeForm = () => {
    if (themeSettings) {
      setThemeForm({
        primary_color: themeSettings.primary_color || "29 59% 48%",
        secondary_color: themeSettings.secondary_color || "38 36% 73%",
        background_color: themeSettings.background_color || "0 0% 100%",
        text_color: themeSettings.text_color || "0 0% 12%",
        accent_color: themeSettings.accent_color || "22 52% 89%",
        button_bg: themeSettings.button_bg || "29 59% 48%",
        button_text: themeSettings.button_text || "0 0% 100%",
        button_hover: themeSettings.button_hover || "29 59% 42%",
        button_radius: themeSettings.button_radius || 8,
        font_heading: themeSettings.font_heading || "Playfair Display",
        font_body: themeSettings.font_body || "Inter",
        font_button: themeSettings.font_button || "Inter",
        section_padding_top: themeSettings.section_padding_top || 80,
        section_padding_bottom: themeSettings.section_padding_bottom || 80,
      });
      toast.success("Änderungen verworfen");
    }
  };

  if (!sessionUserId) {
    return (
      <div className="container py-10 max-w-xl">
        <Seo title="Admin – Login" description="Admin Login" canonicalPath="/admin" />
        <h1 className="font-playfair text-3xl md:text-4xl mb-6">Admin Login</h1>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Passwort</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Einloggen</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Seo title="Admin – Verwaltung" description="Inhalte verwalten" canonicalPath="/admin" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-playfair text-3xl">Admin</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rollen: {roles.join(", ") || "keine"}</span>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <Tabs defaultValue="homepage">
        <TabsList>
          <TabsTrigger value="homepage">Startseite</TabsTrigger>
          <TabsTrigger value="theme">Theme & Styles</TabsTrigger>
          <TabsTrigger value="categories">Kategorien</TabsTrigger>
          <TabsTrigger value="products">Produkte</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="mt-6">
          <div className="space-y-6">
            {/* Header Section */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-medium mb-4">Header</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logo_text">Logo Text</Label>
                    <Input 
                      id="logo_text"
                      value={headerForm.logo_text} 
                      onChange={(e) => setHeaderForm(prev => ({ ...prev, logo_text: e.target.value }))}
                      placeholder="Logo Text"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo_image_url">Logo Bild URL</Label>
                    <Input 
                      id="logo_image_url"
                      value={headerForm.logo_image_url} 
                      onChange={(e) => setHeaderForm(prev => ({ ...prev, logo_image_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hero Section */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-medium mb-4">Hero Bereich</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hero_title">Titel</Label>
                    <Input 
                      id="hero_title"
                      value={heroForm.title} 
                      onChange={(e) => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Haupttitel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero_subtitle">Untertitel</Label>
                    <Textarea 
                      id="hero_subtitle"
                      value={heroForm.subtitle} 
                      onChange={(e) => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Beschreibungstext"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="btn_primary_label">Primärer Button Text</Label>
                      <Input 
                        id="btn_primary_label"
                        value={heroForm.button_primary_label} 
                        onChange={(e) => setHeroForm(prev => ({ ...prev, button_primary_label: e.target.value }))}
                        placeholder="Jetzt entdecken"
                      />
                    </div>
                    <div>
                      <Label htmlFor="btn_primary_link">Primärer Button Link</Label>
                      <Input 
                        id="btn_primary_link"
                        value={heroForm.button_primary_link} 
                        onChange={(e) => setHeroForm(prev => ({ ...prev, button_primary_link: e.target.value }))}
                        placeholder="/products"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="btn_secondary_label">Sekundärer Button Text</Label>
                      <Input 
                        id="btn_secondary_label"
                        value={heroForm.button_secondary_label} 
                        onChange={(e) => setHeroForm(prev => ({ ...prev, button_secondary_label: e.target.value }))}
                        placeholder="Mehr erfahren"
                      />
                    </div>
                    <div>
                      <Label htmlFor="btn_secondary_link">Sekundärer Button Link</Label>
                      <Input 
                        id="btn_secondary_link"
                        value={heroForm.button_secondary_link} 
                        onChange={(e) => setHeroForm(prev => ({ ...prev, button_secondary_link: e.target.value }))}
                        placeholder="/about"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="hero_bg_image">Hintergrundbild URL</Label>
                    <Input 
                      id="hero_bg_image"
                      value={heroForm.background_image_url} 
                      onChange={(e) => setHeroForm(prev => ({ ...prev, background_image_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Section */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-medium mb-4">Prozess Bereich</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="process_title">Titel</Label>
                    <Input 
                      id="process_title"
                      value={processForm.title} 
                      onChange={(e) => setProcessForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Prozess Titel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="process_subtitle">Untertitel</Label>
                    <Textarea 
                      id="process_subtitle"
                      value={processForm.subtitle} 
                      onChange={(e) => setProcessForm(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Prozess Beschreibung"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="process_btn_label">Button Text</Label>
                      <Input 
                        id="process_btn_label"
                        value={processForm.button_label} 
                        onChange={(e) => setProcessForm(prev => ({ ...prev, button_label: e.target.value }))}
                        placeholder="Video ansehen"
                      />
                    </div>
                    <div>
                      <Label htmlFor="process_btn_link">Button Link</Label>
                      <Input 
                        id="process_btn_link"
                        value={processForm.button_link} 
                        onChange={(e) => setProcessForm(prev => ({ ...prev, button_link: e.target.value }))}
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Actions */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-medium mb-4">Kontakt Aktionen</h2>
                <div className="space-y-4">
                  {contactActions.map((action) => (
                    <div key={action.id} className="flex items-center gap-4 p-4 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{action.label}</div>
                        <div className="text-sm text-muted-foreground">{action.url}</div>
                      </div>
                      <div className="text-sm">
                        {action.is_enabled ? 'Aktiv' : 'Inaktiv'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Footer Contact */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-medium mb-4">Footer Kontakt</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="footer_content">Kontakt Inhalt</Label>
                    <Textarea 
                      id="footer_content"
                      value={footerContactForm.content_rich} 
                      onChange={(e) => setFooterContactForm(prev => ({ ...prev, content_rich: e.target.value }))}
                      placeholder="Email: info@example.de<br/>Telefon: +49..."
                      className="min-h-24"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      HTML-Tags wie &lt;br/&gt; sind erlaubt
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditor && (
              <div className="flex gap-4">
                <Button className="flex-1">
                  Homepage Speichern
                </Button>
                <Button variant="outline" className="flex-1">
                  Änderungen verwerfen
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="theme" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left column: Form */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-medium mb-4">Farben</h2>
                  <div className="space-y-4">
                    <ColorField
                      label="Primärfarbe"
                      value={themeForm.primary_color}
                      onChange={(value) => handleThemeFormChange('primary_color', value)}
                      description="Hauptfarbe für Buttons, Links und Akzente"
                    />
                    <ColorField
                      label="Sekundärfarbe"
                      value={themeForm.secondary_color}
                      onChange={(value) => handleThemeFormChange('secondary_color', value)}
                      description="Ergänzende Farbe für Highlights"
                    />
                    <ColorField
                      label="Hintergrundfarbe"
                      value={themeForm.background_color}
                      onChange={(value) => handleThemeFormChange('background_color', value)}
                      description="Haupthintergrund der Website"
                    />
                    <ColorField
                      label="Textfarbe"
                      value={themeForm.text_color}
                      onChange={(value) => handleThemeFormChange('text_color', value)}
                      description="Standardtextfarbe"
                    />
                    <ColorField
                      label="Akzentfarbe"
                      value={themeForm.accent_color}
                      onChange={(value) => handleThemeFormChange('accent_color', value)}
                      description="Für Rahmen und subtile Hervorhebungen"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-medium mb-4">Buttons</h2>
                  <div className="space-y-4">
                    <ColorField
                      label="Button Hintergrund"
                      value={themeForm.button_bg}
                      onChange={(value) => handleThemeFormChange('button_bg', value)}
                      description="Hintergrundfarbe der Primär-Buttons"
                    />
                    <ColorField
                      label="Button Text"
                      value={themeForm.button_text}
                      onChange={(value) => handleThemeFormChange('button_text', value)}
                      description="Textfarbe auf Buttons"
                    />
                    <ColorField
                      label="Button Hover"
                      value={themeForm.button_hover}
                      onChange={(value) => handleThemeFormChange('button_hover', value)}
                      description="Button-Farbe beim Darüberfahren"
                    />
                    <div>
                      <Label>Button Radius (px)</Label>
                      <Input 
                        type="number"
                        value={themeForm.button_radius} 
                        onChange={(e) => handleThemeFormChange('button_radius', Number(e.target.value))} 
                        placeholder="8"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center gap-4">
                    <Button onClick={handleSaveThemeSettings} disabled={!isEditor} className="flex-1">
                      Speichern
                    </Button>
                    <Button onClick={resetThemeForm} variant="outline" className="flex-1">
                      Verwerfen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column: Preview */}
            <div className="lg:sticky lg:top-6">
              <ThemePreview colors={themeForm} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Kategorien-Verwaltung wird hier hinzugefügt...</p>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Produkt-Verwaltung wird hier hinzugefügt...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}