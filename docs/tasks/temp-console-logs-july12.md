post-analysis.html?id=2:2337 Sidebar HTML inserted into container
post-analysis.html?id=2:2341 Sidebar initialization complete
post-analysis.html?id=2:2383 Sidebar loaded successfully
post-analysis.html?id=2:2387 Starting app initialization...
post-analysis.html?id=2:275 🚀 Initializing post analysis app...
post-analysis.html?id=2:276 📱 App object status: object
post-analysis.html?id=2:277 📊 Window objects available: {supabase: 'object', SUPABASE_CONFIG: 'object', DEFAULT_TENANT_ID: 'string'}DEFAULT_TENANT_ID: "string"SUPABASE_CONFIG: "object"supabase: "object"[[Prototype]]: Object
post-analysis.html?id=2:287 🔗 URL parameters: ?id=2
post-analysis.html?id=2:288 📋 Post ID extracted: 2
post-analysis.html?id=2:294 ✅ Post ID from URL: 2
post-analysis.html?id=2:298 Supabase client initialized
post-analysis.html?id=2:302 Checking service availability...
post-analysis.html?id=2:306 ✅ LinkedIn API service initialized
post-analysis.html?id=2:313 ✅ Campaign linker service initialized
post-analysis.html?id=2:320 ✅ Targeting resolver service initialized
post-analysis.html?id=2:327 ✅ LinkedIn URN mappings loaded
post-analysis.html?id=2:332 Service initialization complete
post-analysis.html?id=2:338 Loading post data...
post-analysis.html?id=2:390 Loading post with ID: 2
post-analysis.html?id=2:406 ✅ Loaded post: {id: 2, url: 'https://www.linkedin.com/posts/andrewvucko_in-hous…te-in-isolation-activity-7340730358725808129-gOrz', linkedin_url: 'https://www.linkedin.com/posts/andrewvucko_in-hous…te-in-isolation-activity-7340730358725808129-gOrz', account_type: 'company', account_name: null, …}account_name: nullaccount_type: "company"audience_id: nullcampaign_clicks: nullcampaign_id: nullcampaign_impressions: nullcampaign_spend: nullcampaign_strategy: nullcontent_calendar_id: nullcontent_preview: nullcontent_type_id: nullcreated_at: "2025-07-09T12:25:14.195907+00:00"description: nullextracted_from_campaign: falseid: 2is_organic: falseis_paid: falseis_pinned: falselinkedin_campaign_id: 751420716linkedin_creative_id: nulllinkedin_share_urn: nulllinkedin_url: "https://www.linkedin.com/posts/andrewvucko_in-house-teams-shouldnt-operate-in-isolation-activity-7340730358725808129-gOrz"name: nullnotes: nullperformance_score: nullpersona_ids: nullpost_title: nullposted_date: "2025-07-09T12:25:14.195907+00:00"primary_audience_id: nullscheduled_date: nulltags: []tenant_id: "00000000-0000-0000-0000-000000000001"true_cost_per_engagement: nullupdated_at: "2025-07-09T12:25:14.195907+00:00"url: "https://www.linkedin.com/posts/andrewvucko_in-house-teams-shouldnt-operate-in-isolation-activity-7340730358725808129-gOrz"[[Prototype]]: Object
post-analysis.html?id=2:341 Loading engagements...
post-analysis.html?id=2:416 🔍 Loading engagements for post ID: 2
post-analysis.html?id=2:424 📊 Total engagements in DB for post: 162
post-analysis.html?id=2:455 ✅ Loaded engagements with person data: 162
post-analysis.html?id=2:465 📋 Sample engagement with person: {id: 303, post_id: 2, person_id: 3805, engagement_type: 'reaction', reaction_type: 'celebrate', …}action_status: "new"attributed_to_segment_id: nullattribution_confidence: 0.5comment_text: nullcreated_at: "2025-07-09T18:22:07.489569+00:00"engaged_at: "2025-07-09T18:22:07.489569+00:00"engagement_type: "reaction"id: 303person: {id: 3805, name: 'King Chun Michael Wong', headline: 'Visual Designer', is_notable: false, is_follower: false, …}person_id: 3805post_id: 2reaction_type: "celebrate"tenant_id: "00000000-0000-0000-0000-000000000001"[[Prototype]]: Object
post-analysis.html?id=2:468 🎯 Expected ~283 from Apify, got: 162
post-analysis.html?id=2:477 📊 DATA BREAKDOWN:
post-analysis.html?id=2:478   - Total engagements loaded: 162
post-analysis.html?id=2:479   - With person data: 162
post-analysis.html?id=2:480   - Without person data: 0
post-analysis.html?id=2:481   - Expected from Apify: 283
post-analysis.html?id=2:482   - Showing in UI: 162 (filtered out 0 missing persons)
post-analysis.html?id=2:343 ✅ Engagements loaded, count: 162
post-analysis.html?id=2:345 Rendering post...
post-analysis.html?id=2:348 Rendering metrics...
post-analysis.html?id=2:351 Rendering signals...
post-analysis.html?id=2:354 Populating filters...
post-analysis.html?id=2:357 Applying filters...
post-analysis.html?id=2:1715 🔍 applyFilters called
post-analysis.html?id=2:1771 📊 updateCounts called
post-analysis.html?id=2:1793 🔄 renderTable called, engagements: 162 filtered: 162
post-analysis.html?id=2:1803 📋 Page engagements to render: 50
post-analysis.html?id=2:359 ✅ Filters applied, filtered count: 162
post-analysis.html?id=2:362 Loading campaign demographics...
campaign-targeting-resolver.js:12 Looking up campaign: 255144676
campaign-post-linker.js:161 📊 Aggregating demographics for campaigns: 751420716, 255144676, 255703466
campaign-targeting-resolver.js:26 Found campaign in database: Vucko.co Website Relaunch - Awareness / Video Asset
campaign-targeting-resolver.js:12 Looking up campaign: 255703466
campaign-post-linker.js:171 No analytics data found
post-analysis.html?id=2:882 No analytics data found, fetching from LinkedIn API...
linkedin-api.js:245 Fetching demographics for campaign 751420716...
linkedin-api.js:254 Fetching MEMBER_COMPANY data...
campaign-targeting-resolver.js:26 Found campaign in database: Are we positioned for the future of motion? 🔎 Our approach to rebranding centered
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A751420716%29&pivot=MEMBER_COMPANY&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_COMPANY data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:254 Fetching MEMBER_JOB_TITLE data...
d8q4afz60d64szrfxzxcwphd6:14 VIDEOJS: WARN: Using the tech directly can be dangerous. I hope you know what you're doing.
See https://github.com/videojs/video.js/issues/2617 for more info.

(anonymous) @ d8q4afz60d64szrfxzxcwphd6:14
r.warn @ d8q4afz60d64szrfxzxcwphd6:14
i.tech @ d8q4afz60d64szrfxzxcwphd6:14
value @ d8q4afz60d64szrfxzxcwphd6:21
Za.n.dispatcher.n.dispatcher @ d8q4afz60d64szrfxzxcwphd6:14
ts @ d8q4afz60d64szrfxzxcwphd6:14
trigger @ d8q4afz60d64szrfxzxcwphd6:14
i.handleTechSourceset_ @ d8q4afz60d64szrfxzxcwphd6:14
(anonymous) @ d8q4afz60d64szrfxzxcwphd6:14
Za.n.dispatcher.n.dispatcher @ d8q4afz60d64szrfxzxcwphd6:14
ts @ d8q4afz60d64szrfxzxcwphd6:14
trigger @ d8q4afz60d64szrfxzxcwphd6:14
i.triggerSourceset @ d8q4afz60d64szrfxzxcwphd6:14
set @ d8q4afz60d64szrfxzxcwphd6:14
forEach.cl.<computed> @ d8q4afz60d64szrfxzxcwphd6:14
cl.nativeSourceHandler.handleSource @ d8q4afz60d64szrfxzxcwphd6:14
e.setSource @ d8q4afz60d64szrfxzxcwphd6:14
(anonymous) @ d8q4afz60d64szrfxzxcwphd6:14
t.ready @ d8q4afz60d64szrfxzxcwphd6:14
i.techCall_ @ d8q4afz60d64szrfxzxcwphd6:14
(anonymous) @ d8q4afz60d64szrfxzxcwphd6:14
t.ready @ d8q4afz60d64szrfxzxcwphd6:14
i.src_ @ d8q4afz60d64szrfxzxcwphd6:14
(anonymous) @ d8q4afz60d64szrfxzxcwphd6:14
e @ d8q4afz60d64szrfxzxcwphd6:14
e @ d8q4afz60d64szrfxzxcwphd6:14
(anonymous) @ d8q4afz60d64szrfxzxcwphd6:14
(anonymous) @ d8q4afz60d64szrfxzxcwphd6:14
setTimeout
t.setTimeout @ d8q4afz60d64szrfxzxcwphd6:14
bo @ d8q4afz60d64szrfxzxcwphd6:14
i.handleSrc_ @ d8q4afz60d64szrfxzxcwphd6:14
i.src @ d8q4afz60d64szrfxzxcwphd6:14
(anonymous) @ 9bqpxl62nwtb3q0iiuwp77q6d:2
Promise.then
Ea @ 9bqpxl62nwtb3q0iiuwp77q6d:2
_initNativeVideo @ 9bqpxl62nwtb3q0iiuwp77q6d:2
av @ 9bqpxl62nwtb3q0iiuwp77q6d:2
(anonymous) @ 9bqpxl62nwtb3q0iiuwp77q6d:2
n @ 9bqpxl62nwtb3q0iiuwp77q6d:2
(anonymous) @ 9bqpxl62nwtb3q0iiuwp77q6d:2
(anonymous) @ 9bqpxl62nwtb3q0iiuwp77q6d:2
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A751420716%29&pivot=MEMBER_JOB_TITLE&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_JOB_TITLE data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:254 Fetching MEMBER_SENIORITY data...
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A751420716%29&pivot=MEMBER_SENIORITY&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_SENIORITY data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:254 Fetching MEMBER_INDUSTRY data...
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A751420716%29&pivot=MEMBER_INDUSTRY&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_INDUSTRY data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:285 No analytics data available for campaign 751420716
post-analysis.html?id=2:893 ✅ Fetched analytics for campaign 751420716
linkedin-api.js:245 Fetching demographics for campaign 255144676...
linkedin-api.js:254 Fetching MEMBER_COMPANY data...
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A255144676%29&pivot=MEMBER_COMPANY&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_COMPANY data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:254 Fetching MEMBER_JOB_TITLE data...
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A255144676%29&pivot=MEMBER_JOB_TITLE&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_JOB_TITLE data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:254 Fetching MEMBER_SENIORITY data...
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A255144676%29&pivot=MEMBER_SENIORITY&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_SENIORITY data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:254 Fetching MEMBER_INDUSTRY data...
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A255144676%29&pivot=MEMBER_INDUSTRY&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_INDUSTRY data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:285 No analytics data available for campaign 255144676
post-analysis.html?id=2:893 ✅ Fetched analytics for campaign 255144676
linkedin-api.js:245 Fetching demographics for campaign 255703466...
linkedin-api.js:254 Fetching MEMBER_COMPANY data...
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A255703466%29&pivot=MEMBER_COMPANY&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_COMPANY data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:254 Fetching MEMBER_JOB_TITLE data...
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A255703466%29&pivot=MEMBER_JOB_TITLE&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_JOB_TITLE data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:254 Fetching MEMBER_SENIORITY data...
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A255703466%29&pivot=MEMBER_SENIORITY&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_SENIORITY data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:254 Fetching MEMBER_INDUSTRY data...
linkedin-api.js:27  GET http://localhost:8001/api/linkedin/proxy/adAnalytics?q=analytics&campaigns=List%28urn%3Ali%3AsponsoredCampaign%3A255703466%29&pivot=MEMBER_INDUSTRY&fields=impressions&fields=clicks&fields=spend&fields=costInUsd&timeGranularity=ALL 400 (Bad Request)
request @ linkedin-api.js:27
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:36 LinkedIn API Request Failed: Error: API Error: 400 Bad Request - Invalid query parameters passed to request
    at LinkedInAPI.request (linkedin-api.js:31:23)
    at async LinkedInAPI.fetchAndStoreCampaignDemographics (linkedin-api.js:255:43)
    at async Object.loadCampaignDemographics (post-analysis.html?id=2:892:37)
    at async Object.init (post-analysis.html?id=2:364:25)
    at async HTMLDocument.<anonymous> (post-analysis.html?id=2:2390:17)
request @ linkedin-api.js:36
await in request
getCampaignAnalytics @ linkedin-api.js:145
fetchAndStoreCampaignDemographics @ linkedin-api.js:255
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:266 Failed to fetch MEMBER_INDUSTRY data: API Error: 400 Bad Request - Invalid query parameters passed to request
fetchAndStoreCampaignDemographics @ linkedin-api.js:266
await in fetchAndStoreCampaignDemographics
loadCampaignDemographics @ post-analysis.html?id=2:892
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
linkedin-api.js:285 No analytics data available for campaign 255703466
post-analysis.html?id=2:893 ✅ Fetched analytics for campaign 255703466
campaign-post-linker.js:161 📊 Aggregating demographics for campaigns: 751420716, 255144676, 255703466
campaign-post-linker.js:171 No analytics data found
post-analysis.html?id=2:943 Fetching analytics for active campaigns: (2) ['417151635', '417762456']
post-analysis.html?id=2:1295 Fetching enhanced LinkedIn campaign analytics for: (2) ['417151635', '417762456']
post-analysis.html?id=2:1311  GET http://localhost:8001/api/linkedin/campaigns/417151635/demographics 404 (Not Found)
fetchLinkedInCampaignAnalytics @ post-analysis.html?id=2:1311
await in fetchLinkedInCampaignAnalytics
loadCampaignDemographics @ post-analysis.html?id=2:1110
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
post-analysis.html?id=2:1367 Error fetching campaign 417151635: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
fetchLinkedInCampaignAnalytics @ post-analysis.html?id=2:1367
await in fetchLinkedInCampaignAnalytics
loadCampaignDemographics @ post-analysis.html?id=2:1110
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
post-analysis.html?id=2:1311  GET http://localhost:8001/api/linkedin/campaigns/417762456/demographics 404 (Not Found)
fetchLinkedInCampaignAnalytics @ post-analysis.html?id=2:1311
await in fetchLinkedInCampaignAnalytics
loadCampaignDemographics @ post-analysis.html?id=2:1110
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
post-analysis.html?id=2:1367 Error fetching campaign 417762456: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
fetchLinkedInCampaignAnalytics @ post-analysis.html?id=2:1367
await in fetchLinkedInCampaignAnalytics
loadCampaignDemographics @ post-analysis.html?id=2:1110
await in loadCampaignDemographics
init @ post-analysis.html?id=2:364
await in init
(anonymous) @ post-analysis.html?id=2:2390
post-analysis.html?id=2:1112 LinkedIn API data received: {campaigns: Array(2), demographics: {…}}
post-analysis.html?id=2:365 Campaign demographics loaded
post-analysis.html?id=2:377 Search input event listener attached
post-analysis.html?id=2:380 ✅ Post analysis app initialized successfully
post-analysis.html?id=2:2391 App initialized successfully
post-analysis.html?id=2:2407 The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://developer.chrome.com/blog/autoplay/#web_audio