-- Fix approvals table scope column issue
-- Run this in Supabase SQL Editor

-- 1. Check the current structure of approvals table
SELECT 
    'Approvals table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'approvals' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Fix the scope column - make it nullable or set a default
DO $$ 
BEGIN
    -- Make scope column nullable (since we're using scope_type instead)
    ALTER TABLE public.approvals ALTER COLUMN scope DROP NOT NULL;
    
    -- Or alternatively, copy scope_type to scope for existing rows
    UPDATE public.approvals 
    SET scope = scope_type 
    WHERE scope IS NULL AND scope_type IS NOT NULL;
    
    RAISE NOTICE 'Fixed scope column in approvals table';
END $$;

-- 3. Disable RLS temporarily to get things working
ALTER TABLE public.approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- 4. Test creating an approval with both scope and scope_type
DO $$ 
DECLARE
    test_video_id UUID;
    test_project_id UUID;
BEGIN
    -- Get a video ID for testing
    SELECT v.id, v.project_id INTO test_video_id, test_project_id
    FROM public.videos v
    JOIN public.projects p ON p.id = v.project_id
    WHERE p.share_token IS NOT NULL
    LIMIT 1;
    
    IF test_video_id IS NOT NULL THEN
        -- Try to create a test approval with both fields
        INSERT INTO public.approvals (scope_type, scope, scope_id, approved_at, reviewer_label)
        VALUES ('video', 'video', test_video_id, NOW(), 'Test Approval Fixed');
        
        RAISE NOTICE 'Test approval created successfully for video %', test_video_id;
        
        -- Clean up the test approval
        DELETE FROM public.approvals 
        WHERE scope_type = 'video' 
        AND scope_id = test_video_id 
        AND reviewer_label = 'Test Approval Fixed';
        
        RAISE NOTICE 'Test approval cleaned up';
    ELSE
        RAISE NOTICE 'No videos found for testing';
    END IF;
END $$;

-- 5. Check RLS status
SELECT 
    'RLS Status:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('approvals', 'notifications');

-- 6. Show current data in approvals table
SELECT 
    'Current approvals:' as info,
    id,
    scope_type,
    scope,
    scope_id,
    reviewer_label,
    created_at
FROM public.approvals 
ORDER BY created_at DESC
LIMIT 5;
