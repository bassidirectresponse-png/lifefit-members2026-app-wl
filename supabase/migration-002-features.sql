-- =============================================
-- Migration 002: Tipo módulo, drip days, upsell, i18n, purchases
-- Executada em 2026-04-08
-- =============================================

-- 1. Novos campos em modulos
ALTER TABLE public.modulos
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'main',
  ADD COLUMN IF NOT EXISTS unlock_after_days int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sales_copy text,
  ADD COLUMN IF NOT EXISTS price_display text,
  ADD COLUMN IF NOT EXISTS checkout_url text,
  ADD COLUMN IF NOT EXISTS cta_text text,
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS titulo_i18n jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS subtitulo_i18n jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS descricao_i18n jsonb DEFAULT '{}';

ALTER TABLE public.modulos DROP CONSTRAINT IF EXISTS modulos_tipo_check;
ALTER TABLE public.modulos ADD CONSTRAINT modulos_tipo_check
  CHECK (tipo IN ('main', 'bonus', 'locked'));

-- 2. Novos campos em aulas
ALTER TABLE public.aulas
  ADD COLUMN IF NOT EXISTS unlock_after_days int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS titulo_i18n jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS descricao_i18n jsonb DEFAULT '{}';

-- 3. Tabela de compras (upsell)
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  modulo_id uuid NOT NULL REFERENCES public.modulos ON DELETE CASCADE,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, modulo_id)
);

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User sees own purchases" ON public.user_purchases
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin sees all purchases" ON public.user_purchases
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin manages purchases" ON public.user_purchases
  FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_modulo ON public.user_purchases(modulo_id);
