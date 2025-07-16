// Campaign-Post Linking Service
// Links LinkedIn campaigns to posts and aggregates demographics data

class CampaignPostLinker {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.linkedInAPI = window.linkedInAPI || new LinkedInAPI();
    }

    // Link multiple campaigns to a single post
    async linkCampaignsToPost(postId, campaignIds, primaryCampaignId = null) {
        console.log(`🔗 Linking campaigns ${campaignIds.join(', ')} to post ${postId}`);
        
        try {
            // If no primary specified, use the first one
            const primary = primaryCampaignId || campaignIds[0];
            
            // Create entries in post_campaigns junction table
            const linkPromises = campaignIds.map(campaignId => 
                this.supabase
                    .from('post_campaigns')
                    .upsert({
                        post_id: postId,
                        campaign_id: campaignId,
                        linkedin_campaign_id: campaignId,
                        association_type: 'manual'
                    }, {
                        onConflict: 'post_id,campaign_id'
                    })
            );
            
            await Promise.all(linkPromises);
            
            // Update post with primary campaign if not already set
            const { data: post } = await this.supabase
                .from('posts')
                .select('linkedin_campaign_id')
                .eq('id', postId)
                .single();
                
            if (!post?.linkedin_campaign_id) {
                await this.supabase
                    .from('posts')
                    .update({ linkedin_campaign_id: primary })
                    .eq('id', postId);
            }
            
            console.log(`✅ Successfully linked ${campaignIds.length} campaigns to post ${postId}`);
            return { success: true, linkedCount: campaignIds.length };
            
        } catch (error) {
            console.error('Error linking campaigns to post:', error);
            return { success: false, error: error.message };
        }
    }

    // Search campaigns by post URL or content
    async searchCampaignsByPostUrl(postUrl) {
        console.log(`🔍 Searching campaigns for post URL: ${postUrl}`);
        
        try {
            // First, get all campaigns
            const { data: campaigns } = await this.supabase
                .from('linkedin_campaigns')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (!campaigns || campaigns.length === 0) {
                console.log('No campaigns found in database');
                return [];
            }
            
            const matches = [];
            
            // Check each campaign's creatives
            for (const campaign of campaigns) {
                try {
                    const creativesResponse = await this.linkedInAPI.getCampaignCreatives(campaign.linkedin_campaign_id);
                    
                    if (creativesResponse.success && creativesResponse.creatives) {
                        // Check if any creative matches the post URL
                        const matchingCreative = creativesResponse.creatives.find(creative => {
                            const creativeUrl = this.extractPostUrl(creative);
                            return creativeUrl && (creativeUrl === postUrl || this.urlsMatch(creativeUrl, postUrl));
                        });
                        
                        if (matchingCreative) {
                            matches.push({
                                campaign,
                                creative: matchingCreative,
                                confidence: 1.0 // High confidence for URL match
                            });
                        }
                    }
                } catch (error) {
                    console.warn(`Could not fetch creatives for campaign ${campaign.linkedin_campaign_id}:`, error);
                }
            }
            
            console.log(`Found ${matches.length} matching campaigns`);
            return matches;
            
        } catch (error) {
            console.error('Error searching campaigns:', error);
            return [];
        }
    }

    // Extract post URL from creative
    extractPostUrl(creative) {
        // LinkedIn creatives can have different structures
        if (creative.variables?.data?.shareMediaCategory === 'ARTICLE') {
            return creative.variables.data.shareUrl;
        }
        
        // For status updates, construct URL from reference
        if (creative.reference) {
            const match = creative.reference.match(/urn:li:share:(\d+)/);
            if (match) {
                return `https://www.linkedin.com/feed/update/urn:li:share:${match[1]}`;
            }
        }
        
        // For UGC posts
        if (creative.ugcPostReference) {
            const match = creative.ugcPostReference.match(/urn:li:ugcPost:(\d+)/);
            if (match) {
                return `https://www.linkedin.com/feed/update/urn:li:ugcPost:${match[1]}`;
            }
        }
        
        return null;
    }

    // Check if two URLs match (handle different LinkedIn URL formats)
    urlsMatch(url1, url2) {
        // Extract the core post identifier from both URLs
        const extractId = (url) => {
            const patterns = [
                /urn:li:share:(\d+)/,
                /urn:li:ugcPost:(\d+)/,
                /urn:li:activity:(\d+)/,
                /update\/([^\/\?]+)/
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }
            return null;
        };
        
        const id1 = extractId(url1);
        const id2 = extractId(url2);
        
        return id1 && id2 && id1 === id2;
    }

    // Get aggregated demographics for multiple campaigns
    async getAggregatedDemographics(campaignIds) {
        console.log(`📊 Aggregating demographics for campaigns: ${campaignIds.join(', ')}`);
        
        try {
            // Get analytics data for all campaigns
            const { data: analyticsData } = await this.supabase
                .from('linkedin_campaign_analytics')
                .select('*')
                .in('linkedin_campaign_id', campaignIds);
                
            if (!analyticsData || analyticsData.length === 0) {
                console.log('No analytics data found');
                return null;
            }
            
            // Aggregate by pivot type
            const aggregated = {
                companies: [],
                jobTitles: [],
                seniorities: [],
                industries: [],
                totalSpend: 0,
                totalImpressions: 0,
                totalClicks: 0
            };
            
            // Group by pivot type and aggregate
            const grouped = analyticsData.reduce((acc, item) => {
                const key = item.pivot_type;
                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
            }, {});
            
            // Process companies
            if (grouped.COMPANY) {
                aggregated.companies = this.aggregateAndSort(grouped.COMPANY, 'impressions', 10);
            }
            
            // Process job titles
            if (grouped.JOB_TITLE) {
                aggregated.jobTitles = this.aggregateAndSort(grouped.JOB_TITLE, 'impressions', 10);
            }
            
            // Process seniorities
            if (grouped.SENIORITY) {
                aggregated.seniorities = this.aggregateAndSort(grouped.SENIORITY, 'impressions', 5);
            }
            
            // Process industries
            if (grouped.INDUSTRY) {
                aggregated.industries = this.aggregateAndSort(grouped.INDUSTRY, 'impressions', 5);
            }
            
            // Calculate totals
            aggregated.totalSpend = analyticsData.reduce((sum, item) => sum + (item.spend || 0), 0);
            aggregated.totalImpressions = analyticsData.reduce((sum, item) => sum + (item.impressions || 0), 0);
            aggregated.totalClicks = analyticsData.reduce((sum, item) => sum + (item.clicks || 0), 0);
            
            return aggregated;
            
        } catch (error) {
            console.error('Error aggregating demographics:', error);
            return null;
        }
    }

    // Helper to aggregate and sort demographic data
    aggregateAndSort(items, metricKey, limit) {
        // Group by pivot_value and sum metrics
        const grouped = items.reduce((acc, item) => {
            const key = item.pivot_value;
            if (!acc[key]) {
                acc[key] = {
                    label: key,
                    impressions: 0,
                    clicks: 0,
                    spend: 0
                };
            }
            acc[key].impressions += item.impressions || 0;
            acc[key].clicks += item.clicks || 0;
            acc[key].spend += item.spend || 0;
            return acc;
        }, {});
        
        // Convert to array and sort
        return Object.values(grouped)
            .sort((a, b) => b[metricKey] - a[metricKey])
            .slice(0, limit);
    }

    // Quick method to link specific campaigns to post
    async linkVuckoCampaignsToPost(postId = 2) {
        // The two campaigns mentioned by the user
        const campaignIds = [751420716, 751420936];
        return await this.linkCampaignsToPost(postId, campaignIds, 751420716);
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.CampaignPostLinker = CampaignPostLinker;
}