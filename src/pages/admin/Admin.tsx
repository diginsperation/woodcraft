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

  // Category CRUD
  const saveCategory = async () => {
    if (!isEditor) return;
    const payload: any = { name: catForm.name, description: catForm.description, sort_order: Number(catForm.sort_order) || 0 };
    if (catForm.slug) payload.slug = catForm.slug; // editable
    const { error } = catForm.id
      ? await supabase.from("categories").update(payload).eq("id", catForm.id)
      : await supabase.from("categories").insert(payload);
    if (error) return toast.error(error.message);
    setCatForm({ name: "", description: "", sort_order: 0 });
    await loadCatalog();
    toast.success("Kategorie gespeichert");
  };
  const editCategory = (c: any) => setCatForm({ id: c.id, name: c.name, slug: c.slug, description: c.description, sort_order: c.sort_order });
  const deleteCategory = async (id: string) => {
    if (!isEditor) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await loadCatalog();
    toast.success("Kategorie gelöscht");
  };

  // Product CRUD
  const saveProduct = async () => {
    if (!isEditor) return;
    // normalize images list from textarea
    const images = String(prodForm.details_imagesText || "")
      .split("\n")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const payload: any = {
      title: prodForm.title,
      description: prodForm.description,
      base_price: Number(prodForm.base_price) || 0,
      active: !!prodForm.active,
      is_home_featured: !!prodForm.is_home_featured,
      youtube_url: prodForm.youtube_url || null,
      category_id: prodForm.category_id,
      seo_title: prodForm.seo_title || null,
      seo_description: prodForm.seo_description || null,
      details: {
        story: prodForm.details_story || "",
        material: prodForm.details_material || "",
        care: prodForm.details_care || "",
        images,
      },
    };
    if (prodForm.slug) payload.slug = prodForm.slug;
    const { error } = prodForm.id
      ? await supabase.from("products").update(payload).eq("id", prodForm.id)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    setProdForm({
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
    await loadCatalog();
    toast.success("Produkt gespeichert");
  };
  const editProduct = (p: any) => {
    const details = (p.details as any) || {};
    const imagesText = Array.isArray(details.images) ? details.images.join("\n") : "";
    setProdForm({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category_id: p.category_id,
      description: p.description ?? "",
      base_price: p.base_price,
      active: p.active,
      is_home_featured: p.is_home_featured ?? false,
      youtube_url: p.youtube_url ?? "",
      seo_title: p.seo_title ?? "",
      seo_description: p.seo_description ?? "",
      details_story: details.story ?? "",
      details_material: details.material ?? "",
      details_care: details.care ?? "",
      details_imagesText: imagesText,
    });
  };
  const deleteProduct = async (id: string) => {
    if (!isEditor) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await loadCatalog();
    toast.success("Produkt gelöscht");
  };

  // Homepage CRUD
  const saveHeader = async () => {
    if (!isEditor) return;
    const payload = {
      logo_text: headerForm.logo_text || null,
      logo_image_url: headerForm.logo_image_url || null,
      is_active: true
    };
    const { error } = headerData?.id
      ? await supabase.from("homepage_header").update(payload).eq("id", headerData.id)
      : await supabase.from("homepage_header").insert(payload);
    if (error) return toast.error(error.message);
    await loadHomepageData();
    toast.success("Header gespeichert");
  };

  const saveHero = async () => {
    if (!isEditor) return;
    const payload = {
      title: heroForm.title || null,
      subtitle: heroForm.subtitle || null,
      button_primary_label: heroForm.button_primary_label || null,
      button_primary_link: heroForm.button_primary_link || null,
      button_secondary_label: heroForm.button_secondary_label || null,
      button_secondary_link: heroForm.button_secondary_link || null,
      background_image_url: heroForm.background_image_url || null,
      is_active: true
    };
    const { error } = heroData?.id
      ? await supabase.from("homepage_hero").update(payload).eq("id", heroData.id)
      : await supabase.from("homepage_hero").insert(payload);
    if (error) return toast.error(error.message);
    await loadHomepageData();
    toast.success("Hero-Bereich gespeichert");
  };

  const saveProcess = async () => {
    if (!isEditor) return;
    const payload = {
      title: processForm.title || null,
      subtitle: processForm.subtitle || null,
      button_label: processForm.button_label || null,
      button_link: processForm.button_link || null
    };
    const { error } = processData?.id
      ? await supabase.from("home_process").update(payload).eq("id", processData.id)
      : await supabase.from("home_process").insert(payload);
    if (error) return toast.error(error.message);
    await loadHomepageData();
    toast.success("Prozess-Bereich gespeichert");
  };

  const saveContactAction = async () => {
    if (!isEditor || !contactForm.label || !contactForm.url) return;
    const payload = {
      label: contactForm.label,
      url: contactForm.url,
      sort_order: contactForm.sort_order || 0,
      is_enabled: true
    };
    const { error } = editingContact?.id
      ? await supabase.from("contact_actions").update(payload).eq("id", editingContact.id)
      : await supabase.from("contact_actions").insert(payload);
    if (error) return toast.error(error.message);
    setContactForm({ label: "", url: "", sort_order: 0 });
    setEditingContact(null);
    await loadHomepageData();
    toast.success(editingContact?.id ? "Kontakt-Chip aktualisiert" : "Kontakt-Chip hinzugefügt");
  };

  const editContactAction = (contact: any) => {
    setEditingContact(contact);
    setContactForm({
      label: contact.label,
      url: contact.url,
      sort_order: contact.sort_order
    });
  };

  const cancelEditContact = () => {
    setEditingContact(null);
    setContactForm({ label: "", url: "", sort_order: 0 });
  };

  const updateContactAction = async (id: string, enabled: boolean) => {
    if (!isEditor) return;
    const { error } = await supabase.from("contact_actions").update({ is_enabled: enabled }).eq("id", id);
    if (error) return toast.error(error.message);
    await loadHomepageData();
  };

  const deleteContactAction = async (id: string) => {
    if (!isEditor) return;
    const { error } = await supabase.from("contact_actions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await loadHomepageData();
    toast.success("Kontakt-Chip gelöscht");
  };

  const saveSocialLink = async () => {
    if (!isEditor || !socialForm.platform || !socialForm.url) return;
    const payload = {
      platform: socialForm.platform,
      label: socialForm.label || socialForm.platform,
      url: socialForm.url,
      icon: socialForm.icon || "link",
      sort_order: socialForm.sort_order || 0,
      is_enabled: true
    };
    const { error } = editingSocial?.id
      ? await supabase.from("social_links").update(payload).eq("id", editingSocial.id)
      : await supabase.from("social_links").insert(payload);
    if (error) return toast.error(error.message);
    setSocialForm({ platform: "", label: "", url: "", icon: "", sort_order: 0 });
    setEditingSocial(null);
    await loadHomepageData();
    toast.success(editingSocial?.id ? "Social-Link aktualisiert" : "Social-Link hinzugefügt");
  };

  const editSocialLink = (social: any) => {
    setEditingSocial(social);
    setSocialForm({
      platform: social.platform,
      label: social.label,
      url: social.url,
      icon: social.icon,
      sort_order: social.sort_order
    });
  };

  const cancelEditSocial = () => {
    setEditingSocial(null);
    setSocialForm({ platform: "", label: "", url: "", icon: "", sort_order: 0 });
  };

  const updateSocialLink = async (id: string, enabled: boolean) => {
    if (!isEditor) return;
    const { error } = await supabase.from("social_links").update({ is_enabled: enabled }).eq("id", id);
    if (error) return toast.error(error.message);
    await loadHomepageData();
  };

  const deleteSocialLink = async (id: string) => {
    if (!isEditor) return;
    const { error } = await supabase.from("social_links").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await loadHomepageData();
    toast.success("Social-Link gelöscht");
  };

  const saveFooterContact = async () => {
    if (!isEditor) return;
    const payload = {
      content_rich: footerContactForm.content_rich || null
    };
    const { error } = footerContactData?.id
      ? await supabase.from("footer_contact_block").update(payload).eq("id", footerContactData.id)
      : await supabase.from("footer_contact_block").insert(payload);
    if (error) return toast.error(error.message);
    await loadHomepageData();
    toast.success("Footer-Kontakt gespeichert");
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

  // Users: create with edge function (requires service role secret)
  const [newUser, setNewUser] = useState({ displayName: "", email: "", role: "editor" as AppRole });
  const [createdCreds, setCreatedCreds] = useState<{ email: string; tempPassword: string; loginUrl: string } | null>(null);
  const canManageUsers = isAdmin;

  const createUser = async () => {
    if (!canManageUsers) return;
    setCreatedCreds(null);
    // Call edge function (will require SUPABASE_SERVICE_ROLE_KEY to be set)
    const { data, error } = await supabase.functions.invoke("admin-create-user", {
      body: { email: newUser.email, displayName: newUser.displayName, role: newUser.role },
    });
    if (error) return toast.error(error.message);
    setCreatedCreds({ email: data.email, tempPassword: data.tempPassword, loginUrl: `${window.location.origin}/admin` });
    toast.success("Benutzer angelegt");
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
          <TabsTrigger value="users" disabled={!canManageUsers}>Benutzer</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="mt-6">
          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-medium mb-4">Header bearbeiten</h2>
                <div className="space-y-3">
                  <div>
                    <Label>Logo-Text</Label>
                    <Input 
                      value={headerForm.logo_text} 
                      onChange={(e) => setHeaderForm({ ...headerForm, logo_text: e.target.value })} 
                      placeholder="z.B. Holzmanufaktur"
                    />
                  </div>
                  <div>
                    <Label>Logo-Bild URL</Label>
                    <Input 
                      value={headerForm.logo_image_url} 
                      onChange={(e) => setHeaderForm({ ...headerForm, logo_image_url: e.target.value })} 
                      placeholder="https://..."
                    />
                  </div>
                  <Button onClick={saveHeader} disabled={!isEditor}>Header speichern</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="font-medium mb-4">Hero-Bereich bearbeiten</h2>
                <div className="space-y-3">
                  <div>
                    <Label>Titel</Label>
                    <Input 
                      value={heroForm.title} 
                      onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })} 
                      placeholder="z.B. Holzhandwerk mit Charakter"
                    />
                  </div>
                  <div>
                    <Label>Untertitel</Label>
                    <Input 
                      value={heroForm.subtitle} 
                      onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })} 
                      placeholder="z.B. Personalisiert. Hochwertig. Handgemacht."
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Hauptbutton Text</Label>
                      <Input 
                        value={heroForm.button_primary_label} 
                        onChange={(e) => setHeroForm({ ...heroForm, button_primary_label: e.target.value })} 
                        placeholder="z.B. Jetzt entdecken"
                      />
                    </div>
                    <div>
                      <Label>Hauptbutton Link</Label>
                      <Input 
                        value={heroForm.button_primary_link} 
                        onChange={(e) => setHeroForm({ ...heroForm, button_primary_link: e.target.value })} 
                        placeholder="/products"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Zweitbutton Text</Label>
                      <Input 
                        value={heroForm.button_secondary_label} 
                        onChange={(e) => setHeroForm({ ...heroForm, button_secondary_label: e.target.value })} 
                        placeholder="z.B. Mehr erfahren"
                      />
                    </div>
                    <div>
                      <Label>Zweitbutton Link</Label>
                      <Input 
                        value={heroForm.button_secondary_link} 
                        onChange={(e) => setHeroForm({ ...heroForm, button_secondary_link: e.target.value })} 
                        placeholder="#process"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Hintergrundbild URL</Label>
                    <Input 
                      value={heroForm.background_image_url} 
                      onChange={(e) => setHeroForm({ ...heroForm, background_image_url: e.target.value })} 
                      placeholder="https://..."
                    />
                  </div>
                <Button onClick={saveHero} disabled={!isEditor}>Hero-Bereich speichern</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-medium mb-4">Prozess-Block bearbeiten</h2>
              <div className="space-y-3">
                <div>
                  <Label>Titel</Label>
                  <Input 
                    value={processForm.title} 
                    onChange={(e) => setProcessForm({ ...processForm, title: e.target.value })} 
                    placeholder="z.B. So entsteht dein Produkt"
                  />
                </div>
                <div>
                  <Label>Subtext</Label>
                  <Textarea 
                    value={processForm.subtitle} 
                    onChange={(e) => setProcessForm({ ...processForm, subtitle: e.target.value })} 
                    placeholder="z.B. Von der Idee bis zum fertigen Holzprodukt..."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>Button-Text</Label>
                    <Input 
                      value={processForm.button_label} 
                      onChange={(e) => setProcessForm({ ...processForm, button_label: e.target.value })} 
                      placeholder="z.B. Video ansehen"
                    />
                  </div>
                  <div>
                    <Label>Button-Link (Video URL)</Label>
                    <Input 
                      value={processForm.button_link} 
                      onChange={(e) => setProcessForm({ ...processForm, button_link: e.target.value })} 
                      placeholder="https://www.youtube.com/..."
                    />
                  </div>
                </div>
                <Button onClick={saveProcess} disabled={!isEditor}>Prozess-Block speichern</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-medium mb-4">Kontakt-Chips verwalten</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <Label>Label</Label>
                    <Input 
                      value={contactForm.label} 
                      onChange={(e) => setContactForm({ ...contactForm, label: e.target.value })} 
                      placeholder="z.B. Email"
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input 
                      value={contactForm.url} 
                      onChange={(e) => setContactForm({ ...contactForm, url: e.target.value })} 
                      placeholder="mailto:... oder https://..."
                    />
                  </div>
                  <div>
                    <Label>Sortierung</Label>
                    <Input 
                      type="number"
                      value={contactForm.sort_order} 
                      onChange={(e) => setContactForm({ ...contactForm, sort_order: Number(e.target.value) })} 
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveContactAction} disabled={!isEditor || !contactForm.label || !contactForm.url}>
                    {editingContact?.id ? "Kontakt-Chip aktualisieren" : "Kontakt-Chip hinzufügen"}
                  </Button>
                  {editingContact && (
                    <Button variant="outline" onClick={cancelEditContact}>
                      Abbrechen
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Vorhandene Kontakt-Chips:</h3>
                  {contactActions.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{contact.label}</span>
                        <span className="text-sm text-muted-foreground ml-2">Sortierung: {contact.sort_order}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => editContactAction(contact)}
                          disabled={!isEditor}
                        >
                          Bearbeiten
                        </Button>
                        <Button 
                          size="sm" 
                          variant={contact.is_enabled ? "default" : "outline"}
                          onClick={() => updateContactAction(contact.id, !contact.is_enabled)}
                          disabled={!isEditor}
                        >
                          {contact.is_enabled ? "Aktiv" : "Inaktiv"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteContactAction(contact.id)}
                          disabled={!isEditor}
                        >
                          Löschen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-medium mb-4">Social-Links verwalten</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <Label>Platform</Label>
                    <Input 
                      value={socialForm.platform} 
                      onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })} 
                      placeholder="z.B. instagram"
                    />
                  </div>
                  <div>
                    <Label>Label</Label>
                    <Input 
                      value={socialForm.label} 
                      onChange={(e) => setSocialForm({ ...socialForm, label: e.target.value })} 
                      placeholder="z.B. Instagram"
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input 
                      value={socialForm.url} 
                      onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })} 
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>Icon</Label>
                    <select 
                      className="w-full h-10 rounded-md border bg-background px-3"
                      value={socialForm.icon} 
                      onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })}
                    >
                      <option value="">Wählen...</option>
                      <option value="mail">Mail</option>
                      <option value="message-circle">WhatsApp</option>
                      <option value="instagram">Instagram</option>
                      <option value="message-square">Messenger</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="phone">Telefon</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveSocialLink} disabled={!isEditor || !socialForm.platform || !socialForm.url}>
                    {editingSocial?.id ? "Social-Link aktualisieren" : "Social-Link hinzufügen"}
                  </Button>
                  {editingSocial && (
                    <Button variant="outline" onClick={cancelEditSocial}>
                      Abbrechen
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Vorhandene Social-Links:</h3>
                  {socialLinks.map((social) => (
                    <div key={social.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{social.label} ({social.platform})</span>
                        <span className="text-sm text-muted-foreground ml-2">Icon: {social.icon}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => editSocialLink(social)}
                          disabled={!isEditor}
                        >
                          Bearbeiten
                        </Button>
                        <Button 
                          size="sm" 
                          variant={social.is_enabled ? "default" : "outline"}
                          onClick={() => updateSocialLink(social.id, !social.is_enabled)}
                          disabled={!isEditor}
                        >
                          {social.is_enabled ? "Aktiv" : "Inaktiv"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteSocialLink(social.id)}
                          disabled={!isEditor}
                        >
                          Löschen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-medium mb-4">Footer-Kontakt bearbeiten</h2>
              <div className="space-y-3">
                <div>
                  <Label>Kontaktinformationen (HTML erlaubt)</Label>
                  <Textarea 
                    value={footerContactForm.content_rich} 
                    onChange={(e) => setFooterContactForm({ ...footerContactForm, content_rich: e.target.value })} 
                    placeholder="Email: info@example.com<br/>Telefon: +49 123 456 789"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    HTML-Tags wie &lt;br/&gt; für Zeilenumbrüche sind erlaubt.
                  </p>
                </div>
                <Button onClick={saveFooterContact} disabled={!isEditor}>Footer-Kontakt speichern</Button>
              </div>
            </CardContent>
          </Card>
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

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-medium mb-4">Schriftarten</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Überschriften Font</Label>
                  <select 
                    className="w-full h-10 rounded-md border bg-background px-3"
                    value={themeForm.font_heading} 
                    onChange={(e) => setThemeForm({ ...themeForm, font_heading: e.target.value })}
                  >
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Lora">Lora</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Oswald">Oswald</option>
                  </select>
                </div>
                <div>
                  <Label>Body Font</Label>
                  <select 
                    className="w-full h-10 rounded-md border bg-background px-3"
                    value={themeForm.font_body} 
                    onChange={(e) => setThemeForm({ ...themeForm, font_body: e.target.value })}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Lora">Lora</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Source Sans Pro">Source Sans Pro</option>
                  </select>
                </div>
                <div>
                  <Label>Button Font</Label>
                  <select 
                    className="w-full h-10 rounded-md border bg-background px-3"
                    value={themeForm.font_button} 
                    onChange={(e) => setThemeForm({ ...themeForm, font_button: e.target.value })}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Lora">Lora</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Source Sans Pro">Source Sans Pro</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-medium mb-4">Abstände</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Section Padding Oben (px)</Label>
                  <Input 
                    type="number"
                    value={themeForm.section_padding_top} 
                    onChange={(e) => setThemeForm({ ...themeForm, section_padding_top: Number(e.target.value) })} 
                    placeholder="80"
                  />
                </div>
                <div>
                  <Label>Section Padding Unten (px)</Label>
                  <Input 
                    type="number"
                    value={themeForm.section_padding_bottom} 
                    onChange={(e) => setThemeForm({ ...themeForm, section_padding_bottom: Number(e.target.value) })} 
                    placeholder="80"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleSaveThemeSettings} disabled={!isEditor} className="w-full">
                Theme-Einstellungen speichern
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Änderungen werden sofort auf der gesamten Website sichtbar.
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-medium mb-4">{catForm.id ? "Kategorie bearbeiten" : "Neue Kategorie"}</h2>
                <div className="space-y-3">
                  <div>
                    <Label>Name</Label>
                    <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Slug (optional)</Label>
                    <Input value={catForm.slug ?? ""} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} />
                  </div>
                  <div>
                    <Label>Beschreibung</Label>
                    <Input value={catForm.description ?? ""} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
                  </div>
                  <div>
                    <Label>Sortierung</Label>
                    <Input type="number" value={catForm.sort_order} onChange={(e) => setCatForm({ ...catForm, sort_order: Number(e.target.value) })} />
                  </div>
                  <Button onClick={saveCategory} disabled={!isEditor}>Speichern</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="font-medium mb-4">Kategorien</h2>
                <ul className="space-y-3">
                  {categories.map((c) => (
                    <li key={c.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{c.name} <span className="text-xs text-muted-foreground">/{c.slug}</span></div>
                        <div className="text-sm text-muted-foreground">Sortierung: {c.sort_order}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => editCategory(c)} disabled={!isEditor}>Bearbeiten</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteCategory(c.id)} disabled={!isEditor}>Löschen</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <h2 className="font-medium">{prodForm.id ? "Produkt bearbeiten" : "Neues Produkt"}</h2>
                <div>
                  <Label>Titel</Label>
                  <Input value={prodForm.title} onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })} />
                </div>
                <div>
                  <Label>Slug (optional)</Label>
                  <Input value={prodForm.slug ?? ""} onChange={(e) => setProdForm({ ...prodForm, slug: e.target.value })} />
                </div>
                <div>
                  <Label>Kategorie</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={prodForm.category_id} onChange={(e) => setProdForm({ ...prodForm, category_id: e.target.value })}>
                    <option value="">– auswählen –</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Preis (EUR)</Label>
                  <Input type="number" step="0.01" value={prodForm.base_price} onChange={(e) => setProdForm({ ...prodForm, base_price: e.target.value })} />
                </div>
                <div>
                  <Label>Beschreibung (Teaser)</Label>
                  <Textarea value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} />
                </div>
                <Separator className="my-2" />
                <h3 className="font-medium">SEO</h3>
                <div>
                  <Label>SEO Titel</Label>
                  <Input value={prodForm.seo_title} onChange={(e) => setProdForm({ ...prodForm, seo_title: e.target.value })} />
                </div>
                <div>
                  <Label>SEO Beschreibung</Label>
                  <Textarea value={prodForm.seo_description} onChange={(e) => setProdForm({ ...prodForm, seo_description: e.target.value })} />
                </div>
                <Separator className="my-2" />
                <h3 className="font-medium">Details</h3>
                <div>
                  <Label>Story</Label>
                  <Textarea value={prodForm.details_story} onChange={(e) => setProdForm({ ...prodForm, details_story: e.target.value })} />
                </div>
                <div>
                  <Label>Material</Label>
                  <Textarea value={prodForm.details_material} onChange={(e) => setProdForm({ ...prodForm, details_material: e.target.value })} />
                </div>
                <div>
                  <Label>Pflege</Label>
                  <Textarea value={prodForm.details_care} onChange={(e) => setProdForm({ ...prodForm, details_care: e.target.value })} />
                </div>
                <div>
                  <Label>Bilder (eine URL pro Zeile)</Label>
                  <Textarea placeholder="https://...jpg" value={prodForm.details_imagesText} onChange={(e) => setProdForm({ ...prodForm, details_imagesText: e.target.value })} />
                </div>
                <div>
                  <Label>YouTube URL</Label>
                  <Input placeholder="https://www.youtube.com/embed/..." value={prodForm.youtube_url} onChange={(e) => setProdForm({ ...prodForm, youtube_url: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <input id="active" type="checkbox" checked={!!prodForm.active} onChange={(e) => setProdForm({ ...prodForm, active: e.target.checked })} />
                  <Label htmlFor="active">Aktiv</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="is_home_featured" type="checkbox" checked={!!prodForm.is_home_featured} onChange={(e) => setProdForm({ ...prodForm, is_home_featured: e.target.checked })} />
                  <Label htmlFor="is_home_featured">Als Bestseller auf Startseite anzeigen</Label>
                </div>
                <Button onClick={saveProduct} disabled={!isEditor || !prodForm.category_id}>Speichern</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="font-medium mb-4">Produkte</h2>
                <ul className="space-y-3">
                  {products.map((p) => (
                    <li key={p.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.title} <span className="text-xs text-muted-foreground">/{p.slug}</span></div>
                        <div className="text-sm text-muted-foreground">{p.active ? "Aktiv" : "Inaktiv"} · {Number(p.base_price).toFixed(2)} €</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => editProduct(p)} disabled={!isEditor}>Bearbeiten</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteProduct(p.id)} disabled={!isEditor}>Löschen</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-medium">Benutzer anlegen</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={newUser.displayName} onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })} />
                </div>
                <div>
                  <Label>E-Mail</Label>
                  <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
                <div>
                  <Label>Rolle</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as AppRole })}>
                    <option value="admin">admin</option>
                    <option value="editor">editor</option>
                    <option value="viewer">viewer</option>
                  </select>
                </div>
              </div>
              <Button onClick={createUser} disabled={!canManageUsers}>Benutzer erstellen</Button>

              {createdCreds && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Zugangsdaten (bitte sicher übermitteln):</div>
                    <pre className="rounded-md border p-3 text-sm overflow-x-auto"><code>
E-Mail: {createdCreds.email}
Passwort: {createdCreds.tempPassword}
Login: {createdCreds.loginUrl}
                    </code></pre>
                  </div>
                </>
              )}

              <p className="text-sm text-muted-foreground">Beim ersten Login muss das Passwort geändert werden.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {(isAdmin || isEditor) && (categories.length === 0 || products.length === 0) && (
        <div className="mt-8 rounded-md border p-4 text-sm">
          Hinweis: Noch keine Daten? Die Seed-Daten wurden in der DB angelegt. Aktualisiere die Seite, falls du sie noch nicht siehst.
        </div>
      )}
    </div>
  );
}
