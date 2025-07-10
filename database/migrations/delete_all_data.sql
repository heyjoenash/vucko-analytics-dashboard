-- Delete all data from all tables while preserving structure
-- This script deletes data in the correct order to respect foreign key constraints

-- First, delete from tables with foreign key dependencies
DELETE FROM engagements;
DELETE FROM scraping_jobs;
DELETE FROM ads;
DELETE FROM csv_imports;
DELETE FROM post_audiences;
DELETE FROM content_calendar;

-- Delete from posts (has foreign keys to campaigns and audiences)
DELETE FROM posts;

-- Delete from campaigns
DELETE FROM campaigns;
DELETE FROM campaign_groups;

-- Delete from persons and companies
DELETE FROM persons;
DELETE FROM companies;

-- Delete from audiences
DELETE FROM custom_audiences;
DELETE FROM audience_segments;

-- Delete any other tracking tables
DELETE FROM enrichment_queue WHERE true;
DELETE FROM campaign_audiences WHERE true;
DELETE FROM linkedin_audiences WHERE true;
DELETE FROM person_titles WHERE true;

-- Reset any sequences if needed (optional)
-- This will make IDs start from 1 again
ALTER SEQUENCE posts_id_seq RESTART WITH 1;
ALTER SEQUENCE persons_id_seq RESTART WITH 1;
ALTER SEQUENCE companies_id_seq RESTART WITH 1;
ALTER SEQUENCE campaigns_id_seq RESTART WITH 1;
ALTER SEQUENCE campaign_groups_id_seq RESTART WITH 1;
ALTER SEQUENCE engagements_id_seq RESTART WITH 1;

-- Keep the default tenant
-- DO NOT DELETE FROM tenants;

-- Log the cleanup
DO $$
BEGIN
    RAISE NOTICE 'All data deleted successfully at %', NOW();
END $$;