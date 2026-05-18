-- Table players (alignée sur players_rows.sql — coûts fantasy_cost / fantasy_cost_day2, notes, profil nullable pour drafters / imports).
CREATE TABLE public.players (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pseudo text NOT NULL,
    discord text NOT NULL UNIQUE,
    primary_role text,
    secondary_role text,
    champion_pool text[],
    champion_signature text,
    rank text,
    playstyle text,
    mindset text,
    created_at timestamptz NOT NULL DEFAULT now(),
    fantasy_tier text DEFAULT 'C',
    fantasy_cost integer,
    fantasy_enabled boolean NOT NULL DEFAULT true,
    fantasy_notes text,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    riot_id text,
    participation_type text NOT NULL DEFAULT 'joueur',
    team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
    fantasy_cost_day2 integer,
    CONSTRAINT players_participation_type_check CHECK (participation_type IN ('joueur', 'drafter')),
    CONSTRAINT valid_roles CHECK (
        (participation_type = 'drafter')
        OR (primary_role IS NULL AND secondary_role IS NULL)
        OR (
            primary_role IN ('top', 'jungle', 'mid', 'adc', 'support')
            AND secondary_role IN ('top', 'jungle', 'mid', 'adc', 'support')
            AND primary_role IS DISTINCT FROM secondary_role
        )
    ),
    CONSTRAINT valid_pool_size CHECK (
        champion_pool IS NULL OR COALESCE(cardinality(champion_pool), 0) <= 5
    ),
    CONSTRAINT valid_riot_id CHECK (
        riot_id IS NULL OR riot_id ~ '^.+#.+$'
    )
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert players"
    ON public.players FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can view players"
    ON public.players FOR SELECT
    USING (true);
