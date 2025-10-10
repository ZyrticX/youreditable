# 🔄 Supabase Domain Migration Guide

## 🎯 Overview
This guide helps you migrate to a new Supabase domain and update all references in your application.

---

## 📍 Current Supabase Configuration

### Where Supabase URLs are Used in Your Code

#### 1. Environment Variables
- `src/lib/supabase.js` (lines 3-4)
- `env.example` 
- `env.production`
- Vercel environment variables

#### 2. Edge Function URLs
- Webhook endpoints in external services
- API calls from frontend

#### 3. Authentication Redirects
- Google OAuth redirect URIs
- Paddle webhook URLs

---

## 🚀 Step-by-Step Migration

### Step 1: Update Environment Variables

#### 1.1 Local Development
**Update `src/lib/supabase.js`:**
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR-NEW-PROJECT.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_new_anon_key'
```

#### 1.2 Production Environment
**Update `env.production`:**
```env
VITE_SUPABASE_URL=https://YOUR-NEW-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_anon_key
```

#### 1.3 Vercel Environment Variables
1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Update these variables:
   ```
   VITE_SUPABASE_URL=https://YOUR-NEW-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your_new_anon_key
   ```

### Step 2: Update Edge Function References

#### 2.1 Paddle Webhook URL
**Current URL:**
```
https://gewffjhkvxppwxhqmtqx.supabase.co/functions/v1/paddle-webhook
```

**New URL:**
```
https://YOUR-NEW-PROJECT.supabase.co/functions/v1/paddle-webhook
```

**Update in Paddle Dashboard:**
1. Go to Developer Tools > Notifications
2. Edit existing webhook
3. Update URL to new domain
4. Save changes

#### 2.2 API Calls in Frontend
**Files to check:**
- `src/api/functions.js` - Edge Function calls
- Any direct `supabaseClient.functions.invoke()` calls

These should automatically use the new URL from environment variables.

### Step 3: Update Authentication Redirects

#### 3.1 Google OAuth Redirect URIs
**In Google Cloud Console:**
1. Go to APIs & Services > Credentials
2. Edit your OAuth 2.0 Client ID
3. Update Authorized redirect URIs:
   ```
   OLD: https://gewffjhkvxppwxhqmtqx.supabase.co/auth/v1/callback
   NEW: https://YOUR-NEW-PROJECT.supabase.co/auth/v1/callback
   ```

#### 3.2 Supabase Auth Settings
**In new Supabase project:**
1. Go to Authentication > Settings
2. Update Site URL: `https://www.youreditable.com`
3. Add Redirect URLs:
   ```
   https://www.youreditable.com/Dashboard
   http://localhost:5173/Dashboard
   ```

### Step 4: Deploy Edge Functions to New Project

#### 4.1 Link to New Project
```bash
# Unlink from old project
supabase projects list

# Link to new project
supabase link --project-ref YOUR-NEW-PROJECT-REF
```

#### 4.2 Deploy All Edge Functions
```bash
# Deploy all functions
supabase functions deploy paddle-webhook
supabase functions deploy list-drive-files
supabase functions deploy download-video
```

#### 4.3 Set Edge Function Secrets
```bash
# Set required secrets for new project
supabase secrets set SUPABASE_URL=https://YOUR-NEW-PROJECT.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
supabase secrets set GOOGLE_CLIENT_ID=your_google_client_id
supabase secrets set GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 5: Update Database Schema

#### 5.1 Run Schema Scripts
1. Go to new Supabase project > SQL Editor
2. Run these scripts in order:
   ```sql
   -- 1. Main schema
   SQL/supabase-schema-safe.sql
   
   -- 2. Storage support
   SQL/add-storage-support.sql
   
   -- 3. Missing columns (if needed)
   SQL/add-missing-columns.sql
   ```

#### 5.2 Verify Tables Created
Check that these tables exist:
- `profiles`
- `projects` 
- `videos`
- `video_versions`
- `notes`
- `approvals`
- `notifications`
- `transactions`

### Step 6: Update External Service Configurations

#### 6.1 Paddle Webhooks
- ✅ Already covered in Step 2.1

#### 6.2 Any Other Webhooks
Update any other services that send webhooks to your old Supabase domain.

---

## 🧪 Testing Your Migration

### Test Checklist

#### Authentication
- [ ] User can sign up with email/password
- [ ] User can sign in with email/password  
- [ ] "Sign in with Google" works
- [ ] User redirected to Dashboard after login
- [ ] User data saved in new database

#### Google Drive Integration
- [ ] Can import videos from Google Drive
- [ ] Videos are listed correctly
- [ ] Videos can be downloaded to new Supabase Storage
- [ ] Video URLs work in review interface

#### Payments (Paddle)
- [ ] Payment buttons work
- [ ] Checkout process completes
- [ ] Webhooks received at new URL
- [ ] User plan updated in new database
- [ ] Transaction recorded

#### Edge Functions
- [ ] `list-drive-files` function works
- [ ] `download-video` function works
- [ ] `paddle-webhook` function works
- [ ] All functions have correct environment variables

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid JWT" or "Project not found"
**Solution**: 
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Redeploy to Vercel after updating environment variables

### Issue 2: Edge Functions not found
**Solution**:
- Verify functions are deployed to new project
- Check function names match exactly
- Verify Edge Function secrets are set

### Issue 3: Google OAuth not working
**Solution**:
- Update redirect URIs in Google Cloud Console
- Verify Google provider is enabled in new Supabase project
- Check Client ID and Secret are correct

### Issue 4: Paddle webhooks not received
**Solution**:
- Update webhook URL in Paddle Dashboard
- Verify `paddle-webhook` function is deployed
- Check function logs for errors

### Issue 5: Database tables missing
**Solution**:
- Run all SQL schema scripts in new project
- Check for any SQL errors in Supabase logs
- Verify RLS policies are created

---

## 📋 Migration Checklist

### Pre-Migration
- [ ] New Supabase project created
- [ ] Database schema deployed
- [ ] Edge Functions deployed
- [ ] Environment variables updated

### External Services
- [ ] Google Cloud Console redirect URIs updated
- [ ] Paddle webhook URL updated
- [ ] Any other webhook URLs updated

### Testing
- [ ] Authentication works
- [ ] Google Drive import works
- [ ] Payment flow works
- [ ] All Edge Functions work
- [ ] Database operations work

### Post-Migration
- [ ] Old Supabase project can be archived
- [ ] Monitor logs for any issues
- [ ] Update any documentation with new URLs

---

## 🔧 Rollback Plan

If something goes wrong, you can quickly rollback:

1. **Revert Environment Variables** in Vercel
2. **Revert Webhook URLs** in external services
3. **Revert Google OAuth URLs** in Google Cloud Console
4. **Redeploy** with old configuration

Keep the old Supabase project active until you're confident the migration is successful.

---

## 📞 Support

**Current Configuration:**
- Old Project: `gewffjhkvxppwxhqmtqx.supabase.co`
- New Project: `YOUR-NEW-PROJECT.supabase.co`

**Key Files to Update:**
- `src/lib/supabase.js`
- `env.production`
- Vercel environment variables
- External service configurations

**Your migration is ready to execute!** 🚀
