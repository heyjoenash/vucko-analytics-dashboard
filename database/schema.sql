-- Complete LinkedIn Campaign Tracking System Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if needed (BE CAREFUL - this will delete data)
-- Uncomment the lines below only if you want to start fresh
-- DROP TABLE IF EXISTS scraping_jobs CASCADE;
-- DROP TABLE IF EXISTS engagements CASCADE;
-- DROP TABLE IF EXISTS campaigns CASCADE;
-- DROP TABLE IF EXISTS audience_segments CASCADE;
-- DROP TABLE IF EXISTS posts CASCADE;
-- DROP TABLE IF EXISTS person_profiles CASCADE;
-- DROP TABLE IF EXISTS linkedin_cookies CASCADE;

-- Posts table (foundation)
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    linkedin_url TEXT UNIQUE, -- Added for consistency
    account_type TEXT DEFAULT 'company',
    account_name TEXT,
    content_preview TEXT,
    posted_date TIMESTAMPTZ DEFAULT NOW(),
    is_organic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Person profiles table (renamed from person_profiles for consistency)
CREATE TABLE IF NOT EXISTS persons (
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    linkedin_url TEXT UNIQUE,
    industry TEXT,
    size_range TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add company reference to persons
ALTER TABLE persons 
ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);

-- Audience segments table
CREATE TABLE IF NOT EXISTS audience_segments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    segment_type TEXT, -- 'company', 'title', 'industry', 'location'
    revenue_filter TEXT,
    title_filters JSONB DEFAULT '[]',
    company_filters JSONB DEFAULT '[]',
    criteria JSONB DEFAULT '{}',
    other_criteria JSONB DEFAULT '{}',
    created_date TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Campaign groups table
CREATE TABLE IF NOT EXISTS campaign_groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    client_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    campaign_group_id INTEGER REFERENCES campaign_groups(id),
    linkedin_campaign_id TEXT UNIQUE,
    name TEXT NOT NULL,
    campaign_type TEXT DEFAULT 'sponsored', -- 'sponsored', 'organic'
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    linkedin_ad_id TEXT UNIQUE,
    ad_name TEXT,
    audience_segment_id TEXT REFERENCES audience_segments(id),
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    spend DECIMAL(10,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagements table
CREATE TABLE IF NOT EXISTS engagements (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    person_id INTEGER REFERENCES persons(id) ON DELETE CASCADE,
    engagement_type TEXT DEFAULT 'reaction', -- 'reaction', 'comment', 'share', 'follow'
    reaction_type TEXT, -- 'like', 'celebrate', 'support', 'love', 'insightful', 'curious'
    comment_text TEXT,
    engaged_at TIMESTAMPTZ DEFAULT NOW(),
    attributed_to_segment_id TEXT REFERENCES audience_segments(id),
    attribution_confidence DECIMAL(3,2) DEFAULT 0.5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, person_id, engagement_type, engaged_at)
);

-- Scraping jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(50) NOT NULL, -- 'reactions', 'profile', 'followers'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    apify_run_id VARCHAR(255),
    post_id INTEGER REFERENCES posts(id),
    profile_url TEXT,
    company_id INTEGER REFERENCES companies(id),
    input_data JSONB,
    result_data JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LinkedIn cookies management (encrypted)
CREATE TABLE IF NOT EXISTS linkedin_cookies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cookie_name VARCHAR(100) NOT NULL,
    encrypted_cookie TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_url ON posts(url);
CREATE INDEX IF NOT EXISTS idx_posts_linkedin_url ON posts(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_persons_linkedin_url ON persons(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_persons_company_id ON persons(company_id);
CREATE INDEX IF NOT EXISTS idx_engagements_post_id ON engagements(post_id);
CREATE INDEX IF NOT EXISTS idx_engagements_person_id ON engagements(person_id);
CREATE INDEX IF NOT EXISTS idx_engagements_engaged_at ON engagements(engaged_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_group_id ON campaigns(campaign_group_id);
CREATE INDEX IF NOT EXISTS idx_ads_campaign_id ON ads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ads_post_id ON ads(post_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_type ON scraping_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_created ON scraping_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_post_id ON scraping_jobs(post_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for scraping_jobs
DROP TRIGGER IF EXISTS update_scraping_jobs_updated_at ON scraping_jobs;
CREATE TRIGGER update_scraping_jobs_updated_at 
BEFORE UPDATE ON scraping_jobs 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Create views for analytics
CREATE OR REPLACE VIEW post_performance AS
SELECT 
    p.id,
    p.url,
    p.linkedin_url,
    p.account_name,
    p.content_preview,
    COUNT(DISTINCT a.id) as ad_count,
    COALESCE(SUM(a.impressions), 0) as total_impressions,
    COALESCE(SUM(a.clicks), 0) as total_clicks,
    COALESCE(SUM(a.spend), 0) as total_spend,
    COUNT(DISTINCT e.id) as total_engagements,
    COUNT(DISTINCT e.person_id) as unique_engagers,
    COUNT(DISTINCT CASE WHEN e.attributed_to_segment_id IS NOT NULL THEN e.person_id END) as targeted_engagers
FROM posts p
LEFT JOIN ads a ON p.id = a.post_id
LEFT JOIN engagements e ON p.id = e.post_id
GROUP BY p.id;

-- Person journey view
CREATE OR REPLACE VIEW person_journey AS
SELECT 
    p.id,
    p.name,
    p.current_company,
    p.current_title,
    p.is_follower,
    p.total_engagements,
    p.engagement_score,
    array_agg(
        json_build_object(
            'post_url', po.linkedin_url,
            'engagement_type', e.engagement_type,
            'reaction_type', e.reaction_type,
            'engaged_at', e.engaged_at,
            'attributed_to_segment', s.name
        ) ORDER BY e.engaged_at
    ) as journey
FROM persons p
JOIN engagements e ON p.id = e.person_id
JOIN posts po ON e.post_id = po.id
LEFT JOIN audience_segments s ON e.attributed_to_segment_id = s.id
GROUP BY p.id;

-- Company engagement summary
CREATE OR REPLACE VIEW company_engagement_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT e.person_id) as unique_engaged_persons,
    COUNT(e.id) as total_engagements,
    COUNT(DISTINCT po.id) as posts_engaged_with,
    AVG(CASE 
        WHEN e.engagement_type = 'reaction' AND e.reaction_type = 'like' THEN 1
        WHEN e.engagement_type = 'reaction' AND e.reaction_type IN ('celebrate', 'support') THEN 2
        WHEN e.engagement_type = 'reaction' AND e.reaction_type IN ('love', 'insightful', 'curious') THEN 3
        WHEN e.engagement_type = 'comment' THEN 4
        WHEN e.engagement_type = 'share' THEN 5
        ELSE 1
    END) as avg_engagement_strength
FROM companies c
JOIN persons p ON p.company_id = c.id
JOIN engagements e ON e.person_id = p.id
JOIN posts po ON e.post_id = po.id
GROUP BY c.id, c.name;

-- Job monitoring view
CREATE OR REPLACE VIEW job_status_summary AS
SELECT 
    job_type,
    status,
    COUNT(*) as job_count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60)::INTEGER as avg_duration_minutes,
    MAX(updated_at) as last_activity
FROM scraping_jobs
GROUP BY job_type, status
ORDER BY job_type, status;

-- Enrichment status view
CREATE OR REPLACE VIEW enrichment_status AS
SELECT 
    COUNT(*) FILTER (WHERE profile_enriched = TRUE) as enriched_profiles,
    COUNT(*) FILTER (WHERE profile_enriched = FALSE) as pending_enrichment,
    COUNT(*) as total_profiles,
    ROUND(100.0 * COUNT(*) FILTER (WHERE profile_enriched = TRUE) / NULLIF(COUNT(*), 0), 2) as enrichment_percentage
FROM persons;

-- Insert default audience segments
INSERT INTO audience_segments (id, name, segment_type, revenue_filter, title_filters, company_filters) VALUES
('1b_creative', '$1B+ Creative Directors', 'title', '1B+', 
 '["creative director", "chief creative", "vp creative", "head of creative", "executive creative director"]'::jsonb, 
 '[]'::jsonb),
('1b_design', '$1B+ Design Leaders', 'title', '1B+', 
 '["design director", "design manager", "head of design", "vp design", "design lead"]'::jsonb, 
 '[]'::jsonb),
('100m_creative', '$100M-1B Creative Leaders', 'title', '100M-1B', 
 '["creative director", "creative manager", "brand director", "creative lead"]'::jsonb, 
 '[]'::jsonb),
('100m_design', '$100M-1B Design Teams', 'title', '100M-1B', 
 '["design manager", "senior designer", "design lead", "product designer", "ux director"]'::jsonb, 
 '[]'::jsonb),
('target_companies', 'Target Company List', 'company', NULL, 
 '[]'::jsonb, 
 '["Google", "Apple", "Meta", "Microsoft", "Amazon", "Netflix", "Spotify", "Airbnb", "Uber", "Intuit", "Adobe", "Salesforce", "Stripe", "Figma", "Canva"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Grant permissions (adjust as needed)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated; 