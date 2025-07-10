# Claude Code Session Handoff Template

Use this template when starting a new Claude Code session or handing off work to another AI assistant.

## 🎯 Current Session Context

### Project: Signals & Actions - LinkedIn Engagement Analytics
**Last Updated**: 2025-01-10
**Repository**: https://github.com/heyjoenash/signals-actions-lite

## 🚀 Quick Start Commands

### Start the Application
```bash
# Frontend (runs on http://localhost:4200)
cd app && python3 -m http.server 4200

# API Proxy (runs on http://localhost:3001) 
cd api-proxy && npm start

# Database: Supabase hosted at https://misuahtcociqkmkajvrw.supabase.co
```

### Essential Files to Review First
1. `CLAUDE.md` - Current project state and context
2. `docs/ARCHITECTURE.md` - System overview
3. `docs/DATABASE.md` - Database schema and relationships
4. `app/index.html` - Main application file

## 📋 Current Status

### ✅ What's Working
- [x] Single-file app built and running on http://localhost:4200
- [x] Supabase integration configured with service_role key
- [x] Import modal with Apify & JSON options (100% success rate)
- [x] People list view (283 people imported and displaying)
- [x] Company aggregation view (126 companies)
- [x] Dashboard with comprehensive stats
- [x] Export to CSV functionality
- [x] Posts view with table and enhanced detail modal
- [x] Profile photos displaying in engagement tables
- [x] Swiss Design System implemented consistently
- [x] GitHub repository setup with clean commit history
- [x] API keys properly excluded from version control

### 🐛 Known Issues
- [ ] **Profile photos not showing consistently** - Add error handling, test with real data
- [ ] **Company data needs enrichment** - Inaccurate/missing company information
- [ ] **Manual override UI missing** - Need ability to edit company/title in person modal
- [ ] **Engagement distribution** - Engagements not properly linked to posts in some views

### 🚨 Critical Information
- **Database Tenant Issue**: Fixed with migration in `database/migrations/fix_tenant_constraints.sql`
- **Default Tenant ID**: `00000000-0000-0000-0000-000000000001`
- **API Configuration**: All keys in `app/config.js` (excluded from Git)
- **Test Data**: Apify Run ID `qEDjxfcGtjl6vcMZk` has 283 engagement records

## 🎯 Immediate Priorities

### High Priority (Next 24-48 Hours)
1. **Fix Profile Photos** - Debug image loading, add error handling
2. **Add Manual Override UI** - Edit company/title in person modal  
3. **Debug Import Process** - Log data structure, verify photo URLs
4. **Create Test Scripts** - Verify photo loading, test enrichment

### Medium Priority (Next Week)
1. **Integrate Profile Enricher** - lukaskrivka/linkedin-profile-scraper
2. **Build Enrichment Service** - Batch processing, retry logic
3. **Create Enrichment Dashboard** - Track status, costs, failures
4. **Implement Advanced Filtering** - Target personas, high-value prospects

## 🗂️ Project Structure

### Key Directories
```
app/                    # Frontend application
├── index.html         # Main dashboard
├── config.js          # API configuration (not in Git)
├── components/        # Reusable UI components
├── services/          # API integration services
└── styles/           # Swiss Design System CSS

api-proxy/             # LinkedIn API proxy server
├── server.js         # Express.js proxy
└── package.json      # Node.js dependencies

database/             # Database schema and migrations
├── schema.sql       # Complete database schema
└── migrations/      # Database migration files

docs/                # Documentation (newly created)
├── ARCHITECTURE.md  # System architecture overview
├── DATABASE.md      # Database schema guide
└── API_INTEGRATIONS.md # API integration guide
```

### Critical Files
- `app/config.js` - Contains all API keys (not in Git)
- `app/index.html` - Main application (2000+ lines)
- `database/schema.sql` - Complete database schema
- `CLAUDE.md` - Project instructions and current state

## 🔧 Technical Context

### Technology Stack
- **Frontend**: Vanilla JavaScript + Tailwind CSS + Swiss Design System
- **Database**: PostgreSQL via Supabase
- **API Proxy**: Express.js for LinkedIn API
- **Data Source**: Apify LinkedIn scraper

### Data Flow
```
LinkedIn Post → Apify Scraper → JSON Data → Parse → Supabase → Frontend
```

### Key Integrations
1. **Supabase**: Database operations with service_role key
2. **LinkedIn API**: Via Express.js proxy on port 3001
3. **Apify**: LinkedIn post reactions scraper

## 🎨 Design System

### Swiss Design System
- **Colors**: Semantic color coding for engagement levels
- **Components**: `.metric-card`, `.data-table`, `.profile-photo`
- **Layout**: Consistent sidebar navigation with mobile responsiveness
- **Typography**: Clean, readable fonts with proper hierarchy

### UI Patterns
- **Tables**: Fixed-width columns with proper data alignment
- **Modals**: Click-outside-to-close, detailed views
- **Navigation**: Hash-based routing for bookmarkable states
- **Status Indicators**: Color-coded pills for different states

## 🗄️ Database Context

### Core Tables
- **posts**: LinkedIn posts being tracked
- **persons**: People who engage with posts (283 records)
- **companies**: Companies aggregated from person profiles (126 records)
- **engagements**: Individual interactions (reactions, comments, shares)
- **campaigns**: LinkedIn advertising campaigns
- **audience_segments**: Targeting criteria for campaigns

### Multi-Tenancy
All tables include `tenant_id` UUID for supporting multiple clients.
Default tenant: `00000000-0000-0000-0000-000000000001`

## 🚨 Common Issues & Solutions

### Database Connection Issues
```sql
-- Check if tenants table exists
SELECT * FROM tenants;

-- If missing, run migration:
-- database/migrations/fix_tenant_constraints.sql
```

### Import Failures
- **Cause**: Usually missing tenant_id or malformed data
- **Solution**: Check DEFAULT_TENANT_ID in config.js
- **Test**: Use Apify Run ID `qEDjxfcGtjl6vcMZk`

### Profile Photos Not Loading
- **Issue**: URLs may be invalid or protected
- **Debug**: Check browser network tab for 403/404 errors
- **Solution**: Implement fallback placeholder system

## 📈 Performance Notes

### Current Scale
- **People**: 283 records (tested)
- **Companies**: 126 companies
- **Engagements**: 283 engagement records
- **Page Load**: Sub-second with current data volume

### Optimization
- **Database**: Proper indexes on frequently queried columns
- **Frontend**: Pagination at 50 records per page
- **API**: 5-minute cache for LinkedIn API responses

## 🎯 User Workflow Context

### Primary Use Cases
1. **Import LinkedIn engagement data** from Apify
2. **Analyze people** who engage with posts
3. **Track companies** with high engagement
4. **Export data** for external analysis
5. **Manage CRM pipeline** (planned)

### Key User Actions
- Import data via Apify Run ID
- Browse people/companies with filtering
- View detailed engagement history
- Export filtered data to CSV

## 🔮 Future Roadmap

### Planned Features
- Profile enrichment via additional Apify scrapers
- Advanced analytics dashboard
- CRM pipeline with lead status tracking
- LinkedIn campaign performance correlation
- Automated enrichment workflows

### Architecture Considerations
- Multi-tenant support for multiple clients
- Real-time updates via Supabase subscriptions
- Advanced filtering and search capabilities
- Integration with external CRM systems

## 🆘 Emergency Recovery

### If App Is Completely Broken
1. Check `SESSION_RECOVERY.md` for step-by-step fixes
2. Verify database connection to Supabase
3. Ensure `app/config.js` exists with proper API keys
4. Check browser console for JavaScript errors
5. Restart Python HTTP server: `cd app && python3 -m http.server 4200`

### If Database Issues
1. Run tenant migration: `database/migrations/fix_tenant_constraints.sql`
2. Check tenant_id constraints in all tables
3. Verify DEFAULT_TENANT_ID matches tenants table

### If Import Issues
1. Test with known working Run ID: `qEDjxfcGtjl6vcMZk`
2. Check Apify API token in config.js
3. Verify Supabase connection and permissions

---

**Remember**: This is a single-file application with sophisticated functionality. Always test changes thoroughly and maintain the Swiss Design System consistency. When in doubt, refer to the comprehensive documentation in the `docs/` directory.