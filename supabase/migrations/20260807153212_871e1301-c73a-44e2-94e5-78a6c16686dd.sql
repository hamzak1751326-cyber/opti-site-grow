CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  page_title TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  overall_score INTEGER,
  seo_score INTEGER,
  performance_score INTEGER,
  security_score INTEGER,
  accessibility_score INTEGER,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX audits_user_created_idx ON public.audits (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audits TO authenticated;
GRANT ALL ON public.audits TO service_role;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audits_select_own" ON public.audits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "audits_insert_own" ON public.audits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "audits_update_own" ON public.audits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "audits_delete_own" ON public.audits FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.audit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_results_audit_idx ON public.audit_results (audit_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_results TO authenticated;
GRANT ALL ON public.audit_results TO service_role;
ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_results_select_own" ON public.audit_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "audit_results_insert_own" ON public.audit_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "audit_results_update_own" ON public.audit_results FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "audit_results_delete_own" ON public.audit_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reports_user_created_idx ON public.reports (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_update_own" ON public.reports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_delete_own" ON public.reports FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.audits(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  overall_score INTEGER,
  seo_score INTEGER,
  performance_score INTEGER,
  security_score INTEGER,
  accessibility_score INTEGER,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX competitors_user_created_idx ON public.competitors (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitors TO authenticated;
GRANT ALL ON public.competitors TO service_role;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "competitors_select_own" ON public.competitors FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "competitors_insert_own" ON public.competitors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "competitors_update_own" ON public.competitors FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "competitors_delete_own" ON public.competitors FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX usage_logs_user_created_idx ON public.usage_logs (user_id, created_at DESC);
GRANT SELECT, INSERT ON public.usage_logs TO authenticated;
GRANT ALL ON public.usage_logs TO service_role;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage_logs_select_own" ON public.usage_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "usage_logs_insert_own" ON public.usage_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT false,
  default_device TEXT NOT NULL DEFAULT 'desktop',
  auto_generate_reports BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_settings_select_own" ON public.user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert_own" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_update_own" ON public.user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_delete_own" ON public.user_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER user_settings_set_updated_at BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();