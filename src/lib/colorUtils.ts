// Color conversion utilities for Theme management

export type ColorFormat = 'HSL' | 'HEX';

export interface ColorValidation {
  isValid: boolean;
  error?: string;
}

export interface ContrastResult {
  ratio: number;
  isWCAGAA: boolean;
  warning?: string;
}

// HSL to RGB conversion
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1));
  const m = lNorm - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= hNorm && hNorm < 1/6) {
    r = c; g = x; b = 0;
  } else if (1/6 <= hNorm && hNorm < 2/6) {
    r = x; g = c; b = 0;
  } else if (2/6 <= hNorm && hNorm < 3/6) {
    r = 0; g = c; b = x;
  } else if (3/6 <= hNorm && hNorm < 4/6) {
    r = 0; g = x; b = c;
  } else if (4/6 <= hNorm && hNorm < 5/6) {
    r = x; g = 0; b = c;
  } else if (5/6 <= hNorm && hNorm < 1) {
    r = c; g = 0; b = x;
  }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

// RGB to HSL conversion
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  // Lightness
  const l = (max + min) / 2;
  
  // Saturation
  let s = 0;
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
  }
  
  // Hue
  let h = 0;
  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }
  
  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100)
  ];
}

// HEX to RGB
export function hexToRgb(hex: string): [number, number, number] | null {
  const cleanHex = hex.replace('#', '');
  
  if (cleanHex.length === 3) {
    const [r, g, b] = cleanHex.split('').map(char => parseInt(char + char, 16));
    return [r, g, b];
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    return [r, g, b];
  }
  
  return null;
}

// RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

// Parse color string to HSL values
export function parseColorToHsl(colorStr: string): [number, number, number] | null {
  const trimmed = colorStr.trim();
  
  // Parse HSL format: hsl(29, 59%, 48%) or 29 59% 48%
  const hslMatch = trimmed.match(/(?:hsl\(\s*)?(\d+)(?:\s*,\s*|\s+)(\d+)%?(?:\s*,\s*|\s+)(\d+)%?(?:\s*\))?/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]);
    const s = parseInt(hslMatch[2]);
    const l = parseInt(hslMatch[3]);
    return [h, s, l];
  }
  
  // Parse HEX format
  if (trimmed.startsWith('#')) {
    const rgb = hexToRgb(trimmed);
    if (rgb) {
      return rgbToHsl(rgb[0], rgb[1], rgb[2]);
    }
  }
  
  return null;
}

// Format HSL as string
export function formatHsl(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

// Format HSL as CSS hsl() function
export function formatHslCss(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Convert HSL to HEX
export function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// Convert HEX to HSL string format
export function hexToHslString(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  return formatHsl(h, s, l);
}

// Validate color input
export function validateColor(colorStr: string): ColorValidation {
  const trimmed = colorStr.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Farbe ist erforderlich' };
  }
  
  // Try to parse as HSL
  const hsl = parseColorToHsl(trimmed);
  if (hsl) {
    const [h, s, l] = hsl;
    
    if (h < 0 || h > 360) {
      return { isValid: false, error: 'Hue muss zwischen 0-360 liegen' };
    }
    if (s < 0 || s > 100) {
      return { isValid: false, error: 'Sättigung muss zwischen 0-100% liegen' };
    }
    if (l < 0 || l > 100) {
      return { isValid: false, error: 'Helligkeit muss zwischen 0-100% liegen' };
    }
    
    return { isValid: true };
  }
  
  // Try to parse as HEX
  if (trimmed.startsWith('#')) {
    const cleanHex = trimmed.replace('#', '');
    if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      return { isValid: false, error: 'Ungültiges HEX-Format (#RGB oder #RRGGBB)' };
    }
    return { isValid: true };
  }
  
  return { isValid: false, error: 'Ungültiges Farbformat (HSL oder HEX erwartet)' };
}

// Calculate contrast ratio between two colors
export function calculateContrast(color1Hsl: [number, number, number], color2Hsl: [number, number, number]): ContrastResult {
  const [r1, g1, b1] = hslToRgb(color1Hsl[0], color1Hsl[1], color1Hsl[2]);
  const [r2, g2, b2] = hslToRgb(color2Hsl[0], color2Hsl[1], color2Hsl[2]);
  
  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  
  const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  const isWCAGAA = ratio >= 4.5;
  
  return {
    ratio,
    isWCAGAA,
    warning: !isWCAGAA ? `Kontrast zu niedrig (${ratio.toFixed(1)}:1, min. 4.5:1 für WCAG AA)` : undefined
  };
}

// Convert color string to format for color input
export function colorToHex(colorStr: string): string {
  const hsl = parseColorToHsl(colorStr);
  if (hsl) {
    return hslToHex(hsl[0], hsl[1], hsl[2]);
  }
  
  // If already hex, return as is
  if (colorStr.startsWith('#')) {
    return colorStr;
  }
  
  return '#000000'; // fallback
}