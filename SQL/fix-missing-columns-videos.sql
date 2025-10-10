-- Fix missing columns in videos table
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to videos table
DO $$ 
BEGIN
    -- Add last_status_change_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='last_status_change_at') THEN
        ALTER TABLE public.videos ADD COLUMN last_status_change_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add other potentially missing x
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='archived_at') THEN
        ALTER TABLE public.videos ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Make sure we have all the status-related columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='approved_at') THEN
        ALTER TABLE public.videos ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='approved_by') THEN
        ALTER TABLE public.videos ADD COLUMN approved_by TEXT;
    END IF;
END $$;

-- 2. Update existing videos to have last_status_change_at
UPDATE public.videos 
SET last_status_change_at = updated_at 
WHERE last_status_change_at IS NULL;

-- 3. Create trigger to auto-update last_status_change_at when status changes
CREATE OR REPLACE FUNCTION update_video_status_change_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.last_status_change_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS video_status_change_trigger ON public.videos;

-- Create the trigger
CREATE TRIGGER video_status_change_trigger
    BEFORE UPDATE ON public.videos
    FOR EACH ROW
    EXECUTE FUNCTION update_video_status_change_time();

-- 4. Check the current structure
SELECT 
    'Videos table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'videos' 
    AND table_schema = 'public'
    AND column_name IN ('status', 'last_status_change_at', 'approved_at', 'approved_by', 'archived_at', 'updated_at')
ORDER BY column_name;
