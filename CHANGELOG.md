# Changelog

## [2.2.0] - 2025-01-10 (Evening Session)
### Critical Fixes
- **Database Schema Fix**: Resolved UUID vs INTEGER type mismatch in personas migration
- **Engagement Data Quality**: Fixed 162 vs 283 engagement discrepancy with orphaned records solution
- **Signals Heatmap**: Fixed broken CSS grid rendering on engagement heatmap
- **Navigation Consistency**: Renamed Actions → Pipeline to free up "Actions" for sequence workflows

### Added
- **Strategies Page**: Complete strategic planning interface with quarterly overview, strategic bets, target personas, and story matrix
- **Data Quality Migration**: Comprehensive script to fix orphaned engagement records with prevention triggers
- **LinkedIn API Analysis**: Full API capability assessment and hybrid approach planning

### Updated
- Sidebar navigation with new Strategies section
- Breadcrumb paths for all new pages
- Database migration scripts with proper type consistency

### Technical
- Enhanced error handling for engagement data imports
- Automated person record creation for orphaned engagements
- Improved data quality reporting views

## [2.1.0] - 2025-01-10
### Added
- **Personas Management Page** (`/app/personas.html`)
  - User-defined persona creation with templates
  - Title keywords (include/exclude) filtering
  - Seniority level selection
  - Company criteria configuration
  - Engagement score thresholds
  - Visual persona cards with color coding
- **Database Schema for Personas**
  - `personas` table for storing persona definitions
  - `targets` table for person-persona associations
  - `audience_segments` table for LinkedIn audiences
  - `match_person_to_personas()` function for automated matching
  - `persona_match_counts` view for statistics
- **UI Components**
  - Persona card component with visual indicators
  - Criteria tags for easy visualization
  - Template selection modal

### Updated
- Sidebar navigation to include Personas link
- Breadcrumb component with Personas path
- ROADMAP.md to reflect completed features
- Documentation to include new features

### Fixed
- Navigation routing for standalone pages
- Sidebar active state detection

## [2.0.0] - 2024-01-09
### Changed
- Complete architectural rebuild to ultra-lightweight approach
- Moved from FastAPI + Alpine.js to single-file HTML/JS solution
- Direct Supabase integration (no backend server)
- Archived previous implementation

### Fixed
- Frontend routing 404 errors
- Database insert failures (removed tenant_id requirement)

### Added
- CLAUDE.md for session continuity
- Clean folder structure
- Sample data for testing

## [1.0.0] - 2024-01-08
### Added
- Initial FastAPI backend
- Alpine.js frontend
- Apify integration
- Manual import functionality
- Campaign tracking features