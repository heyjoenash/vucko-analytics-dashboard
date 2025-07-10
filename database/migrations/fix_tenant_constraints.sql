-- Fix tenant constraints and missing table
-- Run this in Supabase SQL Editor to fix the tenant_id constraint errors

-- 1. Create the missing tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert the default tenant that all migrations reference
INSERT INTO tenants (id, name, display_name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'default', 'Default Tenant')
ON CONFLICT (id) DO NOTHING;

-- 3. Update any NULL tenant_ids in existing tables to use the default tenant
UPDATE posts SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE persons SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE companies SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE campaigns SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE campaign_groups SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE audience_segments SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE engagements SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE scraping_jobs SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE content_calendar SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE custom_audiences SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE post_audiences SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE csv_imports SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- 4. Now make tenant_id NOT NULL (this is what's causing the current errors)
-- We'll do this carefully, table by table
ALTER TABLE posts ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE persons ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE companies ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE campaigns ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE campaign_groups ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE audience_segments ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE engagements ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE scraping_jobs ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE content_calendar ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE custom_audiences ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE post_audiences ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE csv_imports ALTER COLUMN tenant_id SET NOT NULL;

-- 5. Add foreign key constraints (optional but recommended)
-- These ensure data integrity
ALTER TABLE posts ADD CONSTRAINT fk_posts_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE persons ADD CONSTRAINT fk_persons_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE companies ADD CONSTRAINT fk_companies_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE campaigns ADD CONSTRAINT fk_campaigns_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE campaign_groups ADD CONSTRAINT fk_campaign_groups_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE audience_segments ADD CONSTRAINT fk_audience_segments_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE engagements ADD CONSTRAINT fk_engagements_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE scraping_jobs ADD CONSTRAINT fk_scraping_jobs_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE content_calendar ADD CONSTRAINT fk_content_calendar_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE custom_audiences ADD CONSTRAINT fk_custom_audiences_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE post_audiences ADD CONSTRAINT fk_post_audiences_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE csv_imports ADD CONSTRAINT fk_csv_imports_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_tenant ON posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_persons_tenant ON persons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_tenant ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_groups_tenant ON campaign_groups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audience_segments_tenant ON audience_segments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagements_tenant ON engagements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_tenant ON scraping_jobs(tenant_id);

-- 7. Verify the fix
SELECT 'Tenants table created and constraints fixed!' as status;