import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ListDriveFilesRequest {
  folderId: string
  accessToken?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    console.log('📥 List Drive Files - Received request:', requestBody)
    
    const { folderId, accessToken }: ListDriveFilesRequest = requestBody

    console.log('🔍 Parameters:', { folderId, hasAccessToken: !!accessToken })

    if (!folderId) {
      throw new Error('Missing required parameter: folderId')
    }

    console.log(`📁 Listing files in Google Drive folder: ${folderId}`)

    // List files from Google Drive
    const videos = await listGoogleDriveFiles(folderId, accessToken)

    console.log(`✅ Found ${videos.length} video files`)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status: "success",
          videos,
          message: videos.length === 0 ? "No video files found in this folder. Make sure the folder contains video files (.mp4, .avi, .mov, etc.) and is publicly shared." : undefined
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ List Drive Files error:', error)
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

async function listGoogleDriveFiles(folderId: string, accessToken?: string): Promise<any[]> {
  // Get Google API Key from environment
  const googleApiKey = Deno.env.get('GOOGLE_API_KEY')
  
  if (!accessToken && !googleApiKey) {
    console.log('⚠️ No access token or API key - cannot list folder contents')
    return []
  }
  
  // Build query for common video formats
  const videoMimeTypes = [
    'video/mp4',
    'video/avi', 
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mkv',
    'video/m4v',
    'video/3gp',
    'video/quicktime'
  ]
  
  const mimeTypeQuery = videoMimeTypes.map(type => `mimeType='${type}'`).join(' or ')
  const query = `'${folderId}' in parents and (${mimeTypeQuery})`
  
  console.log('🔍 Google Drive query:', query)
  
  // Prepare headers based on available authentication
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
  }
  
  let apiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,size)`
  
  if (accessToken) {
    console.log('🔑 Using OAuth access token')
    headers['Authorization'] = `Bearer ${accessToken}`
  } else if (googleApiKey) {
    console.log('🔑 Using API Key')
    apiUrl += `&key=${googleApiKey}`
  }
  
  const response = await fetch(apiUrl, { headers })

  const data = await response.json()
  
  if (!response.ok) {
    console.error('❌ Google Drive API error:', data)
    throw new Error(data.error?.message || 'Failed to fetch folder from Google Drive. Make sure the folder is shared publicly or sign in with Google.')
  }

  console.log('📊 Google Drive API response:', data)

  // Process and return video files
  let videos = data.files?.map((file: any) => ({
    id: file.id,
    title: file.name,
    mimeType: file.mimeType,
    thumbnailLink: file.thumbnailLink,
    webViewLink: file.webViewLink,
    size: file.size,
    previewUrl: `https://drive.google.com/file/d/${file.id}/preview`
  })) || []

  // If no videos found with specific mime types, try a broader search
  if (videos.length === 0) {
    console.log('🔍 No videos found with specific mime types, trying broader search...')
    
    const broadQuery = `'${folderId}' in parents and (name contains '.mp4' or name contains '.avi' or name contains '.mov' or name contains '.wmv' or name contains '.mkv' or name contains '.webm' or name contains '.m4v')`
    
    let broadApiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(broadQuery)}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,size)`
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    } else if (googleApiKey) {
      broadApiUrl += `&key=${googleApiKey}`
    }
    
    const broadResponse = await fetch(broadApiUrl, { headers })

    if (broadResponse.ok) {
      const broadData = await broadResponse.json()
      console.log('📊 Broad search results:', broadData)
      
      videos = broadData.files?.map((file: any) => ({
        id: file.id,
        title: file.name,
        mimeType: file.mimeType || 'video/mp4', // Default to mp4 if no mime type
        thumbnailLink: file.thumbnailLink,
        webViewLink: file.webViewLink,
        size: file.size,
        previewUrl: `https://drive.google.com/file/d/${file.id}/preview`
      })) || []
    }
  }

  return videos
}
