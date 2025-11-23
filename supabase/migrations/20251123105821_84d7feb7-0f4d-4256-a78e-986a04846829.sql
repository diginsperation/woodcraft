-- Add field to control whether text logo should be shown alongside image logo
ALTER TABLE public.homepage_header 
ADD COLUMN IF NOT EXISTS show_text_with_image BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.homepage_header.show_text_with_image IS 'Whether to show text logo alongside image logo';