-- 1. Add user_id to players
ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable pgcrypto extension if not already enabled (needed for gen_salt and crypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Create auth users for existing players
DO $$
DECLARE
    player_record RECORD;
    new_user_id UUID;
    fake_email TEXT;
    shared_password TEXT := 'McuTournament2026!'; -- The shared secret password
BEGIN
    FOR player_record IN SELECT * FROM players WHERE user_id IS NULL LOOP
        -- Generate a clean email from pseudo (lowercase, remove spaces and special chars)
        fake_email := regexp_replace(lower(player_record.pseudo), '[^a-z0-9]', '', 'g') || '@mcu.local';
        
        -- Generate a new UUID for the auth user
        new_user_id := gen_random_uuid();
        
        -- Insert into auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            fake_email,
            extensions.crypt(shared_password, extensions.gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('pseudo', player_record.pseudo),
            now(),
            now(),
            'authenticated',
            '',
            '',
            '',
            ''
        );
        
        -- Insert into auth.identities (required by Supabase for login)
        INSERT INTO auth.identities (
            id,
            user_id,
            provider_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            new_user_id,
            new_user_id::text,
            format('{"sub":"%s","email":"%s"}', new_user_id::text, fake_email)::jsonb,
            'email',
            now(),
            now(),
            now()
        );

        -- Update the player record to link to the new auth user
        UPDATE players SET user_id = new_user_id WHERE id = player_record.id;
    END LOOP;
END $$;
