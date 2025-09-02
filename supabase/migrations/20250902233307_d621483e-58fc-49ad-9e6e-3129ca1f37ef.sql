-- Add card_image_url column to products table for dedicated card images
ALTER TABLE public.products 
ADD COLUMN card_image_url TEXT;