import { useEffect } from "react";
import { useThemeSettings } from "@/hooks/useThemeSettings";

export const ThemeApplicator = () => {
  const { themeSettings, loading } = useThemeSettings();

  useEffect(() => {
    if (loading || !themeSettings) return;

    const root = document.documentElement;

    // Apply color variables
    if (themeSettings.primary_color) {
      root.style.setProperty('--primary', themeSettings.primary_color);
    }
    if (themeSettings.secondary_color) {
      root.style.setProperty('--secondary', themeSettings.secondary_color);
    }
    if (themeSettings.background_color) {
      root.style.setProperty('--background', themeSettings.background_color);
    }
    if (themeSettings.text_color) {
      root.style.setProperty('--foreground', themeSettings.text_color);
    }
    if (themeSettings.accent_color) {
      root.style.setProperty('--accent', themeSettings.accent_color);
    }

    // Apply button variables
    if (themeSettings.button_bg) {
      root.style.setProperty('--button-bg', themeSettings.button_bg);
    }
    if (themeSettings.button_text) {
      root.style.setProperty('--button-text', themeSettings.button_text);
    }
    if (themeSettings.button_hover) {
      root.style.setProperty('--button-hover', themeSettings.button_hover);
    }
    if (themeSettings.button_radius) {
      root.style.setProperty('--button-radius', `${themeSettings.button_radius}px`);
    }

    // Apply font variables
    if (themeSettings.font_heading) {
      root.style.setProperty('--font-heading', themeSettings.font_heading);
    }
    if (themeSettings.font_body) {
      root.style.setProperty('--font-body', themeSettings.font_body);
    }
    if (themeSettings.font_button) {
      root.style.setProperty('--font-button', themeSettings.font_button);
    }

    // Apply spacing variables
    if (themeSettings.section_padding_top) {
      root.style.setProperty('--section-padding-top', `${themeSettings.section_padding_top}px`);
    }
    if (themeSettings.section_padding_bottom) {
      root.style.setProperty('--section-padding-bottom', `${themeSettings.section_padding_bottom}px`);
    }

    // Load Google Fonts if needed
    const fontsToLoad = [
      themeSettings.font_heading,
      themeSettings.font_body,
      themeSettings.font_button
    ].filter((font, index, self) => font && self.indexOf(font) === index);

    fontsToLoad.forEach(font => {
      if (font && !document.querySelector(`link[href*="${encodeURIComponent(font)}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;700&display=swap`;
        document.head.appendChild(link);
      }
    });

  }, [themeSettings, loading]);

  return null;
};