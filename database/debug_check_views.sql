-- Check if views exist in database
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN (
    'people_with_campaign_source',
    'enhanced_dashboard_stats',
    'campaign_demographics_summary',
    'enhanced_posts_view'
)
ORDER BY viewname;

-- Check if linkedin_campaigns table exists
SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'linkedin_campaigns'
) as linkedin_campaigns_exists;

-- Check if persons table has data
SELECT COUNT(*) as person_count FROM persons;

-- Check current tenant
SELECT * FROM tenants;