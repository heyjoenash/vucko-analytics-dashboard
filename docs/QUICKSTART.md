# Quickstart Guide - Signals & Actions

Get up and running with the LinkedIn engagement analytics platform in 5 minutes.

## ⚡ 5-Minute Setup

### Prerequisites
- **Python 3.x** (for frontend server)
- **Node.js & npm** (for API proxy)
- **Supabase account** (database)
- **LinkedIn API access** (optional for campaigns)
- **Apify account** (for data scraping)

### 1. Clone Repository
```bash
git clone https://github.com/heyjoenash/signals-actions-lite.git
cd signals-actions-lite
```

### 2. Configure API Keys
```bash
# Copy configuration template
cp app/config.example.js app/config.js

# Edit with your API keys
nano app/config.js
```

**Required Configuration**:
```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_SERVICE_ROLE_KEY'
};

const APIFY_CONFIG = {
    token: 'YOUR_APIFY_API_TOKEN',
    actorId: 'curious_coder/linkedin-post-reactions-scraper'
};
```

### 3. Set Up Database
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard)
2. Copy and run: `database/schema.sql`
3. Copy and run: `database/migrations/fix_tenant_constraints.sql`

### 4. Install Dependencies
```bash
cd api-proxy
npm install
cd ..
```

### 5. Start the Application
```bash
# Terminal 1: Frontend
cd app && python3 -m http.server 4200

# Terminal 2: API Proxy (if using LinkedIn features)
cd api-proxy && npm start
```

### 6. Access the Application
Open http://localhost:4200 in your browser.

## 🎯 First Steps

### Import Sample Data
1. Click **"Import Data"** in the sidebar
2. Select **"From Apify Run"**
3. Enter Run ID: `qEDjxfcGtjl6vcMZk` (test data)
4. Click **"Import"**
5. Wait for import to complete (~30 seconds)

You should see:
- 283 people imported
- 126 companies aggregated
- Engagement data in dashboard

### Explore the Interface
- **Dashboard**: Overview metrics and quick actions
- **People**: Browse individual LinkedIn profiles
- **Companies**: View company-level engagement
- **Posts**: Analyze individual post performance

## 🔧 Configuration Details

### Supabase Setup
1. Create new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API**
3. Copy **URL** and **service_role key** (not anon key)
4. Update `SUPABASE_CONFIG` in `app/config.js`

### Apify Setup
1. Sign up at [apify.com](https://apify.com)
2. Go to **Settings > Integrations**
3. Copy **API Token**
4. Update `APIFY_CONFIG` in `app/config.js`

### LinkedIn API Setup (Optional)
1. Create LinkedIn Developer App
2. Get OAuth 2.0 access token
3. Add to `api-proxy/.env`:
```bash
LINKEDIN_ACCESS_TOKEN=your_token_here
```

## 📊 Understanding the Data

### Data Sources
- **Primary**: Apify LinkedIn post reactions scraper
- **Secondary**: LinkedIn Marketing API (campaigns)
- **Manual**: User-entered overrides and notes

### Data Flow
```
LinkedIn Post → Apify Scraper → Raw JSON → Parse & Transform → Supabase → Dashboard
```

### Key Metrics
- **People**: Individuals who engage with posts
- **Companies**: Aggregated from person profiles
- **Engagements**: Likes, comments, shares
- **Engagement Score**: Calculated based on frequency and type

## 🚨 Troubleshooting

### Common Issues

#### "Cannot access 'supabase' before initialization"
**Solution**: Check `app/config.js` exists with proper Supabase configuration.

#### Import fails with "tenant_id constraint violation"
**Solution**: Run the tenant migration:
```sql
-- In Supabase SQL Editor
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tenants (id, name) VALUES 
('00000000-0000-0000-0000-000000000001', 'Default Tenant')
ON CONFLICT (id) DO NOTHING;
```

#### Profile photos not loading
**Known Issue**: LinkedIn image URLs may have access restrictions. This is cosmetic and doesn't affect functionality.

#### API proxy not connecting
**Solution**: 
1. Ensure Node.js is installed
2. Check port 3001 is not in use: `lsof -ti:3001`
3. Install dependencies: `cd api-proxy && npm install`

### Reset Everything
```bash
# Kill servers
lsof -ti:4200,3001 | xargs kill -9

# Reset config
cp app/config.example.js app/config.js
# Edit with your keys

# Clear browser data
# In browser console:
localStorage.clear(); location.reload();

# Restart
cd app && python3 -m http.server 4200
```

## 📈 Next Steps

### Basic Usage
1. **Import more data**: Get LinkedIn post URLs and scrape with Apify
2. **Explore filtering**: Use tabs to filter by engagement level
3. **Export data**: Download CSV for external analysis
4. **Review companies**: Identify high-engagement organizations

### Advanced Features
1. **Set up LinkedIn campaigns**: Connect Marketing API for campaign data
2. **Configure enrichment**: Add profile enrichment workflows
3. **Custom personas**: Define target audience segments
4. **CRM pipeline**: Track leads through sales process

### Development
1. **Read the docs**: Explore `docs/` directory for detailed guides
2. **Customize UI**: Modify Swiss Design System components
3. **Add features**: Extend functionality with new views/analysis
4. **Deploy**: Set up production hosting

## 📚 Additional Resources

- **Architecture**: `docs/ARCHITECTURE.md` - System overview
- **Database**: `docs/DATABASE.md` - Schema and relationships  
- **APIs**: `docs/API_INTEGRATIONS.md` - Integration details
- **Development**: `docs/claude-code/COMMANDS.md` - Common workflows
- **Current Status**: `docs/claude-code/CURRENT_STATE.md` - Live project state

## 🆘 Getting Help

### Emergency Recovery
If something goes wrong, check `docs/claude-code/SESSION_HANDOFF.md` for complete recovery procedures.

### Debug Information
```bash
# Check server status
curl http://localhost:4200
curl http://localhost:3001/health

# Check database connection (in browser console)
supabaseClient.from('tenants').select('*').then(console.log);
```

### Support
- **Documentation**: Comprehensive guides in `docs/` directory
- **Code Issues**: Check browser console for JavaScript errors
- **Database Issues**: Use Supabase dashboard for SQL debugging

---

**Success**: If you can see the dashboard with metrics and import sample data successfully, you're ready to start analyzing LinkedIn engagement data! 🎉