-- Fix table conflicts and add campaign strategies
-- This migration resolves conflicts between schema.sql and personas migration

-- First, drop the conflicting audience_segments table from personas migration if it exists
-- The main schema.sql version will be used instead
DROP TABLE IF EXISTS audience_segments CASCADE;

-- Recreate audience_segments with proper structure from schema.sql
CREATE TABLE IF NOT EXISTS audience_segments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    segment_type TEXT, -- 'company', 'title', 'industry', 'location'
    revenue_filter TEXT,
    title_filters JSONB DEFAULT '[]',
    company_filters JSONB DEFAULT '[]',
    criteria JSONB DEFAULT '{}',
    other_criteria JSONB DEFAULT '{}',
    created_date TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Add tenant_id to audience_segments if not exists
ALTER TABLE audience_segments 
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Create campaign_strategies table for strategy templates
CREATE TABLE IF NOT EXISTS campaign_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy_type VARCHAR(50), -- 'awareness', 'engagement', 'conversion', 'retention'
    
    -- Target audience configuration
    target_personas JSONB DEFAULT '[]', -- Array of persona IDs
    target_segments JSONB DEFAULT '[]', -- Array of audience segment IDs
    
    -- Content strategy
    content_themes JSONB DEFAULT '[]',
    content_mix JSONB DEFAULT '{}', -- e.g., {"educational": 40, "promotional": 20, "thought_leadership": 40}
    posting_frequency VARCHAR(50), -- 'daily', 'weekly', '2-3_per_week', 'monthly'
    optimal_posting_times JSONB DEFAULT '[]',
    
    -- Success metrics and KPIs
    primary_kpi VARCHAR(50), -- 'engagement_rate', 'click_through_rate', 'conversions', 'followers'
    success_metrics JSONB DEFAULT '{}',
    benchmark_metrics JSONB DEFAULT '{}',
    
    -- Budget and resources
    recommended_budget_range JSONB DEFAULT '{}', -- {"min": 1000, "max": 5000, "currency": "USD"}
    required_assets JSONB DEFAULT '[]', -- ['creative_team', 'copywriter', 'video_producer']
    
    -- Campaign duration
    recommended_duration_days INTEGER,
    
    -- Templates and examples
    post_templates JSONB DEFAULT '[]',
    successful_examples JSONB DEFAULT '[]',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link campaigns to strategies
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES campaign_strategies(id),
ADD COLUMN IF NOT EXISTS actual_metrics JSONB DEFAULT '{}';

-- Create persona_strategies junction table
CREATE TABLE IF NOT EXISTS persona_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES campaign_strategies(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3,2), -- 0.00 to 1.00
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, strategy_id)
);

-- LinkedIn API credentials table
CREATE TABLE IF NOT EXISTS linkedin_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_name VARCHAR(255) NOT NULL,
    connection_type VARCHAR(50) NOT NULL, -- 'personal', 'company_page', 'campaign_manager'
    
    -- Encrypted credentials
    encrypted_cookies TEXT, -- Encrypted LinkedIn session cookies
    api_token TEXT, -- For LinkedIn API if available
    
    -- LinkedIn account info
    linkedin_profile_url TEXT,
    account_name TEXT,
    account_email TEXT,
    
    -- Connection status
    is_active BOOLEAN DEFAULT true,
    last_validated TIMESTAMPTZ,
    validation_status VARCHAR(50), -- 'valid', 'expired', 'invalid'
    
    -- Rate limiting
    daily_api_calls INTEGER DEFAULT 0,
    api_call_limit INTEGER DEFAULT 1000,
    last_api_call TIMESTAMPTZ,
    
    -- Metadata
    created_by UUID,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add LinkedIn connection tracking to scraping jobs
ALTER TABLE scraping_jobs
ADD COLUMN IF NOT EXISTS linkedin_connection_id UUID REFERENCES linkedin_connections(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_strategies_tenant_id ON campaign_strategies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_strategies_is_active ON campaign_strategies(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_strategy_id ON campaigns(strategy_id);
CREATE INDEX IF NOT EXISTS idx_persona_strategies_persona_id ON persona_strategies(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_strategies_strategy_id ON persona_strategies(strategy_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_connections_tenant_id ON linkedin_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_connections_is_active ON linkedin_connections(is_active);

-- Create views
CREATE OR REPLACE VIEW campaign_strategy_performance AS
SELECT 
    cs.id as strategy_id,
    cs.name as strategy_name,
    cs.strategy_type,
    COUNT(DISTINCT c.id) as campaigns_using,
    COUNT(DISTINCT p.id) as posts_created,
    COUNT(DISTINCT e.id) as total_engagements,
    COUNT(DISTINCT e.person_id) as unique_engagers,
    AVG(CASE 
        WHEN cs.primary_kpi = 'engagement_rate' THEN 
            (COUNT(e.id)::FLOAT / NULLIF(SUM(a.impressions), 0)) * 100
        WHEN cs.primary_kpi = 'click_through_rate' THEN 
            (SUM(a.clicks)::FLOAT / NULLIF(SUM(a.impressions), 0)) * 100
        ELSE 0
    END) as kpi_performance
FROM campaign_strategies cs
LEFT JOIN campaigns c ON c.strategy_id = cs.id
LEFT JOIN ads a ON a.campaign_id = c.id
LEFT JOIN posts p ON p.id = a.post_id
LEFT JOIN engagements e ON e.post_id = p.id
WHERE cs.is_active = true
GROUP BY cs.id, cs.name, cs.strategy_type, cs.primary_kpi;

-- Create function to match personas to strategies
CREATE OR REPLACE FUNCTION match_personas_to_strategy(p_strategy_id UUID)
RETURNS TABLE(persona_id UUID, relevance_score DECIMAL(3,2)) AS $$
DECLARE
    v_strategy RECORD;
BEGIN
    -- Get strategy details
    SELECT * INTO v_strategy FROM campaign_strategies WHERE id = p_strategy_id;
    
    -- For now, return all active personas with a default score
    -- In production, this would use sophisticated matching logic
    RETURN QUERY
    SELECT 
        p.id,
        CASE 
            WHEN p.engagement_criteria->>'min_score' IS NOT NULL THEN 0.8
            ELSE 0.5
        END::DECIMAL(3,2) as score
    FROM personas p
    WHERE p.is_active = true
    AND p.tenant_id = v_strategy.tenant_id;
END;
$$ LANGUAGE plpgsql;

-- Add sample campaign strategies
INSERT INTO campaign_strategies (name, description, strategy_type, content_themes, posting_frequency, primary_kpi, success_metrics)
VALUES 
(
    'B2B Thought Leadership',
    'Establish your company as an industry thought leader through valuable insights and expertise',
    'awareness',
    '["industry_insights", "best_practices", "future_trends", "case_studies"]'::jsonb,
    '2-3_per_week',
    'engagement_rate',
    '{"target_engagement_rate": 3.5, "follower_growth": 10, "share_rate": 2}'::jsonb
),
(
    'Enterprise ABM Campaign',
    'Account-based marketing strategy targeting specific enterprise accounts',
    'conversion',
    '["customer_success_stories", "roi_calculators", "product_demos", "executive_insights"]'::jsonb,
    'weekly',
    'conversions',
    '{"target_conversion_rate": 2.5, "qualified_leads": 20, "meeting_bookings": 5}'::jsonb
),
(
    'Startup Growth Hacking',
    'Rapid growth strategy for startups looking to build awareness and user base',
    'engagement',
    '["behind_the_scenes", "founder_stories", "product_updates", "community_highlights"]'::jsonb,
    'daily',
    'followers',
    '{"follower_growth_rate": 25, "viral_coefficient": 1.5, "user_signups": 100}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_campaign_strategies_updated_at 
BEFORE UPDATE ON campaign_strategies 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_connections_updated_at 
BEFORE UPDATE ON linkedin_connections 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON campaign_strategies TO authenticated;
GRANT ALL ON persona_strategies TO authenticated;
GRANT ALL ON linkedin_connections TO authenticated;
GRANT SELECT ON campaign_strategy_performance TO authenticated;