-- Supabase Real-time Setup
-- Run these commands in your Supabase SQL Editor after migration

-- Enable real-time for the tables you want to subscribe to
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Optional: Enable real-time for profiles if you want to track user updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Create a view for easier querying of project data with counts
CREATE OR REPLACE VIEW public.project_stats AS
SELECT 
    p.*,
    COALESCE(video_counts.total_videos, 0) as total_videos,
    COALESCE(video_counts.approved_videos, 0) as approved_videos,
    COALESCE(video_counts.pending_videos, 0) as pending_videos,
    COALESCE(note_counts.total_notes, 0) as total_notes,
    COALESCE(note_counts.open_notes, 0) as open_notes
FROM public.projects p
LEFT JOIN (
    SELECT 
        project_id,
        COUNT(*) as total_videos,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_videos,
        COUNT(CASE WHEN status = 'pending_review' THEN 1 END) as pending_videos
    FROM public.videos 
    GROUP BY project_id
) video_counts ON p.id = video_counts.project_id
LEFT JOIN (
    SELECT 
        p.id as project_id,
        COUNT(n.id) as total_notes,
        COUNT(CASE WHEN n.status = 'open' THEN 1 END) as open_notes
    FROM public.projects p
    LEFT JOIN public.videos v ON p.id = v.project_id
    LEFT JOIN public.video_versions vv ON v.id = vv.video_id
    LEFT JOIN public.notes n ON vv.id = n.video_version_id
    GROUP BY p.id
) note_counts ON p.id = note_counts.project_id;

-- Grant access to the view
GRANT SELECT ON public.project_stats TO authenticated;
GRANT SELECT ON public.project_stats TO anon;

-- Create a function to get project details with all related data
CREATE OR REPLACE FUNCTION get_project_details(project_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'project', row_to_json(p.*),
        'videos', COALESCE(videos_array, '[]'::json),
        'stats', json_build_object(
            'total_videos', COALESCE(array_length(videos_array::json[], 1), 0),
            'approved_videos', (
                SELECT COUNT(*) 
                FROM json_array_elements(COALESCE(videos_array, '[]'::json)) as video
                WHERE video->>'status' = 'approved'
            ),
            'total_notes', (
                SELECT COUNT(*)
                FROM public.notes n
                JOIN public.video_versions vv ON n.video_version_id = vv.id
                JOIN public.videos v ON vv.video_id = v.id
                WHERE v.project_id = project_uuid
            )
        )
    ) INTO result
    FROM public.projects p
    LEFT JOIN (
        SELECT 
            v.project_id,
            json_agg(
                json_build_object(
                    'id', v.id,
                    'title', v.title,
                    'status', v.status,
                    'order_index', v.order_index,
                    'current_version', vv.*,
                    'notes_count', COALESCE(note_counts.notes_count, 0)
                ) ORDER BY v.order_index
            ) as videos_array
        FROM public.videos v
        LEFT JOIN public.video_versions vv ON v.current_version_id = vv.id
        LEFT JOIN (
            SELECT 
                vv.video_id,
                COUNT(n.id) as notes_count
            FROM public.video_versions vv
            LEFT JOIN public.notes n ON vv.id = n.video_version_id
            GROUP BY vv.video_id
        ) note_counts ON v.id = note_counts.video_id
        WHERE v.project_id = project_uuid
        GROUP BY v.project_id
    ) videos_data ON p.id = videos_data.project_id
    WHERE p.id = project_uuid;
    
    RETURN result;
END;
$$;

-- Create a function to get video details with notes
CREATE OR REPLACE FUNCTION get_video_details(video_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'video', row_to_json(v.*),
        'current_version', row_to_json(vv.*),
        'versions', versions_array,
        'notes', COALESCE(notes_array, '[]'::json),
        'approvals', COALESCE(approvals_array, '[]'::json)
    ) INTO result
    FROM public.videos v
    LEFT JOIN public.video_versions vv ON v.current_version_id = vv.id
    LEFT JOIN (
        SELECT 
            video_id,
            json_agg(row_to_json(versions.*) ORDER BY version_number DESC) as versions_array
        FROM public.video_versions versions
        WHERE video_id = video_uuid
        GROUP BY video_id
    ) all_versions ON v.id = all_versions.video_id
    LEFT JOIN (
        SELECT 
            vv.video_id,
            json_agg(
                json_build_object(
                    'id', n.id,
                    'reviewer_name', n.reviewer_name,
                    'reviewer_email', n.reviewer_email,
                    'note_text', n.note_text,
                    'timestamp_seconds', n.timestamp_seconds,
                    'status', n.status,
                    'created_at', n.created_at
                ) ORDER BY n.created_at DESC
            ) as notes_array
        FROM public.video_versions vv
        LEFT JOIN public.notes n ON vv.id = n.video_version_id
        WHERE vv.video_id = video_uuid
        GROUP BY vv.video_id
    ) video_notes ON v.id = video_notes.video_id
    LEFT JOIN (
        SELECT 
            scope_id,
            json_agg(
                json_build_object(
                    'id', a.id,
                    'approver_name', a.approver_name,
                    'approver_email', a.approver_email,
                    'created_at', a.created_at
                ) ORDER BY a.created_at DESC
            ) as approvals_array
        FROM public.approvals a
        WHERE a.scope_type = 'video' AND a.scope_id = video_uuid
        GROUP BY scope_id
    ) video_approvals ON v.id = video_approvals.scope_id
    WHERE v.id = video_uuid;
    
    RETURN result;
END;
$$;

-- Create notification helper function
CREATE OR REPLACE FUNCTION create_notification(
    user_uuid UUID,
    notification_type TEXT,
    title TEXT,
    message TEXT DEFAULT NULL,
    metadata_json JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (user_uuid, notification_type, title, message, metadata_json)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- Create trigger function for automatic notifications
CREATE OR REPLACE FUNCTION notify_project_owner()
RETURNS trigger AS $$
DECLARE
    project_owner_id UUID;
    project_name TEXT;
BEGIN
    -- Get project owner and name
    SELECT p.user_id, p.name INTO project_owner_id, project_name
    FROM public.projects p
    JOIN public.videos v ON p.id = v.project_id
    JOIN public.video_versions vv ON v.id = vv.video_id
    WHERE vv.id = NEW.video_version_id;
    
    -- Create notification based on the trigger
    IF TG_TABLE_NAME = 'notes' THEN
        PERFORM create_notification(
            project_owner_id,
            'note_added',
            'New feedback received',
            format('New feedback from %s on project "%s"', 
                   COALESCE(NEW.reviewer_name, 'Anonymous'), 
                   project_name),
            json_build_object(
                'project_name', project_name,
                'reviewer_name', NEW.reviewer_name,
                'note_id', NEW.id
            )::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for note notifications
CREATE TRIGGER notify_on_new_note
    AFTER INSERT ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION notify_project_owner();

-- Create trigger function for approval notifications
CREATE OR REPLACE FUNCTION notify_approval()
RETURNS trigger AS $$
DECLARE
    project_owner_id UUID;
    project_name TEXT;
    video_title TEXT;
BEGIN
    IF NEW.scope_type = 'video' THEN
        -- Get project owner, project name, and video title
        SELECT p.user_id, p.name, v.title 
        INTO project_owner_id, project_name, video_title
        FROM public.projects p
        JOIN public.videos v ON p.id = v.project_id
        WHERE v.id = NEW.scope_id;
        
        PERFORM create_notification(
            project_owner_id,
            'video_approved',
            'Video approved',
            format('Video "%s" was approved in project "%s"', video_title, project_name),
            json_build_object(
                'project_name', project_name,
                'video_title', video_title,
                'video_id', NEW.scope_id,
                'approver_name', NEW.approver_name
            )::jsonb
        );
    ELSIF NEW.scope_type = 'project' THEN
        -- Get project owner and name
        SELECT user_id, name INTO project_owner_id, project_name
        FROM public.projects
        WHERE id = NEW.scope_id;
        
        PERFORM create_notification(
            project_owner_id,
            'project_approved',
            'Project approved',
            format('Project "%s" has been fully approved', project_name),
            json_build_object(
                'project_name', project_name,
                'project_id', NEW.scope_id,
                'approver_name', NEW.approver_name
            )::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for approval notifications
CREATE TRIGGER notify_on_approval
    AFTER INSERT ON public.approvals
    FOR EACH ROW
    EXECUTE FUNCTION notify_approval();

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_project_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_details(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_video_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_video_details(UUID) TO anon;
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;

