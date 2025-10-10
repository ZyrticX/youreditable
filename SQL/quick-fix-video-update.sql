-- Quick fix for video update issue
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on videos table temporarily
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;

-- 2. Verify RLS is disabled
SELECT 
    'Videos RLS status after disable:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'videos';

-- 3. Test update on the specific video
UPDATE public.videos 
SET status = 'pending_review'
WHERE id = '3a88f1aa-1f93-4e96-bf5d-0e93b115336c';

-- 4. Check if the update worked
SELECT 
    'Video after test update:' as info,
    id,
    title,
    status,
    updated_at
FROM public.videos 
WHERE id = '3a88f1aa-1f93-4e96-bf5d-0e93b115336c';

-- Note: You can re-enable RLS later with:
-- ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
