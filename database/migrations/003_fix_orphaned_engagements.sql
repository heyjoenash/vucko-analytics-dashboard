-- Fix Orphaned Engagement Records
-- This script addresses the 162 vs 283 engagement discrepancy
-- by identifying and fixing engagements with NULL person_id

-- First, let's analyze the orphaned engagements issue
CREATE TEMPORARY TABLE engagement_analysis AS
SELECT 
    COUNT(*) as total_engagements,
    COUNT(person_id) as engagements_with_person,
    COUNT(*) - COUNT(person_id) as orphaned_engagements
FROM engagements;

-- Log the engagement analysis
DO $$
DECLARE
    analysis_record RECORD;
BEGIN
    SELECT * INTO analysis_record FROM engagement_analysis;
    RAISE NOTICE 'ENGAGEMENT ANALYSIS:';
    RAISE NOTICE '  Total engagements: %', analysis_record.total_engagements;
    RAISE NOTICE '  With person data: %', analysis_record.engagements_with_person;
    RAISE NOTICE '  Orphaned (NULL person_id): %', analysis_record.orphaned_engagements;
END $$;

-- Find engagements with NULL person_id that need to be addressed
-- Note: The real issue is likely data import related - engagements were created 
-- without proper person_id linking during Apify imports

-- Create a function to clean up orphaned engagements
-- Option 1: Delete orphaned engagements (safest)
-- Option 2: Try to match based on other criteria (if available)

-- For now, let's create a view to show the data quality issue
CREATE OR REPLACE VIEW engagement_quality_report AS
SELECT 
    'Total Engagements' as metric,
    COUNT(*)::text as value
FROM engagements
UNION ALL
SELECT 
    'With Valid Person ID' as metric,
    COUNT(*)::text as value
FROM engagements 
WHERE person_id IS NOT NULL
UNION ALL
SELECT 
    'Orphaned (NULL person_id)' as metric,
    COUNT(*)::text as value
FROM engagements 
WHERE person_id IS NULL
UNION ALL
SELECT 
    'Success Rate' as metric,
    ROUND((COUNT(CASE WHEN person_id IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2)::text || '%' as value
FROM engagements;

-- For future imports, just validate that person_id exists
CREATE OR REPLACE FUNCTION validate_person_exists()
RETURNS TRIGGER AS $$
BEGIN
    -- If person_id is provided, verify it exists
    IF NEW.person_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM persons WHERE id = NEW.person_id) THEN
            RAISE EXCEPTION 'Person ID % does not exist', NEW.person_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate person records for new engagements  
DROP TRIGGER IF EXISTS validate_person_exists_trigger ON engagements;
CREATE TRIGGER validate_person_exists_trigger
    BEFORE INSERT ON engagements
    FOR EACH ROW
    EXECUTE FUNCTION validate_person_exists();

-- Update engagement scores for existing persons based on their engagement count
UPDATE persons 
SET engagement_score = GREATEST(1, engagement_count)
FROM (
    SELECT 
        person_id,
        COUNT(*) as engagement_count
    FROM engagements 
    WHERE person_id IS NOT NULL
    GROUP BY person_id
) e
WHERE persons.id = e.person_id;

-- Create a view to show engagement statistics
CREATE OR REPLACE VIEW engagement_data_quality AS
SELECT 
    'Total Engagements' as metric,
    COUNT(*) as count
FROM engagements
UNION ALL
SELECT 
    'Engagements with Person Data' as metric,
    COUNT(*) as count
FROM engagements e
INNER JOIN persons p ON e.person_id = p.id
UNION ALL
SELECT 
    'Orphaned Engagements' as metric,
    COUNT(*) as count
FROM engagements e
LEFT JOIN persons p ON e.person_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 
    'Unique People' as metric,
    COUNT(DISTINCT person_id) as count
FROM engagements
WHERE person_id IS NOT NULL;

-- Grant permissions
GRANT SELECT ON engagement_data_quality TO authenticated;

-- Final status report
DO $$
DECLARE
    total_engagements INTEGER;
    with_person_data INTEGER;
    orphaned_remaining INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_engagements FROM engagements;
    
    SELECT COUNT(*) INTO with_person_data 
    FROM engagements e
    INNER JOIN persons p ON e.person_id = p.id;
    
    SELECT COUNT(*) INTO orphaned_remaining
    FROM engagements e
    LEFT JOIN persons p ON e.person_id = p.id
    WHERE p.id IS NULL;
    
    RAISE NOTICE 'ENGAGEMENT DATA QUALITY REPORT:';
    RAISE NOTICE '  Total engagements: %', total_engagements;
    RAISE NOTICE '  With person data: %', with_person_data;
    RAISE NOTICE '  Orphaned remaining: %', orphaned_remaining;
    RAISE NOTICE '  Success rate: %%.%', (with_person_data * 100 / total_engagements);
END $$;