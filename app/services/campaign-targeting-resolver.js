// Campaign Targeting Data Resolver
// Extracts real targeting criteria from LinkedIn campaigns and resolves URNs to readable names

class CampaignTargetingResolver {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }
    
    // Get campaign data from database or API
    async getCampaignData(campaignId) {
        try {
            console.log('Looking up campaign:', campaignId);
            
            // First try to get from database
            const { data: campaign, error } = await this.supabase
                .from('linkedin_campaigns')
                .select('*')
                .eq('linkedin_campaign_id', campaignId)
                .single();
                
            if (error) {
                console.error('Database lookup error:', error);
            }
                
            if (campaign && campaign.targeting_criteria) {
                console.log('Found campaign in database:', campaign.name);
                return campaign;
            }
            
            // If not in database, fetch from API
            if (window.linkedInAPI) {
                console.log('Trying to fetch from API...');
                const campaigns = await window.linkedInAPI.getCampaigns(510508147); // Vucko account
                const apiCampaign = campaigns.elements?.find(c => c.id === campaignId);
                if (apiCampaign) {
                    console.log('Found campaign in API:', apiCampaign.name);
                }
                return apiCampaign;
            }
            
            console.log('Campaign not found:', campaignId);
            return null;
        } catch (error) {
            console.error('Error getting campaign data:', error);
            return null;
        }
    }
    
    // Extract and resolve targeting criteria from a campaign
    extractTargetingData(campaign) {
        if (!campaign || !campaign.targetingCriteria) {
            return null;
        }
        
        const targeting = campaign.targetingCriteria;
        const resolvedData = {
            industries: [],
            seniorities: [],
            jobFunctions: [],
            locations: [],
            companies: [],
            jobTitles: []
        };
        
        // Process included criteria
        if (targeting.include && targeting.include.and) {
            targeting.include.and.forEach(criterion => {
                if (criterion.or) {
                    Object.entries(criterion.or).forEach(([facet, urns]) => {
                        if (facet.includes('industries')) {
                            resolvedData.industries = urns.map(urn => ({
                                urn: urn,
                                name: resolveIndustryURN(urn)
                            }));
                        } else if (facet.includes('seniorities')) {
                            resolvedData.seniorities = urns.map(urn => ({
                                urn: urn,
                                name: resolveSeniorityURN(urn)
                            }));
                        } else if (facet.includes('functions')) {
                            resolvedData.jobFunctions = urns.map(urn => ({
                                urn: urn,
                                name: resolveJobFunctionURN(urn)
                            }));
                        } else if (facet.includes('locations')) {
                            resolvedData.locations = urns.map(urn => ({
                                urn: urn,
                                name: resolveGeoLocationURN(urn)
                            }));
                        } else if (facet.includes('companies') || facet.includes('employers')) {
                            // Company/Organization URNs
                            resolvedData.companies = urns.map(urn => ({
                                urn: urn,
                                name: resolveOrganizationURN(urn)
                            }));
                        } else if (facet.includes('titles')) {
                            // Job title URNs
                            resolvedData.jobTitles = urns.map(urn => ({
                                urn: urn,
                                name: this.extractJobTitle(urn)
                            }));
                        }
                    });
                }
            });
        }
        
        // Process excluded criteria (if needed)
        if (targeting.exclude && targeting.exclude.or) {
            Object.entries(targeting.exclude.or).forEach(([facet, urns]) => {
                if (facet.includes('seniorities')) {
                    // Note which seniorities are excluded
                    const excludedSeniorities = urns.map(urn => resolveSeniorityURN(urn));
                    resolvedData.excludedSeniorities = excludedSeniorities;
                }
            });
        }
        
        return resolvedData;
    }
    
    // Extract company name from URN or use placeholder
    extractCompanyName(urn) {
        // Company URNs are like urn:li:company:1441 or urn:li:organization:1441
        const match = urn.match(/urn:li:(?:company|organization):(\d+)/);
        if (match) {
            const companyId = match[1];
            // For now, return a placeholder - in a real implementation,
            // we'd look this up in a company database or API
            return `Company ${companyId}`;
        }
        return urn;
    }
    
    // Extract job title from URN
    extractJobTitle(urn) {
        const match = urn.match(/urn:li:title:(\d+)/);
        if (match) {
            const titleId = match[1];
            // Common title mappings
            const titleMappings = {
                9: "Software Engineer",
                10: "Senior Software Engineer",
                11: "Engineering Manager",
                12: "Product Manager",
                13: "Senior Product Manager",
                14: "Director",
                15: "Vice President",
                16: "Chief Technology Officer",
                17: "Chief Executive Officer"
            };
            return titleMappings[titleId] || `Title ${titleId}`;
        }
        return urn;
    }
    
    // Get aggregated targeting data for multiple campaigns
    async getAggregatedTargetingData(campaignIds) {
        const aggregated = {
            industries: new Map(),
            seniorities: new Map(),
            jobFunctions: new Map(),
            locations: new Map(),
            companies: new Map(),
            jobTitles: new Map()
        };
        
        for (const campaignId of campaignIds) {
            const campaign = await this.getCampaignData(campaignId);
            if (campaign) {
                const targetingData = this.extractTargetingData(campaign);
                if (targetingData) {
                    // Aggregate industries
                    targetingData.industries.forEach(ind => {
                        aggregated.industries.set(ind.name, ind);
                    });
                    
                    // Aggregate seniorities
                    targetingData.seniorities.forEach(sen => {
                        aggregated.seniorities.set(sen.name, sen);
                    });
                    
                    // Aggregate job functions
                    targetingData.jobFunctions.forEach(func => {
                        aggregated.jobFunctions.set(func.name, func);
                    });
                    
                    // Aggregate companies
                    targetingData.companies.forEach(comp => {
                        aggregated.companies.set(comp.name, comp);
                    });
                    
                    // Aggregate job titles
                    targetingData.jobTitles.forEach(title => {
                        aggregated.jobTitles.set(title.name, title);
                    });
                }
            }
        }
        
        // Convert Maps to Arrays
        return {
            industries: Array.from(aggregated.industries.values()),
            seniorities: Array.from(aggregated.seniorities.values()),
            jobFunctions: Array.from(aggregated.jobFunctions.values()),
            companies: Array.from(aggregated.companies.values()),
            jobTitles: Array.from(aggregated.jobTitles.values()),
            locations: Array.from(aggregated.locations.values())
        };
    }
    
    // Format data for UI display
    formatForDisplay(targetingData) {
        return {
            companies: targetingData.companies.map(c => ({
                label: c.name,
                type: 'campaign_target'
            })),
            jobTitles: targetingData.jobTitles.length > 0 ? 
                targetingData.jobTitles.map(t => ({
                    label: t.name,
                    type: 'campaign_target'
                })) :
                targetingData.jobFunctions.map(f => ({
                    label: f.name,
                    type: 'campaign_target'
                })),
            industries: targetingData.industries.map(i => ({
                label: i.name,
                type: 'campaign_target'
            })),
            seniorities: targetingData.seniorities.map(s => ({
                label: s.name,
                type: 'campaign_target'
            }))
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CampaignTargetingResolver;
}