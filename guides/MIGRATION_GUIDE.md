# Migration Guide: Base44 to Supabase

This guide will help you migrate your existing data from Base44 to Supabase.

## 📋 Prerequisites

1. **Supabase Project** - Create a new project at [supabase.com](https://supabase.com)
2. **Service Role Key** - Get your service role key from Supabase dashboard
3. **Base44 Data Access** - Ensure you can export/access your Base44 data
4. **Backup** - Create a backup of your Base44 data before starting

## 🗄️ Step 1: Set Up Supabase Database

1. **Go to your Supabase project dashboard**
2. **Open the SQL Editor**
3. **Run the schema creation script:**
   - Copy the contents of `supabase-schema.sql`
   - Paste into SQL Editor
   - Click "Run"

This will create:
- ✅ All necessary tables (`profiles`, `projects`, `videos`, etc.)
- ✅ Row Level Security policies
- ✅ Indexes for performance
- ✅ Automatic triggers
- ✅ Custom types and functions

## 🔑 Step 2: Set Up Environment Variables

Create a `.env.migration` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Base44 Configuration (adapt to your setup)
BASE44_API_URL=your_base44_api_url
BASE44_API_KEY=your_base44_api_key
```

## 🚀 Step 3: Prepare Migration Script

1. **Install dependencies:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Customize the migration script:**
   - Edit `migrate-to-supabase.js`
   - Update the `Base44Client` class to match your Base44 API
   - Adjust field mappings as needed

## 📊 Step 4: Run Data Migration

### Option A: Full Automatic Migration

```bash
node migrate-to-supabase.js
```

### Option B: Step-by-Step Migration

```javascript
import { 
  migrateUsers, 
  migrateProjects, 
  migrateVideos, 
  migrateVideoVersions, 
  migrateNotes, 
  migrateApprovals 
} from './migrate-to-supabase.js';

// Run each step individually
const userMapping = await migrateUsers();
const projectMapping = await migrateProjects(userMapping);
const videoMapping = await migrateVideos(projectMapping);
const versionMapping = await migrateVideoVersions(videoMapping);
await migrateNotes(versionMapping);
await migrateApprovals(videoMapping, versionMapping);
```

### Option C: Manual Data Export/Import

If you prefer manual migration:

1. **Export data from Base44:**
   ```bash
   # Export each entity to JSON
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        "https://your-base44-api.com/users" > users.json
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        "https://your-base44-api.com/projects" > projects.json
   # ... etc
   ```

2. **Import data to Supabase:**
   Use the Supabase dashboard or SQL commands to import the JSON data.

## 🔒 Step 5: Handle User Authentication

Since users will have new IDs in Supabase Auth, you have several options:

### Option A: Password Reset Flow
1. Send password reset emails to all users
2. Users click the link and set new passwords
3. Most secure but requires user action

### Option B: Temporary Passwords
1. Set temporary passwords during migration
2. Force password change on first login
3. Notify users via email

### Option C: Magic Links
1. Send magic link login emails
2. Users click to sign in automatically
3. Prompt to set permanent password

## 🧪 Step 6: Testing Migration

1. **Verify data integrity:**
   ```sql
   -- Check user counts
   SELECT COUNT(*) FROM profiles;
   
   -- Check project ownership
   SELECT user_id, COUNT(*) FROM projects GROUP BY user_id;
   
   -- Check video-project relationships
   SELECT p.name, COUNT(v.id) as video_count 
   FROM projects p 
   LEFT JOIN videos v ON p.id = v.project_id 
   GROUP BY p.id, p.name;
   
   -- Check notes
   SELECT COUNT(*) FROM notes;
   ```

2. **Test application functionality:**
   - Sign in with migrated users
   - View projects and videos
   - Test review links
   - Verify notes and approvals

## 🔄 Step 7: Enable Real-time Features

After successful migration, enable real-time subscriptions:

```sql
-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE videos;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## 📱 Step 8: Update Application Code

Your application code is already updated to use Supabase! The key changes:

1. **Authentication** - Now uses `SupabaseAuth` instead of Base44
2. **Database queries** - Use `SupabaseDB.from('table')` instead of Base44 entities
3. **Real-time subscriptions** - Available through `useSupabaseRealtime` hook

### Example Updates:

**Before (Base44):**
```javascript
const projects = await Project.filter({ user_id: user.id });
```

**After (Supabase):**
```javascript
const { data: projects } = await SupabaseDB.from('projects')
  .select('*')
  .eq('user_id', user.id);
```

## 🚨 Troubleshooting

### Common Issues:

1. **RLS Policies Too Restrictive**
   ```sql
   -- Temporarily disable RLS for debugging
   ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
   -- Re-enable after fixing
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ```

2. **Foreign Key Violations**
   - Check that referenced records exist
   - Verify ID mappings are correct

3. **Authentication Issues**
   - Ensure service role key is correct
   - Check user creation in auth.users table

4. **Performance Issues**
   - Add indexes for frequently queried columns
   - Use `select()` to limit returned columns

### Data Validation Queries:

```sql
-- Check for orphaned records
SELECT v.* FROM videos v 
LEFT JOIN projects p ON v.project_id = p.id 
WHERE p.id IS NULL;

-- Check for missing current versions
SELECT v.* FROM videos v 
LEFT JOIN video_versions vv ON v.current_version_id = vv.id 
WHERE v.current_version_id IS NOT NULL AND vv.id IS NULL;

-- Check note counts per project
SELECT p.name, COUNT(n.id) as note_count
FROM projects p
LEFT JOIN videos v ON p.id = v.project_id
LEFT JOIN video_versions vv ON v.id = vv.video_id
LEFT JOIN notes n ON vv.id = n.video_version_id
GROUP BY p.id, p.name
ORDER BY note_count DESC;
```

## 🎯 Post-Migration Checklist

- [ ] All users migrated successfully
- [ ] All projects visible to correct users
- [ ] Videos display properly
- [ ] Review links work for external users
- [ ] Notes and approvals preserved
- [ ] Authentication flow works
- [ ] Real-time updates enabled
- [ ] Performance is acceptable
- [ ] Backup of original data secured
- [ ] Users notified of any required actions

## 📞 Support

If you encounter issues during migration:

1. Check the console logs for detailed error messages
2. Verify your Supabase policies allow the operations
3. Test with a small subset of data first
4. Use the Supabase dashboard to inspect data directly

## 🔄 Rollback Plan

If migration fails:

1. **Keep Base44 running** until migration is confirmed successful
2. **Document any issues** encountered
3. **Fix issues and re-run** migration script
4. **Test thoroughly** before switching over

Remember: Always test the migration process with a subset of data first!
