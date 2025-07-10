-- Enhance Existing Tables with LinkedIn Campaign Data
-- This migration adds campaign intelligence to existing workflow tables

-- Enhance existing posts table with campaign data
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS linkedin_campaign_id BIGINT,
ADD COLUMN IF NOT EXISTS campaign_spend DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS campaign_impressions INTEGER,
ADD COLUMN IF NOT EXISTS campaign_clicks INTEGER,
ADD COLUMN IF NOT EXISTS true_cost_per_engagement DECIMAL(8,4),
ADD COLUMN IF NOT EXISTS campaign_objective VARCHAR(100),
ADD COLUMN IF NOT EXISTS campaign_status VARCHAR(50);

-- Enhance existing persons table with acquisition data
ALTER TABLE persons 
ADD COLUMN IF NOT EXISTS acquisition_cost DECIMAL(8,4),
ADD COLUMN IF NOT EXISTS source_campaign_id BIGINT,
ADD COLUMN IF NOT EXISTS campaign_influenced BOOLEAN DEFAULT FALSE;

-- Enhance existing engagements table with attribution
ALTER TABLE engagements 
ADD COLUMN IF NOT EXISTS campaign_attributed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS engagement_value DECIMAL(8,4); -- Cost of this specific engagement

-- Enhance existing companies table with campaign intelligence
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS total_campaign_spend DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_acquisition_cost DECIMAL(8,4),
ADD COLUMN IF NOT EXISTS campaign_influenced_employees INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_linkedin_campaign ON posts(linkedin_campaign_id);
CREATE INDEX IF NOT EXISTS idx_posts_campaign_spend ON posts(campaign_spend);
CREATE INDEX IF NOT EXISTS idx_persons_acquisition_cost ON persons(acquisition_cost);
CREATE INDEX IF NOT EXISTS idx_persons_source_campaign ON persons(source_campaign_id);
CREATE INDEX IF NOT EXISTS idx_engagements_campaign_attributed ON engagements(campaign_attributed);

-- Create enhanced views for existing dashboard

-- Enhanced Posts View (for existing dashboard)
CREATE OR REPLACE VIEW enhanced_posts_view AS
SELECT 
    p.*,
    lc.name as campaign_name,
    lc.objective_type as campaign_objective,
    lc.status as campaign_status,
    lc.targeting_criteria,
    lc.total_budget_amount as campaign_budget,
    
    -- Calculate engagement metrics
    COALESCE(eng_stats.total_engagements, 0) as engagement_count,
    COALESCE(eng_stats.unique_persons, 0) as unique_person_count,
    
    -- ROI calculations
    CASE 
        WHEN p.campaign_spend > 0 AND COALESCE(eng_stats.total_engagements, 0) > 0 
        THEN p.campaign_spend / eng_stats.total_engagements 
        ELSE NULL 
    END as actual_cost_per_engagement,
    
    CASE 
        WHEN p.campaign_spend > 0 AND COALESCE(eng_stats.unique_persons, 0) > 0 
        THEN p.campaign_spend / eng_stats.unique_persons 
        ELSE NULL 
    END as cost_per_person_reached

FROM posts p
LEFT JOIN linkedin_campaigns lc ON p.linkedin_campaign_id = lc.linkedin_campaign_id
LEFT JOIN (
    SELECT 
        post_url,
        COUNT(*) as total_engagements,
        COUNT(DISTINCT person_id) as unique_persons
    FROM engagements 
    WHERE person_id IS NOT NULL
    GROUP BY post_url
) eng_stats ON p.url = eng_stats.post_url;

-- Enhanced Persons View (for existing pipeline)
CREATE OR REPLACE VIEW enhanced_persons_view AS
SELECT 
    p.*,
    lc.name as source_campaign_name,
    lc.objective_type as source_campaign_objective,
    
    -- Calculate person value
    CASE 
        WHEN p.acquisition_cost > 0 
        THEN ROUND(p.engagement_score::DECIMAL / p.acquisition_cost, 2)
        ELSE p.engagement_score 
    END as value_score,
    
    -- Engagement to cost ratio
    CASE 
        WHEN p.acquisition_cost > 0 
        THEN 'High Value'
        WHEN p.engagement_score >= 5 
        THEN 'Organic High Value'
        ELSE 'Standard'
    END as value_tier

FROM persons p
LEFT JOIN linkedin_campaigns lc ON p.source_campaign_id = lc.linkedin_campaign_id;

-- Enhanced Companies View (for existing company analytics)
CREATE OR REPLACE VIEW enhanced_companies_view AS
SELECT 
    c.*,
    
    -- Campaign influence metrics
    COUNT(DISTINCT ep.id) as campaign_influenced_count,
    AVG(ep.acquisition_cost) as avg_employee_acquisition_cost,
    SUM(ep.acquisition_cost) as total_acquisition_investment,
    
    -- Calculate company ROI
    CASE 
        WHEN SUM(ep.acquisition_cost) > 0 
        THEN ROUND(SUM(ep.engagement_score)::DECIMAL / SUM(ep.acquisition_cost), 2)
        ELSE AVG(ep.engagement_score) 
    END as company_roi_score

FROM companies c
LEFT JOIN enhanced_persons_view ep ON ep.current_company = c.name
WHERE ep.acquisition_cost IS NOT NULL OR ep.engagement_score > 0
GROUP BY c.id, c.name, c.industry, c.location, c.size_estimate, c.engagement_score, c.created_at;

-- Enhanced Dashboard Stats View
CREATE OR REPLACE VIEW enhanced_dashboard_stats AS
SELECT 
    -- Campaign Performance
    COUNT(DISTINCT p.linkedin_campaign_id) as active_campaigns,
    SUM(p.campaign_spend) as total_campaign_spend,
    AVG(p.true_cost_per_engagement) as avg_cost_per_engagement,
    
    -- Engagement Impact
    COUNT(DISTINCT CASE WHEN e.campaign_attributed THEN e.id END) as campaign_driven_engagements,
    COUNT(DISTINCT e.id) as total_engagements,
    ROUND(
        (COUNT(DISTINCT CASE WHEN e.campaign_attributed THEN e.id END)::DECIMAL / 
         NULLIF(COUNT(DISTINCT e.id), 0)) * 100, 1
    ) as campaign_attribution_rate,
    
    -- Person Acquisition
    COUNT(DISTINCT CASE WHEN per.acquisition_cost > 0 THEN per.id END) as campaign_acquired_persons,
    AVG(per.acquisition_cost) as avg_acquisition_cost,
    
    -- ROI Metrics
    CASE 
        WHEN SUM(p.campaign_spend) > 0 
        THEN ROUND(COUNT(DISTINCT e.id)::DECIMAL / SUM(p.campaign_spend), 4)
        ELSE NULL 
    END as engagements_per_dollar

FROM posts p
LEFT JOIN engagements e ON p.url = e.post_url
LEFT JOIN persons per ON e.person_id = per.id
WHERE p.linkedin_campaign_id IS NOT NULL;

-- Create function to update company campaign metrics
CREATE OR REPLACE FUNCTION update_company_campaign_metrics() 
RETURNS VOID AS $$
BEGIN
    -- Update companies table with aggregated campaign data
    UPDATE companies 
    SET 
        total_campaign_spend = COALESCE(company_spend.total_spend, 0),
        avg_acquisition_cost = COALESCE(company_spend.avg_cost, 0),
        campaign_influenced_employees = COALESCE(company_spend.influenced_count, 0)
    FROM (
        SELECT 
            p.current_company as company_name,
            SUM(p.acquisition_cost) as total_spend,
            AVG(p.acquisition_cost) as avg_cost,
            COUNT(*) as influenced_count
        FROM persons p
        WHERE p.acquisition_cost > 0 AND p.current_company IS NOT NULL
        GROUP BY p.current_company
    ) company_spend
    WHERE companies.name = company_spend.company_name;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for new views
GRANT SELECT ON enhanced_posts_view TO authenticated;
GRANT SELECT ON enhanced_persons_view TO authenticated;
GRANT SELECT ON enhanced_companies_view TO authenticated;
GRANT SELECT ON enhanced_dashboard_stats TO authenticated;

-- Create trigger to automatically update company metrics when persons data changes
CREATE OR REPLACE FUNCTION trigger_update_company_metrics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_company_campaign_metrics();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_company_campaign_metrics_trigger ON persons;
CREATE TRIGGER update_company_campaign_metrics_trigger
    AFTER INSERT OR UPDATE OF acquisition_cost, current_company ON persons
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_update_company_metrics();

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'Enhanced Existing Tables Migration Completed Successfully';
    RAISE NOTICE 'Enhanced tables: posts, persons, engagements, companies';
    RAISE NOTICE 'Created views: enhanced_posts_view, enhanced_persons_view, enhanced_companies_view, enhanced_dashboard_stats';
    RAISE NOTICE 'Added indexes for campaign performance queries';
    RAISE NOTICE 'Created automatic company metrics updates';
    RAISE NOTICE 'Existing workflow now enhanced with LinkedIn campaign intelligence';
END $$;