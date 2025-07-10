-- Add tenant_id for multi-tenancy support
-- This migration adds tenant_id to all main tables

-- Create a default tenant if needed
DO $$
BEGIN
    -- Insert a default tenant with the required columns
    INSERT INTO tenants (id, name, display_name) 
    VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'Default Tenant')
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Add tenant_id to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Add tenant_id to persons table
ALTER TABLE persons 
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Add tenant_id to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Add tenant_id to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Add tenant_id to campaign_groups table
ALTER TABLE campaign_groups 
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Add tenant_id to audience_segments table
ALTER TABLE audience_segments 
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Add tenant_id to engagements table
ALTER TABLE engagements 
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Add tenant_id to scraping_jobs table
ALTER TABLE scraping_jobs 
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Create indexes for tenant_id
CREATE INDEX IF NOT EXISTS idx_posts_tenant_id ON posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_persons_tenant_id ON persons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagements_tenant_id ON engagements(tenant_id);

-- Update existing NULL tenant_ids to default tenant
UPDATE posts SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
UPDATE persons SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
UPDATE companies SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
UPDATE campaigns SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
UPDATE campaign_groups SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
UPDATE audience_segments SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
UPDATE engagements SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
UPDATE scraping_jobs SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;

-- IMPORTANT: Only set NOT NULL constraint if you want to enforce it
-- For now, we'll keep it nullable to avoid breaking changes
-- ALTER TABLE posts ALTER COLUMN tenant_id SET NOT NULL;

-- Add foreign key constraints (optional)
-- ALTER TABLE posts ADD CONSTRAINT fk_posts_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
-- ALTER TABLE persons ADD CONSTRAINT fk_persons_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
-- ... repeat for other tables

-- Create RLS policies if needed
-- Example for posts table:
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can only see their tenant's posts" ON posts
--     FOR ALL USING (tenant_id = current_setting('app.current_tenant')::UUID);

COMMENT ON COLUMN posts.tenant_id IS 'Tenant ID for multi-tenancy support';
COMMENT ON COLUMN persons.tenant_id IS 'Tenant ID for multi-tenancy support';
COMMENT ON COLUMN companies.tenant_id IS 'Tenant ID for multi-tenancy support';
COMMENT ON COLUMN campaigns.tenant_id IS 'Tenant ID for multi-tenancy support';