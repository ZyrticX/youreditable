import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VideoDownloadRequest {
  fileId: string
  fileName: string
  accessToken?: string
  userId: string
  projectId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('📥 Received request body:', requestBody)
    
    const { fileId, fileName, accessToken, userId, projectId }: VideoDownloadRequest = requestBody

    console.log('🔍 Extracted parameters:', { fileId, fileName, userId, projectId, hasAccessToken: !!accessToken })

    if (!fileId || !fileName || !userId || !projectId) {
      console.error('❌ Missing parameters:', { fileId, fileName, userId, projectId })
      throw new Error('Missing required parameters: fileId, fileName, userId, projectId')
    }

    console.log(`🎬 Starting video download: ${fileName} (${fileId})`)

    // Step 1: Download video from Google Drive
    const videoBuffer = await downloadVideoFromGoogleDrive(fileId, accessToken)
    
    // Step 2: Upload to Supabase Storage
    const storagePath = `videos/${userId}/${projectId}/${fileId}_${fileName}`
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('videos')
      .upload(storagePath, videoBuffer, {
        contentType: getVideoMimeType(fileName),
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Failed to upload video to storage: ${uploadError.message}`)
    }

    // Step 3: Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('videos')
      .getPublicUrl(storagePath)

    const publicUrl = urlData.publicUrl

    console.log(`✅ Video uploaded successfully: ${publicUrl}`)

    // Step 4: Generate thumbnail (optional)
    let thumbnailUrl = null
    try {
      thumbnailUrl = await generateThumbnail(videoBuffer, storagePath, supabaseClient, userId, projectId, fileId)
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          fileUrl: publicUrl,
          thumbnailUrl,
          storagePath,
          fileSize: videoBuffer.byteLength,
          mimeType: getVideoMimeType(fileName)
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Video download error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function downloadVideoFromGoogleDrive(fileId: string, accessToken?: string): Promise<ArrayBuffer> {
  let downloadUrl: string

  if (accessToken) {
    // Authenticated download - better quality and reliability
    downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to download video from Google Drive: ${response.status} ${response.statusText}`)
    }

    return await response.arrayBuffer()
  } else {
    // Public download - try direct download URL
    downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
    
    const response = await fetch(downloadUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to download public video from Google Drive: ${response.status} ${response.statusText}`)
    }

    return await response.arrayBuffer()
  }
}

async function generateThumbnail(
  videoBuffer: ArrayBuffer, 
  videoPath: string, 
  supabaseClient: any,
  userId: string,
  projectId: string,
  fileId: string
): Promise<string | null> {
  try {
    // For now, we'll skip thumbnail generation as it requires FFmpeg
    // In production, you'd use FFmpeg to extract a frame from the video
    
    // Placeholder: return null for now
    // TODO: Implement thumbnail generation with FFmpeg
    console.log('Thumbnail generation not implemented yet')
    return null
    
  } catch (error) {
    console.error('Thumbnail generation failed:', error)
    return null
  }
}

function getVideoMimeType(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop()
  
  const mimeTypes: { [key: string]: string } = {
    'mp4': 'video/mp4',
    'avi': 'video/avi',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    'm4v': 'video/mp4',
    '3gp': 'video/3gpp'
  }
  
  return mimeTypes[extension || ''] || 'video/mp4'
}
