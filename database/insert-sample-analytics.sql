-- Insert sample analytics data for testing
-- This simulates what the LinkedIn API would return

-- First ensure the campaigns exist
INSERT INTO linkedin_campaigns (
    linkedin_campaign_id,
    linkedin_account_id,
    name,
    status,
    tenant_id
) VALUES 
    (751420716, 510508147, 'Vucko Q2 2025 - Tech Leaders', 'ACTIVE', '00000000-0000-0000-0000-000000000001'),
    (751420936, 510508147, 'Vucko Q2 2025 - Product Teams', 'ACTIVE', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (linkedin_campaign_id) DO NOTHING;

-- Insert analytics data for campaign 751420716 (Tech Leaders)
INSERT INTO linkedin_campaign_analytics (
    linkedin_campaign_id, pivot_type, pivot_value, impressions, clicks, spend, cost_in_usd, tenant_id
) VALUES 
-- Companies
(751420716, 'COMPANY', 'Microsoft', 5420, 234, 1250.50, 1250.50, '00000000-0000-0000-0000-000000000001'),
(751420716, 'COMPANY', 'Google', 4832, 198, 1100.25, 1100.25, '00000000-0000-0000-0000-000000000001'),
(751420716, 'COMPANY', 'Amazon', 4156, 167, 950.75, 950.75, '00000000-0000-0000-0000-000000000001'),
(751420716, 'COMPANY', 'Meta', 3845, 145, 875.40, 875.40, '00000000-0000-0000-0000-000000000001'),
(751420716, 'COMPANY', 'Apple', 3234, 132, 750.60, 750.60, '00000000-0000-0000-0000-000000000001'),
-- Job Titles
(751420716, 'JOB_TITLE', 'Engineering Manager', 3456, 178, 825.30, 825.30, '00000000-0000-0000-0000-000000000001'),
(751420716, 'JOB_TITLE', 'Technical Lead', 2987, 145, 712.80, 712.80, '00000000-0000-0000-0000-000000000001'),
(751420716, 'JOB_TITLE', 'Software Architect', 2543, 124, 615.45, 615.45, '00000000-0000-0000-0000-000000000001'),
(751420716, 'JOB_TITLE', 'CTO', 2234, 98, 545.20, 545.20, '00000000-0000-0000-0000-000000000001'),
-- Industries
(751420716, 'INDUSTRY', 'Computer Software', 7654, 312, 1875.80, 1875.80, '00000000-0000-0000-0000-000000000001'),
(751420716, 'INDUSTRY', 'Information Technology', 5432, 234, 1320.50, 1320.50, '00000000-0000-0000-0000-000000000001'),
(751420716, 'INDUSTRY', 'Internet', 4321, 187, 1050.25, 1050.25, '00000000-0000-0000-0000-000000000001'),
-- Seniority
(751420716, 'SENIORITY', 'Director', 8765, 354, 2100.75, 2100.75, '00000000-0000-0000-0000-000000000001'),
(751420716, 'SENIORITY', 'VP', 6543, 287, 1650.40, 1650.40, '00000000-0000-0000-0000-000000000001'),
(751420716, 'SENIORITY', 'CXO', 4321, 198, 1025.60, 1025.60, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (linkedin_campaign_id, pivot_type, pivot_value, date_range_start, tenant_id) DO NOTHING;

-- Insert analytics data for campaign 751420936 (Product Teams)
INSERT INTO linkedin_campaign_analytics (
    linkedin_campaign_id, pivot_type, pivot_value, impressions, clicks, spend, cost_in_usd, tenant_id
) VALUES 
-- Companies
(751420936, 'COMPANY', 'Salesforce', 4820, 214, 1150.50, 1150.50, '00000000-0000-0000-0000-000000000001'),
(751420936, 'COMPANY', 'Adobe', 4232, 178, 1000.25, 1000.25, '00000000-0000-0000-0000-000000000001'),
(751420936, 'COMPANY', 'Slack', 3956, 157, 850.75, 850.75, '00000000-0000-0000-0000-000000000001'),
(751420936, 'COMPANY', 'Atlassian', 3445, 135, 775.40, 775.40, '00000000-0000-0000-0000-000000000001'),
-- Job Titles
(751420936, 'JOB_TITLE', 'Product Manager', 4156, 198, 925.30, 925.30, '00000000-0000-0000-0000-000000000001'),
(751420936, 'JOB_TITLE', 'Senior Product Manager', 3287, 155, 812.80, 812.80, '00000000-0000-0000-0000-000000000001'),
(751420936, 'JOB_TITLE', 'VP of Product', 2843, 134, 715.45, 715.45, '00000000-0000-0000-0000-000000000001'),
(751420936, 'JOB_TITLE', 'Product Designer', 2434, 108, 645.20, 645.20, '00000000-0000-0000-0000-000000000001'),
-- Industries
(751420936, 'INDUSTRY', 'Computer Software', 6854, 292, 1675.80, 1675.80, '00000000-0000-0000-0000-000000000001'),
(751420936, 'INDUSTRY', 'Design', 4832, 214, 1220.50, 1220.50, '00000000-0000-0000-0000-000000000001'),
(751420936, 'INDUSTRY', 'Marketing', 3821, 167, 950.25, 950.25, '00000000-0000-0000-0000-000000000001'),
-- Seniority
(751420936, 'SENIORITY', 'Mid-Senior level', 7965, 324, 2000.75, 2000.75, '00000000-0000-0000-0000-000000000001'),
(751420936, 'SENIORITY', 'Senior level', 5843, 267, 1550.40, 1550.40, '00000000-0000-0000-0000-000000000001'),
(751420936, 'SENIORITY', 'Manager', 3721, 178, 925.60, 925.60, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (linkedin_campaign_id, pivot_type, pivot_value, date_range_start, tenant_id) DO NOTHING;

-- Verify the data
SELECT 
    linkedin_campaign_id,
    pivot_type,
    COUNT(*) as records,
    SUM(impressions) as total_impressions,
    SUM(spend) as total_spend
FROM linkedin_campaign_analytics
WHERE linkedin_campaign_id IN (751420716, 751420936)
GROUP BY linkedin_campaign_id, pivot_type
ORDER BY linkedin_campaign_id, pivot_type;