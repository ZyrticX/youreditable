-- Supabase Database Schema for Video Review App (Safe Version)
-- This version checks for existing objects before creating them
-- Run these commands in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (safe version)
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('active', 'pending_review', 'approved', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE video_status AS ENUM ('pending_review', 'approved', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE note_status AS ENUM ('open', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_level AS ENUM ('free', 'basic', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    display_name TEXT,
    plan_level plan_level DEFAULT 'free',
    paddle_customer_id TEXT,
    subscription_status TEXT DEFAULT 'free',
    subscription_id TEXT,
    profile_picture_url TEXT,
    display_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    client_display_name TEXT,
    status project_status DEFAULT 'active',
    share_token TEXT UNIQUE,
    share_expires_at TIMESTAMP WITH TIME ZONE,
    approved_videos_count INTEGER DEFAULT 0,
    total_videos_count INTEGER DEFAULT 0,
    last_status_change_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    status video_status DEFAULT 'pending_review',
    order_index INTEGER DEFAULT 0,
    current_version_id UUID, -- Will reference video_versions.id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video versions table
CREATE TABLE IF NOT EXISTS public.video_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER DEFAULT 1,
    source_type TEXT DEFAULT 'drive', -- 'drive', 'upload', 'url'
    source_url TEXT,
    file_id TEXT, -- Google Drive file ID or other external ID
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for current_version_id (safe)
DO $$ BEGIN
    ALTER TABLE public.videos 
    ADD CONSTRAINT fk_videos_current_version 
    FOREIGN KEY (current_version_id) REFERENCES public.video_versions(id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notes/Comments table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    video_version_id UUID REFERENCES public.video_versions(id) ON DELETE CASCADE NOT NULL,
    reviewer_name TEXT,
    reviewer_email TEXT,
    body TEXT NOT NULL, -- Changed from note_text to body for consistency
    timestamp_seconds DECIMAL, -- Timestamp in video where note was made
    video_title TEXT, -- Denormalized for easier querying
    status note_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approvals table
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scope TEXT NOT NULL, -- 'video', 'project' (changed from scope_type for consistency)
    scope_id UUID NOT NULL, -- video_id or project_id
    version_id UUID REFERENCES public.video_versions(id),
    approver_name TEXT,
    approver_email TEXT,
    status TEXT DEFAULT 'approved', -- approval status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add scope column if table exists with scope_type (migration)
DO $$ BEGIN
    -- Check if scope_type column exists and scope doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'approvals' AND column_name = 'scope_type' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'approvals' AND column_name = 'scope' AND table_schema = 'public') THEN
        -- Add scope column and copy data from scope_type
        ALTER TABLE public.approvals ADD COLUMN scope TEXT;
        UPDATE public.approvals SET scope = scope_type;
        ALTER TABLE public.approvals ALTER COLUMN scope SET NOT NULL;
    END IF;
END $$;

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'video_approved', 'note_added', 'project_completed', 'project_reminder', etc.
    title TEXT NOT NULL,
    body TEXT,
    link TEXT, -- Optional link for the notification action
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (safe version)
-- Profiles policies
DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Projects policies
DO $$ BEGIN
    CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Videos policies
DO $$ BEGIN
    CREATE POLICY "Users can view videos in own projects" ON public.videos FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = videos.project_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert videos in own projects" ON public.videos FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = videos.project_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update videos in own projects" ON public.videos FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = videos.project_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete videos in own projects" ON public.videos FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = videos.project_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Video versions policies
DO $$ BEGIN
    CREATE POLICY "Users can view video versions in own projects" ON public.video_versions FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.videos 
            JOIN public.projects ON projects.id = videos.project_id
            WHERE videos.id = video_versions.video_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert video versions in own projects" ON public.video_versions FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.videos 
            JOIN public.projects ON projects.id = videos.project_id
            WHERE videos.id = video_versions.video_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update video versions in own projects" ON public.video_versions FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.videos 
            JOIN public.projects ON projects.id = videos.project_id
            WHERE videos.id = video_versions.video_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete video versions in own projects" ON public.video_versions FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.videos 
            JOIN public.projects ON projects.id = videos.project_id
            WHERE videos.id = video_versions.video_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notes policies
DO $$ BEGIN
    CREATE POLICY "Users can view notes in own projects" ON public.notes FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.video_versions 
            JOIN public.videos ON videos.id = video_versions.video_id
            JOIN public.projects ON projects.id = videos.project_id
            WHERE video_versions.id = notes.video_version_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert notes in own projects" ON public.notes FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.video_versions 
            JOIN public.videos ON videos.id = video_versions.video_id
            JOIN public.projects ON projects.id = videos.project_id
            WHERE video_versions.id = notes.video_version_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update notes in own projects" ON public.notes FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.video_versions 
            JOIN public.videos ON videos.id = video_versions.video_id
            JOIN public.projects ON projects.id = videos.project_id
            WHERE video_versions.id = notes.video_version_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete notes in own projects" ON public.notes FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.video_versions 
            JOIN public.videos ON videos.id = video_versions.video_id
            JOIN public.projects ON projects.id = videos.project_id
            WHERE video_versions.id = notes.video_version_id 
            AND projects.user_id = auth.uid()
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Approvals policies
DO $$ BEGIN
    CREATE POLICY "Users can view approvals in own projects" ON public.approvals FOR SELECT USING (
        (COALESCE(scope, scope_type) = 'project' AND EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = approvals.scope_id 
            AND projects.user_id = auth.uid()
        )) OR
        (COALESCE(scope, scope_type) = 'video' AND EXISTS (
            SELECT 1 FROM public.videos 
            JOIN public.projects ON projects.id = videos.project_id
            WHERE videos.id = approvals.scope_id 
            AND projects.user_id = auth.uid()
        ))
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert approvals in own projects" ON public.approvals FOR INSERT WITH CHECK (
        (COALESCE(scope, scope_type) = 'project' AND EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = approvals.scope_id 
            AND projects.user_id = auth.uid()
        )) OR
        (COALESCE(scope, scope_type) = 'video' AND EXISTS (
            SELECT 1 FROM public.videos 
            JOIN public.projects ON projects.id = videos.project_id
            WHERE videos.id = approvals.scope_id 
            AND projects.user_id = auth.uid()
        ))
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notifications policies
DO $$ BEGIN
    CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_project_id ON public.videos(project_id);
CREATE INDEX IF NOT EXISTS idx_video_versions_video_id ON public.video_versions(video_id);
CREATE INDEX IF NOT EXISTS idx_notes_video_version_id ON public.notes(video_version_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at);
CREATE INDEX IF NOT EXISTS idx_approvals_scope ON public.approvals(scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers (safe)
DO $$ BEGIN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_video_versions_updated_at BEFORE UPDATE ON public.video_versions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
