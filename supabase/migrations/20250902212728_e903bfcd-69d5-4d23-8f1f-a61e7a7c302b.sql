-- Add missing video_url column to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS video_url text;

-- Ensure video_mode column exists with default
ALTER TABLE public.products 
ALTER COLUMN video_mode SET DEFAULT 'none';