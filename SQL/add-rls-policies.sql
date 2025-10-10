-- Add Row Level Security policies for all tables
-- Run this in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Projects policies
DO $$ BEGIN
    CREATE POLICY "Users can view own projects" ON public.projects
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create own projects" ON public.projects
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own projects" ON public.projects
        FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own projects" ON public.projects
        FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Public access for shared projects (Review page)
DO $$ BEGIN
    CREATE POLICY "Public can view shared projects" ON public.projects
        FOR SELECT USING (share_token IS NOT NULL AND share_expires_at > NOW());
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Videos policies
DO $$ BEGIN
    CREATE POLICY "Users can view videos in own projects" ON public.videos
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.projects 
                WHERE projects.id = videos.project_id 
                AND projects.user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create videos in own projects" ON public.videos
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.projects 
                WHERE projects.id = videos.project_id 
                AND projects.user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update videos in own projects" ON public.videos
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.projects 
                WHERE projects.id = videos.project_id 
                AND projects.user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete videos in own projects" ON public.videos
        FOR DELETE USING (
            EXISTS (
                SELECT 1 FROM public.projects 
                WHERE projects.id = videos.project_id 
                AND projects.user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Public access for shared videos
DO $$ BEGIN
    CREATE POLICY "Public can view videos in shared projects" ON public.videos
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.projects 
                WHERE projects.id = videos.project_id 
                AND projects.share_token IS NOT NULL 
                AND projects.share_expires_at > NOW()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Video versions policies
DO $$ BEGIN
    CREATE POLICY "Users can view video versions in own projects" ON public.video_versions
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.videos 
                JOIN public.projects ON projects.id = videos.project_id
                WHERE videos.id = video_versions.video_id 
                AND projects.user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create video versions in own projects" ON public.video_versions
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.videos 
                JOIN public.projects ON projects.id = videos.project_id
                WHERE videos.id = video_versions.video_id 
                AND projects.user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update video versions in own projects" ON public.video_versions
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.videos 
                JOIN public.projects ON projects.id = videos.project_id
                WHERE videos.id = video_versions.video_id 
                AND projects.user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Public access for shared video versions
DO $$ BEGIN
    CREATE POLICY "Public can view video versions in shared projects" ON public.video_versions
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.videos 
                JOIN public.projects ON projects.id = videos.project_id
                WHERE videos.id = video_versions.video_id 
                AND projects.share_token IS NOT NULL 
                AND projects.share_expires_at > NOW()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Notes policies
DO $$ BEGIN
    CREATE POLICY "Users can view notes in own projects" ON public.notes
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.video_versions 
                JOIN public.videos ON videos.id = video_versions.video_id
                JOIN public.projects ON projects.id = videos.project_id
                WHERE video_versions.id = notes.video_version_id 
                AND projects.user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update notes in own projects" ON public.notes
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.video_versions 
                JOIN public.videos ON videos.id = video_versions.video_id
                JOIN public.projects ON projects.id = videos.project_id
                WHERE video_versions.id = notes.video_version_id 
                AND projects.user_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Public can create notes in shared projects
DO $$ BEGIN
    CREATE POLICY "Public can create notes in shared projects" ON public.notes
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.video_versions 
                JOIN public.videos ON videos.id = video_versions.video_id
                JOIN public.projects ON projects.id = videos.project_id
                WHERE video_versions.id = notes.video_version_id 
                AND projects.share_token IS NOT NULL 
                AND projects.share_expires_at > NOW()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Approvals policies
DO $$ BEGIN
    CREATE POLICY "Users can view approvals in own projects" ON public.approvals
        FOR SELECT USING (
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
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Public can create approvals in shared projects
DO $$ BEGIN
    CREATE POLICY "Public can create approvals in shared projects" ON public.approvals
        FOR INSERT WITH CHECK (
            (COALESCE(scope, scope_type) = 'project' AND EXISTS (
                SELECT 1 FROM public.projects 
                WHERE projects.id = approvals.scope_id 
                AND projects.share_token IS NOT NULL 
                AND projects.share_expires_at > NOW()
            )) OR
            (COALESCE(scope, scope_type) = 'video' AND EXISTS (
                SELECT 1 FROM public.videos 
                JOIN public.projects ON projects.id = videos.project_id
                WHERE videos.id = approvals.scope_id 
                AND projects.share_token IS NOT NULL 
                AND projects.share_expires_at > NOW()
            ))
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Notifications policies
DO $$ BEGIN
    CREATE POLICY "Users can view own notifications" ON public.notifications
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create own notifications" ON public.notifications
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own notifications" ON public.notifications
        FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Transactions policies
DO $$ BEGIN
    CREATE POLICY "Users can view own transactions" ON public.transactions
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create own transactions" ON public.transactions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Subscriptions policies
DO $$ BEGIN
    CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create own subscriptions" ON public.subscriptions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
        FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;


