-- Fix CORS settings for custom domain
-- Run this in Supabase SQL Editor

-- Update auth settings to allow your domain
UPDATE auth.config 
SET 
  site_url = 'https://www.youreditable.com',
  uri_allow_list = 'https://www.youreditable.com,https://youreditable.com,http://localhost:3000,http://localhost:5173'
WHERE true;

-- If the above doesn't work, you might need to update via Supabase Dashboard:
-- Settings → Authentication → Site URL: https://www.youreditable.com
-- Settings → Authentication → Redirect URLs: Add your domain
