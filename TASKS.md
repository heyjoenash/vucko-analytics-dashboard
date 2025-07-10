# Current Tasks
## Phase 1: Navigation & Foundation (CRITICAL)

## 🚨 **IMMEDIATE PRIORITY** (Today)
- [ ] **Fix navigation routing issues**
  - [ ] Standardize tab order: Dashboard → Posts → People → Companies → Campaigns
  - [ ] Add URL fragment handling to index.html initialization
  - [ ] Fix detail page routing (currently all route to dashboard)
  - [ ] Ensure consistent navigation functions across all pages

## 🔥 **In Progress - Phase 1** (This Week)
- [ ] **Add Posts count to dashboard stats**
  - [ ] Update dashboard grid to include Posts stat
  - [ ] Update updateStats() function in index.html
  
- [ ] **Create basic Campaigns table view**
  - [ ] Add campaigns view to index.html
  - [ ] Connect to campaigns database table
  - [ ] Create basic campaign-detail.html page
  
- [ ] **Database schema updates**
  - [ ] Add notable, notable_reason columns to persons table
  - [ ] Add lead_status, title_override, company_override columns
  - [ ] Add tenant_id to campaigns table
  - [ ] Test all schema changes

## 📋 **Recently Completed**
- [x] Swiss Design System implementation across all pages
- [x] Full page detail views (no modals)
- [x] Person detail page with engagement history
- [x] Company detail page with team analysis  
- [x] Post analysis layout reorganization (patterns moved to top-right)
- [x] Fixed table layouts with proper column sizing
- [x] Consistent component library (metric-card, data-table, data-pill)

## 🎯 **Next Phase 2 Prep** (Week 2)
- [ ] Design person classification system (Followers/Target/High Value/Notable)
- [ ] Plan Notable column implementation  
- [ ] Design lead status management workflow
- [ ] Plan campaign-post relationship implementation

## 🐛 **Bugs to Fix**
- [x] ~~Navigation inconsistency between pages~~ → CRITICAL PRIORITY
- [x] ~~Tab order differences~~ → CRITICAL PRIORITY  
- [x] ~~Broken routing from detail pages~~ → CRITICAL PRIORITY
- [ ] Silent database insert failures (investigate)
- [ ] Verify tenant_id requirements across all tables

## 🎨 **Design System Notes**
- Swiss Design system established as standard
- Component patterns working well
- Sticky navigation implemented
- Profile photos with error handling working
- Need to maintain consistency as we add new pages

## 📊 **Architecture Decisions**
- **Navigation**: Standardized tab order across all pages
- **Routing**: URL fragments for main app, separate pages for details
- **Classification**: Followers/Target/High Value/Notable system defined
- **Database**: Enhanced persons table for better data relationships
- **Future**: Sidebar navigation may be needed as we grow

## 📝 **Implementation Notes**
- Current dataset: 283 people, 65 high-value prospects
- Design system is solid foundation for all new features
- Database schema supports planned features
- Focus on navigation fixes before adding new functionality

## 🚀 **Digital Ocean Deployment**
- **Droplet**: signals-enrichment-prod (138.197.68.48)
- **Service Directory**: /opt/signals-enrichment
- **Cron Jobs**: Process every 15 min, auto-queue daily at 9 AM, stats at 6 PM
- **Logs**: /var/log/enrichment/*.log
- **Status**: ✅ Active and processing