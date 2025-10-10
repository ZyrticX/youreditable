-- Add triggers for automatic updates
-- Run this in Supabase SQL Editor

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers for all tables
DO $$ BEGIN
    CREATE TRIGGER update_profiles_updated_at 
        BEFORE UPDATE ON public.profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_projects_updated_at 
        BEFORE UPDATE ON public.projects 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_videos_updated_at 
        BEFORE UPDATE ON public.videos 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_video_versions_updated_at 
        BEFORE UPDATE ON public.video_versions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_notes_updated_at 
        BEFORE UPDATE ON public.notes 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_transactions_updated_at 
        BEFORE UPDATE ON public.transactions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_subscriptions_updated_at 
        BEFORE UPDATE ON public.subscriptions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, display_user_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        SUBSTRING(NEW.email FROM 1 FOR POSITION('@' IN NEW.email) - 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DO $$ BEGIN
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Function to update project video counts
CREATE OR REPLACE FUNCTION update_project_video_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_videos_count and approved_videos_count for the project
    UPDATE public.projects 
    SET 
        total_videos_count = (
            SELECT COUNT(*) 
            FROM public.videos 
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        ),
        approved_videos_count = (
            SELECT COUNT(*) 
            FROM public.videos 
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) 
            AND status = 'approved'
        )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to update project counts when videos change
DO $$ BEGIN
    CREATE TRIGGER update_project_counts_on_video_insert
        AFTER INSERT ON public.videos
        FOR EACH ROW EXECUTE FUNCTION update_project_video_counts();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_project_counts_on_video_update
        AFTER UPDATE ON public.videos
        FOR EACH ROW EXECUTE FUNCTION update_project_video_counts();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_project_counts_on_video_delete
        AFTER DELETE ON public.videos
        FOR EACH ROW EXECUTE FUNCTION update_project_video_counts();
EXCEPTION WHEN duplicate_object THEN null;
END $$;


