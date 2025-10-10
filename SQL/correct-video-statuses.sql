-- Correct video statuses based on their actual state
-- Run this in Supabase SQL Editor

-- 1. Fix videos that should be 'processing' (no current_version_id)
UPDATE public.videos 
SET status = 'processing'
WHERE current_version_id IS NULL 
  AND status != 'processing';

-- Show what we're fixing
SELECT 
    'Fixed videos to processing:' as info,
    id,
    title,
    'processing' as new_status,
    'No version available' as reason
FROM public.videos 
WHERE current_version_id IS NULL;

-- 2. Fix videos that have notes but are not 'needs_changes'
UPDATE public.videos 
SET status = 'needs_changes'
WHERE id IN (
    SELECT DISTINCT v.id
    FROM public.videos v
    JOIN public.video_versions vv ON vv.id = v.current_version_id
    JOIN public.notes n ON n.video_version_id = vv.id
    WHERE v.status != 'needs_changes'
);

-- Show what we're fixing
SELECT 
    'Fixed videos to needs_changes:' as info,
    v.id,
    v.title,
    'needs_changes' as new_status,
    COUNT(n.id) as notes_count
FROM public.videos v
JOIN public.video_versions vv ON vv.id = v.current_version_id
JOIN public.notes n ON n.video_version_id = vv.id
GROUP BY v.id, v.title
ORDER BY notes_count DESC;

-- 3. Fix videos that are approved but have no approval record
UPDATE public.videos 
SET status = 'pending_review'
WHERE status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM public.approvals a 
    WHERE a.scope_id = videos.id 
    AND a.scope_type = 'video'
  )
  AND current_version_id IS NOT NULL;

-- Show what we're fixing
SELECT 
    'Fixed approved videos without approval records:' as info,
    v.id,
    v.title,
    'pending_review' as new_status,
    'No approval record found' as reason
FROM public.videos v
WHERE v.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM public.approvals a 
    WHERE a.scope_id = v.id 
    AND a.scope_type = 'video'
  )
  AND v.current_version_id IS NOT NULL;

-- 4. Verify the corrections
SELECT 
    'Status distribution after corrections:' as info,
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM public.videos 
GROUP BY status
ORDER BY count DESC;

-- 5. Check if there are still any inconsistencies
SELECT 
    'Remaining inconsistencies:' as info,
    v.id,
    v.title,
    v.status,
    CASE 
        WHEN v.current_version_id IS NULL AND v.status != 'processing' THEN 'Should be processing'
        WHEN EXISTS (SELECT 1 FROM public.notes n JOIN public.video_versions vv ON vv.id = n.video_version_id WHERE vv.id = v.current_version_id) 
             AND v.status != 'needs_changes' THEN 'Should be needs_changes'
        WHEN EXISTS (SELECT 1 FROM public.approvals a WHERE a.scope_id = v.id AND a.scope_type = 'video') 
             AND v.status != 'approved' THEN 'Should be approved'
        WHEN v.current_version_id IS NOT NULL 
             AND NOT EXISTS (SELECT 1 FROM public.notes n JOIN public.video_versions vv ON vv.id = n.video_version_id WHERE vv.id = v.current_version_id)
             AND NOT EXISTS (SELECT 1 FROM public.approvals a WHERE a.scope_id = v.id AND a.scope_type = 'video')
             AND v.status != 'pending_review' THEN 'Should be pending_review'
        ELSE 'Correct'
    END as issue
FROM public.videos v
WHERE NOT (
    (v.current_version_id IS NULL AND v.status = 'processing') OR
    (EXISTS (SELECT 1 FROM public.notes n JOIN public.video_versions vv ON vv.id = n.video_version_id WHERE vv.id = v.current_version_id) AND v.status = 'needs_changes') OR
    (EXISTS (SELECT 1 FROM public.approvals a WHERE a.scope_id = v.id AND a.scope_type = 'video') AND v.status = 'approved') OR
    (v.current_version_id IS NOT NULL 
     AND NOT EXISTS (SELECT 1 FROM public.notes n JOIN public.video_versions vv ON vv.id = n.video_version_id WHERE vv.id = v.current_version_id)
     AND NOT EXISTS (SELECT 1 FROM public.approvals a WHERE a.scope_id = v.id AND a.scope_type = 'video')
     AND v.status = 'pending_review')
)
ORDER BY v.created_at DESC;
