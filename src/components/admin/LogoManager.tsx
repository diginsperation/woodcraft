import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Eye, Monitor, Smartphone } from "lucide-react";

interface LogoSettings {
  id?: string;
  logo_text?: string;
  logo_font?: 'Fraunces' | 'Playfair Display' | 'Inter' | 'System';
  logo_color_light?: string;
  logo_color_dark?: string;
  logo_image_url?: string;
  logo_alt?: string;
  use_text_logo_if_image_fails?: boolean;
  show_text_with_image?: boolean;
  logo_max_height?: number;
  logo_max_width?: string;
  logo_gap?: number;
  logo_resize_target?: number;
}

interface LogoManagerProps {
  canEdit: boolean;
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern Sans)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant Serif)' },
  { value: 'Fraunces', label: 'Fraunces (Creative Serif)' },
  { value: 'System', label: 'System Default' }
];

export function LogoManager({ canEdit }: LogoManagerProps) {
  const [settings, setSettings] = useState<LogoSettings>({
    logo_text: '',
    logo_font: 'Inter',
    logo_color_light: '#1F2937',
    logo_color_dark: '#F5F5F5',
    logo_alt: '',
    use_text_logo_if_image_fails: true,
    logo_max_height: 40,
    logo_max_width: 'auto',
    logo_gap: 8,
    logo_resize_target: 512
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkPreview, setIsDarkPreview] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_header')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings({
          id: data.id,
          logo_text: data.logo_text || '',
          logo_font: (data.logo_font as any) || 'Inter',
          logo_color_light: data.logo_color_light || '#1F2937',
          logo_color_dark: data.logo_color_dark || '#F5F5F5',
          logo_image_url: data.logo_image_url || '',
          logo_alt: data.logo_alt || '',
          use_text_logo_if_image_fails: data.use_text_logo_if_image_fails ?? true,
          show_text_with_image: data.show_text_with_image ?? true,
          logo_max_height: data.logo_max_height ?? 40,
          logo_max_width: data.logo_max_width || 'auto',
          logo_gap: data.logo_gap ?? 8,
          logo_resize_target: data.logo_resize_target ?? 512
        });
      }
    } catch (error: any) {
      console.error('Error loading logo settings:', error);
      toast.error('Fehler beim Laden der Logo-Einstellungen');
    }
  };

  const updateSettings = async (updates: Partial<LogoSettings>) => {
    if (!canEdit) return;

    setIsLoading(true);
    try {
      const payload: any = {};
      if (updates.logo_text !== undefined) payload.logo_text = updates.logo_text;
      if (updates.logo_font !== undefined) payload.logo_font = updates.logo_font;
      if (updates.logo_color_light !== undefined) payload.logo_color_light = updates.logo_color_light;
      if (updates.logo_color_dark !== undefined) payload.logo_color_dark = updates.logo_color_dark;
      if (updates.logo_alt !== undefined) payload.logo_alt = updates.logo_alt;
      if (updates.use_text_logo_if_image_fails !== undefined) payload.use_text_logo_if_image_fails = updates.use_text_logo_if_image_fails;
      if (updates.show_text_with_image !== undefined) payload.show_text_with_image = updates.show_text_with_image;
      if (updates.logo_max_height !== undefined) payload.logo_max_height = updates.logo_max_height;
      if (updates.logo_max_width !== undefined) payload.logo_max_width = updates.logo_max_width;
      if (updates.logo_gap !== undefined) payload.logo_gap = updates.logo_gap;
      if (updates.logo_resize_target !== undefined) payload.logo_resize_target = updates.logo_resize_target;
      
      payload.is_active = true;

      const { error } = settings.id
        ? await supabase.from('homepage_header').update(payload).eq('id', settings.id)
        : await supabase.from('homepage_header').insert(payload);

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...updates }));
      toast.success('Logo-Einstellungen gespeichert');
    } catch (error: any) {
      console.error('Error updating logo settings:', error);
      toast.error('Fehler beim Speichern der Einstellungen');
    } finally {
      setIsLoading(false);
    }
  };

  const resizeImage = (file: File, targetSize: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate proportional dimensions
        let { width, height } = img;
        const maxDimension = Math.max(width, height);
        
        if (maxDimension > targetSize) {
          const scale = targetSize / maxDimension;
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          file.type,
          0.92
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;

    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/webp', 'image/jpeg', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Nur SVG, PNG, WebP, JPEG und AVIF Dateien sind erlaubt');
      return;
    }

    // Validate file size
    const maxSize = file.type === 'image/svg+xml' ? 200 * 1024 : 2 * 1024 * 1024; // 200KB for SVG, 2MB for others
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      toast.error(`Datei zu groß. Maximum: ${maxSizeMB}MB`);
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      let fileToUpload: File | Blob = file;
      let wasResized = false;
      const isSvg = file.type === 'image/svg+xml';

      // Resize raster images if needed
      if (!isSvg && settings.logo_resize_target) {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            URL.revokeObjectURL(url);
            const maxDimension = Math.max(img.width, img.height);
            if (maxDimension > settings.logo_resize_target!) {
              wasResized = true;
            }
            resolve();
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
          };
          img.src = url;
        });

        if (wasResized) {
          fileToUpload = await resizeImage(file, settings.logo_resize_target);
        }
      }

      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const filename = `logo-${timestamp}.${ext}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-media')
        .upload(`logos/${filename}`, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-media')
        .getPublicUrl(`logos/${filename}`);

      // Update database
      const payload = { logo_image_url: publicUrl, is_active: true };
      const { error: dbError } = settings.id
        ? await supabase.from('homepage_header').update(payload).eq('id', settings.id)
        : await supabase.from('homepage_header').insert(payload);

      if (dbError) throw dbError;

      setSettings(prev => ({ ...prev, logo_image_url: publicUrl }));
      
      if (isSvg) {
        toast.success('Logo erfolgreich hochgeladen (Optimale Qualität - SVG)');
      } else if (wasResized) {
        toast.success('Logo erfolgreich hochgeladen (Bild wurde automatisch verkleinert)');
      } else {
        toast.success('Logo erfolgreich hochgeladen');
      }
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error('Fehler beim Hochladen des Logos');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const deleteLogo = async () => {
    if (!canEdit) return;

    setIsLoading(true);
    try {
      // Extract filename from URL
      if (settings.logo_image_url) {
        const urlParts = settings.logo_image_url.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        // Delete from storage
        await supabase.storage
          .from('product-media')
          .remove([`logos/${filename}`]);
      }

      // Update database
      const payload = { logo_image_url: null };
      const { error } = settings.id
        ? await supabase.from('homepage_header').update(payload).eq('id', settings.id)
        : await supabase.from('homepage_header').insert({ ...payload, is_active: true });

      if (error) throw error;

      setSettings(prev => ({ ...prev, logo_image_url: '' }));
      toast.success('Logo gelöscht - Textlogo wird als Fallback verwendet');
    } catch (error: any) {
      console.error('Error deleting logo:', error);
      toast.error('Fehler beim Löschen des Logos');
    } finally {
      setIsLoading(false);
    }
  };

  const getFontFamily = (font: string) => {
    switch (font) {
      case 'Fraunces': return 'Fraunces, serif';
      case 'Playfair Display': return 'Playfair Display, serif';
      case 'Inter': return 'Inter, sans-serif';
      default: return 'system-ui, sans-serif';
    }
  };

  const PreviewLogo = () => {
    const currentColor = isDarkPreview ? settings.logo_color_dark : settings.logo_color_light;
    const backgroundColor = isDarkPreview ? '#0f172a' : '#ffffff';
    
    // Apply responsive sizing
    let effectiveHeight = settings.logo_max_height || 40;
    if (isMobilePreview) {
      effectiveHeight = Math.min(effectiveHeight, 28);
    }
    
    const logoMaxHeight = `${effectiveHeight}px`;
    const logoMaxWidth = settings.logo_max_width === 'auto' ? 'auto' : `${settings.logo_max_width}px`;
    const logoGap = `${Math.min(settings.logo_gap || 8, isMobilePreview ? 8 : 999)}px`;
    const fontSize = isMobilePreview ? '1.25rem' : '1.5rem';
    
    const hasImage = settings.logo_image_url;
    const showText = settings.logo_text && (
      !hasImage || 
      settings.show_text_with_image === true
    );
    
    return (
      <div 
        className="p-6 rounded-lg border transition-colors duration-200"
        style={{ backgroundColor }}
      >
        <div className="flex items-center justify-center min-h-[60px]">
          <div 
            className="flex items-center"
            style={{ gap: logoGap }}
          >
            {hasImage && (
              <img 
                src={settings.logo_image_url}
                alt={settings.logo_alt || `${settings.logo_text} Logo`}
                style={{ 
                  maxHeight: logoMaxHeight,
                  maxWidth: logoMaxWidth,
                  height: 'auto',
                  width: 'auto',
                  objectFit: 'contain',
                  objectPosition: 'center left'
                }}
              />
            )}
            
            {showText && (
              <div 
                style={{ 
                  color: currentColor,
                  fontFamily: getFontFamily(settings.logo_font || 'Inter'),
                  fontSize,
                  fontWeight: 600
                }}
              >
                {settings.logo_text || 'Logo Text'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logo-Verwaltung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Logo Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Text-Logo Einstellungen</h4>
            
            <div>
              <Label htmlFor="logoText">Logo-Text</Label>
              <Input
                id="logoText"
                value={settings.logo_text}
                onChange={(e) => setSettings(prev => ({ ...prev, logo_text: e.target.value }))}
                onBlur={() => updateSettings({ logo_text: settings.logo_text })}
                disabled={!canEdit || isLoading}
                placeholder="Firmenname"
              />
            </div>

            <div>
              <Label htmlFor="logoFont">Schriftart</Label>
              <Select 
                value={settings.logo_font} 
                onValueChange={(value: any) => {
                  setSettings(prev => ({ ...prev, logo_font: value }));
                  updateSettings({ logo_font: value });
                }}
                disabled={!canEdit || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Schriftart wählen" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="colorLight">Farbe (Hell)</Label>
                <div className="flex gap-2">
                  <Input
                    id="colorLight"
                    type="color"
                    value={settings.logo_color_light}
                    onChange={(e) => setSettings(prev => ({ ...prev, logo_color_light: e.target.value }))}
                    onBlur={() => updateSettings({ logo_color_light: settings.logo_color_light })}
                    disabled={!canEdit || isLoading}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={settings.logo_color_light}
                    onChange={(e) => setSettings(prev => ({ ...prev, logo_color_light: e.target.value }))}
                    onBlur={() => updateSettings({ logo_color_light: settings.logo_color_light })}
                    disabled={!canEdit || isLoading}
                    placeholder="#1F2937"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="colorDark">Farbe (Dunkel)</Label>
                <div className="flex gap-2">
                  <Input
                    id="colorDark"
                    type="color"
                    value={settings.logo_color_dark}
                    onChange={(e) => setSettings(prev => ({ ...prev, logo_color_dark: e.target.value }))}
                    onBlur={() => updateSettings({ logo_color_dark: settings.logo_color_dark })}
                    disabled={!canEdit || isLoading}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={settings.logo_color_dark}
                    onChange={(e) => setSettings(prev => ({ ...prev, logo_color_dark: e.target.value }))}
                    onBlur={() => updateSettings({ logo_color_dark: settings.logo_color_dark })}
                    disabled={!canEdit || isLoading}
                    placeholder="#F5F5F5"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Image Logo Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Bild-Logo</h4>
            
            {settings.logo_image_url ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/20">
                  <img 
                    src={settings.logo_image_url}
                    alt={settings.logo_alt || 'Logo'}
                    className="h-12 object-contain"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!canEdit || isLoading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Ersetzen
                  </Button>
                  <Button
                    variant="outline"
                    onClick={deleteLogo}
                    disabled={!canEdit || isLoading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Löschen
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Klicken zum Hochladen oder Datei hierher ziehen
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    SVG (200KB), PNG/WebP/JPEG/AVIF (512KB) • Min. 560×160px
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,.png,.webp,.jpg,.jpeg,.avif"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div>
              <Label htmlFor="logoAlt">Alt-Text</Label>
              <Input
                id="logoAlt"
                value={settings.logo_alt}
                onChange={(e) => setSettings(prev => ({ ...prev, logo_alt: e.target.value }))}
                onBlur={() => updateSettings({ logo_alt: settings.logo_alt })}
                disabled={!canEdit || isLoading}
                placeholder="Automatisch generiert aus Logo-Text"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showTextWithImage"
                  checked={settings.show_text_with_image ?? true}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, show_text_with_image: checked }));
                    updateSettings({ show_text_with_image: checked });
                  }}
                  disabled={!canEdit || isLoading}
                />
                <Label htmlFor="showTextWithImage">
                  Text neben dem Bild-Logo anzeigen
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="useFallback"
                  checked={settings.use_text_logo_if_image_fails}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, use_text_logo_if_image_fails: checked }));
                    updateSettings({ use_text_logo_if_image_fails: checked });
                  }}
                  disabled={!canEdit || isLoading}
                />
                <Label htmlFor="useFallback">
                  Text-Logo als Fallback verwenden wenn Bild nicht lädt
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Size Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Größeneinstellungen</h4>
            
            <div>
              <Label htmlFor="logoMaxHeight">Logo-Höhe im Frontend</Label>
              <Select 
                value={String(settings.logo_max_height)} 
                onValueChange={(value) => {
                  const height = parseInt(value);
                  setSettings(prev => ({ ...prev, logo_max_height: height }));
                  updateSettings({ logo_max_height: height });
                }}
                disabled={!canEdit || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Höhe wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 px</SelectItem>
                  <SelectItem value="32">32 px</SelectItem>
                  <SelectItem value="40">40 px (Standard)</SelectItem>
                  <SelectItem value="48">48 px</SelectItem>
                  <SelectItem value="64">64 px</SelectItem>
                  <SelectItem value="80">80 px</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Maximale Höhe des Logos im Header/Footer
              </p>
            </div>

            <div>
              <Label htmlFor="logoMaxWidth">Logo-Breite im Frontend</Label>
              <Select 
                value={settings.logo_max_width || 'auto'} 
                onValueChange={(value) => {
                  setSettings(prev => ({ ...prev, logo_max_width: value }));
                  updateSettings({ logo_max_width: value });
                }}
                disabled={!canEdit || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Breite wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">auto (proportional)</SelectItem>
                  <SelectItem value="24">24 px</SelectItem>
                  <SelectItem value="32">32 px</SelectItem>
                  <SelectItem value="40">40 px</SelectItem>
                  <SelectItem value="48">48 px</SelectItem>
                  <SelectItem value="64">64 px</SelectItem>
                  <SelectItem value="80">80 px</SelectItem>
                  <SelectItem value="120">120 px</SelectItem>
                  <SelectItem value="160">160 px</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Maximale Breite des Logos (auto = proportional zur Höhe)
              </p>
            </div>

            <div>
              <Label htmlFor="logoGap">Abstand zwischen Bild- und Textlogo</Label>
              <Select 
                value={String(settings.logo_gap)} 
                onValueChange={(value) => {
                  const gap = parseInt(value);
                  setSettings(prev => ({ ...prev, logo_gap: gap }));
                  updateSettings({ logo_gap: gap });
                }}
                disabled={!canEdit || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Abstand wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 px</SelectItem>
                  <SelectItem value="6">6 px</SelectItem>
                  <SelectItem value="8">8 px (Standard)</SelectItem>
                  <SelectItem value="10">10 px</SelectItem>
                  <SelectItem value="12">12 px</SelectItem>
                  <SelectItem value="16">16 px</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Abstand zwischen Bild- und Text-Logo
              </p>
            </div>

            <div>
              <Label htmlFor="logoResizeTarget">Maximale Upload-Auflösung</Label>
              <Select 
                value={String(settings.logo_resize_target)} 
                onValueChange={(value) => {
                  const target = parseInt(value);
                  setSettings(prev => ({ ...prev, logo_resize_target: target }));
                  updateSettings({ logo_resize_target: target });
                }}
                disabled={!canEdit || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zielgröße wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="256">256 px</SelectItem>
                  <SelectItem value="512">512 px (Standard)</SelectItem>
                  <SelectItem value="1024">1024 px</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                SVG-Dateien werden nie skaliert und bleiben immer gestochen scharf. PNG/JPEG/WebP werden proportional verkleinert.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vorschau</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={isDarkPreview ? "outline" : "default"}
                size="sm"
                onClick={() => setIsDarkPreview(false)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Hell
              </Button>
              <Button
                variant={isDarkPreview ? "default" : "outline"}
                size="sm"
                onClick={() => setIsDarkPreview(true)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Dunkel
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant={isMobilePreview ? "outline" : "default"}
                size="sm"
                onClick={() => setIsMobilePreview(false)}
              >
                <Monitor className="w-4 h-4 mr-1" />
                Desktop
              </Button>
              <Button
                variant={isMobilePreview ? "default" : "outline"}
                size="sm"
                onClick={() => setIsMobilePreview(true)}
              >
                <Smartphone className="w-4 h-4 mr-1" />
                Mobile
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PreviewLogo />
          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>Höhe:</strong> {settings.logo_max_height}px</p>
            <p><strong>Schrift:</strong> {settings.logo_font}</p>
            <p><strong>Farbe:</strong> {isDarkPreview ? settings.logo_color_dark : settings.logo_color_light}</p>
            <p><strong>Upload-Skalierung:</strong> {settings.logo_resize_target}px (max. Dimension)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}