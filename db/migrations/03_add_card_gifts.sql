-- ==============================================================================
-- Migrace 03: card_gifts (P2P Darování a výměna duplikátů mezi studenty)
-- ==============================================================================

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

-- Indexy pro bleskové načítání darů pro konkrétního příjemce
CREATE INDEX IF NOT EXISTS idx_card_gifts_recipient ON public.card_gifts(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_card_gifts_sender ON public.card_gifts(sender_id);

-- Povolení RLS a veřejná politika pro čtení a správu darů v rámci hry
ALTER TABLE public.card_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Veřejná správa darů mezi studenty" ON public.card_gifts FOR ALL USING (true);
