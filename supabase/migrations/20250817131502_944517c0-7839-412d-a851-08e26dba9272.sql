-- Add is_home_featured field to products table
ALTER TABLE public.products 
ADD COLUMN is_home_featured BOOLEAN DEFAULT false;

-- Optional: Add home_featured_order field for future sorting
ALTER TABLE public.products 
ADD COLUMN home_featured_order INTEGER NULL;