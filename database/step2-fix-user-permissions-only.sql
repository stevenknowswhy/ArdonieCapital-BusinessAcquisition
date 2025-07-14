-- STEP 2 ONLY: FIX USER PERMISSIONS
-- Run this after Step 1 completes successfully
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- CHECK CURRENT USER STATE
-- ============================================================================

-- Check if user exists in auth.users
SELECT 
    'USER_EXISTS_CHECK' as check_type,
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'reforiy538@iamtile.com'
    ) as user_exists_in_auth;

-- Check if user has profile
SELECT 
    'PROFILE_EXISTS_CHECK' as check_type,
    au.email,
    p.id as profile_id,
    p.role as current_role,
    p.first_name,
    p.last_name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE au.email = 'reforiy538@iamtile.com';

-- Check available user roles
SELECT 
    'AVAILABLE_ROLES' as check_type,
    unnest(enum_range(NULL::user_role)) as available_role;

-- ============================================================================
-- UPDATE USER PERMISSIONS
-- ============================================================================

-- Update user permissions for content creation (using 'admin' role)
UPDATE profiles 
SET 
    role = 'admin',
    first_name = 'Content',
    last_name = 'Manager',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'reforiy538@iamtile.com'
);

-- Create profile if it doesn't exist
INSERT INTO profiles (id, user_id, first_name, last_name, role, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    au.id,
    'Content',
    'Manager',
    'admin',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'reforiy538@iamtile.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = au.id
);

-- ============================================================================
-- VERIFY USER PERMISSIONS
-- ============================================================================

-- Check updated user permissions
SELECT 
    '✅ STEP 2 VERIFICATION' as status,
    au.email,
    p.role,
    p.first_name,
    p.last_name,
    p.id as profile_id
FROM profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'reforiy538@iamtile.com';

-- Verify the user can be used as author_id
SELECT 
    'AUTHOR_ID_CHECK' as result,
    p.id as author_uuid,
    'READY_FOR_CONTENT_CREATION' as status
FROM profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'reforiy538@iamtile.com';

-- Final success message
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM profiles p 
            JOIN auth.users au ON p.user_id = au.id 
            WHERE au.email = 'reforiy538@iamtile.com' 
            AND p.role = 'admin'
        )
        THEN '✅ STEP 2 COMPLETE: User permissions updated to admin'
        ELSE '❌ STEP 2 FAILED: User permissions not updated correctly'
    END as final_status;
