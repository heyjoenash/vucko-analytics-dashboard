const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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

        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': this.version,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            console.log('Making LinkedIn API request:', url);
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
            console.error('LinkedIn API Error:', error.response?.data || error.message);
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

// Test connection
app.get('/api/linkedin/test', async (req, res) => {
    try {
        const result = await linkedInClient.makeRequest('/adAccounts?q=search');
        res.json({
            success: true,
            message: 'LinkedIn API connection successful',
            accountCount: result.elements ? result.elements.length : 0,
            accounts: result.elements || []
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message,
            details: error.details
        });
    }
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

// Get campaigns for an account
app.get('/api/linkedin/accounts/:accountId/campaigns', async (req, res) => {
    try {
        const { accountId } = req.params;
        const result = await linkedInClient.makeRequest(`/adAccounts/${accountId}/adCampaigns?q=search`);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({
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