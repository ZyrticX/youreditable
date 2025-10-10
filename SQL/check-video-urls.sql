-- Check video URLs and fix domain issues
-- Run this in Supabase SQL Editor

-- 1. Check current video URLs and their domains
SELECT 
    'Video URLs analysis:' as info,
    vv.id,
    v.title,
    vv.source_url,
    vv.file_url,
    vv.storage_path,
    CASE 
        WHEN vv.source_url LIKE '%gewffjhkvxppwxhqmtqx.supabase.co%' THEN 'Old Supabase Domain'
        WHEN vv.source_url LIKE '%connect.youreditable.com%' THEN 'New Custom Domain'
        WHEN vv.source_url LIKE '%drive.google.com%' THEN 'Google Drive'
        WHEN vv.source_url IS NULL THEN 'No URL'
        ELSE 'Other Domain'
    END as domain_type,
    v.status as video_status
FROM public.video_versions vv
JOIN public.videos v ON v.current_version_id = vv.id
ORDER BY v.created_at DESC
LIMIT 10;

-- 2. Update URLs from old domain to new domain if needed
UPDATE public.video_versions 
SET source_url = REPLACE(source_url, 'gewffjhkvxppwxhqmtqx.supabase.co', 'connect.youreditable.com')
WHERE source_url LIKE '%gewffjhkvxppwxhqmtqx.supabase.co%';

UPDATE public.video_versions 
SET file_url = REPLACE(file_url, 'gewffjhkvxppwxhqmtqx.supabase.co', 'connect.youreditable.com')
WHERE file_url LIKE '%gewffjhkvxppwxhqmtqx.supabase.co%';

UPDATE public.video_versions 
SET storage_path = REPLACE(storage_path, 'gewffjhkvxppwxhqmtqx.supabase.co', 'connect.youreditable.com')
WHERE storage_path LIKE '%gewffjhkvxppwxhqmtqx.supabase.co%';

-- 3. Check for problematic URLs (encoded characters, etc.)
SELECT 
    'Problematic URLs:' as info,
    vv.id,
    v.title,
    vv.source_url,
    LENGTH(vv.source_url) as url_length,
    CASE 
        WHEN vv.source_url LIKE '%25%' THEN 'Has URL encoding'
        WHEN LENGTH(vv.source_url) > 500 THEN 'Very long URL'
        WHEN vv.source_url LIKE '%WhatsApp%20Video%' THEN 'WhatsApp video with spaces'
        ELSE 'Looks OK'
    END as issue
FROM public.video_versions vv
JOIN public.videos v ON v.current_version_id = vv.id
WHERE vv.source_url IS NOT NULL
ORDER BY LENGTH(vv.source_url) DESC
LIMIT 10;

-- 4. Check if we have any videos without proper URLs
SELECT 
    'Videos without URLs:' as info,
    v.id,
    v.title,
    v.status,
    CASE 
        WHEN v.current_version_id IS NULL THEN 'No current version'
        WHEN vv.source_url IS NULL AND vv.file_url IS NULL THEN 'No URLs at all'
        WHEN vv.source_url IS NULL THEN 'No source_url'
        WHEN vv.file_url IS NULL THEN 'No file_url'
        ELSE 'Has URLs'
    END as url_status
FROM public.videos v
LEFT JOIN public.video_versions vv ON vv.id = v.current_version_id
WHERE v.current_version_id IS NULL 
   OR (vv.source_url IS NULL AND vv.file_url IS NULL)
ORDER BY v.created_at DESC
LIMIT 5;
