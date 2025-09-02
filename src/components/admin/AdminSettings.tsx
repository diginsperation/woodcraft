import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminSettingsProps {
  canEdit: boolean;
}

export function AdminSettings({ canEdit }: AdminSettingsProps) {
  const [settings, setSettings] = useState({
    maxImageSize: 10, // MB
    maxVideoSize: 100, // MB
    allowedImageFormats: "jpg,jpeg,png,webp,gif",
    allowedVideoFormats: "mp4,webm,mov",
    imageQuality: 85, // percentage
    maxImageWidth: 1920,
    maxImageHeight: 1920
  });

  const [storageStats, setStorageStats] = useState({
    totalUsed: 0,
    imageCount: 0,
    videoCount: 0
  });

  useEffect(() => {
    loadSettings();
    loadStorageStats();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from("theme_settings")
        .select("*")
        .maybeSingle();

      if (data && data.id) {
        // Load settings from theme_settings or use defaults
        setSettings(prev => ({
          ...prev,
          // Map theme settings to media settings if they exist
        }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadStorageStats = async () => {
    try {
      const { data: files, error } = await supabase.storage
        .from("product-media")
        .list("", {
          limit: 1000,
          sortBy: { column: "created_at", order: "desc" }
        });

      if (error) throw error;

      let totalSize = 0;
      let imageCount = 0;
      let videoCount = 0;

      for (const file of files || []) {
        if (file.metadata?.size) {
          totalSize += file.metadata.size;
        }
        
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
          imageCount++;
        } else if (['mp4', 'webm', 'mov'].includes(extension || '')) {
          videoCount++;
        }
      }

      setStorageStats({
        totalUsed: totalSize,
        imageCount,
        videoCount
      });
    } catch (error) {
      console.error("Error loading storage stats:", error);
    }
  };

  const saveSettings = async () => {
    if (!canEdit) return;

    try {
      // Here you could save to a dedicated admin_settings table
      // For now, we'll use localStorage as a simple solution
      localStorage.setItem("adminMediaSettings", JSON.stringify(settings));
      toast.success("Einstellungen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern der Einstellungen");
    }
  };

  const cleanupUnusedFiles = async () => {
    if (!canEdit) return;

    try {
      // Get all files in storage
      const { data: files } = await supabase.storage
        .from("product-media")
        .list("", { limit: 1000 });

      // Get all used URLs from products and product_images
      const [{ data: products }, { data: productImages }] = await Promise.all([
        supabase.from("products").select("main_image_url, video_url"),
        supabase.from("product_images").select("url")
      ]);

      const usedUrls = new Set();
      products?.forEach(p => {
        if (p.main_image_url) usedUrls.add(p.main_image_url.split('/').pop());
        if (p.video_url) usedUrls.add(p.video_url.split('/').pop());
      });
      productImages?.forEach(img => {
        if (img.url) usedUrls.add(img.url.split('/').pop());
      });

      // Find unused files
      const unusedFiles = files?.filter(file => !usedUrls.has(file.name)) || [];

      if (unusedFiles.length === 0) {
        toast.success("Keine ungenutzten Dateien gefunden");
        return;
      }

      // Delete unused files
      const filesToDelete = unusedFiles.map(f => f.name);
      const { error } = await supabase.storage
        .from("product-media")
        .remove(filesToDelete);

      if (error) throw error;

      toast.success(`${unusedFiles.length} ungenutzte Dateien gelöscht`);
      loadStorageStats();
    } catch (error: any) {
      toast.error(`Fehler beim Aufräumen: ${error.message}`);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload-Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxImageSize">Max. Bildgröße (MB)</Label>
              <Input
                id="maxImageSize"
                type="number"
                value={settings.maxImageSize}
                onChange={(e) => setSettings(prev => ({ ...prev, maxImageSize: Number(e.target.value) }))}
                disabled={!canEdit}
              />
            </div>
            <div>
              <Label htmlFor="maxVideoSize">Max. Videogröße (MB)</Label>
              <Input
                id="maxVideoSize"
                type="number"
                value={settings.maxVideoSize}
                onChange={(e) => setSettings(prev => ({ ...prev, maxVideoSize: Number(e.target.value) }))}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="allowedImageFormats">Erlaubte Bildformate (kommagetrennt)</Label>
            <Input
              id="allowedImageFormats"
              value={settings.allowedImageFormats}
              onChange={(e) => setSettings(prev => ({ ...prev, allowedImageFormats: e.target.value }))}
              disabled={!canEdit}
              placeholder="jpg,jpeg,png,webp,gif"
            />
          </div>

          <div>
            <Label htmlFor="allowedVideoFormats">Erlaubte Videoformate (kommagetrennt)</Label>
            <Input
              id="allowedVideoFormats"
              value={settings.allowedVideoFormats}
              onChange={(e) => setSettings(prev => ({ ...prev, allowedVideoFormats: e.target.value }))}
              disabled={!canEdit}
              placeholder="mp4,webm,mov"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="imageQuality">Bildqualität (%)</Label>
              <Input
                id="imageQuality"
                type="number"
                min="10"
                max="100"
                value={settings.imageQuality}
                onChange={(e) => setSettings(prev => ({ ...prev, imageQuality: Number(e.target.value) }))}
                disabled={!canEdit}
              />
            </div>
            <div>
              <Label htmlFor="maxImageWidth">Max. Bildbreite (px)</Label>
              <Input
                id="maxImageWidth"
                type="number"
                value={settings.maxImageWidth}
                onChange={(e) => setSettings(prev => ({ ...prev, maxImageWidth: Number(e.target.value) }))}
                disabled={!canEdit}
              />
            </div>
            <div>
              <Label htmlFor="maxImageHeight">Max. Bildhöhe (px)</Label>
              <Input
                id="maxImageHeight"
                type="number"
                value={settings.maxImageHeight}
                onChange={(e) => setSettings(prev => ({ ...prev, maxImageHeight: Number(e.target.value) }))}
                disabled={!canEdit}
              />
            </div>
          </div>

          {canEdit && (
            <Button onClick={saveSettings}>
              Einstellungen speichern
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Speicher-Statistiken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{formatBytes(storageStats.totalUsed)}</div>
              <div className="text-sm text-muted-foreground">Gesamt belegt</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{storageStats.imageCount}</div>
              <div className="text-sm text-muted-foreground">Bilder</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{storageStats.videoCount}</div>
              <div className="text-sm text-muted-foreground">Videos</div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Speicher aufräumen</h4>
              <p className="text-sm text-muted-foreground">
                Entfernt ungenutzte Dateien aus dem Speicher
              </p>
            </div>
            {canEdit && (
              <Button variant="outline" onClick={cleanupUnusedFiles}>
                Jetzt aufräumen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}