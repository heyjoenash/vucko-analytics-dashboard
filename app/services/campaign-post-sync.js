// Campaign Post Sync Service
// Extracts posts from LinkedIn campaigns and creates/updates post records

class CampaignPostSyncService {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.linkedInAPI = window.linkedInAPI || new LinkedInAPI();
    }

    // Extract post URL from creative data
    extractPostUrl(creative) {
        // LinkedIn creatives can have different structures
        if (creative.variables?.data?.shareMediaCategory === 'ARTICLE') {
            return creative.variables.data.shareUrl;
        }
        
        // For status updates, we might need to construct the URL
        if (creative.reference) {
            // Extract post ID from reference URN
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

    // Extract post content from creative
    extractPostContent(creative) {
        let content = {
            text: '',
            title: '',
            description: '',
            imageUrl: null
        };
        
        // Extract text content
        if (creative.variables?.data?.text?.text) {
            content.text = creative.variables.data.text.text;
        }
        
        // Extract title and description
        if (creative.variables?.data?.content) {
            content.title = creative.variables.data.content.title || '';
            content.description = creative.variables.data.content.description || '';
        }
        
        // Extract image URL
        if (creative.variables?.data?.content?.media) {
            const media = creative.variables.data.content.media[0];
            if (media?.thumbnails?.length > 0) {
                content.imageUrl = media.thumbnails[0].url;
            }
        }
        
        return content;
    }

    // Create or update post record
    async createOrUpdatePost(postData) {
        const {
            linkedin_url,
            linkedin_campaign_id,
            linkedin_creative_id,
            content,
            is_organic = false,
            campaign_name,
            account_name
        } = postData;
        
        try {
            // Check if post already exists
            const { data: existingPost } = await this.supabase
                .from('posts')
                .select('id')
                .eq('linkedin_url', linkedin_url)
                .single();
            
            const postRecord = {
                url: linkedin_url,
                linkedin_url: linkedin_url,
                linkedin_campaign_id: linkedin_campaign_id,
                linkedin_creative_id: linkedin_creative_id,
                post_title: content.title || content.text.substring(0, 100),
                content_preview: content.text.substring(0, 500),
                account_name: account_name,
                is_organic: is_organic,
                extracted_from_campaign: true,
                account_type: 'company'
            };
            
            if (existingPost) {
                // Update existing post
                const { data, error } = await this.supabase
                    .from('posts')
                    .update(postRecord)
                    .eq('id', existingPost.id)
                    .select()
                    .single();
                
                if (error) throw error;
                console.log(`✅ Updated post ${existingPost.id} with campaign data`);
                return data;
            } else {
                // Create new post
                const { data, error } = await this.supabase
                    .from('posts')
                    .insert(postRecord)
                    .select()
                    .single();
                
                if (error) throw error;
                console.log(`✅ Created new post from campaign creative`);
                return data;
            }
        } catch (error) {
            console.error('Error creating/updating post:', error);
            throw error;
        }
    }

    // Sync all creatives for a campaign
    async syncCampaignPosts(campaignId, campaignData = {}) {
        console.log(`🔄 Syncing posts for campaign ${campaignId}...`);
        
        try {
            // Fetch creatives for the campaign
            const creativesResponse = await this.linkedInAPI.getCampaignCreatives(campaignId);
            
            if (!creativesResponse.success || !creativesResponse.creatives) {
                console.warn(`No creatives found for campaign ${campaignId}`);
                return { success: false, postsCreated: 0, postsUpdated: 0 };
            }
            
            const results = {
                success: true,
                postsCreated: 0,
                postsUpdated: 0,
                posts: []
            };
            
            // Process each creative
            for (const creative of creativesResponse.creatives) {
                const postUrl = this.extractPostUrl(creative);
                
                if (!postUrl) {
                    console.warn('Could not extract post URL from creative:', creative.id);
                    continue;
                }
                
                const content = this.extractPostContent(creative);
                
                const postData = {
                    linkedin_url: postUrl,
                    linkedin_campaign_id: campaignId,
                    linkedin_creative_id: creative.id,
                    content: content,
                    is_organic: false,
                    campaign_name: campaignData.name,
                    account_name: campaignData.account_name
                };
                
                try {
                    const post = await this.createOrUpdatePost(postData);
                    results.posts.push(post);
                    
                    if (post.extracted_from_campaign) {
                        results.postsUpdated++;
                    } else {
                        results.postsCreated++;
                    }
                } catch (error) {
                    console.error(`Failed to sync post from creative ${creative.id}:`, error);
                }
            }
            
            console.log(`✅ Campaign sync complete: ${results.postsCreated} created, ${results.postsUpdated} updated`);
            return results;
            
        } catch (error) {
            console.error('Error syncing campaign posts:', error);
            return { success: false, error: error.message };
        }
    }

    // Sync posts for multiple campaigns
    async syncMultipleCampaigns(campaigns) {
        const results = {
            totalCampaigns: campaigns.length,
            successfulCampaigns: 0,
            totalPostsCreated: 0,
            totalPostsUpdated: 0,
            errors: []
        };
        
        for (const campaign of campaigns) {
            try {
                const syncResult = await this.syncCampaignPosts(
                    campaign.linkedin_campaign_id,
                    {
                        name: campaign.name,
                        account_name: campaign.account_name
                    }
                );
                
                if (syncResult.success) {
                    results.successfulCampaigns++;
                    results.totalPostsCreated += syncResult.postsCreated;
                    results.totalPostsUpdated += syncResult.postsUpdated;
                } else {
                    results.errors.push({
                        campaignId: campaign.linkedin_campaign_id,
                        error: syncResult.error
                    });
                }
            } catch (error) {
                results.errors.push({
                    campaignId: campaign.linkedin_campaign_id,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    // Sync organic shares for an organization
    async syncOrganizationShares(orgId, orgName) {
        console.log(`🔄 Syncing organic shares for organization ${orgId}...`);
        
        try {
            const sharesResponse = await this.linkedInAPI.getOrganizationShares(orgId);
            
            if (!sharesResponse.success || !sharesResponse.shares) {
                console.warn(`No shares found for organization ${orgId}`);
                return { success: false, postsCreated: 0, postsUpdated: 0 };
            }
            
            const results = {
                success: true,
                postsCreated: 0,
                postsUpdated: 0,
                posts: []
            };
            
            for (const share of sharesResponse.shares) {
                // Construct post URL from share ID
                const postUrl = `https://www.linkedin.com/feed/update/${share.activity}`;
                
                const content = {
                    text: share.text?.text || '',
                    title: share.content?.title || '',
                    description: share.content?.description || '',
                    imageUrl: share.content?.thumbnails?.[0]?.url || null
                };
                
                const postData = {
                    linkedin_url: postUrl,
                    linkedin_campaign_id: null, // Organic post
                    linkedin_creative_id: null,
                    content: content,
                    is_organic: true,
                    campaign_name: null,
                    account_name: orgName
                };
                
                try {
                    const post = await this.createOrUpdatePost(postData);
                    results.posts.push(post);
                    
                    if (post.extracted_from_campaign) {
                        results.postsUpdated++;
                    } else {
                        results.postsCreated++;
                    }
                } catch (error) {
                    console.error(`Failed to sync share ${share.id}:`, error);
                }
            }
            
            return results;
            
        } catch (error) {
            console.error('Error syncing organization shares:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.CampaignPostSyncService = CampaignPostSyncService;
}