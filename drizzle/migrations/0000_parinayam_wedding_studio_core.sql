CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_name text NOT NULL DEFAULT 'Parinayam Weddings',
  tagline text NOT NULL DEFAULT 'Timeless wedding films & photographs',
  bio text,
  logo_url text,
  whatsapp_number text,
  phone_number text,
  instagram_url text,
  youtube_url text,
  studio_address text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.site_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.portfolio_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Weddings',
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  is_hero boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.portfolio_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_media TO authenticated;
GRANT ALL ON public.portfolio_media TO service_role;

ALTER TABLE public.portfolio_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media public read" ON public.portfolio_media
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "media admin write" ON public.portfolio_media
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.event_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_types TO authenticated;
GRANT ALL ON public.event_types TO service_role;

ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events public read" ON public.event_types
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "events admin write" ON public.event_types
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.services_cameras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'camera',
  unit_price numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services_cameras TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services_cameras TO authenticated;
GRANT ALL ON public.services_cameras TO service_role;

ALTER TABLE public.services_cameras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.services_cameras
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "services admin write" ON public.services_cameras
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.quote_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  event_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.quote_inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_inquiries TO authenticated;
GRANT ALL ON public.quote_inquiries TO service_role;

ALTER TABLE public.quote_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inquiries public insert" ON public.quote_inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "inquiries admin read" ON public.quote_inquiries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "inquiries admin update" ON public.quote_inquiries
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "inquiries admin delete" ON public.quote_inquiries
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "portfolio read"   ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'portfolio');
CREATE POLICY "portfolio insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio');
CREATE POLICY "portfolio update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio');
CREATE POLICY "portfolio delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio');