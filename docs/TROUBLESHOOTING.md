# Troubleshooting Guide

## Common Issues

### 401 Unauthorized Error from Supabase

**Symptom**: Console shows "Invalid API key" errors when trying to import data.

**Cause**: The Supabase anon key is invalid or doesn't have proper permissions.

**Solution**: 
1. Go to your Supabase project settings
2. Copy the `service_role` key (not the `anon` key)
3. Update `app/config.js` with the correct key
4. Refresh the page and try again

### Import shows "0 items imported"

**Possible Causes**:
1. Database permissions issue
2. Invalid data format
3. Row Level Security (RLS) policies blocking inserts

**Solutions**:
1. Check browser console for specific errors
2. Try the JSON import with sample data first
3. Verify Supabase tables don't have RLS policies blocking inserts
4. Make sure you've refreshed the page to get the latest version

### "null value in column tenant_id violates not-null constraint"

**Cause**: The database schema doesn't have a tenant_id column in the persons table, but the app was trying to use it.

**Solution**: This has been fixed by removing all tenant_id references. Refresh the page and try again.

### Can't find Apify Run ID

**Solution**:
1. Go to Apify console
2. Navigate to your actor runs
3. Click on a successful run
4. The Run ID is in the URL after `/runs/`

### Page shows 404 errors

**Cause**: Wrong server or port

**Solution**: Use the provided serve script or run:
```bash
cd app && python3 -m http.server 4200
```

### No data showing after import

**Check**:
1. Open browser Developer Console (F12)
2. Look for any red errors
3. Check Network tab to see if API calls are succeeding
4. Verify the persons table in Supabase has data

### "app is not defined" error

**Solution**: Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)

## Debug Mode

To see detailed logs:
1. Open browser console
2. All import operations log progress
3. Check for specific error messages

## Direct Database Check

To verify data is actually importing:
1. Go to Supabase dashboard
2. Navigate to Table Editor
3. Check `persons` table for records
4. Check `posts` table for the LinkedIn post