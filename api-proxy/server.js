const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    credentials: true
}));
app.use(express.json());

// LinkedIn API Configuration
const LINKEDIN_CONFIG = {
    baseUrl: 'https://api.linkedin.com/rest',
    version: '202501',
    accessToken: process.env.LINKEDIN_ACCESS_TOKEN || 'AQUoVOzZPPdrbDwIditmhpajhmaJzDqH0A_I9JqBBBzxf2Rw9uRuFTlC4zz7LWt2BqSOKxd9jKr_4rDNXMgu4ETuGTOY95B1_ve05MpG723iiO-wvRZ7A7eBiF7WuljGlItrVQotQjCHiu30EKi3i8tadRS1gnICCi-hYhbl3pbcoY68FNGh2MI1rsAEFGaCb3aEPhUuVovL0Ivl6eHotujmd5qDPw_BBGjydu6sy2eViHLWcQjtDJ32eXsC1Mxxp_2ZgYOMU4txVZ9AJqomC3o7UCVvnNKZ7M7gjcnCo638is8CY9obDT2K7ciInxEZ012PwarYWesaFD5TR7K03TSslJm1cQ'
};

// LinkedIn API client
class LinkedInAPIClient {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.version = config.version;
        this.accessToken = config.accessToken;
        this.cache = new Map();
        this.rateLimiter = {
            requests: 0,
            resetTime: Date.now() + 3600000 // 1 hour
        };
    }

    async makeRequest(endpoint, options = {}) {
        // Rate limiting check
        if (this.rateLimiter.requests >= 500) { // LinkedIn rate limit
            if (Date.now() < this.rateLimiter.resetTime) {
                throw new Error('Rate limit exceeded. Try again later.');
            } else {
                this.rateLimiter.requests = 0;
                this.rateLimiter.resetTime = Date.now() + 3600000;
            }
        }

        // Check cache for GET requests
        const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
        if (options.method === 'GET' && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
                console.log('Returning cached response for:', endpoint);
                return cached.data;
            }
        }

        // For analytics endpoints, check if we need to decode REST-li syntax
        let url = `${this.baseUrl}${endpoint}`;
        
        // Temporarily disable REST-li decoding to see actual error
        console.log('Original URL:', url);
        
        const headers = {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': this.version,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            console.log('\n=== LINKEDIN API REQUEST ===');
            console.log('URL:', url);
            console.log('Method:', options.method || 'GET');
            console.log('Headers:', {
                'X-Restli-Protocol-Version': headers['X-Restli-Protocol-Version'],
                'LinkedIn-Version': headers['LinkedIn-Version'],
                'Content-Type': headers['Content-Type'],
                'Authorization': 'Bearer [REDACTED]'
            });
            console.log('===========================\n');
            const response = await axios({
                method: options.method || 'GET',
                url,
                headers,
                data: options.body,
                timeout: 10000
            });

            this.rateLimiter.requests++;

            // Cache GET responses
            if (options.method === 'GET') {
                this.cache.set(cacheKey, {
                    data: response.data,
                    timestamp: Date.now()
                });
            }

            return response.data;
        } catch (error) {
            console.error('LinkedIn API Error:', JSON.stringify(error.response?.data, null, 2) || error.message);
            throw {
                status: error.response?.status || 500,
                message: error.response?.data?.message || error.message,
                details: error.response?.data
            };
        }
    }
}

const linkedInClient = new LinkedInAPIClient(LINKEDIN_CONFIG);

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        rateLimit: linkedInClient.rateLimiter
    });
});

// Diagnostic endpoint for testing campaign retrieval
app.get('/api/linkedin/diagnostics/campaigns/:accountId', async (req, res) => {
    const { accountId } = req.params;
    const results = [];
    
    console.log(`\n=== CAMPAIGN DIAGNOSTICS FOR ACCOUNT ${accountId} ===`);
    
    // Test different parameter combinations
    const tests = [
        {
            name: 'Basic search',
            endpoint: `/adAccounts/${accountId}/adCampaigns?q=search`
        },
        {
            name: 'With ACTIVE status only',
            endpoint: `/adAccounts/${accountId}/adCampaigns?q=search&status=List(ACTIVE)`
        },
        {
            name: 'With COMPLETED status only',
            endpoint: `/adAccounts/${accountId}/adCampaigns?q=search&status=List(COMPLETED)`
        },
        {
            name: 'With all statuses',
            endpoint: `/adAccounts/${accountId}/adCampaigns?q=search&status=List(ACTIVE,PAUSED,COMPLETED,DRAFT,ARCHIVED,CANCELED)`
        },
        {
            name: 'Without query param',
            endpoint: `/adAccounts/${accountId}/adCampaigns`
        },
        {
            name: 'With count parameter',
            endpoint: `/adAccounts/${accountId}/adCampaigns?q=search&count=100`
        },
        {
            name: 'With start parameter',
            endpoint: `/adAccounts/${accountId}/adCampaigns?q=search&start=0&count=50`
        }
    ];
    
    // Test specific campaign IDs from the screenshot
    const specificCampaignIds = ['417124566', '417161426', '417161666'];
    
    for (const test of tests) {
        console.log(`\nTesting: ${test.name}`);
        console.log(`Endpoint: ${test.endpoint}`);
        
        try {
            const result = await linkedInClient.makeRequest(test.endpoint);
            const campaignCount = result.elements?.length || 0;
            
            console.log(`✅ Success! Found ${campaignCount} campaigns`);
            
            results.push({
                test: test.name,
                endpoint: test.endpoint,
                success: true,
                campaignCount,
                total: result.paging?.total || campaignCount,
                sampleCampaign: result.elements?.[0] ? {
                    id: result.elements[0].id,
                    name: result.elements[0].name,
                    status: result.elements[0].status
                } : null
            });
            
            // If we found campaigns, check if our specific ones are there
            if (result.elements?.length > 0) {
                const foundIds = result.elements.map(c => c.id);
                const foundSpecific = specificCampaignIds.filter(id => foundIds.includes(id));
                if (foundSpecific.length > 0) {
                    console.log(`🎯 Found specific campaigns: ${foundSpecific.join(', ')}`);
                    results[results.length - 1].foundSpecificCampaigns = foundSpecific;
                }
            }
            
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
            results.push({
                test: test.name,
                endpoint: test.endpoint,
                success: false,
                error: error.message,
                status: error.status
            });
        }
    }
    
    // Test direct access to specific campaigns
    console.log(`\n=== TESTING DIRECT CAMPAIGN ACCESS ===`);
    for (const campaignId of specificCampaignIds) {
        try {
            const endpoint = `/adAccounts/${accountId}/adCampaigns/${campaignId}`;
            console.log(`Testing campaign ${campaignId}: ${endpoint}`);
            
            const result = await linkedInClient.makeRequest(endpoint);
            console.log(`✅ Found campaign ${campaignId}: ${result.name}`);
            
            results.push({
                test: `Direct access to campaign ${campaignId}`,
                endpoint,
                success: true,
                campaign: {
                    id: result.id,
                    name: result.name,
                    status: result.status
                }
            });
        } catch (error) {
            console.log(`❌ Campaign ${campaignId} not found: ${error.message}`);
            results.push({
                test: `Direct access to campaign ${campaignId}`,
                endpoint: `/adAccounts/${accountId}/adCampaigns/${campaignId}`,
                success: false,
                error: error.message
            });
        }
    }
    
    console.log(`\n=== DIAGNOSTICS COMPLETE ===\n`);
    
    res.json({
        accountId,
        timestamp: new Date().toISOString(),
        results,
        summary: {
            totalTests: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            foundAnyCampaigns: results.some(r => r.campaignCount > 0),
            foundSpecificCampaigns: results.some(r => r.foundSpecificCampaigns?.length > 0)
        }
    });
});

// OAuth scope validation endpoint
app.get('/api/linkedin/validate-scopes', async (req, res) => {
    const validationResults = {
        timestamp: new Date().toISOString(),
        tokenConfigured: !!linkedInClient.accessToken,
        scopeTests: []
    };

    // Test each required scope by attempting API calls that require them
    const scopeTests = [
        {
            scope: 'r_ads',
            test: 'Account Access',
            endpoint: '/adAccounts?q=search',
            required: true
        },
        {
            scope: 'r_ads_reporting',
            test: 'Analytics Access',
            endpoint: '/adAnalytics?q=analytics&pivot=CAMPAIGN&timeGranularity=ALL',
            required: true
        },
        {
            scope: 'r_organization_social',
            test: 'Organization Access',
            endpoint: '/organizations',
            required: false
        }
    ];

    for (const scopeTest of scopeTests) {
        try {
            console.log(`\n=== SCOPE TEST: ${scopeTest.scope} ===`);
            const result = await linkedInClient.makeRequest(scopeTest.endpoint);
            validationResults.scopeTests.push({
                scope: scopeTest.scope,
                test: scopeTest.test,
                status: 'PASS',
                hasData: result.elements ? result.elements.length > 0 : !!result,
                elementCount: result.elements?.length || 0
            });
            console.log(`✅ ${scopeTest.scope} test passed`);
        } catch (error) {
            validationResults.scopeTests.push({
                scope: scopeTest.scope,
                test: scopeTest.test,
                status: 'FAIL',
                error: error.message,
                httpStatus: error.status,
                details: error.details,
                isPermissionError: error.status === 403 || error.message?.includes('ILLEGAL_ARGUMENT') || error.message?.includes('ACCESS_DENIED')
            });
            console.error(`❌ ${scopeTest.scope} test failed:`, error.message);
        }
    }

    // Analyze results
    const failedScopes = validationResults.scopeTests.filter(t => t.status === 'FAIL');
    const permissionErrors = failedScopes.filter(t => t.isPermissionError);

    validationResults.summary = {
        totalTests: validationResults.scopeTests.length,
        passed: validationResults.scopeTests.filter(t => t.status === 'PASS').length,
        failed: failedScopes.length,
        permissionIssues: permissionErrors.length,
        recommendation: permissionErrors.length > 0 
            ? 'OAuth token may be missing required scopes. Check application permissions in LinkedIn Developer Portal.'
            : failedScopes.length > 0 
                ? 'API calls failing for reasons other than permissions. Check API syntax and account access.'
                : 'All scope tests passed successfully.'
    };

    res.json(validationResults);
});

// Test connection - enhanced with multiple API tests
app.get('/api/linkedin/test', async (req, res) => {
    const tests = [];
    
    // Test 1: Basic account access
    try {
        console.log('\n=== LinkedIn API Test Suite ===');
        console.log('Test 1: Fetching ad accounts...');
        const accountResult = await linkedInClient.makeRequest('/adAccounts?q=search');
        tests.push({
            test: 'Ad Accounts',
            success: true,
            accountCount: accountResult.elements ? accountResult.elements.length : 0,
            accounts: accountResult.elements || []
        });
        console.log(`✅ Found ${accountResult.elements?.length || 0} ad accounts`);
    } catch (error) {
        tests.push({
            test: 'Ad Accounts',
            success: false,
            error: error.message,
            details: error.details
        });
        console.error('❌ Ad accounts test failed:', error.message);
    }
    
    // Test 2: Analytics API access (no parameters)
    try {
        console.log('\nTest 2: Testing analytics API access...');
        const analyticsResult = await linkedInClient.makeRequest('/adAnalytics?q=analytics&pivot=CAMPAIGN&timeGranularity=ALL');
        tests.push({
            test: 'Analytics API (Basic)',
            success: true,
            elementCount: analyticsResult.elements ? analyticsResult.elements.length : 0
        });
        console.log(`✅ Analytics API accessible, ${analyticsResult.elements?.length || 0} elements returned`);
    } catch (error) {
        tests.push({
            test: 'Analytics API (Basic)',
            success: false,
            error: error.message,
            details: error.details
        });
        console.error('❌ Analytics API test failed:', error.message);
    }
    
    // Test 3: Campaign retrieval
    try {
        console.log('\nTest 3: Testing campaign retrieval...');
        // Try to get campaigns from the first account
        if (tests[0].success && tests[0].accounts.length > 0) {
            const accountId = tests[0].accounts[0].id;
            const campaignResult = await linkedInClient.makeRequest(`/adAccounts/${accountId}/adCampaigns?q=search`);
            tests.push({
                test: 'Campaign Retrieval',
                success: true,
                accountId: accountId,
                campaignCount: campaignResult.elements ? campaignResult.elements.length : 0,
                campaigns: campaignResult.elements?.slice(0, 5) || [] // First 5 campaigns
            });
            console.log(`✅ Found ${campaignResult.elements?.length || 0} campaigns`);
        } else {
            tests.push({
                test: 'Campaign Retrieval',
                success: false,
                error: 'No ad accounts available to test campaigns'
            });
        }
    } catch (error) {
        tests.push({
            test: 'Campaign Retrieval',
            success: false,
            error: error.message,
            details: error.details
        });
        console.error('❌ Campaign retrieval test failed:', error.message);
    }
    
    // Test 4: Check LinkedIn API version support
    console.log('\nTest 4: Testing API version support...');
    tests.push({
        test: 'API Configuration',
        currentVersion: linkedInClient.version,
        baseUrl: linkedInClient.baseUrl,
        authConfigured: !!linkedInClient.accessToken
    });
    
    res.json({
        success: tests.some(t => t.success),
        timestamp: new Date().toISOString(),
        tests: tests,
        summary: {
            totalTests: tests.length,
            passed: tests.filter(t => t.success).length,
            failed: tests.filter(t => t.success === false).length
        }
    });
});

// Get ad accounts
app.get('/api/linkedin/accounts', async (req, res) => {
    try {
        const result = await linkedInClient.makeRequest('/adAccounts?q=search');
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({
            error: error.message,
            details: error.details
        });
    }
});

// Get campaigns for an account - Updated to include all statuses
app.get('/api/linkedin/accounts/:accountId/campaigns', async (req, res) => {
    try {
        const { accountId } = req.params;
        const { status, dateRange } = req.query;
        
        // Build endpoint with all statuses by default
        let endpoint = `/adAccounts/${accountId}/adCampaigns?q=search`;
        
        // Don't add status filter - LinkedIn API doesn't support it
        // Just use basic search which returns all campaigns
        
        // Add count parameter for pagination
        endpoint += `&count=100`;
        
        // Add start parameter if provided
        if (req.query.start) {
            endpoint += `&start=${req.query.start}`;
        }
        
        // Add date range if provided
        if (dateRange) {
            endpoint += `&${dateRange}`;
        }
        
        console.log(`\n=== FETCHING CAMPAIGNS ===`);
        console.log(`Account ID: ${accountId}`);
        console.log(`Status Filter: none (API doesn't support)`);
        console.log(`Full endpoint: ${endpoint}`);
        
        const result = await linkedInClient.makeRequest(endpoint);
        
        console.log(`Found ${result.elements?.length || 0} campaigns`);
        if (result.elements?.length > 0) {
            console.log('Sample campaign:', JSON.stringify(result.elements[0], null, 2));
        }
        console.log(`=========================\n`);
        
        res.json({
            success: true,
            accountId,
            campaigns: result.elements || [],
            total: result.paging?.total || 0,
            query: {
                status: 'none (API doesn\'t support status filtering)',
                dateRange: dateRange || 'none',
                count: 100
            }
        });
    } catch (error) {
        console.error(`Error fetching campaigns for account ${accountId}:`, error);
        res.status(error.status || 500).json({
            success: false,
            error: error.message,
            details: error.details
        });
    }
});

// Get campaign groups for an account
app.get('/api/linkedin/accounts/:accountId/campaign-groups', async (req, res) => {
    try {
        const { accountId } = req.params;
        const result = await linkedInClient.makeRequest(`/adAccounts/${accountId}/adCampaignGroups?q=search`);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({
            error: error.message,
            details: error.details
        });
    }
});

// Get audience templates for an account
app.get('/api/linkedin/accounts/:accountId/audience-templates', async (req, res) => {
    try {
        const { accountId } = req.params;
        const result = await linkedInClient.makeRequest(`/adAccounts/${accountId}/audienceTemplates?q=search`);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({
            error: error.message,
            details: error.details
        });
    }
});

// Get targeting facets
app.get('/api/linkedin/targeting/facets', async (req, res) => {
    try {
        const result = await linkedInClient.makeRequest('/adTargetingFacets');
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({
            error: error.message,
            details: error.details
        });
    }
});

// Get targeting entities
app.get('/api/linkedin/targeting/entities', async (req, res) => {
    try {
        const { facetType, q } = req.query;
        const queryParams = new URLSearchParams();
        if (facetType) queryParams.append('facetType', facetType);
        if (q) queryParams.append('q', q);
        
        const result = await linkedInClient.makeRequest(`/adTargetingEntities?${queryParams.toString()}`);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({
            error: error.message,
            details: error.details
        });
    }
});

// Get targeting entity by ID - for decoding individual URNs
app.get('/api/linkedin/targeting/entities/:facetType/:entityId', async (req, res) => {
    try {
        const { facetType, entityId } = req.params;
        
        // Try to find the entity by ID
        const queryParams = new URLSearchParams();
        queryParams.append('facetType', facetType);
        queryParams.append('ids', `urn:li:${facetType.toLowerCase()}:${entityId}`);
        
        const result = await linkedInClient.makeRequest(`/adTargetingEntities?${queryParams.toString()}`);
        
        if (result.elements && result.elements.length > 0) {
            res.json({
                success: true,
                entity: result.elements[0]
            });
        } else {
            res.json({
                success: false,
                error: 'Entity not found',
                fallback: `${facetType} ${entityId}`
            });
        }
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.message,
            details: error.details,
            fallback: `${req.params.facetType} ${req.params.entityId}`
        });
    }
});

// Batch decode URNs
app.post('/api/linkedin/targeting/decode-urns', async (req, res) => {
    try {
        const { urns } = req.body;
        
        if (!Array.isArray(urns)) {
            return res.status(400).json({
                error: 'urns must be an array'
            });
        }

        const results = {};
        const batchPromises = [];

        // Group URNs by facet type for efficient batching
        const urnsByFacet = {};
        
        for (const urn of urns) {
            const match = urn.match(/^urn:li:(\w+):(.+)$/);
            if (match) {
                const [, facetType, id] = match;
                if (!urnsByFacet[facetType]) {
                    urnsByFacet[facetType] = [];
                }
                urnsByFacet[facetType].push({ urn, id });
            } else {
                // Fallback for URNs that don't match the pattern
                results[urn] = urn;
            }
        }

        // Process each facet type in batches
        for (const [facetType, urnList] of Object.entries(urnsByFacet)) {
            const promise = (async () => {
                try {
                    const ids = urnList.map(item => item.urn);
                    const queryParams = new URLSearchParams();
                    queryParams.append('facetType', facetType.toUpperCase());
                    queryParams.append('ids', ids.join(','));
                    
                    const result = await linkedInClient.makeRequest(`/adTargetingEntities?${queryParams.toString()}`);
                    
                    if (result.elements) {
                        // Map results back to original URNs
                        for (const element of result.elements) {
                            const elementUrn = element.id || element.urn;
                            if (elementUrn) {
                                results[elementUrn] = element.name || element.localizedName || elementUrn;
                            }
                        }
                    }
                    
                    // Add fallbacks for URNs that weren't found
                    for (const { urn, id } of urnList) {
                        if (!results[urn]) {
                            results[urn] = `${facetType} ${id}`;
                        }
                    }
                } catch (batchError) {
                    console.error(`Error processing ${facetType} URNs:`, batchError);
                    // Add fallbacks for this entire batch
                    for (const { urn, id } of urnList) {
                        results[urn] = `${facetType} ${id}`;
                    }
                }
            })();
            
            batchPromises.push(promise);
        }

        await Promise.allSettled(batchPromises);

        res.json({
            success: true,
            results,
            total: urns.length,
            decoded: Object.keys(results).length
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.message,
            details: error.details
        });
    }
});

// Get specific campaign by ID directly
app.get('/api/linkedin/campaigns/direct/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { accountId } = req.query;
        
        console.log(`\n=== DIRECT CAMPAIGN FETCH ===`);
        console.log(`Campaign ID: ${campaignId}`);
        console.log(`Account ID: ${accountId || 'not provided'}`);
        
        // Try multiple approaches to get the campaign
        const approaches = [
            {
                name: 'Direct by ID',
                endpoint: `/adCampaigns/${campaignId}`
            },
            {
                name: 'By Campaign URN',
                endpoint: `/adCampaigns/urn:li:sponsoredCampaign:${campaignId}`
            }
        ];
        
        if (accountId) {
            approaches.unshift({
                name: 'Account + Campaign ID',
                endpoint: `/adAccounts/${accountId}/adCampaigns/${campaignId}`
            });
        }
        
        for (const approach of approaches) {
            try {
                console.log(`Trying approach: ${approach.name}`);
                console.log(`Endpoint: ${approach.endpoint}`);
                
                const result = await linkedInClient.makeRequest(approach.endpoint);
                
                console.log(`✅ Success! Found campaign.`);
                console.log(`Campaign details:`, JSON.stringify(result, null, 2));
                
                return res.json({
                    success: true,
                    campaign: result,
                    approach: approach.name
                });
            } catch (error) {
                console.log(`❌ Failed: ${error.message}`);
            }
        }
        
        // If all approaches failed
        res.status(404).json({
            success: false,
            error: 'Campaign not found',
            triedApproaches: approaches.map(a => a.name)
        });
        
    } catch (error) {
        console.error('Error in direct campaign fetch:', error);
        res.status(error.status || 500).json({
            success: false,
            error: error.message
        });
    }
});

// Get campaign details - Updated to handle both old and new API patterns
app.get('/api/linkedin/campaigns/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { accountId } = req.query;
        
        let endpoint;
        let campaign;
        
        // If accountId is provided, use the new API pattern
        if (accountId) {
            endpoint = `/adAccounts/${accountId}/adCampaigns/${campaignId}`;
            campaign = await linkedInClient.makeRequest(endpoint);
        } else {
            // Try to get the campaign directly (might fail with new API)
            try {
                endpoint = `/adCampaigns/${campaignId}`;
                campaign = await linkedInClient.makeRequest(endpoint);
            } catch (directError) {
                // If direct access fails, we need the account ID
                return res.status(400).json({
                    success: false,
                    error: 'Account ID is required for this API. Please provide accountId as a query parameter.',
                    details: directError.details
                });
            }
        }
        
        res.json({
            success: true,
            campaign: campaign
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.message,
            details: error.details
        });
    }
});

// Get creatives for a campaign
app.get('/api/linkedin/campaigns/:campaignId/creatives', async (req, res) => {
    try {
        const { campaignId } = req.params;
        // Try the new API endpoint first
        const endpoint = `/adCreatives?q=campaign&campaign=urn:li:sponsoredCampaign:${campaignId}`;
        
        console.log(`Fetching creatives for campaign ${campaignId}`);
        const result = await linkedInClient.makeRequest(endpoint);
        res.json({
            success: true,
            campaignId,
            creatives: result.elements || [],
            total: result.paging?.total || 0
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.message,
            details: error.details
        });
    }
});

// Get shares for an organization
app.get('/api/linkedin/organizations/:orgId/shares', async (req, res) => {
    try {
        const { orgId } = req.params;
        const { start = 0, count = 50 } = req.query;
        const endpoint = `/shares?q=owners&owners=urn:li:organization:${orgId}&start=${start}&count=${count}`;
        
        const result = await linkedInClient.makeRequest(endpoint);
        res.json({
            success: true,
            organizationId: orgId,
            shares: result.elements || [],
            paging: result.paging
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.message,
            details: error.details
        });
    }
});

// Get UGC posts for an organization
app.get('/api/linkedin/organizations/:orgId/ugcPosts', async (req, res) => {
    try {
        const { orgId } = req.params;
        const { start = 0, count = 50 } = req.query;
        const endpoint = `/ugcPosts?q=authors&authors=List(urn:li:organization:${orgId})&start=${start}&count=${count}`;
        
        const result = await linkedInClient.makeRequest(endpoint);
        res.json({
            success: true,
            organizationId: orgId,
            posts: result.elements || [],
            paging: result.paging
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.message,
            details: error.details
        });
    }
});

// Get creative details by ID
app.get('/api/linkedin/creatives/:creativeId', async (req, res) => {
    try {
        const { creativeId } = req.params;
        const endpoint = `/adCreativesV2/${creativeId}`;
        
        const result = await linkedInClient.makeRequest(endpoint);
        res.json({
            success: true,
            creative: result
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.message,
            details: error.details
        });
    }
});

// Get campaign analytics - fixed with proper date range in request body
app.get('/api/linkedin/campaigns/:campaignId/analytics', async (req, res) => {
    try {
        const { campaignId } = req.params;
        console.log(`\n=== ANALYTICS API REQUEST (FIXED WITH POST BODY) ===`);
        console.log(`Campaign ID: ${campaignId}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        
        // Important: URNs must be URL encoded for REST-li 2.0
        const encodedCampaignUrn = encodeURIComponent(`urn:li:sponsoredCampaign:${campaignId}`);
        
        // Get date range from query params or use defaults (recent 30 days)
        const { startDate, endDate } = req.query;
        let dateRangeBody = null;
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            dateRangeBody = {
                start: {
                    year: start.getFullYear(),
                    month: start.getMonth() + 1,
                    day: start.getDate()
                },
                end: {
                    year: end.getFullYear(),
                    month: end.getMonth() + 1,
                    day: end.getDate()
                }
            };
        } else {
            // Default to October 2023 (typical campaign period)
            dateRangeBody = {
                start: { year: 2023, month: 10, day: 1 },
                end: { year: 2023, month: 10, day: 31 }
            };
        }
        
        console.log('Date range:', JSON.stringify(dateRangeBody, null, 2));
        
        // Strategy: Use GET requests with properly formatted date range parameters
        // Based on LinkedIn REST-li 2.0 specification
        const dateRangeQuery = `dateRange=(start:(year:${dateRangeBody.start.year},month:${dateRangeBody.start.month},day:${dateRangeBody.start.day}),end:(year:${dateRangeBody.end.year},month:${dateRangeBody.end.month},day:${dateRangeBody.end.day}))`;
        
        const strategies = [
            {
                name: 'LinkedIn v202501 Format',
                url: `/adAnalytics?q=analytics&pivot=CAMPAIGN&timeGranularity=ALL&campaigns=List(${encodedCampaignUrn})&${dateRangeQuery}`,
                description: 'LinkedIn API v202501 with proper REST-li encoding'
            },
            {
                name: 'Simple Format with Date Range',
                url: `/adAnalytics?q=analytics&pivot=CAMPAIGN&timeGranularity=ALL&campaigns=${encodedCampaignUrn}&${dateRangeQuery}`,
                description: 'Simple campaign URN with date range'
            },
            {
                name: 'Alternative Date Format',
                url: `/adAnalytics?q=analytics&pivot=CAMPAIGN&timeGranularity=ALL&campaigns=List(${encodedCampaignUrn})&dateRange.start.year=${dateRangeBody.start.year}&dateRange.start.month=${dateRangeBody.start.month}&dateRange.start.day=${dateRangeBody.start.day}&dateRange.end.year=${dateRangeBody.end.year}&dateRange.end.month=${dateRangeBody.end.month}&dateRange.end.day=${dateRangeBody.end.day}`,
                description: 'Separate date range parameters'
            },
            {
                name: 'No Date Range (All Time)',
                url: `/adAnalytics?q=analytics&pivot=CAMPAIGN&timeGranularity=ALL&campaigns=List(${encodedCampaignUrn})`,
                description: 'All-time analytics without date restrictions'
            }
        ];
        
        let analyticsResult = null;
        let successfulStrategy = null;
        let strategyErrors = [];
        
        // Try each strategy until one succeeds
        for (const strategy of strategies) {
            try {
                console.log(`\n--- Trying Strategy: ${strategy.name} ---`);
                console.log(`URL: ${strategy.url}`);
                console.log(`Method: ${strategy.method || 'GET'}`);
                console.log(`Description: ${strategy.description}`);
                
                if (strategy.body) {
                    console.log('Request body:', JSON.stringify(strategy.body, null, 2));
                }
                
                const result = await linkedInClient.makeRequest(strategy.url);
                console.log(`✅ Success with strategy: ${strategy.name}`);
                console.log('Response elements:', result.elements?.length || 0);
                
                // Filter result for our specific campaign if we got multiple campaigns
                if (result.elements && result.elements.length > 0) {
                    const campaignData = result.elements.find(el => 
                        el.pivotValue === `urn:li:sponsoredCampaign:${campaignId}` ||
                        el.pivotValues?.includes(`urn:li:sponsoredCampaign:${campaignId}`)
                    );
                    
                    if (campaignData || result.elements.length === 1) {
                        analyticsResult = campaignData || result.elements[0];
                        successfulStrategy = strategy;
                        break;
                    }
                }
            } catch (strategyError) {
                console.error(`❌ Strategy failed: ${strategy.name}`);
                console.error(`Error: ${strategyError.message}`);
                strategyErrors.push({
                    strategy: strategy.name,
                    error: strategyError.message,
                    httpStatus: strategyError.status,
                    details: strategyError.details
                });
            }
        }
        
        if (analyticsResult && successfulStrategy) {
            console.log(`✅ Successfully fetched analytics data using: ${successfulStrategy.name}`);
            console.log('Analytics data:', JSON.stringify(analyticsResult, null, 2));
            
            const metrics = analyticsResult;
            
            // Extract metrics - LinkedIn API returns cost in account currency (already in dollars)
            const impressions = metrics.impressions || 0;
            const clicks = metrics.clicks || 0;
            const spend = metrics.costInLocalCurrency || 0;
            const views = metrics.videoViews || metrics.approximateUniqueImpressions || 0;
            
            return res.json({
                success: true,
                campaignId,
                strategy: successfulStrategy.name,
                analytics: [{
                    impressions,
                    clicks,
                    spend,
                    views,
                    videoViews: metrics.videoViews || 0,
                    videoCompletions: metrics.videoCompletions || 0,
                    conversions: metrics.conversions || 0,
                    leads: metrics.leadGenerationMailContactInfoShares || 0
                }],
                debug: {
                    strategyUsed: successfulStrategy.name,
                    url: successfulStrategy.url,
                    rawMetrics: metrics
                }
            });
        } else {
            console.log('⚠️ No analytics data found - all strategies failed');
            return res.json({
                success: false,
                campaignId,
                analytics: [{
                    impressions: 0,
                    clicks: 0,
                    spend: 0,
                    ctr: 0,
                    cpm: 0,
                    cpc: 0,
                    videoViews: 0,
                    videoCompletions: 0,
                    conversions: 0,
                    leads: 0
                }],
                error: {
                    message: 'All analytics strategies failed',
                    type: 'ALL_STRATEGIES_FAILED',
                    strategyErrors: strategyErrors,
                    recommendation: 'Check OAuth scopes (r_ads_reporting required) and account permissions'
                }
            });
        }
    } catch (analyticsError) {
        console.error('=== ANALYTICS API ERROR DETAILS ===');
        console.error('Error message:', analyticsError.message);
        console.error('HTTP status:', analyticsError.status);
        console.error('Full error details:', JSON.stringify(analyticsError.details, null, 2));
            
            // Analyze the error type and provide recommendations
            let errorType = 'Unknown';
            let recommendation = 'Check API documentation';
            
            if (analyticsError.message?.includes('ILLEGAL_ARGUMENT')) {
                errorType = 'ILLEGAL_ARGUMENT';
                recommendation = 'The API request parameters are incorrect. Common causes: 1) Missing required OAuth scope "r_ads_reporting", 2) Invalid date range format, 3) Campaign ID not accessible to this account. Verify your LinkedIn app has the correct scopes and the user has access to this campaign.';
            } else if (analyticsError.status === 403) {
                errorType = 'PERMISSION_DENIED';
                recommendation = 'Access denied. Required OAuth scopes: "r_ads" and "r_ads_reporting". Please verify: 1) Your LinkedIn app has these scopes enabled, 2) The access token was generated with these scopes, 3) The authenticated user has access to this ad account in Campaign Manager.';
            } else if (analyticsError.status === 400) {
                errorType = 'BAD_REQUEST';
                recommendation = 'Invalid request format. For API version 202501, use: dateRange=(start:(year:2023,month:10,day:1),end:(year:2023,month:10,day:31)) and campaigns=List(urn%3Ali%3AsponsoredCampaign%3A[ID])';
            } else if (analyticsError.status === 401) {
                errorType = 'UNAUTHORIZED';
                recommendation = 'Authentication failed. The OAuth access token may be expired or invalid. Please regenerate the token with required scopes: r_ads, r_ads_reporting.';
            } else if (analyticsError.message?.includes('timeout')) {
                errorType = 'TIMEOUT';
                recommendation = 'Request timed out. The analytics API may be slow for large date ranges. Try a smaller date range or fewer metrics.';
            }
            
            console.error('Error type:', errorType);
            console.error('Recommendation:', recommendation);
            console.error('=================================');
            
            // Return enhanced error data structure
            return res.json({
                success: false,
                campaignId,
                analytics: [{
                    impressions: 0,
                    clicks: 0,
                    spend: 0,
                    ctr: 0,
                    cpm: 0,
                    cpc: 0,
                    videoViews: 0,
                    videoCompletions: 0,
                    conversions: 0,
                    leads: 0
                }],
                error: {
                    message: analyticsError.message,
                    type: errorType,
                    httpStatus: analyticsError.status,
                    details: analyticsError.details,
                    recommendation: recommendation,
                    timestamp: new Date().toISOString()
                }
            });
    }
});

// Get campaign demographics - simplified approach with individual pivot testing
app.get('/api/linkedin/campaigns/:campaignId/demographics', async (req, res) => {
    try {
        const { campaignId } = req.params;
        console.log(`\n=== DEMOGRAPHICS API REQUEST (SIMPLIFIED) ===`);
        console.log(`Campaign ID: ${campaignId}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        
        const demographics = {
            MEMBER_COMPANY: [],
            MEMBER_JOB_TITLE: [],
            MEMBER_SENIORITY: [],
            MEMBER_INDUSTRY: []
        };
        
        // URL encode the campaign URN
        const encodedCampaignUrn = encodeURIComponent(`urn:li:sponsoredCampaign:${campaignId}`);
        
        // Define pivot strategies - try different approaches for each demographic type
        const pivotMappings = [
            { pivot: 'MEMBER_COMPANY_SIZE', key: 'MEMBER_COMPANY', displayName: 'Company Size' },
            { pivot: 'MEMBER_JOB_TITLE', key: 'MEMBER_JOB_TITLE', displayName: 'Job Titles' },
            { pivot: 'MEMBER_SENIORITY', key: 'MEMBER_SENIORITY', displayName: 'Seniority' },
            { pivot: 'MEMBER_INDUSTRY', key: 'MEMBER_INDUSTRY', displayName: 'Industries' }
        ];
        
        let successfulPivots = [];
        let failedPivots = [];
        
        // Test each pivot individually with fallback strategies
        for (const { pivot, key, displayName } of pivotMappings) {
            console.log(`\n--- Testing ${displayName} (${pivot}) ---`);
            
            const strategies = [
                {
                    name: 'With Campaign Filter and List Syntax',
                    url: `/adAnalytics?q=statistics&pivot=${pivot}&timeGranularity=ALL&campaigns=List(${encodedCampaignUrn})`,
                    description: `${displayName} with campaign filter using List syntax`
                },
                {
                    name: 'With Campaign Filter',
                    url: `/adAnalytics?q=statistics&pivot=${pivot}&timeGranularity=ALL&campaigns=${encodedCampaignUrn}`,
                    description: `${displayName} with URL-encoded campaign filter`
                },
                {
                    name: 'October 2023 Date Range',
                    url: `/adAnalytics?q=statistics&pivot=${pivot}&timeGranularity=ALL&campaigns=List(${encodedCampaignUrn})&dateRange=(start:(year:2023,month:10,day:1),end:(year:2023,month:10,day:31))`,
                    description: `${displayName} with October 2023 date range`
                },
                {
                    name: 'Minimal Request',
                    url: `/adAnalytics?q=statistics&pivot=${pivot}&timeGranularity=ALL`,
                    description: `Basic ${displayName} request without filters`
                }
            ];
            
            let pivotSuccess = false;
            
            for (const strategy of strategies) {
                try {
                    console.log(`  Trying: ${strategy.name}`);
                    console.log(`  URL: ${strategy.url}`);
                    
                    const result = await linkedInClient.makeRequest(strategy.url);
                    
                    if (result && result.elements && result.elements.length > 0) {
                        console.log(`  ✅ Success: ${result.elements.length} elements`);
                        
                        // Filter for our campaign if we got multiple results
                        let relevantElements = result.elements;
                        if (strategy.name === 'Minimal Request' && result.elements.length > 50) {
                            // If we got too many results, it's probably not filtered to our campaign
                            console.log(`  ⚠️ Too many results (${result.elements.length}), may not be campaign-specific`);
                            continue; // Try next strategy
                        }
                        
                        // Calculate total impressions for percentage
                        const totalImpressions = relevantElements.reduce((sum, el) => sum + (el.impressions || 0), 0);
                        
                        // Process and format the data
                        const processedData = relevantElements
                            .map(el => {
                                // Extract the pivot value (URN or direct value)
                                let name = 'Unknown';
                                if (el.pivotValues && el.pivotValues.length > 0) {
                                    const urn = el.pivotValues[0];
                                    // Extract readable name from URN
                                    const parts = urn.split(':');
                                    name = parts[parts.length - 1] || urn;
                                } else if (el.pivotValue) {
                                    name = el.pivotValue;
                                }
                                
                                const impressions = el.impressions || 0;
                                const clicks = el.clicks || 0;
                                const spend = el.costInLocalCurrency || 0;
                                
                                return {
                                    name,
                                    impressions,
                                    clicks,
                                    spend,
                                    ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
                                    cpm: impressions > 0 ? parseFloat(((spend / impressions) * 1000).toFixed(2)) : 0,
                                    percentage: totalImpressions > 0 ? parseFloat(((impressions / totalImpressions) * 100).toFixed(1)) : 0
                                };
                            })
                            .filter(item => item.impressions > 0) // Filter out zero-impression items
                            .sort((a, b) => b.impressions - a.impressions) // Sort by impressions
                            .slice(0, 10); // Take top 10
                        
                        demographics[key] = processedData;
                        successfulPivots.push({
                            pivot: displayName,
                            strategy: strategy.name,
                            dataPoints: processedData.length
                        });
                        pivotSuccess = true;
                        console.log(`  ✅ Processed ${processedData.length} ${displayName} records`);
                        break; // Success, no need to try other strategies for this pivot
                    }
                } catch (strategyError) {
                    console.log(`  ❌ Failed: ${strategyError.message}`);
                }
            }
            
            if (!pivotSuccess) {
                console.log(`  ❌ All strategies failed for ${displayName}`);
                failedPivots.push({
                    pivot: displayName,
                    key: key,
                    reason: 'All strategies failed'
                });
            }
        }
        
        console.log(`\n=== DEMOGRAPHICS SUMMARY ===`);
        console.log(`Successful pivots: ${successfulPivots.length}`);
        console.log(`Failed pivots: ${failedPivots.length}`);
        
        res.json({
            success: successfulPivots.length > 0,
            campaignId,
            demographics,
            debug: {
                successfulPivots,
                failedPivots,
                totalAttempted: pivotMappings.length
            }
        });
    } catch (error) {
        console.error('Demographics API error:', error);
        res.json({
            success: false,
            campaignId: req.params.campaignId,
            error: {
                message: error.message,
                type: 'DEMOGRAPHICS_API_ERROR',
                httpStatus: error.status,
                details: error.details
            },
            demographics: {
                MEMBER_COMPANY: [],
                MEMBER_JOB_TITLE: [],
                MEMBER_SENIORITY: [],
                MEMBER_INDUSTRY: []
            }
        });
    }
});

// Get post URL for a campaign - fetches creatives and extracts the LinkedIn post URL
app.get('/api/linkedin/campaigns/:campaignId/post-url', async (req, res) => {
    try {
        const { campaignId } = req.params;
        console.log(`\n=== FETCHING POST URL FOR CAMPAIGN ${campaignId} ===`);
        
        // First, get creatives for the campaign
        const encodedCampaignUrn = encodeURIComponent(`urn:li:sponsoredCampaign:${campaignId}`);
        const creativesUrl = `/adCreatives?q=campaign&campaign=${encodedCampaignUrn}`;
        
        console.log(`Fetching creatives: ${creativesUrl}`);
        
        try {
            const creativesResult = await linkedInClient.makeRequest(creativesUrl);
            
            if (creativesResult.elements && creativesResult.elements.length > 0) {
                console.log(`Found ${creativesResult.elements.length} creatives`);
                
                // Extract post URLs from creatives
                const postUrls = [];
                
                for (const creative of creativesResult.elements) {
                    let postUrn = null;
                    let postUrl = null;
                    
                    // Check for content reference (newer API format)
                    if (creative.content && creative.content.reference) {
                        postUrn = creative.content.reference;
                    }
                    // Check for reference in variables (older format)
                    else if (creative.variables && creative.variables.data && creative.variables.data['com.linkedin.ads.SponsoredUpdateCreativeVariables']) {
                        const variables = creative.variables.data['com.linkedin.ads.SponsoredUpdateCreativeVariables'];
                        if (variables.activity) {
                            postUrn = variables.activity;
                        } else if (variables.share) {
                            postUrn = variables.share;
                        }
                    }
                    // Check for reference field directly
                    else if (creative.reference) {
                        postUrn = creative.reference;
                    }
                    
                    if (postUrn) {
                        // Convert URN to LinkedIn URL
                        // Format: urn:li:share:1234567890 or urn:li:ugcPost:1234567890
                        if (postUrn.includes('share:') || postUrn.includes('ugcPost:')) {
                            postUrl = `https://www.linkedin.com/feed/update/${postUrn}`;
                        } else if (postUrn.includes('activity:')) {
                            // Legacy activity format
                            postUrl = `https://www.linkedin.com/feed/update/${postUrn.replace('activity:', 'urn:li:activity:')}`;
                        }
                        
                        postUrls.push({
                            creativeId: creative.id,
                            postUrn,
                            postUrl,
                            creativeStatus: creative.status,
                            createdAt: creative.createdAt,
                            lastModifiedAt: creative.lastModifiedAt
                        });
                    }
                }
                
                console.log(`Extracted ${postUrls.length} post URLs`);
                
                return res.json({
                    success: true,
                    campaignId,
                    totalCreatives: creativesResult.elements.length,
                    postUrls,
                    // Return the primary/first post URL if available
                    primaryPostUrl: postUrls.length > 0 ? postUrls[0].postUrl : null
                });
            } else {
                console.log('No creatives found for campaign');
                return res.json({
                    success: false,
                    campaignId,
                    message: 'No creatives found for this campaign',
                    postUrls: [],
                    primaryPostUrl: null
                });
            }
        } catch (creativesError) {
            console.error('Error fetching creatives:', creativesError);
            
            // Try alternative approach - get campaign details and look for post reference
            try {
                const campaignUrl = `/adCampaigns/${campaignId}`;
                const campaignResult = await linkedInClient.makeRequest(campaignUrl);
                
                if (campaignResult && campaignResult.creativeSelection && campaignResult.creativeSelection.reference) {
                    const postUrn = campaignResult.creativeSelection.reference;
                    const postUrl = `https://www.linkedin.com/feed/update/${postUrn}`;
                    
                    return res.json({
                        success: true,
                        campaignId,
                        postUrls: [{
                            creativeId: 'campaign-reference',
                            postUrn,
                            postUrl
                        }],
                        primaryPostUrl: postUrl,
                        source: 'campaign-details'
                    });
                }
            } catch (campaignError) {
                console.error('Alternative approach also failed:', campaignError);
            }
            
            return res.json({
                success: false,
                campaignId,
                error: {
                    message: creativesError.message,
                    type: 'CREATIVES_FETCH_ERROR',
                    httpStatus: creativesError.status,
                    details: creativesError.details
                },
                postUrls: [],
                primaryPostUrl: null
            });
        }
    } catch (error) {
        console.error('Error in post-url endpoint:', error);
        res.status(error.status || 500).json({
            success: false,
            error: error.message,
            details: error.details
        });
    }
});

// Generic proxy endpoint for any LinkedIn API call
app.all('/api/linkedin/proxy/*', async (req, res) => {
    try {
        const endpoint = req.path.replace('/api/linkedin/proxy', '');
        const queryString = req.url.split('?')[1] || '';
        const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        const result = await linkedInClient.makeRequest(fullEndpoint, {
            method: req.method,
            body: req.body
        });
        
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({
            error: error.message,
            details: error.details
        });
    }
});

// Mount the audience insights and company analytics routes
const audienceInsightsRouter = require('./audience-insights-endpoint');
app.locals.linkedInClient = linkedInClient; // Make client available to router
app.use('/api/linkedin', audienceInsightsRouter);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 LinkedIn API Proxy Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Test LinkedIn API: http://localhost:${PORT}/api/linkedin/test`);
    console.log(`📱 Frontend CORS enabled for: http://localhost:4200`);
});

module.exports = app;