-- Fix security warning: Set search_path for function
CREATE OR REPLACE FUNCTION public.generate_logo_alt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-generate logo_alt if empty
  IF NEW.logo_alt IS NULL OR NEW.logo_alt = '' THEN
    NEW.logo_alt := COALESCE(NEW.logo_text, 'Logo') || ' Logo';
  END IF;
  
  -- Set updated_by to current user
  NEW.updated_by := auth.uid();
  
  RETURN NEW;
END;
$$;