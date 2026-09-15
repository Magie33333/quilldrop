-- ==============================================================================
-- Quilldrop — Migrace: Přidání autorství a historie úprav ke kartám
-- Spusťte v Supabase -> SQL Editor
-- ==============================================================================

ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by_name TEXT,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
