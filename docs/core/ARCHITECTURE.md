# System Architecture - Signals & Actions Lite

## 🏗️ High-Level Architecture

**Signals & Actions** is a LinkedIn engagement analytics platform that tracks post interactions, enriches contact data, and provides CRM pipeline functionality for B2B sales and marketing teams.

### Core Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Proxy      │    │   External APIs │
│   (Vanilla JS)  │◄──►│   (Express.js)   │◄──►│   LinkedIn API  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│   Supabase DB   │                            │   Apify Scraper │
│   (PostgreSQL)  │◄───────────────────────────┤   (LinkedIn)    │
└─────────────────┘                            └─────────────────┘
```

## 📱 Frontend Architecture

### Technology Stack
- **Framework**: Vanilla JavaScript (no build process)
- **Styling**: Tailwind CSS + Custom Swiss Design System
- **State Management**: Global app objects with async/await patterns
- **Routing**: Hash-based navigation + multi-page architecture

### Page Structure
```
index.html                 # Main dashboard with multiple views
├── #dashboard             # Overview metrics and quick actions
├── #people                # People list and filtering
├── #companies             # Company aggregation view
├── #posts                 # Posts table view
└── #campaigns             # Campaign management

Standalone Pages:
├── post-analysis.html     # Individual post engagement analysis
├── person-detail.html     # Individual person profile
├── company-detail.html    # Company engagement summary
├── strategies.html        # Strategic planning and personas
├── signals.html           # Advanced analytics dashboard
└── pipeline.html          # CRM pipeline management
```

### Design System
- **Components**: `.metric-card`, `.data-table`, `.profile-photo`, `.data-pill`
- **Navigation**: Consistent sidebar with active state management
- **Color Coding**: Semantic colors for engagement levels and status
- **Responsive**: Mobile-first with sidebar overlay on small screens

## 🗄️ Database Architecture

### Core Tables
- **posts**: LinkedIn posts being tracked
- **persons**: Individual people who engage with posts
- **companies**: Companies derived from person profiles
- **engagements**: Individual reactions, comments, shares
- **campaigns**: LinkedIn advertising campaigns
- **audience_segments**: Targeting criteria for campaigns

### Key Relationships
```sql
posts (1) ──── (many) engagements (many) ──── (1) persons
persons (many) ──── (1) companies
campaigns (1) ──── (many) posts
audience_segments (1) ──── (many) engagements
```

### Multi-Tenancy
All tables include `tenant_id` for supporting multiple clients/accounts.

## 🔌 API Integrations

### 1. LinkedIn Marketing API
- **Purpose**: Campaign data, targeting, analytics
- **Architecture**: Proxied through Express.js server (CORS + auth handling)
- **Rate Limiting**: 500 requests/hour with caching
- **Authentication**: OAuth 2.0 with refresh token support

### 2. Apify LinkedIn Scraper
- **Purpose**: Post engagement data (reactions, comments)
- **Actor**: `curious_coder/linkedin-post-reactions-scraper`
- **Data Flow**: Run ID → Fetch results → Parse → Store in Supabase
- **Rate Limiting**: Managed by Apify platform

### 3. Supabase
- **Purpose**: Primary database, real-time updates, authentication
- **Client**: JavaScript SDK with service role key
- **Features**: Row Level Security, automatic timestamps, JSON storage

## 🔄 Data Flow

### 1. Post Import Workflow
```
LinkedIn Post URL → Apify Scraper → JSON Results → Parse → Supabase
                                              ↓
Profile Data → Company Extraction → Person Records → Engagement Records
```

### 2. Real-time Analytics
```
User Action → Frontend → Supabase Query → Aggregated Results → UI Update
```

### 3. Campaign Integration
```
LinkedIn API → Proxy Server → Frontend → Campaign Management → Audience Targeting
```

## 🛡️ Security Architecture

### Authentication
- **Frontend**: Supabase service role key (stored in config.js)
- **API Proxy**: LinkedIn OAuth tokens (environment variables)
- **Database**: Row Level Security policies

### Data Protection
- **API Keys**: Excluded from Git via .gitignore
- **CORS**: Restricted to localhost during development
- **Rate Limiting**: Implemented at proxy layer

## 📊 Performance Considerations

### Frontend Optimization
- **Lazy Loading**: Tables paginate at 50 records
- **Caching**: API responses cached for 5 minutes
- **Debouncing**: Search inputs debounced to 300ms

### Database Optimization
- **Indexes**: On frequently queried columns (linkedin_url, post_id, person_id)
- **Views**: Pre-computed aggregations for dashboard metrics
- **Batch Operations**: Bulk inserts for large imports

## 🔧 Development Architecture

### Local Development
```bash
# Frontend (Python HTTP server)
cd app && python3 -m http.server 4200

# API Proxy (Node.js)
cd api-proxy && npm start  # Port 3001

# Database
# Supabase hosted instance
```

### File Structure
```
app/
├── index.html              # Main application
├── components/             # Reusable UI components
├── services/              # API integration services
├── styles/               # CSS and design system
└── config.js            # Configuration (not in Git)

api-proxy/
├── server.js            # Express.js LinkedIn proxy
└── package.json        # Node.js dependencies

database/
├── schema.sql          # Complete database schema
└── migrations/         # Database migration files

docs/                   # Documentation (this file)
```

## 🚀 Deployment Architecture

### Current Deployment
- **Frontend**: Python HTTP server (development)
- **API Proxy**: Local Node.js server
- **Database**: Supabase cloud (production)

### Production Considerations
- **Frontend**: Static hosting (Vercel, Netlify)
- **API Proxy**: Serverless functions or container deployment
- **CDN**: For static assets and caching
- **Monitoring**: Error tracking and performance monitoring

## 🔄 State Management

### Global State
- **Supabase Client**: Initialized once, used globally
- **Current User**: Stored in localStorage
- **Filters**: URL hash parameters for bookmarkable states

### Data Synchronization
- **Real-time**: Supabase subscriptions for live updates
- **Optimistic Updates**: UI updates before server confirmation
- **Error Handling**: Graceful degradation with retry logic

## 📈 Scalability Considerations

### Current Limits
- **Records**: ~1000 people, ~100 companies tested
- **Concurrent Users**: Single tenant architecture
- **API Calls**: LinkedIn rate limits (500/hour)

### Scaling Strategy
- **Database**: PostgreSQL can handle millions of records
- **Frontend**: Pagination and virtualization for large datasets
- **Multi-tenancy**: Tenant isolation at database level
- **Caching**: Redis for frequently accessed data

This architecture provides a solid foundation for the current feature set while being extensible for future enhancements like advanced analytics, automation workflows, and integrations with external CRM systems.