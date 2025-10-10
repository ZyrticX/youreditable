-- Add missing columns to existing tables
-- Run this in Supabase SQL Editor after running the main schema

-- Add missing columns to profiles table
DO $$ BEGIN
    -- Add display_user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'display_user_id' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN display_user_id UUID;
    END IF;
    
    -- Add paddle_customer_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'paddle_customer_id' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN paddle_customer_id TEXT;
    END IF;
    
    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_status' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT DEFAULT 'free';
    END IF;
    
    -- Add subscription_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_id' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_id TEXT;
    END IF;
    
    -- Add profile_picture_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'profile_picture_url' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_picture_url TEXT;
    END IF;
END $$;

-- Update display_user_id to match user id for existing users
UPDATE public.profiles 
SET display_user_id = id 
WHERE display_user_id IS NULL;

-- Add missing columns to notes table
DO $$ BEGIN
    -- Add body column if it doesn't exist (some tables might have note_text instead)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notes' AND column_name = 'body' AND table_schema = 'public') 
       AND EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notes' AND column_name = 'note_text' AND table_schema = 'public') THEN
        ALTER TABLE public.notes ADD COLUMN body TEXT;
        UPDATE public.notes SET body = note_text WHERE body IS NULL AND note_text IS NOT NULL;
        ALTER TABLE public.notes ALTER COLUMN body SET NOT NULL;
    END IF;
END $$;

-- Add missing columns to approvals table
DO $$ BEGIN
    -- Add scope column if it doesn't exist but scope_type does
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approvals' AND column_name = 'scope' AND table_schema = 'public')
       AND EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approvals' AND column_name = 'scope_type' AND table_schema = 'public') THEN
        ALTER TABLE public.approvals ADD COLUMN scope TEXT;
        UPDATE public.approvals SET scope = scope_type WHERE scope IS NULL AND scope_type IS NOT NULL;
        ALTER TABLE public.approvals ALTER COLUMN scope SET NOT NULL;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'approvals' AND column_name = 'status' AND table_schema = 'public') THEN
        ALTER TABLE public.approvals ADD COLUMN status TEXT DEFAULT 'approved';
    END IF;
END $$;

-- Ensure all required indexes exist
CREATE INDEX IF NOT EXISTS idx_profiles_display_user_id ON public.profiles(display_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_paddle_customer_id ON public.profiles(paddle_customer_id);

-- Create a function to auto-populate profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, display_user_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.id
    );
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger to auto-create profile on signup (safe)
DO $$ BEGIN
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update existing users to have display_user_id
UPDATE public.profiles 
SET display_user_id = id 
WHERE display_user_id IS NULL;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
