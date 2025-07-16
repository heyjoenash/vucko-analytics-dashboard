# Signals & Actions - LinkedIn Analytics Platform

A comprehensive LinkedIn analytics platform with Swiss minimal design. This application provides unified navigation and clean table → detail views for all LinkedIn engagement data.

## Overview

This is a single-page application with:
- **Swiss Minimal Design** - Clean, monochrome interface with no decorative elements
- **Unified Navigation** - Consistent sidebar across all pages
- **Table → Detail Pattern** - Every page follows the same navigation pattern
- **Database Integration** - All data stored in Supabase with proper relationships
- **Responsive Layout** - Works on all screen sizes

## Core Pages

### Overview
- **Dashboard** (`index.html`) - Main metrics and quick import
- **Signals & Actions** (`signals-actions.html`) - People prioritized by engagement
- **Weekly Report** (`weekly-report.html`) - Performance summaries

### Content
- **Content Calendar** (`content-calendar.html`) - Visual calendar view
- **Content Database** (`content-database.html`) - All posts and content

### Campaigns
- **Audiences** (`audiences.html`) - LinkedIn audience segments
- **Campaigns** (`campaigns.html`) - Campaign management and tracking

### Contacts
- **People** (`people.html`) - Individual LinkedIn contacts
- **Companies** (`companies.html`) - Company aggregations

### Strategy
- **Personas** (`personas.html`) - User-defined target personas

## Detail Pages

- **Person Detail** (`person-detail.html`) - Individual contact analysis
- **Company Detail** (`company-detail.html`) - Company-level insights
- **Post Detail** (`post-detail.html`) - Post performance analysis
- **Campaign Detail** (`campaign-detail.html`) - Campaign performance

## File Structure

```
app/
├── index.html              # Main dashboard
├── *.html                  # Core application pages
├── styles/
│   └── swiss-minimal.css   # Core design system
├── config.js               # API configuration
├── vercel.json            # Deployment configuration
└── debug/                 # Development/test files
```

## Design System

The application uses a Swiss minimal design system with:
- **Colors**: Only black, white, and shades of gray
- **Typography**: Inter font family
- **Components**: Consistent buttons, badges, tables, and forms
- **No Emojis**: Pure text-based interface
- **Clean Tables**: Minimal borders, consistent spacing

## Key Features

### Navigation
- **Unified Sidebar** - Same navigation on every page
- **Active States** - Current page highlighted
- **Consistent Icons** - Font Awesome icons throughout

### Data Tables
- **Clickable Rows** - Click any row to view details
- **Filter Pills** - Count badges for each filter
- **Search Input** - Real-time search across all tables
- **Empty States** - Clear messaging when no data

### Database Integration
- **Supabase Backend** - All data stored with proper relationships
- **Fallback Data** - Sample data when database unavailable
- **Real-time Updates** - Live data loading

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set build command: `# No build needed`
3. Set output directory: `app`
4. Deploy automatically

### Manual Deployment
1. Upload the entire `app` folder to your web server
2. Ensure all `.html`, `.css`, and `.js` files are accessible
3. Configure your web server to serve static files

## Configuration

### API Keys
Update `config.js` with your API keys:
```javascript
const SUPABASE_CONFIG = {
    url: 'your-supabase-url',
    anonKey: 'your-supabase-anon-key'
};
```

### Database Setup
1. Create a Supabase project
2. Run the migrations in `../database/migrations/`
3. Configure Row Level Security (RLS) as needed

## Development

### Local Development
```bash
cd app
python3 -m http.server 4200
# Open http://localhost:4200
```

### File Organization
- **Core Pages**: Main application files in root
- **Debug Files**: Development/test files in `debug/` folder
- **Styles**: All CSS in `styles/` folder

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **CSS Grid**: Required for layout
- **ES6**: Required for JavaScript features

## Performance

- **No Build Step**: Direct HTML/CSS/JS files
- **Minimal Dependencies**: Only Font Awesome and Supabase
- **Fast Loading**: Optimized for quick page loads
- **Responsive**: Mobile-first design

## Maintenance

### Adding New Pages
1. Create new HTML file following the pattern
2. Use `swiss-minimal.css` for styling
3. Include standard sidebar navigation
4. Follow table → detail pattern

### Updating Design
- All design tokens are in `swiss-minimal.css`
- Use CSS variables for consistency
- Maintain monochrome color scheme

## Support

For issues or questions about this platform, please refer to the project documentation or contact the development team.