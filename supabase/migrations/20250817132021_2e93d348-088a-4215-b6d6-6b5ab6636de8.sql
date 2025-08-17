-- Create homepage_header table
CREATE TABLE public.homepage_header (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_text TEXT,
  logo_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create homepage_hero table  
CREATE TABLE public.homepage_hero (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  button_primary_label TEXT,
  button_primary_link TEXT,
  button_secondary_label TEXT,
  button_secondary_link TEXT,
  background_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.homepage_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_hero ENABLE ROW LEVEL SECURITY;

-- Create policies for homepage_header
CREATE POLICY "Public can read header" 
ON public.homepage_header 
FOR SELECT 
USING (true);

CREATE POLICY "Editors can manage header" 
ON public.homepage_header 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Create policies for homepage_hero
CREATE POLICY "Public can read hero" 
ON public.homepage_hero 
FOR SELECT 
USING (true);

CREATE POLICY "Editors can manage hero" 
ON public.homepage_hero 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_homepage_header_updated_at
BEFORE UPDATE ON public.homepage_header
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_homepage_hero_updated_at
BEFORE UPDATE ON public.homepage_hero
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();