# CSV Upload & Profile Enrichment Workflow Plan

## Overview
This document outlines the plan for implementing:
1. CSV upload functionality for LinkedIn Campaign Manager data
2. Profile enrichment workflow using Apify scrapers
3. Data normalization and mapping to existing database schema

## 1. CSV Upload Workflow

### 1.1 Demographics CSV
**Source**: LinkedIn Campaign Manager export
**Contains**: Audience demographics data (companies, titles, locations, etc.)

#### Required Transformations:
```javascript
// Expected columns from LinkedIn:
// - Company
// - Job Title  
// - Location
// - Impressions
// - Clicks
// - CTR
// - Spend

// Transform to our schema:
{
  company_name: row['Company'],
  job_title: row['Job Title'],
  location: row['Location'],
  metrics: {
    impressions: parseInt(row['Impressions']),
    clicks: parseInt(row['Clicks']),
    ctr: parseFloat(row['CTR']),
    spend: parseFloat(row['Spend'])
  }
}
```

### 1.2 Performance CSV
**Source**: LinkedIn Campaign Manager export
**Contains**: Ad performance metrics over time

#### Required Transformations:
```javascript
// Expected columns:
// - Date
// - Campaign Name
// - Ad Name
// - Impressions
// - Clicks
// - Conversions
// - Spend
// - CTR
// - CPM

// Transform to our schema:
{
  date: new Date(row['Date']),
  campaign_name: row['Campaign Name'],
  ad_name: row['Ad Name'],
  metrics: {
    impressions: parseInt(row['Impressions']),
    clicks: parseInt(row['Clicks']),
    conversions: parseInt(row['Conversions']),
    spend: parseFloat(row['Spend']),
    ctr: parseFloat(row['CTR']),
    cpm: parseFloat(row['CPM'])
  }
}
```

### 1.3 Database Mapping Strategy

1. **Create new tables**:
   - `campaign_demographics` - Store demographic breakdowns
   - `campaign_performance` - Store time-series performance data

2. **Link to existing data**:
   - Match campaigns by name to `campaigns` table
   - Match companies to `companies` table (fuzzy matching)
   - Create new companies if not found
   - Link to posts via campaign relationship

3. **Update engagement scores**:
   - Weight paid engagement differently than organic
   - Factor in CTR and conversion rates
   - Update person scores based on demographic matches

## 2. Profile Enrichment Workflow

### 2.1 Trigger Conditions
- New person added without profile data
- Person has high engagement score (5+) but no enrichment
- Manual trigger for specific people/companies

### 2.2 Apify Integration
```javascript
// Profile enrichment scraper config
const enrichmentConfig = {
  actorId: 'curious_coder/linkedin-profile-scraper',
  input: {
    profileUrls: [/* batch of LinkedIn URLs */],
    cookie: linkedinCookie,
    maxRetries: 3
  }
};
```

### 2.3 Enrichment Data Mapping
```javascript
// Map Apify results to persons table
{
  // Update existing fields
  headline: result.headline,
  current_company: result.currentCompany,
  current_title: result.currentTitle,
  location: result.location,
  connections: result.connectionsCount,
  about: result.summary,
  
  // New fields from enrichment
  experience: result.experience, // JSONB
  education: result.education,   // JSONB
  skills: result.skills,         // JSONB
  
  // Update metadata
  profile_enriched: true,
  enriched_at: new Date()
}
```

### 2.4 Company Enrichment
When enriching profiles, also extract and enrich company data:
- Company size
- Industry
- Location
- LinkedIn company URL

## 3. Implementation Steps

### Phase 1: CSV Upload UI
1. Add "Upload CSV" button to posts view
2. Create modal with file dropzone
3. Parse CSV and show preview
4. Validate required columns
5. Transform and insert data

### Phase 2: Profile Enrichment
1. Add "Enrich Profiles" button to People view
2. Create background job system using `scraping_jobs` table
3. Batch profiles for efficient API usage
4. Handle rate limiting and retries
5. Update UI to show enrichment status

### Phase 3: Scoring Algorithm
1. Create weighted scoring based on:
   - Organic engagements (base score)
   - Paid campaign interactions (lower weight)
   - Profile completeness
   - Company match to target list
   - Recency of engagement
2. Update scores in real-time as new data arrives

## 4. UI/UX Considerations

### CSV Upload Flow:
1. User clicks "Upload Campaign Data" on post detail
2. Modal shows with two dropzones (Demographics, Performance)
3. Files are validated and previewed
4. User confirms mapping and imports
5. Progress bar shows import status
6. Success message with stats

### Profile Enrichment Flow:
1. User sees "Enrich" button on people without data
2. Can select multiple people for batch enrichment
3. Shows estimated time and credit usage
4. Background process with email notification when done
5. Real-time updates in UI as profiles complete

## 5. Error Handling

### CSV Errors:
- Missing required columns
- Invalid data formats
- Duplicate entries
- Failed company matching

### Enrichment Errors:
- LinkedIn rate limiting
- Invalid profile URLs
- Cookie expiration
- API quota exceeded

## 6. Next Steps

1. **Immediate**: Fix tenant_id constraint errors
2. **Next Sprint**: Implement basic CSV upload UI
3. **Following Sprint**: Add profile enrichment workflow
4. **Future**: Advanced scoring and analytics

## 7. Technical Notes

### Performance Optimization:
- Batch database inserts
- Use database triggers for score updates
- Cache company lookups
- Implement job queue for enrichment

### Data Quality:
- Fuzzy matching for company names
- Standardize job titles
- Geocode locations
- Deduplicate people by LinkedIn URL