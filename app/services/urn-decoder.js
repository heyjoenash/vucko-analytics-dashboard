/**
 * LinkedIn URN Decoder Service
 * Converts LinkedIn URNs to human-readable values
 */

class URNDecoder {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
        
        // Static mappings for common URNs - expanded for better coverage
        this.staticMappings = {
            // Experience ranges
            'urn:li:yearsOfExperience:1': '0-1 years',
            'urn:li:yearsOfExperience:2': '1-2 years',
            'urn:li:yearsOfExperience:3': '2-5 years',
            'urn:li:yearsOfExperience:4': '5-7 years',
            'urn:li:yearsOfExperience:5': '7-10 years',
            'urn:li:yearsOfExperience:10': '10-12 years',
            'urn:li:yearsOfExperience:12': '12+ years',
            
            // Common locations
            'urn:li:geo:103644278': 'United States',
            'urn:li:geo:102095887': 'California, United States',
            'urn:li:geo:102071732': 'New York, United States',
            'urn:li:geo:106057199': 'New York, New York',
            'urn:li:geo:90000049': 'San Francisco Bay Area',
            'urn:li:geo:90000070': 'New York City Metropolitan Area',
            'urn:li:geo:90000068': 'Los Angeles Metropolitan Area',
            'urn:li:geo:90000084': 'Chicago Metropolitan Area',
            'urn:li:geo:90000093': 'Dallas-Fort Worth Metroplex',
            'urn:li:geo:90000097': 'Houston, Texas Area',
            'urn:li:geo:90009570': 'Greater London, England',
            'urn:li:geo:101165590': 'United Kingdom',
            'urn:li:geo:102257491': 'London, England',
            'urn:li:geo:105149290': 'Canada',
            'urn:li:geo:100746952': 'Toronto, Ontario',
            'urn:li:geo:103685771': 'Vancouver, British Columbia',
            'urn:li:geo:105991330': 'Australia',
            'urn:li:geo:104769905': 'Sydney, Australia',
            'urn:li:geo:101452733': 'Melbourne, Australia',
            
            // Revenue ranges
            'urn:li:revenue:(0,0)': 'Under $1M annual revenue',
            'urn:li:revenue:(1,9)': '$1M-$9M annual revenue',
            'urn:li:revenue:(10,49)': '$10M-$49M annual revenue',
            'urn:li:revenue:(50,199)': '$50M-$199M annual revenue',
            'urn:li:revenue:(200,499)': '$200M-$499M annual revenue',
            'urn:li:revenue:(500,999)': '$500M-$999M annual revenue',
            'urn:li:revenue:(1000,2147483647)': '$1B+ annual revenue',
            
            // Company sizes
            'urn:li:companySize:A': '1 employee',
            'urn:li:companySize:B': '2-10 employees',
            'urn:li:companySize:C': '11-50 employees',
            'urn:li:companySize:D': '51-200 employees',
            'urn:li:companySize:E': '201-500 employees',
            'urn:li:companySize:F': '501-1000 employees',
            'urn:li:companySize:G': '1001-5000 employees',
            'urn:li:companySize:H': '5001-10000 employees',
            'urn:li:companySize:I': '10001+ employees',
            
            // Seniority levels
            'urn:li:seniority:1': 'Entry level',
            'urn:li:seniority:2': 'Mid-Senior level',
            'urn:li:seniority:3': 'Senior level',
            'urn:li:seniority:4': 'Director level',
            'urn:li:seniority:5': 'Executive level',
            'urn:li:seniority:6': 'VP level',
            'urn:li:seniority:7': 'CXO level',
            'urn:li:seniority:8': 'Partner level',
            'urn:li:seniority:9': 'Owner level',
            'urn:li:seniority:10': 'Founder level',
            
            // Common job functions
            'urn:li:jobFunction:1': 'Accounting/Auditing',
            'urn:li:jobFunction:2': 'Administrative',
            'urn:li:jobFunction:3': 'Advertising',
            'urn:li:jobFunction:4': 'Analyst',
            'urn:li:jobFunction:5': 'Art/Creative',
            'urn:li:jobFunction:6': 'Business Development',
            'urn:li:jobFunction:7': 'Consulting',
            'urn:li:jobFunction:8': 'Customer Service',
            'urn:li:jobFunction:9': 'Distribution',
            'urn:li:jobFunction:10': 'Design',
            'urn:li:jobFunction:11': 'Education',
            'urn:li:jobFunction:12': 'Engineering',
            'urn:li:jobFunction:13': 'Entrepreneurship',
            'urn:li:jobFunction:14': 'Finance',
            'urn:li:jobFunction:15': 'General Business',
            'urn:li:jobFunction:16': 'Healthcare Services',
            'urn:li:jobFunction:17': 'Human Resources',
            'urn:li:jobFunction:18': 'Information Technology',
            'urn:li:jobFunction:19': 'Legal',
            'urn:li:jobFunction:20': 'Marketing',
            'urn:li:jobFunction:21': 'Media & Communications',
            'urn:li:jobFunction:22': 'Military & Protective Services',
            'urn:li:jobFunction:23': 'Operations',
            'urn:li:jobFunction:24': 'Product Management',
            'urn:li:jobFunction:25': 'Project Management',
            'urn:li:jobFunction:26': 'Purchasing',
            'urn:li:jobFunction:27': 'Quality Assurance',
            'urn:li:jobFunction:28': 'Real Estate',
            'urn:li:jobFunction:29': 'Research',
            'urn:li:jobFunction:30': 'Sales',
            'urn:li:jobFunction:31': 'Support',
            'urn:li:jobFunction:32': 'Training',
            
            // Interface locales
            'urn:li:locale:en_US': 'English (US)',
            'urn:li:locale:en_GB': 'English (UK)',
            'urn:li:locale:fr_FR': 'French (France)',
            'urn:li:locale:de_DE': 'German (Germany)',
            'urn:li:locale:es_ES': 'Spanish (Spain)',
            
            // Common job titles (based on your campaign data)
            'urn:li:title:10164': 'Vice President',
            'urn:li:title:11278': 'Senior Vice President',
            'urn:li:title:117': 'Chief Executive Officer',
            'urn:li:title:1264': 'Chief Financial Officer',
            'urn:li:title:13474': 'Chief Technology Officer',
            'urn:li:title:13490': 'Chief Operating Officer',
            'urn:li:title:14624': 'Chief Information Officer',
            'urn:li:title:18286': 'Chief Marketing Officer',
            'urn:li:title:18830': 'Chief Revenue Officer',
            'urn:li:title:19330': 'Chief Product Officer',
            'urn:li:title:1791': 'President',
            'urn:li:title:422': 'Executive Vice President',
            'urn:li:title:2024': 'Managing Director',
            'urn:li:title:2126': 'Partner',
            'urn:li:title:2267': 'Principal',
            'urn:li:title:2822': 'General Manager',
            'urn:li:title:3294': 'Head of Marketing',
            'urn:li:title:3423': 'Head of Sales',
            'urn:li:title:3934': 'Director',
            'urn:li:title:4363': 'Senior Director',
            'urn:li:title:461': 'Operations Manager',
            'urn:li:title:4719': 'Product Manager',
            'urn:li:title:4969': 'Marketing Manager',
            'urn:li:title:5001': 'Sales Manager',
            'urn:li:title:562': 'Business Development Manager',
            'urn:li:title:5576': 'Engineering Manager',
            'urn:li:title:6005': 'Finance Manager',
            'urn:li:title:6127': 'HR Manager',
            'urn:li:title:6603': 'IT Manager',
            'urn:li:title:7514': 'Chief Data Officer',
            'urn:li:title:757': 'Chief Human Resources Officer',
            'urn:li:title:7622': 'Chief Digital Officer',
            'urn:li:title:8165': 'Chief Strategy Officer',
            'urn:li:title:8502': 'Chief Customer Officer',
            'urn:li:title:8563': 'Chief Innovation Officer',
            'urn:li:title:90': 'Founder',
            'urn:li:title:9589': 'Co-Founder',
            
            // Common industries
            'urn:li:industry:11': 'Agriculture',
            'urn:li:industry:127': 'Airlines/Aviation',
            'urn:li:industry:1324': 'Alternative Medicine',
            'urn:li:industry:143': 'Animation',
            'urn:li:industry:19': 'Apparel & Fashion',
            'urn:li:industry:48': 'Architecture & Planning',
            'urn:li:industry:49': 'Arts & Crafts',
            'urn:li:industry:50': 'Automotive',
            'urn:li:industry:68': 'Banking',
            'urn:li:industry:80': 'Broadcast Media',
            'urn:li:industry:88': 'Business Supplies',
            'urn:li:industry:96': 'Capital Markets',
            'urn:li:industry:99': 'Chemicals',
            'urn:li:industry:117': 'Civil Engineering',
            'urn:li:industry:118': 'Commercial Real Estate',
            'urn:li:industry:19': 'Computer Software',
            'urn:li:industry:120': 'Computer & Network Security',
            'urn:li:industry:1594': 'Computer Games',
            'urn:li:industry:96': 'Computer Hardware',
            'urn:li:industry:19': 'Computer Networking',
            'urn:li:industry:96': 'Computer Software',
            'urn:li:industry:135': 'Construction',
            'urn:li:industry:139': 'Consumer Electronics',
            'urn:li:industry:140': 'Consumer Goods',
            'urn:li:industry:141': 'Consumer Services',
            'urn:li:industry:147': 'Cosmetics',
            'urn:li:industry:150': 'Dairy',
            'urn:li:industry:157': 'Defense & Space',
            'urn:li:industry:67': 'Design',
            'urn:li:industry:69': 'E-Learning',
            'urn:li:industry:109': 'Education Management',
            'urn:li:industry:112': 'Electrical/Electronic Manufacturing',
            'urn:li:industry:3': 'Entertainment',
            'urn:li:industry:23': 'Environmental Services',
            'urn:li:industry:122': 'Events Services',
            'urn:li:industry:63': 'Executive Office',
            'urn:li:industry:64': 'Facilities Services',
            'urn:li:industry:65': 'Farming',
            'urn:li:industry:66': 'Financial Services',
            'urn:li:industry:43': 'Fine Art',
            'urn:li:industry:38': 'Fishery',
            'urn:li:industry:34': 'Food & Beverages',
            'urn:li:industry:23': 'Food Production',
            'urn:li:industry:40': 'Fundraising',
            'urn:li:industry:35': 'Furniture',
            'urn:li:industry:29': 'Gambling & Casinos',
            'urn:li:industry:145': 'Glass, Ceramics & Concrete',
            'urn:li:industry:75': 'Government Administration',
            'urn:li:industry:148': 'Government Relations',
            'urn:li:industry:140': 'Graphic Design',
            'urn:li:industry:124': 'Health, Wellness and Fitness',
            'urn:li:industry:14': 'Higher Education',
            'urn:li:industry:68': 'Hospital & Health Care',
            'urn:li:industry:31': 'Hospitality',
            'urn:li:industry:137': 'Human Resources',
            'urn:li:industry:134': 'Import and Export',
            'urn:li:industry:88': 'Individual & Family Services',
            'urn:li:industry:147': 'Industrial Automation',
            'urn:li:industry:84': 'Information Services',
            'urn:li:industry:96': 'Information Technology and Services',
            'urn:li:industry:42': 'Insurance',
            'urn:li:industry:74': 'International Affairs',
            'urn:li:industry:141': 'International Trade and Development',
            'urn:li:industry:6': 'Internet',
            'urn:li:industry:45': 'Investment Banking',
            'urn:li:industry:46': 'Investment Management',
            'urn:li:industry:17': 'Judiciary',
            'urn:li:industry:9': 'Law Enforcement',
            'urn:li:industry:10': 'Law Practice',
            'urn:li:industry:83': 'Legal Services',
            'urn:li:industry:85': 'Legislative Office',
            'urn:li:industry:86': 'Leisure, Travel & Tourism',
            'urn:li:industry:110': 'Libraries',
            'urn:li:industry:116': 'Logistics and Supply Chain',
            'urn:li:industry:143': 'Luxury Goods & Jewelry',
            'urn:li:industry:55': 'Machinery',
            'urn:li:industry:11': 'Management Consulting',
            'urn:li:industry:95': 'Maritime',
            'urn:li:industry:126': 'Market Research',
            'urn:li:industry:80': 'Marketing and Advertising',
            'urn:li:industry:135': 'Mechanical or Industrial Engineering',
            'urn:li:industry:126': 'Media Production',
            'urn:li:industry:17': 'Medical Devices',
            'urn:li:industry:13': 'Medical Practice',
            'urn:li:industry:139': 'Mental Health Care',
            'urn:li:industry:71': 'Military',
            'urn:li:industry:56': 'Mining & Metals',
            'urn:li:industry:35': 'Motion Pictures and Film',
            'urn:li:industry:28': 'Museums and Institutions',
            'urn:li:industry:1': 'Music',
            'urn:li:industry:99': 'Nanotechnology',
            'urn:li:industry:28': 'Newspapers',
            'urn:li:industry:144': 'Non-Profit Organization Management',
            'urn:li:industry:91': 'Oil & Energy',
            'urn:li:industry:113': 'Online Media',
            'urn:li:industry:123': 'Outsourcing/Offshoring',
            'urn:li:industry:87': 'Package/Freight Delivery',
            'urn:li:industry:146': 'Packaging and Containers',
            'urn:li:industry:61': 'Paper & Forest Products',
            'urn:li:industry:7': 'Performing Arts',
            'urn:li:industry:15': 'Pharmaceuticals',
            'urn:li:industry:131': 'Philanthropy',
            'urn:li:industry:136': 'Photography',
            'urn:li:industry:117': 'Plastics',
            'urn:li:industry:107': 'Political Organization',
            'urn:li:industry:67': 'Primary/Secondary Education',
            'urn:li:industry:83': 'Printing',
            'urn:li:industry:105': 'Professional Training & Coaching',
            'urn:li:industry:102': 'Program Development',
            'urn:li:industry:79': 'Public Policy',
            'urn:li:industry:98': 'Public Relations and Communications',
            'urn:li:industry:78': 'Public Safety',
            'urn:li:industry:82': 'Publishing',
            'urn:li:industry:62': 'Railroad Manufacture',
            'urn:li:industry:64': 'Ranching',
            'urn:li:industry:44': 'Real Estate',
            'urn:li:industry:40': 'Recreational Facilities and Services',
            'urn:li:industry:89': 'Religious Institutions',
            'urn:li:industry:72': 'Renewables & Environment',
            'urn:li:industry:70': 'Research',
            'urn:li:industry:32': 'Restaurants',
            'urn:li:industry:27': 'Retail',
            'urn:li:industry:121': 'Security and Investigations',
            'urn:li:industry:7': 'Semiconductors',
            'urn:li:industry:58': 'Shipbuilding',
            'urn:li:industry:20': 'Sporting Goods',
            'urn:li:industry:33': 'Sports',
            'urn:li:industry:104': 'Staffing and Recruiting',
            'urn:li:industry:22': 'Supermarkets',
            'urn:li:industry:8': 'Telecommunications',
            'urn:li:industry:60': 'Textiles',
            'urn:li:industry:130': 'Think Tanks',
            'urn:li:industry:21': 'Tobacco',
            'urn:li:industry:108': 'Translation and Localization',
            'urn:li:industry:92': 'Transportation/Trucking/Railroad',
            'urn:li:industry:59': 'Utilities',
            'urn:li:industry:106': 'Venture Capital & Private Equity',
            'urn:li:industry:16': 'Veterinary',
            'urn:li:industry:93': 'Warehousing',
            'urn:li:industry:133': 'Wholesale',
            'urn:li:industry:142': 'Wine and Spirits',
            'urn:li:industry:119': 'Wireless',
            'urn:li:industry:103': 'Writing and Editing',
            
            // Company sizes
            'urn:li:adTargetingFacet:companySizes': 'Company Size',
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
    }

    /**
     * Decode a single URN to human-readable text
     */
    async decodeURN(urn) {
        if (!urn || typeof urn !== 'string') {
            return urn;
        }

        // Check cache first
        if (this.cache.has(urn)) {
            return this.cache.get(urn);
        }

        // Check static mappings
        if (this.staticMappings[urn]) {
            const value = this.staticMappings[urn];
            this.cache.set(urn, value);
            return value;
        }

        // Check if request is already pending
        if (this.pendingRequests.has(urn)) {
            return this.pendingRequests.get(urn);
        }

        // Create pending request
        const promise = this._fetchURNValue(urn);
        this.pendingRequests.set(urn, promise);

        try {
            const result = await promise;
            this.cache.set(urn, result);
            return result;
        } finally {
            this.pendingRequests.delete(urn);
        }
    }

    /**
     * Decode multiple URNs in batch
     */
    async decodeURNs(urns) {
        if (!Array.isArray(urns)) {
            return {};
        }

        const results = {};
        const promises = urns.map(async (urn) => {
            results[urn] = await this.decodeURN(urn);
        });

        await Promise.allSettled(promises);
        return results;
    }

    /**
     * Fetch URN value from LinkedIn API with enhanced fallback logic
     */
    async _fetchURNValue(urn) {
        try {
            // First try intelligent parsing for common patterns
            const intelligentValue = this._intelligentParseURN(urn);
            if (intelligentValue) {
                console.log(`URN decoded intelligently: ${urn} -> ${intelligentValue}`);
                return intelligentValue;
            }

            // Extract facet type and ID from URN
            const { facetType, id } = this._parseURN(urn);
            
            if (!facetType || !id) {
                return this._fallbackURNValue(urn);
            }

            // Try to fetch from targeting entities API (but with timeout)
            console.log(`Attempting API decode for URN: ${urn}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            try {
                const response = await fetch(
                    `http://localhost:8001/api/linkedin/targeting/entities?facetType=${facetType}&q=${id}`,
                    { signal: controller.signal }
                );
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                
                if (data.elements && data.elements.length > 0) {
                    const entity = data.elements[0];
                    const name = entity.name || entity.localizedName;
                    if (name) {
                        console.log(`URN decoded via API: ${urn} -> ${name}`);
                        return name;
                    }
                }
            } catch (apiError) {
                clearTimeout(timeoutId);
                console.warn(`API decode failed for URN ${urn}:`, apiError.message);
                // Continue to fallback
            }

            return this._fallbackURNValue(urn);
        } catch (error) {
            console.warn('Failed to decode URN:', urn, error);
            return this._fallbackURNValue(urn);
        }
    }

    /**
     * Intelligent URN parsing for common patterns
     */
    _intelligentParseURN(urn) {
        // Extract meaningful information from URN patterns
        
        // Company URNs - extract company ID for display
        const companyMatch = urn.match(/^urn:li:company:(\d+)$/);
        if (companyMatch) {
            return `Company ${companyMatch[1]}`;
        }
        
        // Title URNs - extract title ID for display  
        const titleMatch = urn.match(/^urn:li:title:(\d+)$/);
        if (titleMatch) {
            return `Job Title ${titleMatch[1]}`;
        }
        
        // Industry URNs - extract industry ID for display
        const industryMatch = urn.match(/^urn:li:industry:(\d+)$/);
        if (industryMatch) {
            return `Industry ${industryMatch[1]}`;
        }
        
        // Skill URNs
        const skillMatch = urn.match(/^urn:li:skill:(\d+)$/);
        if (skillMatch) {
            return `Skill ${skillMatch[1]}`;
        }
        
        // School URNs
        const schoolMatch = urn.match(/^urn:li:school:(\d+)$/);
        if (schoolMatch) {
            return `School ${schoolMatch[1]}`;
        }
        
        // Geographic URNs
        const geoMatch = urn.match(/^urn:li:geo:(\d+)$/);
        if (geoMatch) {
            return `Location ${geoMatch[1]}`;
        }
        
        // Interface locales (already in static mappings but as backup)
        const localeMatch = urn.match(/^urn:li:locale:(.+)$/);
        if (localeMatch) {
            return `Language: ${localeMatch[1].replace('_', '-')}`;
        }
        
        return null;
    }

    /**
     * Parse URN to extract facet type and ID
     */
    _parseURN(urn) {
        const patterns = [
            // Job titles: urn:li:title:123
            { regex: /^urn:li:title:(\d+)$/, facetType: 'TITLE' },
            
            // Industries: urn:li:industry:123
            { regex: /^urn:li:industry:(\d+)$/, facetType: 'INDUSTRY' },
            
            // Organizations: urn:li:organization:123
            { regex: /^urn:li:organization:(\d+)$/, facetType: 'COMPANY' },
            
            // Organization brands: urn:li:organizationBrand:123
            { regex: /^urn:li:organizationBrand:(\d+)$/, facetType: 'COMPANY' },
            
            // Geographic locations: urn:li:geo:123
            { regex: /^urn:li:geo:(\d+)$/, facetType: 'LOCATION' },
            
            // Skills: urn:li:skill:123
            { regex: /^urn:li:skill:(\d+)$/, facetType: 'SKILL' },
            
            // Schools: urn:li:school:123
            { regex: /^urn:li:school:(\d+)$/, facetType: 'SCHOOL' },
            
            // Degrees: urn:li:degree:123
            { regex: /^urn:li:degree:(\d+)$/, facetType: 'DEGREE' },
            
            // Fields of study: urn:li:fieldOfStudy:123
            { regex: /^urn:li:fieldOfStudy:(\d+)$/, facetType: 'FIELD_OF_STUDY' }
        ];

        for (const pattern of patterns) {
            const match = urn.match(pattern.regex);
            if (match) {
                return {
                    facetType: pattern.facetType,
                    id: match[1]
                };
            }
        }

        return { facetType: null, id: null };
    }

    /**
     * Generate fallback value for URN
     */
    _fallbackURNValue(urn) {
        // Extract the last part of the URN as a fallback
        const parts = urn.split(':');
        const lastPart = parts[parts.length - 1];
        
        // If it's just a number, show it with context
        if (/^\d+$/.test(lastPart)) {
            const type = parts[2] || 'entity';
            return `${type.charAt(0).toUpperCase() + type.slice(1)} ${lastPart}`;
        }
        
        return lastPart || urn;
    }

    /**
     * Process targeting criteria and decode all URNs
     */
    async processTargetingCriteria(targetingCriteria) {
        if (!targetingCriteria) {
            return null;
        }

        const processed = {
            include: [],
            exclude: []
        };

        // Process include criteria
        if (targetingCriteria.include && targetingCriteria.include.and) {
            processed.include = await this._processTargetingGroup(targetingCriteria.include.and);
        }

        // Process exclude criteria
        if (targetingCriteria.exclude) {
            if (targetingCriteria.exclude.or) {
                processed.exclude = await this._processTargetingGroup([{ or: targetingCriteria.exclude.or }]);
            } else if (targetingCriteria.exclude.and) {
                processed.exclude = await this._processTargetingGroup(targetingCriteria.exclude.and);
            }
        }

        return processed;
    }

    /**
     * Process a group of targeting criteria
     */
    async _processTargetingGroup(group) {
        const processed = [];

        for (const item of group) {
            if (item.or) {
                const processedOr = await this._processOrGroup(item.or);
                if (processedOr.length > 0) {
                    processed.push(...processedOr);
                }
            }
        }

        return processed;
    }

    /**
     * Process an OR group of targeting criteria
     */
    async _processOrGroup(orGroup) {
        const processed = [];

        for (const [facetUrn, values] of Object.entries(orGroup)) {
            const facetType = this._extractFacetType(facetUrn);
            const decodedValues = await this.decodeURNs(values);
            
            processed.push({
                facetType,
                facetUrn,
                values: values.map(urn => ({
                    urn,
                    decoded: decodedValues[urn] || this._fallbackURNValue(urn)
                }))
            });
        }

        return processed;
    }

    /**
     * Extract facet type from facet URN
     */
    _extractFacetType(facetUrn) {
        const typeMap = {
            'urn:li:adTargetingFacet:titles': 'Job Titles',
            'urn:li:adTargetingFacet:employers': 'Companies',
            'urn:li:adTargetingFacet:industries': 'Industries',
            'urn:li:adTargetingFacet:profileLocations': 'Locations',
            'urn:li:adTargetingFacet:yearsOfExperienceRanges': 'Experience Level',
            'urn:li:adTargetingFacet:revenue': 'Company Revenue',
            'urn:li:adTargetingFacet:companySizes': 'Company Size',
            'urn:li:adTargetingFacet:interfaceLocales': 'Languages',
            'urn:li:adTargetingFacet:skills': 'Skills',
            'urn:li:adTargetingFacet:schools': 'Schools',
            'urn:li:adTargetingFacet:degrees': 'Degrees',
            'urn:li:adTargetingFacet:fieldsOfStudy': 'Fields of Study',
            'urn:li:adTargetingFacet:seniorities': 'Seniority Level',
            'urn:li:adTargetingFacet:audienceMatchingSegments': 'Audience Segments'
        };

        return typeMap[facetUrn] || facetUrn.replace('urn:li:adTargetingFacet:', '').replace(/([A-Z])/g, ' $1').trim();
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            pendingRequests: this.pendingRequests.size
        };
    }
}

// Create global instance
window.urnDecoder = new URNDecoder();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = URNDecoder;
}