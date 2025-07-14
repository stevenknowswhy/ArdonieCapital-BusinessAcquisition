-- VERIFY TEST USERS DEPLOYMENT
-- Purpose: Check if test users were created successfully and are working
-- Project: BuyMartV1 - Multi-Role Database Schema
-- Generated: 2025-07-12

-- ============================================================================
-- TEST USER VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 ============================================================================';
    RAISE NOTICE '🔍 VERIFYING TEST USER DEPLOYMENT';
    RAISE NOTICE '🔍 ============================================================================';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. CHECK AUTH USERS
-- ============================================================================

DO $$
DECLARE
    auth_user_count INTEGER;
    expected_emails TEXT[] := ARRAY[
        'buyer.free@testuser.ardonie.com',
        'buyer.pro@testuser.ardonie.com', 
        'seller.free@testuser.ardonie.com',
        'seller.pro@testuser.ardonie.com',
        'financial.vendor@testuser.ardonie.com',
        'legal.vendor@testuser.ardonie.com'
    ];
    email_addr TEXT;
    user_exists BOOLEAN;
    existing_count INTEGER := 0;
    missing_count INTEGER := 0;
BEGIN
    RAISE NOTICE '👤 CHECKING AUTH USERS:';
    
    -- Check each expected email
    FOREACH email_addr IN ARRAY expected_emails
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM auth.users WHERE email = email_addr
        ) INTO user_exists;
        
        IF user_exists THEN
            RAISE NOTICE '   ✅ % - EXISTS', email_addr;
            existing_count := existing_count + 1;
        ELSE
            RAISE NOTICE '   ❌ % - MISSING', email_addr;
            missing_count := missing_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 AUTH USER SUMMARY:';
    RAISE NOTICE '   • Existing: % of %', existing_count, array_length(expected_emails, 1);
    RAISE NOTICE '   • Missing: %', missing_count;
    
    IF missing_count > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️ MISSING AUTH USERS MUST BE CREATED IN SUPABASE DASHBOARD';
        RAISE NOTICE '   Go to: Authentication → Users → Add User';
        RAISE NOTICE '   Use exact emails and UUIDs from deployment guide';
    END IF;
END $$;

-- ============================================================================
-- 2. CHECK PROFILE RECORDS
-- ============================================================================

DO $$
DECLARE
    profile_count INTEGER;
    expected_uuids TEXT[] := ARRAY[
        '11111111-1111-1111-1111-111111111001',
        '11111111-1111-1111-1111-111111111002',
        '22222222-2222-2222-2222-222222222001', 
        '22222222-2222-2222-2222-222222222002',
        '33333333-3333-3333-3333-333333333001',
        '33333333-3333-3333-3333-333333333002'
    ];
    user_uuid TEXT;
    profile_exists BOOLEAN;
    existing_profiles INTEGER := 0;
    missing_profiles INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 CHECKING PROFILE RECORDS:';
    
    -- Check each expected UUID
    FOREACH user_uuid IN ARRAY expected_uuids
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM profiles WHERE user_id = user_uuid::UUID
        ) INTO profile_exists;
        
        IF profile_exists THEN
            RAISE NOTICE '   ✅ % - PROFILE EXISTS', user_uuid;
            existing_profiles := existing_profiles + 1;
        ELSE
            RAISE NOTICE '   ❌ % - PROFILE MISSING', user_uuid;
            missing_profiles := missing_profiles + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 PROFILE SUMMARY:';
    RAISE NOTICE '   • Existing: % of %', existing_profiles, array_length(expected_uuids, 1);
    RAISE NOTICE '   • Missing: %', missing_profiles;
END $$;

-- ============================================================================
-- 3. CHECK USER ROLES
-- ============================================================================

DO $$
DECLARE
    role_assignment_count INTEGER;
    user_with_roles INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_assignment_count 
    FROM user_roles ur
    WHERE ur.user_id::TEXT LIKE '11111111%' 
       OR ur.user_id::TEXT LIKE '22222222%' 
       OR ur.user_id::TEXT LIKE '33333333%';
    
    SELECT COUNT(DISTINCT user_id) INTO user_with_roles
    FROM user_roles ur
    WHERE ur.user_id::TEXT LIKE '11111111%' 
       OR ur.user_id::TEXT LIKE '22222222%' 
       OR ur.user_id::TEXT LIKE '33333333%';
    
    RAISE NOTICE '';
    RAISE NOTICE '🎭 CHECKING USER ROLES:';
    RAISE NOTICE '   • Total role assignments: %', role_assignment_count;
    RAISE NOTICE '   • Users with roles: %', user_with_roles;
    
    IF user_with_roles >= 6 THEN
        RAISE NOTICE '   ✅ All test users have role assignments';
    ELSE
        RAISE NOTICE '   ⚠️ Some test users missing role assignments';
    END IF;
END $$;

-- ============================================================================
-- 4. CHECK USER SESSIONS
-- ============================================================================

DO $$
DECLARE
    session_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO session_count
    FROM user_sessions us
    WHERE us.user_id::TEXT LIKE '11111111%' 
       OR us.user_id::TEXT LIKE '22222222%' 
       OR us.user_id::TEXT LIKE '33333333%';
    
    RAISE NOTICE '';
    RAISE NOTICE '🔐 CHECKING USER SESSIONS:';
    RAISE NOTICE '   • Test user sessions: %', session_count;
    
    IF session_count >= 6 THEN
        RAISE NOTICE '   ✅ All test users have sessions';
    ELSE
        RAISE NOTICE '   ⚠️ Some test users missing sessions';
    END IF;
END $$;

-- ============================================================================
-- 5. CHECK SUBSCRIPTION ASSIGNMENTS
-- ============================================================================

DO $$
DECLARE
    subscription_count INTEGER;
    free_tier_count INTEGER;
    pro_tier_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO subscription_count
    FROM user_subscriptions us
    WHERE us.user_id::TEXT LIKE '11111111%' 
       OR us.user_id::TEXT LIKE '22222222%' 
       OR us.user_id::TEXT LIKE '33333333%';
    
    SELECT COUNT(*) INTO free_tier_count
    FROM user_subscriptions us
    JOIN subscription_tiers st ON us.tier_id = st.id
    WHERE st.slug = 'free'
    AND (us.user_id::TEXT LIKE '11111111%' 
         OR us.user_id::TEXT LIKE '22222222%' 
         OR us.user_id::TEXT LIKE '33333333%');
    
    SELECT COUNT(*) INTO pro_tier_count
    FROM user_subscriptions us
    JOIN subscription_tiers st ON us.tier_id = st.id
    WHERE st.slug = 'pro'
    AND (us.user_id::TEXT LIKE '11111111%' 
         OR us.user_id::TEXT LIKE '22222222%' 
         OR us.user_id::TEXT LIKE '33333333%');
    
    RAISE NOTICE '';
    RAISE NOTICE '💰 CHECKING SUBSCRIPTIONS:';
    RAISE NOTICE '   • Total subscriptions: %', subscription_count;
    RAISE NOTICE '   • Free tier users: %', free_tier_count;
    RAISE NOTICE '   • Pro tier users: %', pro_tier_count;
    
    IF subscription_count >= 6 THEN
        RAISE NOTICE '   ✅ All test users have subscriptions';
    ELSE
        RAISE NOTICE '   ⚠️ Some test users missing subscriptions';
    END IF;
END $$;

-- ============================================================================
-- 6. DETAILED TEST USER REPORT
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '📊 DETAILED TEST USER REPORT:';

-- Show test user details
SELECT 
    au.email,
    p.first_name || ' ' || p.last_name as full_name,
    p.role as legacy_role,
    r.name as assigned_role,
    st.name as subscription_tier,
    p.onboarding_completed,
    CASE WHEN us.user_id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_session
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
LEFT JOIN user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN subscription_tiers st ON p.subscription_tier_id = st.id
LEFT JOIN user_sessions us ON p.user_id = us.user_id
WHERE au.email LIKE '%@testuser.ardonie.com'
ORDER BY au.email;

-- ============================================================================
-- 7. FINAL VERIFICATION SUMMARY
-- ============================================================================

DO $$
DECLARE
    auth_users INTEGER;
    profiles INTEGER;
    user_roles INTEGER;
    sessions INTEGER;
    subscriptions INTEGER;
    overall_status TEXT;
BEGIN
    -- Count all components
    SELECT COUNT(*) INTO auth_users FROM auth.users WHERE email LIKE '%@testuser.ardonie.com';
    SELECT COUNT(*) INTO profiles FROM profiles WHERE user_id::TEXT LIKE '11111111%' OR user_id::TEXT LIKE '22222222%' OR user_id::TEXT LIKE '33333333%';
    SELECT COUNT(DISTINCT user_id) INTO user_roles FROM user_roles WHERE user_id::TEXT LIKE '11111111%' OR user_id::TEXT LIKE '22222222%' OR user_id::TEXT LIKE '33333333%';
    SELECT COUNT(*) INTO sessions FROM user_sessions WHERE user_id::TEXT LIKE '11111111%' OR user_id::TEXT LIKE '22222222%' OR user_id::TEXT LIKE '33333333%';
    SELECT COUNT(*) INTO subscriptions FROM user_subscriptions WHERE user_id::TEXT LIKE '11111111%' OR user_id::TEXT LIKE '22222222%' OR user_id::TEXT LIKE '33333333%';
    
    -- Determine overall status
    IF auth_users >= 6 AND profiles >= 6 AND user_roles >= 6 AND sessions >= 6 AND subscriptions >= 6 THEN
        overall_status := 'SUCCESS';
    ELSIF auth_users >= 6 AND profiles >= 6 THEN
        overall_status := 'PARTIAL SUCCESS';
    ELSE
        overall_status := 'NEEDS ATTENTION';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ============================================================================';
    RAISE NOTICE '🎯 FINAL VERIFICATION SUMMARY';
    RAISE NOTICE '🎯 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 COMPONENT STATUS:';
    RAISE NOTICE '   Auth Users: % of 6 expected', auth_users;
    RAISE NOTICE '   Profiles: % of 6 expected', profiles;
    RAISE NOTICE '   User Roles: % of 6 expected', user_roles;
    RAISE NOTICE '   Sessions: % of 6 expected', sessions;
    RAISE NOTICE '   Subscriptions: % of 6 expected', subscriptions;
    RAISE NOTICE '';
    RAISE NOTICE '🏆 OVERALL STATUS: %', overall_status;
    RAISE NOTICE '';
    
    IF overall_status = 'SUCCESS' THEN
        RAISE NOTICE '🎉 TEST USER DEPLOYMENT SUCCESSFUL!';
        RAISE NOTICE '✅ All test users are ready for authentication testing';
        RAISE NOTICE '✅ You can now test multi-role dashboard functionality';
        RAISE NOTICE '';
        RAISE NOTICE '🧪 READY TO TEST:';
        RAISE NOTICE '   • buyer.free@testuser.ardonie.com / TestUser123!';
        RAISE NOTICE '   • buyer.pro@testuser.ardonie.com / TestUser123!';
        RAISE NOTICE '   • seller.free@testuser.ardonie.com / TestUser123!';
        RAISE NOTICE '   • seller.pro@testuser.ardonie.com / TestUser123!';
        RAISE NOTICE '   • financial.vendor@testuser.ardonie.com / TestUser123!';
        RAISE NOTICE '   • legal.vendor@testuser.ardonie.com / TestUser123!';
    ELSIF overall_status = 'PARTIAL SUCCESS' THEN
        RAISE NOTICE '⚠️ TEST USER DEPLOYMENT PARTIALLY SUCCESSFUL';
        RAISE NOTICE '✅ Core components (auth users, profiles) are working';
        RAISE NOTICE '⚠️ Some optional components may need attention';
        RAISE NOTICE '⚠️ Review the component status above';
    ELSE
        RAISE NOTICE '❌ TEST USER DEPLOYMENT NEEDS ATTENTION';
        RAISE NOTICE '❌ Critical components are missing';
        RAISE NOTICE '❌ Follow the deployment guide to fix issues';
        RAISE NOTICE '❌ Check the component status above for specific problems';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ============================================================================';
END $$;
