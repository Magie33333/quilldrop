-- ==============================================================================
-- Migrace 09: Osobní písařské motto / kolofon na profilu hráče
-- Umožňuje každému studentovi vybrat si ze získaných karet svůj osobní kolofon
-- ==============================================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS motto_card_id TEXT;

COMMENT ON COLUMN public.profiles.motto_card_id IS 'ID karty ze sbírky, jejíž kolofon si hráč zvolil jako své osobní písařské motto na profilu.';
