# Google OAuth Setup Guide

## 1. Google Cloud Console Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google+ API (for OAuth)
   - Google Drive API (for file access)

### Step 2: Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: "Your Editable"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
   - `https://www.googleapis.com/auth/drive.readonly` (for Google Drive access)

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - For development: `http://localhost:54321/auth/v1/callback`
   - For production: `https://your-project.supabase.co/auth/v1/callback`
   - For your domain: `https://www.youreditable.com/auth/v1/callback`

### Step 4: Get Client Credentials
- Copy the Client ID and Client Secret
- You'll need these for Supabase configuration

## 2. Supabase Configuration

### Step 1: Enable Google Provider
1. Go to your Supabase dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" and click "Enable"
4. Enter your Google OAuth credentials:
   - Client ID: from Google Cloud Console
   - Client Secret: from Google Cloud Console

### Step 2: Configure Redirect URLs
In Supabase Auth settings, add these URLs:
- `https://www.youreditable.com/Dashboard`
- `http://localhost:5173/Dashboard` (for development)

## 3. Environment Variables

Add these to your Vercel environment variables:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 4. Testing

1. Deploy your changes to Vercel
2. Try signing in with Google on your login page
3. Check that users are created in Supabase Auth
4. Verify that user profiles are created in your `profiles` table

## 5. Troubleshooting

### Common Issues:
1. **"redirect_uri_mismatch"**: Check that your redirect URIs in Google Cloud Console match exactly
2. **"invalid_client"**: Verify Client ID and Secret are correct
3. **"access_denied"**: Check OAuth consent screen configuration

### Debug Steps:
1. Check browser console for errors
2. Verify Supabase Auth logs
3. Test with different browsers/incognito mode

