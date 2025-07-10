# Signals & Actions - LinkedIn Engagement Tracker

A ultra-lightweight tool for tracking and analyzing LinkedIn post engagements to identify hot prospects and build targeted campaigns.

## 🚀 Quick Start

```bash
# Start the app
cd app && python3 -m http.server 4200

# Or use the serve script
./scripts/serve.sh

# Open in browser
http://localhost:4200
```

## 🎯 Features

- **Import LinkedIn Engagements** - Via Apify Run ID or JSON paste
- **People Management** - Track who's engaging with your content
- **Company Insights** - See which companies are most engaged
- **Hot Prospects** - Automatically identify highly engaged users (5+ interactions)
- **Export to CSV** - Get your data out for CRM import
- **Zero Build Process** - Just HTML/JS/CSS, no compilation needed

## 📁 Project Structure

```
signals-actions-lite/
├── README.md              # You are here
├── CLAUDE.md             # Claude Code session context
├── CHANGELOG.md          # Version history
├── ROADMAP.md           # Future features
├── TASKS.md             # Current sprint tasks
│
├── app/                 # Single-page application
│   ├── index.html      # Complete app in one file
│   ├── config.js       # API keys & settings
│   └── data/           # Sample data
│       └── sample-import.json
│
├── docs/               # Documentation
├── scripts/            # Utility scripts
│   └── serve.sh       # Start the server
│
└── archive/           # Previous implementation
    ├── backend/       # Old FastAPI code
    └── frontend/      # Old multi-file frontend
```

## 🔧 Configuration

Edit `app/config.js` to update:
```javascript
const SUPABASE_CONFIG = {
    url: 'your-supabase-url',
    anonKey: 'your-anon-key'
};

const APIFY_CONFIG = {
    token: 'your-apify-token'
};
```

## 💡 Usage

### Import Data

1. **From Apify**: 
   - Run the LinkedIn Post Reactions scraper on Apify
   - Copy the Run ID (e.g., `qEDjxfcGtjl6vcMZk`)
   - Click "Import Data" and paste the Run ID

2. **From JSON**:
   - Click "Import Data"
   - Paste JSON data directly
   - Use `app/data/sample-import.json` for testing

### View People

- Navigate to "People" tab to see all engaged users
- Search by name, company, or title
- Click any person for detailed view
- Star ratings show engagement level

### Company Insights

- Navigate to "Companies" tab
- See aggregated engagement by company
- Identify which organizations are most interested
- Sort by total engagements or average score

### Export Data

- Click "Export CSV" for all people
- Export individual people from detail view
- CSV includes all fields for CRM import

## 🗄️ Database Schema

Uses Supabase with these tables:
- `persons` - LinkedIn profiles who engaged
- `posts` - LinkedIn posts being tracked
- `engagements` - Individual engagement records
- `campaigns` - Campaign groupings

## 🐛 Troubleshooting

### Import shows success but no data appears?
- The database might have `tenant_id` constraints
- Check browser console for errors
- Try the JSON import with sample data

### Can't connect to Supabase?
- Verify `config.js` has correct URL and key
- Check if tables exist in Supabase
- Ensure anon key has proper permissions

### Server won't start?
- Make sure port 4200 is free
- Use `lsof -i :4200` to check
- Kill any existing process

## 📚 For Developers

This is a **single-file application** for maximum simplicity:
- No build process or npm install
- Direct Supabase client-side SDK
- Vanilla JavaScript (no framework dependencies)
- Tailwind CSS via CDN
- Font Awesome icons

To modify:
1. Edit `app/index.html`
2. Refresh browser
3. That's it!

### Key Design Decisions

1. **No Backend Server** - Direct Supabase connection
2. **Single File** - Everything in index.html
3. **CDN Dependencies** - No node_modules
4. **Local State** - Simple JavaScript objects
5. **Copy-Paste First** - Manual but reliable

## 🚦 Session Management

For Claude Code users, check `CLAUDE.md` for:
- Current state and what's working
- Recent changes
- Common commands
- Known issues

## 📈 Performance

- Handles 1000+ engagements smoothly
- Instant search/filter
- No server round-trips for UI updates
- Exports large CSVs without issues

## 🔐 Security Note

This app uses Supabase anon keys which are safe to expose in client-side code. Row Level Security (RLS) should be configured in Supabase for production use.

---

Built for speed, simplicity, and getting things done. 🚀