-- Migration: Add Actions and Pipeline Tracking
-- This adds CRM-style pipeline tracking for the Actions dashboard

-- Pipeline stages (customizable per tenant)
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    order_position INTEGER NOT NULL,
    color VARCHAR(20) DEFAULT '#gray-400',
    is_active BOOLEAN DEFAULT true,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, order_position)
);

-- Actions/Tasks for follow-ups
CREATE TABLE IF NOT EXISTS actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    action_type VARCHAR(50) NOT NULL, -- 'linkedin_connect', 'linkedin_message', 'email', 'call', 'meeting', 'follow_up'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    priority VARCHAR(20) DEFAULT 'medium', -- 'high', 'medium', 'low'
    due_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    assigned_to VARCHAR(255),
    notes TEXT,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals/Opportunities in the pipeline
CREATE TABLE IF NOT EXISTS deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    stage_id UUID REFERENCES pipeline_stages(id),
    title VARCHAR(255) NOT NULL,
    value DECIMAL(12,2),
    probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    notes TEXT,
    is_notable BOOLEAN DEFAULT false,
    source VARCHAR(50), -- 'signal', 'campaign', 'manual'
    source_post_id INTEGER REFERENCES posts(id),
    source_campaign_id INTEGER REFERENCES campaigns(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    won BOOLEAN
);

-- Notable signals tracking
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_notable BOOLEAN DEFAULT false;
ALTER TABLE engagements ADD COLUMN IF NOT EXISTS is_notable BOOLEAN DEFAULT false;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS is_notable BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX idx_actions_person_id ON actions(person_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_due_date ON actions(due_date);
CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_deals_person_id ON deals(person_id);
CREATE INDEX idx_posts_notable ON posts(is_notable);
CREATE INDEX idx_persons_notable ON persons(is_notable);

-- Insert default pipeline stages for Vucko
INSERT INTO pipeline_stages (name, order_position, color, tenant_id) VALUES
    ('New Signal', 1, '#gray-400', '00000000-0000-0000-0000-000000000001'),
    ('Qualified', 2, '#gray-500', '00000000-0000-0000-0000-000000000001'),
    ('Contacted', 3, '#gray-600', '00000000-0000-0000-0000-000000000001'),
    ('In Discussion', 4, '#gray-700', '00000000-0000-0000-0000-000000000001'),
    ('Proposal', 5, '#gray-800', '00000000-0000-0000-0000-000000000001'),
    ('Closed Won', 6, '#black', '00000000-0000-0000-0000-000000000001'),
    ('Closed Lost', 7, '#gray-300', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (tenant_id, order_position) DO NOTHING;

-- Create view for actions dashboard
CREATE OR REPLACE VIEW actions_dashboard AS
SELECT 
    a.*,
    p.name as person_name,
    p.headline as person_title,
    p.current_company as company_name,
    p.engagement_score,
    p.is_follower,
    c.name as company_full_name
FROM actions a
LEFT JOIN persons p ON a.person_id = p.id
LEFT JOIN companies c ON a.company_id = c.id;

-- Create view for pipeline dashboard
CREATE OR REPLACE VIEW pipeline_dashboard AS
SELECT 
    d.*,
    ps.name as stage_name,
    ps.color as stage_color,
    ps.order_position as stage_order,
    p.name as person_name,
    p.headline as person_title,
    p.current_company,
    c.name as company_name
FROM deals d
LEFT JOIN pipeline_stages ps ON d.stage_id = ps.id
LEFT JOIN persons p ON d.person_id = p.id
LEFT JOIN companies c ON d.company_id = c.id;