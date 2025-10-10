-- Fix RLS policies and notifications issues
-- Run this in Supabase SQL Editor

-- 1. Make approvals policies more permissive for anonymous users
DROP POLICY IF EXISTS "Public can create approvals in shared projects" ON public.approvals;
DROP POLICY IF EXISTS "Anonymous can create approvals in shared projects" ON public.approvals;

-- Create a more permissive policy for approvals
DO $$ BEGIN
    CREATE POLICY "Anyone can create approvals in shared projects" ON public.approvals
        FOR INSERT WITH CHECK (
            -- Allow if it's a shared project (has valid share token and not expired)
            EXISTS (
                SELECT 1 FROM public.projects p
                WHERE (
                    (scope_type = 'project' AND p.id = approvals.scope_id) OR
                    (scope_type = 'video' AND EXISTS (
                        SELECT 1 FROM public.videos v 
                        WHERE v.id = approvals.scope_id AND v.project_id = p.id
                    ))
                )
                AND p.share_token IS NOT NULL 
                AND p.share_expires_at > NOW()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Make notes policies more permissive for anonymous users  
DROP POLICY IF EXISTS "Public can create notes in shared projects" ON public.notes;
DROP POLICY IF EXISTS "Anonymous can create notes in shared projects" ON public.notes;

DO $$ BEGIN
    CREATE POLICY "Anyone can create notes in shared projects" ON public.notes
        FOR INSERT WITH CHECK (
            -- Allow if it's a shared project
            EXISTS (
                SELECT 1 FROM public.video_versions vv
                JOIN public.videos v ON v.id = vv.video_id
                JOIN public.projects p ON p.id = v.project_id
                WHERE vv.id = notes.video_version_id 
                AND p.share_token IS NOT NULL 
                AND p.share_expires_at > NOW()
            )
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. Fix notifications table - make sure it has all required columns
DO $$ 
BEGIN
    -- Add missing columns to notifications if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='type') THEN
        ALTER TABLE public.notifications ADD COLUMN type TEXT NOT NULL DEFAULT 'general';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='title') THEN
        ALTER TABLE public.notifications ADD COLUMN title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='message') THEN
        ALTER TABLE public.notifications ADD COLUMN message TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='read') THEN
        ALTER TABLE public.notifications ADD COLUMN read BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='data') THEN
        ALTER TABLE public.notifications ADD COLUMN data JSONB;
    END IF;
END $$;

-- 4. Make notifications policies more permissive
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;

DO $$ BEGIN
    CREATE POLICY "Anyone can create notifications for users" ON public.notifications
        FOR INSERT WITH CHECK (
            -- Allow creating notifications for any user
            user_id IS NOT NULL
        );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 5. Test the policies by checking what we can access
SELECT 
    'Current approvals policies:' as info,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'approvals'
ORDER BY policyname;

SELECT 
    'Current notes policies:' as info,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'notes'
ORDER BY policyname;

SELECT 
    'Current notifications policies:' as info,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'notifications'
ORDER BY policyname;

-- 6. Check notifications table structure
SELECT 
    'Notifications table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
