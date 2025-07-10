// Supabase Configuration - EXAMPLE FILE
// Copy this to config.js and fill in your actual values

const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_PROJECT_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

// Apify Configuration
const APIFY_CONFIG = {
    token: 'YOUR_APIFY_API_TOKEN',
    actorId: 'curious_coder/linkedin-post-reactions-scraper'
};

// Test Data
const TEST_RUN_ID = 'qEDjxfcGtjl6vcMZk';
const TEST_POST_URL = 'https://www.linkedin.com/posts/andrewvucko_in-house-teams-shouldnt-operate-in-isolation-activity-7340730358725808129-gOrz';

// Default tenant ID - required by database constraints
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// LinkedIn API Configuration
const LINKEDIN_CONFIG = {
    accessToken: 'YOUR_LINKEDIN_ACCESS_TOKEN',
    refreshToken: 'YOUR_LINKEDIN_REFRESH_TOKEN',
    baseUrl: 'https://api.linkedin.com/rest',
    version: '202501'
};