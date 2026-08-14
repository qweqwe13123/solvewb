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