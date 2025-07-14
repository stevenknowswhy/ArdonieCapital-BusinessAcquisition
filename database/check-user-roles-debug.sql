-- CHECK USER ROLES AND ADMIN NAVIGATION DEBUG
-- This script checks user roles and helps debug admin navigation issues
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- CHECK CURRENT USER ROLES IN DATABASE
-- ============================================================================

-- Check all available user roles (enum values)
SELECT 
    'AVAILABLE_USER_ROLES' as check_type,
    unnest(enum_range(NULL::user_role)) as available_role
ORDER BY available_role;

-- Check all users and their roles
SELECT 
    'ALL_USERS_AND_ROLES' as check_type,
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at,
    p.updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
ORDER BY au.email;

-- Check specific test user
SELECT 
    'TEST_USER_DETAILS' as check_type,
    au.id as user_id,
    au.email,
    au.email_confirmed_at,
    au.created_at as auth_created,
    p.id as profile_id,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at as profile_created,
    p.updated_at as profile_updated
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE au.email = 'reforiy538@iamtile.com';

-- Check if test user has admin privileges
SELECT
    'ADMIN_PRIVILEGE_CHECK' as check_type,
    au.email,
    p.role,
    CASE
        WHEN p.role = 'admin' THEN '✅ HAS_ADMIN_PRIVILEGES'
        ELSE '❌ NO_ADMIN_PRIVILEGES'
    END as admin_status,
    CASE
        WHEN p.role = 'admin' THEN 'Admin (Full Access)'
        WHEN p.role = 'seller' THEN 'Seller User'
        WHEN p.role = 'buyer' THEN 'Buyer User'
        ELSE 'Unknown Role'
    END as privilege_level
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE au.email = 'reforiy538@iamtile.com';

-- Count users by role
SELECT 
    'USERS_BY_ROLE' as check_type,
    COALESCE(p.role, 'no_profile') as role,
    COUNT(*) as user_count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
GROUP BY p.role
ORDER BY user_count DESC;

-- Check for any users with admin-like roles
SELECT
    'ADMIN_USERS_FOUND' as check_type,
    au.email,
    p.role,
    p.first_name,
    p.last_name
FROM auth.users au
JOIN profiles p ON au.id = p.user_id
WHERE p.role = 'admin'
ORDER BY p.role, au.email;

-- ============================================================================
-- ADMIN NAVIGATION COMPATIBILITY CHECK
-- ============================================================================

-- Check if roles match admin navigation expectations
SELECT
    'ADMIN_NAV_COMPATIBILITY' as check_type,
    'Expected admin roles: admin (only admin role exists in enum)' as expected_roles,
    string_agg(DISTINCT p.role, ', ') as actual_roles_in_db,
    CASE
        WHEN EXISTS (SELECT 1 FROM profiles WHERE role = 'admin')
        THEN '✅ COMPATIBLE_ROLES_FOUND'
        ELSE '❌ NO_COMPATIBLE_ROLES'
    END as compatibility_status
FROM profiles p
WHERE p.role IS NOT NULL;

-- Generate SQL to fix test user role if needed
SELECT
    'FIX_TEST_USER_ROLE' as action_type,
    CASE
        WHEN p.role != 'admin' OR p.role IS NULL
        THEN 'UPDATE profiles SET role = ''admin'', updated_at = NOW() WHERE user_id = (SELECT id FROM auth.users WHERE email = ''reforiy538@iamtile.com'');'
        ELSE 'Test user already has admin role: ' || p.role
    END as sql_command
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE au.email = 'reforiy538@iamtile.com';

-- ============================================================================
-- SUMMARY AND RECOMMENDATIONS
-- ============================================================================

SELECT 
    'SUMMARY' as section,
    'Admin Navigation Debug Summary' as title;

-- Final recommendations
SELECT 
    'RECOMMENDATIONS' as section,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'reforiy538@iamtile.com')
        THEN '❌ Test user does not exist - create user first'
        WHEN NOT EXISTS (SELECT 1 FROM profiles p JOIN auth.users au ON p.user_id = au.id WHERE au.email = 'reforiy538@iamtile.com')
        THEN '❌ Test user has no profile - create profile first'
        WHEN EXISTS (
            SELECT 1 FROM profiles p
            JOIN auth.users au ON p.user_id = au.id
            WHERE au.email = 'reforiy538@iamtile.com'
            AND p.role = 'admin'
        )
        THEN '✅ Test user has admin role - check frontend integration'
        ELSE '❌ Test user needs admin role - run fix SQL above'
    END as recommendation;
