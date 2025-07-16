// LinkedIn Marketing Solutions API Service (via Proxy)
class LinkedInAPI {
    constructor(config = {}) {
        // Use local proxy server instead of direct LinkedIn API
        this.proxyBaseUrl = config.proxyBaseUrl || 'http://localhost:8001/api/linkedin';
        this.isProxyMode = true;
    }

    // Base API request method (via proxy)
    async request(endpoint, options = {}) {
        const url = `${this.proxyBaseUrl}/proxy${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
            }

            return await response.json();
        } catch (error) {
            console.error('LinkedIn API Request Failed:', error);
            throw error;
        }
    }

    // Direct proxy endpoints for better performance
    async proxyRequest(endpoint, options = {}) {
        const url = `${this.proxyBaseUrl}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
            }

            return await response.json();
        } catch (error) {
            console.error('LinkedIn API Request Failed:', error);
            throw error;
        }
    }

    // Get ad accounts accessible to the authenticated user
    async getAdAccounts() {
        return this.proxyRequest('/accounts');
    }

    // Get campaigns for a specific ad account
    async getCampaigns(adAccountId) {
        return this.proxyRequest(`/accounts/${adAccountId}/campaigns`);
    }

    // Get campaign groups for a specific ad account
    async getCampaignGroups(adAccountId) {
        return this.proxyRequest(`/accounts/${adAccountId}/campaign-groups`);
    }

    // Get saved audience templates
    async getAudienceTemplates(adAccountId) {
        return this.proxyRequest(`/accounts/${adAccountId}/audience-templates`);
    }

    // Get analytics data for campaigns
    async getCampaignAnalytics(campaignId, options = {}) {
        try {
            // Use the backend's direct analytics endpoint
            const url = `${this.proxyBaseUrl}/campaigns/${campaignId}/analytics`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Analytics API Error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.analytics) {
                return {
                    elements: result.analytics.map(item => ({
                        impressions: item.impressions || 0,
                        clicks: item.clicks || 0,
                        spend: item.spend || 0,
                        costInUsd: item.spend || 0
                    }))
                };
            }
            
            throw new Error('No analytics data returned');
            
        } catch (error) {
            console.error('Error fetching campaign analytics:', error);
            throw error;
        }
    }

    // Get campaign analytics with demographic breakdowns (enhanced version)
    async getCampaignDemographics(campaignId, options = {}) {
        try {
            // Use the backend's direct demographics endpoint
            const url = `${this.proxyBaseUrl}/campaigns/${campaignId}/demographics`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Demographics API Error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.demographics) {
                // Convert backend format to frontend format
                return {
                    demographics: {
                        COMPANY: result.demographics.MEMBER_COMPANY || [],
                        JOB_TITLE: result.demographics.MEMBER_JOB_TITLE || [],
                        SENIORITY: result.demographics.MEMBER_SENIORITY || [],
                        INDUSTRY: result.demographics.MEMBER_INDUSTRY || []
                    }
                };
            }
            
            throw new Error('No demographics data returned');
            
        } catch (error) {
            console.error('Error fetching campaign demographics:', error);
            throw error;
        }
    }


    // Store analytics data in database using the new schema
    async storeCampaignAnalytics(campaignId, analyticsData) {
        try {
            if (!window.supabase || !analyticsData) {
                return false;
            }

            // Call the database function to store analytics data
            const { data, error } = await window.supabase
                .rpc('store_linkedin_analytics', {
                    p_campaign_id: campaignId,
                    p_analytics_data: analyticsData
                });

            if (error) {
                console.error('Error storing analytics data:', error);
                return false;
            }

            console.log(`✅ Stored ${data} analytics records for campaign ${campaignId}`);
            return true;

        } catch (error) {
            console.error('Error in storeCampaignAnalytics:', error);
            return false;
        }
    }

    // Enhanced method that fetches and stores demographics data
    async fetchAndStoreCampaignDemographics(campaignId, options = {}) {
        try {
            console.log(`Fetching demographics for campaign ${campaignId}...`);
            
            // Fetch demographics using the unified backend endpoint
            const demographics = await this.getCampaignDemographics(campaignId, options);
            
            if (demographics && demographics.demographics) {
                // Store in database
                await this.storeCampaignAnalytics(campaignId, demographics);
                
                // Count total records
                const totalRecords = Object.values(demographics.demographics)
                    .reduce((sum, items) => sum + (items ? items.length : 0), 0);
                
                return {
                    success: true,
                    totalRecords,
                    demographics
                };
            }
            
            console.log('No demographics data available for campaign', campaignId);
            return { success: false, message: 'No demographics data available' };

        } catch (error) {
            console.error('Error fetching and storing campaign demographics:', error);
            return { success: false, error: error.message };
        }
    }


    // Test API connectivity
    async testConnection() {
        try {
            return await this.proxyRequest('/test');
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            };
        }
    }

    // Get targeting facets (available targeting options)
    async getTargetingFacets() {
        return this.proxyRequest('/targeting/facets');
    }

    // Get targeting entities (specific values for targeting)
    async getTargetingEntities(facetType, query = '') {
        return this.proxyRequest(`/targeting/entities?facetType=${facetType}&q=${encodeURIComponent(query)}`);
    }

    // Get audience count estimation
    async getAudienceCount(targetingCriteria) {
        return this.proxyRequest('/audienceCounts', {
            method: 'POST',
            body: { targetingCriteria }
        });
    }

    // Refresh access token using refresh token
    async refreshAccessToken() {
        // This would typically go to LinkedIn's token endpoint
        // For now, we'll just return a placeholder
        console.log('Token refresh needed - implement OAuth refresh flow');
        return { success: false, message: 'Token refresh not implemented' };
    }
    
    // Get creatives for a campaign
    async getCampaignCreatives(campaignId) {
        return this.proxyRequest(`/campaigns/${campaignId}/creatives`);
    }
    
    // Get shares for an organization
    async getOrganizationShares(orgId, options = {}) {
        const { start = 0, count = 50 } = options;
        return this.proxyRequest(`/organizations/${orgId}/shares?start=${start}&count=${count}`);
    }
    
    // Get UGC posts for an organization
    async getOrganizationUGCPosts(orgId, options = {}) {
        const { start = 0, count = 50 } = options;
        return this.proxyRequest(`/organizations/${orgId}/ugcPosts?start=${start}&count=${count}`);
    }
    
    // Get creative details by ID
    async getCreativeDetails(creativeId) {
        return this.proxyRequest(`/creatives/${creativeId}`);
    }
}

// Initialize LinkedIn API instance
const linkedInAPI = new LinkedInAPI(LINKEDIN_CONFIG);

// Test connectivity on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname.includes('settings') || window.location.pathname.includes('import')) {
        console.log('Testing LinkedIn API connection...');
        const testResult = await linkedInAPI.testConnection();
        console.log('LinkedIn API Test Result:', testResult);
        
        // Store result for UI display
        window.linkedInAPIStatus = testResult;
    }
});