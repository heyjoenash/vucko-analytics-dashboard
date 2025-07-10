-- Add action_status field to engagements table
-- This tracks the pipeline status of each engagement

ALTER TABLE engagements
ADD COLUMN IF NOT EXISTS action_status VARCHAR(50) DEFAULT 'new';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_engagements_action_status 
ON engagements(action_status);

-- Update existing records to have 'new' status
UPDATE engagements 
SET action_status = 'new' 
WHERE action_status IS NULL;