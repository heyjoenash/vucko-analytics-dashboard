#!/usr/bin/env node

/**
 * Enrichment Scheduler for Digital Ocean Droplet
 * Runs automated LinkedIn profile enrichment based on boolean triggers
 * 
 * Usage:
 * node enrichment-scheduler.js [--auto-queue] [--process] [--stats]
 * 
 * Setup as cron job:
 * # Run every 15 minutes
 * 15 * * * * /usr/bin/node /path/to/enrichment-scheduler.js --process
 * 
 * # Auto-queue high value people daily at 9 AM
 * 0 9 * * * /usr/bin/node /path/to/enrichment-scheduler.js --auto-queue
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - these should be environment variables in production
const SUPABASE_CONFIG = {
    url: process.env.SUPABASE_URL || 'https://misuahtcociqkmkajvrw.supabase.co',
    anonKey: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3VhaHRjb2NpcWtta2FqdnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4NzY4NCwiZXhwIjoyMDY2OTYzNjg0fQ.eI3NTRguummX2Fs4iaRA4a6vutDPV2av0at9pJRDlSc'
};

const APIFY_CONFIG = {
    token: process.env.APIFY_TOKEN || 'your_apify_api_token_here',
    actorId: process.env.APIFY_ACTOR_ID || 'curious_coder/linkedin-post-reactions-scraper'
};

const DEFAULT_TENANT_ID = process.env.TENANT_ID || '00000000-0000-0000-0000-000000000001';

// Import the enrichment service
const EnrichmentService = require('./enrichment-service.js');

async function main() {
    const args = process.argv.slice(2);
    const shouldAutoQueue = args.includes('--auto-queue');
    const shouldProcess = args.includes('--process');
    const shouldShowStats = args.includes('--stats');

    console.log(`[${new Date().toISOString()}] Starting enrichment scheduler`);

    try {
        // Initialize Supabase client
        const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        
        // Initialize enrichment service
        const enrichmentService = new EnrichmentService(supabase, {
            APIFY_CONFIG,
            DEFAULT_TENANT_ID
        });

        if (shouldAutoQueue) {
            console.log('Auto-queueing high value people...');
            const queuedCount = await enrichmentService.autoQueueHighValuePeople();
            console.log(`✅ Queued ${queuedCount} people for enrichment`);
        }

        if (shouldProcess) {
            console.log('Processing enrichment queue...');
            const processedCount = await enrichmentService.processQueue(5);
            console.log(`✅ Processed ${processedCount} enrichment requests`);
        }

        if (shouldShowStats || (!shouldAutoQueue && !shouldProcess)) {
            console.log('Getting enrichment statistics...');
            const stats = await enrichmentService.getEnrichmentStats();
            console.log('📊 Enrichment Statistics:');
            console.log(`   Total People: ${stats.total}`);
            console.log(`   Enriched: ${stats.enriched} (${stats.enrichment_rate}%)`);
            console.log(`   Pending: ${stats.pending}`);
            console.log(`   In Progress: ${stats.in_progress}`);
            console.log(`   Failed: ${stats.failed}`);
        }

        console.log(`[${new Date().toISOString()}] Enrichment scheduler completed successfully`);
        process.exit(0);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Enrichment scheduler error:`, error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\\n⚡ Enrichment scheduler interrupted');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\\n⚡ Enrichment scheduler terminated');
    process.exit(0);
});

// Run if called directly
if (require.main === module) {
    main();
}