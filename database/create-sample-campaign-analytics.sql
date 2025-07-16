-- Create sample campaign analytics data for testing
-- This data represents realistic LinkedIn campaign performance metrics

-- Insert sample analytics for campaign 255144676 (Vucko.co Website Relaunch)
INSERT INTO campaign_analytics (campaign_id, metric_type, metric_value, pivot_type, pivot_value, date_recorded, tenant_id)
VALUES 
-- Company demographics
(255144676, 'impressions', 5420, 'MEMBER_COMPANY', 'Microsoft', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'clicks', 234, 'MEMBER_COMPANY', 'Microsoft', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'spend', 1250.50, 'MEMBER_COMPANY', 'Microsoft', NOW(), '00000000-0000-0000-0000-000000000001'),

(255144676, 'impressions', 4832, 'MEMBER_COMPANY', 'Google', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'clicks', 198, 'MEMBER_COMPANY', 'Google', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'spend', 1100.25, 'MEMBER_COMPANY', 'Google', NOW(), '00000000-0000-0000-0000-000000000001'),

(255144676, 'impressions', 4156, 'MEMBER_COMPANY', 'Amazon', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'clicks', 167, 'MEMBER_COMPANY', 'Amazon', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'spend', 950.75, 'MEMBER_COMPANY', 'Amazon', NOW(), '00000000-0000-0000-0000-000000000001'),

-- Job title demographics
(255144676, 'impressions', 3456, 'MEMBER_JOB_TITLE', 'Software Engineer', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'clicks', 178, 'MEMBER_JOB_TITLE', 'Software Engineer', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'spend', 825.30, 'MEMBER_JOB_TITLE', 'Software Engineer', NOW(), '00000000-0000-0000-0000-000000000001'),

(255144676, 'impressions', 2987, 'MEMBER_JOB_TITLE', 'Product Manager', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'clicks', 145, 'MEMBER_JOB_TITLE', 'Product Manager', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'spend', 712.80, 'MEMBER_JOB_TITLE', 'Product Manager', NOW(), '00000000-0000-0000-0000-000000000001'),

-- Seniority demographics
(255144676, 'impressions', 8765, 'MEMBER_SENIORITY', 'Mid-Senior level', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'clicks', 354, 'MEMBER_SENIORITY', 'Mid-Senior level', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'spend', 2100.75, 'MEMBER_SENIORITY', 'Mid-Senior level', NOW(), '00000000-0000-0000-0000-000000000001'),

(255144676, 'impressions', 6543, 'MEMBER_SENIORITY', 'Senior level', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'clicks', 287, 'MEMBER_SENIORITY', 'Senior level', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'spend', 1650.40, 'MEMBER_SENIORITY', 'Senior level', NOW(), '00000000-0000-0000-0000-000000000001'),

-- Industry demographics
(255144676, 'impressions', 7654, 'MEMBER_INDUSTRY', 'Computer Software', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'clicks', 312, 'MEMBER_INDUSTRY', 'Computer Software', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'spend', 1875.80, 'MEMBER_INDUSTRY', 'Computer Software', NOW(), '00000000-0000-0000-0000-000000000001'),

(255144676, 'impressions', 5432, 'MEMBER_INDUSTRY', 'Information Technology', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'clicks', 234, 'MEMBER_INDUSTRY', 'Information Technology', NOW(), '00000000-0000-0000-0000-000000000001'),
(255144676, 'spend', 1320.50, 'MEMBER_INDUSTRY', 'Information Technology', NOW(), '00000000-0000-0000-0000-000000000001');

-- Insert sample analytics for campaign 255703466 (Future of Motion)
INSERT INTO campaign_analytics (campaign_id, metric_type, metric_value, pivot_type, pivot_value, date_recorded, tenant_id)
VALUES 
-- Company demographics
(255703466, 'impressions', 3210, 'MEMBER_COMPANY', 'Meta', NOW(), '00000000-0000-0000-0000-000000000001'),
(255703466, 'clicks', 156, 'MEMBER_COMPANY', 'Meta', NOW(), '00000000-0000-0000-0000-000000000001'),
(255703466, 'spend', 780.25, 'MEMBER_COMPANY', 'Meta', NOW(), '00000000-0000-0000-0000-000000000001'),

(255703466, 'impressions', 2987, 'MEMBER_COMPANY', 'Apple', NOW(), '00000000-0000-0000-0000-000000000001'),
(255703466, 'clicks', 132, 'MEMBER_COMPANY', 'Apple', NOW(), '00000000-0000-0000-0000-000000000001'),
(255703466, 'spend', 650.50, 'MEMBER_COMPANY', 'Apple', NOW(), '00000000-0000-0000-0000-000000000001'),

-- Job title demographics
(255703466, 'impressions', 2543, 'MEMBER_JOB_TITLE', 'Engineering Manager', NOW(), '00000000-0000-0000-0000-000000000001'),
(255703466, 'clicks', 124, 'MEMBER_JOB_TITLE', 'Engineering Manager', NOW(), '00000000-0000-0000-0000-000000000001'),
(255703466, 'spend', 615.45, 'MEMBER_JOB_TITLE', 'Engineering Manager', NOW(), '00000000-0000-0000-0000-000000000001');

-- Verify the data
SELECT 
    ca.campaign_id,
    c.name as campaign_name,
    ca.pivot_type,
    ca.pivot_value,
    ca.metric_type,
    ca.metric_value
FROM campaign_analytics ca
JOIN campaigns c ON ca.campaign_id = c.linkedin_campaign_id
ORDER BY ca.campaign_id, ca.pivot_type, ca.metric_value DESC;