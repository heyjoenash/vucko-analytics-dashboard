-- Add linkedin_creative_id to posts table for matching with Campaign Manager data
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS linkedin_creative_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_posts_linkedin_creative_id ON posts(linkedin_creative_id);

-- Also add a campaign_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaign_posts (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, post_id)
);

-- Create index for campaign_posts
CREATE INDEX IF NOT EXISTS idx_campaign_posts_campaign ON campaign_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_posts_post ON campaign_posts(post_id);

-- Add metrics columns to ads table if they don't exist
ALTER TABLE ads 
ADD COLUMN IF NOT EXISTS engagement_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS conversions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2);

-- Create a view for campaign metrics
CREATE OR REPLACE VIEW campaign_metrics AS
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.status,
    COUNT(DISTINCT a.id) as ads_count,
    COUNT(DISTINCT a.post_id) as posts_count,
    COALESCE(SUM(a.impressions), 0) as total_impressions,
    COALESCE(SUM(a.clicks), 0) as total_clicks,
    COALESCE(SUM(a.spend), 0) as total_spend,
    CASE 
        WHEN SUM(a.impressions) > 0 THEN 
            ROUND((SUM(a.clicks)::DECIMAL / SUM(a.impressions)) * 100, 2)
        ELSE 0 
    END as click_through_rate,
    CASE 
        WHEN SUM(a.clicks) > 0 THEN 
            ROUND(SUM(a.spend) / SUM(a.clicks), 2)
        ELSE 0 
    END as cost_per_click
FROM campaigns c
LEFT JOIN ads a ON c.id = a.campaign_id
GROUP BY c.id, c.name, c.status;