-- ==============================================================================
-- Quilldrop — Migrace: Přidání anglického názvu a důvodu rarity ke kartám
-- Spusťte v Supabase -> SQL Editor
-- ==============================================================================

ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS rarity_reason_en TEXT;
