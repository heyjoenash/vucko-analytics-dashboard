-- Quick Fix: Link Vucko Campaigns to Post ID 2
-- Run this directly in Supabase SQL editor

-- First, ensure campaigns exist in the database
INSERT INTO linkedin_campaigns (
    linkedin_campaign_id,
    linkedin_account_id,
    name,
    status,
    tenant_id
) VALUES 
    (751420716, 510508147, 'Vucko Campaign 1', 'ACTIVE', '00000000-0000-0000-0000-000000000001'),
    (751420936, 510508147, 'Vucko Campaign 2', 'ACTIVE', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (linkedin_campaign_id) DO NOTHING;

-- Link the campaigns to post 2
INSERT INTO post_campaigns (post_id, campaign_id, linkedin_campaign_id, association_type)
VALUES 
    (2, 751420716, 751420716, 'manual'),
    (2, 751420936, 751420936, 'manual')
ON CONFLICT (post_id, campaign_id) DO UPDATE
SET linkedin_campaign_id = EXCLUDED.linkedin_campaign_id,
    association_type = EXCLUDED.association_type;

-- Update the post with the primary campaign ID (first one)
UPDATE posts 
SET linkedin_campaign_id = 751420716
WHERE id = 2;

-- Verify the linking
SELECT 
    p.id as post_id,
    p.url,
    p.linkedin_campaign_id as primary_campaign,
    pc.campaign_id,
    pc.association_type
FROM posts p
LEFT JOIN post_campaigns pc ON p.id = pc.post_id
WHERE p.id = 2;

-- Check if campaigns exist in the database
SELECT 
    linkedin_campaign_id,
    name,
    status
FROM linkedin_campaigns
WHERE linkedin_campaign_id IN (751420716, 751420936);

-- If campaigns don't exist, you'll need to sync them first
-- Or create placeholder entries:
INSERT INTO linkedin_campaigns (
    linkedin_campaign_id,
    linkedin_account_id,
    name,
    status,
    tenant_id
) VALUES 
    (751420716, 510508147, 'Vucko Campaign 1', 'ACTIVE', '00000000-0000-0000-0000-000000000001'),
    (751420936, 510508147, 'Vucko Campaign 2', 'ACTIVE', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (linkedin_campaign_id) DO NOTHING;