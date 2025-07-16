-- Profile Enrichment Tracking
-- Simplified version for immediate deployment

-- Add enrichment tracking columns if they don't exist
ALTER TABLE persons
ADD COLUMN IF NOT EXISTS has_been_enriched BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_enrichment BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enrichment_status VARCHAR(50) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS last_enrichment_attempt TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS enrichment_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS enrichment_data JSONB,
ADD COLUMN IF NOT EXISTS linkedin_profile_url VARCHAR(500);

-- Create indexes for enrichment queries
CREATE INDEX IF NOT EXISTS idx_persons_needs_enrichment ON persons(needs_enrichment) WHERE needs_enrichment = true;
CREATE INDEX IF NOT EXISTS idx_persons_has_been_enriched ON persons(has_been_enriched);
CREATE INDEX IF NOT EXISTS idx_persons_enrichment_status ON persons(enrichment_status);

-- Simple enrichment queue for bulk operations
CREATE TABLE IF NOT EXISTS enrichment_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 5, -- 1-10, higher is more important
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for queue processing
CREATE INDEX IF NOT EXISTS idx_enrichment_queue_status ON enrichment_queue(status, priority DESC, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_enrichment_queue_person ON enrichment_queue(person_id);

-- View for enrichment dashboard
CREATE OR REPLACE VIEW enrichment_status_summary AS
SELECT 
    COUNT(*) as total_people,
    COUNT(*) FILTER (WHERE has_been_enriched = true) as enriched_count,
    COUNT(*) FILTER (WHERE needs_enrichment = true) as needs_enrichment_count,
    COUNT(*) FILTER (WHERE enrichment_status = 'in_progress') as in_progress_count,
    COUNT(*) FILTER (WHERE enrichment_status = 'failed') as failed_count,
    ROUND(COUNT(*) FILTER (WHERE has_been_enriched = true)::numeric / NULLIF(COUNT(*)::numeric, 0) * 100, 2) as enrichment_percentage
FROM persons;

-- Sample query to find people needing enrichment
-- SELECT id, name, headline, current_company 
-- FROM persons 
-- WHERE needs_enrichment = true 
-- AND has_been_enriched = false 
-- ORDER BY created_at DESC 
-- LIMIT 100;