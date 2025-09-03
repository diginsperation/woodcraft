-- Extend homepage_header table with logo management fields
ALTER TABLE public.homepage_header 
ADD COLUMN logo_font text DEFAULT 'Inter',
ADD COLUMN logo_color_light text DEFAULT '#1F2937',
ADD COLUMN logo_color_dark text DEFAULT '#F5F5F5', 
ADD COLUMN logo_alt text,
ADD COLUMN use_text_logo_if_image_fails boolean DEFAULT true,
ADD COLUMN updated_by uuid;

-- Add constraint for logo_font
ALTER TABLE public.homepage_header 
ADD CONSTRAINT check_logo_font 
CHECK (logo_font IN ('Fraunces', 'Playfair Display', 'Inter', 'System'));

-- Create function to auto-generate logo_alt if empty
CREATE OR REPLACE FUNCTION public.generate_logo_alt()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auto-generate logo_alt if empty
  IF NEW.logo_alt IS NULL OR NEW.logo_alt = '' THEN
    NEW.logo_alt := COALESCE(NEW.logo_text, 'Logo') || ' Logo';
  END IF;
  
  -- Set updated_by to current user
  NEW.updated_by := auth.uid();
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating logo_alt
CREATE TRIGGER homepage_header_generate_alt
  BEFORE INSERT OR UPDATE ON public.homepage_header
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_logo_alt();

-- Create logo_versions table for versioning
CREATE TABLE public.logo_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  header_id uuid REFERENCES public.homepage_header(id) ON DELETE CASCADE,
  logo_text text,
  logo_font text,
  logo_color_light text,
  logo_color_dark text,
  logo_image_url text,
  logo_alt text,
  use_text_logo_if_image_fails boolean,
  version_number integer NOT NULL DEFAULT 1,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT false
);

-- Enable RLS on logo_versions
ALTER TABLE public.logo_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for logo_versions
CREATE POLICY "Editors can manage logo versions" 
ON public.logo_versions 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Public can read active logo versions" 
ON public.logo_versions 
FOR SELECT 
USING (is_active = true);