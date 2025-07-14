-- VERIFY ACTUAL TEST USERS DEPLOYMENT
-- Purpose: Verify test users created with actual Supabase UUIDs
-- Project: BuyMartV1 - Multi-Role Database Schema
-- Generated: 2025-07-12

-- ============================================================================
-- VERIFY TEST USERS WITH ACTUAL SUPABASE UUIDs
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 ============================================================================';
    RAISE NOTICE '🔍 VERIFYING TEST USER DEPLOYMENT WITH ACTUAL SUPABASE UUIDs';
    RAISE NOTICE '🔍 ============================================================================';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. CHECK ACTUAL AUTH USERS
-- ============================================================================

DO $$
DECLARE
    actual_uuids TEXT[] := ARRAY[
        '2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6',
        'be595b4e-58ed-4229-a8fd-7d6c89a3f226',
        '3cdd4257-dc32-4552-a191-3b55ccd6e56a',
        '041c2bad-db8e-48f0-8df6-4165ac89075f',
        '71a53184-c992-404d-b8e0-2b3a13acd63f',
        '62a6bafe-b994-497e-83b0-0c6b0b4ef284'
    ];
    expected_emails TEXT[] := ARRAY[
        'buyer.free@testuser.ardonie.com',
        'buyer.pro@testuser.ardonie.com',
        'seller.free@testuser.ardonie.com',
        'seller.pro@testuser.ardonie.com',
        'financial.vendor@testuser.ardonie.com',
        'legal.vendor@testuser.ardonie.com'
    ];
    user_uuid TEXT;
    user_email TEXT;
    user_exists BOOLEAN;
    existing_count INTEGER := 0;
    missing_count INTEGER := 0;
    i INTEGER;
BEGIN
    RAISE NOTICE '👤 CHECKING ACTUAL AUTH USERS:';
    
    -- Check each actual UUID
    FOR i IN 1..array_length(actual_uuids, 1)
    LOOP
        user_uuid := actual_uuids[i];
        user_email := expected_emails[i];
        
        BEGIN
            SELECT EXISTS (
                SELECT 1 FROM auth.users WHERE id = user_uuid::UUID
            ) INTO user_exists;
            
            IF user_exists THEN
                RAISE NOTICE '   ✅ % - EXISTS (%)', user_email, user_uuid;
                existing_count := existing_count + 1;
            ELSE
                RAISE NOTICE '   ❌ % - MISSING (%)', user_email, user_uuid;
                missing_count := missing_count + 1;
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '   ❌ Error checking UUID %: %', user_uuid, SQLERRM;
                missing_count := missing_count + 1;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 AUTH USER SUMMARY:';
    RAISE NOTICE '   • Existing: % of %', existing_count, array_length(actual_uuids, 1);
    RAISE NOTICE '   • Missing: %', missing_count;
    
    IF missing_count = 0 THEN
        RAISE NOTICE '   ✅ All auth users exist with actual UUIDs';
    ELSE
        RAISE NOTICE '   ⚠️ Some auth users missing - check Supabase Dashboard';
    END IF;
END $$;

-- ============================================================================
-- 2. CHECK PROFILE RECORDS WITH ACTUAL UUIDs
-- ============================================================================

DO $$
DECLARE
    profile_count INTEGER;
    actual_uuids TEXT[] := ARRAY[
        '2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6',
        'be595b4e-58ed-4229-a8fd-7d6c89a3f226',
        '3cdd4257-dc32-4552-a191-3b55ccd6e56a',
        '041c2bad-db8e-48f0-8df6-4165ac89075f',
        '71a53184-c992-404d-b8e0-2b3a13acd63f',
        '62a6bafe-b994-497e-83b0-0c6b0b4ef284'
    ];
    user_uuid TEXT;
    profile_exists BOOLEAN;
    existing_profiles INTEGER := 0;
    missing_profiles INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 CHECKING PROFILE RECORDS WITH ACTUAL UUIDs:';
    
    -- Check each actual UUID
    FOREACH user_uuid IN ARRAY actual_uuids
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
    RAISE NOTICE '   • Existing: % of %', existing_profiles, array_length(actual_uuids, 1);
    RAISE NOTICE '   • Missing: %', missing_profiles;
    
    IF missing_profiles = 0 THEN
        RAISE NOTICE '   ✅ All profiles exist with actual UUIDs';
    ELSE
        RAISE NOTICE '   ⚠️ Some profiles missing - run profile creation script';
    END IF;
END $$;

-- ============================================================================
-- 3. CHECK USER ROLES WITH ACTUAL UUIDs
-- ============================================================================

DO $$
DECLARE
    role_assignment_count INTEGER;
    user_with_roles INTEGER;
    actual_uuids TEXT[] := ARRAY[
        '2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6',
        'be595b4e-58ed-4229-a8fd-7d6c89a3f226',
        '3cdd4257-dc32-4552-a191-3b55ccd6e56a',
        '041c2bad-db8e-48f0-8df6-4165ac89075f',
        '71a53184-c992-404d-b8e0-2b3a13acd63f',
        '62a6bafe-b994-497e-83b0-0c6b0b4ef284'
    ];
BEGIN
    SELECT COUNT(*) INTO role_assignment_count 
    FROM user_roles ur
    WHERE ur.user_id = ANY(actual_uuids::UUID[]);
    
    SELECT COUNT(DISTINCT user_id) INTO user_with_roles
    FROM user_roles ur
    WHERE ur.user_id = ANY(actual_uuids::UUID[]);
    
    RAISE NOTICE '';
    RAISE NOTICE '🎭 CHECKING USER ROLES WITH ACTUAL UUIDs:';
    RAISE NOTICE '   • Total role assignments: %', role_assignment_count;
    RAISE NOTICE '   • Users with roles: %', user_with_roles;
    
    IF user_with_roles >= 6 THEN
        RAISE NOTICE '   ✅ All test users have role assignments';
    ELSE
        RAISE NOTICE '   ⚠️ Some test users missing role assignments';
    END IF;
END $$;

-- ============================================================================
-- 4. CHECK USER SESSIONS WITH ACTUAL UUIDs
-- ============================================================================

DO $$
DECLARE
    session_count INTEGER;
    actual_uuids TEXT[] := ARRAY[
        '2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6',
        'be595b4e-58ed-4229-a8fd-7d6c89a3f226',
        '3cdd4257-dc32-4552-a191-3b55ccd6e56a',
        '041c2bad-db8e-48f0-8df6-4165ac89075f',
        '71a53184-c992-404d-b8e0-2b3a13acd63f',
        '62a6bafe-b994-497e-83b0-0c6b0b4ef284'
    ];
BEGIN
    SELECT COUNT(*) INTO session_count
    FROM user_sessions us
    WHERE us.user_id = ANY(actual_uuids::UUID[]);
    
    RAISE NOTICE '';
    RAISE NOTICE '🔐 CHECKING USER SESSIONS WITH ACTUAL UUIDs:';
    RAISE NOTICE '   • Test user sessions: %', session_count;
    
    IF session_count >= 6 THEN
        RAISE NOTICE '   ✅ All test users have sessions';
    ELSE
        RAISE NOTICE '   ⚠️ Some test users missing sessions';
    END IF;
END $$;

-- ============================================================================
-- 5. CHECK SUBSCRIPTION ASSIGNMENTS WITH ACTUAL UUIDs
-- ============================================================================

DO $$
DECLARE
    subscription_count INTEGER;
    free_tier_count INTEGER;
    pro_tier_count INTEGER;
    actual_uuids TEXT[] := ARRAY[
        '2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6',
        'be595b4e-58ed-4229-a8fd-7d6c89a3f226',
        '3cdd4257-dc32-4552-a191-3b55ccd6e56a',
        '041c2bad-db8e-48f0-8df6-4165ac89075f',
        '71a53184-c992-404d-b8e0-2b3a13acd63f',
        '62a6bafe-b994-497e-83b0-0c6b0b4ef284'
    ];
BEGIN
    SELECT COUNT(*) INTO subscription_count
    FROM user_subscriptions us
    WHERE us.user_id = ANY(actual_uuids::UUID[]);
    
    SELECT COUNT(*) INTO free_tier_count
    FROM user_subscriptions us
    JOIN subscription_tiers st ON us.tier_id = st.id
    WHERE st.slug = 'free'
    AND us.user_id = ANY(actual_uuids::UUID[]);
    
    SELECT COUNT(*) INTO pro_tier_count
    FROM user_subscriptions us
    JOIN subscription_tiers st ON us.tier_id = st.id
    WHERE st.slug = 'pro'
    AND us.user_id = ANY(actual_uuids::UUID[]);
    
    RAISE NOTICE '';
    RAISE NOTICE '💰 CHECKING SUBSCRIPTIONS WITH ACTUAL UUIDs:';
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
-- 6. DETAILED TEST USER REPORT WITH ACTUAL UUIDs
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 DETAILED TEST USER REPORT WITH ACTUAL UUIDs:';
END $$;

-- Show test user details with actual UUIDs
SELECT 
    au.id as actual_uuid,
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
-- 7. FINAL VERIFICATION SUMMARY WITH ACTUAL UUIDs
-- ============================================================================

DO $$
DECLARE
    auth_users INTEGER;
    profiles INTEGER;
    user_roles INTEGER;
    sessions INTEGER;
    subscriptions INTEGER;
    overall_status TEXT;
    actual_uuids TEXT[] := ARRAY[
        '2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6',
        'be595b4e-58ed-4229-a8fd-7d6c89a3f226',
        '3cdd4257-dc32-4552-a191-3b55ccd6e56a',
        '041c2bad-db8e-48f0-8df6-4165ac89075f',
        '71a53184-c992-404d-b8e0-2b3a13acd63f',
        '62a6bafe-b994-497e-83b0-0c6b0b4ef284'
    ];
BEGIN
    -- Count all components with actual UUIDs
    SELECT COUNT(*) INTO auth_users FROM auth.users WHERE email LIKE '%@testuser.ardonie.com';
    SELECT COUNT(*) INTO profiles FROM profiles WHERE user_id = ANY(actual_uuids::UUID[]);
    SELECT COUNT(DISTINCT user_id) INTO user_roles FROM user_roles WHERE user_id = ANY(actual_uuids::UUID[]);
    SELECT COUNT(*) INTO sessions FROM user_sessions WHERE user_id = ANY(actual_uuids::UUID[]);
    SELECT COUNT(*) INTO subscriptions FROM user_subscriptions WHERE user_id = ANY(actual_uuids::UUID[]);
    
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
    RAISE NOTICE '🎯 FINAL VERIFICATION SUMMARY WITH ACTUAL UUIDs';
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
        RAISE NOTICE '🎉 TEST USER DEPLOYMENT WITH ACTUAL UUIDs SUCCESSFUL!';
        RAISE NOTICE '✅ All test users are ready for authentication testing';
        RAISE NOTICE '✅ You can now test multi-role dashboard functionality';
        RAISE NOTICE '';
        RAISE NOTICE '🧪 READY TO TEST WITH ACTUAL CREDENTIALS:';
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
        RAISE NOTICE '❌ Run the profile creation script with actual UUIDs';
        RAISE NOTICE '❌ Check the component status above for specific problems';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ============================================================================';
END $$;
