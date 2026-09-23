-- ==============================================================================
-- QUILLDROP: MIGRACE 07 — Zabezpečení proti podvodům, RLS a bezpečný trigger registrace
-- ==============================================================================

-- 1. Bezpečný trigger pro registraci nových uživatelů (ošetření kolizí jmen a duplicit)
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
    
    -- Vygenerovat bezpečný tvar username s unikátním přídomkem pro zabránění 23505 unique_violation
    chosen_username := clean_base || '_' || substr(new.id::text, 1, 6);

    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        role,
        xp,
        coins,
        streak,
        puzzle_progress,
        bonus_packs,
        trophies,
        last_played_date
    )
    VALUES (
        new.id,
        chosen_username,
        COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        'player',
        0,
        50,
        1,
        1,
        '[]'::jsonb,
        '{}',
        CURRENT_DATE
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        updated_at = now();

    RETURN new;
EXCEPTION WHEN unique_violation THEN
    -- Záložní řešení při extrémní shodě náhod
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        new.id,
        'scribe_' || substr(new.id::text, 1, 10),
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

-- 2. Zabezpečení RLS politik pro profily a karty (proti neautorizovaným zásahům z klienta)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

-- Profily: kdokoliv může číst (pro žebříčky a sociální funkce), ale editovat smí pouze přihlášený vlastník
DROP POLICY IF EXISTS "Úpravy profilů v dev" ON public.profiles;
DROP POLICY IF EXISTS "Veřejné čtení profilů" ON public.profiles;
DROP POLICY IF EXISTS "Hráč upravuje pouze svůj vlastní profil" ON public.profiles;

CREATE POLICY "Veřejné čtení profilů" ON public.profiles 
    FOR SELECT USING (true);

CREATE POLICY "Hráč upravuje pouze svůj vlastní profil" ON public.profiles 
    FOR ALL 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

-- Karty uživatele: hráč může číst a spravovat výhradně své vlastní karty
DROP POLICY IF EXISTS "Hráč čte svou sbírku karet" ON public.user_cards;
DROP POLICY IF EXISTS "Hráč upravuje svou sbírku karet" ON public.user_cards;

CREATE POLICY "Hráč čte svou sbírku karet" ON public.user_cards 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Hráč upravuje svou sbírku karet" ON public.user_cards 
    FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);
