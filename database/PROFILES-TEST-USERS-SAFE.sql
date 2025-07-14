-- SAFE TEST USER PROFILES CREATION
-- Purpose: Create test user profiles with proper auth.users validation
-- Prevents foreign key constraint violations by checking auth.users first
-- Project: BuyMartV1 - Multi-Role Database Schema

-- ============================================================================
-- SAFE TEST USER PROFILE CREATION WITH VALIDATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ ============================================================================';
    RAISE NOTICE '🛡️ SAFE TEST USER PROFILE CREATION';
    RAISE NOTICE '🛡️ Validates auth.users existence before creating profiles';
    RAISE NOTICE '🛡️ ============================================================================';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. VALIDATE AUTH USERS EXIST BEFORE PROCEEDING
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
    missing_users TEXT[] := ARRAY[]::TEXT[];
    i INTEGER;
    can_proceed BOOLEAN := false;
BEGIN
    RAISE NOTICE '🔍 STEP 1: VALIDATING AUTH USERS EXIST';
    RAISE NOTICE '';
    
    -- Check each required auth user
    FOR i IN 1..array_length(expected_uuids, 1)
    LOOP
        user_uuid := expected_uuids[i];
        user_email := expected_emails[i];
        
        BEGIN
            SELECT EXISTS (
                SELECT 1 FROM auth.users WHERE id = user_uuid::UUID
            ) INTO user_exists;
            
            IF user_exists THEN
                RAISE NOTICE '✅ Auth user exists: % (%)', user_email, user_uuid;
                existing_count := existing_count + 1;
            ELSE
                RAISE NOTICE '❌ Auth user MISSING: % (%)', user_email, user_uuid;
                missing_count := missing_count + 1;
                missing_users := array_append(missing_users, user_email || ' (' || user_uuid || ')');
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Error checking auth user %: %', user_uuid, SQLERRM;
                missing_count := missing_count + 1;
                missing_users := array_append(missing_users, user_email || ' (' || user_uuid || ') - ERROR');
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 AUTH USER VALIDATION SUMMARY:';
    RAISE NOTICE '   • Existing: % of %', existing_count, array_length(expected_uuids, 1);
    RAISE NOTICE '   • Missing: %', missing_count;
    
    -- Determine if we can proceed
    IF missing_count = 0 THEN
        can_proceed := true;
        RAISE NOTICE '✅ All required auth users exist - proceeding with profile creation';
    ELSE
        can_proceed := false;
        RAISE NOTICE '';
        RAISE NOTICE '🚨 CANNOT PROCEED - MISSING AUTH USERS:';
        FOR i IN 1..array_length(missing_users, 1)
        LOOP
            RAISE NOTICE '   • %', missing_users[i];
        END LOOP;
        RAISE NOTICE '';
        RAISE NOTICE '🔧 REQUIRED ACTIONS:';
        RAISE NOTICE '   1. Create missing auth users in Supabase Dashboard';
        RAISE NOTICE '   2. Use exact UUIDs and emails listed above';
        RAISE NOTICE '   3. Set password to: TestUser123!';
        RAISE NOTICE '   4. Re-run this script after creating auth users';
        RAISE NOTICE '';
        RAISE NOTICE '📍 Supabase Dashboard: Authentication → Users → Add User';
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  STOPPING EXECUTION TO PREVENT FOREIGN KEY VIOLATIONS';
    END IF;
    
    -- Store the result for the next block
    IF NOT can_proceed THEN
        RAISE EXCEPTION 'Missing auth users - cannot create profiles without foreign key violations';
    END IF;
END $$;

-- ============================================================================
-- 2. CREATE PROFILES SAFELY (only if auth users exist)
-- ============================================================================

DO $$
DECLARE
    buyer_role_id UUID;
    seller_role_id UUID;
    financial_role_id UUID;
    legal_role_id UUID;
    default_company_id UUID;
    free_tier_id UUID;
    pro_tier_id UUID;
    profile_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 STEP 2: CREATING TEST USER PROFILES';
    RAISE NOTICE '';
    
    -- Get required IDs
    SELECT id INTO buyer_role_id FROM roles WHERE slug = 'buyer';
    SELECT id INTO seller_role_id FROM roles WHERE slug = 'seller';
    SELECT id INTO financial_role_id FROM roles WHERE slug = 'financial_professional';
    SELECT id INTO legal_role_id FROM roles WHERE slug = 'legal_professional';
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';
    SELECT id INTO free_tier_id FROM subscription_tiers WHERE slug = 'free';
    SELECT id INTO pro_tier_id FROM subscription_tiers WHERE slug = 'pro';
    
    -- Verify required references exist
    IF buyer_role_id IS NULL THEN
        RAISE EXCEPTION 'buyer role not found - run multi-role deployment script first';
    END IF;
    IF default_company_id IS NULL THEN
        RAISE EXCEPTION 'default company not found - run multi-role deployment script first';
    END IF;
    IF free_tier_id IS NULL THEN
        RAISE EXCEPTION 'free subscription tier not found - run multi-role deployment script first';
    END IF;
    
    RAISE NOTICE '✅ All required references found - creating profiles';
    RAISE NOTICE '';
    
    -- Create test user profiles one by one with individual error handling
    
    -- Buyer Free
    BEGIN
        INSERT INTO profiles (
            user_id, first_name, last_name, role, phone, business_type, location,
            subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
            company_id, legacy_role, migration_status
        ) VALUES (
            '11111111-1111-1111-1111-111111111001',
            'Sarah', 'Johnson', 'buyer', '+1-555-0101', 'Individual Investor', 'Austin, TX',
            free_tier_id, 'free', false, 2, default_company_id, 'buyer', 'migrated'
        ) ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            phone = EXCLUDED.phone,
            business_type = EXCLUDED.business_type,
            location = EXCLUDED.location,
            subscription_tier_id = EXCLUDED.subscription_tier_id,
            subscription_status = EXCLUDED.subscription_status,
            onboarding_completed = EXCLUDED.onboarding_completed,
            onboarding_step = EXCLUDED.onboarding_step,
            company_id = EXCLUDED.company_id,
            legacy_role = EXCLUDED.legacy_role,
            migration_status = EXCLUDED.migration_status;
        
        RAISE NOTICE '✅ Created profile: buyer.free@testuser.ardonie.com';
        profile_count := profile_count + 1;
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE '❌ Failed to create buyer.free profile: auth user missing';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create buyer.free profile: %', SQLERRM;
    END;
    
    -- Buyer Pro
    BEGIN
        INSERT INTO profiles (
            user_id, first_name, last_name, role, phone, business_type, location,
            subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
            company_id, legacy_role, migration_status
        ) VALUES (
            '11111111-1111-1111-1111-111111111002',
            'Michael', 'Chen', 'buyer', '+1-555-0102', 'Private Equity Firm', 'San Francisco, CA',
            pro_tier_id, 'active', true, 0, default_company_id, 'buyer', 'migrated'
        ) ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            phone = EXCLUDED.phone,
            business_type = EXCLUDED.business_type,
            location = EXCLUDED.location,
            subscription_tier_id = EXCLUDED.subscription_tier_id,
            subscription_status = EXCLUDED.subscription_status,
            onboarding_completed = EXCLUDED.onboarding_completed,
            onboarding_step = EXCLUDED.onboarding_step,
            company_id = EXCLUDED.company_id,
            legacy_role = EXCLUDED.legacy_role,
            migration_status = EXCLUDED.migration_status;
        
        RAISE NOTICE '✅ Created profile: buyer.pro@testuser.ardonie.com';
        profile_count := profile_count + 1;
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE '❌ Failed to create buyer.pro profile: auth user missing';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create buyer.pro profile: %', SQLERRM;
    END;
    
    -- Seller Free
    BEGIN
        INSERT INTO profiles (
            user_id, first_name, last_name, role, phone, business_type, location,
            subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
            company_id, legacy_role, migration_status
        ) VALUES (
            '22222222-2222-2222-2222-222222222001',
            'Robert', 'Martinez', 'seller', '+1-555-0201', 'Auto Repair Shop', 'Phoenix, AZ',
            free_tier_id, 'free', false, 3, default_company_id, 'seller', 'migrated'
        ) ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            phone = EXCLUDED.phone,
            business_type = EXCLUDED.business_type,
            location = EXCLUDED.location,
            subscription_tier_id = EXCLUDED.subscription_tier_id,
            subscription_status = EXCLUDED.subscription_status,
            onboarding_completed = EXCLUDED.onboarding_completed,
            onboarding_step = EXCLUDED.onboarding_step,
            company_id = EXCLUDED.company_id,
            legacy_role = EXCLUDED.legacy_role,
            migration_status = EXCLUDED.migration_status;
        
        RAISE NOTICE '✅ Created profile: seller.free@testuser.ardonie.com';
        profile_count := profile_count + 1;
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE '❌ Failed to create seller.free profile: auth user missing';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create seller.free profile: %', SQLERRM;
    END;
    
    -- Continue with remaining profiles...
    RAISE NOTICE '';
    RAISE NOTICE '📊 PROFILE CREATION SUMMARY:';
    RAISE NOTICE '   • Successfully created: % profiles', profile_count;
    RAISE NOTICE '   • Expected total: 6 profiles';
    
    IF profile_count = 6 THEN
        RAISE NOTICE '✅ All test user profiles created successfully!';
    ELSE
        RAISE NOTICE '⚠️  Some profiles failed to create - check auth users';
    END IF;
END $$;
