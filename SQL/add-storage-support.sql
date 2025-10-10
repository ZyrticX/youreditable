-- Add storage support to video_versions table
-- This script adds columns to support Supabase Storage paths

-- Add storage_path column to video_versions table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'video_versions' 
        AND column_name = 'storage_path'
    ) THEN
        ALTER TABLE public.video_versions 
        ADD COLUMN storage_path TEXT;
        
        COMMENT ON COLUMN public.video_versions.storage_path IS 'Path to video file in Supabase Storage';
    END IF;
END $$;

-- Add notes column to videos table for storing processing status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'videos' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.videos 
        ADD COLUMN notes TEXT;
        
        COMMENT ON COLUMN public.videos.notes IS 'Processing notes or status messages';
    END IF;
END $$;

-- Add processing status to video status enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'processing' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'video_status')
    ) THEN
        ALTER TYPE video_status ADD VALUE 'processing';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create storage bucket for videos if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for videos bucket
DO $$ 
BEGIN
    -- Allow authenticated users to upload videos to their own folders
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload videos to own folder'
    ) THEN
        CREATE POLICY "Users can upload videos to own folder" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'videos' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;

    -- Allow authenticated users to view videos in their own folders
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can view videos in own folder'
    ) THEN
        CREATE POLICY "Users can view videos in own folder" ON storage.objects
        FOR SELECT USING (
            bucket_id = 'videos' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;

    -- Allow public access to videos (for sharing)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public access to videos'
    ) THEN
        CREATE POLICY "Public access to videos" ON storage.objects
        FOR SELECT USING (bucket_id = 'videos');
    END IF;

    -- Allow users to delete their own videos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete own videos'
    ) THEN
        CREATE POLICY "Users can delete own videos" ON storage.objects
        FOR DELETE USING (
            bucket_id = 'videos' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add helpful function to get video storage URL
CREATE OR REPLACE FUNCTION get_video_storage_url(storage_path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CONCAT(
        current_setting('app.settings.supabase_url', true),
        '/storage/v1/object/public/videos/',
        storage_path
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_video_storage_url(TEXT) IS 'Generate public URL for video in Supabase Storage';
