# LinkedIn Enrichment Workflow Setup Guide

This guide explains how to set up the automated LinkedIn profile enrichment workflow using boolean-based triggers and scheduled processing.

## 🗃️ Database Setup

### 1. Run the Enrichment Migration

Execute the enrichment tracking migration in your Supabase SQL editor:

```bash
# Copy and paste the contents of this file into Supabase SQL editor:
database/migrations/add_enrichment_tracking.sql
```

This adds the following columns to the `persons` table:
- `has_been_enriched` (BOOLEAN) - Main trigger flag
- `enrichment_status` (VARCHAR) - Current processing state
- `last_enrichment_attempt` (TIMESTAMPTZ) - For re-enrichment scheduling
- `enrichment_source` (VARCHAR) - Track data source
- `enrichment_data` (JSONB) - Store enriched profile data

Plus dedicated tables for queue management and audit logging.

## 🚀 Local Development Setup

### 1. Include Enrichment Service

Add the enrichment service to your post-analysis page:

```html
<!-- In post-analysis.html, after config.js -->
<script src="enrichment-service.js"></script>
```

### 2. Initialize in Your App

```javascript
// Initialize enrichment service
const enrichmentService = new EnrichmentService(supabaseClient, {
    APIFY_CONFIG,
    DEFAULT_TENANT_ID
});

// Check if person needs enrichment
const needsEnrichment = await enrichmentService.needsEnrichment(personId);

// Queue for enrichment
if (needsEnrichment) {
    await enrichmentService.queueForEnrichment(personId, 8); // priority 1-10
}
```

## 🖥️ Digital Ocean Droplet Setup

### 1. Install Dependencies

```bash
# SSH into your Digital Ocean droplet
ssh root@your-droplet-ip

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Create enrichment directory
mkdir -p /opt/signals-enrichment
cd /opt/signals-enrichment

# Copy the scheduler script
# Upload scripts/enrichment-scheduler.js and app/enrichment-service.js
```

### 2. Install Node Dependencies

```bash
# Initialize package.json
npm init -y

# Install required packages
npm install @supabase/supabase-js
```

### 3. Environment Variables

Create `/opt/signals-enrichment/.env`:

```env
SUPABASE_URL=https://misuahtcociqkmkajvrw.supabase.co
SUPABASE_KEY=your_service_role_key_here
APIFY_TOKEN=your_apify_api_token_here
APIFY_ACTOR_ID=curious_coder/linkedin-post-reactions-scraper
TENANT_ID=00000000-0000-0000-0000-000000000001
```

### 4. Setup Cron Jobs

```bash
# Edit crontab
crontab -e

# Add these lines for automated scheduling:

# Process enrichment queue every 15 minutes
*/15 * * * * cd /opt/signals-enrichment && /usr/bin/node enrichment-scheduler.js --process >> /var/log/enrichment.log 2>&1

# Auto-queue high value people daily at 9 AM
0 9 * * * cd /opt/signals-enrichment && /usr/bin/node enrichment-scheduler.js --auto-queue >> /var/log/enrichment.log 2>&1

# Generate stats report daily at 6 PM
0 18 * * * cd /opt/signals-enrichment && /usr/bin/node enrichment-scheduler.js --stats >> /var/log/enrichment-stats.log 2>&1
```

## 🔄 Boolean-Based Trigger Logic

The enrichment workflow uses these boolean triggers:

### Automatic Queueing
- `has_been_enriched = false` → Queue for first-time enrichment
- `is_notable = true` → High priority queueing (priority 10)
- Job titles containing "Director", "Manager", "CEO", "Founder" → Priority 7
- Last enrichment > 30 days ago → Re-queue for updates

### Manual Triggering
```javascript
// In your app, trigger enrichment for specific people
await enrichmentService.queueForEnrichment(personId, 9);

// Bulk queue high value people
await enrichmentService.autoQueueHighValuePeople();
```

## 📊 Monitoring & Management

### View Enrichment Stats
```bash
# Run on droplet to see current stats
node enrichment-scheduler.js --stats
```

### Check Queue Status
```sql
-- In Supabase SQL editor
SELECT 
    status,
    priority,
    COUNT(*) as count,
    AVG(attempts) as avg_attempts
FROM enrichment_queue 
GROUP BY status, priority 
ORDER BY priority DESC, status;
```

### View Recent Enrichment Activity
```sql
-- See recent enrichment logs
SELECT 
    p.name,
    el.action,
    el.status,
    el.created_at
FROM enrichment_logs el
JOIN persons p ON el.person_id = p.id
ORDER BY el.created_at DESC
LIMIT 20;
```

## 🔧 Troubleshooting

### Common Issues

1. **Apify API Limits**: The free tier has monthly limits. Monitor usage in Apify console.

2. **Queue Backing Up**: Check logs for failed enrichments:
   ```bash
   tail -f /var/log/enrichment.log
   ```

3. **Database Connection Issues**: Verify environment variables and network access.

### Manual Recovery

```bash
# Reset failed queue items
# Run in Supabase SQL editor:
UPDATE enrichment_queue 
SET status = 'pending', attempts = 0, error_message = NULL 
WHERE status = 'failed' AND attempts < 3;
```

## 🎯 Integration with Lead Workflow

The enrichment data automatically enhances your lead tracking:

- Enriched profiles get better company/title data
- `has_been_enriched` flag shows data quality
- `enrichment_data` JSONB contains full LinkedIn profile
- Use enriched data for better lead scoring and segmentation

## 📈 Performance Optimization

- **Batch Size**: Adjust `processQueue(batchSize)` based on Apify rate limits
- **Priority System**: Use 1-10 priority (10 = highest) for important profiles
- **Scheduling**: Spread processing throughout the day to avoid peak times
- **Monitoring**: Set up alerts for queue backup or high failure rates