-- Add action_status column to engagements table
-- This tracks the pipeline status of each engagement

ALTER TABLE engagements
ADD COLUMN IF NOT EXISTS action_status VARCHAR(50) DEFAULT 'new';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_engagements_action_status 
ON engagements(action_status);

-- Update any existing records that might have NULL values
UPDATE engagements 
SET action_status = 'new' 
WHERE action_status IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'engagements' 
AND column_name = 'action_status';