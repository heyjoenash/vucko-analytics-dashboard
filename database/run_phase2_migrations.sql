-- Phase 2 Database Migrations for Signals & Actions
-- Run this script in Supabase SQL Editor to apply all campaign management and enrichment updates

-- Start transaction
BEGIN;

-- 1. Campaign Management Tables
-- =============================

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

-- Campaign Groups indexes
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

-- Post campaigns indexes
CREATE INDEX IF NOT EXISTS idx_post_campaigns_post ON post_campaigns(post_id);
CREATE INDEX IF NOT EXISTS idx_post_campaigns_group ON post_campaigns(campaign_group_id);
CREATE INDEX IF NOT EXISTS idx_post_campaigns_linkedin ON post_campaigns(campaign_id);

-- 2. Update Existing Tables
-- ========================

-- Add campaign tracking to posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS campaign_group_id UUID REFERENCES campaign_groups(id),
ADD COLUMN IF NOT EXISTS is_paid_promotion BOOLEAN DEFAULT false;

-- Add acquisition tracking to persons
ALTER TABLE persons
ADD COLUMN IF NOT EXISTS acquisition_campaign_id UUID REFERENCES campaign_groups(id),
ADD COLUMN IF NOT EXISTS acquisition_cost DECIMAL(10,2);

-- Add enrichment tracking to persons
ALTER TABLE persons
ADD COLUMN IF NOT EXISTS has_been_enriched BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_enrichment BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enrichment_status VARCHAR(50) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS last_enrichment_attempt TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS enrichment_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS enrichment_data JSONB,
ADD COLUMN IF NOT EXISTS linkedin_profile_url VARCHAR(500);

-- 3. Enrichment Queue
-- ==================

CREATE TABLE IF NOT EXISTS enrichment_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 5,
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrichment indexes
CREATE INDEX IF NOT EXISTS idx_persons_needs_enrichment ON persons(needs_enrichment) WHERE needs_enrichment = true;
CREATE INDEX IF NOT EXISTS idx_persons_has_been_enriched ON persons(has_been_enriched);
CREATE INDEX IF NOT EXISTS idx_persons_enrichment_status ON persons(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_enrichment_queue_status ON enrichment_queue(status, priority DESC, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_enrichment_queue_person ON enrichment_queue(person_id);

-- 4. Views
-- ========

-- Campaign performance view
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

-- Enrichment status summary
CREATE OR REPLACE VIEW enrichment_status_summary AS
SELECT 
    COUNT(*) as total_people,
    COUNT(*) FILTER (WHERE has_been_enriched = true) as enriched_count,
    COUNT(*) FILTER (WHERE needs_enrichment = true) as needs_enrichment_count,
    COUNT(*) FILTER (WHERE enrichment_status = 'in_progress') as in_progress_count,
    COUNT(*) FILTER (WHERE enrichment_status = 'failed') as failed_count,
    ROUND(COUNT(*) FILTER (WHERE has_been_enriched = true)::numeric / NULLIF(COUNT(*)::numeric, 0) * 100, 2) as enrichment_percentage
FROM persons;

-- 5. Triggers
-- ===========

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to campaign_groups
CREATE TRIGGER IF NOT EXISTS update_campaign_groups_updated_at 
BEFORE UPDATE ON campaign_groups 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to enrichment_queue
CREATE TRIGGER IF NOT EXISTS update_enrichment_queue_updated_at 
BEFORE UPDATE ON enrichment_queue 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commit transaction
COMMIT;

-- Verify the migration
SELECT 'Campaign Groups' as table_name, COUNT(*) as count FROM campaign_groups
UNION ALL
SELECT 'Post Campaigns', COUNT(*) FROM post_campaigns
UNION ALL  
SELECT 'Enrichment Queue', COUNT(*) FROM enrichment_queue
UNION ALL
SELECT 'People needing enrichment', COUNT(*) FROM persons WHERE needs_enrichment = true;