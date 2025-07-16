-- Add fields to link posts properly to campaigns
-- This migration enhances the posts table to track LinkedIn creatives and shares

-- Add columns to posts table for better campaign tracking
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS linkedin_creative_id BIGINT,
ADD COLUMN IF NOT EXISTS linkedin_share_urn VARCHAR(255),
ADD COLUMN IF NOT EXISTS extracted_from_campaign BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS post_title VARCHAR(500),
ADD COLUMN IF NOT EXISTS content_preview TEXT;

-- Create junction table for many-to-many relationship between posts and campaigns
-- This allows a post to be associated with multiple campaigns (e.g., reused content)
CREATE TABLE IF NOT EXISTS post_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    campaign_id BIGINT NOT NULL,
    linkedin_campaign_id BIGINT,
    association_type VARCHAR(50) DEFAULT 'creative', -- 'creative', 'share', 'manual'
    created_at TIMESTAMP DEFAULT NOW(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    UNIQUE(post_id, campaign_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_linkedin_creative ON posts(linkedin_creative_id);
CREATE INDEX IF NOT EXISTS idx_posts_extracted_campaign ON posts(extracted_from_campaign);
CREATE INDEX IF NOT EXISTS idx_post_campaigns_post ON post_campaigns(post_id);
CREATE INDEX IF NOT EXISTS idx_post_campaigns_campaign ON post_campaigns(campaign_id);

-- Create view to easily query posts with their campaigns
CREATE OR REPLACE VIEW posts_with_campaigns AS
SELECT 
    p.*,
    lc.name as primary_campaign_name,
    lc.status as primary_campaign_status,
    lc.objective_type as primary_campaign_objective,
    lc.total_budget_amount as primary_campaign_budget,
    COUNT(DISTINCT pc.campaign_id) as total_campaigns,
    ARRAY_AGG(DISTINCT lc2.name) FILTER (WHERE lc2.name IS NOT NULL) as all_campaign_names
FROM posts p
LEFT JOIN linkedin_campaigns lc ON p.linkedin_campaign_id = lc.linkedin_campaign_id
LEFT JOIN post_campaigns pc ON p.id = pc.post_id
LEFT JOIN linkedin_campaigns lc2 ON pc.linkedin_campaign_id = lc2.linkedin_campaign_id
GROUP BY p.id, lc.linkedin_campaign_id, lc.name, lc.status, lc.objective_type, lc.total_budget_amount;

-- Create function to link a post to a campaign
CREATE OR REPLACE FUNCTION link_post_to_campaign(
    p_post_id INTEGER,
    p_campaign_id BIGINT,
    p_association_type VARCHAR DEFAULT 'creative'
) RETURNS BOOLEAN AS $$
DECLARE
    v_linkedin_campaign_id BIGINT;
BEGIN
    -- Get the LinkedIn campaign ID
    SELECT linkedin_campaign_id INTO v_linkedin_campaign_id
    FROM linkedin_campaigns
    WHERE linkedin_campaign_id = p_campaign_id
    LIMIT 1;
    
    -- Insert or update the association
    INSERT INTO post_campaigns (post_id, campaign_id, linkedin_campaign_id, association_type)
    VALUES (p_post_id, p_campaign_id, v_linkedin_campaign_id, p_association_type)
    ON CONFLICT (post_id, campaign_id) 
    DO UPDATE SET association_type = EXCLUDED.association_type;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON posts_with_campaigns TO authenticated;
GRANT ALL ON post_campaigns TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE post_campaigns IS 'Junction table linking posts to campaigns (many-to-many relationship)';
COMMENT ON COLUMN posts.linkedin_creative_id IS 'LinkedIn creative ID if post was created from a campaign creative';
COMMENT ON COLUMN posts.linkedin_share_urn IS 'LinkedIn share URN for organic posts';
COMMENT ON COLUMN posts.extracted_from_campaign IS 'True if post was automatically extracted from LinkedIn campaign API';

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'Post-Campaign Relationships Migration Completed Successfully';
    RAISE NOTICE 'Added columns: linkedin_creative_id, linkedin_share_urn, extracted_from_campaign';
    RAISE NOTICE 'Created table: post_campaigns (junction table)';
    RAISE NOTICE 'Created view: posts_with_campaigns';
    RAISE NOTICE 'Created function: link_post_to_campaign()';
END $$;