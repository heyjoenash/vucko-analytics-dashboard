-- Database Relationships Audit
-- This script checks all foreign key relationships and constraints

-- 1. Check if all tables have tenant_id
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND column_name = 'tenant_id'
ORDER BY table_name;

-- 2. Check all foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 3. Check for orphaned records
-- Engagements without posts
SELECT COUNT(*) as orphaned_engagements_no_post
FROM engagements e
LEFT JOIN posts p ON e.post_id = p.id
WHERE p.id IS NULL;

-- Engagements without persons
SELECT COUNT(*) as orphaned_engagements_no_person
FROM engagements e
LEFT JOIN persons p ON e.person_id = p.id
WHERE p.id IS NULL;

-- Deals without persons
SELECT COUNT(*) as orphaned_deals_no_person
FROM deals d
LEFT JOIN persons p ON d.person_id = p.id
WHERE p.id IS NULL;

-- Deals without stages
SELECT COUNT(*) as orphaned_deals_no_stage
FROM deals d
LEFT JOIN pipeline_stages ps ON d.stage_id = ps.id
WHERE ps.id IS NULL;

-- 4. Check unique constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    string_agg(kcu.column_name, ', ') as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- 5. Check indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 6. Verify tenant isolation
-- Check if all main tables have tenant_id = DEFAULT_TENANT_ID
WITH tenant_counts AS (
    SELECT 'persons' as table_name, COUNT(DISTINCT tenant_id) as tenant_count FROM persons
    UNION ALL
    SELECT 'posts', COUNT(DISTINCT tenant_id) FROM posts
    UNION ALL
    SELECT 'engagements', COUNT(DISTINCT tenant_id) FROM engagements
    UNION ALL
    SELECT 'campaigns', COUNT(DISTINCT tenant_id) FROM campaigns WHERE tenant_id IS NOT NULL
    UNION ALL
    SELECT 'campaign_groups', COUNT(DISTINCT tenant_id) FROM campaign_groups WHERE tenant_id IS NOT NULL
    UNION ALL
    SELECT 'deals', COUNT(DISTINCT tenant_id) FROM deals WHERE tenant_id IS NOT NULL
    UNION ALL
    SELECT 'actions', COUNT(DISTINCT tenant_id) FROM actions WHERE tenant_id IS NOT NULL
    UNION ALL
    SELECT 'pipeline_stages', COUNT(DISTINCT tenant_id) FROM pipeline_stages WHERE tenant_id IS NOT NULL
)
SELECT * FROM tenant_counts WHERE tenant_count > 1;

-- 7. Check for missing cascade deletes
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND rc.delete_rule != 'CASCADE'
ORDER BY tc.table_name;

-- 8. Summary of all tables with record counts
SELECT 
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;