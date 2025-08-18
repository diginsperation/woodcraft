-- Create home_process table (singleton for process section)
CREATE TABLE public.home_process (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  button_label TEXT,
  button_link TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_actions table for contact chips
CREATE TABLE public.contact_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social_links table for footer social icons
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create footer_contact_block table (singleton for footer contact)
CREATE TABLE public.footer_contact_block (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_rich TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.home_process ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_contact_block ENABLE ROW LEVEL SECURITY;

-- RLS policies for home_process
CREATE POLICY "Public can read process" ON public.home_process FOR SELECT USING (true);
CREATE POLICY "Editors can manage process" ON public.home_process FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- RLS policies for contact_actions
CREATE POLICY "Public can read contact actions" ON public.contact_actions FOR SELECT USING (true);
CREATE POLICY "Editors can manage contact actions" ON public.contact_actions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- RLS policies for social_links
CREATE POLICY "Public can read social links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Editors can manage social links" ON public.social_links FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- RLS policies for footer_contact_block
CREATE POLICY "Public can read footer contact" ON public.footer_contact_block FOR SELECT USING (true);
CREATE POLICY "Editors can manage footer contact" ON public.footer_contact_block FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Add updated_at triggers for all tables
CREATE TRIGGER update_home_process_updated_at
  BEFORE UPDATE ON public.home_process
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_contact_actions_updated_at
  BEFORE UPDATE ON public.contact_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_social_links_updated_at
  BEFORE UPDATE ON public.social_links
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_footer_contact_block_updated_at
  BEFORE UPDATE ON public.footer_contact_block
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Insert seed data
-- Process section
INSERT INTO public.home_process (title, subtitle, button_label, button_link) VALUES (
  'So entsteht dein Produkt',
  'Von der Idee bis zum fertigen Holzprodukt - erlebe unseren handwerklichen Prozess.',
  'Video ansehen',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
);

-- Contact actions
INSERT INTO public.contact_actions (label, url, sort_order) VALUES 
  ('Email', 'mailto:info@holzmanufaktur.de', 1),
  ('WhatsApp', 'https://wa.me/491234567890', 2),
  ('Instagram', 'https://instagram.com/holzmanufaktur', 3),
  ('Messenger', 'https://m.me/holzmanufaktur', 4);

-- Social links
INSERT INTO public.social_links (platform, label, url, icon, sort_order) VALUES 
  ('email', 'Email', 'mailto:info@holzmanufaktur.de', 'mail', 1),
  ('whatsapp', 'WhatsApp', 'https://wa.me/491234567890', 'message-circle', 2),
  ('instagram', 'Instagram', 'https://instagram.com/holzmanufaktur', 'instagram', 3),
  ('messenger', 'Messenger', 'https://m.me/holzmanufaktur', 'message-square', 4);

-- Footer contact
INSERT INTO public.footer_contact_block (content_rich) VALUES (
  'Email: info@holzmanufaktur.de<br/>Telefon: +49 123 456 7890<br/>Werkstatt nach Terminvereinbarung'
);