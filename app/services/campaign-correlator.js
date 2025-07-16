/**
 * CampaignCorrelator - Smart Campaign Correlation Service
 * 
 * Eliminates manual campaign linking by automatically correlating LinkedIn posts
 * with campaigns using multiple intelligent strategies:
 * 
 * 1. Timing Correlation - Match by campaign run schedule
 * 2. Content Similarity - Analyze campaign names vs post content
 * 3. Creative Matching - Direct URL matching with campaign creatives  
 * 4. Audience Overlap - Compare targeting with actual engagement patterns
 * 5. Performance Patterns - Match spend/impression patterns
 * 
 * Goal: 95%+ automatic correlation accuracy, fallback to manual only for edge cases
 */

class CampaignCorrelator {
    constructor(supabaseClient, linkedInAPI) {
        this.supabase = supabaseClient;
        this.linkedInAPI = linkedInAPI;
        
        // Correlation strategy weights
        this.strategyWeights = {
            timing: 0.25,
            content: 0.20,
            creative: 0.30,
            audience: 0.15,
            performance: 0.10
        };
        
        // Confidence thresholds
        this.thresholds = {
            highConfidence: 0.85,
            mediumConfidence: 0.65,
            lowConfidence: 0.45,
            manualRequired: 0.45
        };
        
        console.log('🎯 CampaignCorrelator initialized with smart matching strategies');
    }

    /**
     * Main correlation method - finds best campaign matches for a post
     * @param {Object} post - Post data
     * @param {Array} campaigns - Available campaigns
     * @returns {Object} Best match with confidence score
     */
    async findBestMatch(post, campaigns) {
        console.log(`🔍 Finding best campaign match for post: ${post.url || post.id}`);
        
        if (!campaigns || campaigns.length === 0) {
            console.log('⚠️ No campaigns available for matching');
            return null;
        }
        
        // Score all campaigns using multiple strategies
        const campaignScores = await this.scoreAllCampaigns(post, campaigns);
        
        // Sort by total score and get best matches
        const sortedMatches = campaignScores
            .sort((a, b) => b.totalScore - a.totalScore)
            .filter(match => match.totalScore >= this.thresholds.lowConfidence);
        
        if (sortedMatches.length === 0) {
            console.log('❌ No campaigns meet minimum confidence threshold');
            return this.createNoMatchResult();
        }
        
        const bestMatch = sortedMatches[0];
        const matchQuality = this.determineMatchQuality(bestMatch.totalScore);
        
        console.log(`✅ Best match found: Campaign ${bestMatch.campaign.id} (${matchQuality}, ${(bestMatch.totalScore * 100).toFixed(1)}%)`);
        
        // Return top matches (might be multiple if scores are close)
        const closeMatches = sortedMatches.filter(
            match => match.totalScore >= bestMatch.totalScore - 0.1
        );
        
        return {
            campaigns: closeMatches.map(m => m.campaign),
            confidence: bestMatch.totalScore,
            matchQuality: matchQuality,
            matchStrategy: bestMatch.primaryStrategy,
            details: bestMatch.strategyScores,
            alternatives: sortedMatches.slice(1, 4), // Include up to 3 alternatives
            requiresManualReview: matchQuality === 'low'
        };
    }

    /**
     * Score all campaigns using multiple correlation strategies
     */
    async scoreAllCampaigns(post, campaigns) {
        console.log(`📊 Scoring ${campaigns.length} campaigns for correlation...`);
        
        const scoredCampaigns = [];
        
        for (const campaign of campaigns) {
            try {
                const scores = await this.calculateCampaignScore(post, campaign);
                
                // Calculate weighted total score
                const totalScore = Object.entries(scores).reduce((total, [strategy, score]) => {
                    const weight = this.strategyWeights[strategy] || 0;
                    return total + (score * weight);
                }, 0);
                
                // Determine primary strategy (highest scoring)
                const primaryStrategy = Object.entries(scores)
                    .sort((a, b) => b[1] - a[1])[0][0];
                
                scoredCampaigns.push({
                    campaign,
                    totalScore,
                    primaryStrategy,
                    strategyScores: scores
                });
                
            } catch (error) {
                console.warn(`⚠️ Error scoring campaign ${campaign.id}:`, error.message);
                // Still include with zero score
                scoredCampaigns.push({
                    campaign,
                    totalScore: 0,
                    primaryStrategy: 'error',
                    strategyScores: { error: error.message }
                });
            }
        }
        
        return scoredCampaigns;
    }

    /**
     * Calculate correlation score for a specific campaign using all strategies
     */
    async calculateCampaignScore(post, campaign) {
        const scores = {};
        
        // Strategy 1: Timing Correlation
        scores.timing = await this.calculateTimingScore(post, campaign);
        
        // Strategy 2: Content Similarity  
        scores.content = await this.calculateContentSimilarity(post, campaign);
        
        // Strategy 3: Creative Matching
        scores.creative = await this.calculateCreativeMatch(post, campaign);
        
        // Strategy 4: Audience Overlap
        scores.audience = await this.calculateAudienceOverlap(post, campaign);
        
        // Strategy 5: Performance Patterns
        scores.performance = await this.calculatePerformancePatterns(post, campaign);
        
        return scores;
    }

    /**
     * Strategy 1: Timing Correlation
     * High score if post date falls within campaign run schedule
     */
    async calculateTimingScore(post, campaign) {
        if (!post.posted_date && !post.created_at) {
            return 0;
        }
        
        const postDate = new Date(post.posted_date || post.created_at);
        
        if (!campaign.runSchedule) {
            return 0.1; // Low score if no schedule data
        }
        
        const campaignStart = new Date(campaign.runSchedule.start);
        const campaignEnd = campaign.runSchedule.end ? 
            new Date(campaign.runSchedule.end) : 
            new Date(); // Assume ongoing if no end date
        
        // Perfect match if post is within campaign period
        if (postDate >= campaignStart && postDate <= campaignEnd) {
            // Higher score if closer to campaign start (more likely to be intentional)
            const campaignDuration = campaignEnd.getTime() - campaignStart.getTime();
            const postOffset = postDate.getTime() - campaignStart.getTime();
            const timingQuality = 1 - (postOffset / campaignDuration) * 0.3; // Max 30% reduction
            
            return Math.max(0.7, timingQuality);
        }
        
        // Partial match if post is within reasonable proximity (±7 days)
        const daysBefore = (campaignStart.getTime() - postDate.getTime()) / (24 * 60 * 60 * 1000);
        const daysAfter = (postDate.getTime() - campaignEnd.getTime()) / (24 * 60 * 60 * 1000);
        
        if (daysBefore >= 0 && daysBefore <= 7) {
            return 0.5 - (daysBefore / 14); // Diminishing score for posts before campaign
        }
        
        if (daysAfter >= 0 && daysAfter <= 7) {
            return 0.4 - (daysAfter / 17.5); // Diminishing score for posts after campaign
        }
        
        return 0; // No timing correlation
    }

    /**
     * Strategy 2: Content Similarity
     * Compare campaign names/descriptions with post content
     */
    async calculateContentSimilarity(post, campaign) {
        if (!campaign.name) {
            return 0;
        }
        
        const campaignText = (campaign.name + ' ' + (campaign.description || '')).toLowerCase();
        const postText = (
            (post.content_preview || '') + ' ' + 
            (post.post_title || '') + ' ' +
            (post.description || '')
        ).toLowerCase();
        
        if (!postText.trim()) {
            return 0.1; // Minimal score if no post content
        }
        
        // Extract meaningful keywords (filter out common words)
        const stopWords = new Set([
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
            'above', 'below', 'between', 'among', 'this', 'that', 'these', 'those'
        ]);
        
        const extractKeywords = (text) => {
            return text.split(/\s+/)
                .filter(word => word.length > 3 && !stopWords.has(word))
                .map(word => word.replace(/[^\w]/g, ''));
        };
        
        const campaignKeywords = extractKeywords(campaignText);
        const postKeywords = extractKeywords(postText);
        
        if (campaignKeywords.length === 0) {
            return 0.1;
        }
        
        // Calculate keyword overlap
        let matches = 0;
        let partialMatches = 0;
        
        for (const campaignWord of campaignKeywords) {
            const exactMatch = postKeywords.some(postWord => 
                postWord === campaignWord
            );
            
            if (exactMatch) {
                matches++;
            } else {
                // Check for partial matches (substring matching)
                const partialMatch = postKeywords.some(postWord => 
                    postWord.includes(campaignWord) || campaignWord.includes(postWord)
                );
                if (partialMatch) {
                    partialMatches++;
                }
            }
        }
        
        // Score based on exact and partial matches
        const exactScore = matches / campaignKeywords.length;
        const partialScore = (partialMatches / campaignKeywords.length) * 0.5;
        
        return Math.min(1.0, exactScore + partialScore);
    }

    /**
     * Strategy 3: Creative Matching
     * Check if campaign creatives contain the post URL
     */
    async calculateCreativeMatch(post, campaign) {
        try {
            if (!this.linkedInAPI) {
                return 0.2; // Low confidence without API access
            }
            
            // Fetch campaign creatives
            const creativesResponse = await this.linkedInAPI.getCampaignCreatives(campaign.id);
            
            if (!creativesResponse.success || !creativesResponse.creatives) {
                return 0.1; // Minimal score if can't fetch creatives
            }
            
            const postUrl = post.url || post.linkedin_url;
            if (!postUrl) {
                return 0.1;
            }
            
            // Extract post ID for comparison
            const postId = this.extractPostId(postUrl);
            
            for (const creative of creativesResponse.creatives) {
                // Check various creative reference formats
                const creativeUrls = [
                    creative.variables?.data?.shareUrl,
                    creative.reference,
                    creative.ugcPostReference
                ].filter(Boolean);
                
                for (const creativeUrl of creativeUrls) {
                    if (this.urlsMatch(postUrl, creativeUrl)) {
                        return 1.0; // Perfect match
                    }
                    
                    // Check if post IDs match
                    const creativeId = this.extractPostId(creativeUrl);
                    if (postId && creativeId && postId === creativeId) {
                        return 0.95; // Near perfect match
                    }
                }
            }
            
            return 0; // No creative match found
            
        } catch (error) {
            console.warn('⚠️ Creative matching failed:', error.message);
            return 0.1; // Minimal score on error
        }
    }

    /**
     * Strategy 4: Audience Overlap
     * Compare campaign targeting with actual engagement patterns
     */
    async calculateAudienceOverlap(post, campaign) {
        try {
            // Get targeting criteria from campaign
            const targeting = campaign.targetingCriteria;
            if (!targeting) {
                return 0.2; // Low score without targeting data
            }
            
            // Get actual engagements for this post
            const { data: engagements } = await this.supabase
                .from('engagements')
                .select(`
                    person:persons (
                        current_company, current_title, headline
                    )
                `)
                .eq('post_id', post.id);
            
            if (!engagements || engagements.length === 0) {
                return 0.1; // Can't compare without engagement data
            }
            
            // Analyze overlap between targeting and actual audience
            let overlapScore = 0;
            let comparisons = 0;
            
            // Company targeting overlap
            if (targeting.include?.companies) {
                const targetCompanies = new Set(
                    targeting.include.companies.map(c => c.name?.toLowerCase())
                );
                const actualCompanies = engagements
                    .map(e => e.person?.current_company?.toLowerCase())
                    .filter(Boolean);
                
                const matches = actualCompanies.filter(company => 
                    Array.from(targetCompanies).some(target => 
                        company.includes(target) || target.includes(company)
                    )
                ).length;
                
                if (actualCompanies.length > 0) {
                    overlapScore += matches / actualCompanies.length;
                    comparisons++;
                }
            }
            
            // Job title targeting overlap
            if (targeting.include?.jobTitles) {
                const targetTitles = new Set(
                    targeting.include.jobTitles.map(t => t.name?.toLowerCase())
                );
                const actualTitles = engagements
                    .map(e => e.person?.current_title?.toLowerCase())
                    .filter(Boolean);
                
                const matches = actualTitles.filter(title => 
                    Array.from(targetTitles).some(target => 
                        title.includes(target) || target.includes(title)
                    )
                ).length;
                
                if (actualTitles.length > 0) {
                    overlapScore += matches / actualTitles.length;
                    comparisons++;
                }
            }
            
            return comparisons > 0 ? overlapScore / comparisons : 0.2;
            
        } catch (error) {
            console.warn('⚠️ Audience overlap calculation failed:', error.message);
            return 0.2;
        }
    }

    /**
     * Strategy 5: Performance Patterns  
     * Match spend/impression patterns with engagement volume
     */
    async calculatePerformancePatterns(post, campaign) {
        try {
            // Get campaign analytics
            const { data: analytics } = await this.supabase
                .from('linkedin_campaign_analytics')
                .select('*')
                .eq('linkedin_campaign_id', campaign.id);
            
            if (!analytics || analytics.length === 0) {
                return 0.3; // Neutral score without analytics
            }
            
            // Calculate total campaign metrics
            const totalImpressions = analytics.reduce((sum, a) => sum + (a.impressions || 0), 0);
            const totalSpend = analytics.reduce((sum, a) => sum + (a.spend || 0), 0);
            
            // Get engagement count for post
            const { count: engagementCount } = await this.supabase
                .from('engagements')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', post.id);
            
            if (engagementCount === 0 || totalImpressions === 0) {
                return 0.2;
            }
            
            // Calculate engagement rate
            const engagementRate = engagementCount / totalImpressions;
            
            // Score based on reasonable engagement rate ranges
            // LinkedIn typical engagement rates: 0.3% - 3%
            if (engagementRate >= 0.001 && engagementRate <= 0.05) {
                // Reasonable engagement rate suggests campaign correlation
                return 0.6 + Math.min(0.4, engagementRate * 20); // Scale to 0.6-1.0
            } else if (engagementRate > 0.05) {
                // Very high engagement rate - possibly organic viral post
                return 0.3;
            } else {
                // Very low engagement rate
                return 0.4;
            }
            
        } catch (error) {
            console.warn('⚠️ Performance pattern calculation failed:', error.message);
            return 0.3;
        }
    }

    /**
     * Utility methods
     */
    
    extractPostId(url) {
        if (!url) return null;
        
        const patterns = [
            /activity-(\d+)/,
            /ugcPost:(\d+)/,
            /share:(\d+)/,
            /urn:li:activity:(\d+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        
        return null;
    }
    
    urlsMatch(url1, url2) {
        if (!url1 || !url2) return false;
        
        // Direct match
        if (url1 === url2) return true;
        
        // Extract and compare post IDs
        const id1 = this.extractPostId(url1);
        const id2 = this.extractPostId(url2);
        
        return id1 && id2 && id1 === id2;
    }
    
    determineMatchQuality(score) {
        if (score >= this.thresholds.highConfidence) return 'high';
        if (score >= this.thresholds.mediumConfidence) return 'medium';
        if (score >= this.thresholds.lowConfidence) return 'low';
        return 'insufficient';
    }
    
    createNoMatchResult() {
        return {
            campaigns: [],
            confidence: 0,
            matchQuality: 'none',
            matchStrategy: 'none',
            details: {},
            alternatives: [],
            requiresManualReview: true,
            suggestion: 'Consider manual campaign linking or verify campaign timing/content'
        };
    }

    /**
     * Batch correlation for multiple posts
     */
    async correlateBatch(posts, campaigns) {
        console.log(`🔄 Starting batch correlation for ${posts.length} posts`);
        
        const results = [];
        
        for (const post of posts) {
            try {
                const match = await this.findBestMatch(post, campaigns);
                results.push({
                    post: post,
                    match: match,
                    success: true
                });
            } catch (error) {
                results.push({
                    post: post,
                    error: error.message,
                    success: false
                });
            }
        }
        
        const successful = results.filter(r => r.success).length;
        console.log(`✅ Batch correlation complete: ${successful}/${posts.length} successful`);
        
        return results;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.CampaignCorrelator = CampaignCorrelator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CampaignCorrelator;
}