-- Check existing notes in the database
-- Run this in Supabase SQL Editor to see if there are notes to display

-- 1. Check notes table structure
SELECT 
    'Notes table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notes' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Count total notes
SELECT 
    'Total notes count:' as info,
    COUNT(*) as total_notes
FROM public.notes;

-- 3. Show recent notes with video info
SELECT 
    'Recent notes with video info:' as info,
    n.id,
    n.body,
    n.note_text,
    n.reviewer_label,
    n.timecode_ms,
    n.created_at,
    v.title as video_title,
    p.name as project_name
FROM public.notes n
LEFT JOIN public.video_versions vv ON vv.id = n.video_version_id
LEFT JOIN public.videos v ON v.current_version_id = vv.id
LEFT JOIN public.projects p ON p.id = v.project_id
ORDER BY n.created_at DESC
LIMIT 10;

-- 4. Check notes by project (for projects with share tokens)
SELECT 
    'Notes by project (with share tokens):' as info,
    p.name as project_name,
    p.share_token,
    COUNT(n.id) as notes_count
FROM public.projects p
LEFT JOIN public.videos v ON v.project_id = p.id
LEFT JOIN public.video_versions vv ON vv.id = v.current_version_id
LEFT JOIN public.notes n ON n.video_version_id = vv.id
WHERE p.share_token IS NOT NULL
GROUP BY p.id, p.name, p.share_token
ORDER BY notes_count DESC;

-- 5. Create a test note if none exist
DO $$ 
DECLARE
    test_video_id UUID;
    test_version_id UUID;
BEGIN
    -- Find a video with a version
    SELECT v.id, v.current_version_id 
    INTO test_video_id, test_version_id
    FROM public.videos v
    JOIN public.projects p ON p.id = v.project_id
    WHERE v.current_version_id IS NOT NULL
    AND p.share_token IS NOT NULL
    LIMIT 1;
    
    IF test_video_id IS NOT NULL AND test_version_id IS NOT NULL THEN
        -- Check if there are any notes for this video
        IF NOT EXISTS (SELECT 1 FROM public.notes WHERE video_version_id = test_version_id) THEN
            -- Create a test note
            INSERT INTO public.notes (
                video_version_id,
                body,
                note_text,
                reviewer_label,
                timecode_ms,
                status
            ) VALUES (
                test_version_id,
                'This is a test note to verify the notes display feature is working correctly.',
                'This is a test note to verify the notes display feature is working correctly.',
                'System Test',
                30000, -- 30 seconds
                'pending'
            );
            
            RAISE NOTICE 'Created test note for video % (version %)', test_video_id, test_version_id;
        ELSE
            RAISE NOTICE 'Notes already exist for video %', test_video_id;
        END IF;
    ELSE
        RAISE NOTICE 'No suitable video found for creating test note';
    END IF;
END $$;

-- 6. Final verification
SELECT 
    'Final verification:' as info,
    COUNT(*) as total_notes_after_test
FROM public.notes;


