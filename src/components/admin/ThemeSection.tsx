import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorField } from "./ColorField";
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

const defaultButtonSettings = {
  button_bg: "29 59% 48%",
  button_text: "0 0% 100%",
  button_hover: "29 59% 42%",
  button_radius: 8,
  font_button: "Inter",
};

// Simple Button Preview Component
function ButtonPreview({ settings }: { settings: any }) {
  const buttonStyle = {
    backgroundColor: `hsl(${settings.button_bg})`,
    color: `hsl(${settings.button_text})`,
    borderRadius: `${settings.button_radius}px`,
    fontFamily: settings.font_button,
    '--hover-bg': `hsl(${settings.button_hover})`,
  } as React.CSSProperties;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Button Vorschau</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <button 
            style={buttonStyle}
            className="px-4 py-2 rounded transition-colors hover:bg-[var(--hover-bg)]"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `hsl(${settings.button_hover})`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `hsl(${settings.button_bg})`;
            }}
          >
            Standard Button
          </button>
          
          <button 
            style={{...buttonStyle, padding: '12px 24px', fontSize: '16px'}}
            className="rounded transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `hsl(${settings.button_hover})`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `hsl(${settings.button_bg})`;
            }}
          >
            Großer Button
          </button>
          
          <button 
            style={{...buttonStyle, padding: '6px 12px', fontSize: '14px'}}
            className="rounded transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `hsl(${settings.button_hover})`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `hsl(${settings.button_bg})`;
            }}
          >
            Kleiner Button
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ThemeSection({ themeSettings, onSave, isEditor }: ThemeSectionProps) {
  const [formData, setFormData] = useState(() => ({
    ...defaultButtonSettings,
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
      ...defaultButtonSettings,
      ...themeSettings,
    });
  };

  const handleResetToDefaults = () => {
    setFormData(defaultButtonSettings);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left column: Button Settings */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Button Einstellungen
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
              label="Button Hintergrund"
              value={formData.button_bg || ""}
              onChange={(value) => handleChange('button_bg', value)}
              description="Hintergrundfarbe der Buttons"
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

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center gap-4">
              <Button onClick={handleSave} disabled={!isEditor} className="flex-1">
                Button Einstellungen Speichern
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Änderungen Verwerfen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column: Button Preview */}
      <div className="lg:sticky lg:top-6">
        <ButtonPreview settings={formData} />
      </div>
    </div>
  );
}