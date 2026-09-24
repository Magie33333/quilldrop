-- ==============================================================================
-- Quilldrop — Schéma databáze pro Supabase (PostgreSQL)
-- Podle Master specifikace v1.0 (Kapitola 15)
-- ==============================================================================

-- 1. Povolení rozšíření pro UUID (pokud ještě není povoleno)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- TABULKA: manuscripts (Rukopisy / Kodexy)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.manuscripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    heurist_id BIGINT UNIQUE,
    institution TEXT NOT NULL,
    shelfmark TEXT NOT NULL,
    title TEXT,
    origin_place TEXT,
    origin_date TEXT,
    iiif_manifest_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- TABULKA: colophons (Záznamy kolofonů z Heuristu / odborné databáze)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.colophons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    heurist_id BIGINT UNIQUE NOT NULL,
    manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE SET NULL,
    manuscript_shelfmark TEXT,
    quote TEXT NOT NULL,
    quote_normalized TEXT,
    translation_cs TEXT,
    translation_en TEXT,
    scribe TEXT DEFAULT 'Unknown scribe',
    place TEXT DEFAULT 'Unknown place',
    year INT,
    locus TEXT,
    visual_note TEXT,
    features TEXT[] DEFAULT '{}',
    formula_frequency INT DEFAULT 1,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- TABULKA: cards (Herní karty vytvořené z kolofonů s IIIF výřezy)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colophon_id UUID REFERENCES public.colophons(id) ON DELETE CASCADE NOT NULL,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique')),
    rarity_reason TEXT,
    mood TEXT DEFAULT 'scribal voice',
    sigil TEXT DEFAULT 'Q',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    
    -- IIIF & obrazová data výřezu (pouze souřadnice, žádné gigabajty fotek v DB!)
    image_url TEXT NOT NULL,
    crop_x NUMERIC DEFAULT 0 NOT NULL,
    crop_y NUMERIC DEFAULT 0 NOT NULL,
    crop_w NUMERIC DEFAULT 100 NOT NULL,
    crop_h NUMERIC DEFAULT 100 NOT NULL,
    iiif_endpoint TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- TABULKA: game_questions (Otázky do miniher vázané na kolofony/karty)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
    game_kind TEXT NOT NULL CHECK (game_kind IN ('mood', 'cipher', 'paleo')),
    title TEXT NOT NULL,
    intro TEXT NOT NULL,
    quote TEXT NOT NULL,
    options JSONB NOT NULL,            -- např. [["😌", "Mírumilovný"], ["😩", "Vyčerpaný"], ["😡", "Rozzuřený"]]
    correct_index INT NOT NULL DEFAULT 0,
    explanation TEXT,
    hint TEXT,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'expert')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- TABULKA: profiles (Hráčské profily navázané na Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_id TEXT DEFAULT 'rabbit-scribe',
    role TEXT DEFAULT 'player' CHECK (role IN ('player', 'editor', 'reviewer', 'admin')),
    xp INT DEFAULT 0 NOT NULL,
    coins INT DEFAULT 0 NOT NULL,
    streak INT DEFAULT 0 NOT NULL,
    puzzle_progress INT DEFAULT 0 NOT NULL,
    bonus_packs JSONB DEFAULT '[]'::jsonb NOT NULL,
    trophies TEXT[] DEFAULT '{}',
    last_played_date DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- TABULKA: user_cards (Karty ve sbírce hráče a počty duplicit)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
    count INT DEFAULT 1 NOT NULL,
    first_acquired_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_card UNIQUE (user_id, card_id)
);

-- ------------------------------------------------------------------------------
-- AUTOMATICKÝ TRIGGER: Vytvoření profilu při registraci nového uživatele
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- ZÁKLADNÍ BEZPEČNOSTNÍ PRAVIDLA (Row Level Security - RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colophons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

-- Veřejné čtení pro katalog (hráči i nepřihlášení si mohou prohlížet karty)
CREATE POLICY "Veřejné čtení rukopisů" ON public.manuscripts FOR SELECT USING (true);
CREATE POLICY "Veřejné čtení kolofonů" ON public.colophons FOR SELECT USING (true);
CREATE POLICY "Veřejné čtení karet" ON public.cards FOR SELECT USING (true);
CREATE POLICY "Veřejné čtení otázek do miniher" ON public.game_questions FOR SELECT USING (is_active = true);

-- Úpravy pro vývoj a administraci
CREATE POLICY "Úpravy karet v dev" ON public.cards FOR ALL USING (true);
CREATE POLICY "Úpravy kolofonů v dev" ON public.colophons FOR ALL USING (true);
CREATE POLICY "Úpravy rukopisů v dev" ON public.manuscripts FOR ALL USING (true);
CREATE POLICY "Úpravy miniher v dev" ON public.game_questions FOR ALL USING (true);

-- Profily a tým (veřejné čtení pro žebříčky a správu týmu, zápis v dev)
CREATE POLICY "Veřejné čtení profilů" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Úpravy profilů v dev" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Hráč čte svou sbírku karet" ON public.user_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Hráč upravuje svou sbírku karet" ON public.user_cards FOR ALL USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- OPRÁVNĚNÍ PRO POSTGREST DATA API (Zabezpečení pro změny od 30. října)
-- ------------------------------------------------------------------------------
-- Základní oprávnění pro anonymní návštěvníky (čtení veřejného obsahu)
GRANT SELECT ON public.manuscripts TO anon;
GRANT SELECT ON public.colophons TO anon;
GRANT SELECT ON public.cards TO anon;
GRANT SELECT ON public.game_questions TO anon;
GRANT SELECT ON public.profiles TO anon;

-- Plná oprávnění pro přihlášené uživatele (přístup k řádkům řídí RLS politiky)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manuscripts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.colophons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_cards TO authenticated;

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
