-- Debug user creation issue
-- Run this in Supabase SQL Editor

-- 1. Check profiles table structure
SELECT 
    'Profiles table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled and policies exist
SELECT 
    'RLS status:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'profiles';

-- 3. Check RLS policies for profiles
SELECT 
    'Profiles RLS policies:' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'profiles';

-- 4. Check if there's a trigger for auto-creating profiles
SELECT 
    'Profile creation triggers:' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
    OR action_statement LIKE '%profiles%'
ORDER BY trigger_name;

-- 5. Check auth.users table (if accessible)
DO $$ 
BEGIN
    BEGIN
        PERFORM 1 FROM auth.users LIMIT 1;
        RAISE NOTICE 'Auth users table is accessible';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Auth users table not accessible from this context: %', SQLERRM;
    END;
END $$;

-- 6. Try to create a test profile manually
DO $$ 
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test-' || extract(epoch from now()) || '@example.com';
BEGIN
    BEGIN
        INSERT INTO public.profiles (
            id,
            email,
            display_name,
            full_name,
            display_user_id,
            plan_level,
            created_at,
            updated_at
        ) VALUES (
            test_user_id,
            test_email,
            'Test User',
            'Test User',
            test_user_id,
            'free',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Successfully created test profile with ID: %', test_user_id;
        
        -- Clean up test profile
        DELETE FROM public.profiles WHERE id = test_user_id;
        RAISE NOTICE 'Cleaned up test profile';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create test profile: % - %', SQLSTATE, SQLERRM;
    END;
END $$;

-- 7. Check for any constraints that might be failing
SELECT 
    'Table constraints:' as info,
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'profiles'
    AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;
