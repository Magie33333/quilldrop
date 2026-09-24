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
AS $body$
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

  BEGIN
    DELETE FROM public.card_trades WHERE sender_id = current_user_id OR recipient_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  DELETE FROM public.profiles WHERE id = current_user_id;
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$body$;

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

-- 5. Anglická lokalizace karet (title_en, rarity_reason_en)
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS rarity_reason_en TEXT;

-- 6. Zabezpečení proti podvodům, RLS a bezpečný trigger registrace (Migrace 07)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    chosen_username TEXT;
    clean_base TEXT;
BEGIN
    clean_base := COALESCE(
        new.raw_user_meta_data->>'username',
        split_part(new.email, '@', 1)
    );
    chosen_username := clean_base || '_' || substr(new.id::text, 1, 6);

    INSERT INTO public.profiles (
        id, username, display_name, role, xp, coins, streak, puzzle_progress, bonus_packs, trophies, last_played_date
    )
    VALUES (
        new.id, chosen_username,
        COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        'player', 0, 50, 1, 1, '[]'::jsonb, '{}', CURRENT_DATE
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        updated_at = now();

    RETURN new;
EXCEPTION WHEN unique_violation THEN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        new.id, 'scribe_' || substr(new.id::text, 1, 10),
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Úpravy profilů v dev" ON public.profiles;
DROP POLICY IF EXISTS "Veřejné čtení profilů" ON public.profiles;
DROP POLICY IF EXISTS "Hráč upravuje pouze svůj vlastní profil" ON public.profiles;

CREATE POLICY "Veřejné čtení profilů" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Hráč upravuje pouze svůj vlastní profil" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Hráč čte svou sbírku karet" ON public.user_cards;
DROP POLICY IF EXISTS "Hráč upravuje svou sbírku karet" ON public.user_cards;

CREATE POLICY "Hráč čte svou sbírku karet" ON public.user_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Hráč upravuje svou sbírku karet" ON public.user_cards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. OPRÁVNĚNÍ PRO POSTGREST DATA API (Kompatibilita s novými pravidly Supabase od 30. října)
-- Základní oprávnění čtení pro nepřihlášené návštěvníky
GRANT SELECT ON public.manuscripts TO anon;
GRANT SELECT ON public.colophons TO anon;
GRANT SELECT ON public.cards TO anon;
GRANT SELECT ON public.game_questions TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.card_gifts TO anon;
GRANT SELECT ON public.card_trades TO anon;

-- Plná oprávnění pro přihlášené uživatele (zabezpečení a filtrování řádků řídí RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manuscripts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.colophons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_gifts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_trades TO authenticated;

-- Plná oprávnění pro service_role (administrace a backend)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Výchozí oprávnění pro jakékoliv budoucí tabulky ve schématu public
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

