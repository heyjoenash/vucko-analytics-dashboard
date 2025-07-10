// Vucko-Specific LinkedIn Integration Service
// Focuses on enhancing existing workflow with Vucko campaign data

class VuckoSyncService {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.tenantId = DEFAULT_TENANT_ID;
        this.vuckoAccountId = 510508147; // Vucko's LinkedIn account ID
        this.linkedInAPI = window.linkedInAPI;
    }

    // Silent background sync of Vucko campaign data
    async backgroundSync() {
        console.log('🔄 Starting Vucko background sync...');
        
        try {
            // Step 1: Sync Vucko campaigns silently
            const campaigns = await this.syncVuckoCampaigns();
            
            // Step 2: Match campaigns to existing posts
            const matches = await this.matchCampaignsToExistingPosts(campaigns);
            
            // Step 3: Enhance existing data with campaign intelligence
            await this.enhanceExistingData(matches);
            
            // Step 4: Calculate true ROI for all engagement data
            await this.calculateTrueROI();
            
            console.log('✅ Vucko background sync completed successfully');
            return {
                success: true,
                campaignCount: campaigns.length,
                matchCount: matches.length,
                message: `Enhanced ${matches.length} posts with campaign data`
            };
            
        } catch (error) {
            console.error('❌ Vucko background sync failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Sync only Vucko campaigns
    async syncVuckoCampaigns() {
        console.log('📊 Fetching Vucko campaigns...');
        
        const campaignsResponse = await this.linkedInAPI.getCampaigns(this.vuckoAccountId);
        const campaigns = campaignsResponse.elements || [];
        
        // Store in LinkedIn campaigns table
        for (const campaign of campaigns) {
            await this.storeCampaignData(campaign);
        }
        
        return campaigns;
    }

    // Enhanced campaign storage with focus on existing workflow integration
    async storeCampaignData(campaign) {
        const campaignData = {
            linkedin_campaign_id: campaign.id,
            linkedin_account_id: this.vuckoAccountId,
            name: campaign.name,
            status: campaign.status,
            campaign_type: campaign.type,
            objective_type: campaign.objectiveType,
            total_budget_amount: campaign.totalBudget?.amount ? parseFloat(campaign.totalBudget.amount) : null,
            total_budget_currency: campaign.totalBudget?.currencyCode || 'USD',
            unit_cost_amount: campaign.unitCost?.amount ? parseFloat(campaign.unitCost.amount) : null,
            cost_type: campaign.costType,
            targeting_criteria: campaign.targetingCriteria,
            serving_statuses: campaign.servingStatuses || [],
            
            // Add fields that align with LinkedIn API response
            run_schedule_start: campaign.runSchedule?.start ? new Date(campaign.runSchedule.start) : null,
            run_schedule_end: campaign.runSchedule?.end ? new Date(campaign.runSchedule.end) : null,
            created_time: campaign.changeAuditStamps?.created?.time || null,
            last_modified_time: campaign.changeAuditStamps?.lastModified?.time || null,
            creative_selection: campaign.creativeSelection,
            optimization_target: campaign.optimizationTargetType,
            audience_expansion_enabled: campaign.audienceExpansionEnabled || false,
            
            tenant_id: this.tenantId,
            last_synced: new Date().toISOString()
        };

        const { data, error } = await this.supabase
            .from('linkedin_campaigns')
            .upsert(campaignData, { 
                onConflict: 'linkedin_campaign_id',
                ignoreDuplicates: false 
            })
            .select();

        if (error) throw error;

        // After storing campaign, fetch and store its analytics/demographics data
        if (this.linkedInAPI && data[0]) {
            try {
                await this.linkedInAPI.fetchAndStoreCampaignDemographics(campaign.id);
                console.log(`✅ Stored analytics data for campaign: ${campaign.name}`);
            } catch (analyticsError) {
                console.warn(`⚠️ Could not fetch analytics for campaign ${campaign.id}:`, analyticsError.message);
            }
        }

        return data[0];
    }

    // Smart matching of campaigns to existing posts
    async matchCampaignsToExistingPosts(campaigns) {
        console.log('🔗 Matching campaigns to existing posts...');
        
        // Get existing posts
        const { data: posts } = await this.supabase
            .from('posts')
            .select('*')
            .eq('account_name', 'Vucko'); // Focus on Vucko posts

        if (!posts) return [];

        const matches = [];
        
        for (const campaign of campaigns) {
            const matchedPost = this.findBestPostMatch(campaign, posts);
            if (matchedPost) {
                // Update the posts table with campaign data
                await this.linkPostToCampaign(matchedPost, campaign);
                matches.push({ campaign, post: matchedPost });
            }
        }
        
        return matches;
    }

    // Intelligent post-campaign matching
    findBestPostMatch(campaign, posts) {
        if (!campaign.name) return null;

        // Extract campaign timing
        const campaignStart = campaign.runSchedule?.start ? new Date(campaign.runSchedule.start) : null;
        const campaignEnd = campaign.runSchedule?.end ? new Date(campaign.runSchedule.end) : null;

        // Try multiple matching strategies
        for (const post of posts) {
            const postDate = new Date(post.posted_date);
            
            // Strategy 1: Time-based matching
            if (campaignStart && campaignEnd) {
                if (postDate >= campaignStart && postDate <= campaignEnd) {
                    return post;
                }
            }
            
            // Strategy 2: Content similarity
            if (this.calculateContentSimilarity(campaign.name, post.content_preview) > 0.6) {
                return post;
            }
            
            // Strategy 3: URL matching (if campaign name contains identifiable content)
            if (post.url && campaign.name.toLowerCase().includes('website') && post.url.includes('vucko')) {
                return post;
            }
        }
        
        return null;
    }

    // Calculate content similarity score
    calculateContentSimilarity(campaignName, postContent) {
        if (!campaignName || !postContent) return 0;
        
        const campaign = campaignName.toLowerCase();
        const content = postContent.toLowerCase();
        
        // Simple keyword matching
        const campaignWords = campaign.split(/\s+/).filter(word => word.length > 3);
        const contentWords = content.split(/\s+/);
        
        let matches = 0;
        for (const word of campaignWords) {
            if (contentWords.some(cWord => cWord.includes(word) || word.includes(cWord))) {
                matches++;
            }
        }
        
        return campaignWords.length > 0 ? matches / campaignWords.length : 0;
    }

    // Link post to campaign with enhanced data
    async linkPostToCampaign(post, campaign) {
        const updateData = {
            linkedin_campaign_id: campaign.id,
            campaign_spend: campaign.totalBudget?.amount ? parseFloat(campaign.totalBudget.amount) : null,
            // We'll calculate impressions and true cost per engagement later with performance data
        };

        const { error } = await this.supabase
            .from('posts')
            .update(updateData)
            .eq('id', post.id);

        if (error) {
            console.error('Error linking post to campaign:', error);
        } else {
            console.log(`✅ Linked post "${post.content_preview?.substring(0, 50)}" to campaign "${campaign.name}"`);
        }
    }

    // Enhance existing engagement data with campaign context
    async enhanceExistingData(matches) {
        console.log('💡 Enhancing existing engagement data...');
        
        for (const match of matches) {
            // Get engagements for this post
            const { data: engagements } = await this.supabase
                .from('engagements')
                .select('*')
                .eq('post_url', match.post.url);

            if (engagements) {
                // Mark engagements as campaign-attributed
                await this.supabase
                    .from('engagements')
                    .update({ campaign_attributed: true })
                    .eq('post_url', match.post.url);
                
                // Calculate acquisition cost per person
                await this.calculateAcquisitionCosts(engagements, match.campaign);
            }
        }
    }

    // Calculate acquisition costs for persons
    async calculateAcquisitionCosts(engagements, campaign) {
        const campaignSpend = campaign.totalBudget?.amount ? parseFloat(campaign.totalBudget.amount) : 0;
        if (campaignSpend === 0) return;

        const uniquePersons = [...new Set(engagements.map(e => e.person_id).filter(Boolean))];
        const costPerPerson = campaignSpend / uniquePersons.length;

        // Update persons table with acquisition cost
        for (const personId of uniquePersons) {
            await this.supabase
                .from('persons')
                .update({ 
                    acquisition_cost: costPerPerson,
                    source_campaign_id: campaign.id 
                })
                .eq('id', personId);
        }
    }

    // Calculate true ROI for all engagement data
    async calculateTrueROI() {
        console.log('📈 Calculating true ROI...');
        
        // Get all posts with campaign data
        const { data: posts } = await this.supabase
            .from('posts')
            .select('*')
            .not('linkedin_campaign_id', 'is', null);

        for (const post of posts) {
            // Get engagement count for this post
            const { count: engagementCount } = await this.supabase
                .from('engagements')
                .select('*', { count: 'exact', head: true })
                .eq('post_url', post.url);

            if (engagementCount > 0 && post.campaign_spend) {
                const trueRoi = post.campaign_spend / engagementCount;
                
                // Update post with true cost per engagement
                await this.supabase
                    .from('posts')
                    .update({ true_cost_per_engagement: trueRoi })
                    .eq('id', post.id);
            }
        }
    }

    // Get enhanced dashboard data for existing views
    async getEnhancedDashboardData() {
        // Get posts with campaign intelligence
        const { data: enhancedPosts } = await this.supabase
            .from('posts')
            .select(`
                *,
                linkedin_campaigns!inner(
                    name,
                    status,
                    objective_type,
                    targeting_criteria
                )
            `)
            .not('linkedin_campaign_id', 'is', null);

        // Get persons with acquisition costs
        const { data: enhancedPersons } = await this.supabase
            .from('persons')
            .select('*')
            .not('acquisition_cost', 'is', null);

        return {
            campaignPosts: enhancedPosts || [],
            costAttributedPersons: enhancedPersons || [],
            totalSpend: enhancedPosts?.reduce((sum, post) => sum + (post.campaign_spend || 0), 0) || 0,
            avgCostPerEngagement: this.calculateAverageCPE(enhancedPosts || [])
        };
    }

    calculateAverageCPE(posts) {
        const validCosts = posts
            .map(p => p.true_cost_per_engagement)
            .filter(cost => cost && cost > 0);
        
        return validCosts.length > 0 
            ? validCosts.reduce((sum, cost) => sum + cost, 0) / validCosts.length 
            : 0;
    }

    // Check sync status
    async getSyncStatus() {
        const { data: campaigns } = await this.supabase
            .from('linkedin_campaigns')
            .select('*')
            .eq('linkedin_account_id', this.vuckoAccountId)
            .order('last_synced', { ascending: false })
            .limit(1);

        const { data: enhancedPosts } = await this.supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .not('linkedin_campaign_id', 'is', null);

        return {
            lastSync: campaigns?.[0]?.last_synced || null,
            campaignCount: campaigns?.length || 0,
            enhancedPostCount: enhancedPosts || 0,
            accountFocus: 'Vucko (Account: 510508147)'
        };
    }
}

// Initialize Vucko sync service
let vuckoSyncService;
if (typeof supabase !== 'undefined') {
    vuckoSyncService = new VuckoSyncService(supabase);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VuckoSyncService;
}