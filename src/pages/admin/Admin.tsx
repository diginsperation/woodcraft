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

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Kategorien</TabsTrigger>
          <TabsTrigger value="products">Produkte</TabsTrigger>
          <TabsTrigger value="users" disabled={!canManageUsers}>Benutzer</TabsTrigger>
        </TabsList>

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
