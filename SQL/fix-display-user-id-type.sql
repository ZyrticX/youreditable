-- Fix display_user_id column type issue
-- Run this in Supabase SQL Editor

-- 1. Check current column type
SELECT 
    'Current display_user_id column info:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
    AND column_name = 'display_user_id';

-- 2. Check if there are any non-UUID values in display_user_id
SELECT 
    'Non-UUID display_user_id values:' as info,
    id,
    display_user_id,
    LENGTH(display_user_id) as length,
    CASE 
        WHEN display_user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'Valid UUID'
        ELSE 'Invalid UUID'
    END as uuid_status
FROM public.profiles 
WHERE display_user_id IS NOT NULL
    AND NOT (display_user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
LIMIT 10;

-- 3. Fix any invalid display_user_id values by setting them to the user's actual ID
UPDATE public.profiles 
SET display_user_id = id::text::uuid
WHERE display_user_id IS NOT NULL 
    AND NOT (display_user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- 4. Set display_user_id to user's ID for any NULL values
UPDATE public.profiles 
SET display_user_id = id
WHERE display_user_id IS NULL;

-- 5. If the column is TEXT, convert it to UUID
DO $$ 
BEGIN
    -- Check if column is text type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
            AND table_schema = 'public'
            AND column_name = 'display_user_id'
            AND data_type = 'text'
    ) THEN
        -- Convert column to UUID type
        ALTER TABLE public.profiles 
        ALTER COLUMN display_user_id TYPE UUID USING display_user_id::uuid;
        
        RAISE NOTICE 'Converted display_user_id column from TEXT to UUID';
    ELSE
        RAISE NOTICE 'display_user_id column is already UUID type or does not exist';
    END IF;
END $$;

-- 6. Verify the fix
SELECT 
    'After fix - display_user_id column info:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
    AND column_name = 'display_user_id';

-- 7. Check a few sample records
SELECT 
    'Sample records after fix:' as info,
    id,
    email,
    display_user_id,
    CASE 
        WHEN id = display_user_id THEN 'Matching'
        ELSE 'Different'
    END as id_match_status
FROM public.profiles 
WHERE display_user_id IS NOT NULL
LIMIT 5;
