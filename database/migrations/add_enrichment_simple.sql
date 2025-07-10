-- Simple LinkedIn enrichment setup - run this in Supabase SQL editor
-- Add boolean trigger column and basic enrichment tracking

-- Add the main boolean trigger column
ALTER TABLE persons ADD COLUMN IF NOT EXISTS has_been_enriched BOOLEAN DEFAULT false;

-- Add enrichment status tracking
ALTER TABLE persons ADD COLUMN IF NOT EXISTS enrichment_status VARCHAR(50) DEFAULT 'not_started';

-- Add last attempt timestamp
ALTER TABLE persons ADD COLUMN IF NOT EXISTS last_enrichment_attempt TIMESTAMPTZ;

-- Add enrichment source
ALTER TABLE persons ADD COLUMN IF NOT EXISTS enrichment_source VARCHAR(50);

-- Add enrichment data storage
ALTER TABLE persons ADD COLUMN IF NOT EXISTS enrichment_data JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_persons_enriched ON persons(has_been_enriched);
CREATE INDEX IF NOT EXISTS idx_persons_enrichment_status ON persons(enrichment_status);

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'persons' 
AND column_name LIKE '%enrichment%' OR column_name = 'has_been_enriched'
ORDER BY column_name;