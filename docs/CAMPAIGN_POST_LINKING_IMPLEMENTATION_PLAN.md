# Campaign-Post Linking Implementation Plan

## Problem Statement
- Post ID 2 has no `linkedin_campaign_id` set, preventing campaign intelligence from displaying
- Need to link campaigns 751420716 and 751420936 (different audiences) to the same post
- Must merge demographics from multiple campaigns with scraped engagement data
- Create a cohesive post analysis page showing both LinkedIn Campaign Manager data and scraped data

## Current Architecture Analysis

### What's Working
1. **API Proxy Server** (`api-proxy/server.js`)
   - LinkedIn API endpoints for campaigns, creatives, shares
   - Rate limiting and caching implemented
   - Authentication working with valid token

2. **Database Schema** 
   - `linkedin_campaigns` table stores campaign data
   - `linkedin_campaign_analytics` table stores demographics/performance data
   - `posts` table has `linkedin_campaign_id` field (single campaign)
   - `post_campaigns` junction table exists for many-to-many relationships
   - Views like `campaign_demographics_summary` aggregate data

3. **Services**
   - `CampaignPostSyncService` extracts posts from campaign creatives
   - `VuckoSyncService` syncs campaigns and attempts matching
   - `LinkedInAPI` service handles API calls

### What's Missing
1. **Post URL Search in Campaigns** - No way to search campaigns by post URL
2. **Multi-Campaign Support** - UI expects single `linkedin_campaign_id` 
3. **URL Matching Logic** - Need to match campaigns to existing posts by URL
4. **Demographics Merging** - No aggregation of data from multiple campaigns

## Implementation Plan

### Phase 1: Add Campaign Search by Post URL

#### 1.1 Create API Endpoint to Search Campaigns by Content
```javascript
// In api-proxy/server.js
app.post('/api/linkedin/campaigns/search-by-url', async (req, res) => {
    const { postUrl } = req.body;
    // Extract post ID from URL
    // Search all campaigns' creatives for matching share URLs
    // Return matching campaign IDs
});
```

#### 1.2 Create Database Function for URL-Based Matching
```sql
-- Function to find campaigns associated with a post URL
CREATE OR REPLACE FUNCTION find_campaigns_by_post_url(p_post_url TEXT)
RETURNS TABLE (
    linkedin_campaign_id BIGINT,
    campaign_name VARCHAR,
    confidence_score DECIMAL
) AS $$
BEGIN
    -- Implementation will search creatives and match URLs
END;
$$ LANGUAGE plpgsql;
```

### Phase 2: Implement Multi-Campaign Support

#### 2.1 Create Campaign-Post Linking Service
```javascript
// New file: app/services/campaign-post-linker.js
class CampaignPostLinker {
    async linkCampaignsToPost(postId, campaignIds) {
        // Create entries in post_campaigns junction table
        // Update post with primary campaign_id if not set
        // Trigger demographics aggregation
    }
    
    async searchCampaignsByPostUrl(postUrl) {
        // Call API to get all creatives for each campaign
        // Match URLs and return campaigns with confidence scores
    }
}
```

#### 2.2 Update Database to Support Multi-Campaign Analytics
```sql
-- Create aggregated view for multi-campaign demographics
CREATE OR REPLACE VIEW post_campaign_demographics AS
SELECT 
    p.id as post_id,
    -- Aggregate demographics from all linked campaigns
    json_agg(DISTINCT company ORDER BY impressions DESC) as all_companies,
    json_agg(DISTINCT job_title ORDER BY impressions DESC) as all_job_titles,
    SUM(total_spend) as combined_spend,
    SUM(total_impressions) as combined_impressions
FROM posts p
JOIN post_campaigns pc ON p.id = pc.post_id
JOIN campaign_demographics_summary cds ON pc.campaign_id = cds.linkedin_campaign_id
GROUP BY p.id;
```

### Phase 3: Enhance Post Analysis Page

#### 3.1 Update Post Analysis to Support Multiple Campaigns
```javascript
// In post-analysis.html
async loadCampaignIntelligence(post) {
    if (post.linkedin_campaign_id || post.linked_campaigns?.length > 0) {
        // Get all linked campaigns
        const campaignIds = [post.linkedin_campaign_id, ...post.linked_campaigns];
        
        // Fetch aggregated demographics
        const demographics = await this.fetchAggregatedDemographics(campaignIds);
        
        // Merge with scraped data
        const mergedData = this.mergeDataSources(demographics, scrapedEngagements);
    }
}
```

#### 3.2 Create Data Merging Algorithm
```javascript
mergeDataSources(campaignData, scrapedData) {
    return {
        // From Campaign Manager
        targetCompanies: campaignData.companies,
        targetJobTitles: campaignData.jobTitles,
        campaignReach: campaignData.impressions,
        campaignSpend: campaignData.spend,
        
        // From Scrape
        actualEngagers: scrapedData.persons,
        actualCompanies: scrapedData.companies,
        
        // Calculated Insights
        targetToActualRatio: this.calculateConversionRatio(),
        costPerActualEngagement: campaignData.spend / scrapedData.count,
        topConvertingSegments: this.identifyBestSegments()
    };
}
```

### Phase 4: Implement for Specific Campaigns

#### 4.1 Link Campaigns 751420716 & 751420936 to Post ID 2
```sql
-- Immediate fix for the current post
INSERT INTO post_campaigns (post_id, campaign_id, is_primary) VALUES
(2, 751420716, true),
(2, 751420936, false);

-- Update post with primary campaign
UPDATE posts 
SET linkedin_campaign_id = 751420716 
WHERE id = 2;
```

#### 4.2 Create Campaign Linking UI
```html
<!-- Add to post-analysis.html -->
<div class="campaign-linker">
    <h4>Link Campaigns</h4>
    <button onclick="searchCampaignsByUrl()">Search by URL</button>
    <input type="text" id="campaignIdInput" placeholder="Or enter Campaign ID">
    <button onclick="linkCampaign()">Link Campaign</button>
</div>
```

### Phase 5: Fix Engagement Count Issue

#### 5.1 Debug Query Differences
```javascript
// The issue: post-analysis shows 162, but total is 303
// Need to check if query is filtering correctly
async debugEngagementCount(postId) {
    // Check if post_url vs post_id is causing discrepancy
    const byPostId = await supabase.from('engagements')
        .select('*', { count: 'exact' })
        .eq('post_id', postId);
        
    const byPostUrl = await supabase.from('engagements')
        .select('*', { count: 'exact' })
        .eq('post_url', post.url);
}
```

## Immediate Actions

### 1. Quick Fix for Current Post
```bash
# Run this SQL to link campaigns to post
psql $DATABASE_URL << EOF
-- Link campaigns to post ID 2
INSERT INTO post_campaigns (post_id, campaign_id, is_primary) VALUES
(2, 751420716, true),
(2, 751420936, false)
ON CONFLICT DO NOTHING;

-- Update post with primary campaign
UPDATE posts 
SET linkedin_campaign_id = 751420716 
WHERE id = 2 AND linkedin_campaign_id IS NULL;
EOF
```

### 2. Create Temporary Campaign Search Function
```javascript
// Quick implementation to search campaigns
async function findCampaignsByPostContent(postUrl) {
    // Get all campaigns
    const campaigns = await linkedInAPI.getAllCampaigns();
    
    // For each campaign, get creatives
    const matches = [];
    for (const campaign of campaigns) {
        const creatives = await linkedInAPI.getCampaignCreatives(campaign.id);
        // Check if any creative matches the post URL
        if (creatives.some(c => extractPostUrl(c) === postUrl)) {
            matches.push(campaign);
        }
    }
    return matches;
}
```

### 3. Update Post Analysis Page
```javascript
// Immediate fix to show campaign data
if (!post.linkedin_campaign_id) {
    // Try to load from post_campaigns junction table
    const linkedCampaigns = await supabase
        .from('post_campaigns')
        .select('campaign_id')
        .eq('post_id', post.id);
        
    if (linkedCampaigns.data?.length > 0) {
        // Use first campaign as primary
        post.linkedin_campaign_id = linkedCampaigns.data[0].campaign_id;
    }
}
```

## Success Metrics
1. ✅ Post ID 2 shows LinkedIn Campaign Intelligence section with real data
2. ✅ Both campaigns (751420716 & 751420936) linked to the post
3. ✅ Demographics from both campaigns aggregated and displayed
4. ✅ Top companies/titles from Campaign Manager shown alongside scraped data
5. ✅ All 303 engagements properly displayed (fix count issue)
6. ✅ ROI calculations using actual campaign spend

## Next Steps
1. Implement Phase 1 - Campaign search by URL
2. Quick fix - Link the two campaigns to post ID 2
3. Debug and fix engagement count (162 vs 303)
4. Update UI to show merged campaign + scrape data
5. Create automated workflow for future posts