-- Fix video URL field mismatch
-- Import saves to file_url, Review reads from source_url

-- First, check what we have
SELECT 
  id,
  video_id,
  file_url,
  source_url,
  CASE 
    WHEN file_url IS NOT NULL AND source_url IS NULL THEN 'Need to copy file_url to source_url'
    WHEN file_url IS NULL AND source_url IS NOT NULL THEN 'Already correct'
    WHEN file_url IS NOT NULL AND source_url IS NOT NULL THEN 'Both fields have data'
    ELSE 'Both fields are empty'
  END as status
FROM video_versions 
ORDER BY created_at DESC
LIMIT 10;

-- Copy file_url to source_url where source_url is empty
UPDATE video_versions 
SET source_url = file_url
WHERE file_url IS NOT NULL 
  AND source_url IS NULL;

-- Verify the fix
SELECT 
  id,
  video_id,
  file_url,
  source_url,
  'Fixed!' as status
FROM video_versions 
WHERE source_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

