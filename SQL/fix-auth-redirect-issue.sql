-- Fix authentication and redirect issues
-- Run this in Supabase SQL Editor

-- 1. Check current auth configuration
SELECT 
    'Current auth config:' as info,
    site_url,
    uri_allow_list
FROM auth.config
LIMIT 1;

-- 2. Update auth configuration for correct redirects
UPDATE auth.config 
SET 
    site_url = 'https://www.youreditable.com',
    uri_allow_list = 'https://www.youreditable.com/**,https://youreditable.com/**,http://localhost:3000/**,http://localhost:5173/**'
WHERE true;

-- 3. Verify the update
SELECT 
    'Updated auth config:' as info,
    site_url,
    uri_allow_list
FROM auth.config
LIMIT 1;

-- Note: You may also need to update these settings in Supabase Dashboard:
-- 1. Go to Authentication > Settings
-- 2. Set Site URL to: https://www.youreditable.com
-- 3. Add Redirect URLs:
--    - https://www.youreditable.com/**
--    - https://youreditable.com/**
--    - http://localhost:3000/**
--    - http://localhost:5173/**

