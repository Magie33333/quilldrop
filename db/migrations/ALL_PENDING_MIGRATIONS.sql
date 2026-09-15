-- ==============================================================================
-- QUILLDROP: KOMPLETNÍ SOUHRNNÁ MIGRACE (Spusťte v Supabase -> SQL Editor)
-- ==============================================================================

-- 1. Autorství a editorství karet (Audit Trail)
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by_name TEXT,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by_name TEXT;

-- 2. P2P Darování karet mezi studenty (Social Trading)
CREATE TABLE IF NOT EXISTS public.card_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
    card_title TEXT NOT NULL,
    card_rarity TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_card_gifts_recipient ON public.card_gifts(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_card_gifts_sender ON public.card_gifts(sender_id);

ALTER TABLE public.card_gifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Veřejná správa darů mezi studenty" ON public.card_gifts;
CREATE POLICY "Veřejná správa darů mezi studenty" ON public.card_gifts FOR ALL USING (true);

-- 3. Bezpečná funkce pro zrušení / smazání vlastního účtu (GDPR)
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Neautorizovaný požadavek na zrušení účtu.';
  END IF;

  DELETE FROM public.user_cards WHERE user_id = current_user_id;
  BEGIN
    DELETE FROM public.card_gifts WHERE sender_id = current_user_id OR recipient_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  DELETE FROM public.profiles WHERE id = current_user_id;
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- 4. P2P Bilaterální obchodování a smlouvy o směně (Full Bilateral Trading)
CREATE TABLE IF NOT EXISTS public.card_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_name TEXT NOT NULL,
    sender_offer JSONB NOT NULL DEFAULT '[]'::jsonb,
    recipient_request JSONB NOT NULL DEFAULT '[]'::jsonb,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'countered')),
    parent_trade_id UUID REFERENCES public.card_trades(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_card_trades_recipient ON public.card_trades(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_card_trades_sender ON public.card_trades(sender_id, status);

ALTER TABLE public.card_trades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Veřejná správa obchodů mezi studenty" ON public.card_trades;
CREATE POLICY "Veřejná správa obchodů mezi studenty" ON public.card_trades FOR ALL USING (true);

