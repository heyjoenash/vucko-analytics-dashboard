-- Add missing tables for comprehensive campaign tracking
-- This migration adds content calendar, custom audiences, and CSV import tracking

-- Content Calendar table for planning posts
CREATE TABLE IF NOT EXISTS content_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    post_title TEXT NOT NULL,
    post_description TEXT,
    scheduled_date DATE NOT NULL,
    actual_posted_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, published, cancelled
    content_type VARCHAR(50), -- text, image, video, carousel
    linkedin_creative_id TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    budget DECIMAL(10,2),
    notes TEXT,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Audiences table (separate from audience_segments for more flexibility)
CREATE TABLE IF NOT EXISTS custom_audiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    audience_type VARCHAR(50) DEFAULT 'custom', -- organic, custom, lookalike
    
    -- LinkedIn targeting criteria
    company_names JSONB DEFAULT '[]',
    job_titles JSONB DEFAULT '[]',
    job_functions JSONB DEFAULT '[]',
    seniority_levels JSONB DEFAULT '[]',
    industries JSONB DEFAULT '[]',
    company_sizes JSONB DEFAULT '[]',
    locations JSONB DEFAULT '[]',
    skills JSONB DEFAULT '[]',
    
    -- Additional filters
    years_of_experience TEXT,
    degree_types JSONB DEFAULT '[]',
    fields_of_study JSONB DEFAULT '[]',
    schools JSONB DEFAULT '[]',
    
    -- Audience size estimates
    estimated_reach INTEGER,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post-Audience mapping table
CREATE TABLE IF NOT EXISTS post_audiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    audience_id UUID REFERENCES custom_audiences(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE, -- Primary audience for the post
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, audience_id)
);

-- CSV Import tracking table
CREATE TABLE IF NOT EXISTS csv_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id),
    file_type VARCHAR(50) NOT NULL, -- demographics, performance
    file_name TEXT NOT NULL,
    file_size INTEGER,
    
    -- Import metadata
    import_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    records_processed INTEGER DEFAULT 0,
    records_imported INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    -- Parsed data storage
    raw_data JSONB,
    parsed_data JSONB,
    
    -- LinkedIn Campaign Manager data
    campaign_group_id TEXT,
    campaign_manager_id TEXT,
    creative_id TEXT,
    date_range_start DATE,
    date_range_end DATE,
    
    -- Performance metrics from CSV
    total_impressions INTEGER,
    total_clicks INTEGER,
    total_spend DECIMAL(10,2),
    total_conversions INTEGER,
    
    -- Error tracking
    error_message TEXT,
    
    -- Metadata
    imported_by UUID,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update posts table with new fields
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS post_title TEXT,
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS primary_audience_id UUID REFERENCES custom_audiences(id),
ADD COLUMN IF NOT EXISTS campaign_strategy TEXT,
ADD COLUMN IF NOT EXISTS content_calendar_id UUID REFERENCES content_calendar(id);

-- Add campaign strategy fields
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS strategy TEXT,
ADD COLUMN IF NOT EXISTS target_audience_summary TEXT,
ADD COLUMN IF NOT EXISTS success_metrics JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_date ON content_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_campaign_id ON content_calendar(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_custom_audiences_tenant_id ON custom_audiences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_post_audiences_post_id ON post_audiences(post_id);
CREATE INDEX IF NOT EXISTS idx_post_audiences_audience_id ON post_audiences(audience_id);
CREATE INDEX IF NOT EXISTS idx_csv_imports_campaign_id ON csv_imports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_csv_imports_post_id ON csv_imports(post_id);
CREATE INDEX IF NOT EXISTS idx_csv_imports_status ON csv_imports(import_status);

-- Create triggers for updated_at
CREATE TRIGGER update_content_calendar_updated_at 
BEFORE UPDATE ON content_calendar 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_audiences_updated_at 
BEFORE UPDATE ON custom_audiences 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_csv_imports_updated_at 
BEFORE UPDATE ON csv_imports 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE content_calendar IS 'Content planning and scheduling for LinkedIn posts';
COMMENT ON TABLE custom_audiences IS 'Custom audience definitions for targeting';
COMMENT ON TABLE post_audiences IS 'Many-to-many relationship between posts and audiences';
COMMENT ON TABLE csv_imports IS 'Track and store LinkedIn Campaign Manager CSV imports';

-- Create view for campaign calendar
CREATE OR REPLACE VIEW campaign_calendar AS
SELECT 
    cc.id,
    cc.post_title,
    cc.scheduled_date,
    cc.status,
    cc.is_paid,
    c.name as campaign_name,
    cg.name as campaign_group_name,
    ca.name as primary_audience,
    p.url as post_url,
    p.linkedin_url
FROM content_calendar cc
LEFT JOIN campaigns c ON cc.campaign_id = c.id
LEFT JOIN campaign_groups cg ON c.campaign_group_id = cg.id
LEFT JOIN posts p ON cc.post_id = p.id
LEFT JOIN custom_audiences ca ON p.primary_audience_id = ca.id
ORDER BY cc.scheduled_date DESC;