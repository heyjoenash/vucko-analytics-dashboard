-- Phase 1: Person Table Enhancements
-- Run this in Supabase SQL Editor to add missing columns for person classification and CRM pipeline

-- Add missing columns to persons table
ALTER TABLE persons ADD COLUMN IF NOT EXISTS notable boolean DEFAULT false;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS notable_reason text;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS lead_status text CHECK (lead_status IN ('nurturing', 'to_follow_up', 'add_on_linkedin', 'qualified', 'contacted', 'responded', 'meeting_scheduled', 'closed_won', 'closed_lost'));
ALTER TABLE persons ADD COLUMN IF NOT EXISTS title_override text; -- manual title override for data quality
ALTER TABLE persons ADD COLUMN IF NOT EXISTS company_override text; -- manual company override for data quality  
ALTER TABLE persons ADD COLUMN IF NOT EXISTS last_lead_update timestamptz;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001';

-- Add campaign_id to posts table to connect campaigns and posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS campaign_id integer REFERENCES campaigns(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_title text; -- for better post identification
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001';

-- Add tenant_id to existing tables for multi-tenancy support
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE engagements ADD COLUMN IF NOT EXISTS tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_persons_notable ON persons(notable) WHERE notable = true;
CREATE INDEX IF NOT EXISTS idx_persons_lead_status ON persons(lead_status) WHERE lead_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_persons_tenant_id ON persons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_posts_campaign_id ON posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_posts_tenant_id ON posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagements_tenant_id ON engagements(tenant_id);

-- Create a view for person classification that defines our targeting logic
CREATE OR REPLACE VIEW person_classification AS
SELECT 
    p.id,
    p.name,
    p.linkedin_url,
    p.current_company,
    p.company_override,
    p.current_title,
    p.title_override,
    p.engagement_score,
    p.is_follower,
    p.notable,
    p.lead_status,
    
    -- Classification flags
    p.is_follower as is_follower_flag,
    p.notable as is_notable_flag,
    (p.engagement_score >= 5 OR p.notable) as is_high_value_flag,
    
    -- Target matching logic (placeholder - will be enhanced with personas/audiences)
    CASE 
        WHEN LOWER(COALESCE(p.title_override, p.current_title, '')) ~ '(ceo|cto|vp|director|head of|chief|founder|co-founder|manager)' 
        THEN true 
        ELSE false 
    END as is_target_flag,
    
    -- Overall score for ranking
    CASE 
        WHEN p.notable THEN 100
        WHEN p.engagement_score >= 10 THEN 90
        WHEN p.engagement_score >= 5 THEN 70
        WHEN p.is_follower THEN 60
        WHEN p.engagement_score > 0 THEN 40
        ELSE 20
    END as priority_score,
    
    p.tenant_id
FROM persons p;

-- Create a view for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    p.tenant_id,
    COUNT(DISTINCT p.id) as total_people,
    COUNT(DISTINCT c.id) as total_companies,
    COUNT(DISTINCT po.id) as total_posts,
    COUNT(DISTINCT ca.id) as total_campaigns,
    SUM(p.engagement_score) as total_engagements,
    COUNT(*) FILTER (WHERE (p.engagement_score >= 5 OR p.notable)) as hot_prospects,
    COUNT(*) FILTER (WHERE p.is_follower) as followers,
    COUNT(*) FILTER (WHERE p.notable) as notable_people,
    COUNT(*) FILTER (WHERE p.lead_status IS NOT NULL) as leads_in_pipeline
FROM persons p
LEFT JOIN companies c ON c.tenant_id = p.tenant_id  
LEFT JOIN posts po ON po.tenant_id = p.tenant_id
LEFT JOIN campaigns ca ON ca.tenant_id = p.tenant_id
GROUP BY p.tenant_id;

-- Add some sample data for testing (optional)
-- Update a few people to be notable for testing
UPDATE persons 
SET notable = true, notable_reason = 'High engagement score'
WHERE id IN (
    SELECT id FROM persons 
    WHERE engagement_score >= 8 
    AND tenant_id = '00000000-0000-0000-0000-000000000001'
    ORDER BY engagement_score DESC
    LIMIT 5
);

-- Add some sample campaigns if none exist
INSERT INTO campaigns (name, campaign_type, status, tenant_id) 
VALUES 
    ('Q1 Brand Awareness', 'organic', 'active', '00000000-0000-0000-0000-000000000001'),
    ('Product Launch Campaign', 'sponsored', 'active', '00000000-0000-0000-0000-000000000001'),
    ('Thought Leadership', 'organic', 'active', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust based on your Supabase setup)
-- GRANT SELECT ON person_classification TO authenticated;
-- GRANT SELECT ON dashboard_stats TO authenticated;