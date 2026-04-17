-- FinEmpoder — esquema inicial
-- Aplicar en: Supabase Dashboard → SQL Editor → Run

-- ────────────────────────────────────────────────
-- PROFILES (datos extra del usuario, vinculado a auth.users)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  career      TEXT,
  age         INT,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'student'
              CHECK (role IN ('student', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuarios solo leen/editan su propio perfil
CREATE POLICY "profiles: usuario lee el suyo" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles: usuario edita el suyo" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- El backend (service role) puede insertar perfiles al registrarse
CREATE POLICY "profiles: service role inserta" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- ────────────────────────────────────────────────
-- LESSON_PROGRESS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id    TEXT NOT NULL CHECK (module_id IN ('presupuesto', 'ahorro', 'inversion')),
  lesson_id    TEXT NOT NULL,
  completed    BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user   ON public.lesson_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_module ON public.lesson_progress (user_id, module_id);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_progress: usuario ve el suyo" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "lesson_progress: service role gestiona" ON public.lesson_progress
  FOR ALL USING (true);

-- ────────────────────────────────────────────────
-- GAMIFICATION
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gamification (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  xp               INT NOT NULL DEFAULT 0,
  level            INT NOT NULL DEFAULT 1,
  streak_current   INT NOT NULL DEFAULT 0,
  streak_best      INT NOT NULL DEFAULT 0,
  last_active_iso  TEXT,
  module_progress  JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gamification: usuario ve el suyo" ON public.gamification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "gamification: service role gestiona" ON public.gamification
  FOR ALL USING (true);

-- ────────────────────────────────────────────────
-- QUESTIONNAIRE_RESULTS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questionnaire_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type              TEXT NOT NULL CHECK (type IN ('pre', 'post')),
  answers           JSONB NOT NULL DEFAULT '[]',
  score             FLOAT NOT NULL,
  finempoderindex   FLOAT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_user ON public.questionnaire_results (user_id);

ALTER TABLE public.questionnaire_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questionnaire: usuario ve el suyo" ON public.questionnaire_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "questionnaire: service role gestiona" ON public.questionnaire_results
  FOR ALL USING (true);

-- ────────────────────────────────────────────────
-- BUDGETS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.budgets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category     TEXT NOT NULL CHECK (category IN (
                 'Alimentación','Transporte','Vivienda','Educación',
                 'Salud','Servicios','Ocio','Ahorro','Deuda','Otros'
               )),
  type         TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount       FLOAT NOT NULL CHECK (amount >= 0),
  date         DATE NOT NULL,
  notes        TEXT,
  periodicity  TEXT NOT NULL DEFAULT 'one_time'
               CHECK (periodicity IN ('one_time','weekly','biweekly','monthly','yearly')),
  tags         TEXT[],
  attachments  TEXT[],
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budgets_user      ON public.budgets (user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_date ON public.budgets (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_category  ON public.budgets (category);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets: usuario ve el suyo" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "budgets: service role gestiona" ON public.budgets
  FOR ALL USING (true);

-- ────────────────────────────────────────────────
-- TRIGGER: updated_at automático
-- ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_gamification_updated_at
  BEFORE UPDATE ON public.gamification
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_questionnaire_updated_at
  BEFORE UPDATE ON public.questionnaire_results
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
