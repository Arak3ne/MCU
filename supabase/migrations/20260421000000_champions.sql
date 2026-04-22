CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE champions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime trigger
ALTER PUBLICATION supabase_realtime ADD TABLE champions;
