-- Fix Database Relationships
-- Run this after the audit to fix any issues found

-- 1. Add missing tenant_id columns where needed
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE audience_segments ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';

-- 2. Update all NULL tenant_ids to default
UPDATE persons SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE posts SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE engagements SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE companies SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE campaigns SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE campaign_groups SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE deals SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE actions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE pipeline_stages SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE personas SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE targets SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- 3. Add NOT NULL constraints where missing
ALTER TABLE companies ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE audience_segments ALTER COLUMN tenant_id SET NOT NULL;

-- 4. Clean up orphaned engagements
DELETE FROM engagements e
WHERE NOT EXISTS (SELECT 1 FROM posts p WHERE p.id = e.post_id);

DELETE FROM engagements e
WHERE NOT EXISTS (SELECT 1 FROM persons p WHERE p.id = e.person_id);

-- 5. Clean up orphaned deals
DELETE FROM deals d
WHERE NOT EXISTS (SELECT 1 FROM persons p WHERE p.id = d.person_id);

-- 6. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_engagements_post_person ON engagements(post_id, person_id);
CREATE INDEX IF NOT EXISTS idx_persons_company ON persons(current_company);
CREATE INDEX IF NOT EXISTS idx_persons_engagement_score ON persons(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_posted_date ON posts(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_deals_tenant_stage ON deals(tenant_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_campaign_groups_tenant ON campaign_groups(tenant_id);

-- 7. Add composite unique constraints for tenant isolation
ALTER TABLE personas DROP CONSTRAINT IF EXISTS personas_tenant_id_name_unique;
ALTER TABLE personas ADD CONSTRAINT personas_tenant_id_name_unique UNIQUE (tenant_id, name);

ALTER TABLE pipeline_stages DROP CONSTRAINT IF EXISTS pipeline_stages_tenant_order_unique;
ALTER TABLE pipeline_stages ADD CONSTRAINT pipeline_stages_tenant_order_unique UNIQUE (tenant_id, order_position);

-- 8. Ensure all foreign keys have proper cascade behavior
-- Drop and recreate engagement foreign keys with CASCADE
ALTER TABLE engagements DROP CONSTRAINT IF EXISTS engagements_post_id_fkey;
ALTER TABLE engagements ADD CONSTRAINT engagements_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

ALTER TABLE engagements DROP CONSTRAINT IF EXISTS engagements_person_id_fkey;
ALTER TABLE engagements ADD CONSTRAINT engagements_person_id_fkey 
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE;

-- 9. Add check constraints for data integrity
ALTER TABLE deals ADD CONSTRAINT check_probability 
    CHECK (probability >= 0 AND probability <= 100);

ALTER TABLE persons ADD CONSTRAINT check_engagement_score 
    CHECK (engagement_score >= 0);

-- 10. Create missing views if they don't exist
CREATE OR REPLACE VIEW company_engagement_summary AS
SELECT 
    c.current_company as company_name,
    COUNT(DISTINCT p.id) as person_count,
    SUM(p.engagement_score) as total_engagement_score,
    AVG(p.engagement_score) as avg_engagement_score,
    COUNT(DISTINCT p.id) FILTER (WHERE p.is_follower = true) as follower_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.engagement_score >= 5) as hot_prospects
FROM persons p
WHERE p.current_company IS NOT NULL
    AND p.tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY c.current_company
ORDER BY total_engagement_score DESC;

-- 11. Grant proper permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 12. Refresh statistics for query planner
ANALYZE;