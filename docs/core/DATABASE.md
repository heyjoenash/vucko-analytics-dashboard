# Database Schema & Data Model

## 🗄️ Database Overview

**Signals & Actions** uses PostgreSQL via Supabase with a multi-tenant architecture designed for LinkedIn engagement analytics and CRM pipeline management.

### Key Characteristics
- **Platform**: Supabase (hosted PostgreSQL)
- **Multi-tenancy**: All tables include `tenant_id` UUID
- **Default Tenant**: `00000000-0000-0000-0000-000000000001`
- **Schema**: Normalized design with proper foreign key relationships

## 📊 Core Tables

### 1. Posts Table
LinkedIn posts being tracked for engagement analytics.

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    linkedin_url TEXT UNIQUE,
    account_type TEXT DEFAULT 'company',
    account_name TEXT,
    content_preview TEXT,
    posted_date TIMESTAMPTZ DEFAULT NOW(),
    is_organic BOOLEAN DEFAULT FALSE,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields**:
- `url`: Original LinkedIn post URL
- `linkedin_url`: Normalized LinkedIn URL
- `account_name`: Company/person who posted
- `is_organic`: true for organic posts, false for sponsored

### 2. Persons Table
Individual LinkedIn users who engage with tracked posts.

```sql
CREATE TABLE persons (
    id SERIAL PRIMARY KEY,
    linkedin_url TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    headline TEXT,
    profile_picture TEXT,
    current_company TEXT,
    company_linkedin_url TEXT,
    current_title TEXT,
    job_title TEXT,
    location TEXT,
    connections INTEGER,
    about TEXT,
    experience JSONB,
    education JSONB,
    skills JSONB,
    is_follower BOOLEAN DEFAULT FALSE,
    follower_date TIMESTAMPTZ,
    total_engagements INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    profile_enriched BOOLEAN DEFAULT FALSE,
    enriched_at TIMESTAMPTZ,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields**:
- `engagement_score`: Calculated score based on engagement frequency/type
- `is_follower`: Whether person follows the tracked account
- `profile_enriched`: Whether additional data has been scraped
- `experience/education/skills`: JSONB for flexible profile data

### 3. Companies Table
Companies aggregated from person profiles.

```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    linkedin_url TEXT UNIQUE,
    industry TEXT,
    size_range TEXT,
    location TEXT,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Engagements Table
Individual interactions (likes, comments, shares) with posts.

```sql
CREATE TABLE engagements (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
    engagement_type TEXT DEFAULT 'reaction',
    reaction_type TEXT,
    comment_text TEXT,
    engaged_at TIMESTAMPTZ DEFAULT NOW(),
    attributed_to_segment_id TEXT REFERENCES audience_segments(id),
    attribution_confidence DECIMAL(3,2) DEFAULT 0.5,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, person_id, engagement_type, engaged_at)
);
```

**Engagement Types**:
- `reaction`: like, celebrate, support, love, insightful, curious
- `comment`: text comments
- `share`: post shares
- `follow`: new followers

### 5. Campaigns Table
LinkedIn advertising campaigns for tracking paid performance.

```sql
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    campaign_group_id INTEGER REFERENCES campaign_groups(id),
    linkedin_campaign_id TEXT UNIQUE,
    name TEXT NOT NULL,
    campaign_type TEXT DEFAULT 'sponsored',
    status TEXT DEFAULT 'active',
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Audience Segments Table
Targeting criteria for campaigns and analysis.

```sql
CREATE TABLE audience_segments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    segment_type TEXT,
    revenue_filter TEXT,
    title_filters JSONB DEFAULT '[]',
    company_filters JSONB DEFAULT '[]',
    criteria JSONB DEFAULT '{}',
    other_criteria JSONB DEFAULT '{}',
    tenant_id UUID NOT NULL,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

## 🔗 Relationships & Foreign Keys

### Primary Relationships
```
posts (1) ──── (many) engagements
persons (1) ──── (many) engagements
companies (1) ──── (many) persons
campaigns (1) ──── (many) posts (via ads table)
audience_segments (1) ──── (many) engagements
```

### Reference Integrity
- All foreign keys use `ON DELETE CASCADE` for clean data removal
- Unique constraints prevent duplicate engagements
- Multi-column indexes for performance on joins

## 📈 Analytics Views

### 1. Post Performance View
Pre-computed metrics for each post.

```sql
CREATE OR REPLACE VIEW post_performance AS
SELECT 
    p.id,
    p.url,
    p.account_name,
    COUNT(DISTINCT e.id) as total_engagements,
    COUNT(DISTINCT e.person_id) as unique_engagers,
    COUNT(DISTINCT CASE WHEN e.engagement_type = 'reaction' THEN e.id END) as reactions,
    COUNT(DISTINCT CASE WHEN e.engagement_type = 'comment' THEN e.id END) as comments,
    COUNT(DISTINCT CASE WHEN e.engagement_type = 'share' THEN e.id END) as shares
FROM posts p
LEFT JOIN engagements e ON p.id = e.post_id
GROUP BY p.id;
```

### 2. Company Engagement Summary
Aggregated company-level engagement data.

```sql
CREATE OR REPLACE VIEW company_engagement_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT e.person_id) as unique_engaged_persons,
    COUNT(e.id) as total_engagements,
    AVG(engagement_strength) as avg_engagement_strength
FROM companies c
JOIN persons p ON p.current_company = c.name
JOIN engagements e ON e.person_id = p.id
GROUP BY c.id, c.name;
```

### 3. Person Journey View
Complete engagement history per person.

```sql
CREATE OR REPLACE VIEW person_journey AS
SELECT 
    p.id,
    p.name,
    p.current_company,
    array_agg(
        json_build_object(
            'post_url', po.url,
            'engagement_type', e.engagement_type,
            'engaged_at', e.engaged_at
        ) ORDER BY e.engaged_at
    ) as journey
FROM persons p
JOIN engagements e ON p.id = e.person_id
JOIN posts po ON e.post_id = po.id
GROUP BY p.id;
```

## 🗃️ Data Migration Strategy

### Migration Files Structure
```
database/migrations/
├── 001_add_person_enhancements.sql    # Additional person fields
├── 002_create_personas_tables.sql     # User-defined personas
├── 003_fix_orphaned_engagements.sql   # Data cleanup
├── 004_linkedin_integration_schema.sql # Campaign integration
└── fix_tenant_constraints.sql         # Tenant ID fixes
```

### Running Migrations
```sql
-- 1. Connect to Supabase SQL Editor
-- 2. Run each migration file in order
-- 3. Verify with: SELECT * FROM information_schema.tables;
```

### Critical Migration: Tenant Setup
```sql
-- Create tenants table (required for constraints)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tenant
INSERT INTO tenants (id, name) VALUES 
('00000000-0000-0000-0000-000000000001', 'Default Tenant')
ON CONFLICT (id) DO NOTHING;
```

## 📊 Data Quality & Constraints

### Unique Constraints
```sql
-- Prevent duplicate engagements
UNIQUE(post_id, person_id, engagement_type, engaged_at)

-- Ensure unique LinkedIn URLs
UNIQUE(linkedin_url) ON persons
UNIQUE(url) ON posts
```

### Data Validation
- **Required Fields**: All tables require tenant_id
- **Timestamps**: Automatic created_at, updated_at triggers
- **JSONB Validation**: Structured data for flexible fields
- **Foreign Key Cascades**: Clean deletion of related records

## 🔍 Query Patterns

### Common Queries

#### Get Top Engaging Companies
```sql
SELECT 
    c.name,
    COUNT(DISTINCT p.id) as unique_people,
    COUNT(e.id) as total_engagements
FROM companies c
JOIN persons p ON p.current_company = c.name
JOIN engagements e ON e.person_id = p.id
WHERE c.tenant_id = $1
GROUP BY c.id, c.name
ORDER BY total_engagements DESC
LIMIT 10;
```

#### Find High-Value Prospects
```sql
SELECT 
    p.name,
    p.current_company,
    p.current_title,
    p.engagement_score,
    COUNT(e.id) as recent_engagements
FROM persons p
LEFT JOIN engagements e ON p.id = e.person_id 
    AND e.created_at > NOW() - INTERVAL '30 days'
WHERE p.tenant_id = $1
    AND p.engagement_score >= 5
GROUP BY p.id
ORDER BY p.engagement_score DESC, recent_engagements DESC;
```

#### Post Performance Analysis
```sql
SELECT 
    p.url,
    p.account_name,
    COUNT(DISTINCT e.person_id) as unique_engagers,
    COUNT(e.id) as total_engagements,
    COUNT(CASE WHEN e.engagement_type = 'reaction' THEN 1 END) as reactions,
    COUNT(CASE WHEN e.engagement_type = 'comment' THEN 1 END) as comments
FROM posts p
LEFT JOIN engagements e ON p.id = e.post_id
WHERE p.tenant_id = $1
GROUP BY p.id
ORDER BY total_engagements DESC;
```

## 🛠️ Database Maintenance

### Performance Optimization
```sql
-- Key indexes for performance
CREATE INDEX idx_engagements_person_id ON engagements(person_id);
CREATE INDEX idx_engagements_post_id ON engagements(post_id);
CREATE INDEX idx_engagements_engaged_at ON engagements(engaged_at);
CREATE INDEX idx_persons_company ON persons(current_company);
CREATE INDEX idx_persons_tenant ON persons(tenant_id);
```

### Data Cleanup Utilities
```sql
-- Remove orphaned engagements
DELETE FROM engagements 
WHERE person_id NOT IN (SELECT id FROM persons);

-- Update engagement scores
UPDATE persons SET engagement_score = (
    SELECT COUNT(*) FROM engagements 
    WHERE person_id = persons.id
);
```

### Backup Strategy
- **Supabase**: Automatic daily backups
- **Export**: Regular CSV exports for critical data
- **Migration History**: All schema changes tracked in Git

This database design provides a robust foundation for LinkedIn engagement analytics while maintaining flexibility for future feature additions and performance optimization.