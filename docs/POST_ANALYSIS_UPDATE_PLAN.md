# Post Analysis View Update Plan

## Summary of Requested Changes

### 1. **Action Management Updates**
- **Remove**: "Mark as Viewed" button (eye icon)
- **Add**: "Track Lead" button with new lead_status options:
  - nurturing
  - to follow up  
  - add on LinkedIn
  - (future: action sequences)
- **Add**: "Notable" flag for people who don't fit filters but are important

### 2. **UI/Layout Improvements**
- **Profile Photos**: Increase from 32px to 48px in engagement table
- **Name Display**: Ensure names fit on one line (no wrapping)
- **Table Borders**: Make slightly more visible (currently too light)
- **Metrics Layout**: Move engagement metrics & top signals to horizontal bar above filters

### 3. **Sorting Capabilities**
- Sort by company
- Sort by title/role
- Sort by engagement score (people with most engagements across all posts)
- Top 5 people by engagement score in signals

### 4. **Database Updates Needed**
```sql
-- Add lead tracking columns to persons table
ALTER TABLE persons
ADD COLUMN IF NOT EXISTS lead_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_notable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notable_reason TEXT,
ADD COLUMN IF NOT EXISTS last_lead_update TIMESTAMPTZ;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_persons_lead_status ON persons(lead_status);
CREATE INDEX IF NOT EXISTS idx_persons_notable ON persons(is_notable);
```

### 5. **Visual Improvements**
- Replace star rating with engagement heat indicator
- More compact table layout with better spacing
- Clearer visual hierarchy

## Implementation Plan

### Phase 1: Database Updates (Immediate)
1. Run migration to add lead_status and is_notable columns
2. Update indexes for performance

### Phase 2: Table Layout Fixes (30 mins)
1. Increase profile photo size to 48px
2. Fix name display with nowrap and ellipsis
3. Enhance table borders (from #f3f4f6 to #e5e7eb)
4. Optimize column widths

### Phase 3: Action System (45 mins)
1. Remove "Mark as Viewed" action
2. Add "Track Lead" dropdown with status options
3. Add "Mark as Notable" toggle
4. Update action handlers

### Phase 4: Metrics Reorganization (30 mins)
1. Move metrics to horizontal bar
2. Add top 5 people by engagement
3. Improve signal display

### Phase 5: Sorting Implementation (45 mins)
1. Add sortable column headers
2. Implement sort by company, title, engagement score
3. Add sort indicators

## Mockup of New Layout

```
[Search Bar                                    ] [Review Mode] [Export]

[📊 162 Total] [👥 0 Followers] [🏢 Top: Motion Designer (2)] [👤 Top: Martin S. (15)]

[All 162] [Followers 0] [Target Titles 0] [High Value 0] [Notable 5]
[Company ▼] [Title ▼] [Status ▼]

+--------+------------------+------------------+---------+--------+-----------+
| Photo  | Person           | Title/Company    | React   | Status | Actions   |
+--------+------------------+------------------+---------+--------+-----------+
| [48px] | King Chun Wong   | Visual Designer  | Like    | Lead   | [L][N][🔗]|
|        |                  | Unknown          |         |        |           |
```

## Key Design Decisions

1. **Lead Status**: Dropdown menu instead of multiple buttons
2. **Notable Flag**: Star icon that toggles on/off
3. **Engagement Score**: Heat meter (🟢🟡🟠🔴) instead of stars
4. **Name Display**: Single line with ellipsis for overflow
5. **Company/Title**: Stacked display for better readability

## Next Steps

1. Create database migration file
2. Update post-analysis.html with new layout
3. Add sorting functionality
4. Implement lead tracking system
5. Test and refine based on feedback