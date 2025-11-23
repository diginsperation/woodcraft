-- Add logo_max_width and logo_gap to homepage_header (branding settings)
ALTER TABLE public.homepage_header
  ADD COLUMN IF NOT EXISTS logo_max_width text NULL,
  ADD COLUMN IF NOT EXISTS logo_gap integer NULL;

-- Set sensible defaults if null
UPDATE public.homepage_header
SET logo_max_height = COALESCE(logo_max_height, 40),
    logo_resize_target = COALESCE(logo_resize_target, 512),
    logo_gap = COALESCE(logo_gap, 8);
