-- Add lead tracking and notable flag columns to persons table
-- This enables lead management and special flagging for important contacts

-- Add lead status column
ALTER TABLE persons
ADD COLUMN IF NOT EXISTS lead_status VARCHAR(50);

-- Add notable flag and reason
ALTER TABLE persons
ADD COLUMN IF NOT EXISTS is_notable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notable_reason TEXT;

-- Add timestamp for tracking
ALTER TABLE persons
ADD COLUMN IF NOT EXISTS last_lead_update TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_persons_lead_status ON persons(lead_status);
CREATE INDEX IF NOT EXISTS idx_persons_notable ON persons(is_notable);

-- Update existing records to have NULL lead_status (not tracked yet)
-- This is intentional - NULL means not yet evaluated as a lead

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'persons' 
AND column_name IN ('lead_status', 'is_notable', 'notable_reason', 'last_lead_update')
ORDER BY column_name;