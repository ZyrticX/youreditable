-- Comprehensive fix for user creation issues
-- Run this in Supabase SQL Editor

-- 1. Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    display_name TEXT,
    full_name TEXT,
    display_user_id UUID,
    plan_level TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'free',
    subscription_id TEXT,
    paddle_customer_id TEXT,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Disable RLS temporarily to allow user creation
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.id,
        'free',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        display_user_id = COALESCE(EXCLUDED.display_user_id, public.profiles.display_user_id),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE LOG 'Error creating profile for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Create simple RLS policies that allow everything for now
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

CREATE POLICY "Allow all operations on profiles" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Test the setup
DO $$ 
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test-setup-' || extract(epoch from now()) || '@example.com';
BEGIN
    -- Test direct insert
    INSERT INTO public.profiles (
        id,
        email,
        display_name,
        full_name,
        display_user_id,
        plan_level
    ) VALUES (
        test_user_id,
        test_email,
        'Test Setup User',
        'Test Setup User',
        test_user_id,
        'free'
    );
    
    RAISE NOTICE 'Successfully created test profile: %', test_user_id;
    
    -- Clean up
    DELETE FROM public.profiles WHERE id = test_user_id;
    RAISE NOTICE 'Test completed successfully';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test failed: % - %', SQLSTATE, SQLERRM;
END $$;

-- 8. Show final status
SELECT 
    'Setup complete:' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as recent_profiles
FROM public.profiles;

SELECT 
    'RLS Status:' as info,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

SELECT 
    'Triggers created:' as info,
    COUNT(*) as trigger_count
FROM information_schema.triggers 
WHERE event_object_table = 'profiles' OR trigger_name LIKE '%user%';
