-- Quick fix for display_user_id type issue
-- Run this in Supabase SQL Editor

-- 1. Set all display_user_id to match the user's ID (as UUID)
UPDATE public.profiles 
SET display_user_id = id
WHERE display_user_id IS NULL OR display_user_id != id;

-- 2. If column is TEXT type, convert to UUID
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
            AND column_name = 'display_user_id'
            AND data_type = 'text'
    ) THEN
        ALTER TABLE public.profiles 
        ALTER COLUMN display_user_id TYPE UUID USING display_user_id::uuid;
        
        RAISE NOTICE 'Fixed display_user_id column type';
    END IF;
END $$;

-- 3. Verify fix
SELECT 
    'Fixed display_user_id:' as status,
    COUNT(*) as total_users,
    COUNT(display_user_id) as users_with_display_id
FROM public.profiles;
