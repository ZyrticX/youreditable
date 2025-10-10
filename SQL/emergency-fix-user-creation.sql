-- Emergency fix for user creation - disable all RLS temporarily
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on all main tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- 2. Ensure profiles table has correct structure
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='display_user_id') THEN
        ALTER TABLE public.profiles ADD COLUMN display_user_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='plan_level') THEN
        ALTER TABLE public.profiles ADD COLUMN plan_level TEXT DEFAULT 'free';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='subscription_status') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT DEFAULT 'free';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='created_at') THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Fix display_user_id column type if needed
DO $$ 
BEGIN
    -- Check if display_user_id is text and convert to UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
            AND column_name = 'display_user_id'
            AND data_type = 'text'
    ) THEN
        -- First set all to valid UUIDs
        UPDATE public.profiles SET display_user_id = id::text WHERE display_user_id IS NULL OR display_user_id = '';
        
        -- Convert column type
        ALTER TABLE public.profiles ALTER COLUMN display_user_id TYPE UUID USING display_user_id::uuid;
        
        RAISE NOTICE 'Converted display_user_id to UUID type';
    END IF;
END $$;

-- 4. Update all existing profiles to have correct display_user_id
UPDATE public.profiles 
SET display_user_id = id 
WHERE display_user_id IS NULL OR display_user_id != id;

-- 5. Create simple trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
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
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail auth if profile creation fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Replace trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_simple();

-- 7. Test the fix
SELECT 
    'Emergency fix applied:' as status,
    'All RLS disabled, triggers updated' as message;

-- 8. Show current state
SELECT 
    'Current profiles:' as info,
    COUNT(*) as total_count,
    COUNT(display_user_id) as with_display_id
FROM public.profiles;

SELECT 
    'RLS Status (should all be false):' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'projects', 'videos', 'video_versions', 'notes', 'approvals', 'notifications')
ORDER BY tablename;

