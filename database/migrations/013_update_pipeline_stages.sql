-- Migration: Update Pipeline Stages to Match Vucko Workflow
-- This updates the pipeline stages to match the actual outreach workflow

-- First, delete the old stages
DELETE FROM pipeline_stages WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Insert new pipeline stages that match the Vucko workflow
INSERT INTO pipeline_stages (name, order_position, color, tenant_id) VALUES
    ('Are we connected?', 1, '#gray-400', '00000000-0000-0000-0000-000000000001'),
    ('DM sent', 2, '#gray-500', '00000000-0000-0000-0000-000000000001'),
    ('Sticky content sent', 3, '#gray-600', '00000000-0000-0000-0000-000000000001'),
    ('Introduction meeting', 4, '#gray-700', '00000000-0000-0000-0000-000000000001'),
    ('Status tracking', 5, '#gray-800', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (tenant_id, order_position) DO UPDATE
SET name = EXCLUDED.name,
    color = EXCLUDED.color;

-- Add description column to pipeline_stages to explain each stage
ALTER TABLE pipeline_stages ADD COLUMN IF NOT EXISTS description TEXT;

-- Update descriptions for clarity
UPDATE pipeline_stages 
SET description = CASE
    WHEN name = 'Are we connected?' THEN 'Check LinkedIn connection status'
    WHEN name = 'DM sent' THEN '10-word compliment about recent project'
    WHEN name = 'Sticky content sent' THEN 'Non-public content relevant to them'
    WHEN name = 'Introduction meeting' THEN 'Schedule and conduct intro meeting'
    WHEN name = 'Status tracking' THEN 'Ongoing interaction tracking with dates'
END
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Add stage-specific metadata to deals table for better tracking
ALTER TABLE deals ADD COLUMN IF NOT EXISTS stage_metadata JSONB DEFAULT '{}';
-- Example metadata:
-- {
--   "connection_sent_date": "2025-01-16",
--   "dm_sent_date": "2025-01-17",
--   "dm_content": "Love your recent work on...",
--   "sticky_content_sent": "Enterprise AI whitepaper",
--   "meeting_scheduled": "2025-01-25",
--   "interaction_log": [...]
-- }

-- Add action templates for common actions at each stage
CREATE TABLE IF NOT EXISTS action_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stage_id UUID REFERENCES pipeline_stages(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    action_type VARCHAR(50) NOT NULL,
    template_content TEXT,
    order_position INTEGER DEFAULT 0,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default action templates
INSERT INTO action_templates (stage_id, title, description, action_type, template_content, order_position, tenant_id)
SELECT 
    ps.id,
    CASE ps.name
        WHEN 'Are we connected?' THEN 'Send connection request'
        WHEN 'DM sent' THEN 'Send compliment DM'
        WHEN 'Sticky content sent' THEN 'Share valuable content'
        WHEN 'Introduction meeting' THEN 'Schedule intro call'
        WHEN 'Status tracking' THEN 'Log interaction'
    END,
    CASE ps.name
        WHEN 'Are we connected?' THEN 'Send personalized LinkedIn connection request'
        WHEN 'DM sent' THEN 'Send 10-word compliment about their recent work'
        WHEN 'Sticky content sent' THEN 'Share non-public content relevant to their interests'
        WHEN 'Introduction meeting' THEN 'Schedule 30-minute introduction call'
        WHEN 'Status tracking' THEN 'Log interaction details and next steps'
    END,
    CASE ps.name
        WHEN 'Are we connected?' THEN 'linkedin_connect'
        WHEN 'DM sent' THEN 'linkedin_message'
        WHEN 'Sticky content sent' THEN 'linkedin_message'
        WHEN 'Introduction meeting' THEN 'meeting'
        WHEN 'Status tracking' THEN 'follow_up'
    END,
    CASE ps.name
        WHEN 'Are we connected?' THEN 'Hi [Name], I came across your work on [specific project/post] and was impressed by [specific detail]. Would love to connect and learn more about your approach to [relevant topic].'
        WHEN 'DM sent' THEN 'Just saw your [specific work] - [genuine 10-word compliment]!'
        WHEN 'Sticky content sent' THEN 'Thought you might find this [resource] valuable given your work on [topic]. [Link or attachment]'
        WHEN 'Introduction meeting' THEN 'Would you be open to a brief call to discuss [specific value prop]? I have some insights on [their challenge] that might be helpful.'
        WHEN 'Status tracking' THEN 'Next steps: [action items]'
    END,
    ps.order_position,
    ps.tenant_id
FROM pipeline_stages ps
WHERE ps.tenant_id = '00000000-0000-0000-0000-000000000001';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_action_templates_stage ON action_templates(stage_id);

-- Grant permissions
GRANT ALL ON action_templates TO authenticated;