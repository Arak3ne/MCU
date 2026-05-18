-- Alignement sur match_participants_rows.sql (bases partielles / anciennes définitions).

ALTER TABLE public.match_participants
  ADD COLUMN IF NOT EXISTS kills integer,
  ADD COLUMN IF NOT EXISTS deaths integer,
  ADD COLUMN IF NOT EXISTS assists integer,
  ADD COLUMN IF NOT EXISTS total_damage_dealt_to_champions integer,
  ADD COLUMN IF NOT EXISTS win boolean,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS first_blood_kill boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_time_spent_dead integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_damage_dealt integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_damage_taken integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS damage_self_mitigated integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vision_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wards_placed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wards_killed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gold_earned integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_minions_killed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS largest_killing_spree integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team_id integer DEFAULT 0;

-- champion_id UUID (export) : ajout seulement si absent ; type INT → UUID géré par 20260501000005_fix_champion_id_type.sql
ALTER TABLE public.match_participants
  ADD COLUMN IF NOT EXISTS champion_id uuid REFERENCES public.champions(id) ON DELETE SET NULL;
