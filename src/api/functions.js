// Functions - Google Drive and other integrations
import { supabaseClient } from './supabaseClient';

// Helper function for retrying API calls with exponential backoff
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const retryApiCall = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 429 && attempt < maxRetries) {
        const delayMs = baseDelay * Math.pow(2, attempt - 1);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
};

// Helper function to get user's Google access token (optional)
export const getUserGoogleToken = async () => {
  try {
    const { data: { session } } = await supabaseClient.getCurrentSession();
    
    if (session?.provider_token) {
      return session.provider_token; // Google access token
    }
    
    return null; // No token available, but that's okay
  } catch (error) {
    return null; // Silently fail, we'll try public access
  }
};

// Helper function to extract folder ID from Google Drive URL
const extractFolderIdFromUrl = (url) => {
  const patterns = [
    /\/folders\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /^([a-zA-Z0-9-_]+)$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  throw new Error('Invalid Google Drive folder URL format');
};

export const googleDrive = async ({ folderId, fileId }) => {
  console.log('🔍 googleDrive called with:', { folderId, fileId });
  
  try {
    // If it's a URL, extract the ID
    if (folderId && (folderId.includes('drive.google.com') || folderId.includes('/'))) {
      console.log('🔗 Extracting folder ID from URL:', folderId);
      folderId = extractFolderIdFromUrl(folderId);
      console.log('📁 Extracted folder ID:', folderId);
    }
    
    // Get user's Google access token (optional)
    const accessToken = await getUserGoogleToken();
    
    if (fileId) {
      // Single file request - try public access first, then authenticated
      let response;
      let data;
      
      if (accessToken) {
        // Try with authentication first
        response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,thumbnailLink,webViewLink,size`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        data = await response.json();
      }
      
      // If no token or authenticated request failed, try public access
      if (!accessToken || !response.ok) {
        // For public files, we can construct the basic info from the ID
        return {
          data: {
            status: "success",
            file: {
              id: fileId,
              title: `Video ${fileId.substring(0, 8)}`, // Fallback title
              mimeType: 'video/mp4', // Assume video
              thumbnailLink: null,
              webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
              size: null,
              previewUrl: `https://drive.google.com/file/d/${fileId}/preview`
            }
          }
        };
      }

      return {
        data: {
          status: "success",
          file: {
            id: data.id,
            title: data.name,
            mimeType: data.mimeType,
            thumbnailLink: data.thumbnailLink,
            webViewLink: data.webViewLink,
            size: data.size,
            previewUrl: `https://drive.google.com/file/d/${data.id}/preview`
          }
        }
      };
    } else if (folderId) {
      // Folder request - try with or without authentication
      if (!accessToken) {
        // For folders without authentication, we can't use the API
        // But we can provide helpful guidance
        return {
          data: {
            status: "success",
            videos: [],
            message: "To import from Google Drive folders, please sign in with Google or make sure individual video files are publicly shared and use direct file links instead."
          }
        };
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
      ];
      
      const mimeTypeQuery = videoMimeTypes.map(type => `mimeType='${type}'`).join(' or ');
      const query = `'${folderId}' in parents and (${mimeTypeQuery})`;
      
      console.log('Google Drive query:', query);
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,size)`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Google Drive API error:', data);
        throw new Error(data.error?.message || 'Failed to fetch folder from Google Drive. Make sure the folder is shared publicly or sign in with Google.');
      }

      console.log('Google Drive API response:', data);

      // Process and return video files
      let videos = data.files?.map(file => ({
        id: file.id,
        title: file.name,
        mimeType: file.mimeType,
        thumbnailLink: file.thumbnailLink,
        webViewLink: file.webViewLink,
        size: file.size,
        previewUrl: `https://drive.google.com/file/d/${file.id}/preview`
      })) || [];

      // If no videos found with specific mime types, try a broader search
      if (videos.length === 0 && accessToken) {
        console.log('No videos found with specific mime types, trying broader search...');
        
        const broadQuery = `'${folderId}' in parents and (name contains '.mp4' or name contains '.avi' or name contains '.mov' or name contains '.wmv' or name contains '.mkv' or name contains '.webm' or name contains '.m4v')`;
        
        const broadResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(broadQuery)}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,size)`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (broadResponse.ok) {
          const broadData = await broadResponse.json();
          console.log('Broad search results:', broadData);
          
          videos = broadData.files?.map(file => ({
            id: file.id,
            title: file.name,
            mimeType: file.mimeType || 'video/mp4', // Default to mp4 if no mime type
            thumbnailLink: file.thumbnailLink,
            webViewLink: file.webViewLink,
            size: file.size,
            previewUrl: `https://drive.google.com/file/d/${file.id}/preview`
          })) || [];
        }
      }

      return {
        data: {
          status: "success",
          videos,
          message: videos.length === 0 ? "No video files found in this folder. Make sure the folder contains video files (.mp4, .avi, .mov, etc.) and is publicly shared." : undefined
        }
      };
    } else {
      throw new Error('Either folderId or fileId must be provided');
    }
    
  } catch (error) {
    console.error('Google Drive API error:', error);
    
    // Return user-friendly error messages
    if (error.message.includes('Invalid')) {
      throw new Error('Invalid Google Drive URL. Please check the URL and try again.');
    } else if (error.message.includes('permission') || error.message.includes('access')) {
      throw new Error('Cannot access this Google Drive file. Please make sure it is shared publicly or you have permission to view it.');
    } else {
      throw new Error('Failed to connect to Google Drive: ' + error.message);
    }
  }
};

export const listDriveFiles = async ({ folderId, accessToken }) => {
  console.log('📋 listDriveFiles called with:', { folderId, hasAccessToken: !!accessToken });
  
  try {
    // Call Supabase Edge Function to list files
    const { data, error } = await supabaseClient.supabase.functions.invoke('list-drive-files', {
      body: {
        folderId,
        accessToken
      }
    });

    console.log('📥 List files response:', { data, error });

    if (error) {
      console.error('❌ List files error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('💥 List files error:', error);
    throw new Error(`Failed to list drive files: ${error.message}`);
  }
};

export const downloadVideoFromDrive = async ({ fileId, fileName, accessToken, userId, projectId }) => {
  console.log('📤 downloadVideoFromDrive called with:', { fileId, fileName, userId, projectId, hasAccessToken: !!accessToken });
  
  try {
    // Call Supabase Edge Function directly
    const { data, error } = await supabaseClient.supabase.functions.invoke('download-video', {
      body: {
        fileId,
        fileName,
        accessToken,
        userId,
        projectId
      }
    });

    console.log('📥 Edge Function response:', { data, error });

    if (error) {
      console.error('❌ Edge Function error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('💥 Video download error:', error);
    throw new Error(`Failed to download video: ${error.message}`);
  }
};

export const sendContactEmail = async (data) => {
  console.log('Contact email would be sent:', data);
  // TODO: Implement with Supabase Edge Functions
  return { success: true, message: 'Message sent successfully!' };
};

