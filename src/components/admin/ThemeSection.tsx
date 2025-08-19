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
  button_bg: "29 59% 48%", // Original primary color from design system
  button_text: "0 0% 100%", // Original primary-foreground
  button_hover: "29 59% 44%", // Slightly darker primary for hover
  button_radius: 8,
  font_button: "Inter",
};

const defaultTypographySettings = {
  primary_color: "29 59% 48%", // Original primary color from design system
  text_color: "0 0% 12%", // Original foreground color
  accent_color: "22 52% 89%", // Original accent color from design system
  font_heading: "Playfair Display",
  font_body: "Inter",
};

// Button Preview Component
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

// Typography Preview Component
function TypographyPreview({ settings }: { settings: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Text & Überschriften Vorschau</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Überschriften */}
        <div className="space-y-3">
          <h1 
            style={{ 
              fontFamily: settings.font_heading,
              color: `hsl(${settings.primary_color})`,
              fontSize: '32px',
              fontWeight: 'bold'
            }}
          >
            Große Überschrift (H1)
          </h1>
          <h2 
            style={{ 
              fontFamily: settings.font_heading,
              color: `hsl(${settings.primary_color})`,
              fontSize: '24px',
              fontWeight: '600'
            }}
          >
            Mittlere Überschrift (H2)
          </h2>
          <h3 
            style={{ 
              fontFamily: settings.font_heading,
              color: `hsl(${settings.text_color})`,
              fontSize: '20px',
              fontWeight: '600'
            }}
          >
            Kleine Überschrift (H3)
          </h3>
        </div>

        {/* Normaler Text */}
        <div className="space-y-3">
          <p 
            style={{ 
              fontFamily: settings.font_body,
              color: `hsl(${settings.text_color})`,
              fontSize: '16px',
              lineHeight: '1.6'
            }}
          >
            Dies ist ein normaler Fließtext, der zeigt, wie der Body-Text auf der Website aussehen wird. 
            Er verwendet die ausgewählte Schriftart und Textfarbe.
          </p>
          <p 
            style={{ 
              fontFamily: settings.font_body,
              color: `hsl(${settings.text_color})`,
              fontSize: '14px',
              lineHeight: '1.5'
            }}
          >
            Kleinerer Text für Untertitel oder weniger wichtige Informationen.
          </p>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <p style={{ fontFamily: settings.font_body, color: `hsl(${settings.text_color})` }}>
            Text mit{" "}
            <a 
              href="#"
              style={{ 
                color: `hsl(${settings.accent_color})`,
                textDecoration: 'underline',
                fontFamily: settings.font_body
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = `hsl(${settings.primary_color})`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = `hsl(${settings.accent_color})`;
              }}
            >
              einem normalen Link
            </a>{" "}
            im Fließtext.
          </p>
          <a 
            href="#"
            style={{ 
              color: `hsl(${settings.accent_color})`,
              textDecoration: 'none',
              fontFamily: settings.font_body,
              fontSize: '18px',
              fontWeight: '500',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = `hsl(${settings.primary_color})`;
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = `hsl(${settings.accent_color})`;
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Großer eigenständiger Link
          </a>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p style={{ 
              color: '#1e40af', 
              fontFamily: settings.font_body,
              fontSize: '14px',
              margin: 0
            }}>
              <strong>Hinweis:</strong> Diese Einstellungen betreffen nur Texte und Überschriften im Inhalt, nicht die Navigation oder UI-Elemente der Website.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ThemeSection({ themeSettings, onSave, isEditor }: ThemeSectionProps) {
  const [formData, setFormData] = useState(() => ({
    ...defaultButtonSettings,
    ...defaultTypographySettings,
    ...themeSettings,
  }));

  const handleChange = (key: keyof ThemeSettings, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveButtons = async () => {
    const buttonSettings = {
      button_bg: formData.button_bg,
      button_text: formData.button_text,
      button_hover: formData.button_hover,
      button_radius: formData.button_radius,
      font_button: formData.font_button,
    };
    return await onSave(buttonSettings);
  };

  const handleSaveTypography = async () => {
    const typographySettings = {
      primary_color: formData.primary_color,
      text_color: formData.text_color,
      accent_color: formData.accent_color,
      font_heading: formData.font_heading,
      font_body: formData.font_body,
    };
    return await onSave(typographySettings);
  };

  const handleResetButtons = () => {
    setFormData(prev => ({
      ...prev,
      ...defaultButtonSettings,
    }));
  };

  const handleResetTypography = () => {
    setFormData(prev => ({
      ...prev,
      ...defaultTypographySettings,
    }));
  };

  const handleResetButtonsToDefaults = () => {
    setFormData(prev => ({
      ...prev,
      ...defaultButtonSettings,
    }));
  };

  const handleResetTypographyToDefaults = () => {
    setFormData(prev => ({
      ...prev,
      ...defaultTypographySettings,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Button Settings Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Button Einstellungen
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetButtonsToDefaults}
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

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center gap-4">
                <Button onClick={handleSaveButtons} disabled={!isEditor} className="flex-1">
                  Button Einstellungen Speichern
                </Button>
                <Button onClick={handleResetButtons} variant="outline" className="flex-1">
                  Änderungen Verwerfen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6">
          <ButtonPreview settings={formData} />
        </div>
      </div>

      {/* Typography Settings Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Text & Überschriften Einstellungen
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetTypographyToDefaults}
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
                description="Hauptfarbe für wichtige Überschriften und Akzente"
              />
              <ColorField
                label="Textfarbe"
                value={formData.text_color || ""}
                onChange={(value) => handleChange('text_color', value)}
                description="Standard-Textfarbe für normalen Text"
              />
              <ColorField
                label="Link-Farbe"
                value={formData.accent_color || ""}
                onChange={(value) => handleChange('accent_color', value)}
                description="Farbe für Links und sekundäre Akzente"
              />
              
              <div className="grid grid-cols-2 gap-4">
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

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center gap-4">
                <Button onClick={handleSaveTypography} disabled={!isEditor} className="flex-1">
                  Text Einstellungen Speichern
                </Button>
                <Button onClick={handleResetTypography} variant="outline" className="flex-1">
                  Änderungen Verwerfen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6">
          <TypographyPreview settings={formData} />
        </div>
      </div>
    </div>
  );
}