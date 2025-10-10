-- Check notifications table structure and fix issues
-- Run this in Supabase SQL Editor

-- 1. Check if notifications table exists and its structure
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

-- 2. Check if the table exists at all
SELECT 
    'Table exists check:' as info,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name = 'notifications' 
    AND table_schema = 'public';

-- 3. If table doesn't exist or is missing columns, create/fix it
DO $$ 
BEGIN
    -- Create notifications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        CREATE TABLE public.notifications (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            type TEXT NOT NULL DEFAULT 'general',
            title TEXT,
            message TEXT,
            read BOOLEAN DEFAULT FALSE,
            data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created notifications table';
    END IF;
    
    -- Add missing columns if they don't exist
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

-- 4. Check approvals table structure too
SELECT 
    'Approvals table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'approvals' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Fix approvals table if needed
DO $$ 
BEGIN
    -- Make sure all required columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approvals' AND column_name='scope_type') THEN
        ALTER TABLE public.approvals ADD COLUMN scope_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approvals' AND column_name='scope_id') THEN
        ALTER TABLE public.approvals ADD COLUMN scope_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approvals' AND column_name='approved_at') THEN
        ALTER TABLE public.approvals ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approvals' AND column_name='reviewer_label') THEN
        ALTER TABLE public.approvals ADD COLUMN reviewer_label TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approvals' AND column_name='version_id') THEN
        ALTER TABLE public.approvals ADD COLUMN version_id UUID;
    END IF;
END $$;


