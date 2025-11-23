-- Add logo size settings to homepage_header
ALTER TABLE public.homepage_header
ADD COLUMN IF NOT EXISTS logo_max_height integer DEFAULT 40,
ADD COLUMN IF NOT EXISTS logo_resize_target integer DEFAULT 512;

COMMENT ON COLUMN public.homepage_header.logo_max_height IS 'Maximum height of logo in frontend (px)';
COMMENT ON COLUMN public.homepage_header.logo_resize_target IS 'Target resolution for automatic scaling on upload (px)';