# Supabase Usage Guide

Quick reference for using your new Supabase database with your video review app.

## 🗄️ Database Schema

Your Supabase database now includes:

- **`profiles`** - User profiles (extends Supabase Auth)
- **`projects`** - Video review projects
- **`videos`** - Individual videos within projects
- **`video_versions`** - Different versions of videos
- **`notes`** - Feedback/comments on videos
- **`approvals`** - Approval records
- **`notifications`** - System notifications
- **`transactions`** - Billing records

## 🎣 Custom Hooks

### User Projects
```jsx
import { useProjects } from '@/hooks/useSupabase';

function ProjectsList() {
  const { user } = useUser();
  const { data: projects, loading, error } = useProjects(user?.id);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <p>{project.videos?.[0]?.count || 0} videos</p>
        </div>
      ))}
    </div>
  );
}
```

### Project Details
```jsx
import { useProjectDetails } from '@/hooks/useSupabase';

function ProjectPage({ projectId }) {
  const { data: project, loading, error } = useProjectDetails(projectId);

  if (loading) return <div>Loading project...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{project?.project?.name}</h1>
      <p>Status: {project?.project?.status}</p>
      <p>Videos: {project?.stats?.total_videos}</p>
      <p>Approved: {project?.stats?.approved_videos}</p>
    </div>
  );
}
```

### Real-time Notifications
```jsx
import { useNotifications } from '@/hooks/useSupabase';

function NotificationBell() {
  const { user } = useUser();
  const { data: notifications, loading } = useNotifications(user?.id);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="relative">
      <BellIcon />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
          {unreadCount}
        </span>
      )}
    </div>
  );
}
```

### Review Page (Public Access)
```jsx
import { useProjectsByShareToken } from '@/hooks/useSupabase';

function ReviewPage({ shareToken }) {
  const { data: projects, loading, error } = useProjectsByShareToken(shareToken);

  if (loading) return <div>Loading review...</div>;
  if (error) return <div>Review not found or expired</div>;

  const project = projects?.[0];
  
  return (
    <div>
      <h1>{project?.name}</h1>
      <p>Client: {project?.client_display_name}</p>
      {project?.videos?.map(video => (
        <VideoPlayer key={video.id} video={video} />
      ))}
    </div>
  );
}
```

## 📝 Direct Database Operations

### Creating a Project
```jsx
import { SupabaseDB } from '@/api/entities';

async function createProject(name, clientName, userId) {
  const { data, error } = await SupabaseDB.from('projects').insert({
    name,
    client_display_name: clientName,
    user_id: userId,
    share_token: generateShareToken(),
    share_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }).select().single();

  if (error) throw error;
  return data;
}
```

### Adding a Video
```jsx
async function addVideoToProject(projectId, title, orderIndex = 0) {
  const { data, error } = await SupabaseDB.from('videos').insert({
    project_id: projectId,
    title,
    order_index: orderIndex,
    status: 'pending_review'
  }).select().single();

  if (error) throw error;
  return data;
}
```

### Creating a Video Version
```jsx
async function createVideoVersion(videoId, sourceUrl, fileId) {
  const { data, error } = await SupabaseDB.from('video_versions').insert({
    video_id: videoId,
    version_number: 1,
    source_type: 'drive',
    source_url: sourceUrl,
    file_id: fileId
  }).select().single();

  if (error) throw error;

  // Update video to point to this version
  await SupabaseDB.from('videos')
    .update({ current_version_id: data.id })
    .eq('id', videoId);

  return data;
}
```

### Adding Feedback
```jsx
async function addNote(versionId, reviewerName, noteText, timestamp = null) {
  const { data, error } = await SupabaseDB.from('notes').insert({
    video_version_id: versionId,
    reviewer_name: reviewerName,
    note_text: noteText,
    timestamp_seconds: timestamp,
    status: 'open'
  }).select().single();

  if (error) throw error;
  return data;
}
```

### Approving a Video
```jsx
async function approveVideo(videoId, approverName, approverEmail) {
  // Create approval record
  const { data: approval, error: approvalError } = await SupabaseDB
    .from('approvals')
    .insert({
      scope_type: 'video',
      scope_id: videoId,
      approver_name: approverName,
      approver_email: approverEmail
    }).select().single();

  if (approvalError) throw approvalError;

  // Update video status
  const { error: updateError } = await SupabaseDB
    .from('videos')
    .update({ status: 'approved' })
    .eq('id', videoId);

  if (updateError) throw updateError;

  return approval;
}
```

## 🔄 Real-time Subscriptions

### Listen to Project Changes
```jsx
import { supabase } from '@/lib/supabase';

useEffect(() => {
  const subscription = supabase
    .channel('project_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${userId}` },
      (payload) => {
        console.log('Project changed:', payload);
        // Update your state
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [userId]);
```

### Listen to New Notes
```jsx
useEffect(() => {
  const subscription = supabase
    .channel('new_notes')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notes' },
      (payload) => {
        console.log('New note:', payload.new);
        // Show notification or update UI
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

## 🔍 Advanced Queries

### Get Project Stats
```jsx
async function getProjectStats(userId) {
  const { data, error } = await SupabaseDB
    .from('project_stats')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}
```

### Get Notes for a Project
```jsx
async function getProjectNotes(projectId) {
  const { data, error } = await SupabaseDB
    .from('notes')
    .select(`
      *,
      video_versions!inner (
        videos!inner (
          project_id,
          title
        )
      )
    `)
    .eq('video_versions.videos.project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

### Search Projects
```jsx
async function searchProjects(userId, searchTerm) {
  const { data, error } = await SupabaseDB
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .or(`name.ilike.%${searchTerm}%,client_display_name.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

## 🔒 Row Level Security

Your database is protected with RLS policies:

- **Users can only see their own projects**
- **Public can access shared projects (with valid share tokens)**
- **Notes and approvals follow project visibility**
- **Notifications are user-specific**

## 📊 Helpful SQL Queries

Run these in your Supabase SQL Editor for insights:

```sql
-- Get user project counts
SELECT 
    p.email,
    p.plan_level,
    COUNT(pr.id) as project_count
FROM profiles p
LEFT JOIN projects pr ON p.id = pr.user_id
GROUP BY p.id, p.email, p.plan_level
ORDER BY project_count DESC;

-- Get most active projects (by notes)
SELECT 
    p.name,
    p.client_display_name,
    COUNT(n.id) as note_count
FROM projects p
LEFT JOIN videos v ON p.id = v.project_id
LEFT JOIN video_versions vv ON v.id = vv.video_id
LEFT JOIN notes n ON vv.id = n.video_version_id
GROUP BY p.id, p.name, p.client_display_name
ORDER BY note_count DESC
LIMIT 10;

-- Get approval rates
SELECT 
    p.name,
    COUNT(v.id) as total_videos,
    COUNT(CASE WHEN v.status = 'approved' THEN 1 END) as approved_videos,
    ROUND(
        COUNT(CASE WHEN v.status = 'approved' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(v.id), 0), 2
    ) as approval_rate
FROM projects p
LEFT JOIN videos v ON p.id = v.project_id
GROUP BY p.id, p.name
HAVING COUNT(v.id) > 0
ORDER BY approval_rate DESC;
```

This setup gives you a powerful, scalable database with real-time capabilities, perfect for your video review application! 🎉
