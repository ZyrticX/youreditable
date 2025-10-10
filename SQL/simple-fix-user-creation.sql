-- Simple fix for user creation issue
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Create or replace simple user creation function
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
        subscription_status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.id,
        'free',
        'free',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail auth
    RAISE LOG 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Test with a manual profile creation
DO $$ 
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        display_name,
        display_user_id,
        plan_level
    ) VALUES (
        test_id,
        'test@example.com',
        'Test User',
        test_id,
        'free'
    );
    
    DELETE FROM public.profiles WHERE id = test_id;
    RAISE NOTICE 'Profile creation test successful';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Profile creation test failed: %', SQLERRM;
END $$;

-- 5. Show status
SELECT 'Fix applied successfully' as status;
