# 🚨 URGENT FIX STEPS - User Creation Error

## Problem
Users getting redirected to error page: `Database error saving new user`

## Quick Fix Steps

### Step 1: Fix Database (Run in Supabase SQL Editor)
```sql
-- Run this script:
SQL/simple-fix-user-creation.sql
```

### Step 2: Fix Supabase Auth Settings (Supabase Dashboard)

1. **Go to Supabase Dashboard**
2. **Navigate to Authentication > Settings**
3. **Update these settings:**

   **Site URL:**
   ```
   https://www.youreditable.com
   ```

   **Redirect URLs (add all of these):**
   ```
   https://www.youreditable.com/Dashboard
   https://www.youreditable.com/Home
   https://youreditable.com/Dashboard
   https://youreditable.com/Home
   http://localhost:5173/Dashboard
   http://localhost:3000/Dashboard
   ```

### Step 3: Check Google OAuth Settings (if using Google login)

1. **Go to Google Cloud Console**
2. **APIs & Services > Credentials**
3. **Edit your OAuth 2.0 Client ID**
4. **Update Authorized redirect URIs:**
   ```
   https://connect.youreditable.com/auth/v1/callback
   https://www.youreditable.com/auth/v1/callback
   ```

### Step 4: Test the Fix

1. **Clear browser cache/cookies**
2. **Try registering a new account**
3. **Try logging in with existing account**
4. **Try Google OAuth (if configured)**

## Expected Result
- ✅ No more error redirects
- ✅ Users can register successfully
- ✅ Users redirect to Dashboard after login
- ✅ Profile created in database automatically

## If Still Not Working

### Check Browser Console
Look for these errors:
- CORS errors
- 400/500 API errors
- Authentication errors

### Check Supabase Logs
1. Go to Supabase Dashboard > Logs
2. Look for recent errors
3. Check Edge Functions logs

### Fallback Solution
If nothing works, temporarily disable RLS on all tables:
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;
```

## Contact Support
If the issue persists, provide:
1. Browser console errors
2. Supabase error logs
3. Steps you've tried
