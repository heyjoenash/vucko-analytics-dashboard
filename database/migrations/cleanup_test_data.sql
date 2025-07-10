-- Clean up test/mock data from the database
-- This removes test posts and their associated data

-- First, delete engagements for test posts
DELETE FROM engagements 
WHERE post_id IN (
    SELECT id FROM posts 
    WHERE url LIKE '%test%' 
    OR url LIKE '%debug%' 
    OR url LIKE '%example%'
    OR url IN (
        'https://www.linkedin.com/posts/test_post_tracking_fixed',
        'https://www.linkedin.com/posts/debug_test_12345',
        'https://www.linkedin.com/posts/test_fixed_workflow',
        'https://www.linkedin.com/posts/andrewvucko_testing-real-linkedin-post-activity-7340730358725808129-gOrz',
        'https://www.linkedin.com/posts/example-successful-import-test',
        'https://www.linkedin.com/posts/test-successful-import',
        'https://www.linkedin.com/posts/test-import-fixed'
    )
);

-- Delete scraping jobs for test posts
DELETE FROM scraping_jobs 
WHERE post_id IN (
    SELECT id FROM posts 
    WHERE url LIKE '%test%' 
    OR url LIKE '%debug%' 
    OR url LIKE '%example%'
);

-- Delete ads for test posts
DELETE FROM ads 
WHERE post_id IN (
    SELECT id FROM posts 
    WHERE url LIKE '%test%' 
    OR url LIKE '%debug%' 
    OR url LIKE '%example%'
);

-- Finally, delete the test posts themselves
DELETE FROM posts 
WHERE url LIKE '%test%' 
OR url LIKE '%debug%' 
OR url LIKE '%example%'
OR id IN (10, 12, 13, 14, 25, 26, 27);

-- Clean up any test campaigns
DELETE FROM campaigns 
WHERE name LIKE '%test%' 
OR name LIKE '%Test%'
OR name LIKE '%demo%'
OR name LIKE '%Demo%';

-- Clean up any test audience segments (but keep the real ones)
DELETE FROM audience_segments 
WHERE name LIKE '%test%' 
OR name LIKE '%Test%'
OR name LIKE '%demo%'
OR name LIKE '%Demo%';

-- Clean up orphaned persons (those with no engagements)
DELETE FROM persons 
WHERE id NOT IN (
    SELECT DISTINCT person_id 
    FROM engagements
)
AND profile_enriched = FALSE;

-- Log the cleanup
DO $$
BEGIN
    RAISE NOTICE 'Test data cleanup completed at %', NOW();
END $$;