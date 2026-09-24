-- ==============================================================================
-- Migrace 08: Explicitní oprávnění pro Supabase Data API (PostgREST)
-- Reakce na změnu pravidel Supabase platnou od 30. října
-- ==============================================================================

-- 1. Základní oprávnění čtení pro nepřihlášené návštěvníky (role 'anon')
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.manuscripts TO anon;
GRANT SELECT ON public.colophons TO anon;
GRANT SELECT ON public.cards TO anon;
GRANT SELECT ON public.game_questions TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.card_gifts TO anon;
GRANT SELECT ON public.card_trades TO anon;

-- 2. Plná oprávnění pro přihlášené hráče a studenty (role 'authenticated')
-- Pozor: O tom, které konkrétní řádky může uživatel číst/měnit, rozhoduje Row Level Security (RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manuscripts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.colophons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_gifts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_trades TO authenticated;

-- 3. Plná oprávnění pro servisní/admin roli (role 'service_role')
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- 4. Výchozí oprávnění (DEFAULT PRIVILEGES) pro jakékoliv nové tabulky a funkce vytvořené v budoucnu
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
