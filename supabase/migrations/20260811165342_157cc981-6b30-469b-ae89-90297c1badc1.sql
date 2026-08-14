CREATE TABLE public.classroom_classes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.classroom_classes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classroom_classes TO authenticated;
GRANT ALL ON public.classroom_classes TO service_role;

ALTER TABLE public.classroom_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published classes are viewable by everyone" ON public.classroom_classes
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can view all classes" ON public.classroom_classes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert classes" ON public.classroom_classes
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update classes" ON public.classroom_classes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete classes" ON public.classroom_classes
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_classroom_classes_updated_at BEFORE UPDATE ON public.classroom_classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  starts_at timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  link_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.calendar_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events are viewable by everyone" ON public.calendar_events
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can view all events" ON public.calendar_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert events" ON public.calendar_events
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update events" ON public.calendar_events
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete events" ON public.calendar_events
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.classroom_classes (title, description, sort_order) VALUES
  ('AI Video Foundations', 'Start here: tools, prompting basics and your first AI video from scratch.', 1),
  ('Prompt Engineering for Video', 'Advanced prompt stacks for consistent characters, motion and lighting.', 2),
  ('Client Work & Delivery', 'Package your AI videos into paid offers and deliver like a studio.', 3);

INSERT INTO public.calendar_events (title, description, starts_at, duration_minutes) VALUES
  ('Live Q&A', 'Weekly live call: bring your project and get feedback.', (date_trunc('week', now()) + interval '2 days' + interval '20 hours'), 60),
  ('New lesson: Motion control', 'Walkthrough of the new motion control lesson in the classroom.', (date_trunc('week', now()) + interval '9 days' + interval '18 hours'), 45);