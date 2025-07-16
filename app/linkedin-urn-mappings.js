// LinkedIn URN to Human-Readable Name Mappings
// Based on common LinkedIn targeting URNs

const LINKEDIN_URN_MAPPINGS = {
    // Industry URNs (urn:li:industry:*)
    industries: {
        1: "Accounting",
        3: "Airlines/Aviation",
        4: "Alternative Dispute Resolution",
        5: "Alternative Medicine",
        6: "Animation",
        7: "Apparel & Fashion",
        8: "Architecture & Planning",
        9: "Arts & Crafts",
        10: "Automotive",
        11: "Aviation & Aerospace",
        12: "Banking",
        13: "Biotechnology",
        14: "Broadcast Media",
        15: "Building Materials",
        16: "Business Supplies & Equipment",
        17: "Capital Markets",
        18: "Chemicals",
        19: "Civic & Social Organization",
        20: "Civil Engineering",
        21: "Commercial Real Estate",
        22: "Computer & Network Security",
        23: "Computer Games",
        24: "Computer Hardware",
        25: "Computer Networking",
        26: "Computer Software",
        27: "Construction",
        28: "Consumer Electronics",
        29: "Consumer Goods",
        30: "Consumer Services",
        31: "Cosmetics",
        32: "Dairy",
        33: "Defense & Space",
        34: "Design",
        35: "E-Learning",
        36: "Education Management",
        37: "Electrical/Electronic Manufacturing",
        38: "Entertainment",
        39: "Environmental Services",
        40: "Events Services",
        41: "Executive Office",
        42: "Facilities Services",
        43: "Farming",
        44: "Financial Services",
        45: "Fine Art",
        46: "Fishery",
        47: "Food & Beverages",
        48: "Food Production",
        49: "Fund-Raising",
        50: "Furniture",
        51: "Gambling & Casinos",
        52: "Glass, Ceramics & Concrete",
        53: "Government Administration",
        54: "Government Relations",
        55: "Graphic Design",
        56: "Health, Wellness & Fitness",
        57: "Higher Education",
        58: "Hospital & Health Care",
        59: "Hospitality",
        60: "Human Resources",
        61: "Import & Export",
        62: "Individual & Family Services",
        63: "Industrial Automation",
        64: "Information Services",
        65: "Information Technology & Services",
        66: "Insurance",
        67: "International Affairs",
        68: "International Trade & Development",
        69: "Internet",
        70: "Investment Banking",
        71: "Investment Management",
        72: "Judiciary",
        73: "Law Enforcement",
        74: "Law Practice",
        75: "Legal Services",
        76: "Legislative Office",
        77: "Leisure, Travel & Tourism",
        78: "Libraries",
        79: "Logistics & Supply Chain",
        80: "Luxury Goods & Jewelry",
        81: "Machinery",
        82: "Management Consulting",
        83: "Maritime",
        84: "Marketing & Advertising",
        85: "Market Research",
        86: "Mechanical or Industrial Engineering",
        87: "Media Production",
        88: "Medical Device",
        89: "Medical Practice",
        90: "Mental Health Care",
        91: "Military",
        92: "Mining & Metals",
        93: "Motion Pictures & Film",
        94: "Museums & Institutions",
        95: "Music",
        96: "Nanotechnology",
        97: "Newspapers",
        98: "Nonprofit Organization Management",
        99: "Oil & Energy",
        100: "Online Media",
        101: "Outsourcing/Offshoring",
        102: "Package/Freight Delivery",
        103: "Packaging & Containers",
        104: "Paper & Forest Products",
        105: "Performing Arts",
        106: "Pharmaceuticals",
        107: "Philanthropy",
        108: "Photography",
        109: "Plastics",
        110: "Political Organization",
        111: "Primary/Secondary Education",
        112: "Printing",
        113: "Professional Training & Coaching",
        114: "Program Development",
        115: "Public Policy",
        116: "Public Relations & Communications",
        117: "Public Safety",
        118: "Publishing",
        119: "Railroad Manufacture",
        120: "Ranching",
        121: "Real Estate",
        122: "Recreational Facilities & Services",
        123: "Religious Institutions",
        124: "Renewables & Environment",
        125: "Research",
        126: "Restaurants",
        127: "Retail",
        128: "Security & Investigations",
        129: "Semiconductors",
        130: "Shipbuilding",
        131: "Sporting Goods",
        132: "Sports",
        133: "Staffing & Recruiting",
        134: "Supermarkets",
        135: "Telecommunications",
        136: "Textiles",
        137: "Think Tanks",
        138: "Tobacco",
        139: "Translation & Localization",
        140: "Transportation/Trucking/Railroad",
        141: "Utilities",
        142: "Venture Capital & Private Equity",
        143: "Veterinary",
        144: "Warehousing",
        145: "Wholesale",
        146: "Wine & Spirits",
        147: "Wireless",
        148: "Writing & Editing",
        3133: "Animation",
        6300: "Software Development"
    },
    
    // Seniority URNs (urn:li:seniority:*)
    seniorities: {
        1: "Unpaid",
        2: "Training",
        3: "Entry level",
        4: "Senior",
        5: "Manager",
        6: "Director",
        7: "VP",
        8: "CXO",
        9: "Partner",
        10: "Owner"
    },
    
    // Job Function URNs (urn:li:function:*)
    jobFunctions: {
        1: "Accounting",
        2: "Administrative",
        3: "Arts and Design",
        4: "Business Development",
        5: "Community & Social Services",
        6: "Consulting",
        7: "Education",
        8: "Engineering",
        9: "Entrepreneurship",
        10: "Finance",
        11: "Healthcare Services",
        12: "Human Resources",
        13: "Information Technology",
        14: "Legal",
        15: "Marketing",
        16: "Media & Communications",
        17: "Military & Protective Services",
        18: "Operations",
        19: "Product Management",
        20: "Program & Project Management",
        21: "Purchasing",
        22: "Quality Assurance",
        23: "Real Estate",
        24: "Research",
        25: "Sales",
        26: "Support"
    },
    
    // Common Organization/Company URNs (urn:li:organization:*)
    organizations: {
        1009: "Accenture",
        1035: "Microsoft",
        10667: "Apple",
        1441: "Google",
        1480: "Adobe",
        1586: "Amazon",
        1612748: "Netflix",
        16140: "Airbnb",
        162479: "Facebook (Meta)",
        165158: "Salesforce",
        167251: "Uber",
        1815218: "Slack",
        207470: "Oracle",
        2135371: "Spotify",
        2382910: "Stripe",
        2470: "Deloitte",
        10766: "LinkedIn",
        1419: "IBM",
        1594: "Intel",
        1711: "Cisco",
        2029: "PayPal",
        2289109: "Dropbox",
        15564: "Twitter",
        33215: "Tesla",
        17900793: "Zoom",
        73883: "Shopify",
        404057: "Pinterest",
        3887: "Yahoo",
        7674: "eBay",
        61068: "Square",
        1482: "Walmart",
        157240: "Mastercard",
        166686: "Visa",
        7203: "Boeing",
        1384: "Goldman Sachs",
        1038: "Morgan Stanley",
        1063: "Bank of America",
        1448: "Wells Fargo",
        3549: "American Express"
    },
    
    // Common Geo Location URNs (urn:li:geo:*)
    geoLocations: {
        103644278: "United States",
        102257491: "United Kingdom", 
        102571732: "Germany",
        105015875: "France",
        106057199: "Spain",
        103350503: "Italy",
        100025096: "Canada",
        101174742: "Australia",
        104738515: "Netherlands",
        106693272: "Switzerland",
        105646813: "Sweden",
        104514075: "Belgium",
        100565514: "China",
        102890719: "India",
        101355337: "Japan",
        105490917: "Singapore",
        103104382: "Israel",
        104727230: "Ireland",
        // US States
        102095887: "California",
        105080838: "New York",
        102748797: "Texas",
        103977389: "Florida",
        102977669: "Illinois"
    }
};

// Helper functions to resolve URNs
function resolveIndustryURN(urn) {
    const match = urn.match(/urn:li:industry:(\d+)/);
    if (match) {
        const id = match[1];
        return LINKEDIN_URN_MAPPINGS.industries[id] || `Industry ${id}`;
    }
    return urn;
}

function resolveSeniorityURN(urn) {
    const match = urn.match(/urn:li:seniority:(\d+)/);
    if (match) {
        const id = match[1];
        return LINKEDIN_URN_MAPPINGS.seniorities[id] || `Seniority ${id}`;
    }
    return urn;
}

function resolveJobFunctionURN(urn) {
    const match = urn.match(/urn:li:function:(\d+)/);
    if (match) {
        const id = match[1];
        return LINKEDIN_URN_MAPPINGS.jobFunctions[id] || `Function ${id}`;
    }
    return urn;
}

function resolveGeoLocationURN(urn) {
    const match = urn.match(/urn:li:geo:(\d+)/);
    if (match) {
        const id = match[1];
        return LINKEDIN_URN_MAPPINGS.geoLocations[id] || `Location ${id}`;
    }
    return urn;
}

function resolveOrganizationURN(urn) {
    // Handle both organization and organizationBrand URNs
    const match = urn.match(/urn:li:organization(?:Brand)?:(\d+)/);
    if (match) {
        const id = match[1];
        return LINKEDIN_URN_MAPPINGS.organizations[id] || `Organization ${id}`;
    }
    return urn;
}

// General URN resolver
function resolveLinkedInURN(urn) {
    if (typeof urn !== 'string') return urn;
    
    if (urn.includes('urn:li:industry:')) {
        return resolveIndustryURN(urn);
    } else if (urn.includes('urn:li:seniority:')) {
        return resolveSeniorityURN(urn);
    } else if (urn.includes('urn:li:function:')) {
        return resolveJobFunctionURN(urn);
    } else if (urn.includes('urn:li:geo:')) {
        return resolveGeoLocationURN(urn);
    } else if (urn.includes('urn:li:organization')) {
        return resolveOrganizationURN(urn);
    }
    
    return urn;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LINKEDIN_URN_MAPPINGS,
        resolveIndustryURN,
        resolveSeniorityURN,
        resolveJobFunctionURN,
        resolveGeoLocationURN,
        resolveLinkedInURN
    };
}