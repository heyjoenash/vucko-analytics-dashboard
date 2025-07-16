-- Clean Database Script for Fresh Start
-- Run this in Supabase SQL Editor

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Clean all data (preserving structure)
TRUNCATE TABLE engagements CASCADE;
TRUNCATE TABLE targets CASCADE;
TRUNCATE TABLE enrichment_logs CASCADE;
TRUNCATE TABLE enrichment_queue CASCADE;
TRUNCATE TABLE post_campaigns CASCADE;
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE persons CASCADE;
TRUNCATE TABLE companies CASCADE;
TRUNCATE TABLE personas CASCADE;
TRUNCATE TABLE audience_segments CASCADE;
TRUNCATE TABLE campaign_groups CASCADE;
TRUNCATE TABLE campaigns CASCADE;
TRUNCATE TABLE linkedin_campaign_performance CASCADE;
TRUNCATE TABLE linkedin_campaigns CASCADE;
TRUNCATE TABLE linkedin_campaign_groups CASCADE;
TRUNCATE TABLE linkedin_audience_templates CASCADE;
TRUNCATE TABLE linkedin_accounts CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Verify empty
SELECT 'posts' as table_name, COUNT(*) as count FROM posts
UNION ALL
SELECT 'persons', COUNT(*) FROM persons
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'engagements', COUNT(*) FROM engagements
UNION ALL
SELECT 'campaigns', COUNT(*) FROM campaigns
UNION ALL
SELECT 'campaign_groups', COUNT(*) FROM campaign_groups;