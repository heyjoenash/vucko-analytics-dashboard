# People View - Campaign Source Implementation

## Overview
Successfully implemented campaign source indicators in the People view, allowing users to see which people came from LinkedIn campaigns vs organic engagement.

## Changes Made

### 1. Database Layer
- Created `get_people_with_campaign_source.sql` query that:
  - Identifies people who engaged with campaign posts
  - Calculates acquisition cost per person based on campaign spend
  - Adds campaign attribution metadata
  
- Created migration `007_create_people_campaign_source_view.sql` that:
  - Creates `people_with_campaign_source` view
  - Adds proper indexes for performance
  - Handles campaign cost allocation

### 2. UI Updates

#### Table Structure
- Added new "Campaign Source" column (20% width)
- Adjusted other column widths to accommodate new column
- Maintained responsive layout

#### Visual Indicators
- **Campaign-sourced people**: 🎯 icon with blue color
- **Organic people**: 📄 icon with gray color
- Shows truncated campaign name (15 chars max)
- Hover tooltip displays:
  - Full campaign name
  - Acquisition cost

#### Filter Options
Added three filter buttons:
- **All**: Shows all people (default)
- **🎯 Campaign**: Shows only campaign-sourced people
- **📄 Organic**: Shows only organic people
- Each button shows count in parentheses

#### Hot Prospects Enhancement
- Added campaign indicators to hot prospects list
- Shows acquisition cost for campaign-sourced prospects
- Maintains clickable navigation to person detail

### 3. JavaScript Updates

#### State Management
- Added `currentSourceFilter` to track active filter
- Added `currentSearchTerm` for search persistence
- Filter state persists during view switches

#### New Methods
- `filterBySource(source)`: Handles source filtering
- `applyFilters()`: Combines search and source filters
- `updateSourceCounts()`: Updates filter button counts
- `updateHotProspects()`: Enhanced with campaign data

#### Data Loading
- Updated to use `people_with_campaign_source` view
- Falls back to regular `persons` table if view doesn't exist
- Maintains backward compatibility

### 4. Campaign Attribution Logic

The view calculates attribution as follows:
1. Identifies all people who engaged with campaign posts
2. Calculates proportional cost allocation:
   ```sql
   acquisition_cost = (campaign_budget / total_campaign_engagements) * person_campaign_engagements
   ```
3. Assigns primary campaign (first engaged)
4. Tracks engagement metrics per campaign

## User Experience

### What Users See
1. **In People Table**:
   - Clear visual distinction between campaign and organic sources
   - Campaign name displayed (truncated for space)
   - Hover for full details including cost

2. **Filter Controls**:
   - Quick toggle between all/campaign/organic
   - Real-time counts update
   - Active state clearly indicated

3. **Hot Prospects**:
   - Campaign indicators inline with names
   - Acquisition costs displayed
   - Maintains clean, scannable layout

### Benefits
- **Visibility**: Instantly see which people came from paid campaigns
- **ROI Tracking**: Acquisition costs visible at person level
- **Filtering**: Easy segmentation of campaign vs organic
- **Performance**: Optimized queries with proper indexes

## Next Steps

To activate this feature:
1. Run the migration in Supabase SQL editor:
   ```sql
   -- Copy contents of 007_create_people_campaign_source_view.sql
   ```

2. Verify the view is working:
   ```sql
   SELECT COUNT(*) FROM people_with_campaign_source;
   ```

3. The UI will automatically detect and use the new view

## Technical Notes

### Performance Considerations
- View uses efficient CTEs for aggregation
- Indexes added on key join columns
- Acquisition cost calculated once in view

### Data Dependencies
- Requires `linkedin_campaigns` table populated
- Posts must have `linkedin_campaign_id` set
- Engagements must link people to posts

### Fallback Behavior
- If view doesn't exist, falls back to basic persons table
- Campaign features hidden when no campaign data
- No errors shown to user

## Related Files
- `/app/index.html` - Updated People view UI
- `/database/queries/get_people_with_campaign_source.sql` - Query logic
- `/database/migrations/007_create_people_campaign_source_view.sql` - Database view
- `/database/run_people_campaign_source_migration.sql` - Migration runner