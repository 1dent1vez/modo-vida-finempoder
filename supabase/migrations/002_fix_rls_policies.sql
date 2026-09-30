-- ──────────────────────────────────────────────────────
-- FIX: profiles INSERT — restringir a que el usuario solo inserte su propio perfil
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles: service role inserta" ON public.profiles;
CREATE POLICY "profiles: usuario crea el suyo" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id AND role = 'student');

-- RLS limita filas, no columnas: impedir que un usuario se asigne role = 'admin'.
REVOKE ALL ON public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;
GRANT INSERT (id, name, career, age, phone) ON public.profiles TO authenticated;
GRANT UPDATE (name, career, age, phone) ON public.profiles TO authenticated;

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
-- La consulta de admin no debe leer profiles como invoker desde su propia policy.
-- ──────────────────────────────────────────────────────
CREATE SCHEMA finempoder_private;
REVOKE ALL ON SCHEMA finempoder_private FROM PUBLIC;
GRANT USAGE ON SCHEMA finempoder_private TO authenticated;

CREATE FUNCTION finempoder_private.is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION finempoder_private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION finempoder_private.is_admin() TO authenticated;

-- Admin: permitir a admins leer datos de investigación.
CREATE POLICY "lesson_progress: admin lee todo" ON public.lesson_progress
  FOR SELECT TO authenticated USING ((SELECT finempoder_private.is_admin()));

CREATE POLICY "questionnaire: admin lee todo" ON public.questionnaire_results
  FOR SELECT TO authenticated USING ((SELECT finempoder_private.is_admin()));

CREATE POLICY "gamification: admin lee todo" ON public.gamification
  FOR SELECT TO authenticated USING ((SELECT finempoder_private.is_admin()));

CREATE POLICY "profiles: admin lee todo" ON public.profiles
  FOR SELECT TO authenticated USING ((SELECT finempoder_private.is_admin()));
