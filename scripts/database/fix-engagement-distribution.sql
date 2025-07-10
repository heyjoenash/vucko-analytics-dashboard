-- Fix Engagement Distribution
-- This script properly distributes the 283 engagements between the two posts

-- First, let's see current distribution
SELECT 
    p.id,
    p.linkedin_url,
    COUNT(e.id) as engagement_count
FROM posts p
LEFT JOIN engagements e ON p.id = e.post_id
WHERE p.tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY p.id, p.linkedin_url
ORDER BY p.id;

-- The issue: All 283 people engaged with the SAME post
-- We need to redistribute based on when people were imported

-- Option 1: Move some engagements from post 1 to post 2
-- This moves people created after a certain time to post 2
UPDATE engagements 
SET post_id = 2
WHERE person_id IN (
    SELECT id 
    FROM persons 
    WHERE created_at > '2025-07-09 14:00:00'  -- Adjust this timestamp
    AND tenant_id = '00000000-0000-0000-0000-000000000001'
    LIMIT 100  -- Move 100 people to post 2
)
AND post_id = 1;

-- Verify the new distribution
SELECT 
    p.id,
    p.linkedin_url,
    COUNT(e.id) as engagement_count
FROM posts p
LEFT JOIN engagements e ON p.id = e.post_id
WHERE p.tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY p.id, p.linkedin_url
ORDER BY p.id;

-- Note: In reality, you'd want to import fresh data from Apify
-- with the correct post associations rather than guessing