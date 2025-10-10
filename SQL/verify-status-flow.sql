-- Verify video status flow is working correctly
-- Run this in Supabase SQL Editor

-- 1. Check current video statuses
SELECT 
    'Current video statuses distribution:' as info,
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM public.videos 
GROUP BY status
ORDER BY count DESC;

-- 2. Check videos with their project info
SELECT 
    'Videos with project context:' as info,
    v.id,
    v.title,
    v.status as video_status,
    p.name as project_name,
    p.status as project_status,
    v.created_at,
    CASE 
        WHEN v.current_version_id IS NOT NULL THEN 'Has Version'
        ELSE 'Missing Version'
    END as version_status
FROM public.videos v
JOIN public.projects p ON p.id = v.project_id
ORDER BY v.created_at DESC
LIMIT 10;

-- 3. Check notes and their impact on video status
SELECT 
    'Notes impact on video status:' as info,
    v.id as video_id,
    v.title,
    v.status,
    COUNT(n.id) as notes_count,
    MAX(n.created_at) as last_note_date
FROM public.videos v
LEFT JOIN public.video_versions vv ON vv.id = v.current_version_id
LEFT JOIN public.notes n ON n.video_version_id = vv.id
GROUP BY v.id, v.title, v.status
HAVING COUNT(n.id) > 0
ORDER BY notes_count DESC
LIMIT 5;

-- 4. Check approvals and their impact on video status
SELECT 
    'Approvals impact on video status:' as info,
    v.id as video_id,
    v.title,
    v.status,
    COUNT(a.id) as approvals_count,
    MAX(a.created_at) as last_approval_date
FROM public.videos v
LEFT JOIN public.approvals a ON a.scope_id = v.id AND a.scope_type = 'video'
GROUP BY v.id, v.title, v.status
HAVING COUNT(a.id) > 0
ORDER BY approvals_count DESC
LIMIT 5;

-- 5. Show the complete status flow logic
SELECT 
    'Status flow summary:' as info,
    'New videos start as: processing → pending_review' as flow_1,
    'Videos with notes become: needs_changes' as flow_2,
    'Videos with approval become: approved' as flow_3;

-- 6. Check if any videos need status correction
SELECT 
    'Videos that might need status correction:' as info,
    v.id,
    v.title,
    v.status,
    CASE 
        WHEN v.current_version_id IS NULL THEN 'Should be processing (no version)'
        WHEN EXISTS (SELECT 1 FROM public.notes n JOIN public.video_versions vv ON vv.id = n.video_version_id WHERE vv.id = v.current_version_id) 
             AND v.status != 'needs_changes' THEN 'Should be needs_changes (has notes)'
        WHEN EXISTS (SELECT 1 FROM public.approvals a WHERE a.scope_id = v.id AND a.scope_type = 'video') 
             AND v.status != 'approved' THEN 'Should be approved (has approval)'
        WHEN v.current_version_id IS NOT NULL 
             AND NOT EXISTS (SELECT 1 FROM public.notes n JOIN public.video_versions vv ON vv.id = n.video_version_id WHERE vv.id = v.current_version_id)
             AND NOT EXISTS (SELECT 1 FROM public.approvals a WHERE a.scope_id = v.id AND a.scope_type = 'video')
             AND v.status != 'pending_review' THEN 'Should be pending_review (ready for review)'
        ELSE 'Status is correct'
    END as suggested_action
FROM public.videos v
ORDER BY v.created_at DESC
LIMIT 10;
