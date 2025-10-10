-- Create function to automatically correct video statuses
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION correct_video_status(video_id UUID)
RETURNS TEXT AS $$
DECLARE
    video_record RECORD;
    notes_count INTEGER;
    approvals_count INTEGER;
    new_status TEXT;
BEGIN
    -- Get video information
    SELECT * INTO video_record FROM public.videos WHERE id = video_id;
    
    IF NOT FOUND THEN
        RETURN 'Video not found';
    END IF;
    
    -- Count notes for this video
    SELECT COUNT(*) INTO notes_count
    FROM public.notes n
    JOIN public.video_versions vv ON vv.id = n.video_version_id
    WHERE vv.id = video_record.current_version_id;
    
    -- Count approvals for this video
    SELECT COUNT(*) INTO approvals_count
    FROM public.approvals a
    WHERE a.scope_id = video_id AND a.scope_type = 'video';
    
    -- Determine correct status
    IF video_record.current_version_id IS NULL THEN
        new_status := 'processing';
    ELSIF approvals_count > 0 THEN
        new_status := 'approved';
    ELSIF notes_count > 0 THEN
        new_status := 'needs_changes';
    ELSE
        new_status := 'pending_review';
    END IF;
    
    -- Update if status is different
    IF video_record.status != new_status THEN
        UPDATE public.videos 
        SET status = new_status, updated_at = NOW()
        WHERE id = video_id;
        
        RETURN 'Updated from ' || video_record.status || ' to ' || new_status;
    ELSE
        RETURN 'Status already correct: ' || new_status;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to correct all video statuses
CREATE OR REPLACE FUNCTION correct_all_video_statuses()
RETURNS TABLE(video_id UUID, title TEXT, old_status TEXT, new_status TEXT, result TEXT) AS $$
DECLARE
    video_record RECORD;
    correction_result TEXT;
BEGIN
    FOR video_record IN SELECT id, title, status FROM public.videos ORDER BY created_at DESC LOOP
        SELECT correct_video_status(video_record.id) INTO correction_result;
        
        video_id := video_record.id;
        title := video_record.title;
        old_status := video_record.status;
        
        -- Get the new status
        SELECT status INTO new_status FROM public.videos WHERE id = video_record.id;
        
        result := correction_result;
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Test the function on all videos
SELECT * FROM correct_all_video_statuses();
