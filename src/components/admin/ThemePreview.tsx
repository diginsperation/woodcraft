import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseColorToHsl, formatHslCss, calculateContrast } from "@/lib/colorUtils";

interface ThemePreviewProps {
  colors: {
    primary_color?: string;
    secondary_color?: string;
    background_color?: string;
    text_color?: string;
    accent_color?: string;
    button_bg?: string;
    button_text?: string;
    button_hover?: string;
  };
}

export function ThemePreview({ colors }: ThemePreviewProps) {
  // Convert HSL strings to CSS colors
  const cssColors = useMemo(() => {
    const toCSS = (colorStr?: string) => {
      if (!colorStr) return '';
      const hsl = parseColorToHsl(colorStr);
      return hsl ? formatHslCss(hsl[0], hsl[1], hsl[2]) : colorStr;
    };
    
    return {
      primary: toCSS(colors.primary_color),
      secondary: toCSS(colors.secondary_color), 
      background: toCSS(colors.background_color),
      text: toCSS(colors.text_color),
      accent: toCSS(colors.accent_color),
      buttonBg: toCSS(colors.button_bg),
      buttonText: toCSS(colors.button_text),
      buttonHover: toCSS(colors.button_hover),
    };
  }, [colors]);

  // Calculate contrast warnings
  const contrastWarnings = useMemo(() => {
    const warnings: string[] = [];
    
    // Check text vs background
    if (colors.text_color && colors.background_color) {
      const textHsl = parseColorToHsl(colors.text_color);
      const bgHsl = parseColorToHsl(colors.background_color);
      if (textHsl && bgHsl) {
        const contrast = calculateContrast(textHsl, bgHsl);
        if (!contrast.isWCAGAA && contrast.warning) {
          warnings.push(`Text/Hintergrund: ${contrast.warning}`);
        }
      }
    }
    
    // Check button text vs button background
    if (colors.button_text && colors.button_bg) {
      const btnTextHsl = parseColorToHsl(colors.button_text);
      const btnBgHsl = parseColorToHsl(colors.button_bg);
      if (btnTextHsl && btnBgHsl) {
        const contrast = calculateContrast(btnTextHsl, btnBgHsl);
        if (!contrast.isWCAGAA && contrast.warning) {
          warnings.push(`Button-Text/Hintergrund: ${contrast.warning}`);
        }
      }
    }
    
    return warnings;
  }, [colors]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Live-Vorschau</h3>
      
      {/* Contrast warnings */}
      {contrastWarnings.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Kontrast-Warnungen</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {contrastWarnings.map((warning, i) => (
              <li key={i}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Preview card */}
      <Card 
        className="border-2" 
        style={{ 
          backgroundColor: cssColors.background,
          color: cssColors.text,
          borderColor: cssColors.accent || '#e5e7eb'
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: cssColors.primary }}>
            Beispiel-Überschrift
          </CardTitle>
          <p className="text-sm opacity-75">
            Dies ist ein Beispiel-Text, um zu zeigen, wie die Farben aussehen werden.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Buttons preview */}
          <div className="flex gap-2 flex-wrap">
            <Button
              style={{
                backgroundColor: cssColors.buttonBg,
                color: cssColors.buttonText,
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (cssColors.buttonHover) {
                  e.currentTarget.style.backgroundColor = cssColors.buttonHover;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = cssColors.buttonBg;
              }}
            >
              Primär-Button
            </Button>
            
            <Button 
              variant="outline"
              style={{
                borderColor: cssColors.primary,
                color: cssColors.primary
              }}
            >
              Outline-Button
            </Button>
            
            <Button 
              variant="secondary"
              style={{
                backgroundColor: cssColors.secondary,
                color: cssColors.text
              }}
            >
              Sekundär-Button
            </Button>
          </div>
          
          {/* Text examples */}
          <div className="space-y-2">
            <h4 style={{ color: cssColors.primary }}>Beispiel-Unterüberschrift</h4>
            <p>
              Normaler Fließtext in der ausgewählten Textfarbe. 
              <a href="#" style={{ color: cssColors.primary, textDecoration: 'underline' }}>
                Dies ist ein Link
              </a> in der Primärfarbe.
            </p>
            
            <div className="flex gap-2">
              <Badge style={{ backgroundColor: cssColors.accent, color: cssColors.text }}>
                Akzent-Badge
              </Badge>
              <Badge style={{ backgroundColor: cssColors.primary, color: cssColors.buttonText }}>
                Primär-Badge  
              </Badge>
            </div>
          </div>
          
          {/* Color swatches */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div className="font-medium">Primärfarbe</div>
              <div 
                className="h-8 w-full rounded border"
                style={{ backgroundColor: cssColors.primary }}
              />
              <div className="text-muted-foreground">{colors.primary_color}</div>
            </div>
            
            <div className="space-y-1">
              <div className="font-medium">Sekundärfarbe</div>
              <div 
                className="h-8 w-full rounded border"
                style={{ backgroundColor: cssColors.secondary }}
              />
              <div className="text-muted-foreground">{colors.secondary_color}</div>
            </div>
            
            <div className="space-y-1">
              <div className="font-medium">Hintergrund</div>
              <div 
                className="h-8 w-full rounded border"
                style={{ backgroundColor: cssColors.background }}
              />
              <div className="text-muted-foreground">{colors.background_color}</div>
            </div>
            
            <div className="space-y-1">
              <div className="font-medium">Textfarbe</div>
              <div 
                className="h-8 w-full rounded border"
                style={{ backgroundColor: cssColors.text }}
              />
              <div className="text-muted-foreground">{colors.text_color}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}