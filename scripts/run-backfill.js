// Node.js script to run the backfill
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_CONFIG = {
    url: 'https://misuahtcociqkmkajvrw.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3VhaHRjb2NpcWtta2FqdnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4NzY4NCwiZXhwIjoyMDY2OTYzNjg0fQ.eI3NTRguummX2Fs4iaRA4a6vutDPV2av0at9pJRDlSc'
};

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function backfillEngagements() {
    const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    
    try {
        console.log('Starting backfill process...');
        
        // Get all posts
        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select('id, linkedin_url, created_at')
            .eq('tenant_id', DEFAULT_TENANT_ID);
        
        if (postsError) throw postsError;
        
        console.log(`Found ${posts.length} posts`);
        
        // Get all people with engagement scores
        const { data: people, error: peopleError } = await supabase
            .from('persons')
            .select('id, name, engagement_score, created_at')
            .eq('tenant_id', DEFAULT_TENANT_ID)
            .gt('engagement_score', 0);
        
        if (peopleError) throw peopleError;
        
        console.log(`Found ${people.length} people with engagement scores`);
        
        let engagementsCreated = 0;
        
        // For each person, link them to the most recent post
        for (const person of people) {
            const mostLikelyPost = posts.reduce((closest, post) => {
                const personTime = new Date(person.created_at);
                const postTime = new Date(post.created_at);
                const closestTime = new Date(closest.created_at);
                
                return Math.abs(postTime - personTime) < Math.abs(closestTime - personTime) ? post : closest;
            });
            
            // Check if engagement already exists
            const { data: existingEngagement } = await supabase
                .from('engagements')
                .select('id')
                .eq('post_id', mostLikelyPost.id)
                .eq('person_id', person.id)
                .eq('tenant_id', DEFAULT_TENANT_ID)
                .maybeSingle();
            
            if (!existingEngagement) {
                // Create engagement record
                const { error: engagementError } = await supabase
                    .from('engagements')
                    .insert({
                        post_id: mostLikelyPost.id,
                        person_id: person.id,
                        engagement_type: 'reaction',
                        reaction_type: 'like',
                        engaged_at: person.created_at,
                        tenant_id: DEFAULT_TENANT_ID
                    });
                
                if (engagementError) {
                    console.error('Error creating engagement:', engagementError);
                } else {
                    engagementsCreated++;
                }
            }
            
            if (engagementsCreated % 10 === 0) {
                console.log(`Created ${engagementsCreated} engagement records...`);
            }
        }
        
        console.log(`✅ Backfill Complete! Created ${engagementsCreated} engagement records`);
        
    } catch (error) {
        console.error('❌ Backfill error:', error);
    }
}

backfillEngagements();