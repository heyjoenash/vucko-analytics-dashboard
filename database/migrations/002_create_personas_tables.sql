-- Create personas table for user-defined target personas
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_color VARCHAR(50) DEFAULT 'blue',
    
    -- Title criteria (stored as JSONB for flexibility)
    title_keywords JSONB DEFAULT '{"include": [], "exclude": []}'::jsonb,
    
    -- Seniority levels (array of values: senior, mid, junior)
    seniority_levels TEXT[] DEFAULT '{}',
    
    -- Company criteria (stored as JSONB)
    company_criteria JSONB DEFAULT '{}'::jsonb,
    /* Expected structure:
       {
         "industry": "technology",
         "size": "enterprise",  // startup, small, mid, large, enterprise
         "location": "United States"
       }
    */
    
    -- Engagement criteria
    engagement_criteria JSONB DEFAULT '{}'::jsonb,
    /* Expected structure:
       {
         "min_score": 0,
         "follower_status": "any"  // any, follower, non-follower
       }
    */
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT personas_tenant_id_name_unique UNIQUE (tenant_id, name)
);

-- Create targets table to associate people with personas
CREATE TABLE IF NOT EXISTS targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    person_id INTEGER NOT NULL,
    persona_id UUID NOT NULL,
    
    -- Match details
    match_score DECIMAL(3,2), -- 0.00 to 1.00 representing match quality
    match_criteria JSONB, -- Which criteria matched
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    manually_added BOOLEAN DEFAULT false,
    
    -- Metadata
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE,
    CONSTRAINT targets_unique_person_persona UNIQUE (tenant_id, person_id, persona_id)
);

-- Note: audience_segments table already exists in main schema.sql with TEXT id
-- We'll work with the existing structure

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_personas_tenant_id ON personas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_personas_is_active ON personas(is_active);
CREATE INDEX IF NOT EXISTS idx_targets_person_id ON targets(person_id);
CREATE INDEX IF NOT EXISTS idx_targets_persona_id ON targets(persona_id);
CREATE INDEX IF NOT EXISTS idx_targets_tenant_person ON targets(tenant_id, person_id);
-- Audience segments indexes will be created by main schema

-- Create a view to get persona match counts
CREATE OR REPLACE VIEW persona_match_counts AS
SELECT 
    p.id,
    p.tenant_id,
    p.name,
    COUNT(DISTINCT t.person_id) as matched_count,
    COUNT(DISTINCT CASE WHEN per.engagement_score >= 5 THEN t.person_id END) as high_value_count
FROM personas p
LEFT JOIN targets t ON t.persona_id = p.id AND t.is_active = true
LEFT JOIN persons per ON per.id = t.person_id
WHERE p.is_active = true
GROUP BY p.id, p.tenant_id, p.name;

-- Create a function to match people to personas
CREATE OR REPLACE FUNCTION match_person_to_personas(p_person_id INTEGER)
RETURNS TABLE(persona_id UUID, match_score DECIMAL(3,2), match_criteria JSONB) AS $$
DECLARE
    v_person RECORD;
    v_persona RECORD;
    v_match_score DECIMAL(3,2);
    v_match_criteria JSONB;
    v_title_match BOOLEAN;
    v_seniority_match BOOLEAN;
    v_company_match BOOLEAN;
    v_engagement_match BOOLEAN;
BEGIN
    -- Get person details
    SELECT * INTO v_person FROM persons WHERE id = p_person_id;
    
    -- Check each active persona
    FOR v_persona IN SELECT * FROM personas WHERE is_active = true LOOP
        v_match_score := 0;
        v_match_criteria := '{}'::jsonb;
        
        -- Check title keywords
        v_title_match := false;
        IF v_person.current_title IS NOT NULL THEN
            -- Check include keywords
            IF jsonb_array_length(v_persona.title_keywords->'include') > 0 THEN
                SELECT EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(v_persona.title_keywords->'include') AS keyword
                    WHERE v_person.current_title ILIKE '%' || keyword || '%'
                ) INTO v_title_match;
            ELSE
                v_title_match := true; -- No include criteria means any title matches
            END IF;
            
            -- Check exclude keywords
            IF v_title_match AND jsonb_array_length(v_persona.title_keywords->'exclude') > 0 THEN
                SELECT NOT EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(v_persona.title_keywords->'exclude') AS keyword
                    WHERE v_person.current_title ILIKE '%' || keyword || '%'
                ) INTO v_title_match;
            END IF;
        END IF;
        
        -- Skip if title doesn't match
        IF NOT v_title_match THEN
            CONTINUE;
        END IF;
        
        v_match_score := v_match_score + 0.4;
        v_match_criteria := v_match_criteria || '{"title_match": true}'::jsonb;
        
        -- Check seniority (simplified - would need more sophisticated title parsing)
        v_seniority_match := true;
        IF array_length(v_persona.seniority_levels, 1) > 0 THEN
            -- This is simplified - in production would use more sophisticated parsing
            v_seniority_match := true;
        END IF;
        
        IF v_seniority_match THEN
            v_match_score := v_match_score + 0.2;
            v_match_criteria := v_match_criteria || '{"seniority_match": true}'::jsonb;
        END IF;
        
        -- Check company criteria
        v_company_match := true;
        IF v_persona.company_criteria->>'industry' IS NOT NULL THEN
            -- Would need company enrichment data for real matching
            v_company_match := true;
        END IF;
        
        IF v_company_match THEN
            v_match_score := v_match_score + 0.2;
            v_match_criteria := v_match_criteria || '{"company_match": true}'::jsonb;
        END IF;
        
        -- Check engagement criteria
        v_engagement_match := true;
        IF (v_persona.engagement_criteria->>'min_score')::int > 0 THEN
            v_engagement_match := v_person.engagement_score >= (v_persona.engagement_criteria->>'min_score')::int;
        END IF;
        
        IF v_persona.engagement_criteria->>'follower_status' = 'follower' THEN
            v_engagement_match := v_engagement_match AND v_person.is_follower = true;
        ELSIF v_persona.engagement_criteria->>'follower_status' = 'non-follower' THEN
            v_engagement_match := v_engagement_match AND v_person.is_follower = false;
        END IF;
        
        IF v_engagement_match THEN
            v_match_score := v_match_score + 0.2;
            v_match_criteria := v_match_criteria || '{"engagement_match": true}'::jsonb;
        END IF;
        
        -- Return match if score > 0
        IF v_match_score > 0 THEN
            RETURN QUERY SELECT v_persona.id, v_match_score, v_match_criteria;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (only if tables are empty)
INSERT INTO personas (name, description, icon_color, title_keywords, seniority_levels, company_criteria, engagement_criteria)
SELECT 
    'Enterprise Decision Maker',
    'C-level executives at Fortune 500 companies',
    'amber',
    '{"include": ["CEO", "CTO", "CFO", "President", "Chief"], "exclude": ["Assistant", "Junior"]}'::jsonb,
    ARRAY['senior'],
    '{"industry": "technology", "size": "enterprise", "location": "United States"}'::jsonb,
    '{"min_score": 5, "follower_status": "any"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM personas WHERE name = 'Enterprise Decision Maker');

INSERT INTO personas (name, description, icon_color, title_keywords, seniority_levels, company_criteria, engagement_criteria)
SELECT 
    'Tech Innovator',
    'Technology leaders driving digital transformation',
    'blue',
    '{"include": ["VP Engineering", "Director", "Head of Technology"], "exclude": ["Intern"]}'::jsonb,
    ARRAY['senior', 'mid'],
    '{"industry": "technology", "size": "mid", "location": "San Francisco Bay Area"}'::jsonb,
    '{"min_score": 3, "follower_status": "follower"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM personas WHERE name = 'Tech Innovator');

-- Grant permissions
GRANT ALL ON personas TO authenticated;
GRANT ALL ON targets TO authenticated;
GRANT ALL ON audience_segments TO authenticated;
GRANT SELECT ON persona_match_counts TO authenticated;