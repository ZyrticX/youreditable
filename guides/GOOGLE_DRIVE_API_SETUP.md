# Google Drive API Integration Guide

## Overview
This guide explains how to integrate Google Drive API to allow users to import videos from Google Drive folders and files. **Google authentication is optional** - users can work with publicly shared Google Drive links without signing in with Google.

## How It Works

### Without Google Sign-In
- Users can paste Google Drive file URLs that are **publicly shared**
- The system will create video entries using the file ID from the URL
- Videos will be embedded using Google Drive's preview system
- Limited metadata available (no file names, sizes, etc.)

### With Google Sign-In (Enhanced Experience)
- Users get full access to their private Google Drive files
- Complete metadata including file names, sizes, thumbnails
- Can browse folders and get detailed file information
- Better error handling and file validation

## 1. Google Cloud Console Setup

### Enable Google Drive API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Search for "Google Drive API"
5. Click "Enable"

### Create Service Account (Recommended)
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in service account details
4. Download the JSON key file
5. Store the JSON content as a Supabase secret

### OAuth Scopes Required
Add these scopes to your OAuth consent screen:
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/drive.metadata.readonly`

## 2. Supabase Edge Function Implementation

### Create Edge Function
```bash
supabase functions new google-drive-import
```

### Function Code Example
```typescript
// supabase/functions/google-drive-import/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { folderId, accessToken } = await req.json()
    
    // Use Google Drive API to list files
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType+contains+'video'&fields=files(id,name,mimeType,thumbnailLink,webViewLink,size)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch from Google Drive')
    }

    // Process and return video files
    const videos = data.files?.map(file => ({
      id: file.id,
      title: file.name,
      mimeType: file.mimeType,
      thumbnailLink: file.thumbnailLink,
      webViewLink: file.webViewLink,
      size: file.size,
      previewUrl: `https://drive.google.com/file/d/${file.id}/preview`
    })) || []

    return new Response(
      JSON.stringify({ videos }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
```

## 3. Frontend Implementation

### Update functions.js
```javascript
// src/api/functions.js
import { supabaseClient } from './supabaseClient';

export const googleDrive = async ({ folderId, accessToken }) => {
  try {
    const { data, error } = await supabaseClient.functions.invoke('google-drive-import', {
      body: { folderId, accessToken }
    });

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Google Drive API error:', error);
    throw error;
  }
};
```

### Get User Access Token
```javascript
// In your component where you need Google Drive access
const getUserGoogleToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.provider_token) {
    return session.provider_token; // Google access token
  }
  
  throw new Error('No Google access token available');
};
```

## 4. Usage in Components

### Update Import.jsx
```javascript
// In src/pages/Import.jsx
const handleGoogleDriveImport = async () => {
  try {
    setIsLoading(true);
    
    // Get user's Google access token
    const accessToken = await getUserGoogleToken();
    
    // Extract folder ID from URL
    const folderId = extractFolderIdFromUrl(driveUrl);
    
    // Call Google Drive API
    const response = await googleDrive({ folderId, accessToken });
    
    // Process videos
    if (response.data?.videos) {
      setVideos(response.data.videos);
    }
    
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

## 5. Deployment

### Deploy Edge Function
```bash
supabase functions deploy google-drive-import
```

### Environment Variables
Set these in your Supabase dashboard:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_KEY` (if using service account)

## 6. Security Considerations

1. **Token Management**: Store access tokens securely
2. **Rate Limiting**: Implement rate limiting for API calls
3. **Error Handling**: Proper error handling for API failures
4. **Permissions**: Only request necessary scopes

## 7. Testing

1. Test with different Google Drive folder URLs
2. Verify video file detection
3. Check error handling for invalid URLs
4. Test with folders containing non-video files

## 8. Limitations

- Google Drive API has rate limits
- Access tokens expire and need refresh
- Some video formats may not be supported
- Large folders may take time to process
