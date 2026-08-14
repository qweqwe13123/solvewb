CREATE TABLE public.community_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'AI Video Bootcamp',
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price_label text NOT NULL DEFAULT '$9/month',
  members_label text NOT NULL DEFAULT '26.4k members',
  privacy_label text NOT NULL DEFAULT 'Private',
  owner_label text NOT NULL DEFAULT 'By Daniel Riley',
  cover_url text,
  video_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.community_profile TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_profile TO authenticated;
GRANT ALL ON public.community_profile TO service_role;

ALTER TABLE public.community_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community profile is viewable by everyone"
  ON public.community_profile FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert community profile"
  ON public.community_profile FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update community profile"
  ON public.community_profile FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete community profile"
  ON public.community_profile FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price_label text NOT NULL DEFAULT '$9/month',
  cover_url text,
  video_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses are viewable by everyone"
  ON public.courses FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can view all courses"
  ON public.courses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert courses"
  ON public.courses FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update courses"
  ON public.courses FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete courses"
  ON public.courses FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_community_profile_updated_at
  BEFORE UPDATE ON public.community_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.community_profile (name, tagline, description)
VALUES (
  'AI Video Bootcamp',
  'Master AI Video & AI Image Creation.',
  'Learn to create and monetise AI video content with 26.4k creators.'
);

ALTER TABLE public.community_profile
  ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS body text NOT NULL DEFAULT ''::text,
  ADD COLUMN IF NOT EXISTS handle_label text NOT NULL DEFAULT 'skool.com/aivideobootcamp'::text,
  ADD COLUMN IF NOT EXISTS online_label text NOT NULL DEFAULT '414'::text,
  ADD COLUMN IF NOT EXISTS admins_label text NOT NULL DEFAULT '8'::text;

UPDATE public.community_profile
SET body = '⭐ Top 1% Community on Skool
🥇 Ranked #1 AI Video/Image Course on Skool
🏆 Ranked #1 Globally out of 250,000 Communities

🚨 Only 11 spots left at $9
‼️ Once we hit 26,500 members, new members pay $50/month

What''s inside? 🚀
✅ Create and monetise AI influencers & UGC ads
✅ Build your AI Twin / Clone
✅ Personal 1-to-1 feedback
✅ Master perfect character consistency
✅ Guided roadmap so you know where to start
✅ Manageable content to fit around your schedule
✅ Stay up-to-date with the latest AI tools
✅ Learn Expert-level prompting
✅ Build AI ads brands pay for
✅ 25,000+ helpful creators giving feedback daily
🎁 Challenges & Giveaways
🔥 Weekly updates

Perfect for complete beginners or experienced creators — no tech skills required

If you''re tired of:
❌ Guessing
❌ Plastic-looking AI that screams "fake"
❌ Characters that change faces between scenes
❌ Spending hours with nothing to post

AVB is for you

⚡ Start today. Lock in $9/month for life
That''s under $0.30/day to stay ahead
✅ Cancel anytime'
WHERE body = '';

INSERT INTO public.courses (slug, title, summary, description, price_label, is_published, sort_order)
SELECT 'ai-video-bootcamp',
       'AI Video Bootcamp',
       'Master AI Video & AI Image Creation and monetise your skills.',
       'Master AI Video & AI Image Creation. Then use your skill to make AI Adverts, Social Media Content and Films to earn 💰',
       '$9/month',
       true,
       0
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'ai-video-bootcamp');

CREATE POLICY "Admins can read community media"
  ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'community-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload community media"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'community-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update community media"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'community-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete community media"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'community-media' AND public.has_role(auth.uid(), 'admin'));