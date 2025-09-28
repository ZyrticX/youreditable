# 🗄️ Supabase Database Setup Guide

Your app is trying to access database tables that don't exist yet in your Supabase project. Follow these steps to create the required tables.

## 🔧 Quick Setup

### Step 1: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `gewffjhkvxppwxhqmtqx`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Database Schema
Copy and paste the contents of `SQL/supabase-schema.sql` into the SQL editor and click **"RUN"**.

This will create all the necessary tables:
- `profiles` (user data)
- `projects` (video projects)
- `videos` (video files)
- `video_versions` (video versions)
- `notes` (review notes)
- `approvals` (approval status)
- `notifications` (user notifications)

### Step 3: Enable Row Level Security (RLS)
The schema includes RLS policies to secure your data. Users can only access their own data.

### Step 4: Test the Connection
After running the SQL script, refresh your app and the database errors should be resolved.

## 🚨 Current Errors Fixed

The following database query errors will be resolved:
- ✅ `column notifications.created_date does not exist` → Fixed to use `created_at`
- ✅ `400 Bad Request` on `/profiles` → Table will be created
- ✅ `400 Bad Request` on `/projects` → Table will be created  
- ✅ `400 Bad Request` on `/notifications` → Table will be created

## 📋 Tables Created

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User data extending auth.users | `id`, `email`, `full_name`, `plan_level` |
| `projects` | Video review projects | `id`, `user_id`, `name`, `status` |
| `videos` | Video files in projects | `id`, `project_id`, `title`, `status` |
| `video_versions` | Different versions of videos | `id`, `video_id`, `version_number` |
| `notes` | Review notes on videos | `id`, `video_version_id`, `body`, `timestamp` |
| `approvals` | Approval status | `id`, `scope`, `scope_id`, `status` |
| `notifications` | User notifications | `id`, `user_id`, `title`, `body`, `type` |

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User-based access control** - users can only see their own data
- **Automatic timestamps** with `created_at` and `updated_at`
- **Foreign key constraints** to maintain data integrity

## ⚡ Real-time Features

The schema includes real-time subscriptions for:
- Project updates
- New notifications
- Note additions
- Approval status changes

After setup, your app will have full database functionality with Supabase! 🎉
