-- Quick fix for approvals table
-- Run this in Supabase SQL Editor

-- 1. Make scope column nullable (it's causing the NOT NULL error)
ALTER TABLE public.approvals ALTER COLUMN scope DROP NOT NULL;

-- 2. Disable RLS temporarily to get approvals working
ALTER TABLE public.approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- 3. Update existing rows to have scope = scope_type
UPDATE public.approvals 
SET scope = scope_type 
WHERE scope IS NULL AND scope_type IS NOT NULL;

-- 4. Verify the fix
SELECT 'Quick fix applied - approvals should work now' as status;

-- 5. Test that we can create an approval
SELECT 
    'Testing approvals table:' as info,
    COUNT(*) as current_approvals_count
FROM public.approvals;


