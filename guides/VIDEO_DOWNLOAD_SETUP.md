# Video Download & Storage Setup Guide

## Overview
This guide explains how to set up the complete video download flow from Google Drive to Supabase Storage.

## 🎯 Complete Flow
```
1. Import.jsx → User enters Google Drive link
        ↓
2. Edge Function → Downloads video from Google Drive  
        ↓
3. Supabase Storage → Stores the video file
        ↓
4. Database → Saves Supabase Storage URL
        ↓
5. Review.jsx → Displays video from Supabase ✅
```

## 📋 Setup Steps

### 1. Database Schema Update
Run the storage support SQL script:
```bash
# In Supabase SQL Editor, run:
SQL/add-storage-support.sql
```

This will:
- Add `storage_path` column to `video_versions`
- Add `notes` column to `videos` 
- Add `processing` status to video status enum
- Create `videos` storage bucket
- Set up RLS policies for video storage

### 2. Deploy Edge Function
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the video download function
supabase functions deploy download-video
```

### 3. Environment Variables
Set these in your Supabase dashboard under Settings > Edge Functions:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for storage access)

### 4. Storage Configuration
In Supabase Dashboard:
1. Go to Storage
2. Verify `videos` bucket exists and is public
3. Check RLS policies are applied

## 🔧 How It Works

### Frontend (Import.jsx)
1. User selects videos from Google Drive
2. For each video, calls `downloadVideoFromDrive()`
3. Creates video record with `processing` status
4. Updates to `active` status when download completes
5. Falls back to Google Drive link if download fails

### Edge Function (download-video)
1. Receives video metadata from frontend
2. Downloads video file from Google Drive API
3. Uploads to Supabase Storage bucket `videos`
4. Returns Supabase Storage URL and metadata
5. Optionally generates thumbnail (TODO)

### Database Storage
- `videos.status` = `processing` → `active`
- `video_versions.file_url` = Supabase Storage URL
- `video_versions.storage_path` = Storage path for management
- `video_versions.file_size` = Actual file size
- `videos.notes` = Processing status/errors

## 🚀 Benefits

### ✅ Advantages
- **Fast Loading**: Videos served from Supabase CDN
- **Reliable**: No dependency on Google Drive availability
- **Secure**: Full control over video access
- **Scalable**: Supabase handles CDN and bandwidth
- **Offline**: Works even if Google Drive links break

### ⚠️ Considerations
- **Storage Costs**: Videos consume Supabase storage quota
- **Processing Time**: Initial import takes longer
- **Bandwidth**: Download uses Edge Function bandwidth

## 🔍 Testing

### Test the Flow
1. Go to Import page
2. Enter Google Drive folder URL
3. Select videos
4. Create project
5. Check video status in database:
   ```sql
   SELECT v.title, v.status, v.notes, vv.file_url, vv.storage_path
   FROM videos v
   JOIN video_versions vv ON v.current_version_id = vv.id
   WHERE v.project_id = 'YOUR_PROJECT_ID';
   ```

### Verify Storage
1. Go to Supabase Storage > videos bucket
2. Check files are uploaded under `videos/{userId}/{projectId}/`
3. Test public URLs work

## 🛠️ Troubleshooting

### Common Issues
1. **Edge Function not found**: Deploy with `supabase functions deploy download-video`
2. **Storage permission denied**: Check RLS policies on storage.objects
3. **Download fails**: Check Google Drive API access and file permissions
4. **Large files timeout**: Consider implementing chunked upload for large videos

### Debug Logs
Check Edge Function logs:
```bash
supabase functions logs download-video
```

## 🔮 Future Enhancements

### Planned Features
- **Thumbnail Generation**: Extract video thumbnails using FFmpeg
- **Video Compression**: Optimize video files for web playback
- **Progress Tracking**: Real-time download progress updates
- **Batch Processing**: Download multiple videos in parallel
- **Retry Logic**: Automatic retry for failed downloads

### Implementation Priority
1. ✅ Basic download and storage
2. 🔄 Thumbnail generation
3. 📊 Progress tracking
4. 🔄 Video compression
5. ⚡ Batch processing
