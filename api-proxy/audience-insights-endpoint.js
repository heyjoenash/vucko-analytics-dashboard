// LinkedIn Audience Insights and Company Analytics Endpoints
// This module adds proper company-level analytics for campaigns

const express = require('express');
const router = express.Router();

// Add endpoint for getting company-level engagement data (post-campaign)
router.get('/campaigns/:campaignId/company-analytics', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { startDate, endDate } = req.query;
        const linkedInClient = req.app.locals.linkedInClient;
        
        console.log(`\n=== COMPANY ANALYTICS REQUEST ===`);
        console.log(`Campaign ID: ${campaignId}`);
        console.log(`Date Range: ${startDate || 'default'} to ${endDate || 'default'}`);
        
        // URL encode the campaign URN
        const encodedCampaignUrn = encodeURIComponent(`urn:li:sponsoredCampaign:${campaignId}`);
        
        // Build date range parameter
        let dateRangeParam = '';
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            dateRangeParam = `&dateRange=(start:(year:${start.getFullYear()},month:${start.getMonth() + 1},day:${start.getDate()}),end:(year:${end.getFullYear()},month:${end.getMonth() + 1},day:${end.getDate()}))`;
        } else {
            // Default to campaign's run dates or last 30 days
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            dateRangeParam = `&dateRange=(start:(year:${start.getFullYear()},month:${start.getMonth() + 1},day:${start.getDate()}),end:(year:${end.getFullYear()},month:${end.getMonth() + 1},day:${end.getDate()}))`;
        }
        
        // LinkedIn doesn't support MEMBER_COMPANY pivot. Use MEMBER_COMPANY_SIZE as a proxy
        // and try to get company demographics from the campaign's audience
        const endpoint = `/adAnalytics?q=analytics&pivot=MEMBER_COMPANY_SIZE&timeGranularity=ALL&campaigns=List(${encodedCampaignUrn})${dateRangeParam}`;
        
        console.log(`Requesting: ${endpoint}`);
        
        const result = await linkedInClient.makeRequest(endpoint);
        
        if (result && result.elements && result.elements.length > 0) {
            // Calculate total impressions for percentage calculation
            const totalImpressions = result.elements.reduce((sum, el) => sum + (el.impressions || 0), 0);
            const totalClicks = result.elements.reduce((sum, el) => sum + (el.clicks || 0), 0);
            
            // Process company size data
            const companySizeMap = {
                'urn:li:companySize:A': 'Self-employed',
                'urn:li:companySize:B': '1-10 employees',
                'urn:li:companySize:C': '11-50 employees',
                'urn:li:companySize:D': '51-200 employees',
                'urn:li:companySize:E': '201-500 employees',
                'urn:li:companySize:F': '501-1000 employees',
                'urn:li:companySize:G': '1001-5000 employees',
                'urn:li:companySize:H': '5001-10000 employees',
                'urn:li:companySize:I': '10001+ employees'
            };
            
            const companySizes = result.elements
                .map(el => {
                    // Extract company size URN
                    const sizeUrn = el.pivotValues?.[0] || el.pivotValue || '';
                    const sizeName = companySizeMap[sizeUrn] || sizeUrn;
                    
                    const impressions = el.impressions || 0;
                    const clicks = el.clicks || 0;
                    const spend = el.costInLocalCurrency || 0;
                    
                    return {
                        sizeUrn,
                        sizeName,
                        metrics: {
                            impressions,
                            clicks,
                            spend,
                            ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0,
                            percentageOfAudience: totalImpressions > 0 ? ((impressions / totalImpressions) * 100).toFixed(1) : 0
                        }
                    };
                })
                .filter(size => size.metrics.impressions > 0)
                .sort((a, b) => b.metrics.impressions - a.metrics.impressions);
            
            // Since we can't get specific companies, provide company size breakdown instead
            res.json({
                success: true,
                campaignId,
                dateRange: { startDate, endDate },
                pivotType: 'MEMBER_COMPANY_SIZE',
                note: 'LinkedIn API does not provide company-specific engagement data. This shows company size distribution instead.',
                summary: {
                    totalSegments: companySizes.length,
                    totalImpressions,
                    totalClicks,
                    overallCTR: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0
                },
                companySizeDistribution: companySizes,
                rawData: result.elements.slice(0, 3) // Include sample raw data for debugging
            });
        } else {
            res.json({
                success: false,
                campaignId,
                message: 'No company analytics data available',
                hint: 'Campaign may not have run yet or may not have sufficient impressions'
            });
        }
    } catch (error) {
        console.error('Company analytics error:', error);
        res.status(error.status || 500).json({
            success: false,
            error: {
                message: error.message,
                type: 'COMPANY_ANALYTICS_ERROR',
                details: error.details
            }
        });
    }
});

// Add endpoint for audience insights (pre-campaign audience composition)
router.post('/audience-insights', async (req, res) => {
    try {
        const { targetingCriteria } = req.body;
        const linkedInClient = req.app.locals.linkedInClient;
        
        console.log(`\n=== AUDIENCE INSIGHTS REQUEST ===`);
        console.log('Targeting Criteria:', JSON.stringify(targetingCriteria, null, 2));
        
        // Try to use the Audience Insights API
        const endpoint = `/audienceInsights?q=targetingCriteriaV2`;
        
        const result = await linkedInClient.makeRequest(endpoint, {
            method: 'POST',
            body: { targetingCriteria }
        });
        
        if (result && result.elements) {
            // Process the audience insights data
            const insights = {
                totalAudienceSize: result.elements[0]?.totalAudienceCount || 0,
                companies: [],
                industries: [],
                jobTitles: [],
                seniorities: []
            };
            
            // Extract company insights
            const companySegmentation = result.elements.find(el => el.segmentationType === 'COMPANY');
            if (companySegmentation && companySegmentation.segments) {
                insights.companies = companySegmentation.segments
                    .map(segment => ({
                        companyUrn: segment.value,
                        companyId: segment.value.split(':').pop(),
                        companyName: segment.localizedName || `Company ${segment.value.split(':').pop()}`,
                        audienceCount: segment.entityCount,
                        percentage: segment.entityPercentage
                    }))
                    .sort((a, b) => b.audienceCount - a.audienceCount)
                    .slice(0, 20); // Top 20 companies
            }
            
            res.json({
                success: true,
                insights,
                rawData: result
            });
        } else {
            res.json({
                success: false,
                message: 'Unable to retrieve audience insights',
                hint: 'This API requires special access. Contact LinkedIn developer support.'
            });
        }
    } catch (error) {
        console.error('Audience insights error:', error);
        
        // Check if it's an access issue
        if (error.status === 403 || error.message.includes('permission')) {
            res.status(403).json({
                success: false,
                error: {
                    message: 'Audience Insights API requires special access',
                    type: 'ACCESS_DENIED',
                    details: 'Submit a support ticket to LinkedIn to request access to the Audience Insights API'
                }
            });
        } else {
            res.status(error.status || 500).json({
                success: false,
                error: {
                    message: error.message,
                    type: 'AUDIENCE_INSIGHTS_ERROR',
                    details: error.details
                }
            });
        }
    }
});

// Note: Company-specific analytics are not available through the LinkedIn API
// We can only get demographic breakdowns by company size, industry, job title, etc.

module.exports = router;