# Tenant ID Database Error Fix

## Problem
The application was encountering the error:
```
null value in column 'tenant_id' of relation 'posts' violates not-null constraint
```

This indicates that the Supabase database has been configured with multi-tenancy support, requiring a `tenant_id` column on tables, but the application code wasn't providing these values.

## Solution Implemented

### 1. Database Migration Created
Created `/database/migrations/add_tenant_id.sql` that:
- Creates a `tenants` table with a default tenant
- Adds `tenant_id` column to all main tables (posts, persons, companies, campaigns, etc.)
- Sets a default tenant_id for existing records
- Makes tenant_id NOT NULL after migration
- Adds foreign key constraints
- Creates indexes for performance

### 2. Application Code Updated

#### Tracker.py Changes:
- Added `tenant_id` parameter to `SupabaseCampaignTracker` constructor
- Updated `ApifyJobManager` to handle tenant_id
- Modified all database insert operations to include tenant_id:
  - Post creation
  - Person creation/upsert
  - Engagement creation
  - Scraping job creation
  - Audience segment creation

#### Main.py Changes:
- Updated all API endpoints to include tenant_id when creating records:
  - `/api/posts` - Post creation
  - `/api/audiences` - Audience creation
  - `/api/campaigns` - Campaign creation
  - `/api/personas` - Persona creation
  - `/api/content-types` - Content type creation
  - CSV upload endpoints - Person and engagement creation
  - Campaign performance upload - Ad creation

### 3. Default Tenant ID
Used `00000000-0000-0000-0000-000000000001` as the default tenant ID for single-tenant deployments.

## How to Apply the Fix

### Step 1: Run the Database Migration
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Create a new query
4. Copy the contents of `/database/migrations/add_tenant_id.sql`
5. Run the query

### Step 2: Deploy the Updated Code
The Python code has been updated to handle tenant_id automatically. Simply deploy the updated files:
- `backend/tracker.py`
- `backend/main.py`

### Step 3: Verify
After applying the migration and deploying the code:
1. Test creating a new post - it should work without the tenant_id error
2. Existing functionality should continue to work
3. All new records will have the default tenant_id

## Future Considerations

### Multi-Tenant Support
If you need true multi-tenant support in the future:
1. Implement tenant detection/selection logic
2. Pass the appropriate tenant_id to the tracker initialization
3. Enable Row Level Security (RLS) policies (commented out in the migration)
4. Implement tenant isolation in queries

### Row Level Security
The migration includes commented-out RLS policies. To enable them:
1. Uncomment the RLS enable statements
2. Uncomment the policy creation statements
3. Configure your application to set the tenant context

## Rollback Plan
If needed, you can rollback by:
1. Removing the tenant_id columns from all tables
2. Reverting the code changes
3. Note: This would require careful consideration of any data created after the migration