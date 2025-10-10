// Utility to migrate old Supabase URLs to new custom domain
export const migrateVideoUrl = (url) => {
  if (!url) return url;
  
  // Replace old Supabase domain with new custom domain
  return url.replace(
    'gewffjhkvxppwxhqmtqx.supabase.co',
    'connect.youreditable.com'
  );
};

// Function to check if URL needs migration
export const needsUrlMigration = (url) => {
  return url && url.includes('gewffjhkvxppwxhqmtqx.supabase.co');
};

// Migrate video object URLs
export const migrateVideoUrls = (video) => {
  if (!video || !video.currentVersion) return video;
  
  return {
    ...video,
    currentVersion: {
      ...video.currentVersion,
      source_url: migrateVideoUrl(video.currentVersion.source_url),
      storage_path: migrateVideoUrl(video.currentVersion.storage_path)
    }
  };
};
