# Campaign CSV Upload Implementation - Complete Data Flow

## Overview

This implementation enables a complete data flow from LinkedIn Campaign Manager CSV uploads through to campaign analysis and match rate calculations. The system now supports:

1. **Demographics CSV Upload** - Company-level engagement data
2. **Creative Performance CSV Upload** - Ad-level metrics and spend data
3. **Automatic Post Matching** - Links ads to tracked LinkedIn posts
4. **Match Rate Calculation** - Measures campaign effectiveness
5. **Campaign Analytics** - Real-time metrics and ROI analysis

## Implementation Components

### 1. LinkedIn CSV Parser (`backend/linkedin_csv_parser.py`)

A robust parser that handles:
- UTF-16 encoding (common in LinkedIn exports)
- Tab-delimited format
- Multiple date formats
- Currency and percentage parsing
- Post URL extraction from ad content

Key features:
- Automatic encoding detection
- Flexible column name matching
- Content-based post matching algorithm

### 2. API Endpoints (Added to `backend/main.py`)

#### Campaign Management
- `GET /api/campaigns` - List all campaigns with metrics
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/{id}/analytics` - Detailed campaign analytics

#### CSV Upload Endpoints
- `POST /api/campaigns/{id}/upload-demographics` - Upload demographics report
- `POST /api/campaigns/{id}/upload-performance` - Upload creative performance report
- `POST /api/campaigns/{id}/associate-posts` - Manually link posts to campaigns

### 3. Database Updates (`database/migrations/add_linkedin_creative_id.sql`)

Added:
- `linkedin_creative_id` column to posts table
- `campaign_posts` junction table
- Additional metrics columns to ads table
- `campaign_metrics` view for analytics

### 4. Frontend Updates

#### Campaign Management View
- Full campaign list with metrics
- CSV upload interface
- Real-time analytics display

#### New UI Components
- CSV upload modal with type selection
- Campaign analytics dashboard
- Match rate visualization

## Data Flow

### Step 1: Track LinkedIn Posts
```
User enters post URL → Apify scrapes engagements → Store in database
```

### Step 2: Create Campaign
```javascript
// Frontend
fetch('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify({
        name: 'Q2 2025 Brand Campaign',
        campaign_type: 'sponsored',
        status: 'active'
    })
})
```

### Step 3: Upload Creative Performance CSV
```
1. Parse CSV with UTF-16 encoding support
2. Extract ad metrics (impressions, clicks, spend)
3. Match ads to tracked posts by:
   - LinkedIn post URL in ad text
   - Content similarity matching
4. Store ad data with post associations
```

### Step 4: Upload Demographics CSV
```
1. Parse company engagement data
2. Create/update company records
3. Store engagement metrics by company
```

### Step 5: Calculate Match Rates
```python
# In campaign analytics endpoint
match_rate = (matched_engagers / total_engagers) * 100
```

Where:
- `matched_engagers` = People who engaged AND match target audience
- `total_engagers` = All unique people who engaged

## Usage Guide

### 1. Navigate to Campaigns View
Click "Campaigns" in the main navigation

### 2. Create a Campaign
Click "Create Campaign" and fill in:
- Campaign name
- Type (Sponsored/Organic)
- Status

### 3. Upload CSV Files
1. Click "Upload CSV" next to your campaign
2. Select CSV type:
   - **Demographics Report**: Company-level data
   - **Creative Performance Report**: Ad-level data
3. Select file and upload

### 4. View Analytics
Click "View" to see:
- Total impressions/clicks/spend
- Engagement metrics
- Match rate calculations
- Hot prospects from campaign

## Sample CSV Formats

### Demographics Report
```
Company Name Segment    Impressions    Clicks    CTR
Riot Games             36             0         0%
Epic Games             17             0         0%
```

### Creative Performance Report
```
Ad ID        Creative Name    Impressions    Clicks    Spend
704816576    Brand Ad        2885           26        $500.00
```

## Match Rate Calculation Logic

The system calculates match rates by:

1. **Identifying Target Audience** - From campaign's linked audience segments
2. **Tracking Engagements** - All reactions, comments, shares on campaign posts
3. **Matching People** - Compare engaged persons against target criteria
4. **Calculating Rate** - (Matched / Total) × 100

## Testing the Implementation

1. **Start the Backend**
```bash
cd backend && python main.py
```

2. **Access the Frontend**
```
http://localhost:4200
```

3. **Upload Sample CSVs**
Use the provided sample files in `data/sample-csvs/`

4. **Verify Data Flow**
- Check campaigns show metrics
- Verify match rates calculate
- Confirm spend data displays

## Next Steps

1. **Enhanced Matching** - Improve post-to-ad matching algorithm
2. **Audience Attribution** - Better person-to-segment matching
3. **Export Reports** - Generate client-ready analytics
4. **Real-time Updates** - WebSocket integration for live metrics
5. **Multi-campaign Analysis** - Cross-campaign performance comparison

## Troubleshooting

### CSV Upload Fails
- Check encoding (should be UTF-16)
- Verify tab-delimited format
- Ensure required columns present

### No Match Rate Data
- Verify posts have been scraped for engagements
- Check audience segments are defined
- Ensure ads are linked to posts

### Performance Issues
- Index frequently queried columns
- Implement pagination for large datasets
- Cache analytics calculations