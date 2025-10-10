-- Final fix for notes and approvals issues
-- Run this in Supabase SQL Editor

-- 1. Fix notes table - make note_text nullable and add body column
DO $$ 
BEGIN
    -- Make note_text nullable (in case it's required)
    ALTER TABLE public.notes ALTER COLUMN note_text DROP NOT NULL;
EXCEPTION WHEN others THEN null;
END $$;

-- Add body column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='body') THEN
        ALTER TABLE public.notes ADD COLUMN body TEXT;
    END IF;
END $$;

-- Copy note_text to body if body is empty
UPDATE public.notes 
SET body = note_text 
WHERE body IS NULL AND note_text IS NOT NULL;

-- Copy body to note_text if note_text is empty  
UPDATE public.notes 
SET note_text = body 
WHERE note_text IS NULL AND body IS NOT NULL;

-- 2. Fix approvals table - make sure all required fields exist
DO $$ 
BEGIN
    -- Make sure scope_id exists and is not null constrained for inserts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approvals' AND column_name='scope_id') THEN
        ALTER TABLE public.approvals ADD COLUMN scope_id UUID;
    END IF;
    
    -- Make sure scope_type exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approvals' AND column_name='scope_type') THEN
        ALTER TABLE public.approvals ADD COLUMN scope_type TEXT;
    END IF;
END $$;

-- 3. Drop and recreate approvals policies to be more permissive
DROP POLICY IF EXISTS "Users can view approvals in own projects" ON public.approvals;
DROP POLICY IF EXISTS "Public can create approvals in shared projects" ON public.approvals;
DROP POLICY IF EXISTS "Users can create approvals in own projects" ON public.approvals;

-- More permissive policies for approvals
DO $$ BEGIN
    CREATE POLICY "Users can view approvals in own projects" ON public.approvals
        FOR SELECT USING (
            (scope_type = 'project' AND EXISTS (
                SELECT 1 FROM public.projects 
                WHERE projects.id = approvals.scope_id 
                AND projects.user_id = auth.uid()
            )) OR
            (scope_type = 'video' AND EXISTS (
                SELECT 1 FROM public.videos 
                JOIN public.projects ON projects.id = videos.project_id
                WHERE videos.id = approvals.scope_id 
                AND projects.user_id = auth.uid()
            ))
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create approvals in own projects" ON public.approvals
        FOR INSERT WITH CHECK (
            (scope_type = 'project' AND EXISTS (
                SELECT 1 FROM public.projects 
                WHERE projects.id = approvals.scope_id 
                AND projects.user_id = auth.uid()
            )) OR
            (scope_type = 'video' AND EXISTS (
                SELECT 1 FROM public.videos 
                JOIN public.projects ON projects.id = videos.project_id
                WHERE videos.id = approvals.scope_id 
                AND projects.user_id = auth.uid()
            ))
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public can create approvals in shared projects" ON public.approvals
        FOR INSERT WITH CHECK (
            (scope_type = 'project' AND EXISTS (
                SELECT 1 FROM public.projects 
                WHERE projects.id = approvals.scope_id 
                AND projects.share_token IS NOT NULL 
                AND projects.share_expires_at > NOW()
            )) OR
            (scope_type = 'video' AND EXISTS (
                SELECT 1 FROM public.videos 
                JOIN public.projects ON projects.id = videos.project_id
                WHERE videos.id = approvals.scope_id 
                AND projects.share_token IS NOT NULL 
                AND projects.share_expires_at > NOW()
            ))
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 4. Fix notes policies to be more permissive
DROP POLICY IF EXISTS "Public can create notes in shared projects" ON public.notes;

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

-- 5. Verify table structures
SELECT 
    'notes table columns:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notes' 
    AND table_schema = 'public'
    AND column_name IN ('note_text', 'body', 'video_version_id', 'timecode_ms', 'submit_batch_id', 'reviewer_label', 'status', 'reviewer_ip')
ORDER BY column_name;

SELECT 
    'approvals table columns:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'approvals' 
    AND table_schema = 'public'
    AND column_name IN ('scope_type', 'scope_id', 'version_id', 'approved_at', 'reviewer_label')
ORDER BY column_name;
