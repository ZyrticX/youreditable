-- Fix specific videos identified in the status check
-- Run this in Supabase SQL Editor

-- Fix specific video: 3a88f1aa-1f93-4e96-bf5d-0e93b115336c (approved but has notes)
UPDATE public.videos 
SET status = 'needs_changes'
WHERE id = '3a88f1aa-1f93-4e96-bf5d-0e93b115336c'
  AND status = 'approved';

-- Fix specific video: 410a7eda-da6c-43b1-8113-a0e75b9daac2 (approved but should be pending_review)
UPDATE public.videos 
SET status = 'pending_review'
WHERE id = '410a7eda-da6c-43b1-8113-a0e75b9daac2'
  AND status = 'approved';

-- Fix videos that should be processing (no version): 
-- 97413968-dfec-413a-83ac-dcda278fad71, 738889ac-9fea-454f-aa19-a0c5038e6727
UPDATE public.videos 
SET status = 'processing'
WHERE id IN (
    '97413968-dfec-413a-83ac-dcda278fad71',
    '738889ac-9fea-454f-aa19-a0c5038e6727'
)
AND current_version_id IS NULL;

-- Fix videos that are approved but have no version:
-- cfe568ba-6ac3-40a7-8d11-252d29798860, b5dfae7b-45c0-4719-b0fc-624ae4b7069f
UPDATE public.videos 
SET status = 'processing'
WHERE id IN (
    'cfe568ba-6ac3-40a7-8d11-252d29798860',
    'b5dfae7b-45c0-4719-b0fc-624ae4b7069f'
)
AND current_version_id IS NULL;

-- Verify the specific fixes
SELECT 
    'Fixed specific videos:' as info,
    id,
    title,
    status,
    CASE 
        WHEN current_version_id IS NULL THEN 'No version (processing)'
        ELSE 'Has version'
    END as version_status,
    (SELECT COUNT(*) FROM public.notes n 
     JOIN public.video_versions vv ON vv.id = n.video_version_id 
     WHERE vv.id = videos.current_version_id) as notes_count,
    (SELECT COUNT(*) FROM public.approvals a 
     WHERE a.scope_id = videos.id AND a.scope_type = 'video') as approvals_count
FROM public.videos 
WHERE id IN (
    '3a88f1aa-1f93-4e96-bf5d-0e93b115336c',
    '410a7eda-da6c-43b1-8113-a0e75b9daac2', 
    '97413968-dfec-413a-83ac-dcda278fad71',
    '738889ac-9fea-454f-aa19-a0c5038e6727',
    'cfe568ba-6ac3-40a7-8d11-252d29798860',
    'b5dfae7b-45c0-4719-b0fc-624ae4b7069f'
)
ORDER BY status, title;
