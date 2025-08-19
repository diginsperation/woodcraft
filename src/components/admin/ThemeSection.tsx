import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorField } from "./ColorField";
import { ThemePreview } from "./ThemePreview";
import { ThemeSettings } from "@/hooks/useThemeSettings";
import { RotateCcw } from "lucide-react";

interface ThemeSectionProps {
  themeSettings: ThemeSettings | null;
  onSave: (settings: Partial<ThemeSettings>) => Promise<{ success: boolean; error?: any }>;
  isEditor: boolean;
}

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Roboto", label: "Roboto" },
  { value: "Poppins", label: "Poppins" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
];

const defaultTheme = {
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
};

export function ThemeSection({ themeSettings, onSave, isEditor }: ThemeSectionProps) {
  const [formData, setFormData] = useState(() => ({
    ...defaultTheme,
    ...themeSettings,
  }));

  const handleChange = (key: keyof ThemeSettings, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const result = await onSave(formData);
    return result;
  };

  const handleReset = () => {
    setFormData({
      ...defaultTheme,
      ...themeSettings,
    });
  };

  const handleResetToDefaults = () => {
    setFormData(defaultTheme);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left column: Form */}
      <div className="space-y-6">
        {/* Global Colors Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Globale Farben
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToDefaults}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Zurücksetzen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorField
              label="Primärfarbe"
              value={formData.primary_color || ""}
              onChange={(value) => handleChange('primary_color', value)}
              description="Hauptfarbe für wichtige Elemente und Branding"
            />
            <ColorField
              label="Sekundärfarbe"
              value={formData.secondary_color || ""}
              onChange={(value) => handleChange('secondary_color', value)}
              description="Ergänzende Farbe für Highlights und Akzente"
            />
            <ColorField
              label="Hintergrundfarbe"
              value={formData.background_color || ""}
              onChange={(value) => handleChange('background_color', value)}
              description="Haupthintergrund der Website"
            />
            <ColorField
              label="Akzentfarbe"
              value={formData.accent_color || ""}
              onChange={(value) => handleChange('accent_color', value)}
              description="Für Rahmen, Trennlinien und subtile Hervorhebungen"
            />
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card>
          <CardHeader>
            <CardTitle>Typografie & Schriftarten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorField
              label="Textfarbe"
              value={formData.text_color || ""}
              onChange={(value) => handleChange('text_color', value)}
              description="Standardfarbe für alle Texte"
            />
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Überschriften Schrift</Label>
                <Select
                  value={formData.font_heading}
                  onValueChange={(value) => handleChange('font_heading', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Schriftart wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Fließtext Schrift</Label>
                <Select
                  value={formData.font_body}
                  onValueChange={(value) => handleChange('font_body', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Schriftart wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons & Interaktive Elemente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorField
              label="Button Hintergrund"
              value={formData.button_bg || ""}
              onChange={(value) => handleChange('button_bg', value)}
              description="Hintergrundfarbe der Primär-Buttons"
            />
            <ColorField
              label="Button Text"
              value={formData.button_text || ""}
              onChange={(value) => handleChange('button_text', value)}
              description="Textfarbe auf Buttons"
            />
            <ColorField
              label="Button Hover"
              value={formData.button_hover || ""}
              onChange={(value) => handleChange('button_hover', value)}
              description="Button-Farbe beim Darüberfahren"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Button Schrift</Label>
                <Select
                  value={formData.font_button}
                  onValueChange={(value) => handleChange('font_button', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Schriftart wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Button Radius (px)</Label>
                <Input 
                  type="number"
                  value={formData.button_radius || 8} 
                  onChange={(e) => handleChange('button_radius', Number(e.target.value))} 
                  placeholder="8"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout & Spacing Section */}
        <Card>
          <CardHeader>
            <CardTitle>Layout & Abstände</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Oberer Bereichsabstand (px)</Label>
                <Input 
                  type="number"
                  value={formData.section_padding_top || 80} 
                  onChange={(e) => handleChange('section_padding_top', Number(e.target.value))} 
                  placeholder="80"
                  min="0"
                  max="200"
                />
              </div>
              
              <div>
                <Label>Unterer Bereichsabstand (px)</Label>
                <Input 
                  type="number"
                  value={formData.section_padding_bottom || 80} 
                  onChange={(e) => handleChange('section_padding_bottom', Number(e.target.value))} 
                  placeholder="80"
                  min="0"
                  max="200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center gap-4">
              <Button onClick={handleSave} disabled={!isEditor} className="flex-1">
                Änderungen Speichern
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Änderungen Verwerfen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column: Live Preview */}
      <div className="lg:sticky lg:top-6">
        <ThemePreview colors={formData} />
      </div>
    </div>
  );
}