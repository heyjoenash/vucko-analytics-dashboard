// LinkedIn Campaign Data Sync Service
class LinkedInSyncService {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.tenantId = DEFAULT_TENANT_ID;
    }

    // Sync ad accounts
    async syncAccounts(accountsData) {
        console.log('Syncing LinkedIn accounts...', accountsData);
        
        if (!accountsData.elements || !Array.isArray(accountsData.elements)) {
            throw new Error('Invalid accounts data format');
        }

        const accounts = [];
        for (const account of accountsData.elements) {
            const accountData = {
                linkedin_account_id: account.id,
                account_name: account.name,
                account_type: account.type,
                currency: account.currency || 'USD',
                status: account.status,
                serving_statuses: account.servingStatuses || [],
                reference_urn: account.reference,
                tenant_id: this.tenantId,
                linkedin_created_at: account.changeAuditStamps?.created?.time 
                    ? new Date(account.changeAuditStamps.created.time).toISOString()
                    : null,
                linkedin_modified_at: account.changeAuditStamps?.lastModified?.time 
                    ? new Date(account.changeAuditStamps.lastModified.time).toISOString()
                    : null,
                last_synced: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('linkedin_accounts')
                .upsert(accountData, { 
                    onConflict: 'linkedin_account_id',
                    ignoreDuplicates: false 
                })
                .select();

            if (error) {
                console.error('Error syncing account:', account.id, error);
                throw error;
            }

            accounts.push(data[0]);
        }

        console.log(`Synced ${accounts.length} LinkedIn accounts`);
        return accounts;
    }

    // Sync campaigns for a specific account
    async syncCampaigns(accountId, campaignsData) {
        console.log(`Syncing campaigns for account ${accountId}...`);
        
        if (!campaignsData.elements || !Array.isArray(campaignsData.elements)) {
            throw new Error('Invalid campaigns data format');
        }

        const campaigns = [];
        for (const campaign of campaignsData.elements) {
            // Extract campaign group ID from URN
            const campaignGroupId = this.extractIdFromUrn(campaign.campaignGroup);
            
            const campaignData = {
                linkedin_campaign_id: campaign.id,
                linkedin_account_id: accountId,
                linkedin_group_id: campaignGroupId,
                name: campaign.name,
                status: campaign.status,
                campaign_type: campaign.type,
                format: campaign.format,
                objective_type: campaign.objectiveType,
                total_budget_amount: campaign.totalBudget?.amount ? parseFloat(campaign.totalBudget.amount) : null,
                total_budget_currency: campaign.totalBudget?.currencyCode || 'USD',
                unit_cost_amount: campaign.unitCost?.amount ? parseFloat(campaign.unitCost.amount) : null,
                unit_cost_currency: campaign.unitCost?.currencyCode || 'USD',
                cost_type: campaign.costType,
                pacing_strategy: campaign.pacingStrategy,
                optimization_target_type: campaign.optimizationTargetType,
                creative_selection: campaign.creativeSelection,
                audience_expansion_enabled: campaign.audienceExpansionEnabled || false,
                story_delivery_enabled: campaign.storyDeliveryEnabled || false,
                offsite_delivery_enabled: campaign.offsiteDeliveryEnabled || false,
                connected_television_only: campaign.connectedTelevisionOnly || false,
                run_schedule: campaign.runSchedule || null,
                targeting_criteria: campaign.targetingCriteria || null,
                serving_statuses: campaign.servingStatuses || [],
                version_tag: campaign.version?.versionTag,
                associated_entity_urn: campaign.associatedEntity,
                locale: campaign.locale || null,
                tenant_id: this.tenantId,
                linkedin_created_at: campaign.changeAuditStamps?.created?.time 
                    ? new Date(campaign.changeAuditStamps.created.time).toISOString()
                    : null,
                linkedin_modified_at: campaign.changeAuditStamps?.lastModified?.time 
                    ? new Date(campaign.changeAuditStamps.lastModified.time).toISOString()
                    : null,
                last_synced: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('linkedin_campaigns')
                .upsert(campaignData, { 
                    onConflict: 'linkedin_campaign_id',
                    ignoreDuplicates: false 
                })
                .select();

            if (error) {
                console.error('Error syncing campaign:', campaign.id, error);
                throw error;
            }

            campaigns.push(data[0]);

            // Extract and store unique campaign group if not already stored
            if (campaignGroupId && campaign.campaignGroup) {
                await this.ensureCampaignGroup(accountId, campaignGroupId, campaign.campaignGroup);
            }
        }

        console.log(`Synced ${campaigns.length} campaigns for account ${accountId}`);
        return campaigns;
    }

    // Ensure campaign group exists
    async ensureCampaignGroup(accountId, groupId, groupUrn) {
        const { data: existing } = await this.supabase
            .from('linkedin_campaign_groups')
            .select('id')
            .eq('linkedin_group_id', groupId)
            .single();

        if (!existing) {
            const groupData = {
                linkedin_group_id: groupId,
                linkedin_account_id: accountId,
                name: `Campaign Group ${groupId}`, // Will be updated when we fetch group details
                status: 'ACTIVE',
                tenant_id: this.tenantId,
                last_synced: new Date().toISOString()
            };

            const { error } = await this.supabase
                .from('linkedin_campaign_groups')
                .insert(groupData);

            if (error && !error.message.includes('duplicate')) {
                console.error('Error creating campaign group:', groupId, error);
            }
        }
    }

    // Sync campaign performance data
    async syncCampaignPerformance(campaignId, performanceData, date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        const perfData = {
            linkedin_campaign_id: campaignId,
            date: targetDate,
            impressions: performanceData.impressions || 0,
            clicks: performanceData.clicks || 0,
            spend: performanceData.spend ? parseFloat(performanceData.spend) : 0,
            conversions: performanceData.conversions || 0,
            video_views: performanceData.videoViews || 0,
            likes: performanceData.likes || 0,
            comments: performanceData.comments || 0,
            shares: performanceData.shares || 0,
            follows: performanceData.follows || 0,
            tenant_id: this.tenantId,
            synced_at: new Date().toISOString()
        };

        // Calculate derived metrics
        if (perfData.impressions > 0) {
            perfData.ctr = (perfData.clicks / perfData.impressions) * 100;
            perfData.cpm = (perfData.spend / perfData.impressions) * 1000;
        }

        if (perfData.clicks > 0) {
            perfData.cpc = perfData.spend / perfData.clicks;
        }

        if (perfData.conversions > 0) {
            perfData.conversion_rate = (perfData.conversions / perfData.clicks) * 100;
            perfData.cost_per_conversion = perfData.spend / perfData.conversions;
        }

        const totalEngagements = perfData.likes + perfData.comments + perfData.shares + perfData.follows;
        if (perfData.impressions > 0) {
            perfData.engagement_rate = (totalEngagements / perfData.impressions) * 100;
        }

        const { data, error } = await this.supabase
            .from('linkedin_campaign_performance')
            .upsert(perfData, { 
                onConflict: 'linkedin_campaign_id,date,tenant_id',
                ignoreDuplicates: false 
            })
            .select();

        if (error) {
            console.error('Error syncing performance data:', error);
            throw error;
        }

        return data[0];
    }

    // Link campaigns to posts based on campaign names or content
    async linkCampaignsToContent() {
        console.log('Linking LinkedIn campaigns to posts...');

        // Get all campaigns and posts
        const { data: campaigns } = await this.supabase
            .from('linkedin_campaigns')
            .select('id, linkedin_campaign_id, name, post_id')
            .is('post_id', null);

        const { data: posts } = await this.supabase
            .from('posts')
            .select('id, title, content')
            .is('linkedin_campaign_id', null);

        if (!campaigns || !posts) return;

        const links = [];
        for (const campaign of campaigns) {
            // Try to match campaign to post by name similarity
            const matchedPost = this.findBestPostMatch(campaign, posts);
            
            if (matchedPost) {
                // Update campaign with post link
                await this.supabase
                    .from('linkedin_campaigns')
                    .update({ post_id: parseInt(matchedPost.id) })
                    .eq('id', campaign.id);

                // Update post with campaign link
                await this.supabase
                    .from('posts')
                    .update({ linkedin_campaign_id: campaign.linkedin_campaign_id })
                    .eq('id', matchedPost.id);

                links.push({
                    campaign: campaign.name,
                    post: matchedPost.title,
                    confidence: 'auto-matched'
                });
            }
        }

        console.log(`Linked ${links.length} campaigns to posts`);
        return links;
    }

    // Find best post match for a campaign
    findBestPostMatch(campaign, posts) {
        if (!campaign.name) return null;

        const campaignName = campaign.name.toLowerCase();
        
        // Try exact title match first
        let bestMatch = posts.find(post => 
            post.title && post.title.toLowerCase().includes(campaignName.substring(0, 20))
        );

        if (bestMatch) return bestMatch;

        // Try content match
        bestMatch = posts.find(post => 
            post.content && campaignName.includes(post.title?.toLowerCase().substring(0, 15))
        );

        return bestMatch;
    }

    // Get campaign performance summary
    async getCampaignSummary(accountId = null) {
        let query = this.supabase
            .from('campaign_performance_summary')
            .select('*')
            .eq('tenant_id', this.tenantId);

        if (accountId) {
            // Join with linkedin_campaigns to filter by account
            query = this.supabase
                .from('campaign_performance_summary')
                .select(`
                    *,
                    linkedin_campaigns!inner(linkedin_account_id)
                `)
                .eq('linkedin_campaigns.linkedin_account_id', accountId)
                .eq('tenant_id', this.tenantId);
        }

        const { data, error } = await query.order('total_spend', { ascending: false });

        if (error) {
            console.error('Error fetching campaign summary:', error);
            throw error;
        }

        return data || [];
    }

    // Utility function to extract ID from LinkedIn URN
    extractIdFromUrn(urn) {
        if (!urn) return null;
        const match = urn.match(/:(\d+)$/);
        return match ? parseInt(match[1]) : null;
    }

    // Full sync for an account
    async fullAccountSync(accountId) {
        console.log(`Starting full sync for account ${accountId}...`);
        
        try {
            // Sync campaigns
            const campaignsResponse = await linkedInAPI.getCampaigns(accountId);
            const campaigns = await this.syncCampaigns(accountId, campaignsResponse);
            
            // Try to sync campaign groups
            try {
                const groupsResponse = await linkedInAPI.getCampaignGroups(accountId);
                if (groupsResponse.elements) {
                    console.log(`Found ${groupsResponse.elements.length} campaign groups`);
                }
            } catch (error) {
                console.log('Campaign groups not available or accessible');
            }

            // Link campaigns to existing content
            await this.linkCampaignsToContent();

            console.log(`Full sync completed for account ${accountId}. Synced ${campaigns.length} campaigns.`);
            return {
                success: true,
                accountId,
                campaignCount: campaigns.length,
                message: `Synced ${campaigns.length} campaigns`
            };

        } catch (error) {
            console.error(`Full sync failed for account ${accountId}:`, error);
            throw error;
        }
    }
}

// Initialize sync service
let linkedInSyncService;
if (typeof supabase !== 'undefined') {
    linkedInSyncService = new LinkedInSyncService(supabase);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkedInSyncService;
}