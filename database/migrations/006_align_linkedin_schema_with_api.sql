-- Align LinkedIn Schema with Actual API Data Structure
-- This migration updates the database to match LinkedIn Marketing Solutions API response format

-- First, let's see what we currently have and what the API actually returns
-- LinkedIn API returns data in this format for campaigns:
-- {
--   "elements": [
--     {
--       "id": 12345678,
--       "name": "Q2 2025 Thought Leadership",
--       "status": "ACTIVE",
--       "type": "SPONSORED_UPDATES", 
--       "objectiveType": "BRAND_AWARENESS",
--       "totalBudget": { "amount": "5000.00", "currencyCode": "USD" },
--       "unitCost": { "amount": "2.50", "currencyCode": "USD" },
--       "costType": "CPM",
--       "targetingCriteria": { ... },
--       "runSchedule": { "start": "2025-01-01", "end": "2025-03-31" },
--       "changeAuditStamps": {
--         "created": { "time": 1704067200000 },
--         "lastModified": { "time": 1704153600000 }
--       }
--     }
--   ]
-- }

-- Analytics API returns demographics data like:
-- {
--   "elements": [
--     {
--       "pivot": "COMPANY",
--       "pivotValue": "Microsoft", 
--       "impressions": 5420,
--       "clicks": 234,
--       "spend": 1250.50,
--       "costInUsd": 1250.50
--     }
--   ]
-- }

-- Update linkedin_campaigns table to match actual API structure
ALTER TABLE linkedin_campaigns 
DROP COLUMN IF EXISTS version_tag,
DROP COLUMN IF EXISTS associated_entity_urn,
DROP COLUMN IF EXISTS locale;

-- Add columns that actually exist in LinkedIn API
ALTER TABLE linkedin_campaigns 
ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(50), -- SPONSORED_UPDATES, SPONSORED_INMAILS, TEXT_AD
ADD COLUMN IF NOT EXISTS run_schedule_start TIMESTAMP,
ADD COLUMN IF NOT EXISTS run_schedule_end TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_time BIGINT, -- LinkedIn timestamp format
ADD COLUMN IF NOT EXISTS last_modified_time BIGINT, -- LinkedIn timestamp format
ADD COLUMN IF NOT EXISTS creative_selection VARCHAR(50),
ADD COLUMN IF NOT EXISTS optimization_target VARCHAR(100),
ADD COLUMN IF NOT EXISTS audience_expansion_enabled BOOLEAN DEFAULT false;

-- Create table for LinkedIn campaign analytics/demographics data
CREATE TABLE IF NOT EXISTS linkedin_campaign_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_campaign_id BIGINT NOT NULL,
    
    -- Pivot information (what demographic this row represents)
    pivot_type VARCHAR(50) NOT NULL, -- COMPANY, JOB_TITLE, SENIORITY, INDUSTRY, etc.
    pivot_value VARCHAR(255) NOT NULL, -- Actual company name, job title, etc.
    
    -- Performance metrics from LinkedIn API
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    spend DECIMAL(12,4) DEFAULT 0,
    cost_in_usd DECIMAL(12,4) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    video_views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    follows INTEGER DEFAULT 0,
    
    -- Calculated metrics
    ctr DECIMAL(6,4), -- Click-through rate
    cpc DECIMAL(8,4), -- Cost per click  
    cpm DECIMAL(8,4), -- Cost per mille
    
    -- Time period this data represents
    date_range_start DATE,
    date_range_end DATE,
    time_granularity VARCHAR(20) DEFAULT 'ALL', -- ALL, DAILY, MONTHLY
    
    -- Metadata
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    synced_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE(linkedin_campaign_id, pivot_type, pivot_value, date_range_start, tenant_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_linkedin_analytics_campaign_id ON linkedin_campaign_analytics(linkedin_campaign_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_analytics_pivot ON linkedin_campaign_analytics(pivot_type, pivot_value);
CREATE INDEX IF NOT EXISTS idx_linkedin_analytics_date ON linkedin_campaign_analytics(date_range_start, date_range_end);

-- Create a view that aggregates demographics data for easy consumption
CREATE OR REPLACE VIEW campaign_demographics_summary AS
SELECT 
    lca.linkedin_campaign_id,
    lc.name as campaign_name,
    lc.status as campaign_status,
    lc.total_budget_amount,
    lc.total_budget_currency,
    
    -- Company demographics (top 10)
    COALESCE(
        json_agg(
            json_build_object(
                'label', lca.pivot_value,
                'impressions', lca.impressions,
                'clicks', lca.clicks, 
                'spend', lca.spend
            ) ORDER BY lca.impressions DESC
        ) FILTER (WHERE lca.pivot_type = 'COMPANY' AND lca.impressions > 0),
        '[]'::json
    ) as top_companies,
    
    -- Job title demographics (top 10)
    COALESCE(
        json_agg(
            json_build_object(
                'label', lca.pivot_value,
                'impressions', lca.impressions,
                'clicks', lca.clicks,
                'spend', lca.spend
            ) ORDER BY lca.impressions DESC
        ) FILTER (WHERE lca.pivot_type = 'JOB_TITLE' AND lca.impressions > 0),
        '[]'::json  
    ) as top_job_titles,
    
    -- Seniority demographics (percentages calculated in subquery)
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'label', pivot_value,
                'impressions', impressions,
                'percentage', ROUND((impressions::numeric / total_impressions) * 100, 1)
            ) ORDER BY impressions DESC
        ) FROM (
            SELECT 
                pivot_value, 
                impressions,
                SUM(impressions) OVER (PARTITION BY linkedin_campaign_id) as total_impressions
            FROM linkedin_campaign_analytics 
            WHERE linkedin_campaign_id = lca.linkedin_campaign_id 
            AND pivot_type = 'SENIORITY' 
            AND impressions > 0
        ) seniority_data),
        '[]'::json
    ) as seniority_breakdown,
    
    -- Industry demographics (percentages calculated in subquery)
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'label', pivot_value,
                'impressions', impressions,
                'percentage', ROUND((impressions::numeric / total_impressions) * 100, 1)
            ) ORDER BY impressions DESC
        ) FROM (
            SELECT 
                pivot_value, 
                impressions,
                SUM(impressions) OVER (PARTITION BY linkedin_campaign_id) as total_impressions
            FROM linkedin_campaign_analytics 
            WHERE linkedin_campaign_id = lca.linkedin_campaign_id 
            AND pivot_type = 'INDUSTRY' 
            AND impressions > 0
        ) industry_data),
        '[]'::json
    ) as industry_breakdown,
    
    -- Overall performance
    SUM(lca.impressions) as total_impressions,
    SUM(lca.clicks) as total_clicks,
    SUM(lca.spend) as total_spend,
    
    -- Calculated metrics
    CASE WHEN SUM(lca.impressions) > 0 
         THEN ROUND((SUM(lca.clicks)::numeric / SUM(lca.impressions)) * 100, 2)
         ELSE 0 END as overall_ctr,
    CASE WHEN SUM(lca.clicks) > 0
         THEN ROUND(SUM(lca.spend) / SUM(lca.clicks), 4)  
         ELSE 0 END as overall_cpc,
         
    lca.synced_at
    
FROM linkedin_campaign_analytics lca
JOIN linkedin_campaigns lc ON lca.linkedin_campaign_id = lc.linkedin_campaign_id
WHERE lca.tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY lca.linkedin_campaign_id, lc.name, lc.status, lc.total_budget_amount, lc.total_budget_currency, lca.synced_at;

-- Update enhanced_posts_view to use this new analytics data
CREATE OR REPLACE VIEW enhanced_posts_view AS
SELECT 
    p.*,
    lc.name as campaign_name,
    lc.objective_type as campaign_objective,
    lc.status as campaign_status,
    lc.targeting_criteria,
    lc.total_budget_amount as campaign_budget,
    
    -- Get demographics from the new analytics table
    cds.top_companies,
    cds.top_job_titles,
    cds.seniority_breakdown,
    cds.industry_breakdown,
    cds.total_impressions as campaign_total_impressions,
    cds.total_clicks as campaign_total_clicks,
    cds.total_spend as campaign_total_spend,
    cds.overall_ctr as campaign_ctr,
    cds.overall_cpc as campaign_cpc,
    
    -- Calculate engagement metrics from existing data
    COALESCE(eng_stats.total_engagements, 0) as engagement_count,
    COALESCE(eng_stats.unique_persons, 0) as unique_person_count,
    
    -- ROI calculations using campaign analytics data
    CASE 
        WHEN cds.total_spend > 0 AND COALESCE(eng_stats.total_engagements, 0) > 0 
        THEN cds.total_spend / eng_stats.total_engagements 
        ELSE NULL 
    END as actual_cost_per_engagement,
    
    CASE 
        WHEN cds.total_spend > 0 AND COALESCE(eng_stats.unique_persons, 0) > 0 
        THEN cds.total_spend / eng_stats.unique_persons 
        ELSE NULL 
    END as cost_per_person_reached

FROM posts p
LEFT JOIN linkedin_campaigns lc ON p.linkedin_campaign_id = lc.linkedin_campaign_id
LEFT JOIN campaign_demographics_summary cds ON lc.linkedin_campaign_id = cds.linkedin_campaign_id
LEFT JOIN (
    SELECT 
        post_id,
        COUNT(*) as total_engagements,
        COUNT(DISTINCT person_id) as unique_persons
    FROM engagements 
    WHERE person_id IS NOT NULL
    GROUP BY post_id
) eng_stats ON p.id = eng_stats.post_id;

-- Function to store LinkedIn campaign analytics data from API response
CREATE OR REPLACE FUNCTION store_linkedin_analytics(
    p_campaign_id BIGINT,
    p_analytics_data JSONB
) RETURNS INTEGER AS $$
DECLARE
    v_element JSONB;
    v_inserted_count INTEGER := 0;
    v_date_start DATE := CURRENT_DATE - INTERVAL '30 days';
    v_date_end DATE := CURRENT_DATE;
BEGIN
    -- Clear existing analytics data for this campaign
    DELETE FROM linkedin_campaign_analytics 
    WHERE linkedin_campaign_id = p_campaign_id;
    
    -- Process each element in the analytics response
    FOR v_element IN SELECT jsonb_array_elements(p_analytics_data->'elements')
    LOOP
        INSERT INTO linkedin_campaign_analytics (
            linkedin_campaign_id,
            pivot_type,
            pivot_value,
            impressions,
            clicks,
            spend,
            cost_in_usd,
            conversions,
            video_views,
            likes,
            comments,
            shares,
            follows,
            date_range_start,
            date_range_end,
            synced_at
        ) VALUES (
            p_campaign_id,
            v_element->>'pivot',
            v_element->>'pivotValue',
            COALESCE((v_element->>'impressions')::INTEGER, 0),
            COALESCE((v_element->>'clicks')::INTEGER, 0),
            COALESCE((v_element->>'spend')::DECIMAL, 0),
            COALESCE((v_element->>'costInUsd')::DECIMAL, 0),
            COALESCE((v_element->>'conversions')::INTEGER, 0),
            COALESCE((v_element->>'videoViews')::INTEGER, 0),
            COALESCE((v_element->>'likes')::INTEGER, 0),
            COALESCE((v_element->>'comments')::INTEGER, 0),
            COALESCE((v_element->>'shares')::INTEGER, 0),
            COALESCE((v_element->>'follows')::INTEGER, 0),
            v_date_start,
            v_date_end,
            NOW()
        )
        ON CONFLICT (linkedin_campaign_id, pivot_type, pivot_value, date_range_start, tenant_id) 
        DO UPDATE SET
            impressions = EXCLUDED.impressions,
            clicks = EXCLUDED.clicks,
            spend = EXCLUDED.spend,
            cost_in_usd = EXCLUDED.cost_in_usd,
            conversions = EXCLUDED.conversions,
            video_views = EXCLUDED.video_views,
            likes = EXCLUDED.likes,
            comments = EXCLUDED.comments,
            shares = EXCLUDED.shares,
            follows = EXCLUDED.follows,
            synced_at = NOW();
            
        v_inserted_count := v_inserted_count + 1;
    END LOOP;
    
    RETURN v_inserted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON linkedin_campaign_analytics TO authenticated;
GRANT SELECT ON campaign_demographics_summary TO authenticated;
GRANT SELECT ON enhanced_posts_view TO authenticated;

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'LinkedIn Schema Alignment Migration Completed Successfully';
    RAISE NOTICE 'Created linkedin_campaign_analytics table for API response data';
    RAISE NOTICE 'Created campaign_demographics_summary view for aggregated demographics';
    RAISE NOTICE 'Updated enhanced_posts_view to use real analytics data';
    RAISE NOTICE 'Created store_linkedin_analytics() function for API data storage';
    RAISE NOTICE 'Schema now matches LinkedIn Marketing Solutions API response format';
END $$;