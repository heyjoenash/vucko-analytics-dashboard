-- Add tenant_id to existing tables for multi-tenancy support
-- Run this after the main campaign tracking tables migration

-- Add tenant_id to persons table
ALTER TABLE persons 
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Add tenant_id to engagements table  
ALTER TABLE engagements
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Add tenant_id to posts table if it doesn't exist
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::UUID;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_persons_tenant_id ON persons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagements_tenant_id ON engagements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_posts_tenant_id ON posts(tenant_id);

-- Update existing records to have the default tenant_id
UPDATE persons SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
UPDATE engagements SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
UPDATE posts SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;