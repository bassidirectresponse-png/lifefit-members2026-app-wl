-- =============================================
-- Migration 003: Security hardening
-- =============================================

-- 1. Make storage bucket private
UPDATE storage.buckets SET public = false WHERE id = 'content';

-- 2. Replace public read with authenticated-only
DROP POLICY IF EXISTS "Acesso público de leitura ao storage" ON storage.objects;
CREATE POLICY "Authenticated users read storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'content' AND auth.uid() IS NOT NULL);

-- 3. Add INSERT/DELETE policies for user_purchases
CREATE POLICY "Admin inserts purchases" ON public.user_purchases
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin deletes purchases" ON public.user_purchases
  FOR DELETE USING (public.is_admin());

-- 4. Prevent users from escalating their own role
DROP POLICY IF EXISTS "Usuária edita próprio perfil" ON public.profiles;
CREATE POLICY "User updates own profile (no role change)" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );
