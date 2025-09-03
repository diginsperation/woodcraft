-- Add image_url field to categories table for card images
ALTER TABLE public.categories 
ADD COLUMN image_url TEXT;