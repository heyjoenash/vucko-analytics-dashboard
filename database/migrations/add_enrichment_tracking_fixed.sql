-- Add LinkedIn enrichment tracking columns to persons table
-- This enables automated enrichment workflows with boolean-based triggers

-- First, add enrichment columns to persons table
ALTER TABLE persons
ADD COLUMN IF NOT EXISTS has_been_enriched BOOLEAN DEFAULT false;

ALTER TABLE persons
ADD COLUMN IF NOT EXISTS enrichment_status VARCHAR(50) DEFAULT 'not_started';

ALTER TABLE persons
ADD COLUMN IF NOT EXISTS last_enrichment_attempt TIMESTAMPTZ;

ALTER TABLE persons
ADD COLUMN IF NOT EXISTS enrichment_source VARCHAR(50);

ALTER TABLE persons
ADD COLUMN IF NOT EXISTS enrichment_data JSONB;

-- Add indexes for persons enrichment columns
CREATE INDEX IF NOT EXISTS idx_persons_enriched ON persons(has_been_enriched);
CREATE INDEX IF NOT EXISTS idx_persons_enrichment_status ON persons(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_persons_enrichment_attempt ON persons(last_enrichment_attempt);

-- Create enrichment queue table for automated processing
CREATE TABLE IF NOT EXISTS enrichment_queue (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 5,
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for queue processing (after table creation)
CREATE INDEX IF NOT EXISTS idx_queue_status_priority ON enrichment_queue(status, priority, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_queue_person ON enrichment_queue(person_id);
CREATE INDEX IF NOT EXISTS idx_queue_tenant ON enrichment_queue(tenant_id);

-- Create enrichment log table for audit trail
CREATE TABLE IF NOT EXISTS enrichment_logs (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    details JSONB,
    apify_run_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for log queries (after table creation)
CREATE INDEX IF NOT EXISTS idx_logs_person ON enrichment_logs(person_id);
CREATE INDEX IF NOT EXISTS idx_logs_created ON enrichment_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_status ON enrichment_logs(status);

-- Verify the enrichment columns were added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'persons' 
AND column_name IN ('has_been_enriched', 'enrichment_status', 'last_enrichment_attempt', 'enrichment_source', 'enrichment_data')
ORDER BY column_name;