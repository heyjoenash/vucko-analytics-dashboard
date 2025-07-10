-- Query to get people with campaign source information
-- Shows which people came from campaign engagements vs organic

WITH campaign_engagement_data AS (
    -- Find people who engaged with campaign posts
    SELECT DISTINCT
        p.id as person_id,
        p.name,
        p.profile_picture,
        p.headline,
        p.current_company,
        p.current_title,
        p.engagement_score,
        p.is_follower,
        p.linkedin_url,
        lc.name as campaign_name,
        lc.linkedin_campaign_id,
        lc.objective_type,
        lc.total_budget_amount,
        COUNT(DISTINCT e.post_id) as campaign_posts_engaged,
        MIN(e.engaged_at) as first_campaign_engagement
    FROM persons p
    INNER JOIN engagements e ON p.id = e.person_id
    INNER JOIN posts po ON e.post_id = po.id
    INNER JOIN linkedin_campaigns lc ON po.linkedin_campaign_id = lc.linkedin_campaign_id
    WHERE p.tenant_id = '00000000-0000-0000-0000-000000000001'
    GROUP BY p.id, p.name, p.profile_picture, p.headline, p.current_company, 
             p.current_title, p.engagement_score, p.is_follower, p.linkedin_url,
             lc.name, lc.linkedin_campaign_id, lc.objective_type, lc.total_budget_amount
),
acquisition_costs AS (
    -- Calculate acquisition cost per person based on campaign spend
    SELECT
        cd.person_id,
        cd.campaign_name,
        cd.linkedin_campaign_id,
        -- Calculate proportional acquisition cost
        CASE 
            WHEN total_campaign_engagements > 0 
            THEN ROUND((cd.total_budget_amount::numeric / total_campaign_engagements) * cd.campaign_posts_engaged, 2)
            ELSE 0
        END as acquisition_cost
    FROM campaign_engagement_data cd
    LEFT JOIN (
        -- Get total engagements per campaign for cost allocation
        SELECT 
            lc.linkedin_campaign_id,
            COUNT(DISTINCT e.id) as total_campaign_engagements
        FROM linkedin_campaigns lc
        JOIN posts p ON lc.linkedin_campaign_id = p.linkedin_campaign_id
        JOIN engagements e ON p.id = e.post_id
        GROUP BY lc.linkedin_campaign_id
    ) campaign_totals ON cd.linkedin_campaign_id = campaign_totals.linkedin_campaign_id
)
-- Final query combining all data
SELECT DISTINCT
    p.id,
    p.name,
    p.profile_picture,
    p.headline,
    p.current_company,
    p.current_title,
    p.engagement_score,
    p.is_follower,
    p.linkedin_url,
    p.created_at,
    -- Campaign source data
    CASE 
        WHEN cd.person_id IS NOT NULL THEN true
        ELSE false
    END as is_campaign_sourced,
    cd.campaign_name,
    cd.objective_type as campaign_objective,
    cd.campaign_posts_engaged,
    cd.first_campaign_engagement,
    ac.acquisition_cost,
    -- Determine primary source
    CASE 
        WHEN cd.person_id IS NOT NULL THEN 'Campaign: ' || cd.campaign_name
        ELSE 'Organic'
    END as source_label,
    -- Source type for filtering
    CASE 
        WHEN cd.person_id IS NOT NULL THEN 'campaign'
        ELSE 'organic'
    END as source_type
FROM persons p
LEFT JOIN campaign_engagement_data cd ON p.id = cd.person_id
LEFT JOIN acquisition_costs ac ON p.id = ac.person_id
WHERE p.tenant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY p.engagement_score DESC, p.name;

-- Create view for easy access
CREATE OR REPLACE VIEW people_with_campaign_source AS
WITH campaign_engagement_data AS (
    SELECT DISTINCT
        p.id as person_id,
        p.name,
        p.profile_picture,
        p.headline,
        p.current_company,
        p.current_title,
        p.engagement_score,
        p.is_follower,
        p.linkedin_url,
        lc.name as campaign_name,
        lc.linkedin_campaign_id,
        lc.objective_type,
        lc.total_budget_amount,
        COUNT(DISTINCT e.post_id) as campaign_posts_engaged,
        MIN(e.engaged_at) as first_campaign_engagement
    FROM persons p
    INNER JOIN engagements e ON p.id = e.person_id
    INNER JOIN posts po ON e.post_id = po.id
    INNER JOIN linkedin_campaigns lc ON po.linkedin_campaign_id = lc.linkedin_campaign_id
    WHERE p.tenant_id = '00000000-0000-0000-0000-000000000001'
    GROUP BY p.id, p.name, p.profile_picture, p.headline, p.current_company, 
             p.current_title, p.engagement_score, p.is_follower, p.linkedin_url,
             lc.name, lc.linkedin_campaign_id, lc.objective_type, lc.total_budget_amount
),
acquisition_costs AS (
    SELECT
        cd.person_id,
        cd.campaign_name,
        cd.linkedin_campaign_id,
        CASE 
            WHEN total_campaign_engagements > 0 
            THEN ROUND((cd.total_budget_amount::numeric / total_campaign_engagements) * cd.campaign_posts_engaged, 2)
            ELSE 0
        END as acquisition_cost
    FROM campaign_engagement_data cd
    LEFT JOIN (
        SELECT 
            lc.linkedin_campaign_id,
            COUNT(DISTINCT e.id) as total_campaign_engagements
        FROM linkedin_campaigns lc
        JOIN posts p ON lc.linkedin_campaign_id = p.linkedin_campaign_id
        JOIN engagements e ON p.id = e.post_id
        GROUP BY lc.linkedin_campaign_id
    ) campaign_totals ON cd.linkedin_campaign_id = campaign_totals.linkedin_campaign_id
)
SELECT DISTINCT
    p.id,
    p.name,
    p.profile_picture,
    p.headline,
    p.current_company,
    p.current_title,
    p.engagement_score,
    p.is_follower,
    p.linkedin_url,
    p.created_at,
    CASE 
        WHEN cd.person_id IS NOT NULL THEN true
        ELSE false
    END as is_campaign_sourced,
    cd.campaign_name,
    cd.objective_type as campaign_objective,
    cd.campaign_posts_engaged,
    cd.first_campaign_engagement,
    ac.acquisition_cost,
    CASE 
        WHEN cd.person_id IS NOT NULL THEN 'Campaign: ' || cd.campaign_name
        ELSE 'Organic'
    END as source_label,
    CASE 
        WHEN cd.person_id IS NOT NULL THEN 'campaign'
        ELSE 'organic'
    END as source_type
FROM persons p
LEFT JOIN campaign_engagement_data cd ON p.id = cd.person_id
LEFT JOIN acquisition_costs ac ON p.id = ac.person_id
WHERE p.tenant_id = '00000000-0000-0000-0000-000000000001';