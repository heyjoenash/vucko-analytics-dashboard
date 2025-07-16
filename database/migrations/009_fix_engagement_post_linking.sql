-- Fix Engagement Post Linking Issue
-- Problem: Post analysis shows 162 engagements but there are 303 total
-- Root cause: Some engagements may have post_url but not post_id

-- First, let's diagnose the issue
DO $$
DECLARE
    v_post_id INTEGER := 2;
    v_post_url TEXT;
    v_engagements_by_id INTEGER;
    v_engagements_by_url INTEGER;
    v_total_engagements INTEGER;
BEGIN
    -- Get the post URL
    SELECT url INTO v_post_url
    FROM posts 
    WHERE id = v_post_id;
    
    -- Count engagements by post_id
    SELECT COUNT(*) INTO v_engagements_by_id
    FROM engagements
    WHERE post_id = v_post_id;
    
    -- Count engagements by post_url
    SELECT COUNT(*) INTO v_engagements_by_url
    FROM engagements
    WHERE post_url = v_post_url;
    
    -- Count total engagements
    SELECT COUNT(*) INTO v_total_engagements
    FROM engagements;
    
    RAISE NOTICE 'Engagement Analysis for Post %:', v_post_id;
    RAISE NOTICE '- Post URL: %', v_post_url;
    RAISE NOTICE '- Engagements with post_id = %: %', v_post_id, v_engagements_by_id;
    RAISE NOTICE '- Engagements with matching post_url: %', v_engagements_by_url;
    RAISE NOTICE '- Total engagements in database: %', v_total_engagements;
END $$;

-- Fix: Update engagements to ensure post_id is set for all matching URLs
UPDATE engagements e
SET post_id = p.id
FROM posts p
WHERE e.post_url = p.url
AND e.post_id IS NULL;

-- Alternative fix: If post URLs don't match exactly, try matching by LinkedIn URL
UPDATE engagements e
SET post_id = p.id
FROM posts p
WHERE e.post_url = p.linkedin_url
AND e.post_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_engagements_post_url ON engagements(post_url);
CREATE INDEX IF NOT EXISTS idx_posts_linkedin_url ON posts(linkedin_url);

-- Verify the fix
DO $$
DECLARE
    v_post_id INTEGER := 2;
    v_fixed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_fixed_count
    FROM engagements
    WHERE post_id = v_post_id;
    
    RAISE NOTICE 'After fix: Post % now has % engagements', v_post_id, v_fixed_count;
END $$;

-- Also link the Vucko campaigns while we're here
-- This ensures the campaigns are linked even if the UI method fails
INSERT INTO post_campaigns (post_id, campaign_id, is_primary, linked_at)
VALUES 
    (2, 751420716, true, NOW()),
    (2, 751420936, false, NOW())
ON CONFLICT (post_id, campaign_id) DO UPDATE
SET is_primary = EXCLUDED.is_primary,
    linked_at = NOW();

-- Update the post with the primary campaign ID
UPDATE posts 
SET linkedin_campaign_id = 751420716
WHERE id = 2 
AND linkedin_campaign_id IS NULL;

-- Create a view to debug engagement counts
CREATE OR REPLACE VIEW engagement_post_debug AS
SELECT 
    p.id as post_id,
    p.url as post_url,
    p.linkedin_url,
    COUNT(DISTINCT e1.id) as engagements_by_post_id,
    COUNT(DISTINCT e2.id) as engagements_by_url,
    COUNT(DISTINCT e3.id) as engagements_by_linkedin_url
FROM posts p
LEFT JOIN engagements e1 ON e1.post_id = p.id
LEFT JOIN engagements e2 ON e2.post_url = p.url
LEFT JOIN engagements e3 ON e3.post_url = p.linkedin_url
GROUP BY p.id, p.url, p.linkedin_url
ORDER BY p.id;

-- Grant permissions
GRANT SELECT ON engagement_post_debug TO authenticated;

-- Final summary
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 009 completed successfully';
    RAISE NOTICE '- Fixed engagement post linking';
    RAISE NOTICE '- Linked campaigns 751420716 and 751420936 to post 2';
    RAISE NOTICE '- Created engagement_post_debug view for troubleshooting';
    RAISE NOTICE '';
    RAISE NOTICE 'To check engagement counts: SELECT * FROM engagement_post_debug WHERE post_id = 2;';
END $$;