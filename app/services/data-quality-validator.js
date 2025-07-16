/**
 * DataQualityValidator - Data Quality & Reconciliation Service
 * 
 * Addresses the critical "162 vs 283" engagement count discrepancy by:
 * 1. Identifying orphaned engagement records without person data
 * 2. Detecting and removing duplicate engagements
 * 3. Validating person data completeness and quality
 * 4. Reconciling Apify scraper data with database records
 * 5. Providing automated data cleanup and enrichment suggestions
 * 
 * Goal: Ensure data consistency and eliminate confusion between expected and actual counts
 */

class DataQualityValidator {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.tenantId = DEFAULT_TENANT_ID;
        
        // Data quality thresholds
        this.thresholds = {
            personDataCompleteness: 0.6, // 60% minimum data completeness
            duplicateDetectionSimilarity: 0.9, // 90% similarity for duplicate detection
            maxEngagementAge: 365, // Days after which engagements are considered stale
            minimumRequiredFields: ['name', 'linkedin_url'] // Essential fields for valid person record
        };
        
        // Quality metrics tracking
        this.metrics = {
            totalEngagements: 0,
            validEngagements: 0,
            orphanedEngagements: 0,
            duplicateEngagements: 0,
            lowQualityPersons: 0,
            missingPersonData: 0,
            enrichmentCandidates: 0
        };
        
        console.log('🔍 DataQualityValidator initialized');
    }

    /**
     * Main data quality analysis and cleanup for a specific post
     * @param {number} postId - Post ID to analyze
     * @param {Array} apifyData - Fresh data from Apify scraper (optional)
     * @returns {Object} Quality analysis and cleaned data
     */
    async validatePostEngagements(postId, apifyData = null) {
        console.log(`🔍 Starting data quality validation for post ${postId}`);
        
        this.resetMetrics();
        
        // Step 1: Get current database state
        const currentData = await this.getCurrentDatabaseState(postId);
        
        // Step 2: Analyze data quality issues
        const qualityAnalysis = await this.analyzeDataQuality(currentData, apifyData);
        
        // Step 3: Identify and fix issues
        const cleanupResults = await this.performDataCleanup(qualityAnalysis);
        
        // Step 4: Generate recommendations
        const recommendations = this.generateRecommendations(qualityAnalysis, cleanupResults);
        
        const result = {
            metrics: this.metrics,
            analysis: qualityAnalysis,
            cleanup: cleanupResults,
            recommendations: recommendations,
            summary: this.generateSummary()
        };
        
        console.log('✅ Data quality validation completed');
        console.log(`📊 Summary: ${this.metrics.validEngagements}/${this.metrics.totalEngagements} valid engagements`);
        
        return result;
    }

    /**
     * Get current state of post engagements from database
     */
    async getCurrentDatabaseState(postId) {
        console.log('📋 Fetching current database state...');
        
        // Get post information
        const { data: post, error: postError } = await this.supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();
        
        if (postError) {
            throw new Error(`Failed to fetch post data: ${postError.message}`);
        }
        
        // Get all engagements for this post
        const { data: engagements, error: engagementsError } = await this.supabase
            .from('engagements')
            .select(`
                *,
                person:persons (
                    id, name, linkedin_url, current_title, current_company,
                    title_override, company_override, headline, profile_picture,
                    is_follower, engagement_score, created_at, updated_at
                )
            `)
            .eq('post_id', postId);
        
        if (engagementsError) {
            throw new Error(`Failed to fetch engagements: ${engagementsError.message}`);
        }
        
        // Get orphaned engagements (engagements without person records)
        const { data: orphanedEngagements, error: orphanedError } = await this.supabase
            .from('engagements')
            .select('*')
            .eq('post_id', postId)
            .is('person_id', null);
        
        this.metrics.totalEngagements = engagements?.length || 0;
        
        return {
            post,
            engagements: engagements || [],
            orphanedEngagements: orphanedEngagements || []
        };
    }

    /**
     * Comprehensive data quality analysis
     */
    async analyzeDataQuality(currentData, apifyData) {
        console.log('🔬 Analyzing data quality issues...');
        
        const analysis = {
            issues: [],
            engagementAnalysis: null,
            personAnalysis: null,
            apifyComparison: null,
            duplicateAnalysis: null
        };
        
        // Analyze engagements
        analysis.engagementAnalysis = this.analyzeEngagementQuality(currentData.engagements);
        
        // Analyze person data quality
        analysis.personAnalysis = this.analyzePersonDataQuality(currentData.engagements);
        
        // Analyze duplicates
        analysis.duplicateAnalysis = this.findDuplicateEngagements(currentData.engagements);
        
        // Compare with Apify data if provided
        if (apifyData) {
            analysis.apifyComparison = this.compareWithApifyData(currentData.engagements, apifyData);
        }
        
        // Analyze orphaned records
        if (currentData.orphanedEngagements.length > 0) {
            analysis.issues.push({
                type: 'orphaned_engagements',
                severity: 'high',
                count: currentData.orphanedEngagements.length,
                description: `${currentData.orphanedEngagements.length} engagements without person records`
            });
            this.metrics.orphanedEngagements = currentData.orphanedEngagements.length;
        }
        
        return analysis;
    }

    /**
     * Analyze engagement record quality
     */
    analyzeEngagementQuality(engagements) {
        const analysis = {
            withPersonData: 0,
            withoutPersonData: 0,
            recentEngagements: 0,
            staleEngagements: 0,
            byReactionType: {}
        };
        
        const now = new Date();
        const staleThreshold = new Date(now.getTime() - (this.thresholds.maxEngagementAge * 24 * 60 * 60 * 1000));
        
        engagements.forEach(engagement => {
            // Person data presence
            if (engagement.person) {
                analysis.withPersonData++;
                this.metrics.validEngagements++;
            } else {
                analysis.withoutPersonData++;
                this.metrics.missingPersonData++;
            }
            
            // Age analysis
            const engagementDate = new Date(engagement.engaged_at || engagement.created_at);
            if (engagementDate > staleThreshold) {
                analysis.recentEngagements++;
            } else {
                analysis.staleEngagements++;
            }
            
            // Reaction type distribution
            const reactionType = engagement.reaction_type || 'like';
            analysis.byReactionType[reactionType] = (analysis.byReactionType[reactionType] || 0) + 1;
        });
        
        return analysis;
    }

    /**
     * Analyze person data quality
     */
    analyzePersonDataQuality(engagements) {
        const analysis = {
            highQuality: 0,
            mediumQuality: 0,
            lowQuality: 0,
            missingFields: {},
            enrichmentCandidates: []
        };
        
        const requiredFields = ['name', 'linkedin_url', 'current_title', 'current_company'];
        
        engagements.forEach(engagement => {
            if (!engagement.person) return;
            
            const person = engagement.person;
            let qualityScore = 0;
            let missingCount = 0;
            
            // Calculate data completeness score
            requiredFields.forEach(field => {
                if (person[field] && person[field].trim()) {
                    qualityScore++;
                } else {
                    missingCount++;
                    analysis.missingFields[field] = (analysis.missingFields[field] || 0) + 1;
                }
            });
            
            // Additional quality factors
            if (person.profile_picture) qualityScore += 0.5;
            if (person.headline) qualityScore += 0.5;
            
            const normalizedScore = qualityScore / (requiredFields.length + 1);
            
            // Categorize quality level
            if (normalizedScore >= 0.8) {
                analysis.highQuality++;
            } else if (normalizedScore >= this.thresholds.personDataCompleteness) {
                analysis.mediumQuality++;
            } else {
                analysis.lowQuality++;
                this.metrics.lowQualityPersons++;
                
                // Add to enrichment candidates if has basic identifiers
                if (person.name && person.linkedin_url) {
                    analysis.enrichmentCandidates.push({
                        personId: person.id,
                        name: person.name,
                        missingFields: requiredFields.filter(field => !person[field]),
                        qualityScore: normalizedScore
                    });
                    this.metrics.enrichmentCandidates++;
                }
            }
        });
        
        return analysis;
    }

    /**
     * Find and analyze duplicate engagements
     */
    findDuplicateEngagements(engagements) {
        const analysis = {
            duplicateGroups: [],
            totalDuplicates: 0
        };
        
        // Group by LinkedIn URL (primary duplicate indicator)
        const urlGroups = {};
        
        engagements.forEach(engagement => {
            if (!engagement.person?.linkedin_url) return;
            
            const url = engagement.person.linkedin_url.toLowerCase();
            if (!urlGroups[url]) {
                urlGroups[url] = [];
            }
            urlGroups[url].push(engagement);
        });
        
        // Find groups with multiple engagements
        Object.entries(urlGroups).forEach(([url, group]) => {
            if (group.length > 1) {
                // Determine which is the "best" record to keep
                const sorted = group.sort((a, b) => {
                    // Prefer records with more complete person data
                    const scoreA = this.calculatePersonCompleteness(a.person);
                    const scoreB = this.calculatePersonCompleteness(b.person);
                    
                    if (scoreA !== scoreB) return scoreB - scoreA;
                    
                    // Prefer newer records
                    return new Date(b.created_at) - new Date(a.created_at);
                });
                
                analysis.duplicateGroups.push({
                    linkedinUrl: url,
                    engagements: group,
                    keepRecord: sorted[0],
                    removeRecords: sorted.slice(1),
                    duplicateCount: group.length - 1
                });
                
                analysis.totalDuplicates += group.length - 1;
                this.metrics.duplicateEngagements += group.length - 1;
            }
        });
        
        return analysis;
    }

    /**
     * Compare current data with fresh Apify scraper data
     */
    compareWithApifyData(currentEngagements, apifyData) {
        const comparison = {
            apifyCount: apifyData.length,
            databaseCount: currentEngagements.length,
            discrepancy: apifyData.length - currentEngagements.length,
            missingInDatabase: [],
            extraInDatabase: [],
            matchedCount: 0
        };
        
        // Create lookup maps
        const databaseUrls = new Set(
            currentEngagements
                .map(e => e.person?.linkedin_url)
                .filter(Boolean)
                .map(url => url.toLowerCase())
        );
        
        const apifyUrls = new Set(
            apifyData
                .map(item => item.linkedinUrl)
                .filter(Boolean)
                .map(url => url.toLowerCase())
        );
        
        // Find matches and mismatches
        apifyData.forEach(item => {
            if (item.linkedinUrl) {
                const url = item.linkedinUrl.toLowerCase();
                if (databaseUrls.has(url)) {
                    comparison.matchedCount++;
                } else {
                    comparison.missingInDatabase.push(item);
                }
            }
        });
        
        currentEngagements.forEach(engagement => {
            if (engagement.person?.linkedin_url) {
                const url = engagement.person.linkedin_url.toLowerCase();
                if (!apifyUrls.has(url)) {
                    comparison.extraInDatabase.push(engagement);
                }
            }
        });
        
        // This explains the 162 vs 283 discrepancy!
        console.log(`🔍 Apify vs Database comparison:`);
        console.log(`  - Apify provided: ${comparison.apifyCount} engagements`);
        console.log(`  - Database has: ${comparison.databaseCount} engagements`);
        console.log(`  - Matched: ${comparison.matchedCount}`);
        console.log(`  - Missing in DB: ${comparison.missingInDatabase.length}`);
        console.log(`  - Extra in DB: ${comparison.extraInDatabase.length}`);
        
        return comparison;
    }

    /**
     * Perform automated data cleanup
     */
    async performDataCleanup(analysis) {
        console.log('🧹 Performing data cleanup...');
        
        const cleanup = {
            duplicatesRemoved: 0,
            orphansLinked: 0,
            personsEnriched: 0,
            errors: []
        };
        
        // Remove duplicate engagements
        if (analysis.duplicateAnalysis?.duplicateGroups.length > 0) {
            try {
                cleanup.duplicatesRemoved = await this.removeDuplicateEngagements(
                    analysis.duplicateAnalysis.duplicateGroups
                );
            } catch (error) {
                cleanup.errors.push(`Duplicate removal failed: ${error.message}`);
            }
        }
        
        // Link orphaned engagements to existing persons
        if (analysis.issues.some(issue => issue.type === 'orphaned_engagements')) {
            try {
                cleanup.orphansLinked = await this.linkOrphanedEngagements();
            } catch (error) {
                cleanup.errors.push(`Orphan linking failed: ${error.message}`);
            }
        }
        
        // Enrich low-quality person records
        if (analysis.personAnalysis?.enrichmentCandidates.length > 0) {
            try {
                cleanup.personsEnriched = await this.enrichPersonRecords(
                    analysis.personAnalysis.enrichmentCandidates
                );
            } catch (error) {
                cleanup.errors.push(`Person enrichment failed: ${error.message}`);
            }
        }
        
        return cleanup;
    }

    /**
     * Remove duplicate engagement records
     */
    async removeDuplicateEngagements(duplicateGroups) {
        let removedCount = 0;
        
        for (const group of duplicateGroups) {
            try {
                // Remove all but the best record
                const idsToRemove = group.removeRecords.map(r => r.id);
                
                const { error } = await this.supabase
                    .from('engagements')
                    .delete()
                    .in('id', idsToRemove);
                
                if (error) {
                    console.error('Error removing duplicates:', error);
                } else {
                    removedCount += idsToRemove.length;
                    console.log(`✅ Removed ${idsToRemove.length} duplicate engagements for ${group.linkedinUrl}`);
                }
            } catch (error) {
                console.error('Error in duplicate removal:', error);
            }
        }
        
        return removedCount;
    }

    /**
     * Link orphaned engagements to existing person records
     */
    async linkOrphanedEngagements() {
        // This would implement logic to match orphaned engagements
        // to existing person records based on LinkedIn URL, name, etc.
        
        console.log('🔗 Linking orphaned engagements (placeholder)');
        // Implementation would go here
        return 0;
    }

    /**
     * Enrich person records with missing data
     */
    async enrichPersonRecords(candidates) {
        // This would trigger profile enrichment for incomplete records
        
        console.log('💎 Enriching person records (placeholder)');
        // Implementation would go here
        return 0;
    }

    /**
     * Calculate person data completeness score
     */
    calculatePersonCompleteness(person) {
        if (!person) return 0;
        
        const fields = ['name', 'linkedin_url', 'current_title', 'current_company', 'headline', 'profile_picture'];
        let score = 0;
        
        fields.forEach(field => {
            if (person[field] && person[field].trim()) {
                score++;
            }
        });
        
        return score / fields.length;
    }

    /**
     * Generate recommendations for data quality improvement
     */
    generateRecommendations(analysis, cleanup) {
        const recommendations = [];
        
        // High-priority recommendations
        if (this.metrics.orphanedEngagements > 0) {
            recommendations.push({
                priority: 'high',
                type: 'fix_orphaned_records',
                description: `Fix ${this.metrics.orphanedEngagements} orphaned engagement records`,
                action: 'Run person record linking or re-import missing data'
            });
        }
        
        if (this.metrics.duplicateEngagements > 10) {
            recommendations.push({
                priority: 'high',
                type: 'remove_duplicates',
                description: `Remove ${this.metrics.duplicateEngagements} duplicate engagement records`,
                action: 'Run automated duplicate cleanup'
            });
        }
        
        // Medium-priority recommendations
        if (this.metrics.enrichmentCandidates > 0) {
            recommendations.push({
                priority: 'medium',
                type: 'enrich_person_data',
                description: `Enrich ${this.metrics.enrichmentCandidates} incomplete person records`,
                action: 'Run profile enrichment scraper for missing data'
            });
        }
        
        // Data source recommendations
        if (analysis.apifyComparison && Math.abs(analysis.apifyComparison.discrepancy) > 20) {
            recommendations.push({
                priority: 'medium',
                type: 'sync_apify_data',
                description: `Sync missing data (${analysis.apifyComparison.discrepancy} engagement discrepancy)`,
                action: 'Re-run Apify import or investigate data source issues'
            });
        }
        
        return recommendations;
    }

    /**
     * Generate human-readable summary
     */
    generateSummary() {
        const totalIssues = this.metrics.orphanedEngagements + this.metrics.duplicateEngagements + this.metrics.lowQualityPersons;
        const dataQualityScore = this.metrics.totalEngagements > 0 ? 
            (this.metrics.validEngagements / this.metrics.totalEngagements) * 100 : 0;
        
        return {
            dataQualityScore: Math.round(dataQualityScore),
            totalIssues: totalIssues,
            status: totalIssues === 0 ? 'excellent' : 
                   totalIssues <= 5 ? 'good' : 
                   totalIssues <= 20 ? 'fair' : 'poor',
            message: this.generateStatusMessage(dataQualityScore, totalIssues)
        };
    }

    generateStatusMessage(score, issues) {
        if (score >= 95 && issues === 0) {
            return 'Excellent data quality - no issues detected';
        } else if (score >= 85 && issues <= 5) {
            return 'Good data quality with minor issues that can be easily resolved';
        } else if (score >= 70) {
            return 'Fair data quality - some cleanup recommended to improve accuracy';
        } else {
            return 'Poor data quality - significant cleanup required before analysis';
        }
    }

    resetMetrics() {
        Object.keys(this.metrics).forEach(key => {
            this.metrics[key] = 0;
        });
    }

    /**
     * Batch validation for multiple posts
     */
    async validateMultiplePosts(postIds) {
        console.log(`🔄 Starting batch validation for ${postIds.length} posts`);
        
        const results = [];
        
        for (const postId of postIds) {
            try {
                const result = await this.validatePostEngagements(postId);
                results.push({
                    postId,
                    result,
                    success: true
                });
            } catch (error) {
                results.push({
                    postId,
                    error: error.message,
                    success: false
                });
            }
        }
        
        return {
            results,
            summary: this.generateBatchSummary(results)
        };
    }

    generateBatchSummary(results) {
        const successful = results.filter(r => r.success);
        const totalIssues = successful.reduce((sum, r) => sum + r.result.summary.totalIssues, 0);
        const avgQuality = successful.length > 0 ? 
            successful.reduce((sum, r) => sum + r.result.summary.dataQualityScore, 0) / successful.length : 0;
        
        return {
            postsAnalyzed: results.length,
            successfulAnalyses: successful.length,
            totalIssuesFound: totalIssues,
            averageQualityScore: Math.round(avgQuality),
            recommendedActions: totalIssues > 0 ? ['Run data cleanup', 'Review data sources'] : ['No action needed']
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DataQualityValidator = DataQualityValidator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataQualityValidator;
}