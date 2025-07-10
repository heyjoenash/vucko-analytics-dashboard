-- Add campaign-persona integration views and functions
-- This migration creates comprehensive views and functions for campaign management

-- Create view to show campaign performance by persona
CREATE OR REPLACE VIEW campaign_performance_by_persona AS
WITH persona_engagements AS (
    SELECT 
        t.persona_id,
        p.name as persona_name,
        e.post_id,
        e.engagement_type,
        e.reaction_type,
        e.engaged_at,
        po.campaign_id,
        po.linkedin_url as post_url
    FROM engagements e
    JOIN persons per ON e.person_id = per.id
    JOIN targets t ON t.person_id = per.id
    JOIN personas p ON p.id = t.persona_id
    JOIN posts po ON e.post_id = po.id
    WHERE t.is_active = true AND p.is_active = true
)
SELECT 
    pe.persona_id,
    pe.persona_name,
    c.id as campaign_id,
    c.name as campaign_name,
    cg.name as campaign_group_name,
    COUNT(DISTINCT pe.post_id) as posts_engaged,
    COUNT(*) as total_engagements,
    COUNT(DISTINCT CASE WHEN pe.engagement_type = 'reaction' THEN pe.post_id END) as posts_with_reactions,
    COUNT(DISTINCT CASE WHEN pe.engagement_type = 'comment' THEN pe.post_id END) as posts_with_comments,
    COUNT(DISTINCT CASE WHEN pe.engagement_type = 'share' THEN pe.post_id END) as posts_with_shares,
    -- Reaction breakdown
    COUNT(CASE WHEN pe.reaction_type = 'like' THEN 1 END) as likes,
    COUNT(CASE WHEN pe.reaction_type IN ('celebrate', 'support', 'love') THEN 1 END) as positive_reactions,
    COUNT(CASE WHEN pe.reaction_type IN ('insightful', 'curious') THEN 1 END) as thoughtful_reactions,
    -- Engagement score
    SUM(CASE 
        WHEN pe.engagement_type = 'share' THEN 5
        WHEN pe.engagement_type = 'comment' THEN 3
        WHEN pe.reaction_type IN ('love', 'insightful', 'curious') THEN 2
        ELSE 1
    END) as weighted_engagement_score
FROM persona_engagements pe
JOIN ads a ON a.post_id = pe.post_id
JOIN campaigns c ON c.id = a.campaign_id
LEFT JOIN campaign_groups cg ON c.campaign_group_id = cg.id
GROUP BY pe.persona_id, pe.persona_name, c.id, c.name, cg.name
ORDER BY weighted_engagement_score DESC;

-- Create function to auto-match new people to personas
CREATE OR REPLACE FUNCTION auto_match_new_people_to_personas()
RETURNS TRIGGER AS $$
DECLARE
    v_match RECORD;
BEGIN
    -- Skip if person already has matches
    IF EXISTS (SELECT 1 FROM targets WHERE person_id = NEW.id) THEN
        RETURN NEW;
    END IF;
    
    -- Find matching personas
    FOR v_match IN SELECT * FROM match_person_to_personas(NEW.id) LOOP
        INSERT INTO targets (
            tenant_id,
            person_id,
            persona_id,
            match_score,
            match_criteria,
            is_active,
            manually_added
        ) VALUES (
            NEW.tenant_id,
            NEW.id,
            v_match.persona_id,
            v_match.match_score,
            v_match.match_criteria,
            true,
            false
        ) ON CONFLICT (tenant_id, person_id, persona_id) DO NOTHING;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-matching
DROP TRIGGER IF EXISTS auto_match_personas_on_person_insert ON persons;
CREATE TRIGGER auto_match_personas_on_person_insert
AFTER INSERT ON persons
FOR EACH ROW
EXECUTE FUNCTION auto_match_new_people_to_personas();

-- Create trigger to update campaign metrics when engagements are added
CREATE OR REPLACE FUNCTION update_campaign_metrics_on_engagement()
RETURNS TRIGGER AS $$
DECLARE
    v_campaign_id INTEGER;
    v_metrics JSONB;
BEGIN
    -- Get campaign ID from the post
    SELECT a.campaign_id INTO v_campaign_id
    FROM ads a
    WHERE a.post_id = NEW.post_id
    LIMIT 1;
    
    IF v_campaign_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Calculate updated metrics
    WITH campaign_stats AS (
        SELECT 
            COUNT(DISTINCT e.id) as total_engagements,
            COUNT(DISTINCT e.person_id) as unique_engagers,
            COUNT(DISTINCT CASE WHEN e.engagement_type = 'reaction' THEN e.id END) as reactions,
            COUNT(DISTINCT CASE WHEN e.engagement_type = 'comment' THEN e.id END) as comments,
            COUNT(DISTINCT CASE WHEN e.engagement_type = 'share' THEN e.id END) as shares,
            COUNT(DISTINCT CASE WHEN per.is_follower = true THEN e.person_id END) as follower_engagers,
            COUNT(DISTINCT CASE WHEN t.persona_id IS NOT NULL THEN e.person_id END) as targeted_engagers
        FROM engagements e
        JOIN persons per ON e.person_id = per.id
        LEFT JOIN targets t ON t.person_id = per.id AND t.is_active = true
        JOIN ads a ON a.post_id = e.post_id
        WHERE a.campaign_id = v_campaign_id
    )
    SELECT jsonb_build_object(
        'total_engagements', total_engagements,
        'unique_engagers', unique_engagers,
        'reactions', reactions,
        'comments', comments,
        'shares', shares,
        'follower_engagers', follower_engagers,
        'targeted_engagers', targeted_engagers,
        'last_updated', NOW()
    ) INTO v_metrics
    FROM campaign_stats;
    
    -- Update campaign with new metrics
    UPDATE campaigns
    SET actual_metrics = actual_metrics || v_metrics
    WHERE id = v_campaign_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for engagement metrics
DROP TRIGGER IF EXISTS update_campaign_metrics_trigger ON engagements;
CREATE TRIGGER update_campaign_metrics_trigger
AFTER INSERT OR UPDATE ON engagements
FOR EACH ROW
EXECUTE FUNCTION update_campaign_metrics_on_engagement();

-- Create comprehensive campaign dashboard view
CREATE OR REPLACE VIEW campaign_dashboard AS
WITH campaign_metrics AS (
    SELECT 
        c.id,
        c.name,
        c.status,
        c.campaign_type,
        cg.name as campaign_group,
        cs.name as strategy_name,
        cs.strategy_type,
        cs.primary_kpi,
        COUNT(DISTINCT a.id) as ad_count,
        COUNT(DISTINCT a.post_id) as post_count,
        COALESCE(SUM(a.impressions), 0) as total_impressions,
        COALESCE(SUM(a.clicks), 0) as total_clicks,
        COALESCE(SUM(a.spend), 0) as total_spend,
        COALESCE(c.actual_metrics->>'total_engagements', '0')::INTEGER as total_engagements,
        COALESCE(c.actual_metrics->>'unique_engagers', '0')::INTEGER as unique_engagers,
        COALESCE(c.actual_metrics->>'targeted_engagers', '0')::INTEGER as targeted_engagers,
        c.start_date,
        c.end_date,
        c.budget,
        c.created_at
    FROM campaigns c
    LEFT JOIN campaign_groups cg ON c.campaign_group_id = cg.id
    LEFT JOIN campaign_strategies cs ON c.strategy_id = cs.id
    LEFT JOIN ads a ON a.campaign_id = c.id
    GROUP BY c.id, c.name, c.status, c.campaign_type, cg.name, cs.name, cs.strategy_type, cs.primary_kpi, c.actual_metrics, c.start_date, c.end_date, c.budget, c.created_at
)
SELECT 
    *,
    CASE 
        WHEN total_impressions > 0 THEN ROUND((total_clicks::FLOAT / total_impressions) * 100, 2)
        ELSE 0
    END as click_through_rate,
    CASE 
        WHEN total_impressions > 0 THEN ROUND((total_engagements::FLOAT / total_impressions) * 100, 2)
        ELSE 0
    END as engagement_rate,
    CASE 
        WHEN unique_engagers > 0 THEN ROUND((targeted_engagers::FLOAT / unique_engagers) * 100, 2)
        ELSE 0
    END as targeting_accuracy,
    CASE 
        WHEN total_clicks > 0 THEN ROUND(total_spend::FLOAT / total_clicks, 2)
        ELSE 0
    END as cost_per_click,
    CASE 
        WHEN total_engagements > 0 THEN ROUND(total_spend::FLOAT / total_engagements, 2)
        ELSE 0
    END as cost_per_engagement,
    CASE 
        WHEN budget > 0 THEN ROUND((total_spend::FLOAT / budget) * 100, 2)
        ELSE 0
    END as budget_utilization
FROM campaign_metrics
ORDER BY created_at DESC;

-- Create function to get recommended strategies for a persona
CREATE OR REPLACE FUNCTION get_recommended_strategies_for_persona(p_persona_id UUID)
RETURNS TABLE(
    strategy_id UUID,
    strategy_name VARCHAR(255),
    strategy_type VARCHAR(50),
    relevance_score DECIMAL(3,2),
    recommendation_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH persona_details AS (
        SELECT 
            p.*,
            COUNT(DISTINCT t.person_id) as matched_people
        FROM personas p
        LEFT JOIN targets t ON t.persona_id = p.id AND t.is_active = true
        WHERE p.id = p_persona_id
        GROUP BY p.id
    )
    SELECT 
        cs.id,
        cs.name,
        cs.strategy_type,
        CASE 
            -- High engagement personas work well with thought leadership
            WHEN pd.engagement_criteria->>'min_score' IS NOT NULL 
                AND (pd.engagement_criteria->>'min_score')::INT >= 5 
                AND cs.strategy_type = 'awareness' THEN 0.9
            -- Enterprise personas fit ABM strategies
            WHEN pd.company_criteria->>'size' = 'enterprise' 
                AND cs.strategy_type = 'conversion' THEN 0.95
            -- Active personas with many matches suit engagement strategies
            WHEN pd.matched_people > 50 
                AND cs.strategy_type = 'engagement' THEN 0.85
            ELSE 0.5
        END::DECIMAL(3,2) as score,
        CASE 
            WHEN pd.engagement_criteria->>'min_score' IS NOT NULL 
                AND (pd.engagement_criteria->>'min_score')::INT >= 5 
                AND cs.strategy_type = 'awareness' 
                THEN 'High-engagement audience ideal for thought leadership content'
            WHEN pd.company_criteria->>'size' = 'enterprise' 
                AND cs.strategy_type = 'conversion' 
                THEN 'Enterprise audience matches account-based marketing approach'
            WHEN pd.matched_people > 50 
                AND cs.strategy_type = 'engagement' 
                THEN 'Large matched audience perfect for engagement campaigns'
            ELSE 'General strategy recommendation'
        END as reason
    FROM persona_details pd
    CROSS JOIN campaign_strategies cs
    WHERE cs.is_active = true
    ORDER BY score DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for persona engagement trends
CREATE MATERIALIZED VIEW IF NOT EXISTS persona_engagement_trends AS
WITH daily_engagement AS (
    SELECT 
        t.persona_id,
        DATE(e.engaged_at) as engagement_date,
        COUNT(*) as daily_engagements,
        COUNT(DISTINCT e.person_id) as daily_unique_engagers,
        COUNT(DISTINCT e.post_id) as daily_posts_engaged
    FROM engagements e
    JOIN persons per ON e.person_id = per.id
    JOIN targets t ON t.person_id = per.id
    WHERE t.is_active = true
    AND e.engaged_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY t.persona_id, DATE(e.engaged_at)
)
SELECT 
    p.id as persona_id,
    p.name as persona_name,
    de.engagement_date,
    de.daily_engagements,
    de.daily_unique_engagers,
    de.daily_posts_engaged,
    AVG(de.daily_engagements) OVER (
        PARTITION BY p.id 
        ORDER BY de.engagement_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as seven_day_avg_engagements,
    SUM(de.daily_engagements) OVER (
        PARTITION BY p.id 
        ORDER BY de.engagement_date
    ) as cumulative_engagements
FROM personas p
JOIN daily_engagement de ON de.persona_id = p.id
WHERE p.is_active = true
ORDER BY p.id, de.engagement_date;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_persona_engagement_trends_persona_date 
ON persona_engagement_trends(persona_id, engagement_date);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_persona_engagement_trends()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY persona_engagement_trends;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON campaign_performance_by_persona TO authenticated;
GRANT SELECT ON campaign_dashboard TO authenticated;
GRANT SELECT ON persona_engagement_trends TO authenticated;
GRANT EXECUTE ON FUNCTION get_recommended_strategies_for_persona(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_persona_engagement_trends() TO authenticated;