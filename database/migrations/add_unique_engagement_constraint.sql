-- Add unique constraint to prevent duplicate engagements
-- This ensures a person can only have one engagement of each type per post

-- First, remove any existing duplicates (keep the oldest one)
DELETE FROM engagements e1
WHERE EXISTS (
    SELECT 1 FROM engagements e2
    WHERE e2.post_id = e1.post_id
    AND e2.person_id = e1.person_id  
    AND e2.engagement_type = e1.engagement_type
    AND e2.created_at < e1.created_at
);

-- Add the unique constraint
ALTER TABLE engagements 
ADD CONSTRAINT unique_post_person_engagement 
UNIQUE (post_id, person_id, engagement_type);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_engagements_post_person 
ON engagements(post_id, person_id);

COMMENT ON CONSTRAINT unique_post_person_engagement ON engagements 
IS 'Prevents duplicate engagements - each person can only have one reaction type per post';