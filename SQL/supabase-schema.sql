-- Supabase Database Schema for Video Review App
-- Run these commands in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE project_status AS ENUM ('active', 'pending_review', 'approved', 'archived');
CREATE TYPE video_status AS ENUM ('pending_review', 'approved', 'archived');
CREATE TYPE note_status AS ENUM ('open', 'completed');
CREATE TYPE plan_level AS ENUM ('free', 'basic', 'pro');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    display_name TEXT,
    plan_level plan_level DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
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
CREATE TABLE public.videos (
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
CREATE TABLE public.video_versions (
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

-- Add foreign key constraint for current_version_id
ALTER TABLE public.videos 
ADD CONSTRAINT fk_videos_current_version 
FOREIGN KEY (current_version_id) REFERENCES public.video_versions(id);

-- Notes/Comments table
CREATE TABLE public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    video_version_id UUID REFERENCES public.video_versions(id) ON DELETE CASCADE NOT NULL,
    reviewer_name TEXT,
    reviewer_email TEXT,
    note_text TEXT NOT NULL,
    timestamp_seconds DECIMAL, -- Timestamp in video where note was made
    video_title TEXT, -- Denormalized for easier querying
    status note_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approvals table
CREATE TABLE public.approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scope_type TEXT NOT NULL, -- 'video', 'project'
    scope_id UUID NOT NULL, -- video_id or project_id
    version_id UUID REFERENCES public.video_versions(id),
    approver_name TEXT,
    approver_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'video_approved', 'note_added', 'project_completed', etc.
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB, -- Additional data like project_id, video_id, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (for billing)
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT NOT NULL, -- 'subscription', 'one-time', 'refund'
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    external_id TEXT, -- Paddle transaction ID
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_share_token ON public.projects(share_token);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_videos_project_id ON public.videos(project_id);
CREATE INDEX idx_videos_status ON public.videos(status);
CREATE INDEX idx_video_versions_video_id ON public.video_versions(video_id);
CREATE INDEX idx_notes_video_version_id ON public.notes(video_version_id);
CREATE INDEX idx_notes_status ON public.notes(status);
CREATE INDEX idx_approvals_scope ON public.approvals(scope_type, scope_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Public access for shared projects (review links)
CREATE POLICY "Public can view shared projects" ON public.projects
    FOR SELECT USING (share_token IS NOT NULL AND share_expires_at > NOW());

-- Videos policies
CREATE POLICY "Users can manage videos in own projects" ON public.videos
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Public access for videos in shared projects
CREATE POLICY "Public can view videos in shared projects" ON public.videos
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE share_token IS NOT NULL AND share_expires_at > NOW()
        )
    );

-- Video versions policies
CREATE POLICY "Users can manage video versions in own projects" ON public.video_versions
    FOR ALL USING (
        video_id IN (
            SELECT v.id FROM public.videos v
            JOIN public.projects p ON v.project_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Public access for video versions in shared projects
CREATE POLICY "Public can view video versions in shared projects" ON public.video_versions
    FOR SELECT USING (
        video_id IN (
            SELECT v.id FROM public.videos v
            JOIN public.projects p ON v.project_id = p.id
            WHERE p.share_token IS NOT NULL AND p.share_expires_at > NOW()
        )
    );

-- Notes policies
CREATE POLICY "Users can manage notes in own projects" ON public.notes
    FOR ALL USING (
        video_version_id IN (
            SELECT vv.id FROM public.video_versions vv
            JOIN public.videos v ON vv.video_id = v.id
            JOIN public.projects p ON v.project_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Public can add notes to shared projects
CREATE POLICY "Public can add notes to shared projects" ON public.notes
    FOR INSERT WITH CHECK (
        video_version_id IN (
            SELECT vv.id FROM public.video_versions vv
            JOIN public.videos v ON vv.video_id = v.id
            JOIN public.projects p ON v.project_id = p.id
            WHERE p.share_token IS NOT NULL AND p.share_expires_at > NOW()
        )
    );

-- Public can view notes in shared projects
CREATE POLICY "Public can view notes in shared projects" ON public.notes
    FOR SELECT USING (
        video_version_id IN (
            SELECT vv.id FROM public.video_versions vv
            JOIN public.videos v ON vv.video_id = v.id
            JOIN public.projects p ON v.project_id = p.id
            WHERE p.share_token IS NOT NULL AND p.share_expires_at > NOW()
        )
    );

-- Approvals policies
CREATE POLICY "Users can manage approvals in own projects" ON public.approvals
    FOR ALL USING (
        (scope_type = 'project' AND scope_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()))
        OR
        (scope_type = 'video' AND scope_id IN (
            SELECT v.id FROM public.videos v
            JOIN public.projects p ON v.project_id = p.id
            WHERE p.user_id = auth.uid()
        ))
    );

-- Public can add approvals to shared projects
CREATE POLICY "Public can add approvals to shared projects" ON public.approvals
    FOR INSERT WITH CHECK (
        (scope_type = 'project' AND scope_id IN (
            SELECT id FROM public.projects 
            WHERE share_token IS NOT NULL AND share_expires_at > NOW()
        ))
        OR
        (scope_type = 'video' AND scope_id IN (
            SELECT v.id FROM public.videos v
            JOIN public.projects p ON v.project_id = p.id
            WHERE p.share_token IS NOT NULL AND p.share_expires_at > NOW()
        ))
    );

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_versions_updated_at BEFORE UPDATE ON public.video_versions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
