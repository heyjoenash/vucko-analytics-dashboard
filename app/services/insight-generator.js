/**
 * InsightGenerator - Business Intelligence Service
 * 
 * Transforms raw data into actionable business insights focusing on:
 * 1. Targeting effectiveness over volume metrics
 * 2. Quality engagement ratios and ROI proof
 * 3. Campaign performance vs. expectations
 * 4. Actionable recommendations for optimization
 * 
 * Key Philosophy: "7 out of 14 people at one company is better than 200 random impressions"
 * - Quality targeting ratios matter more than high volume
 * - Cost per quality engagement > cost per impression
 * - Proof of targeting effectiveness for client justification
 */

class InsightGenerator {
    constructor(options = {}) {
        this.options = {
            focusOnQuality: true,
            minimumCompanySize: 2, // Minimum engagements to be considered a "company signal"
            highValueEngagementThreshold: 5, // Engagement score threshold for "high value"
            targetHitRateThreshold: 0.3, // 30% of target audience engaging is good
            ...options
        };
        
        // Industry benchmarks for context
        this.benchmarks = {
            linkedInEngagementRate: 0.003, // 0.3% typical
            targetHitRate: 0.15, // 15% good target hit rate
            qualityEngagementRate: 0.001, // 0.1% high-quality engagement rate
            costPerQualityEngagement: 25, // $25 industry average
            campaignROI: 3.0 // 3:1 typical ROI
        };
        
        console.log('💡 InsightGenerator initialized with quality-focused approach');
    }

    /**
     * Generate comprehensive insights from correlated data
     * @param {Object} correlatedData - Data from PostAnalysisEngine
     * @returns {Object} Complete business insights
     */
    async generateFullInsights(correlatedData) {
        console.log('💡 Generating comprehensive business insights...');
        
        const insights = {
            // Primary metrics (what the user cares about most)
            targetingEffectiveness: await this.calculateTargetingEffectiveness(correlatedData),
            qualityScore: await this.calculateQualityScore(correlatedData),
            costEfficiency: await this.calculateCostEfficiency(correlatedData),
            
            // Secondary analysis
            companyPerformance: await this.analyzeCompanyPerformance(correlatedData),
            peopleInsights: await this.analyzePeopleEngagement(correlatedData),
            campaignIntelligence: await this.generateCampaignIntelligence(correlatedData),
            
            // Actionable recommendations
            recommendations: await this.generateRecommendations(correlatedData),
            
            // Context and comparisons
            benchmarkComparisons: this.compareToBenchmarks(correlatedData),
            
            // Summary for quick understanding
            executiveSummary: null // Will be generated at the end
        };
        
        // Generate executive summary based on all insights
        insights.executiveSummary = this.generateExecutiveSummary(insights, correlatedData);
        
        console.log('✅ Insights generation completed');
        return insights;
    }

    /**
     * Calculate targeting effectiveness - the key metric the user wants
     */
    async calculateTargetingEffectiveness(data) {
        console.log('🎯 Calculating targeting effectiveness...');
        
        const effectiveness = {
            overallScore: 0,
            targetHitRate: 0,
            qualityRatio: 0,
            companyPenetration: {},
            titlePenetration: {},
            details: {}
        };
        
        if (!data.campaigns || data.campaigns.length === 0) {
            return { ...effectiveness, message: 'No campaign data available for targeting analysis' };
        }
        
        // Get campaign targeting data
        const campaignTargeting = await this.extractCampaignTargeting(data.campaigns);
        const actualEngagements = data.engagements || [];
        
        if (actualEngagements.length === 0) {
            return { ...effectiveness, message: 'No engagement data available' };
        }
        
        // Calculate company targeting effectiveness
        if (campaignTargeting.companies && campaignTargeting.companies.length > 0) {
            effectiveness.companyPenetration = this.calculateCompanyPenetration(
                campaignTargeting.companies,
                actualEngagements
            );
        }
        
        // Calculate title targeting effectiveness
        if (campaignTargeting.jobTitles && campaignTargeting.jobTitles.length > 0) {
            effectiveness.titlePenetration = this.calculateTitlePenetration(
                campaignTargeting.jobTitles,
                actualEngagements
            );
        }
        
        // Calculate overall targeting effectiveness score
        const companyScore = effectiveness.companyPenetration.hitRate || 0;
        const titleScore = effectiveness.titlePenetration.hitRate || 0;
        effectiveness.overallScore = (companyScore + titleScore) / 2;
        
        // Quality ratio: high-value engagements vs. total engagements
        const highValueEngagements = actualEngagements.filter(e => 
            (e.person?.engagement_score || 0) >= this.options.highValueEngagementThreshold
        ).length;
        effectiveness.qualityRatio = actualEngagements.length > 0 ? 
            highValueEngagements / actualEngagements.length : 0;
        
        effectiveness.targetHitRate = effectiveness.overallScore;
        
        // Add interpretation
        effectiveness.interpretation = this.interpretTargetingEffectiveness(effectiveness);
        
        return effectiveness;
    }

    /**
     * Calculate company penetration (key metric for proving targeting success)
     */
    calculateCompanyPenetration(targetCompanies, engagements) {
        const targetCompanyNames = new Set(
            targetCompanies.map(c => c.name?.toLowerCase()).filter(Boolean)
        );
        
        const engagementsByCompany = {};
        let totalTargetCompanyEngagements = 0;
        let companiesHit = 0;
        
        engagements.forEach(engagement => {
            const company = (engagement.personData?.current_company || 
                           engagement.person?.current_company || 
                           engagement.person?.company_override || '').toLowerCase();
            
            if (company) {
                if (!engagementsByCompany[company]) {
                    engagementsByCompany[company] = { count: 0, isTarget: false };
                }
                engagementsByCompany[company].count++;
                
                // Check if this is a target company
                const isTarget = Array.from(targetCompanyNames).some(target => 
                    company.includes(target) || target.includes(company)
                );
                
                if (isTarget) {
                    engagementsByCompany[company].isTarget = true;
                    totalTargetCompanyEngagements++;
                }
            }
        });
        
        // Count how many target companies had engagements
        companiesHit = Object.values(engagementsByCompany).filter(c => c.isTarget).length;
        
        // Calculate penetration rates
        const hitRate = targetCompanies.length > 0 ? companiesHit / targetCompanies.length : 0;
        const concentrationRate = engagements.length > 0 ? 
            totalTargetCompanyEngagements / engagements.length : 0;
        
        return {
            targetCompanies: targetCompanies.length,
            companiesHit: companiesHit,
            hitRate: hitRate,
            concentrationRate: concentrationRate,
            topPerformers: this.getTopCompanyPerformers(engagementsByCompany),
            details: engagementsByCompany
        };
    }

    /**
     * Calculate title targeting penetration
     */
    calculateTitlePenetration(targetTitles, engagements) {
        const targetTitleKeywords = targetTitles.map(t => t.name?.toLowerCase()).filter(Boolean);
        
        let targetTitleEngagements = 0;
        const titleMatches = {};
        
        engagements.forEach(engagement => {
            const title = (engagement.personData?.current_title || 
                          engagement.person?.current_title || 
                          engagement.person?.title_override || '').toLowerCase();
            
            if (title) {
                const matchingKeywords = targetTitleKeywords.filter(keyword => 
                    title.includes(keyword)
                );
                
                if (matchingKeywords.length > 0) {
                    targetTitleEngagements++;
                    matchingKeywords.forEach(keyword => {
                        titleMatches[keyword] = (titleMatches[keyword] || 0) + 1;
                    });
                }
            }
        });
        
        const hitRate = engagements.length > 0 ? targetTitleEngagements / engagements.length : 0;
        
        return {
            targetTitles: targetTitles.length,
            titlesMatched: Object.keys(titleMatches).length,
            hitRate: hitRate,
            totalMatches: targetTitleEngagements,
            matchDetails: titleMatches
        };
    }

    /**
     * Calculate overall quality score for the post
     */
    async calculateQualityScore(data) {
        console.log('⭐ Calculating quality score...');
        
        const score = {
            overall: 0,
            components: {},
            interpretation: ''
        };
        
        const engagements = data.engagements || [];
        if (engagements.length === 0) {
            return { ...score, interpretation: 'No engagement data available' };
        }
        
        // Component 1: Data Quality (30%)
        const dataQuality = data.dataQuality || {};
        const dataQualityScore = Math.max(0, 1 - (
            (dataQuality.missingPersonData || 0) / engagements.length
        ));
        score.components.dataQuality = dataQualityScore;
        
        // Component 2: Engagement Diversity (25%)
        const companyDiversity = this.calculateEngagementDiversity(engagements);
        score.components.diversity = companyDiversity;
        
        // Component 3: High-Value Engagement Rate (25%)
        const highValueRate = this.calculateHighValueEngagementRate(engagements);
        score.components.highValueRate = highValueRate;
        
        // Component 4: Targeting Alignment (20%)
        const targetingAlignment = data.targetingEffectiveness?.overallScore || 0;
        score.components.targetingAlignment = targetingAlignment;
        
        // Calculate weighted overall score
        score.overall = (
            score.components.dataQuality * 0.30 +
            score.components.diversity * 0.25 +
            score.components.highValueRate * 0.25 +
            score.components.targetingAlignment * 0.20
        );
        
        // Convert to 1-10 scale for user understanding
        score.overall = Math.round(score.overall * 10 * 10) / 10;
        
        score.interpretation = this.interpretQualityScore(score.overall);
        
        return score;
    }

    /**
     * Calculate cost efficiency metrics
     */
    async calculateCostEfficiency(data) {
        console.log('💰 Calculating cost efficiency...');
        
        const efficiency = {
            costPerEngagement: 0,
            costPerQualityEngagement: 0,
            costPerTargetHit: 0,
            roi: 0,
            efficiency: 'unknown'
        };
        
        // Get campaign spend data
        const totalSpend = this.calculateTotalSpend(data);
        const engagements = data.engagements || [];
        
        if (totalSpend === 0 || engagements.length === 0) {
            return { ...efficiency, message: 'Insufficient cost data for analysis' };
        }
        
        // Basic cost per engagement
        efficiency.costPerEngagement = totalSpend / engagements.length;
        
        // Cost per quality engagement (high-value only)
        const qualityEngagements = engagements.filter(e => 
            (e.person?.engagement_score || 0) >= this.options.highValueEngagementThreshold
        ).length;
        
        if (qualityEngagements > 0) {
            efficiency.costPerQualityEngagement = totalSpend / qualityEngagements;
        }
        
        // Cost per target hit (company or title match)
        const targetHits = this.countTargetHits(data);
        if (targetHits > 0) {
            efficiency.costPerTargetHit = totalSpend / targetHits;
        }
        
        // Compare to benchmarks
        efficiency.vsIndustryBenchmark = {
            costPerEngagement: efficiency.costPerEngagement / this.benchmarks.costPerQualityEngagement,
            performance: efficiency.costPerEngagement < this.benchmarks.costPerQualityEngagement ? 'above' : 'below'
        };
        
        efficiency.interpretation = this.interpretCostEfficiency(efficiency);
        
        return efficiency;
    }

    /**
     * Analyze company performance - key insight for client reporting
     */
    async analyzeCompanyPerformance(data) {
        console.log('🏢 Analyzing company performance...');
        
        const engagements = data.engagements || [];
        const companyStats = {};
        
        // Group engagements by company
        engagements.forEach(engagement => {
            const company = engagement.personData?.current_company || 
                           engagement.person?.current_company || 
                           engagement.person?.company_override || 'Unknown';
            
            if (!companyStats[company]) {
                companyStats[company] = {
                    name: company,
                    engagements: 0,
                    people: new Set(),
                    highValueEngagements: 0,
                    averageEngagementScore: 0,
                    titles: new Set(),
                    isTargetCompany: false
                };
            }
            
            const person = engagement.person || engagement.personData;
            companyStats[company].engagements++;
            
            if (person?.linkedin_url) {
                companyStats[company].people.add(person.linkedin_url);
            }
            
            if ((person?.engagement_score || 0) >= this.options.highValueEngagementThreshold) {
                companyStats[company].highValueEngagements++;
            }
            
            if (person?.current_title) {
                companyStats[company].titles.add(person.current_title);
            }
        });
        
        // Convert to array and calculate additional metrics
        const companies = Object.values(companyStats).map(company => ({
            ...company,
            uniquePeople: company.people.size,
            penetrationRate: company.people.size > 1 ? company.engagements / company.people.size : 1,
            titleDiversity: company.titles.size,
            qualityRate: company.engagements > 0 ? company.highValueEngagements / company.engagements : 0
        }));
        
        // Sort by multiple criteria (prioritize quality over quantity)
        companies.sort((a, b) => {
            // First by quality rate
            if (a.qualityRate !== b.qualityRate) return b.qualityRate - a.qualityRate;
            // Then by unique people
            if (a.uniquePeople !== b.uniquePeople) return b.uniquePeople - a.uniquePeople;
            // Finally by total engagements
            return b.engagements - a.engagements;
        });
        
        return {
            totalCompanies: companies.length,
            topPerformers: companies.slice(0, 10),
            companyAnalysis: this.generateCompanyInsights(companies),
            qualityCompanies: companies.filter(c => c.qualityRate > 0.3),
            penetrationLeaders: companies.filter(c => c.uniquePeople >= this.options.minimumCompanySize)
        };
    }

    /**
     * Analyze individual people engagement patterns
     */
    async analyzePeopleEngagement(data) {
        console.log('👥 Analyzing people engagement patterns...');
        
        const engagements = data.engagements || [];
        const people = [];
        
        // Group by person
        const personMap = {};
        engagements.forEach(engagement => {
            const person = engagement.person || engagement.personData;
            if (!person?.linkedin_url) return;
            
            const key = person.linkedin_url;
            if (!personMap[key]) {
                personMap[key] = {
                    ...person,
                    engagements: 0,
                    reactionTypes: new Set(),
                    lastEngagement: null,
                    influence: 0
                };
            }
            
            personMap[key].engagements++;
            if (engagement.reaction_type) {
                personMap[key].reactionTypes.add(engagement.reaction_type);
            }
            
            const engagementDate = new Date(engagement.engaged_at || engagement.created_at);
            if (!personMap[key].lastEngagement || engagementDate > personMap[key].lastEngagement) {
                personMap[key].lastEngagement = engagementDate;
            }
        });
        
        // Convert to array and calculate influence score
        Object.values(personMap).forEach(person => {
            // Simple influence calculation based on title keywords
            const title = (person.current_title || person.title_override || '').toLowerCase();
            const influenceKeywords = ['ceo', 'cto', 'vp', 'vice president', 'director', 'head of', 'chief', 'founder'];
            
            person.influence = influenceKeywords.reduce((score, keyword) => {
                return title.includes(keyword) ? score + 1 : score;
            }, 0);
            
            people.push(person);
        });
        
        // Sort by engagement score and influence
        people.sort((a, b) => {
            const scoreA = (a.engagement_score || 0) + a.influence;
            const scoreB = (b.engagement_score || 0) + b.influence;
            return scoreB - scoreA;
        });
        
        return {
            totalPeople: people.length,
            keyInfluencers: people.filter(p => p.influence > 0).slice(0, 10),
            highEngagers: people.filter(p => (p.engagement_score || 0) >= this.options.highValueEngagementThreshold),
            topPeople: people.slice(0, 15)
        };
    }

    /**
     * Generate campaign intelligence insights
     */
    async generateCampaignIntelligence(data) {
        console.log('📊 Generating campaign intelligence...');
        
        const intelligence = {
            campaignCount: data.campaigns?.length || 0,
            totalSpend: this.calculateTotalSpend(data),
            reachEstimate: 0,
            efficiency: {},
            performance: {},
            targeting: {}
        };
        
        if (data.campaignDemographics) {
            intelligence.reachEstimate = data.campaignDemographics.totalImpressions || 0;
            
            // Calculate efficiency metrics
            intelligence.efficiency = {
                costPerImpression: intelligence.reachEstimate > 0 ? 
                    intelligence.totalSpend / intelligence.reachEstimate : 0,
                impressionToEngagementRate: intelligence.reachEstimate > 0 ? 
                    (data.engagements?.length || 0) / intelligence.reachEstimate : 0
            };
        }
        
        // Performance vs. targeting
        if (data.targetingEffectiveness) {
            intelligence.targeting = {
                effectiveness: data.targetingEffectiveness.overallScore,
                message: this.interpretCampaignTargeting(data.targetingEffectiveness)
            };
        }
        
        return intelligence;
    }

    /**
     * Generate actionable recommendations
     */
    async generateRecommendations(data) {
        console.log('💡 Generating actionable recommendations...');
        
        const recommendations = [];
        
        // Analyze targeting effectiveness
        const targetingScore = data.targetingEffectiveness?.overallScore || 0;
        if (targetingScore < 0.3) {
            recommendations.push({
                priority: 'high',
                category: 'targeting',
                title: 'Improve Audience Targeting',
                description: 'Low target hit rate suggests audience targeting needs refinement',
                action: 'Review and narrow target company/title lists for better precision'
            });
        } else if (targetingScore > 0.7) {
            recommendations.push({
                priority: 'medium',
                category: 'expansion',
                title: 'Consider Audience Expansion',
                description: 'High target hit rate indicates successful targeting - consider expanding',
                action: 'Test similar companies or adjacent job functions'
            });
        }
        
        // Analyze cost efficiency
        const costEfficiency = data.costEfficiency || {};
        if (costEfficiency.costPerQualityEngagement > this.benchmarks.costPerQualityEngagement * 1.5) {
            recommendations.push({
                priority: 'high',
                category: 'cost_optimization',
                title: 'Reduce Cost Per Quality Engagement',
                description: 'Higher than benchmark cost per quality engagement',
                action: 'Optimize ad creative or refine targeting to improve efficiency'
            });
        }
        
        // Analyze company penetration
        const companyPerformance = data.companyPerformance || {};
        if (companyPerformance.penetrationLeaders?.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'account_expansion',
                title: 'Expand Within High-Performing Companies',
                description: `${companyPerformance.penetrationLeaders.length} companies show strong engagement`,
                action: 'Create account-specific campaigns for top performing companies'
            });
        }
        
        // Data quality recommendations
        if (data.dataQuality?.missingPersonData > data.engagements?.length * 0.2) {
            recommendations.push({
                priority: 'medium',
                category: 'data_quality',
                title: 'Improve Data Collection',
                description: 'Significant missing person data affecting analysis accuracy',
                action: 'Run profile enrichment to complete missing company/title information'
            });
        }
        
        return recommendations.sort((a, b) => {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * Compare performance to industry benchmarks
     */
    compareToBenchmarks(data) {
        const engagements = data.engagements?.length || 0;
        const reachEstimate = data.campaignDemographics?.totalImpressions || 0;
        
        const comparisons = {};
        
        if (reachEstimate > 0) {
            const engagementRate = engagements / reachEstimate;
            comparisons.engagementRate = {
                actual: engagementRate,
                benchmark: this.benchmarks.linkedInEngagementRate,
                performance: engagementRate > this.benchmarks.linkedInEngagementRate ? 'above' : 'below',
                ratio: engagementRate / this.benchmarks.linkedInEngagementRate
            };
        }
        
        const targetingScore = data.targetingEffectiveness?.overallScore || 0;
        comparisons.targetingEffectiveness = {
            actual: targetingScore,
            benchmark: this.benchmarks.targetHitRate,
            performance: targetingScore > this.benchmarks.targetHitRate ? 'above' : 'below',
            ratio: targetingScore / this.benchmarks.targetHitRate
        };
        
        return comparisons;
    }

    /**
     * Generate executive summary
     */
    generateExecutiveSummary(insights, data) {
        const engagements = data.engagements?.length || 0;
        const targetingScore = insights.targetingEffectiveness?.overallScore || 0;
        const qualityScore = insights.qualityScore?.overall || 0;
        const topCompanies = insights.companyPerformance?.topPerformers?.slice(0, 3) || [];
        
        let status = 'needs_improvement';
        if (targetingScore > 0.6 && qualityScore > 7) {
            status = 'excellent';
        } else if (targetingScore > 0.4 || qualityScore > 5) {
            status = 'good';
        }
        
        const summary = {
            status: status,
            keyMetrics: {
                totalEngagements: engagements,
                targetingEffectiveness: Math.round(targetingScore * 100),
                qualityScore: qualityScore,
                topCompanies: topCompanies.length
            },
            headline: this.generateHeadline(status, insights, data),
            keyInsights: this.generateKeyInsights(insights, data),
            topPriority: insights.recommendations?.[0] || null
        };
        
        return summary;
    }

    /**
     * Helper methods
     */
    
    calculateTotalSpend(data) {
        if (data.campaignDemographics?.totalSpend) {
            return data.campaignDemographics.totalSpend;
        }
        
        if (data.post?.campaign_spend) {
            return data.post.campaign_spend;
        }
        
        return 0;
    }
    
    countTargetHits(data) {
        // Count engagements that match targeting criteria
        // Implementation would analyze targeting vs. actual engagement patterns
        return data.targetingEffectiveness?.companyPenetration?.companiesHit || 0;
    }
    
    calculateEngagementDiversity(engagements) {
        const companies = new Set();
        engagements.forEach(e => {
            const company = e.person?.current_company || e.personData?.current_company;
            if (company) companies.add(company);
        });
        
        return engagements.length > 0 ? companies.size / engagements.length : 0;
    }
    
    calculateHighValueEngagementRate(engagements) {
        const highValue = engagements.filter(e => 
            (e.person?.engagement_score || 0) >= this.options.highValueEngagementThreshold
        ).length;
        
        return engagements.length > 0 ? highValue / engagements.length : 0;
    }
    
    getTopCompanyPerformers(engagementsByCompany) {
        return Object.entries(engagementsByCompany)
            .filter(([_, data]) => data.isTarget)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([company, data]) => ({ company, ...data }));
    }
    
    generateCompanyInsights(companies) {
        const insights = [];
        
        if (companies.length > 0) {
            const avgPenetration = companies.reduce((sum, c) => sum + c.penetrationRate, 0) / companies.length;
            insights.push(`Average company penetration: ${avgPenetration.toFixed(1)} engagements per person`);
        }
        
        const highQualityCompanies = companies.filter(c => c.qualityRate > 0.5);
        if (highQualityCompanies.length > 0) {
            insights.push(`${highQualityCompanies.length} companies show high-quality engagement patterns`);
        }
        
        return insights;
    }
    
    generateHeadline(status, insights, data) {
        const engagements = data.engagements?.length || 0;
        const targetingScore = Math.round((insights.targetingEffectiveness?.overallScore || 0) * 100);
        
        switch (status) {
            case 'excellent':
                return `Excellent performance: ${engagements} engagements with ${targetingScore}% target hit rate`;
            case 'good':
                return `Good performance: ${engagements} engagements with room for optimization`;
            default:
                return `${engagements} engagements analyzed - improvements needed for better targeting`;
        }
    }
    
    generateKeyInsights(insights, data) {
        const keyInsights = [];
        
        if (insights.companyPerformance?.topPerformers?.length > 0) {
            const topCompany = insights.companyPerformance.topPerformers[0];
            keyInsights.push(`${topCompany.name} leads with ${topCompany.uniquePeople} engaged professionals`);
        }
        
        if (insights.targetingEffectiveness?.overallScore > 0.5) {
            keyInsights.push('Strong targeting effectiveness - strategy is reaching intended audience');
        }
        
        if (insights.qualityScore?.overall > 7) {
            keyInsights.push('High-quality engagement data enables reliable analysis');
        }
        
        return keyInsights;
    }
    
    interpretTargetingEffectiveness(effectiveness) {
        const score = effectiveness.overallScore;
        if (score > 0.7) return 'Excellent targeting - strategy is highly effective';
        if (score > 0.5) return 'Good targeting with room for refinement';
        if (score > 0.3) return 'Moderate targeting effectiveness - consider optimization';
        return 'Low targeting effectiveness - strategy needs significant improvement';
    }
    
    interpretQualityScore(score) {
        if (score >= 8) return 'Excellent data quality - reliable for decision making';
        if (score >= 6) return 'Good data quality - suitable for analysis';
        if (score >= 4) return 'Fair data quality - some limitations in analysis';
        return 'Poor data quality - significant cleanup needed';
    }
    
    interpretCostEfficiency(efficiency) {
        const cpe = efficiency.costPerEngagement;
        if (cpe < this.benchmarks.costPerQualityEngagement * 0.7) {
            return 'Excellent cost efficiency - significantly below industry average';
        }
        if (cpe < this.benchmarks.costPerQualityEngagement) {
            return 'Good cost efficiency - below industry average';
        }
        if (cpe < this.benchmarks.costPerQualityEngagement * 1.5) {
            return 'Fair cost efficiency - near industry average';
        }
        return 'Poor cost efficiency - significantly above industry average';
    }
    
    interpretCampaignTargeting(targetingData) {
        const score = targetingData.overallScore;
        if (score > 0.6) {
            return 'Campaign targeting is effectively reaching intended audience segments';
        }
        return 'Campaign targeting may need refinement to better reach intended audience';
    }
    
    async extractCampaignTargeting(campaigns) {
        // Extract targeting criteria from campaign data
        const targeting = {
            companies: [],
            jobTitles: [],
            industries: [],
            seniorities: []
        };
        
        campaigns.forEach(campaign => {
            if (campaign.targetingCriteria) {
                if (campaign.targetingCriteria.include?.companies) {
                    targeting.companies.push(...campaign.targetingCriteria.include.companies);
                }
                if (campaign.targetingCriteria.include?.jobTitles) {
                    targeting.jobTitles.push(...campaign.targetingCriteria.include.jobTitles);
                }
            }
        });
        
        return targeting;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.InsightGenerator = InsightGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InsightGenerator;
}