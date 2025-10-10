-- Debug Review page issues
-- Run this in Supabase SQL Editor to check current state

-- 1. Check if tables exist and their structure
SELECT 
    'Table exists check:' as info,
    schemaname,
    tablename
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('notes', 'approvals', 'video_versions', 'videos', 'projects')
ORDER BY tablename;

-- 2. Check notes table structure
SELECT 
    'notes table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notes' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check approvals table structure  
SELECT 
    'approvals table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'approvals' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check RLS policies on notes table
SELECT 
    'notes RLS policies:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'notes';

-- 5. Check RLS policies on approvals table
SELECT 
    'approvals RLS policies:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'approvals';

-- 6. Check if we have any sample data
SELECT 
    'Sample project data:' as info,
    id,
    name,
    share_token,
    share_expires_at,
    status
FROM public.projects 
WHERE share_token IS NOT NULL
LIMIT 3;

-- 7. Test insert into notes (this will fail if there are issues)
-- First, let's see if we can find a video_version_id to use
SELECT 
    'Available video_version_ids:' as info,
    vv.id as video_version_id,
    v.title as video_title,
    p.name as project_name,
    p.share_token
FROM public.video_versions vv
JOIN public.videos v ON v.id = vv.video_id
JOIN public.projects p ON p.id = v.project_id
WHERE p.share_token IS NOT NULL
LIMIT 3;
