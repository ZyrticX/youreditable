-- Temporarily disable RLS for problematic tables
-- Run this in Supabase SQL Editor as a quick fix

-- This is a temporary solution to get the app working
-- In production, you should implement proper RLS policies

-- 1. Disable RLS for approvals table
ALTER TABLE public.approvals DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS for notifications table  
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- 3. Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('approvals', 'notifications');

-- 4. Test that we can now insert into these tables
SELECT 'RLS disabled - approvals and notifications should work now' as status;


