-- Test extend link functionality
-- Run this in Supabase SQL Editor to verify the extend link works

-- 1. Check current project share links and their expiry dates
SELECT 
    'Current project share links:' as info,
    id,
    name,
    share_token,
    share_expires_at,
    CASE 
        WHEN share_expires_at IS NULL THEN 'No expiry set'
        WHEN share_expires_at > NOW() THEN 'Active'
        ELSE 'Expired'
    END as status,
    CASE 
        WHEN share_expires_at IS NOT NULL THEN 
            EXTRACT(DAY FROM (share_expires_at - NOW()))
        ELSE NULL
    END as days_until_expiry
FROM public.projects 
WHERE share_token IS NOT NULL
ORDER BY share_expires_at DESC
LIMIT 10;

-- 2. Test extending a link by 7 days (simulate what the app does)
-- Replace 'your-project-id' with an actual project ID
DO $$ 
DECLARE
    test_project_id UUID;
    old_expiry TIMESTAMP WITH TIME ZONE;
    new_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the first project with a share token
    SELECT id, share_expires_at INTO test_project_id, old_expiry
    FROM public.projects 
    WHERE share_token IS NOT NULL 
    LIMIT 1;
    
    IF test_project_id IS NOT NULL THEN
        -- Calculate new expiry date (current time + 7 days)
        new_expiry := NOW() + INTERVAL '7 days';
        
        -- Update the project
        UPDATE public.projects 
        SET 
            share_expires_at = new_expiry,
            updated_at = NOW()
        WHERE id = test_project_id;
        
        -- Show the result
        RAISE NOTICE 'Extended project % from % to %', test_project_id, old_expiry, new_expiry;
    ELSE
        RAISE NOTICE 'No projects with share tokens found';
    END IF;
END $$;

-- 3. Verify the update worked
SELECT 
    'After extension:' as info,
    id,
    name,
    share_expires_at,
    updated_at,
    EXTRACT(DAY FROM (share_expires_at - NOW())) as days_until_expiry
FROM public.projects 
WHERE share_token IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;
