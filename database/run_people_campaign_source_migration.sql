-- Run this script in Supabase SQL editor to add People Campaign Source view

-- First check if view already exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'people_with_campaign_source') THEN
        RAISE NOTICE 'View people_with_campaign_source already exists, skipping creation';
    ELSE
        RAISE NOTICE 'Creating people_with_campaign_source view...';
    END IF;
END $$;

-- Run the migration
\i /database/migrations/007_create_people_campaign_source_view.sql

-- OR copy and paste the entire contents of 007_create_people_campaign_source_view.sql here

-- Verify the view was created
SELECT COUNT(*) as person_count,
       COUNT(CASE WHEN is_campaign_sourced THEN 1 END) as campaign_sourced,
       COUNT(CASE WHEN NOT is_campaign_sourced THEN 1 END) as organic_sourced
FROM people_with_campaign_source;

-- Sample data to verify campaign attribution
SELECT 
    name,
    current_company,
    engagement_score,
    is_campaign_sourced,
    campaign_name,
    acquisition_cost,
    source_label
FROM people_with_campaign_source
WHERE is_campaign_sourced = true
LIMIT 10;