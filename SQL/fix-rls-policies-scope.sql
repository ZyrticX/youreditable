-- Fix RLS policies to use scope_type instead of scope
-- Run this in Supabase SQL Editor

-- Drop existing approvals policies
DROP POLICY IF EXISTS "Users can view approvals in own projects" ON public.approvals;
DROP POLICY IF EXISTS "Public can create approvals in shared projects" ON public.approvals;

-- Create new policies using scope_type
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

-- Public can create approvals in shared projects
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
