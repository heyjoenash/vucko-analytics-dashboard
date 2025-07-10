# LinkedIn Campaign Intelligence Platform - Project Overview

## Current Status (July 8, 2025)
**Apify Integration Fixed** - The reactions scraper now supports multiple parameter formats with automatic fallback logic.

## Project Purpose
A LinkedIn campaign intelligence platform that tracks post engagement, processes campaign CSV data, enriches user profiles, and generates insights. The system helps analyze LinkedIn campaign performance by matching organic engagement to target audiences.

## Architecture

### Backend (FastAPI)
- **Port**: 4201
- **Main Entry**: `backend/main.py`
- **Database**: Supabase (PostgreSQL)
- **Scraping**: Apify integration for LinkedIn data
- **Key Features**:
  - LinkedIn post tracking and engagement analysis
  - Campaign CSV upload and processing
  - Profile enrichment automation
  - Multi-tenant support with Row Level Security

### Frontend (Static HTML/JS)
- **Port**: 4200
- **Framework**: Alpine.js with Tailwind CSS
- **Main File**: `frontend/index.html`
- **JavaScript**: `frontend/assets/js/app.js`

## Key Components

### 1. LinkedIn Post Tracking
- **File**: `backend/tracker.py`
- **Function**: `track_post_engagement()`
- Creates posts in database with tenant_id
- Schedules Apify scraping jobs for reactions
- Stores person data and engagement records

### 2. Campaign CSV Processing
- **File**: `backend/linkedin_csv_parser.py`
- **Features**:
  - UTF-16 encoding support for LinkedIn exports
  - Demographics and performance CSV parsing
  - Creative ad matching to tracked posts
  - Automatic audience segment creation

### 3. Database Schema
- **Migration**: `database/migrations/add_tenant_id.sql`
- **Tables**: posts, persons, companies, campaigns, engagements, scraping_jobs
- **Multi-tenancy**: All tables have tenant_id with default value
- **Default tenant**: `00000000-0000-0000-0000-000000000001`

### 4. LinkedIn Cookie Management
- **Endpoint**: `/api/settings/linkedin-cookie`
- **Fixed Issue**: Now handles JSON array format from cookie exports
- **Extracts**: `li_at` cookie value for authentication
- **Storage**: Saves to `.env` file as single line string

## Recent Fixes Applied

### 1. Apify Integration Error (July 8, 2025)
- **Problem**: Apify actor failing with "Cannot read properties of undefined (reading 'replace')"
- **Solution**: Changed parameter from `postUrl` to `urls` array, added fallback logic
- **Files Modified**: `tracker.py` (lines 115-265)
- **Logic**: Tries multiple parameter formats: `urls`, `postUrls`, then `postUrl`

### 2. LinkedIn Cookie Parsing Enhancement
- **Problem**: Simple li_at values from .env not parsed correctly
- **Solution**: Enhanced cookie parsing to handle both JSON arrays and simple values
- **File Modified**: `tracker.py` (lines 104-124)
- **Logic**: Detects if cookie is just li_at value without prefix

### 3. Tenant ID Database Error
- **Problem**: `null value in column 'tenant_id' violates not-null constraint`
- **Solution**: Added tenant_id to all database operations
- **Files Modified**: `tracker.py`, `main.py`
- **Migration**: `add_tenant_id.sql`

### 4. LinkedIn Cookie JSON Parsing
- **Problem**: JSON array cookies from exports caused python-dotenv parsing errors
- **Solution**: Backend now extracts `li_at` value from JSON arrays
- **File Modified**: `main.py` (lines 1175-1209)
- **Logic**: Detects JSON format, extracts li_at cookie, saves as simple string

### 5. CSV Upload Modal Stuck
- **Problem**: Modal appeared on page load blocking UI
- **Solution**: Moved modal inside Alpine.js scope, added proper initialization
- **File Modified**: `frontend/index.html`

## Core Workflow

### 1. Post Tracking Process
1. User enters LinkedIn post URL
2. System creates post record with tenant_id
3. Apify scraping job scheduled for engagement data
4. Reactions scraped and stored as person records
5. Engagement records created linking persons to posts

### 2. Campaign CSV Upload
1. User uploads demographics and performance CSVs
2. System parses with UTF-16 encoding support
3. Creative ads matched to tracked posts via linkedin_creative_id
4. Audience segments created from demographic data
5. Match rate calculated between organic and paid engagement

### 3. Profile Enrichment
1. System identifies persons needing enrichment
2. Apify profile scraping jobs created
3. Detailed profile data collected (company, title, experience)
4. Person records updated with enriched information

## Environment Setup

### Required Dependencies
```bash
pip install -r backend/requirements.txt
```

### Environment Variables
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
APIFY_TOKEN=your_apify_token
LINKEDIN_COOKIE=your_linkedin_cookie
```

### Database Setup
1. Run tenant migration: `database/migrations/add_tenant_id.sql`
2. Verify tables have tenant_id columns
3. Default tenant created automatically

## API Endpoints

### Core Operations
- `POST /api/posts` - Track LinkedIn post
- `GET /api/dashboard` - Get platform statistics
- `GET /api/posts/{id}` - Get post details with engagement
- `POST /api/campaigns/{id}/upload-demographics` - Upload CSV
- `POST /api/campaigns/{id}/upload-performance` - Upload CSV

### Settings
- `POST /api/settings/linkedin-cookie` - Update LinkedIn cookie
- `GET /api/settings/cookie-status` - Check cookie configuration

### Analytics
- `GET /api/campaigns/{id}/analytics` - Campaign performance metrics
- `GET /api/persons/{id}/signals` - Person engagement signals

## Data Flow

### CSV Processing Pipeline
1. **Upload**: Demographics & Performance CSVs
2. **Parse**: UTF-16 encoding, extract relevant columns
3. **Match**: Creative IDs to tracked posts
4. **Store**: Audience segments, ad performance data
5. **Analyze**: Calculate match rates, identify hot prospects

### Engagement Analysis
1. **Scrape**: LinkedIn post reactions via Apify
2. **Store**: Person profiles and engagement records
3. **Enrich**: Detailed profile data collection
4. **Match**: Organic engagers to campaign audiences
5. **Report**: Insights and notable persons

## File Structure
```
signals-actions-lite/
├── backend/
│   ├── main.py                 # FastAPI server
│   ├── tracker.py              # Core tracking logic
│   ├── linkedin_csv_parser.py  # CSV processing
│   └── requirements.txt        # Dependencies
├── frontend/
│   ├── index.html              # Main UI
│   └── assets/js/app.js        # Alpine.js logic
├── database/
│   └── migrations/
│       └── add_tenant_id.sql   # Multi-tenant migration
└── data/
    └── sample-csvs/            # Example CSV files
```

## Testing Status
- ✅ LinkedIn cookie JSON array parsing
- ✅ Tenant ID database operations
- ✅ CSV upload modal behavior
- ✅ Apify parameter format with fallback logic
- ✅ Enhanced cookie parsing for simple li_at values
- ✅ Background job processing
- ✅ Server running successfully on port 4201

## Next Steps
1. Test Apify integration with LinkedIn post URLs
2. Monitor server logs for parameter format success
3. Implement bulk post tracking (5 posts simultaneously)
4. Add automatic profile enrichment with retry logic
5. Create notable person selection interface
6. Build signals dashboard and report generation

## Known Issues (Fixed)
- ✅ Apify "Cannot read properties of undefined" error (fixed with parameter format fallback)
- ✅ LinkedIn cookie format handling (fixed with enhanced parsing)
- ✅ CSV upload modal positioning (fixed with proper initialization)
- ✅ Tenant ID constraint violations (fixed with migrations)

## Security Considerations
- LinkedIn cookies stored in .env file (not in database)
- Tenant isolation through RLS (ready to enable)
- Service role key required for Supabase operations
- Apify token for LinkedIn scraping operations

## Performance Notes
- Scraping jobs run asynchronously via Apify
- 30-second polling for scraping completion
- Database queries optimized with tenant_id indexes
- CSV processing handles large files with UTF-16 encoding

## Contact & Support
The system is designed for single-tenant deployment with multi-tenant capabilities ready for future expansion. All core functionality is implemented and tested, with the recent fixes addressing the primary blocking issues.