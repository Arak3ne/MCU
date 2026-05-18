-- Migration INT -> UUID pour champion_id (anciens schémas).
-- Si la table est créée par 20260504100000, champion_id est déjà UUID : rien à faire.
DO $$
BEGIN
  IF to_regclass('public.match_participants') IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'match_participants'
         AND column_name = 'champion_id'
         AND data_type IN ('smallint', 'integer', 'bigint')
     )
  THEN
    ALTER TABLE public.match_participants
      ADD COLUMN IF NOT EXISTS champion_uuid UUID REFERENCES public.champions(id) ON DELETE SET NULL;

    UPDATE public.match_participants mp
    SET champion_uuid = c.id
    FROM public.champions c
    WHERE mp.champion_id::text = c.ddragon_key;

    ALTER TABLE public.match_participants DROP COLUMN champion_id;

    ALTER TABLE public.match_participants RENAME COLUMN champion_uuid TO champion_id;
  END IF;
END $$;
