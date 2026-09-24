-- ==============================================================================
-- Migrace 05: card_trades (P2P Obchodování a smlouvy o směně kolofonů)
-- ==============================================================================

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

-- Oprávnění pro Data API (Supabase / PostgREST)
GRANT SELECT ON public.card_trades TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_trades TO authenticated;
GRANT ALL ON public.card_trades TO service_role;
