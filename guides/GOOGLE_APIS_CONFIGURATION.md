# 🔍 Google APIs Configuration - Complete Setup Guide

## 🎯 Overview
Your app uses two Google APIs:
1. **Google OAuth** - For user authentication ("Sign in with Google")
2. **Google Drive API** - For importing videos from Google Drive

---

## 📍 Where Google APIs are Used in Your Code

### Google OAuth Integration
- `src/components/auth/UserProvider.jsx` - Auth state management
- `src/api/supabaseClient.js` - `signInWithGoogle()` method (line 52)
- `src/pages/Login.jsx` - "Continue with Google" button

### Google Drive API Integration
- `src/api/functions.js` - Direct API calls (lines 5-219)
- `supabase/functions/list-drive-files/index.ts` - Lists files in folders
- `supabase/functions/download-video/index.ts` - Downloads videos
- `src/pages/Import.jsx` - Import interface

---

## 🚀 Step 1: Google Cloud Console Setup

### 1.1 Create/Select Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or select existing one
3. Note your **Project ID**

### 1.2 Enable Required APIs
1. Go to **APIs & Services** > **Library**
2. Enable these APIs:
   - ✅ **Google Drive API**
   - ✅ **Google+ API** (for OAuth)

### 1.3 Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in required information:
   - **App name**: "Editable - Video Review Platform"
   - **User support email**: your email
   - **Developer contact information**: your email
   - **App domain**: `https://www.youreditable.com`

4. Add scopes:
   - `email`
   - `profile` 
   - `openid`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`

### 1.4 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add **Authorized redirect URIs**:
   ```
   https://gewffjhkvxppwxhqmtqx.supabase.co/auth/v1/callback
   https://www.youreditable.com/auth/v1/callback
   http://localhost:54321/auth/v1/callback
   ```

5. **Copy the Client ID and Client Secret** - you'll need these!

---

## 🔐 Step 2: Supabase Google OAuth Configuration

### 2.1 Enable Google Provider
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click **Enable**
4. Enter your credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

### 2.2 Configure Redirect URLs
In Supabase Auth settings, verify these URLs are configured:
- `https://www.youreditable.com/Dashboard`
- `http://localhost:5173/Dashboard` (for development)

---

## 📁 Step 3: Google Drive API Configuration

### 3.1 Service Account (Optional - for server-side access)
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in service account details:
   - **Name**: "Editable Drive Access"
   - **Description**: "Service account for Google Drive API access"
4. Download the **JSON key file**
5. Store the JSON content as a Supabase secret

### 3.2 Configure Supabase Secrets (if using Service Account)
1. Go to Supabase Dashboard > **Edge Functions** > **Settings**
2. Add these secrets:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
   GOOGLE_CLIENT_ID=your_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_oauth_client_secret
   ```

---

## 🧪 Step 4: Testing Your Setup

### Test Google OAuth
1. Deploy your changes to Vercel
2. Go to your login page
3. Click "Continue with Google"
4. Verify:
   - ✅ Google OAuth popup opens
   - ✅ User can sign in
   - ✅ Redirected to Dashboard
   - ✅ User created in Supabase

### Test Google Drive Integration
1. Sign in with Google (to get access token)
2. Go to Import page
3. Enter a Google Drive folder URL
4. Click "Import Videos"
5. Verify:
   - ✅ Videos are listed from the folder
   - ✅ Can select videos
   - ✅ Can create project with selected videos

---

## 🔧 Step 5: Environment Variables

### For Vercel (Frontend)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### For Supabase Edge Functions
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

---

## 🎯 How Your Google Integration Works

### Authentication Flow
```
1. User clicks "Sign in with Google"
2. Supabase redirects to Google OAuth
3. User authorizes your app
4. Google redirects back to Supabase
5. Supabase creates user session
6. User redirected to Dashboard
```

### Google Drive Access Flow
```
1. User enters Google Drive folder URL
2. App extracts folder ID
3. Calls list-drive-files Edge Function
4. Edge Function uses Google Drive API
5. Returns list of video files
6. User selects videos to import
7. App calls download-video Edge Function
8. Videos downloaded to Supabase Storage
```

### Access Levels
Your app supports two access levels:

#### 1. Public Access (No Google Sign-in)
- Can access **publicly shared** Google Drive files
- Limited metadata available
- Works for individual file URLs

#### 2. Authenticated Access (With Google Sign-in)
- Full access to user's private Google Drive
- Complete metadata (names, sizes, thumbnails)
- Can browse folders
- Better error handling

---

## 🚨 Common Issues & Solutions

### Issue 1: "OAuth Error: redirect_uri_mismatch"
**Solution**: 
1. Check redirect URIs in Google Cloud Console
2. Ensure Supabase project URL is correct
3. Add all necessary redirect URIs

### Issue 2: "Google Drive API not enabled"
**Solution**:
1. Go to Google Cloud Console > APIs & Services > Library
2. Search for "Google Drive API"
3. Click "Enable"

### Issue 3: "Access token not available"
**Solution**:
1. User needs to sign in with Google first
2. Check that Google provider is enabled in Supabase
3. Verify OAuth scopes include Drive access

### Issue 4: "Folder access denied"
**Solution**:
1. Folder must be publicly shared, OR
2. User must be signed in with Google, OR
3. User must have access to the folder

---

## 📋 Final Checklist

### Google Cloud Console
- [ ] Project created
- [ ] Google Drive API enabled
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs added
- [ ] Service account created (optional)

### Supabase Configuration
- [ ] Google provider enabled
- [ ] Client ID and Secret entered
- [ ] Redirect URLs configured
- [ ] Edge Function secrets added (if using service account)

### Testing
- [ ] Google OAuth sign-in works
- [ ] User redirected to Dashboard after sign-in
- [ ] Google Drive folder import works
- [ ] Video files are detected and listed
- [ ] Videos can be downloaded to Supabase Storage

### Environment Variables
- [ ] `VITE_GOOGLE_CLIENT_ID` set in Vercel
- [ ] Google secrets set in Supabase Edge Functions

**Once all items are checked, your Google APIs integration is complete!** 🎉

---

## 🔍 Debugging Tips

### Check Console Logs
Look for these messages:
- `🔑 Access token available: true/false`
- `📋 listDriveFiles called with:`
- `📥 List files response:`

### Check Supabase Logs
```bash
# View Edge Function logs
supabase functions logs list-drive-files
supabase functions logs download-video
```

### Test API Calls Manually
You can test Google Drive API directly:
```bash
curl "https://www.googleapis.com/drive/v3/files/FOLDER_ID?fields=id,name" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
