-- Fix video status flow
-- Run this in Supabase SQL Editor

-- 1. Update video_status enum to include all needed statuses
DO $$ 
BEGIN
    -- Add 'pending_review' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_review' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'video_status')) THEN
        ALTER TYPE video_status ADD VALUE 'pending_review';
    END IF;
    
    -- Add 'needs_changes' if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'needs_changes' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'video_status')) THEN
        ALTER TYPE video_status ADD VALUE 'needs_changes';
    END IF;
    
    -- Add 'approved' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'approved' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'video_status')) THEN
        ALTER TYPE video_status ADD VALUE 'approved';
    END IF;
    
    -- Add 'processing' if it doesn't exist (for when video is being imported)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'processing' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'video_status')) THEN
        ALTER TYPE video_status ADD VALUE 'processing';
    END IF;
EXCEPTION WHEN others THEN
    -- If enum doesn't exist, create it with all statuses
    CREATE TYPE video_status AS ENUM ('processing', 'pending_review', 'needs_changes', 'approved', 'archived');
END $$;

-- 2. Set default status for new videos to 'pending_review'
ALTER TABLE public.videos ALTER COLUMN status SET DEFAULT 'pending_review';

-- 3. Update existing videos that might have wrong status
-- Videos that are 'active' should be 'pending_review'
UPDATE public.videos 
SET status = 'pending_review' 
WHERE status = 'active';

-- 4. Verify current video statuses
SELECT 
    'Current video statuses:' as info,
    status,
    COUNT(*) as count
FROM public.videos 
GROUP BY status
ORDER BY status;

-- 5. Show the enum values
SELECT 
    'video_status enum values:' as info,
    enumlabel as status_value,
    enumsortorder as sort_order
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'video_status')
ORDER BY enumsortorder;
