CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS champions CASCADE;

CREATE TABLE champions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    roles TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime trigger
ALTER PUBLICATION supabase_realtime ADD TABLE champions;
