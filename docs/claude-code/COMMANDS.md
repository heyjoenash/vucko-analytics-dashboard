# Common Development Commands & Workflows

## 🚀 Quick Start Commands

### Start the Application
```bash
# Frontend (Primary application)
cd app && python3 -m http.server 4200
# Access at: http://localhost:4200

# API Proxy (LinkedIn API integration)
cd api-proxy && npm start
# Runs on: http://localhost:3001

# Both servers needed for full functionality
```

### Stop Servers
```bash
# Kill Python server
lsof -ti:4200 | xargs kill -9

# Kill Node.js server  
lsof -ti:3001 | xargs kill -9

# Kill both with one command
lsof -ti:4200,3001 | xargs kill -9
```

## 🗄️ Database Operations

### Check Database Connection
```sql
-- In Supabase SQL Editor
SELECT 
    schemaname,
    tablename,
    tableowner 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Verify Tenant Setup
```sql
-- Check if tenants table exists
SELECT * FROM tenants;

-- If missing, create it:
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tenants (id, name) VALUES 
('00000000-0000-0000-0000-000000000001', 'Default Tenant')
ON CONFLICT (id) DO NOTHING;
```

### Run Migrations
```bash
# Copy contents of migration file and run in Supabase SQL Editor
cat database/migrations/fix_tenant_constraints.sql
# Then paste and execute in Supabase
```

### Reset Database (CAUTION)
```sql
-- Delete all data (DESTRUCTIVE)
TRUNCATE persons, engagements, posts, companies CASCADE;

-- Reset sequences
ALTER SEQUENCE persons_id_seq RESTART WITH 1;
ALTER SEQUENCE posts_id_seq RESTART WITH 1;
ALTER SEQUENCE companies_id_seq RESTART WITH 1;
ALTER SEQUENCE engagements_id_seq RESTART WITH 1;
```

## 📊 Data Import & Testing

### Test Import with Known Good Data
```javascript
// In browser console on http://localhost:4200
app.importFromApify('qEDjxfcGtjl6vcMZk', '');
// Should import 283 engagement records
```

### Check Import Status
```sql
-- Count records by table
SELECT 
    'persons' as table_name, COUNT(*) as record_count 
FROM persons WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
    'companies' as table_name, COUNT(*) as record_count 
FROM companies WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
    'engagements' as table_name, COUNT(*) as record_count 
FROM engagements WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
    'posts' as table_name, COUNT(*) as record_count 
FROM posts WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
```

### Export Data
```javascript
// Export people to CSV
app.exportCSV();

// Export companies to CSV  
app.exportCompaniesCSV();
```

## 🔧 Development Workflows

### Full Development Setup
```bash
# 1. Clone repository
git clone https://github.com/heyjoenash/signals-actions-lite.git
cd signals-actions-lite

# 2. Set up configuration
cp app/config.example.js app/config.js
# Edit app/config.js with your API keys

# 3. Install API proxy dependencies
cd api-proxy
npm install
cd ..

# 4. Start servers
cd app && python3 -m http.server 4200 &
cd api-proxy && npm start &

# 5. Open application
open http://localhost:4200
```

### Code Changes Workflow
```bash
# 1. Make changes to files
# 2. No build process needed (vanilla JS)
# 3. Refresh browser to see changes
# 4. For API proxy changes, restart Node server:
cd api-proxy && npm restart
```

### Git Workflow
```bash
# Check status
git status

# Add files (avoid config.js)
git add .
git reset app/config.js  # Exclude config file

# Commit changes
git commit -m "Description of changes"

# Push to remote
git push origin main
```

## 🐛 Debugging Commands

### Check Frontend Console Errors
```javascript
// In browser console
console.log('Supabase client:', supabaseClient);
console.log('App state:', app);
console.log('Current data:', {
    people: window.currentData?.people?.length,
    companies: window.currentData?.companies?.length
});
```

### Test API Connections
```bash
# Test LinkedIn API proxy
curl http://localhost:3001/health

# Test Supabase connection (in browser console)
supabaseClient.from('tenants').select('*').then(console.log);

# Test Apify connection (in browser console)
fetch('https://api.apify.com/v2/acts/curious_coder%2Flinkedin-post-reactions-scraper/runs', {
    headers: { 'Authorization': 'Bearer ' + APIFY_CONFIG.token }
}).then(r => r.json()).then(console.log);
```

### Debug Profile Photos
```javascript
// Test image loading
const testImage = new Image();
testImage.onload = () => console.log('Image loaded successfully');
testImage.onerror = () => console.log('Image failed to load');
testImage.src = 'LINKEDIN_IMAGE_URL_HERE';
```

### Database Query Debugging
```sql
-- Find records with missing data
SELECT * FROM persons WHERE profile_picture IS NULL LIMIT 10;
SELECT * FROM persons WHERE current_company IS NULL LIMIT 10;

-- Check engagement distribution
SELECT 
    post_id, 
    COUNT(*) as engagement_count 
FROM engagements 
GROUP BY post_id 
ORDER BY engagement_count DESC;

-- Find orphaned records
SELECT * FROM engagements 
WHERE person_id NOT IN (SELECT id FROM persons);
```

## 📱 API Testing Commands

### LinkedIn API via Proxy
```bash
# Test connection
curl "http://localhost:3001/api/linkedin/test"

# Get ad accounts
curl "http://localhost:3001/api/linkedin/accounts"

# Test with authorization
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3001/api/linkedin/accounts"
```

### Apify API Direct
```bash
# Get run status
curl -H "Authorization: Bearer apify_api_YOUR_TOKEN" \
     "https://api.apify.com/v2/acts/curious_coder%2Flinkedin-post-reactions-scraper/runs/qEDjxfcGtjl6vcMZk"

# Get run results
curl -H "Authorization: Bearer apify_api_YOUR_TOKEN" \
     "https://api.apify.com/v2/datasets/DATASET_ID/items"
```

## 🔄 Maintenance Commands

### Clean Up Development Environment
```bash
# Clean Node modules
cd api-proxy && rm -rf node_modules && npm install

# Clear browser cache and local storage
# In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Update Dependencies
```bash
# Update API proxy dependencies
cd api-proxy && npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

### Log Analysis
```bash
# Check server logs
cd api-proxy && npm start 2>&1 | tee server.log

# Python server doesn't log much, but you can redirect:
cd app && python3 -m http.server 4200 2>&1 | tee app.log
```

## 🚨 Emergency Recovery Commands

### Complete Application Reset
```bash
# 1. Kill all servers
lsof -ti:4200,3001 | xargs kill -9

# 2. Reset configuration
cp app/config.example.js app/config.js
# Edit with your API keys

# 3. Reset database (if needed)
# Run tenant migration in Supabase

# 4. Restart servers
cd app && python3 -m http.server 4200 &
cd api-proxy && npm start &
```

### Fix Broken Imports
```sql
-- Reset import state
UPDATE persons SET profile_enriched = false;
DELETE FROM engagements WHERE created_at > NOW() - INTERVAL '1 hour';
-- Then retry import
```

### Recover from Git Issues
```bash
# Reset to last working commit
git log --oneline
git reset --hard COMMIT_HASH

# If config.js was committed accidentally
git rm --cached app/config.js
echo "app/config.js" >> .gitignore
git commit -m "Remove config.js from tracking"
```

## 📋 Health Check Commands

### Full System Health Check
```bash
# 1. Check ports
lsof -ti:4200,3001

# 2. Check processes
ps aux | grep python
ps aux | grep node

# 3. Test application endpoints
curl -s http://localhost:4200 | head -10
curl -s http://localhost:3001/health

# 4. Check database (in browser console)
supabaseClient.from('tenants').select('count').single().then(console.log);
```

### Performance Check
```sql
-- Database performance
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY tablename, attname;
```

---

**Note**: Always ensure you have proper API keys configured before running any commands that interact with external APIs. Keep the `app/config.js` file secure and never commit it to Git.