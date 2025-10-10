# 🔧 API Integration Guide - Complete Setup

## 📋 Overview
This guide covers the complete setup of all APIs used in your Editable application:
- **Supabase** (Database & Authentication)
- **Paddle** (Payment Processing)
- **Google Drive API** (File Integration)
- **Google OAuth** (Authentication)

---

## 🗄️ 1. SUPABASE SETUP

### Current Configuration
Your app uses these Supabase configurations:

**File Locations:**
- `src/lib/supabase.js` - Main Supabase client
- `src/api/supabaseClient.js` - Wrapper class
- `src/api/entities.js` - Database entities

**Environment Variables Needed:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Setup Steps:

#### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key

#### 2. Set Up Database Schema
1. Go to Supabase Dashboard > SQL Editor
2. Run the contents of `SQL/supabase-schema-safe.sql`
3. Run the contents of `SQL/add-storage-support.sql`

#### 3. Configure Authentication
1. Go to Authentication > Providers
2. Enable Google provider (see Google OAuth section)
3. Set redirect URLs:
   - `https://www.youreditable.com/Dashboard`
   - `http://localhost:5173/Dashboard` (development)

#### 4. Set Up Edge Functions
```bash
# Deploy your Edge Functions
supabase functions deploy paddle-webhook
supabase functions deploy list-drive-files
supabase functions deploy download-video
```

#### 5. Configure Environment Variables
**In Vercel:**
1. Go to your Vercel project settings
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**In Supabase (for Edge Functions):**
1. Go to Edge Functions > Settings
2. Add secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 💳 2. PADDLE SETUP

### Current Configuration
Your app integrates Paddle in these files:

**File Locations:**
- `index.html` - Paddle.js initialization (lines 13-147)
- `src/config/paddle.js` - Configuration file
- `supabase/functions/paddle-webhook/index.ts` - Webhook handler

**Current Status:**
- ✅ Paddle.js loaded
- ✅ Live tokens configured
- ❌ Price IDs need to be updated
- ❌ Webhooks need configuration

### Setup Steps:

#### 1. Create Paddle Account
1. Go to [paddle.com](https://paddle.com)
2. Complete business verification
3. Set up tax information

#### 2. Create Products & Prices
1. Go to Paddle Dashboard > Catalog > Products
2. Create products:
   - **Basic Plan** (Monthly & Annual)
   - **Pro Plan** (Monthly & Annual)
3. Note down the **Price IDs** for each

#### 3. Get API Tokens
1. Go to Developer Tools > Authentication
2. Create tokens:
   - **Sandbox**: `test_xxxxxxxxx` (for testing)
   - **Live**: `live_xxxxxxxxx` (for production)

#### 4. Update Configuration

**Update `index.html` (lines 28-33):**
```javascript
const PADDLE_PRICES = {
  basic_monthly: 'pri_YOUR_BASIC_MONTHLY_PRICE_ID',    // Replace with real ID
  basic_annual: 'pri_YOUR_BASIC_ANNUAL_PRICE_ID',     // Replace with real ID
  pro_monthly: 'pri_YOUR_PRO_MONTHLY_PRICE_ID',       // Replace with real ID
  pro_annual: 'pri_YOUR_PRO_ANNUAL_PRICE_ID'          // Replace with real ID
};
```

**Your current tokens (already configured):**
- Environment: `production`
- Token: `live_78bfb05443070c51ce8ee3aa7e8`
- Environment Key: `apikey_01k3zv10jzrjp00ahsrpxxwdcr`

#### 5. Set Up Webhooks
1. Go to Developer Tools > Notifications
2. Add webhook endpoint: `https://gewffjhkvxppwxhqmtqx.supabase.co/functions/v1/paddle-webhook`
3. Select events:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `transaction.completed`

#### 6. Test Integration
1. Update price IDs in `index.html`
2. Deploy to Vercel
3. Test checkout flow
4. Verify webhook receives events

---

## 🔍 3. GOOGLE DRIVE API SETUP

### Current Configuration
Your app uses Google Drive API in these files:

**File Locations:**
- `src/api/functions.js` - Direct API calls (lines 35-219)
- `supabase/functions/list-drive-files/index.ts` - Edge Function for listing
- `supabase/functions/download-video/index.ts` - Edge Function for downloading

**Current Features:**
- ✅ Public file access (no auth needed)
- ✅ Authenticated access (with Google sign-in)
- ✅ Video file detection
- ✅ File download to Supabase Storage

### Setup Steps:

#### 1. Google Cloud Console Setup
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable APIs:
   - **Google Drive API**
   - **Google+ API** (for OAuth)

#### 2. Create Service Account (Optional)
1. Go to APIs & Services > Credentials
2. Create Credentials > Service Account
3. Download JSON key file
4. Store as Supabase secret: `GOOGLE_SERVICE_ACCOUNT_KEY`

#### 3. Configure OAuth (for user authentication)
1. Go to APIs & Services > OAuth consent screen
2. Configure app information
3. Add scopes:
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`

#### 4. Create OAuth Credentials
1. Go to APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `https://gewffjhkvxppwxhqmtqx.supabase.co/auth/v1/callback`
   - `https://www.youreditable.com/auth/v1/callback`

#### 5. Configure Supabase
1. Go to Supabase > Authentication > Providers
2. Enable Google provider
3. Enter Client ID and Client Secret from Google Cloud Console

#### 6. Environment Variables
**In Supabase Edge Functions:**
- `GOOGLE_CLIENT_ID` (optional)
- `GOOGLE_CLIENT_SECRET` (optional)
- `GOOGLE_SERVICE_ACCOUNT_KEY` (optional)

---

## 🔐 4. GOOGLE OAUTH SETUP

### Current Configuration
Your app uses Google OAuth through Supabase:

**File Locations:**
- `src/components/auth/UserProvider.jsx` - Auth state management
- `src/api/supabaseClient.js` - `signInWithGoogle()` method
- `src/pages/Login.jsx` - Google sign-in button

### Setup Steps:

#### 1. Google Cloud Console (same as above)
Follow steps 1-4 from Google Drive API setup.

#### 2. Supabase Configuration
1. Go to Authentication > Providers > Google
2. Enable Google provider
3. Enter credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

#### 3. Redirect URLs
Configure these URLs in Google Cloud Console:
- `https://gewffjhkvxppwxhqmtqx.supabase.co/auth/v1/callback`
- `https://www.youreditable.com/auth/v1/callback`

#### 4. Test Integration
1. Deploy changes
2. Try "Continue with Google" button
3. Verify user is created in Supabase
4. Check Google Drive access works

---

## 🚀 5. DEPLOYMENT CHECKLIST

### Environment Variables to Set

**In Vercel:**
```env
VITE_SUPABASE_URL=https://gewffjhkvxppwxhqmtqx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=https://www.youreditable.com
```

**In Supabase Edge Functions:**
```env
SUPABASE_URL=https://gewffjhkvxppwxhqmtqx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLIENT_ID=your_google_client_id (optional)
GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
```

### Files to Update

1. **`index.html`** - Update Paddle price IDs
2. **`vercel.json`** - Ensure correct domain redirects
3. **Deploy Edge Functions:**
   ```bash
   supabase functions deploy paddle-webhook
   supabase functions deploy list-drive-files
   supabase functions deploy download-video
   ```

### Testing Steps

1. **Supabase**: Test login/signup
2. **Paddle**: Test payment flow
3. **Google Drive**: Test video import
4. **Google OAuth**: Test Google sign-in
5. **End-to-End**: Complete user journey

---

## 🔧 6. CURRENT STATUS & NEXT STEPS

### ✅ Already Configured
- Supabase database schema
- Edge Functions deployed
- Paddle tokens configured
- Google Drive API integration
- Frontend authentication flow

### ❌ Needs Configuration
1. **Paddle Price IDs** - Update in `index.html`
2. **Paddle Webhooks** - Configure in Paddle Dashboard
3. **Google OAuth Credentials** - Set up in Google Cloud Console
4. **Supabase Google Provider** - Configure with Google credentials

### 🎯 Priority Order
1. **Google OAuth** (for user authentication)
2. **Paddle Price IDs** (for payments)
3. **Paddle Webhooks** (for subscription management)
4. **Google Drive Service Account** (optional, for enhanced access)

---

## 📞 Support

If you need help with any of these setups:
1. Check the individual guide files in `/GUIDES/`
2. Review the console logs for specific error messages
3. Test each API integration separately before combining

**Your app is well-architected and ready for production once these APIs are properly configured!** 🚀
