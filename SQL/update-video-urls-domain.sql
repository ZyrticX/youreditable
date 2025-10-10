-- Update video URLs to use new custom domain
-- Run this in Supabase SQL Editor

-- First, let's see what URLs we currently have
SELECT 
  id, 
  source_url,
  CASE 
    WHEN source_url LIKE '%supabase.co%' THEN 'Old Supabase Domain'
    WHEN source_url LIKE '%connect.youreditable.com%' THEN 'New Custom Domain'
    ELSE 'Other Domain'
  END as domain_type
FROM video_versions 
WHERE source_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Update URLs from old Supabase domain to new custom domain
-- Replace 'your-old-project-id.supabase.co' with 'connect.youreditable.com'
UPDATE video_versions 
SET source_url = REPLACE(
  source_url, 
  'gewffjhkvxppwxhqmtqx.supabase.co', 
  'connect.youreditable.com'
)
WHERE source_url LIKE '%gewffjhkvxppwxhqmtqx.supabase.co%';

-- Also update any storage URLs if they exist
UPDATE video_versions 
SET storage_path = REPLACE(
  storage_path, 
  'gewffjhkvxppwxhqmtqx.supabase.co', 
  'connect.youreditable.com'
)
WHERE storage_path LIKE '%gewffjhkvxppwxhqmtqx.supabase.co%';

-- Check the results
SELECT 
  id, 
  source_url,
  storage_path,
  created_at
FROM video_versions 
WHERE source_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
