-- Fix Profile Photo Field Mismatch
-- Some records may have photos in profile_image_url instead of profile_picture

-- First, check how many records have this issue
SELECT 
    COUNT(*) as total,
    COUNT(profile_picture) as has_profile_picture,
    COUNT(profile_image_url) as has_profile_image_url
FROM persons
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Copy profile_image_url to profile_picture where needed
UPDATE persons
SET profile_picture = profile_image_url
WHERE profile_picture IS NULL 
AND profile_image_url IS NOT NULL
AND tenant_id = '00000000-0000-0000-0000-000000000001';

-- Verify the fix
SELECT 
    COUNT(*) as total_with_photos
FROM persons
WHERE profile_picture IS NOT NULL
AND tenant_id = '00000000-0000-0000-0000-000000000001';

-- Optional: Clear the old field to avoid confusion
-- UPDATE persons SET profile_image_url = NULL WHERE profile_picture IS NOT NULL;