-- Persist DiceBear (avataaars) customization per player for cross-device profile avatars.
CREATE TABLE public.player_avatar_config (
  player_id UUID PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
  dicebear_version TEXT NOT NULL DEFAULT '9.x'
    CONSTRAINT player_avatar_config_dicebear_version_check CHECK (dicebear_version = '9.x'),
  style TEXT NOT NULL DEFAULT 'avataaars'
    CONSTRAINT player_avatar_config_style_check CHECK (style = 'avataaars'),
  seed TEXT NOT NULL
    CONSTRAINT player_avatar_config_seed_len_check CHECK (
      char_length(seed) BETWEEN 1 AND 128 AND trim(seed) = seed AND trim(seed) <> ''
    ),
  options JSONB NOT NULL DEFAULT '{}'::jsonb
    CONSTRAINT player_avatar_config_options_object_check CHECK (jsonb_typeof(options) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_player_avatar_config_updated_at ON public.player_avatar_config (updated_at DESC);

ALTER TABLE public.player_avatar_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MVP anon read write player_avatar_config"
  ON public.player_avatar_config FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_player_avatar_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_player_avatar_config_updated_at
  BEFORE UPDATE ON public.player_avatar_config
  FOR EACH ROW EXECUTE FUNCTION public.set_player_avatar_config_updated_at();
