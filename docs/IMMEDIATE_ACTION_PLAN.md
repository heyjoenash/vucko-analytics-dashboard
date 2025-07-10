# Immediate Action Plan: Next 48 Hours

## 🔴 Critical Issues to Address

### 1. Profile Photos Not Displaying
**Status**: Code looks correct, but photos may not be loading due to:
- LinkedIn CORS restrictions
- Expired photo URLs
- Missing photos in import data

**Action**: Add better error handling and logging
```javascript
// Add to import process (line 595)
profile_picture: item.profilePicture || item.photoUrl,
// Add debug logging
console.log('Profile photo URL:', item.profilePicture || item.photoUrl);
```

### 2. Engagement Count Mismatch
**Issue**: Only 20 engagements showing because we only backfilled 20 to post 2
**Fix**: Re-run import with proper engagement distribution

### 3. Company Data Quality
**Current**: `current_company: item.company || this.extractCompanyFromHeadline(item.headline)`
**Problem**: Headline parsing is ~40% accurate
**Solution**: Implement enrichment workflow

## 📋 Day 1 Tasks (Today)

### Morning (2-3 hours)
1. **Fix Profile Photo Display**
   ```javascript
   // Add to line 1104-1108 in engagement table
   onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'profile-placeholder\'><i class=\'fas fa-user text-gray-600 text-xs\'></i></div>'"
   ```

2. **Add Debug Logging**
   ```javascript
   // Add to processImportData function
   console.log('Import item structure:', items[0]);
   console.log('Photo URL:', items[0].profilePicture, items[0].photoUrl);
   ```

3. **Create Test Import Script**
   - Test with small batch (5 people)
   - Verify photo URLs are correct
   - Check data structure

### Afternoon (3-4 hours)
4. **Add Manual Override UI**
   ```javascript
   // Add edit button to person modal
   <button onclick="app.editPerson(person)" class="px-4 py-2 bg-yellow-600 text-white rounded">
     <i class="fas fa-edit mr-1"></i>Edit
   </button>
   ```

5. **Create Edit Modal**
   ```javascript
   const editPerson = async (person) => {
     // Show form with current values
     // Allow editing company and title
     // Save to override fields
   };
   ```

## 📋 Day 2 Tasks (Tomorrow)

### Morning (4 hours)
1. **Integrate Profile Enrichment Scraper**
   
   **Recommended Actor**: `lukaskrivka/linkedin-profile-scraper`
   ```javascript
   // config.js
   const ENRICHMENT_CONFIG = {
     actorId: 'lukaskrivka/linkedin-profile-scraper',
     token: APIFY_CONFIG.token
   };
   ```

2. **Create Enrichment Service**
   ```javascript
   class ProfileEnrichmentService {
     async enrichPerson(linkedinUrl) {
       // Call Apify actor
       // Handle rate limits
       // Update person record
       // Mark as enriched
     }
     
     async enrichBatch(personIds) {
       // Process in batches of 25
       // Track progress
       // Handle failures
     }
   }
   ```

### Afternoon (4 hours)
3. **Build Enrichment Status UI**
   - Add enrichment badge to people list
   - Show enrichment progress
   - Add "Enrich" button for manual trigger
   - Create enrichment dashboard

4. **Fix Engagement Distribution**
   - Re-import engagements properly
   - Ensure all 283 people are linked to correct posts
   - Preserve reaction types

## 🚀 Quick Wins (Can do now)

### 1. Test Profile Photos
Create a test page to debug photo issues:
```html
<!-- test-photos.html -->
<script>
async function testPhotos() {
  const { data } = await supabase
    .from('persons')
    .select('name, profile_picture')
    .limit(10);
  
  data.forEach(person => {
    console.log(`${person.name}: ${person.profile_picture}`);
    // Try loading image
    const img = new Image();
    img.onload = () => console.log('✓ Loaded:', person.name);
    img.onerror = () => console.log('✗ Failed:', person.name);
    img.src = person.profile_picture;
  });
}
</script>
```

### 2. Add Company Override Fields
```sql
-- Run in Supabase SQL Editor
ALTER TABLE persons 
ADD COLUMN IF NOT EXISTS company_override TEXT,
ADD COLUMN IF NOT EXISTS title_override TEXT,
ADD COLUMN IF NOT EXISTS override_reason TEXT,
ADD COLUMN IF NOT EXISTS override_updated_at TIMESTAMPTZ;
```

### 3. Create Enrichment Tracking Fields
```sql
ALTER TABLE persons
ADD COLUMN IF NOT EXISTS needs_enrichment BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_enrichment_attempt TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS enrichment_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enrichment_source TEXT;
```

## 📊 Expected Outcomes

After 48 hours, we should have:
1. ✅ Profile photos displaying (with graceful fallbacks)
2. ✅ Manual override capability for company/title
3. ✅ Profile enrichment service integrated
4. ✅ Proper engagement counts on all posts
5. ✅ Clear roadmap for next phase

## 🎯 Success Metrics

- Photo display rate: >75%
- Manual overrides working: 100%
- Enrichment integration tested: Yes
- User can correct data: Yes
- Ready for full enrichment rollout: Yes

Let's execute! 🚀