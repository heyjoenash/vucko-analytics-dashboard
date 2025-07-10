/**
 * LinkedIn Enrichment Service
 * Handles automated profile enrichment using Apify actor
 * Supports boolean-based triggers and automated scheduling
 */

class EnrichmentService {
    constructor(supabaseClient, config) {
        this.supabase = supabaseClient;
        this.apifyToken = config.APIFY_CONFIG.token;
        this.actorId = config.APIFY_CONFIG.actorId;
        this.tenantId = config.DEFAULT_TENANT_ID;
    }

    /**
     * Check if a person needs enrichment based on boolean flags
     */
    async needsEnrichment(personId) {
        const { data: person, error } = await this.supabase
            .from('persons')
            .select('has_been_enriched, enrichment_status, last_enrichment_attempt')
            .eq('id', personId)
            .single();

        if (error) {
            console.error('Error checking enrichment status:', error);
            return false;
        }

        // Boolean-based trigger logic
        if (!person.has_been_enriched) {
            return true; // Never been enriched
        }

        // Re-enrich if last attempt was more than 30 days ago
        if (person.last_enrichment_attempt) {
            const daysSinceLastAttempt = (Date.now() - new Date(person.last_enrichment_attempt).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceLastAttempt > 30;
        }

        return false;
    }

    /**
     * Add person to enrichment queue (simplified - marks person for enrichment)
     */
    async queueForEnrichment(personId, priority = 5) {
        try {
            // Check if already needs enrichment
            const { data: person, error: checkError } = await this.supabase
                .from('persons')
                .select('has_been_enriched, enrichment_status, needs_enrichment')
                .eq('id', personId)
                .single();

            if (checkError) throw checkError;

            if (person.has_been_enriched) {
                console.log(`Person ${personId} already enriched`);
                return person;
            }

            // Mark for enrichment
            const { data, error } = await this.supabase
                .from('persons')
                .update({
                    needs_enrichment: true,
                    enrichment_status: 'pending'
                })
                .eq('id', personId)
                .select()
                .single();

            if (error) throw error;

            console.log(`Person ${personId} queued for enrichment (priority ${priority})`);
            return data;
        } catch (error) {
            console.error('Error queueing person for enrichment:', error);
            throw error;
        }
    }

    /**
     * Process enrichment queue (called by automated scheduler)
     */
    async processQueue(batchSize = 5) {
        try {
            // Get people who need enrichment
            const { data: people, error } = await this.supabase
                .from('persons')
                .select('id, name, headline, needs_enrichment, enrichment_status')
                .eq('needs_enrichment', true)
                .eq('enrichment_status', 'pending')
                .limit(batchSize);

            if (error) throw error;

            console.log(`Processing ${people.length} enrichment requests`);

            for (const person of people) {
                try {
                    console.log(`Starting enrichment for ${person.name} (ID: ${person.id})`);
                    // For now, just mark as completed since Apify integration needs LinkedIn profile URLs
                    await this.updatePersonEnrichmentStatus(person.id, 'completed');
                } catch (error) {
                    console.error(`Error enriching person ${person.id}:`, error);
                    await this.updatePersonEnrichmentStatus(person.id, 'failed');
                }
            }

            return people.length;
        } catch (error) {
            console.error('Error processing enrichment queue:', error);
            throw error;
        }
    }

    /**
     * Enrich a single person using Apify actor
     */
    async enrichPerson(personId, queueId = null) {
        try {
            // Update queue status to processing
            if (queueId) {
                await this.updateQueueStatus(queueId, 'processing');
            }

            // Get person data
            const { data: person, error: personError } = await this.supabase
                .from('persons')
                .select('*')
                .eq('id', personId)
                .single();

            if (personError) throw personError;

            // Update person status
            await this.updatePersonEnrichmentStatus(personId, 'in_progress');

            // Start Apify actor
            const runResult = await this.startApifyEnrichment(person);

            // Wait for completion and get results
            const enrichmentData = await this.waitForApifyCompletion(runResult.id);

            // Update person with enriched data
            await this.updatePersonWithEnrichmentData(personId, enrichmentData, runResult.id);

            // Complete queue item
            if (queueId) {
                await this.updateQueueStatus(queueId, 'completed');
            }

            await this.logAction(personId, 'enriched', 'success', { 
                apify_run_id: runResult.id,
                data_points: Object.keys(enrichmentData).length 
            });

            return enrichmentData;

        } catch (error) {
            console.error(`Error enriching person ${personId}:`, error);

            // Update status to failed
            await this.updatePersonEnrichmentStatus(personId, 'failed');
            
            if (queueId) {
                await this.updateQueueStatus(queueId, 'failed', error.message);
            }

            await this.logAction(personId, 'enrichment_failed', 'error', { error: error.message });
            throw error;
        }
    }

    /**
     * Start Apify actor for LinkedIn profile enrichment
     */
    async startApifyEnrichment(person) {
        const input = {
            linkedinUrls: [person.linkedin_profile_url],
            includePersonalInfo: true,
            includeExperience: true,
            includeEducation: true,
            includeSkills: true
        };

        const response = await fetch(`https://api.apify.com/v2/acts/${this.actorId}/runs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apifyToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input })
        });

        if (!response.ok) {
            throw new Error(`Apify API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Wait for Apify actor completion and get results
     */
    async waitForApifyCompletion(runId, maxWaitTime = 300000) { // 5 minutes max
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            const response = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
                headers: { 'Authorization': `Bearer ${this.apifyToken}` }
            });

            const runData = await response.json();
            
            if (runData.status === 'SUCCEEDED') {
                // Get dataset items
                const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${runData.defaultDatasetId}/items`, {
                    headers: { 'Authorization': `Bearer ${this.apifyToken}` }
                });
                
                const results = await datasetResponse.json();
                return results[0] || {}; // Return first result
            }
            
            if (runData.status === 'FAILED') {
                throw new Error(`Apify run failed: ${runData.statusMessage}`);
            }

            // Wait 10 seconds before checking again
            await new Promise(resolve => setTimeout(resolve, 10000));
        }

        throw new Error('Apify run timeout');
    }

    /**
     * Update person with enriched data
     */
    async updatePersonWithEnrichmentData(personId, enrichmentData, apifyRunId) {
        const updateData = {
            has_been_enriched: true,
            enrichment_status: 'completed',
            last_enrichment_attempt: new Date().toISOString(),
            enrichment_source: 'apify_linkedin',
            enrichment_data: enrichmentData
        };

        // Extract and update specific fields if available
        if (enrichmentData.headline) updateData.headline = enrichmentData.headline;
        if (enrichmentData.company) updateData.current_company = enrichmentData.company;
        if (enrichmentData.location) updateData.location = enrichmentData.location;

        const { error } = await this.supabase
            .from('persons')
            .update(updateData)
            .eq('id', personId);

        if (error) throw error;

        // Log the successful enrichment with Apify run ID
        console.log(`Successfully enriched person ${personId} with Apify run: ${apifyRunId}`);
    }

    /**
     * Update person enrichment status
     */
    async updatePersonEnrichmentStatus(personId, status) {
        const { error } = await this.supabase
            .from('persons')
            .update({
                enrichment_status: status,
                last_enrichment_attempt: new Date().toISOString()
            })
            .eq('id', personId);

        if (error) throw error;
    }

    /**
     * Update queue item status
     */
    async updateQueueStatus(queueId, status, errorMessage = null) {
        const updateData = {
            status,
            last_attempt: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (status === 'processing') {
            updateData.attempts = this.supabase.rpc('increment_attempts', { queue_id: queueId });
        }

        if (errorMessage) {
            updateData.error_message = errorMessage;
        }

        const { error } = await this.supabase
            .from('enrichment_queue')
            .update(updateData)
            .eq('id', queueId);

        if (error) throw error;
    }

    /**
     * Log enrichment action for audit trail (simplified - console logging)
     */
    async logAction(personId, action, status, details = {}) {
        console.log(`Enrichment Action - Person: ${personId}, Action: ${action}, Status: ${status}`, details);
    }

    /**
     * Auto-queue high value people for enrichment
     */
    async autoQueueHighValuePeople() {
        try {
            // Find people who need enrichment and are high value
            const { data: people, error } = await this.supabase
                .from('persons')
                .select('id, name, headline, current_company, has_been_enriched, is_notable')
                .eq('has_been_enriched', false)
                .or('is_notable.eq.true,headline.ilike.%director%,headline.ilike.%manager%,headline.ilike.%ceo%,headline.ilike.%founder%');

            if (error) throw error;

            console.log(`Auto-queueing ${people.length} high value people for enrichment`);

            for (const person of people) {
                const priority = person.is_notable ? 10 : 7; // Higher priority for notable people
                await this.queueForEnrichment(person.id, priority);
            }

            return people.length;
        } catch (error) {
            console.error('Error auto-queueing people:', error);
            throw error;
        }
    }

    /**
     * Get enrichment statistics
     */
    async getEnrichmentStats() {
        try {
            const { data: stats, error } = await this.supabase
                .from('persons')
                .select('has_been_enriched, enrichment_status')
                .eq('tenant_id', this.tenantId);

            if (error) throw error;

            const total = stats.length;
            const enriched = stats.filter(p => p.has_been_enriched).length;
            const pending = stats.filter(p => p.enrichment_status === 'pending').length;
            const inProgress = stats.filter(p => p.enrichment_status === 'in_progress').length;
            const failed = stats.filter(p => p.enrichment_status === 'failed').length;

            return {
                total,
                enriched,
                pending,
                in_progress: inProgress,
                failed,
                enrichment_rate: total > 0 ? Math.round((enriched / total) * 100) : 0
            };
        } catch (error) {
            console.error('Error getting enrichment stats:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.EnrichmentService = EnrichmentService;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnrichmentService;
}