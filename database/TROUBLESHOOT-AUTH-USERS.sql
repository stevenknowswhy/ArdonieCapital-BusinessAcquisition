-- TROUBLESHOOT AUTH USERS - Foreign Key Constraint Violation Fix
-- Purpose: Diagnose and fix foreign key constraint violations in test user creation
-- Error: 23503 - foreign key constraint violation on profiles_user_id_fkey
-- Project: BuyMartV1 - Multi-Role Database Schema

-- ============================================================================
-- FOREIGN KEY CONSTRAINT VIOLATION TROUBLESHOOTING
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 ============================================================================';
    RAISE NOTICE '🔍 TROUBLESHOOTING FOREIGN KEY CONSTRAINT VIOLATION';
    RAISE NOTICE '🔍 Error: 23503 - profiles_user_id_fkey constraint violation';
    RAISE NOTICE '🔍 ============================================================================';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. CHECK AUTH.USERS TABLE ACCESS AND CONTENT
-- ============================================================================

DO $$
DECLARE
    auth_table_exists BOOLEAN;
    total_auth_users INTEGER;
    test_auth_users INTEGER;
BEGIN
    RAISE NOTICE '👤 STEP 1: CHECKING AUTH.USERS TABLE';
    RAISE NOTICE '';
    
    -- Check if we can access auth.users table
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'auth' AND table_name = 'users'
        ) INTO auth_table_exists;
        
        IF auth_table_exists THEN
            RAISE NOTICE '✅ auth.users table exists and is accessible';
            
            -- Count total users
            SELECT COUNT(*) INTO total_auth_users FROM auth.users;
            RAISE NOTICE '📊 Total users in auth.users: %', total_auth_users;
            
            -- Count test users
            SELECT COUNT(*) INTO test_auth_users 
            FROM auth.users 
            WHERE email LIKE '%@testuser.ardonie.com';
            RAISE NOTICE '📊 Test users in auth.users: %', test_auth_users;
            
        ELSE
            RAISE NOTICE '❌ auth.users table not found or not accessible';
        END IF;
        
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE '❌ Insufficient privileges to access auth.users table';
            RAISE NOTICE '⚠️  This is normal - auth.users requires special permissions';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error accessing auth.users: %', SQLERRM;
    END;
END $$;

-- ============================================================================
-- 2. CHECK SPECIFIC TEST USER UUIDs IN AUTH.USERS
-- ============================================================================

DO $$
DECLARE
    expected_uuids TEXT[] := ARRAY[
        '11111111-1111-1111-1111-111111111001',
        '11111111-1111-1111-1111-111111111002',
        '22222222-2222-2222-2222-222222222001',
        '22222222-2222-2222-2222-222222222002',
        '33333333-3333-3333-3333-333333333001',
        '33333333-3333-3333-3333-333333333002'
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
    RAISE NOTICE '';
    RAISE NOTICE '🔍 STEP 2: CHECKING SPECIFIC TEST USER UUIDs';
    RAISE NOTICE '';
    
    FOR i IN 1..array_length(expected_uuids, 1)
    LOOP
        user_uuid := expected_uuids[i];
        user_email := expected_emails[i];
        
        BEGIN
            SELECT EXISTS (
                SELECT 1 FROM auth.users WHERE id = user_uuid::UUID
            ) INTO user_exists;
            
            IF user_exists THEN
                RAISE NOTICE '✅ UUID % exists (%)', user_uuid, user_email;
                existing_count := existing_count + 1;
            ELSE
                RAISE NOTICE '❌ UUID % MISSING (%)', user_uuid, user_email;
                missing_count := missing_count + 1;
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Error checking UUID %: %', user_uuid, SQLERRM;
                missing_count := missing_count + 1;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 UUID CHECK SUMMARY:';
    RAISE NOTICE '   • Existing UUIDs: %', existing_count;
    RAISE NOTICE '   • Missing UUIDs: %', missing_count;
    
    IF missing_count > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '🚨 FOREIGN KEY CONSTRAINT VIOLATION CAUSE IDENTIFIED:';
        RAISE NOTICE '   The missing UUIDs are causing the foreign key constraint violation';
        RAISE NOTICE '   profiles.user_id must reference existing auth.users.id values';
    END IF;
END $$;

-- ============================================================================
-- 3. CHECK FOREIGN KEY CONSTRAINT CONFIGURATION
-- ============================================================================

DO $$
DECLARE
    constraint_info RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔗 STEP 3: CHECKING FOREIGN KEY CONSTRAINT CONFIGURATION';
    RAISE NOTICE '';
    
    -- Get foreign key constraint details
    FOR constraint_info IN
        SELECT 
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'profiles'
        AND kcu.column_name = 'user_id'
    LOOP
        RAISE NOTICE '🔗 Foreign Key Constraint Found:';
        RAISE NOTICE '   • Constraint Name: %', constraint_info.constraint_name;
        RAISE NOTICE '   • Source: %.%', constraint_info.table_name, constraint_info.column_name;
        RAISE NOTICE '   • References: %.%', constraint_info.foreign_table_name, constraint_info.foreign_column_name;
        
        IF constraint_info.foreign_table_name = 'users' AND constraint_info.foreign_column_name = 'id' THEN
            RAISE NOTICE '   ✅ Constraint correctly references auth.users.id';
        ELSE
            RAISE NOTICE '   ❌ Constraint configuration may be incorrect';
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- 4. SHOW EXISTING AUTH USERS (if accessible)
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 STEP 4: SHOWING EXISTING AUTH USERS';
    RAISE NOTICE '';
    
    BEGIN
        -- Try to show existing auth users
        RAISE NOTICE 'Existing auth.users (limited to test domain):';
        
        -- This will only work if we have access to auth.users
        PERFORM 1 FROM auth.users LIMIT 1;
        RAISE NOTICE 'Successfully accessed auth.users table';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Cannot directly query auth.users table';
            RAISE NOTICE '   This is normal in Supabase - auth.users requires special access';
            RAISE NOTICE '   Use Supabase Dashboard to view/create auth users';
    END;
END $$;

-- Show auth users if accessible (this may fail with permission error)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email LIKE '%@testuser.ardonie.com'
ORDER BY email;

-- ============================================================================
-- 5. SOLUTION RECOMMENDATIONS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '💡 ============================================================================';
    RAISE NOTICE '💡 SOLUTION RECOMMENDATIONS';
    RAISE NOTICE '💡 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 IMMEDIATE ACTIONS REQUIRED:';
    RAISE NOTICE '';
    RAISE NOTICE '1. 👤 CREATE MISSING AUTH USERS IN SUPABASE DASHBOARD:';
    RAISE NOTICE '   • Go to: Supabase Dashboard → Authentication → Users';
    RAISE NOTICE '   • Click: "Add User" button';
    RAISE NOTICE '   • Create each user with EXACT UUID and email:';
    RAISE NOTICE '';
    RAISE NOTICE '   📧 buyer.free@testuser.ardonie.com';
    RAISE NOTICE '   🆔 UUID: 11111111-1111-1111-1111-111111111001';
    RAISE NOTICE '   🔑 Password: TestUser123!';
    RAISE NOTICE '';
    RAISE NOTICE '   📧 buyer.pro@testuser.ardonie.com';
    RAISE NOTICE '   🆔 UUID: 11111111-1111-1111-1111-111111111002';
    RAISE NOTICE '   🔑 Password: TestUser123!';
    RAISE NOTICE '';
    RAISE NOTICE '   📧 seller.free@testuser.ardonie.com';
    RAISE NOTICE '   🆔 UUID: 22222222-2222-2222-2222-222222222001';
    RAISE NOTICE '   🔑 Password: TestUser123!';
    RAISE NOTICE '';
    RAISE NOTICE '   📧 seller.pro@testuser.ardonie.com';
    RAISE NOTICE '   🆔 UUID: 22222222-2222-2222-2222-222222222002';
    RAISE NOTICE '   🔑 Password: TestUser123!';
    RAISE NOTICE '';
    RAISE NOTICE '   📧 financial.vendor@testuser.ardonie.com';
    RAISE NOTICE '   🆔 UUID: 33333333-3333-3333-3333-333333333001';
    RAISE NOTICE '   🔑 Password: TestUser123!';
    RAISE NOTICE '';
    RAISE NOTICE '   📧 legal.vendor@testuser.ardonie.com';
    RAISE NOTICE '   🆔 UUID: 33333333-3333-3333-3333-333333333002';
    RAISE NOTICE '   🔑 Password: TestUser123!';
    RAISE NOTICE '';
    RAISE NOTICE '2. ✅ VERIFY AUTH USER CREATION:';
    RAISE NOTICE '   • Run this troubleshooting script again';
    RAISE NOTICE '   • Confirm all 6 UUIDs exist in auth.users';
    RAISE NOTICE '   • Check that emails are confirmed (if required)';
    RAISE NOTICE '';
    RAISE NOTICE '3. 🔄 RETRY PROFILE CREATION:';
    RAISE NOTICE '   • Re-run: database/PROFILES-TEST-USERS-FIXED.sql';
    RAISE NOTICE '   • Foreign key constraint should now pass';
    RAISE NOTICE '   • Verify with: database/VERIFY-TEST-USERS.sql';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT NOTES:';
    RAISE NOTICE '   • UUIDs must match EXACTLY (case-sensitive)';
    RAISE NOTICE '   • Email addresses must match EXACTLY';
    RAISE NOTICE '   • Users may need email confirmation in some setups';
    RAISE NOTICE '   • Use Supabase Dashboard, not SQL, to create auth users';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 ALTERNATIVE APPROACH (if Dashboard fails):';
    RAISE NOTICE '   • Use Supabase Management API';
    RAISE NOTICE '   • Use Supabase CLI: supabase auth users create';
    RAISE NOTICE '   • Contact Supabase support for auth user creation issues';
    RAISE NOTICE '';
    RAISE NOTICE '💡 ============================================================================';
END $$;
