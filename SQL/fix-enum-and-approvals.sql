-- Fix enum values and approvals table structure
-- Run this in Supabase SQL Editor

-- 1. Add 'pending' to note_status enum
DO $$ 
BEGIN
    -- Add pending status to note_status enum
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'note_status')) THEN
        ALTER TYPE note_status ADD VALUE 'pending';
    END IF;
EXCEPTION WHEN others THEN
    -- If enum doesn't exist, create it
    CREATE TYPE note_status AS ENUM ('open', 'completed', 'pending');
END $$;

-- 2. Fix approvals table - make scope_type nullable and add scope
DO $$ 
BEGIN
    -- Make scope_type nullable
    ALTER TABLE public.approvals ALTER COLUMN scope_type DROP NOT NULL;
EXCEPTION WHEN others THEN null;
END $$;

-- 3. Copy data from scope_type to scope if needed
UPDATE public.approvals 
SET scope = scope_type 
WHERE scope IS NULL AND scope_type IS NOT NULL;

-- 4. Update notes table to use TEXT instead of enum for status
DO $$ 
BEGIN
    -- Drop the constraint if it exists
    ALTER TABLE public.notes ALTER COLUMN status TYPE TEXT;
EXCEPTION WHEN others THEN null;
END $$;

-- 5. Verify the changes
SELECT 
    'note_status enum values:' as info,
    enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'note_status')
ORDER BY enumsortorder;

-- Check approvals table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'approvals' 
    AND table_schema = 'public'
    AND column_name IN ('scope', 'scope_type', 'scope_id')
ORDER BY column_name;


