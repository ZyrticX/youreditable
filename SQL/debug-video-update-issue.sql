-- Debug video update issue
-- Run this in Supabase SQL Editor

-- 1. Check if the video exists
SELECT 
    'Video exists check:' as info,
    id,
    title,
    status,
    project_id,
    current_version_id
FROM public.videos 
WHERE id = '3a88f1aa-1f93-4e96-bf5d-0e93b115336c';

-- 2. Check RLS policies on videos table
SELECT 
    'Videos RLS policies:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'videos';

-- 3. Check if RLS is enabled on videos table
SELECT 
    'Videos RLS status:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'videos';

-- 4. Try to update the video directly (as superuser)
DO $$ 
DECLARE
    video_id UUID := '3a88f1aa-1f93-4e96-bf5d-0e93b115336c';
    updated_count INTEGER;
BEGIN
    -- Try to update the video
    UPDATE public.videos 
    SET 
        status = 'approved',
        approved_at = NOW(),
        approved_by = 'SQL Test'
    WHERE id = video_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    IF updated_count > 0 THEN
        RAISE NOTICE 'Successfully updated video % (% rows affected)', video_id, updated_count;
        
        -- Rollback the test update
        UPDATE public.videos 
        SET 
            status = 'pending_review',
            approved_at = NULL,
            approved_by = NULL
        WHERE id = video_id;
        
        RAISE NOTICE 'Rolled back test update';
    ELSE
        RAISE NOTICE 'No rows were updated for video %', video_id;
    END IF;
END $$;

-- 5. Check project and video relationship
SELECT 
    'Project-Video relationship:' as info,
    p.id as project_id,
    p.name as project_name,
    p.share_token,
    v.id as video_id,
    v.title as video_title,
    v.status as video_status
FROM public.projects p
JOIN public.videos v ON v.project_id = p.id
WHERE v.id = '3a88f1aa-1f93-4e96-bf5d-0e93b115336c';

-- 6. Temporarily disable RLS on videos table for testing
-- UNCOMMENT ONLY IF NEEDED FOR TESTING:
-- ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;

-- 7. Show current RLS status after potential disable
SELECT 
    'Final RLS status:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'videos';


