-- Create trigger to ensure display_user_id is always set correctly
-- Run this in Supabase SQL Editor

-- 1. Create function to set display_user_id
CREATE OR REPLACE FUNCTION set_display_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If display_user_id is null or empty, set it to the user's ID
    IF NEW.display_user_id IS NULL THEN
        NEW.display_user_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger for INSERT
DROP TRIGGER IF EXISTS trigger_set_display_user_id_insert ON public.profiles;
CREATE TRIGGER trigger_set_display_user_id_insert
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_display_user_id();

-- 3. Create trigger for UPDATE
DROP TRIGGER IF EXISTS trigger_set_display_user_id_update ON public.profiles;
CREATE TRIGGER trigger_set_display_user_id_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_display_user_id();

-- 4. Test the trigger by updating a record
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a user ID for testing
    SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test update with NULL display_user_id
        UPDATE public.profiles 
        SET display_user_id = NULL 
        WHERE id = test_user_id;
        
        -- Check if trigger worked
        IF EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = test_user_id 
            AND display_user_id = test_user_id
        ) THEN
            RAISE NOTICE 'Trigger working correctly - display_user_id was auto-set';
        ELSE
            RAISE NOTICE 'Trigger may not be working - check manually';
        END IF;
    END IF;
END $$;

-- 5. Verify triggers are created
SELECT 
    'Created triggers:' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%display_user_id%'
ORDER BY trigger_name;

