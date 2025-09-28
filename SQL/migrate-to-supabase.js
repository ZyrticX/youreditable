// Data Migration Script from Base44 to Supabase
// Run this script to migrate your existing data

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this
const BASE44_API_URL = process.env.BASE44_API_URL || 'your-base44-api-url';
const BASE44_API_KEY = process.env.BASE44_API_KEY || 'your-base44-api-key';

// Initialize Supabase with service role key (for bypassing RLS during migration)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Base44 API client (you'll need to adapt this based on your Base44 setup)
class Base44Client {
  constructor(apiUrl, apiKey) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async fetchAll(entity, params = {}) {
    // Implement your Base44 API call here
    // This is a placeholder - adapt to your actual Base44 API
    const response = await fetch(`${this.apiUrl}/${entity}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
}

const base44 = new Base44Client(BASE44_API_URL, BASE44_API_KEY);

// Migration functions
async function migrateUsers() {
  console.log('🔄 Migrating users...');
  
  try {
    // Fetch users from Base44
    const base44Users = await base44.fetchAll('users');
    
    const migratedUsers = [];
    
    for (const user of base44Users) {
      // Create user in Supabase Auth (you might need to handle this differently)
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: generateTempPassword(), // Generate temporary password
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name || user.display_name,
          migrated_from_base44: true,
          original_id: user.id
        }
      });

      if (authError) {
        console.error(`Error creating auth user for ${user.email}:`, authError);
        continue;
      }

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: user.email,
          full_name: user.full_name,
          display_name: user.display_name,
          plan_level: user.plan_level || 'free'
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
        continue;
      }

      migratedUsers.push({
        originalId: user.id,
        newId: authUser.user.id,
        email: user.email
      });
    }

    console.log(`✅ Migrated ${migratedUsers.length} users`);
    return migratedUsers;
    
  } catch (error) {
    console.error('❌ Error migrating users:', error);
    throw error;
  }
}

async function migrateProjects(userMapping) {
  console.log('🔄 Migrating projects...');
  
  try {
    const base44Projects = await base44.fetchAll('projects');
    const migratedProjects = [];

    for (const project of base44Projects) {
      // Find the new user ID
      const userMap = userMapping.find(u => u.originalId === project.user_id);
      if (!userMap) {
        console.warn(`User not found for project ${project.id}, skipping...`);
        continue;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userMap.newId,
          name: project.name,
          client_display_name: project.client_display_name,
          status: project.status || 'active',
          share_token: project.share_token,
          share_expires_at: project.share_expires_at,
          approved_videos_count: project.approved_videos_count || 0,
          total_videos_count: project.total_videos_count || 0,
          last_status_change_at: project.last_status_change_at || project.created_at,
          created_at: project.created_at,
          updated_at: project.updated_at || project.created_at
        })
        .select()
        .single();

      if (error) {
        console.error(`Error migrating project ${project.id}:`, error);
        continue;
      }

      migratedProjects.push({
        originalId: project.id,
        newId: data.id,
        name: project.name
      });
    }

    console.log(`✅ Migrated ${migratedProjects.length} projects`);
    return migratedProjects;
    
  } catch (error) {
    console.error('❌ Error migrating projects:', error);
    throw error;
  }
}

async function migrateVideos(projectMapping) {
  console.log('🔄 Migrating videos...');
  
  try {
    const base44Videos = await base44.fetchAll('videos');
    const migratedVideos = [];

    for (const video of base44Videos) {
      // Find the new project ID
      const projectMap = projectMapping.find(p => p.originalId === video.project_id);
      if (!projectMap) {
        console.warn(`Project not found for video ${video.id}, skipping...`);
        continue;
      }

      const { data, error } = await supabase
        .from('videos')
        .insert({
          project_id: projectMap.newId,
          title: video.title,
          status: video.status || 'pending_review',
          order_index: video.order_index || 0,
          created_at: video.created_at,
          updated_at: video.updated_at || video.created_at
        })
        .select()
        .single();

      if (error) {
        console.error(`Error migrating video ${video.id}:`, error);
        continue;
      }

      migratedVideos.push({
        originalId: video.id,
        newId: data.id,
        title: video.title,
        originalCurrentVersionId: video.current_version_id
      });
    }

    console.log(`✅ Migrated ${migratedVideos.length} videos`);
    return migratedVideos;
    
  } catch (error) {
    console.error('❌ Error migrating videos:', error);
    throw error;
  }
}

async function migrateVideoVersions(videoMapping) {
  console.log('🔄 Migrating video versions...');
  
  try {
    const base44VideoVersions = await base44.fetchAll('video_versions');
    const migratedVersions = [];

    for (const version of base44VideoVersions) {
      // Find the new video ID
      const videoMap = videoMapping.find(v => v.originalId === version.video_id);
      if (!videoMap) {
        console.warn(`Video not found for version ${version.id}, skipping...`);
        continue;
      }

      const { data, error } = await supabase
        .from('video_versions')
        .insert({
          video_id: videoMap.newId,
          version_number: version.version_number || 1,
          source_type: version.source_type || 'drive',
          source_url: version.source_url,
          file_id: version.file_id,
          thumbnail_url: version.thumbnail_url,
          created_at: version.created_at,
          updated_at: version.updated_at || version.created_at
        })
        .select()
        .single();

      if (error) {
        console.error(`Error migrating video version ${version.id}:`, error);
        continue;
      }

      migratedVersions.push({
        originalId: version.id,
        newId: data.id,
        videoId: videoMap.newId,
        isCurrentVersion: videoMap.originalCurrentVersionId === version.id
      });
    }

    // Update videos with current_version_id
    console.log('🔄 Updating current version references...');
    for (const version of migratedVersions) {
      if (version.isCurrentVersion) {
        await supabase
          .from('videos')
          .update({ current_version_id: version.newId })
          .eq('id', version.videoId);
      }
    }

    console.log(`✅ Migrated ${migratedVersions.length} video versions`);
    return migratedVersions;
    
  } catch (error) {
    console.error('❌ Error migrating video versions:', error);
    throw error;
  }
}

async function migrateNotes(versionMapping) {
  console.log('🔄 Migrating notes...');
  
  try {
    const base44Notes = await base44.fetchAll('notes');
    let migratedCount = 0;

    for (const note of base44Notes) {
      // Find the new version ID
      const versionMap = versionMapping.find(v => v.originalId === note.video_version_id);
      if (!versionMap) {
        console.warn(`Video version not found for note ${note.id}, skipping...`);
        continue;
      }

      const { error } = await supabase
        .from('notes')
        .insert({
          video_version_id: versionMap.newId,
          reviewer_name: note.reviewer_name,
          reviewer_email: note.reviewer_email,
          note_text: note.note_text,
          timestamp_seconds: note.timestamp_seconds,
          video_title: note.video_title,
          status: note.status || 'open',
          created_at: note.created_at,
          updated_at: note.updated_at || note.created_at
        });

      if (error) {
        console.error(`Error migrating note ${note.id}:`, error);
        continue;
      }

      migratedCount++;
    }

    console.log(`✅ Migrated ${migratedCount} notes`);
    
  } catch (error) {
    console.error('❌ Error migrating notes:', error);
    throw error;
  }
}

async function migrateApprovals(videoMapping, versionMapping) {
  console.log('🔄 Migrating approvals...');
  
  try {
    const base44Approvals = await base44.fetchAll('approvals');
    let migratedCount = 0;

    for (const approval of base44Approvals) {
      let scopeId = approval.scope_id;
      
      // Map scope_id based on scope_type
      if (approval.scope_type === 'video') {
        const videoMap = videoMapping.find(v => v.originalId === approval.scope_id);
        if (!videoMap) {
          console.warn(`Video not found for approval ${approval.id}, skipping...`);
          continue;
        }
        scopeId = videoMap.newId;
      }
      // For project approvals, you'd need project mapping here

      // Map version_id if it exists
      let versionId = null;
      if (approval.version_id) {
        const versionMap = versionMapping.find(v => v.originalId === approval.version_id);
        if (versionMap) {
          versionId = versionMap.newId;
        }
      }

      const { error } = await supabase
        .from('approvals')
        .insert({
          scope_type: approval.scope_type,
          scope_id: scopeId,
          version_id: versionId,
          approver_name: approval.approver_name,
          approver_email: approval.approver_email,
          created_at: approval.created_at
        });

      if (error) {
        console.error(`Error migrating approval ${approval.id}:`, error);
        continue;
      }

      migratedCount++;
    }

    console.log(`✅ Migrated ${migratedCount} approvals`);
    
  } catch (error) {
    console.error('❌ Error migrating approvals:', error);
    throw error;
  }
}

// Helper functions
function generateTempPassword() {
  return Math.random().toString(36).slice(-8) + 'A1!'; // Meets common password requirements
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting migration from Base44 to Supabase...');
  
  try {
    // Step 1: Migrate users
    const userMapping = await migrateUsers();
    
    // Step 2: Migrate projects
    const projectMapping = await migrateProjects(userMapping);
    
    // Step 3: Migrate videos
    const videoMapping = await migrateVideos(projectMapping);
    
    // Step 4: Migrate video versions
    const versionMapping = await migrateVideoVersions(videoMapping);
    
    // Step 5: Migrate notes
    await migrateNotes(versionMapping);
    
    // Step 6: Migrate approvals
    await migrateApprovals(videoMapping, versionMapping);
    
    console.log('🎉 Migration completed successfully!');
    console.log('📧 Don\'t forget to notify users about password reset if needed');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Export for use as module
export { runMigration, migrateUsers, migrateProjects, migrateVideos, migrateVideoVersions, migrateNotes, migrateApprovals };

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}
