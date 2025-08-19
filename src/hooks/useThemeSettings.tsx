import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ThemeSettings {
  id?: string;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  text_color?: string;
  accent_color?: string;
  button_bg?: string;
  button_text?: string;
  button_hover?: string;
  button_radius?: number;
  font_heading?: string;
  font_body?: string;
  font_button?: string;
  section_padding_top?: number;
  section_padding_bottom?: number;
}

export const useThemeSettings = () => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadThemeSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("theme_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading theme settings:", error);
        return;
      }

      setThemeSettings(data);
    } catch (error) {
      console.error("Error loading theme settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveThemeSettings = async (settings: Partial<ThemeSettings>) => {
    try {
      // First check if we have existing settings
      const { data: existing } = await supabase
        .from("theme_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing
        result = await supabase
          .from("theme_settings")
          .update(settings)
          .eq("id", existing.id)
          .select()
          .single();
      } else {
        // Insert new
        result = await supabase
          .from("theme_settings")
          .insert(settings)
          .select()
          .single();
      }

      if (result.error) {
        console.error("Error saving theme settings:", result.error);
        return { success: false, error: result.error };
      }

      setThemeSettings(result.data);
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error saving theme settings:", error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    loadThemeSettings();
  }, []);

  return {
    themeSettings,
    loading,
    saveThemeSettings,
    loadThemeSettings,
  };
};