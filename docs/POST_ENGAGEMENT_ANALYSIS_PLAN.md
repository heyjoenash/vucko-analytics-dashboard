# Post Engagement Analysis & Signals Discovery Plan

## Vision
Transform the post detail view into a comprehensive engagement analysis tool that surfaces actionable signals from LinkedIn post interactions, enabling targeted outreach based on engagement patterns.

## Current State
- Basic post modal showing title, type, date, and engagement count
- Engagements stored in database with reaction types and attribution
- Person profiles include photos, titles, companies
- Audience segments system exists but not utilized in UI

## Proposed Architecture

### 1. Enhanced Post Detail View

#### 1.1 Layout Structure
```
┌─────────────────────────────────────────────┐
│ [Back] Post Title              [Modal/Full] │
├─────────────────────────────────────────────┤
│           EMBEDDED LINKEDIN POST            │
├─────────────────────────────────────────────┤
│           📊 TOP SIGNALS                    │
│  Top Companies: [Company badges]            │
│  Top Titles: [Title badges]                 │
│  Audience Match: [Segment badges]           │
├─────────────────────────────────────────────┤
│ FILTERS: [All] [Target Companies] [Titles] │
│          [Custom Audience] [Review Mode]    │
├─────────────────────────────────────────────┤
│ ENGAGEMENTS (283)                          │
│ ┌──────┬──────────┬─────────┬────────┬───┐│
│ │Photo │Name      │Title    │Company │ 🔗││
│ ├──────┼──────────┼─────────┼────────┼───┤│
│ │ 👤   │John Doe  │Director │Apple   │ → ││
│ └──────┴──────────┴─────────┴────────┴───┘│
└─────────────────────────────────────────────┘
```

#### 1.2 Key Features
- **Embedded Post**: Use LinkedIn's embed API or screenshot
- **Signals Summary**: Pre-computed top companies, titles, and audience matches
- **Smart Filters**: Quick access to target segments
- **Photo-First Table**: Visual recognition of key prospects
- **Direct Profile Links**: Quick access to LinkedIn profiles

### 2. Data Requirements

#### 2.1 Immediate Needs
```javascript
// Enhanced engagement query
SELECT 
  e.*,
  p.name,
  p.profile_picture,
  p.headline,
  p.current_title,
  p.current_company,
  p.linkedin_url,
  p.is_follower,
  c.name as company_name,
  c.industry,
  as.name as matched_segment
FROM engagements e
JOIN persons p ON e.person_id = p.id
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN audience_segments as ON e.attributed_to_segment_id = as.id
WHERE e.post_id = ?
ORDER BY 
  p.is_follower DESC,
  p.engagement_score DESC,
  e.engaged_at DESC;
```

#### 2.2 Signals Computation
```javascript
// Top signals aggregation
const signals = {
  topCompanies: getTopCompaniesByEngagement(postId),
  topTitles: getTopTitlePatterns(postId),
  audienceMatches: getAudienceSegmentMatches(postId),
  followerEngagement: getFollowerEngagementRate(postId),
  reactionBreakdown: getReactionTypeDistribution(postId)
};
```

### 3. Filtering System

#### 3.1 Filter Categories
1. **All** - Show everyone
2. **Target Companies** - Match against company filters in audience_segments
3. **Target Titles** - Match against title filters in audience_segments
4. **Custom Audience** - Apply specific audience segment criteria
5. **Review Mode** - Highlight unmatched/new titles for discovery

#### 3.2 Filter Implementation
```javascript
// Apply filters client-side for speed
const applyFilters = (engagements, filterType) => {
  switch(filterType) {
    case 'targetCompanies':
      return engagements.filter(e => 
        targetCompanyList.includes(e.company_name)
      );
    case 'targetTitles':
      return engagements.filter(e => 
        matchesTargetTitle(e.current_title)
      );
    case 'review':
      return engagements.filter(e => 
        !e.matched_segment && e.engagement_score > 3
      );
  }
};
```

### 4. Signals Tracking System (Future)

#### 4.1 New Tables Needed
```sql
-- Track signal status and actions
CREATE TABLE signal_tracking (
  id SERIAL PRIMARY KEY,
  signal_type VARCHAR(50), -- 'person', 'company'
  signal_id INTEGER, -- person_id or company_id
  post_id INTEGER REFERENCES posts(id),
  status VARCHAR(50), -- 'new', 'qualified', 'contacted', 'responded'
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track actions taken on signals
CREATE TABLE signal_actions (
  id SERIAL PRIMARY KEY,
  signal_tracking_id INTEGER REFERENCES signal_tracking(id),
  action_type VARCHAR(50), -- 'email', 'linkedin_message', 'added_to_campaign'
  action_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.2 Signal Scoring Algorithm
```javascript
const calculateSignalScore = (person, engagement) => {
  let score = 0;
  
  // Engagement factors
  if (engagement.reaction_type === 'comment') score += 5;
  if (['love', 'insightful', 'celebrate'].includes(engagement.reaction_type)) score += 3;
  if (engagement.reaction_type === 'like') score += 1;
  
  // Profile factors
  if (person.is_follower) score += 2;
  if (matchesTargetTitle(person.current_title)) score += 5;
  if (matchesTargetCompany(person.current_company)) score += 5;
  if (person.engagement_score > 5) score += 3;
  
  return score;
};
```

### 5. Implementation Phases

#### Phase 1: Enhanced Post Detail (This Sprint)
1. Create post detail page component
2. Add engagement table with photos
3. Implement basic filtering
4. Add signals summary section
5. Toggle between modal and full page

#### Phase 2: Smart Filtering (Next Sprint)
1. Integrate audience segments
2. Add review mode
3. Implement client-side filtering
4. Add bulk selection for tagging

#### Phase 3: Signals Tracking (Future)
1. Create signal tracking tables
2. Build signals dashboard
3. Add action tracking pipeline
4. Implement scoring algorithm

### 6. UI Components Needed

#### 6.1 Post Detail Page
```javascript
// New route: /posts/:id
const PostDetailPage = {
  sections: [
    PostHeader,        // Title, date, toggle button
    PostEmbed,         // LinkedIn post iframe/image
    SignalsSummary,    // Top companies, titles, scores
    FilterBar,         // Filter buttons
    EngagementTable,   // Main data table
    BulkActions        // Select all, tag, export
  ]
};
```

#### 6.2 Engagement Table Columns
1. **Photo** (40px) - Profile picture or placeholder
2. **Name** (200px) - Full name, clickable
3. **Title** (250px) - Current title or headline
4. **Company** (200px) - Company name, clickable
5. **Actions** (100px) - View profile, tag, note

### 7. Technical Considerations

#### 7.1 Performance
- Paginate engagements (50 per page)
- Lazy load profile images
- Cache signals computation
- Index engagement queries

#### 7.2 Data Enrichment
- Queue profiles without photos for enrichment
- Standardize job titles for better matching
- Geocode companies for location filtering

#### 7.3 LinkedIn Integration
- Research embed API options
- Fallback to screenshot display
- Maintain LinkedIn URL references

### 8. Success Metrics
- Time to identify key prospects (< 2 min)
- Signal-to-noise ratio improvement (> 10x)
- Action conversion rate on signals
- Profile enrichment coverage

### 9. Next Actions
1. Build post detail page with engagement table
2. Add profile photos and company data
3. Implement top signals summary
4. Create filter bar with basic filters
5. Add modal/full page toggle

This system will transform raw engagement data into actionable sales signals, making it easy to identify and track high-value prospects from LinkedIn content engagement.