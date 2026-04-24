DROP TABLE IF EXISTS champion_roles CASCADE;

CREATE TABLE champion_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    champion_id UUID REFERENCES champions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    UNIQUE(champion_id, role)
);

-- Enable Realtime for the new table
ALTER PUBLICATION supabase_realtime ADD TABLE champion_roles;

-- Helper to sync roles back to the champions array for frontend simplicity
CREATE OR REPLACE FUNCTION sync_champion_roles()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE champions
    SET roles = COALESCE((
        SELECT array_agg(role)
        FROM champion_roles
        WHERE champion_id = COALESCE(NEW.champion_id, OLD.champion_id)
    ), '{}')
    WHERE id = COALESCE(NEW.champion_id, OLD.champion_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_role_change
AFTER INSERT OR UPDATE OR DELETE ON champion_roles
FOR EACH ROW EXECUTE FUNCTION sync_champion_roles();
