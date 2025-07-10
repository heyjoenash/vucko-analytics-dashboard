-- LinkedIn API Integration Schema
-- This migration adds comprehensive LinkedIn campaign tracking to our system

-- LinkedIn Ad Accounts
CREATE TABLE IF NOT EXISTS linkedin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_account_id BIGINT UNIQUE NOT NULL,
    account_name VARCHAR(255),
    account_type VARCHAR(50), -- ENTERPRISE, BUSINESS
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    serving_statuses TEXT[],
    reference_urn VARCHAR(255), -- Organization reference
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_synced TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- LinkedIn Campaign Groups
CREATE TABLE IF NOT EXISTS linkedin_campaign_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_group_id BIGINT UNIQUE NOT NULL,
    linkedin_account_id BIGINT NOT NULL,
    name VARCHAR(255),
    status VARCHAR(50),
    run_schedule JSONB, -- Start/end dates
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_synced TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- LinkedIn Campaigns
CREATE TABLE IF NOT EXISTS linkedin_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_campaign_id BIGINT UNIQUE NOT NULL,
    linkedin_account_id BIGINT NOT NULL,
    linkedin_group_id BIGINT,
    
    -- Campaign Details
    name VARCHAR(500),
    status VARCHAR(50), -- ACTIVE, PAUSED, COMPLETED, REMOVED
    campaign_type VARCHAR(50), -- SPONSORED_UPDATES, SPONSORED_INMAILS, TEXT_AD
    format VARCHAR(50), -- SINGLE_VIDEO, SINGLE_IMAGE, etc.
    objective_type VARCHAR(50), -- BRAND_AWARENESS, VIDEO_VIEW, etc.
    
    -- Budget & Costs
    total_budget_amount DECIMAL(12,2),
    total_budget_currency VARCHAR(10) DEFAULT 'USD',
    unit_cost_amount DECIMAL(12,4),
    unit_cost_currency VARCHAR(10) DEFAULT 'USD',
    cost_type VARCHAR(50), -- CPM, CPC, etc.
    pacing_strategy VARCHAR(50), -- LIFETIME, DAILY
    
    -- Optimization
    optimization_target_type VARCHAR(100),
    creative_selection VARCHAR(50), -- OPTIMIZED, MANUAL
    audience_expansion_enabled BOOLEAN DEFAULT false,
    
    -- Delivery Settings
    story_delivery_enabled BOOLEAN DEFAULT false,
    offsite_delivery_enabled BOOLEAN DEFAULT false,
    connected_television_only BOOLEAN DEFAULT false,
    
    -- Schedule
    run_schedule JSONB, -- {start: timestamp, end: timestamp}
    
    -- Targeting Criteria (stored as JSONB for flexibility)
    targeting_criteria JSONB,
    
    -- Serving Status
    serving_statuses TEXT[],
    
    -- LinkedIn Metadata
    version_tag VARCHAR(50),
    associated_entity_urn VARCHAR(255),
    locale JSONB, -- {country: "US", language: "en"}
    
    -- Our System Integration
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    post_id INTEGER, -- Link to our posts table (posts.id is SERIAL/INTEGER)
    persona_id UUID, -- Link to targeted persona (will be enabled after personas table is confirmed)
    
    -- Tracking
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_synced TIMESTAMP DEFAULT NOW(),
    linkedin_created_at TIMESTAMP,
    linkedin_modified_at TIMESTAMP,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
    -- Note: persona_id foreign key will be added separately after confirming personas table structure
);

-- LinkedIn Campaign Performance (Daily Snapshots)
CREATE TABLE IF NOT EXISTS linkedin_campaign_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_campaign_id BIGINT NOT NULL,
    date DATE NOT NULL,
    
    -- Performance Metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    spend DECIMAL(12,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    video_views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    follows INTEGER DEFAULT 0,
    
    -- Calculated Metrics
    ctr DECIMAL(6,4), -- Click-through rate
    cpc DECIMAL(8,4), -- Cost per click
    cpm DECIMAL(8,4), -- Cost per mille
    conversion_rate DECIMAL(6,4),
    cost_per_conversion DECIMAL(8,4),
    engagement_rate DECIMAL(6,4),
    
    -- Metadata
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_at TIMESTAMP DEFAULT NOW(),
    synced_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE(linkedin_campaign_id, date, tenant_id)
);

-- LinkedIn Audience Templates
CREATE TABLE IF NOT EXISTS linkedin_audience_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_template_id BIGINT UNIQUE NOT NULL,
    linkedin_account_id BIGINT NOT NULL,
    
    name VARCHAR(100),
    description TEXT,
    targeting_criteria JSONB,
    estimated_audience_size INTEGER,
    
    -- Integration with our system
    persona_id UUID, -- Link to our personas  
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_synced TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    -- Note: persona_id foreign key will be added separately after confirming personas table structure
);

-- Extend existing posts table for LinkedIn integration
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS linkedin_campaign_id BIGINT,
ADD COLUMN IF NOT EXISTS linkedin_creative_id BIGINT,
ADD COLUMN IF NOT EXISTS campaign_spend DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS campaign_impressions INTEGER,
ADD COLUMN IF NOT EXISTS campaign_clicks INTEGER,
ADD COLUMN IF NOT EXISTS true_cost_per_engagement DECIMAL(8,4);

-- Extend existing personas table for LinkedIn integration
ALTER TABLE personas 
ADD COLUMN IF NOT EXISTS linkedin_template_id BIGINT,
ADD COLUMN IF NOT EXISTS estimated_audience_size INTEGER,
ADD COLUMN IF NOT EXISTS target_cpm DECIMAL(8,4),
ADD COLUMN IF NOT EXISTS target_budget DECIMAL(10,2);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_linkedin_accounts_account_id ON linkedin_accounts(linkedin_account_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_accounts_tenant ON linkedin_accounts(tenant_id);

CREATE INDEX IF NOT EXISTS idx_linkedin_campaign_groups_group_id ON linkedin_campaign_groups(linkedin_group_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_campaign_groups_account ON linkedin_campaign_groups(linkedin_account_id);

CREATE INDEX IF NOT EXISTS idx_linkedin_campaigns_campaign_id ON linkedin_campaigns(linkedin_campaign_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_campaigns_account ON linkedin_campaigns(linkedin_account_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_campaigns_group ON linkedin_campaigns(linkedin_group_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_campaigns_post ON linkedin_campaigns(post_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_campaigns_persona ON linkedin_campaigns(persona_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_campaigns_status ON linkedin_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_linkedin_performance_campaign_date ON linkedin_campaign_performance(linkedin_campaign_id, date);
CREATE INDEX IF NOT EXISTS idx_linkedin_performance_date ON linkedin_campaign_performance(date);

CREATE INDEX IF NOT EXISTS idx_linkedin_templates_template_id ON linkedin_audience_templates(linkedin_template_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_templates_persona ON linkedin_audience_templates(persona_id);

-- Add personas foreign key constraints if personas table exists with correct structure
DO $$
DECLARE 
    personas_id_type TEXT;
BEGIN
    -- Check if personas table exists and get the id column type
    SELECT data_type INTO personas_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'personas' AND column_name = 'id';
    
    IF personas_id_type IS NOT NULL THEN
        RAISE NOTICE 'Found personas table with id type: %', personas_id_type;
        
        IF personas_id_type = 'uuid' THEN
            -- Add foreign key constraints for UUID personas table
            ALTER TABLE linkedin_campaigns 
            ADD CONSTRAINT linkedin_campaigns_persona_id_fkey 
            FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE SET NULL;
            
            ALTER TABLE linkedin_audience_templates 
            ADD CONSTRAINT linkedin_audience_templates_persona_id_fkey 
            FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE SET NULL;
            
            RAISE NOTICE 'Added foreign key constraints for UUID personas table';
        ELSIF personas_id_type = 'integer' THEN
            -- Update columns to INTEGER to match existing table
            ALTER TABLE linkedin_campaigns ALTER COLUMN persona_id TYPE INTEGER USING persona_id::TEXT::INTEGER;
            ALTER TABLE linkedin_audience_templates ALTER COLUMN persona_id TYPE INTEGER USING persona_id::TEXT::INTEGER;
            
            -- Add foreign key constraints for INTEGER personas table
            ALTER TABLE linkedin_campaigns 
            ADD CONSTRAINT linkedin_campaigns_persona_id_fkey 
            FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE SET NULL;
            
            ALTER TABLE linkedin_audience_templates 
            ADD CONSTRAINT linkedin_audience_templates_persona_id_fkey 
            FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE SET NULL;
            
            RAISE NOTICE 'Updated persona_id columns to INTEGER and added foreign key constraints';
        ELSE
            RAISE NOTICE 'Unexpected personas.id type: %. Skipping foreign key constraints.', personas_id_type;
        END IF;
    ELSE
        RAISE NOTICE 'Personas table not found. Skipping foreign key constraints. Run personas migration first if needed.';
    END IF;
END $$;

-- Create views for common queries (after fixing column types)

-- Campaign Performance Summary
CREATE OR REPLACE VIEW campaign_performance_summary AS
SELECT 
    c.linkedin_campaign_id,
    c.name as campaign_name,
    c.status,
    c.objective_type,
    c.total_budget_amount,
    c.total_budget_currency,
    
    -- Performance aggregates
    SUM(p.impressions) as total_impressions,
    SUM(p.clicks) as total_clicks,
    SUM(p.spend) as total_spend,
    SUM(p.conversions) as total_conversions,
    
    -- Calculated metrics
    CASE 
        WHEN SUM(p.impressions) > 0 THEN ROUND((SUM(p.clicks)::numeric / SUM(p.impressions)::numeric) * 100, 2)
        ELSE 0 
    END as overall_ctr,
    
    CASE 
        WHEN SUM(p.clicks) > 0 THEN ROUND(SUM(p.spend) / SUM(p.clicks), 4)
        ELSE 0 
    END as overall_cpc,
    
    CASE 
        WHEN SUM(p.impressions) > 0 THEN ROUND((SUM(p.spend) / SUM(p.impressions)) * 1000, 4)
        ELSE 0 
    END as overall_cpm,
    
    -- Budget utilization
    CASE 
        WHEN c.total_budget_amount > 0 THEN ROUND((SUM(p.spend) / c.total_budget_amount) * 100, 2)
        ELSE 0 
    END as budget_utilization_percent,
    
    -- Integration with our data
    c.post_id,
    c.persona_id,
    c.tenant_id,
    
    -- Dates
    MIN(p.date) as first_active_date,
    MAX(p.date) as last_active_date,
    COUNT(DISTINCT p.date) as active_days

FROM linkedin_campaigns c
LEFT JOIN linkedin_campaign_performance p ON c.linkedin_campaign_id = p.linkedin_campaign_id
GROUP BY c.linkedin_campaign_id, c.name, c.status, c.objective_type, c.total_budget_amount, 
         c.total_budget_currency, c.post_id, c.persona_id, c.tenant_id;

-- Account Spend Summary
CREATE OR REPLACE VIEW account_spend_summary AS
SELECT 
    a.linkedin_account_id,
    a.account_name,
    a.currency,
    COUNT(DISTINCT c.linkedin_campaign_id) as total_campaigns,
    COUNT(DISTINCT CASE WHEN c.status = 'ACTIVE' THEN c.linkedin_campaign_id END) as active_campaigns,
    SUM(c.total_budget_amount) as total_budgeted,
    SUM(p.spend) as total_spent,
    CASE 
        WHEN SUM(c.total_budget_amount) > 0 THEN 
            ROUND((SUM(p.spend) / SUM(c.total_budget_amount)) * 100, 2)
        ELSE 0 
    END as budget_utilization_percent,
    a.tenant_id
FROM linkedin_accounts a
LEFT JOIN linkedin_campaigns c ON a.linkedin_account_id = c.linkedin_account_id
LEFT JOIN linkedin_campaign_performance p ON c.linkedin_campaign_id = p.linkedin_campaign_id
GROUP BY a.linkedin_account_id, a.account_name, a.currency, a.tenant_id;

-- Grant permissions
GRANT ALL ON linkedin_accounts TO authenticated;
GRANT ALL ON linkedin_campaign_groups TO authenticated;
GRANT ALL ON linkedin_campaigns TO authenticated;
GRANT ALL ON linkedin_campaign_performance TO authenticated;
GRANT ALL ON linkedin_audience_templates TO authenticated;
GRANT SELECT ON campaign_performance_summary TO authenticated;
GRANT SELECT ON account_spend_summary TO authenticated;

-- Create function to sync campaign data
CREATE OR REPLACE FUNCTION sync_linkedin_campaign_data(
    p_account_id BIGINT,
    p_campaign_data JSONB
) RETURNS UUID AS $$
DECLARE
    v_campaign_id UUID;
    v_campaign_element JSONB;
BEGIN
    -- Loop through campaign elements
    FOR v_campaign_element IN SELECT jsonb_array_elements(p_campaign_data->'elements')
    LOOP
        INSERT INTO linkedin_campaigns (
            linkedin_campaign_id,
            linkedin_account_id,
            linkedin_group_id,
            name,
            status,
            campaign_type,
            format,
            objective_type,
            total_budget_amount,
            total_budget_currency,
            unit_cost_amount,
            unit_cost_currency,
            cost_type,
            pacing_strategy,
            optimization_target_type,
            creative_selection,
            audience_expansion_enabled,
            story_delivery_enabled,
            offsite_delivery_enabled,
            connected_television_only,
            run_schedule,
            targeting_criteria,
            serving_statuses,
            version_tag,
            associated_entity_urn,
            locale,
            linkedin_created_at,
            linkedin_modified_at,
            last_synced
        ) VALUES (
            (v_campaign_element->>'id')::BIGINT,
            p_account_id,
            NULLIF(substring(v_campaign_element->>'campaignGroup' from 'sponsoredCampaignGroup:(\d+)'), '')::BIGINT,
            v_campaign_element->>'name',
            v_campaign_element->>'status',
            v_campaign_element->>'type',
            v_campaign_element->>'format',
            v_campaign_element->>'objectiveType',
            (v_campaign_element->'totalBudget'->>'amount')::DECIMAL,
            v_campaign_element->'totalBudget'->>'currencyCode',
            (v_campaign_element->'unitCost'->>'amount')::DECIMAL,
            v_campaign_element->'unitCost'->>'currencyCode',
            v_campaign_element->>'costType',
            v_campaign_element->>'pacingStrategy',
            v_campaign_element->>'optimizationTargetType',
            v_campaign_element->>'creativeSelection',
            (v_campaign_element->>'audienceExpansionEnabled')::BOOLEAN,
            (v_campaign_element->>'storyDeliveryEnabled')::BOOLEAN,
            (v_campaign_element->>'offsiteDeliveryEnabled')::BOOLEAN,
            (v_campaign_element->>'connectedTelevisionOnly')::BOOLEAN,
            v_campaign_element->'runSchedule',
            v_campaign_element->'targetingCriteria',
            ARRAY(SELECT jsonb_array_elements_text(v_campaign_element->'servingStatuses')),
            v_campaign_element->'version'->>'versionTag',
            v_campaign_element->>'associatedEntity',
            v_campaign_element->'locale',
            to_timestamp((v_campaign_element->'changeAuditStamps'->'created'->>'time')::BIGINT / 1000),
            to_timestamp((v_campaign_element->'changeAuditStamps'->'lastModified'->>'time')::BIGINT / 1000),
            NOW()
        )
        ON CONFLICT (linkedin_campaign_id) 
        DO UPDATE SET
            name = EXCLUDED.name,
            status = EXCLUDED.status,
            total_budget_amount = EXCLUDED.total_budget_amount,
            unit_cost_amount = EXCLUDED.unit_cost_amount,
            serving_statuses = EXCLUDED.serving_statuses,
            linkedin_modified_at = EXCLUDED.linkedin_modified_at,
            last_synced = NOW(),
            updated_at = NOW()
        RETURNING id INTO v_campaign_id;
    END LOOP;
    
    RETURN v_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'LinkedIn Integration Schema Migration Completed Successfully';
    RAISE NOTICE 'Created tables: linkedin_accounts, linkedin_campaign_groups, linkedin_campaigns, linkedin_campaign_performance, linkedin_audience_templates';
    RAISE NOTICE 'Extended tables: posts, personas (if exists)';
    RAISE NOTICE 'Created views: campaign_performance_summary, account_spend_summary';
    RAISE NOTICE 'Created function: sync_linkedin_campaign_data()';
    RAISE NOTICE 'Foreign key constraints for personas added based on existing table structure';
END $$;