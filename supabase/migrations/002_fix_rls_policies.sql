-- ──────────────────────────────────────────────────────
-- FIX: profiles INSERT — restringir a que el usuario solo inserte su propio perfil
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles: service role inserta" ON public.profiles;
CREATE POLICY "profiles: usuario crea el suyo" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ──────────────────────────────────────────────────────
-- FIX: lesson_progress — usuarios solo gestionan sus propios datos
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "lesson_progress: service role gestiona" ON public.lesson_progress;
CREATE POLICY "lesson_progress: usuario gestiona el suyo" ON public.lesson_progress
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────
-- FIX: gamification — usuarios solo gestionan sus propios datos
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "gamification: service role gestiona" ON public.gamification;
CREATE POLICY "gamification: usuario gestiona el suyo" ON public.gamification
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────
-- FIX: questionnaire_results — usuarios solo gestionan sus propios datos
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "questionnaire: service role gestiona" ON public.questionnaire_results;
CREATE POLICY "questionnaire: usuario gestiona el suyo" ON public.questionnaire_results
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────
-- FIX: budgets — usuarios solo gestionan sus propios datos
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "budgets: service role gestiona" ON public.budgets;
CREATE POLICY "budgets: usuario gestiona el suyo" ON public.budgets
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────
-- Admin: permitir a admins leer datos de investigación
-- ──────────────────────────────────────────────────────
CREATE POLICY "lesson_progress: admin lee todo" ON public.lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "questionnaire: admin lee todo" ON public.questionnaire_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "gamification: admin lee todo" ON public.gamification
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "profiles: admin lee todo" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
