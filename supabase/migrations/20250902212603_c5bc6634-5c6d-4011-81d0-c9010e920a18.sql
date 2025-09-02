-- A) Erweitere products Tabelle
ALTER TABLE public.products 
ADD COLUMN main_image_url text,
ADD COLUMN video_mode text DEFAULT 'none' CHECK (video_mode IN ('youtube', 'upload', 'none'));

-- Setze youtube_url für existierende Produkte auf NULL wenn leer
UPDATE public.products SET youtube_url = NULL WHERE youtube_url = '';

-- B) Erstelle product_images Tabelle
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index für Performance
CREATE INDEX idx_product_images_product_id_sort ON public.product_images(product_id, sort_order);

-- Trigger für updated_at
CREATE TRIGGER update_product_images_updated_at
  BEFORE UPDATE ON public.product_images
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- C) RLS Policies für product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read product images" 
ON public.product_images FOR SELECT 
USING (true);

CREATE POLICY "Editors can insert product images" 
ON public.product_images FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editors can update product images" 
ON public.product_images FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editors can delete product images" 
ON public.product_images FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- D) Storage Bucket erstellen
INSERT INTO storage.buckets (id, name, public) VALUES ('product-media', 'product-media', true);

-- E) Storage Policies für product-media bucket
CREATE POLICY "Public can view product media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-media');

CREATE POLICY "Editors can upload product media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-media' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role)));

CREATE POLICY "Editors can update product media" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-media' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role)));

CREATE POLICY "Editors can delete product media" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-media' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role)));