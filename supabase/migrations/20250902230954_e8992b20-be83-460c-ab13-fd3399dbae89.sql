-- Add card image configuration to products table
ALTER TABLE public.products 
ADD COLUMN card_image_mode TEXT CHECK (card_image_mode IN ('auto','main','gallery')) DEFAULT 'auto',
ADD COLUMN card_image_image_id UUID REFERENCES public.product_images(id) ON DELETE SET NULL;