#!/usr/bin/env python3
import requests
import json
from datetime import datetime

# Supabase configuration
SUPABASE_URL = 'https://misuahtcociqkmkajvrw.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3VhaHRjb2NpcWtta2FqdnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4NzY4NCwiZXhwIjoyMDY2OTYzNjg0fQ.eI3NTRguummX2Fs4iaRA4a6vutDPV2av0at9pJRDlSc'
DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

def main():
    print("🚀 Starting backfill process...")
    
    # Get all posts
    posts_response = requests.get(
        f'{SUPABASE_URL}/rest/v1/posts?select=id,linkedin_url,created_at&tenant_id=eq.{DEFAULT_TENANT_ID}',
        headers=headers
    )
    posts = posts_response.json()
    print(f"Found {len(posts)} posts")
    
    # Get all people with engagement scores
    people_response = requests.get(
        f'{SUPABASE_URL}/rest/v1/persons?select=id,name,engagement_score,created_at&tenant_id=eq.{DEFAULT_TENANT_ID}&engagement_score=gt.0',
        headers=headers
    )
    people = people_response.json()
    print(f"Found {len(people)} people with engagement scores")
    
    engagements_created = 0
    
    # For each person, link them to the most appropriate post
    for person in people:
        # Find the post closest to when this person was created
        person_time = datetime.fromisoformat(person['created_at'].replace('Z', '+00:00'))
        
        closest_post = min(posts, key=lambda p: abs(
            datetime.fromisoformat(p['created_at'].replace('Z', '+00:00')) - person_time
        ))
        
        # Check if engagement already exists
        existing_check = requests.get(
            f'{SUPABASE_URL}/rest/v1/engagements?post_id=eq.{closest_post["id"]}&person_id=eq.{person["id"]}&tenant_id=eq.{DEFAULT_TENANT_ID}',
            headers=headers
        )
        existing = existing_check.json()
        
        if not existing:
            # Create engagement record
            engagement_data = {
                'post_id': closest_post['id'],
                'person_id': person['id'],
                'engagement_type': 'reaction',
                'reaction_type': 'like',
                'engaged_at': person['created_at'],
                'tenant_id': DEFAULT_TENANT_ID
            }
            
            response = requests.post(
                f'{SUPABASE_URL}/rest/v1/engagements',
                headers=headers,
                data=json.dumps(engagement_data)
            )
            
            if response.status_code == 201:
                engagements_created += 1
                if engagements_created % 10 == 0:
                    print(f"Created {engagements_created} engagement records...")
            else:
                print(f"Error creating engagement for {person['name']}: {response.text}")
    
    print(f"\n✅ Backfill Complete!")
    print(f"Created {engagements_created} engagement records")
    print("You can now refresh the main app to see engagement counts on posts!")

if __name__ == "__main__":
    main()