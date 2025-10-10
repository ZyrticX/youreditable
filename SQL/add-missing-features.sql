-- Add missing columns and tables for full functionality
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to projects table
DO $$ 
BEGIN
    -- Add archive functionality
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='archived_at') THEN
        ALTER TABLE public.projects ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add notes field for project-level notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='notes') THEN
        ALTER TABLE public.projects ADD COLUMN notes TEXT;
    END IF;
    
    -- Add project approval fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='approved_at') THEN
        ALTER TABLE public.projects ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='approved_by') THEN
        ALTER TABLE public.projects ADD COLUMN approved_by TEXT;
    END IF;
END $$;

-- 2. Add missing columns to videos table  
DO $$ 
BEGIN
    -- Add notes field for video-level notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='notes') THEN
        ALTER TABLE public.videos ADD COLUMN notes TEXT;
    END IF;
    
    -- Add file_id for Google Drive integration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='file_id') THEN
        ALTER TABLE public.videos ADD COLUMN file_id TEXT;
    END IF;
    
    -- Add processing status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='processing_status') THEN
        ALTER TABLE public.videos ADD COLUMN processing_status TEXT DEFAULT 'ready';
    END IF;
END $$;

-- 3. Add missing columns to video_versions table
DO $$ 
BEGIN
    -- Add file size and mime type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='video_versions' AND column_name='file_size') THEN
        ALTER TABLE public.video_versions ADD COLUMN file_size BIGINT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='video_versions' AND column_name='mime_type') THEN
        ALTER TABLE public.video_versions ADD COLUMN mime_type TEXT;
    END IF;
    
    -- Add storage path for Supabase Storage
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='video_versions' AND column_name='storage_path') THEN
        ALTER TABLE public.video_versions ADD COLUMN storage_path TEXT;
    END IF;
    
    -- Add status field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='video_versions' AND column_name='status') THEN
        ALTER TABLE public.video_versions ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    -- Add file_url field (for compatibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='video_versions' AND column_name='file_url') THEN
        ALTER TABLE public.video_versions ADD COLUMN file_url TEXT;
    END IF;
END $$;

-- 4. Fix notes table structure
DO $$ 
BEGIN
    -- Add missing fields to notes table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='body') THEN
        ALTER TABLE public.notes ADD COLUMN body TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='timecode_ms') THEN
        ALTER TABLE public.notes ADD COLUMN timecode_ms BIGINT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='submit_batch_id') THEN
        ALTER TABLE public.notes ADD COLUMN submit_batch_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='reviewer_label') THEN
        ALTER TABLE public.notes ADD COLUMN reviewer_label TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='reviewer_ip') THEN
        ALTER TABLE public.notes ADD COLUMN reviewer_ip TEXT;
    END IF;
    
    -- Add status field with proper enum
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='status') THEN
        ALTER TABLE public.notes ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- 5. Fix approvals table structure
DO $$ 
BEGIN
    -- Add scope field (instead of scope_type)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approvals' AND column_name='scope') THEN
        ALTER TABLE public.approvals ADD COLUMN scope TEXT;
    END IF;
    
    -- Add scope_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approvals' AND column_name='scope_id') THEN
        ALTER TABLE public.approvals ADD COLUMN scope_id UUID;
    END IF;
    
    -- Add approved_at field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approvals' AND column_name='approved_at') THEN
        ALTER TABLE public.approvals ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add reviewer_label field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approvals' AND column_name='reviewer_label') THEN
        ALTER TABLE public.approvals ADD COLUMN reviewer_label TEXT;
    END IF;
END $$;

-- 6. Update video_status enum to include more statuses
DO $$ 
BEGIN
    -- Add new statuses to video_status enum
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'needs_changes' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'video_status')) THEN
        ALTER TYPE video_status ADD VALUE 'needs_changes';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'processing' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'video_status')) THEN
        ALTER TYPE video_status ADD VALUE 'processing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'active' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'video_status')) THEN
        ALTER TYPE video_status ADD VALUE 'active';
    END IF;
END $$;

-- 7. Update project_status enum
DO $$ 
BEGIN
    -- Add pending status
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'project_status')) THEN
        ALTER TYPE project_status ADD VALUE 'pending';
    END IF;
END $$;

-- 8. Create transactions table for Paddle integration
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    paddle_transaction_id TEXT UNIQUE,
    paddle_subscription_id TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    status TEXT,
    plan_level plan_level,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Add Paddle fields to profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='paddle_customer_id') THEN
        ALTER TABLE public.profiles ADD COLUMN paddle_customer_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='subscription_id') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='subscription_status') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT DEFAULT 'free';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='display_user_id') THEN
        ALTER TABLE public.profiles ADD COLUMN display_user_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='profile_picture_url') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_picture_url TEXT;
    END IF;
END $$;

-- 10. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    paddle_subscription_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL,
    plan_level plan_level NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify what we have now
SELECT 
    'projects' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

