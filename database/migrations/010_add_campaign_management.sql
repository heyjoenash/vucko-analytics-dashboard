-- Campaign Management Schema
-- Enables tracking of LinkedIn campaigns with organic posts

-- Campaign Groups table (combines LinkedIn campaigns + organic posts)
CREATE TABLE IF NOT EXISTS campaign_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_name VARCHAR(255),
    campaign_type VARCHAR(50) DEFAULT 'mixed', -- 'paid', 'organic', 'mixed'
    status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'paused', 'completed'
    start_date DATE,
    end_date DATE,
    budget_amount DECIMAL(10,2),
    budget_currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_campaign_groups_tenant ON campaign_groups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_groups_status ON campaign_groups(status);
CREATE INDEX IF NOT EXISTS idx_campaign_groups_dates ON campaign_groups(start_date, end_date);

-- Link posts to campaign groups
CREATE TABLE IF NOT EXISTS post_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    campaign_group_id UUID NOT NULL REFERENCES campaign_groups(id) ON DELETE CASCADE,
    campaign_id VARCHAR(255), -- LinkedIn campaign ID if paid
    is_organic BOOLEAN DEFAULT false,
    performance_data JSONB DEFAULT '{}', -- Store LinkedIn analytics
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, campaign_group_id)
);

-- Indexes for post campaigns
CREATE INDEX IF NOT EXISTS idx_post_campaigns_post ON post_campaigns(post_id);
CREATE INDEX IF NOT EXISTS idx_post_campaigns_group ON post_campaigns(campaign_group_id);
CREATE INDEX IF NOT EXISTS idx_post_campaigns_linkedin ON post_campaigns(campaign_id);

-- Add campaign tracking to existing tables
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS campaign_group_id UUID REFERENCES campaign_groups(id),
ADD COLUMN IF NOT EXISTS is_paid_promotion BOOLEAN DEFAULT false;

ALTER TABLE persons
ADD COLUMN IF NOT EXISTS acquisition_campaign_id UUID REFERENCES campaign_groups(id),
ADD COLUMN IF NOT EXISTS acquisition_cost DECIMAL(10,2);

-- Create view for campaign performance
CREATE OR REPLACE VIEW campaign_performance AS
SELECT 
    cg.id,
    cg.name,
    cg.client_name,
    cg.campaign_type,
    cg.status,
    cg.start_date,
    cg.end_date,
    cg.budget_amount,
    COUNT(DISTINCT pc.post_id) as post_count,
    COUNT(DISTINCT p.id) as person_count,
    SUM(p.acquisition_cost) as total_acquisition_cost,
    cg.created_at
FROM campaign_groups cg
LEFT JOIN post_campaigns pc ON pc.campaign_group_id = cg.id
LEFT JOIN persons p ON p.acquisition_campaign_id = cg.id
GROUP BY cg.id;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_groups_updated_at 
BEFORE UPDATE ON campaign_groups 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();