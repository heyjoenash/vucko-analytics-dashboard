# LinkedIn API Data to UI Mapping Plan

## Executive Summary
This document provides a detailed field-by-field mapping plan showing how LinkedIn Campaign API data should flow into the existing Signals & Actions UI. The mapping focuses on maximizing the value of campaign intelligence by integrating it seamlessly with engagement tracking.

## Data Sources & Structure

### LinkedIn API Tables
1. **linkedin_campaigns** - Campaign metadata
2. **linkedin_campaign_analytics** - Demographic breakdowns by pivot (company, job title, seniority, industry)
3. **campaign_demographics_summary** (view) - Aggregated campaign metrics with JSON demographics
4. **enhanced_posts_view** (view) - Posts enriched with campaign data

### Key API Data Fields
```sql
-- From linkedin_campaigns
- name (campaign name)
- status (ACTIVE, PAUSED, COMPLETED)
- objective_type (BRAND_AWARENESS, VIDEO_VIEW, etc.)
- total_budget_amount/currency
- targeting_criteria (JSON)
- run_schedule_start/end

-- From linkedin_campaign_analytics
- pivot_type (COMPANY, JOB_TITLE, SENIORITY, INDUSTRY)
- pivot_value (actual company name, job title, etc.)
- impressions, clicks, spend, conversions
- ctr, cpc, cpm

-- From campaign_demographics_summary
- top_companies (JSON array)
- top_job_titles (JSON array)
- seniority_breakdown (JSON with percentages)
- industry_breakdown (JSON with percentages)
```

## UI Integration Mappings

### 1. Dashboard View (index.html)

#### Summary Metrics Section
```javascript
// Current metrics
stat-people: Total People
stat-posts: Posts
stat-companies: Companies
stat-engagements: Engagements
stat-hot: Hot Prospects

// ADD NEW METRICS:
stat-campaign-spend: Total Campaign Spend (SUM of linkedin_campaigns.total_budget_amount)
stat-campaign-reach: Campaign Reach (SUM of linkedin_campaign_analytics.impressions)
stat-campaign-roi: Campaign ROI (calculated: engagements / spend)
```

#### Hot Prospects Enhancement
```javascript
// Current: Shows people with 5+ engagements
// ENHANCE WITH:
- Flag if person engaged with sponsored content
- Show which campaigns they engaged with
- Calculate "campaign-influenced score"

// Query enhancement:
SELECT p.*, 
       COUNT(DISTINCT lc.linkedin_campaign_id) as campaigns_engaged,
       SUM(lca.spend) as attributed_spend
FROM persons p
JOIN engagements e ON p.id = e.person_id
JOIN posts po ON e.post_id = po.id
LEFT JOIN linkedin_campaigns lc ON po.linkedin_campaign_id = lc.linkedin_campaign_id
LEFT JOIN linkedin_campaign_analytics lca ON lc.linkedin_campaign_id = lca.linkedin_campaign_id
```

### 2. People View

#### Table Enhancement
```javascript
// Current columns: Name, Company, Title, Score
// ADD NEW COLUMN: Campaign Source

// Implementation:
<th style="width: 15%;">Campaign Source</th>

// Show if person came from campaign engagement:
- Campaign name (truncated)
- Campaign badge color based on objective_type
- Tooltip with full campaign details
```

#### Person Detail Modal Enhancement
```javascript
// Add "Campaign Journey" section showing:
- Which campaigns they engaged with
- Timeline of campaign interactions
- Total campaign spend attributed to this person
- Campaign demographics they belong to (company, title, seniority)

// Data source:
SELECT lc.name, lc.objective_type, lca.pivot_type, lca.pivot_value
FROM engagements e
JOIN posts p ON e.post_id = p.id
JOIN linkedin_campaigns lc ON p.linkedin_campaign_id = lc.linkedin_campaign_id
JOIN linkedin_campaign_analytics lca ON lc.linkedin_campaign_id = lca.linkedin_campaign_id
WHERE e.person_id = ? AND lca.pivot_value MATCHES person attributes
```

### 3. Companies View

#### Table Enhancement
```javascript
// Current columns: Company, People, Total Engagements, Avg Score
// ADD NEW COLUMNS:
- Campaign Spend (total spend on campaigns targeting this company)
- Campaign Performance (CTR for this company)

// Implementation:
<th style="width: 15%;">Campaign Spend</th>
<th style="width: 15%;">Campaign CTR</th>
```

#### Company Detail Modal Enhancement
```javascript
// Add "Campaign Intelligence" section:
{
  "targeted_campaigns": [
    {
      "campaign_name": "Q2 2025 Enterprise",
      "spend": 5420.50,
      "impressions": 12500,
      "clicks": 234,
      "ctr": 1.87,
      "top_engaged_titles": ["VP Engineering", "CTO", "Director"]
    }
  ],
  "campaign_demographics": {
    "seniority_distribution": {
      "VP": 45,
      "Director": 30,
      "Manager": 25
    },
    "department_distribution": {
      "Engineering": 60,
      "Product": 25,
      "Sales": 15
    }
  }
}
```

### 4. Posts View

#### Table Enhancement
```javascript
// Current columns: Post Title, Type, Posted Date, Engagements
// MODIFY Type column to show:
- "Sponsored - [Campaign Name]" for campaign posts
- Campaign objective badge (awareness/conversion/etc)
- Spend indicator ($, $$, $$$)

// Color coding:
- Organic: green badge
- Sponsored < $1k: blue badge
- Sponsored $1k-5k: purple badge
- Sponsored > $5k: gold badge
```

#### Post Row Data
```javascript
// Add campaign data to each row:
{
  post_title: "Innovation in Enterprise AI",
  campaign_name: "Q2 2025 Thought Leadership",
  campaign_budget: 5000,
  campaign_spend: 3421.50,
  campaign_impressions: 45000,
  campaign_ctr: 2.1,
  roi_score: 8.5 // engagements per $100 spent
}
```

### 5. Post Analysis Page (post-analysis.html)

#### Overview Section Enhancement
```javascript
// Current: Basic post metrics
// ADD Campaign Performance Card:
<div class="metric-card">
  <h3>Campaign Performance</h3>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <span class="text-2xl font-bold">$3,421</span>
      <span class="text-sm text-gray-600">Total Spend</span>
    </div>
    <div>
      <span class="text-2xl font-bold">45.2K</span>
      <span class="text-sm text-gray-600">Impressions</span>
    </div>
    <div>
      <span class="text-2xl font-bold">2.1%</span>
      <span class="text-sm text-gray-600">CTR</span>
    </div>
    <div>
      <span class="text-2xl font-bold">$0.85</span>
      <span class="text-sm text-gray-600">Cost per Engagement</span>
    </div>
  </div>
</div>
```

#### Patterns & Insights Enhancement
```javascript
// Add Campaign Demographics section:
<div class="demographic-insights">
  <h4>Campaign Audience Breakdown</h4>
  
  <!-- Top Companies Chart -->
  <div class="companies-chart">
    <!-- Bar chart showing top 5 companies by impressions -->
    Microsoft: ████████████ 5,420 impressions
    Google:    ████████ 3,210 impressions
    Amazon:    ██████ 2,890 impressions
  </div>
  
  <!-- Seniority Donut Chart -->
  <div class="seniority-chart">
    <!-- Donut chart showing seniority distribution -->
    VP & Above: 35%
    Director: 28%
    Manager: 22%
    IC: 15%
  </div>
</div>
```

#### Engagement Table Enhancement
```javascript
// Add columns:
- "Campaign Match" - checkmark if person matches campaign targeting
- "Attributed Spend" - portion of campaign spend attributed to this engagement

// Visual indicators:
- Highlight rows where person matches multiple targeting criteria
- Show confidence score for attribution
```

### 6. Campaigns View (Currently Placeholder)

#### Transform to Active Campaign Dashboard
```javascript
// Replace placeholder data with real LinkedIn campaigns:
const campaignsData = await supabaseClient
  .from('campaign_performance_summary')
  .select('*')
  .order('total_spend', { ascending: false });

// Display columns:
- Campaign Name
- Status (with color coding)
- Budget Utilization (progress bar)
- Performance Score (composite of CTR, CPC, engagement rate)
- Total Engagements (from our tracking)
- ROI Score (engagements per dollar)
```

#### Campaign Detail Page
```javascript
// New page: campaign-detail.html
// Sections:
1. Campaign Overview
   - Name, dates, budget, targeting criteria
   
2. Performance Metrics
   - Real-time charts for impressions, clicks, spend
   - Comparison to benchmarks
   
3. Audience Analysis
   - Demographics breakdown with charts
   - Top performing segments
   
4. Engagement Attribution
   - List of all engagements from this campaign
   - Person profiles who engaged
   - Journey mapping from impression to engagement
   
5. ROI Analysis
   - Cost per engagement
   - Cost per qualified lead
   - Pipeline attribution
```

### 7. New LinkedIn Intelligence Dashboard

#### Create linkedin-intelligence.html
```javascript
// Comprehensive view combining all LinkedIn data:

1. Account Overview
   - Total accounts, campaigns, spend
   - Month-over-month trends
   
2. Campaign Portfolio Performance
   - Bubble chart: X=Spend, Y=Engagements, Size=Impressions
   - Campaign health indicators
   
3. Audience Intelligence
   - Aggregate demographics across all campaigns
   - Emerging audience segments
   - Lookalike recommendations
   
4. Content Performance
   - Which content types perform best
   - Engagement patterns by content theme
   
5. Attribution Analysis
   - Multi-touch attribution modeling
   - Campaign influence on pipeline
```

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. Update dashboard with campaign metrics
2. Add campaign source to People view
3. Enhance Posts view with campaign indicators

### Phase 2: Deep Integration (Week 2)
1. Enhance Post Analysis with full campaign data
2. Add campaign intelligence to Company view
3. Build real Campaigns view

### Phase 3: Advanced Features (Week 3)
1. Create LinkedIn Intelligence Dashboard
2. Implement attribution modeling
3. Add predictive analytics

## Technical Implementation Notes

### Data Loading Pattern
```javascript
// Efficient loading with joins
const enhancedPeople = await supabaseClient
  .from('persons')
  .select(`
    *,
    engagements!inner(
      post_id,
      posts!inner(
        linkedin_campaign_id,
        linkedin_campaigns(
          name,
          objective_type,
          total_budget_amount
        )
      )
    )
  `)
  .not('engagements.posts.linkedin_campaign_id', 'is', null);
```

### Caching Strategy
```javascript
// Cache campaign analytics data (updates daily)
localStorage.setItem('campaign_analytics_cache', JSON.stringify({
  data: campaignAnalytics,
  timestamp: Date.now(),
  ttl: 24 * 60 * 60 * 1000 // 24 hours
}));
```

### Real-time Updates
```javascript
// Subscribe to campaign performance changes
supabaseClient
  .channel('campaign-updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'linkedin_campaign_analytics' },
    (payload) => {
      updateCampaignMetrics(payload.new);
    }
  )
  .subscribe();
```

## Success Metrics

1. **Visibility**: 100% of sponsored engagements show campaign attribution
2. **Intelligence**: Users can see demographics for any campaign within 2 clicks
3. **ROI**: Clear cost-per-engagement metrics on every relevant view
4. **Performance**: All enhanced views load in < 2 seconds
5. **Actionability**: Users can identify high-value segments and export for retargeting

## Next Steps

1. Review and approve mapping plan
2. Create UI mockups for enhanced components
3. Implement Phase 1 features
4. Test with real Vucko campaign data
5. Iterate based on user feedback