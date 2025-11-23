-- Storage policies for logo management

-- Allow public read access to logos
CREATE POLICY "Public can read logos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'product-media' 
  AND (storage.foldername(name))[1] = 'logos'
);

-- Allow admins/editors to upload logos
CREATE POLICY "Editors can upload logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-media' 
  AND (storage.foldername(name))[1] = 'logos'
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  )
);

-- Allow admins/editors to update logos
CREATE POLICY "Editors can update logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-media' 
  AND (storage.foldername(name))[1] = 'logos'
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  )
);

-- Allow admins/editors to delete logos
CREATE POLICY "Editors can delete logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-media' 
  AND (storage.foldername(name))[1] = 'logos'
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  )
);