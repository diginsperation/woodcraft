-- Create theme_settings table (singleton for global theme configuration)
CREATE TABLE public.theme_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_color text,
  secondary_color text,
  background_color text,
  text_color text,
  accent_color text,
  button_bg text,
  button_text text,
  button_hover text,
  button_radius integer DEFAULT 8,
  font_heading text,
  font_body text,
  font_button text,
  section_padding_top integer DEFAULT 80,
  section_padding_bottom integer DEFAULT 80,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Public can read theme settings
CREATE POLICY "Public can read theme settings" 
ON public.theme_settings 
FOR SELECT 
USING (true);

-- Only admins and editors can manage theme settings
CREATE POLICY "Editors can manage theme settings" 
ON public.theme_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_theme_settings_updated_at
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Insert default values based on current design system
INSERT INTO public.theme_settings (
  primary_color,
  secondary_color,
  background_color,
  text_color,
  accent_color,
  button_bg,
  button_text,
  button_hover,
  button_radius,
  font_heading,
  font_body,
  font_button,
  section_padding_top,
  section_padding_bottom
) VALUES (
  '29 59% 48%',       -- primary: #C17832
  '38 36% 73%',       -- secondary: #D4C2A3
  '0 0% 100%',        -- background: white
  '0 0% 12%',         -- text: #1F1F1F
  '22 52% 89%',       -- accent: #F1DED3
  '29 59% 48%',       -- button background (primary)
  '0 0% 100%',        -- button text (white)
  '29 59% 42%',       -- button hover (darker primary)
  8,                  -- button radius in px
  'Playfair Display', -- heading font
  'Inter',            -- body font
  'Inter',            -- button font
  80,                 -- section padding top
  80                  -- section padding bottom
);