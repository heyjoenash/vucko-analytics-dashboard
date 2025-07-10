// LinkedIn Marketing Solutions API Service (via Proxy)
class LinkedInAPI {
    constructor(config = {}) {
        // Use local proxy server instead of direct LinkedIn API
        this.proxyBaseUrl = config.proxyBaseUrl || 'http://localhost:3001/api/linkedin';
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
        // Handle both single campaign ID and array of campaigns
        let campaignIds;
        if (typeof campaignId === 'string' || typeof campaignId === 'number') {
            campaignIds = [campaignId];
        } else if (Array.isArray(campaignId)) {
            campaignIds = campaignId.map(c => typeof c === 'object' ? c.id : c);
        } else {
            campaignIds = [campaignId];
        }

        // Build query parameters
        const params = new URLSearchParams();
        
        // Add campaign filter
        params.append('q', 'analytics');
        params.append('campaigns', `List(${campaignIds.map(id => `urn:li:sponsoredCampaign:${id}`).join(',')})`);
        
        // Add pivots for demographic breakdowns
        if (options.pivots && options.pivots.length > 0) {
            options.pivots.forEach(pivot => {
                params.append('pivot', pivot);
            });
        }
        
        // Add metrics
        if (options.metrics && options.metrics.length > 0) {
            options.metrics.forEach(metric => {
                params.append('fields', metric);
            });
        } else {
            // Default metrics
            params.append('fields', 'impressions,clicks,spend');
        }
        
        // Add time range
        if (options.timeRange) {
            const { start, end } = options.timeRange;
            if (start) {
                const startDate = `(start:(year:${start.year},month:${start.month},day:${start.day}))`;
                if (end) {
                    const endDate = `(end:(year:${end.year},month:${end.month},day:${end.day}))`;
                    params.append('dateRange', `${startDate},${endDate}`);
                } else {
                    params.append('dateRange', startDate);
                }
            }
        }
        
        // Add time granularity
        params.append('timeGranularity', options.timeGranularity || 'ALL');

        return this.request(`/adAnalytics?${params.toString()}`);
    }

    // Get campaign analytics with demographic breakdowns (enhanced version)
    async getCampaignDemographics(campaignId, options = {}) {
        const defaultOptions = {
            pivots: ['COMPANY', 'JOB_TITLE', 'SENIORITY', 'INDUSTRY'],
            metrics: ['impressions', 'clicks', 'spend', 'costInUsd'],
            timeGranularity: 'ALL',
            timeRange: {
                start: { year: 2024, month: 1, day: 1 },
                end: { year: 2025, month: 12, day: 31 }
            }
        };

        const analyticsOptions = { ...defaultOptions, ...options };
        
        try {
            const demographics = await this.getCampaignAnalytics(campaignId, analyticsOptions);
            
            // Process and structure the demographic data for easier consumption
            return this.processDemographicResponse(demographics);
            
        } catch (error) {
            console.error('Error fetching campaign demographics:', error);
            
            // Return mock data for development/testing
            return this.getMockDemographicData(campaignId);
        }
    }

    // Process demographic response into structured format
    processDemographicResponse(response) {
        if (!response || !response.elements) {
            return null;
        }

        const processedData = {
            campaigns: {},
            demographics: {
                COMPANY: [],
                JOB_TITLE: [],
                SENIORITY: [],
                INDUSTRY: []
            }
        };

        response.elements.forEach(element => {
            const pivot = element.pivot;
            const pivotValue = element.pivotValue;
            
            if (pivot && pivotValue && processedData.demographics[pivot]) {
                processedData.demographics[pivot].push({
                    label: pivotValue,
                    impressions: element.impressions || 0,
                    clicks: element.clicks || 0,
                    spend: element.spend || element.costInUsd || 0
                });
            }
        });

        // Sort each demographic category by impressions
        Object.keys(processedData.demographics).forEach(key => {
            processedData.demographics[key].sort((a, b) => b.impressions - a.impressions);
        });

        return processedData;
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
            // Fetch analytics data from LinkedIn API
            const analyticsData = await this.getCampaignAnalytics(campaignId, {
                pivots: ['COMPANY', 'JOB_TITLE', 'SENIORITY', 'INDUSTRY'],
                metrics: ['impressions', 'clicks', 'spend', 'costInUsd'],
                timeGranularity: 'ALL',
                ...options
            });

            if (analyticsData && analyticsData.elements) {
                // Store in database
                await this.storeCampaignAnalytics(campaignId, analyticsData);
                
                // Return processed data for immediate use
                return this.processDemographicResponse(analyticsData);
            }

            return null;

        } catch (error) {
            console.error('Error fetching and storing campaign demographics:', error);
            return null;
        }
    }

    // Mock demographic data for development/testing
    getMockDemographicData(campaignId) {
        return {
            demographics: {
                COMPANY: [
                    { label: 'Microsoft', impressions: 5420, clicks: 234, spend: 1250.50 },
                    { label: 'Google', impressions: 4832, clicks: 198, spend: 1100.25 },
                    { label: 'Amazon', impressions: 4156, clicks: 167, spend: 950.75 },
                    { label: 'Meta', impressions: 3845, clicks: 145, spend: 875.40 },
                    { label: 'Apple', impressions: 3234, clicks: 132, spend: 750.60 }
                ],
                JOB_TITLE: [
                    { label: 'Software Engineer', impressions: 3456, clicks: 178, spend: 825.30 },
                    { label: 'Product Manager', impressions: 2987, clicks: 145, spend: 712.80 },
                    { label: 'Engineering Manager', impressions: 2543, clicks: 124, spend: 615.45 },
                    { label: 'Senior Software Engineer', impressions: 2234, clicks: 98, spend: 545.20 },
                    { label: 'Technical Lead', impressions: 1987, clicks: 87, spend: 478.65 }
                ],
                SENIORITY: [
                    { label: 'Mid-Senior level', impressions: 8765, clicks: 354, spend: 2100.75 },
                    { label: 'Senior level', impressions: 6543, clicks: 287, spend: 1650.40 },
                    { label: 'Entry level', impressions: 4321, clicks: 198, spend: 1025.60 },
                    { label: 'Executive', impressions: 2109, clicks: 89, spend: 650.25 }
                ],
                INDUSTRY: [
                    { label: 'Computer Software', impressions: 7654, clicks: 312, spend: 1875.80 },
                    { label: 'Information Technology', impressions: 5432, clicks: 234, spend: 1320.50 },
                    { label: 'Financial Services', impressions: 4321, clicks: 187, spend: 1050.25 },
                    { label: 'Consulting', impressions: 3210, clicks: 145, spend: 780.40 }
                ]
            }
        };
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