-- Fix Campaign IDs for LinkedIn Campaign Intelligence
-- Update post ID 2 to use the correct LinkedIn campaign IDs from Campaign Manager

-- Update the main post to use the primary campaign ID
UPDATE posts 
SET linkedin_campaign_id = 417151635
WHERE id = 2;

-- Add secondary campaign associations if needed
-- Note: This assumes there might be other ways to associate multiple campaigns
-- For now, we'll use the primary campaign ID and handle multiple campaigns via campaign_post_links table if it exists

-- Verify the update
SELECT id, linkedin_campaign_id, url, account_name 
FROM posts 
WHERE id = 2;