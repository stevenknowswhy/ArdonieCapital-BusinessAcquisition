-- TEST USER PROFILES WITH ACTUAL UUIDs - SYNTAX CORRECTED
-- Purpose: Create test user profiles using actual Supabase UUIDs with proper syntax
-- Fixes: Error 42601 - syntax error at or near 'RAISE'
-- Fixes: Error 42P10 - ON CONFLICT constraint matching issue
-- Project: BuyMartV1 - Multi-Role Database Schema

-- ============================================================================
-- PREREQUISITES CHECK
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ ============================================================================';
    RAISE NOTICE '🛡️ TEST USER PROFILES CREATION - SYNTAX CORRECTED VERSION';
    RAISE NOTICE '🛡️ ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 ACTUAL UUID MAPPING:';
    RAISE NOTICE '   buyer.free@testuser.ardonie.com → 2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6';
    RAISE NOTICE '   buyer.pro@testuser.ardonie.com → be595b4e-58ed-4229-a8fd-7d6c89a3f226';
    RAISE NOTICE '   seller.free@testuser.ardonie.com → 3cdd4257-dc32-4552-a191-3b55ccd6e56a';
    RAISE NOTICE '   seller.pro@testuser.ardonie.com → 041c2bad-db8e-48f0-8df6-4165ac89075f';
    RAISE NOTICE '   financial.vendor@testuser.ardonie.com → 71a53184-c992-404d-b8e0-2b3a13acd63f';
    RAISE NOTICE '   legal.vendor@testuser.ardonie.com → 62a6bafe-b994-497e-83b0-0c6b0b4ef284';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. VALIDATE PREREQUISITES
-- ============================================================================

DO $$
DECLARE
    auth_users_count INTEGER;
    required_tables_count INTEGER;
    unique_constraint_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 STEP 1: VALIDATING PREREQUISITES';
    RAISE NOTICE '';
    
    -- Check auth users exist
    SELECT COUNT(*) INTO auth_users_count 
    FROM auth.users 
    WHERE email LIKE '%@testuser.ardonie.com';
    
    IF auth_users_count < 6 THEN
        RAISE EXCEPTION 'Only % auth users found. Need 6 test users in auth.users table.', auth_users_count;
    END IF;
    
    RAISE NOTICE '✅ Found % auth users with @testuser.ardonie.com emails', auth_users_count;
    
    -- Check required tables exist
    SELECT COUNT(*) INTO required_tables_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'roles', 'user_roles', 'user_sessions', 'user_subscriptions', 'subscription_tiers', 'companies');
    
    IF required_tables_count < 7 THEN
        RAISE EXCEPTION 'Only % of 7 required tables found. Run multi-role deployment first.', required_tables_count;
    END IF;
    
    RAISE NOTICE '✅ Found % of 7 required tables', required_tables_count;
    
    -- Check unique constraint on user_subscriptions
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'user_subscriptions'
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%user%tier%'
    ) INTO unique_constraint_exists;
    
    IF NOT unique_constraint_exists THEN
        RAISE EXCEPTION 'Missing unique constraint on user_subscriptions. Run FIX-USER-SUBSCRIPTIONS-SCHEMA.sql first.';
    END IF;
    
    RAISE NOTICE '✅ Unique constraint exists on user_subscriptions table';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 2. CREATE TEST USER PROFILES
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
    RAISE NOTICE '📋 STEP 2: CREATING TEST USER PROFILES';
    RAISE NOTICE '';
    
    -- Get required reference IDs
    SELECT id INTO buyer_role_id FROM roles WHERE slug = 'buyer';
    SELECT id INTO seller_role_id FROM roles WHERE slug = 'seller';
    SELECT id INTO financial_role_id FROM roles WHERE slug = 'financial_professional';
    SELECT id INTO legal_role_id FROM roles WHERE slug = 'legal_professional';
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';
    SELECT id INTO free_tier_id FROM subscription_tiers WHERE slug = 'free';
    SELECT id INTO pro_tier_id FROM subscription_tiers WHERE slug = 'pro';
    
    -- Validate all required references exist
    IF buyer_role_id IS NULL THEN
        RAISE EXCEPTION 'buyer role not found in roles table';
    END IF;
    IF default_company_id IS NULL THEN
        RAISE EXCEPTION 'default company not found in companies table';
    END IF;
    IF free_tier_id IS NULL THEN
        RAISE EXCEPTION 'free subscription tier not found in subscription_tiers table';
    END IF;
    
    RAISE NOTICE '✅ All required reference IDs found';
    RAISE NOTICE '';
    
    -- Create profiles for each test user
    
    -- Buyer Free (2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6)
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6',
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
    
    profile_count := profile_count + 1;
    RAISE NOTICE '✅ Created profile: buyer.free@testuser.ardonie.com';
    
    -- Buyer Pro (be595b4e-58ed-4229-a8fd-7d6c89a3f226)
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        'be595b4e-58ed-4229-a8fd-7d6c89a3f226',
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
    
    profile_count := profile_count + 1;
    RAISE NOTICE '✅ Created profile: buyer.pro@testuser.ardonie.com';
    
    -- Seller Free (3cdd4257-dc32-4552-a191-3b55ccd6e56a)
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '3cdd4257-dc32-4552-a191-3b55ccd6e56a',
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
    
    profile_count := profile_count + 1;
    RAISE NOTICE '✅ Created profile: seller.free@testuser.ardonie.com';
    
    -- Seller Pro (041c2bad-db8e-48f0-8df6-4165ac89075f)
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '041c2bad-db8e-48f0-8df6-4165ac89075f',
        'Jennifer', 'Williams', 'seller', '+1-555-0202', 'Multi-Location Auto Group', 'Dallas, TX',
        pro_tier_id, 'active', true, 0, default_company_id, 'seller', 'migrated'
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

    profile_count := profile_count + 1;
    RAISE NOTICE '✅ Created profile: seller.pro@testuser.ardonie.com';

    -- Financial Vendor (71a53184-c992-404d-b8e0-2b3a13acd63f)
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '71a53184-c992-404d-b8e0-2b3a13acd63f',
        'David', 'Thompson', 'seller', '+1-555-0301', 'Financial Services', 'Chicago, IL',
        pro_tier_id, 'active', true, 0, default_company_id, 'vendor', 'migrated'
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

    profile_count := profile_count + 1;
    RAISE NOTICE '✅ Created profile: financial.vendor@testuser.ardonie.com';

    -- Legal Vendor (62a6bafe-b994-497e-83b0-0c6b0b4ef284)
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '62a6bafe-b994-497e-83b0-0c6b0b4ef284',
        'Amanda', 'Rodriguez', 'seller', '+1-555-0302', 'Legal Services', 'Miami, FL',
        pro_tier_id, 'active', true, 0, default_company_id, 'vendor', 'migrated'
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

    profile_count := profile_count + 1;
    RAISE NOTICE '✅ Created profile: legal.vendor@testuser.ardonie.com';

    RAISE NOTICE '';
    RAISE NOTICE '📊 PROFILE CREATION SUMMARY:';
    RAISE NOTICE '   • Successfully created: % profiles', profile_count;
    RAISE NOTICE '   • Expected total: 6 profiles';

    IF profile_count = 6 THEN
        RAISE NOTICE '✅ All test user profiles created successfully!';
    ELSE
        RAISE NOTICE '⚠️ Some profiles may have failed - check messages above';
    END IF;
END $$;

-- ============================================================================
-- 3. CREATE USER ROLE ASSIGNMENTS
-- ============================================================================

DO $$
DECLARE
    buyer_role_id UUID;
    seller_role_id UUID;
    financial_role_id UUID;
    legal_role_id UUID;
    default_company_id UUID;
    role_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎭 STEP 3: CREATING USER ROLE ASSIGNMENTS';
    RAISE NOTICE '';

    -- Get role and company IDs
    SELECT id INTO buyer_role_id FROM roles WHERE slug = 'buyer';
    SELECT id INTO seller_role_id FROM roles WHERE slug = 'seller';
    SELECT id INTO financial_role_id FROM roles WHERE slug = 'financial_professional';
    SELECT id INTO legal_role_id FROM roles WHERE slug = 'legal_professional';
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';

    -- Create role assignments
    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata) VALUES
    ('2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6', buyer_role_id, default_company_id, '2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6', true, '{"test_user": true, "category": "single_role_buyer", "tier": "free"}'),
    ('be595b4e-58ed-4229-a8fd-7d6c89a3f226', buyer_role_id, default_company_id, 'be595b4e-58ed-4229-a8fd-7d6c89a3f226', true, '{"test_user": true, "category": "single_role_buyer", "tier": "pro"}'),
    ('3cdd4257-dc32-4552-a191-3b55ccd6e56a', seller_role_id, default_company_id, '3cdd4257-dc32-4552-a191-3b55ccd6e56a', true, '{"test_user": true, "category": "single_role_seller", "tier": "free"}'),
    ('041c2bad-db8e-48f0-8df6-4165ac89075f', seller_role_id, default_company_id, '041c2bad-db8e-48f0-8df6-4165ac89075f', true, '{"test_user": true, "category": "single_role_seller", "tier": "pro"}'),
    ('71a53184-c992-404d-b8e0-2b3a13acd63f', financial_role_id, default_company_id, '71a53184-c992-404d-b8e0-2b3a13acd63f', true, '{"test_user": true, "category": "single_role_vendor", "vendor_type": "financial"}'),
    ('62a6bafe-b994-497e-83b0-0c6b0b4ef284', legal_role_id, default_company_id, '62a6bafe-b994-497e-83b0-0c6b0b4ef284', true, '{"test_user": true, "category": "single_role_vendor", "vendor_type": "legal"}')
    ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    GET DIAGNOSTICS role_count = ROW_COUNT;
    RAISE NOTICE '✅ Created % user role assignments', role_count;
END $$;

-- ============================================================================
-- 4. CREATE USER SESSIONS
-- ============================================================================

DO $$
DECLARE
    buyer_role_id UUID;
    seller_role_id UUID;
    financial_role_id UUID;
    legal_role_id UUID;
    session_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔐 STEP 4: CREATING USER SESSIONS';
    RAISE NOTICE '';

    -- Get role IDs
    SELECT id INTO buyer_role_id FROM roles WHERE slug = 'buyer';
    SELECT id INTO seller_role_id FROM roles WHERE slug = 'seller';
    SELECT id INTO financial_role_id FROM roles WHERE slug = 'financial_professional';
    SELECT id INTO legal_role_id FROM roles WHERE slug = 'legal_professional';

    -- Create user sessions
    INSERT INTO user_sessions (user_id, active_role_id, preferences) VALUES
    ('2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6', buyer_role_id, '{"test_user": true, "dashboard_theme": "light", "notifications": true}'),
    ('be595b4e-58ed-4229-a8fd-7d6c89a3f226', buyer_role_id, '{"test_user": true, "dashboard_theme": "dark", "notifications": true, "advanced_filters": true}'),
    ('3cdd4257-dc32-4552-a191-3b55ccd6e56a', seller_role_id, '{"test_user": true, "dashboard_theme": "light", "listing_alerts": true}'),
    ('041c2bad-db8e-48f0-8df6-4165ac89075f', seller_role_id, '{"test_user": true, "dashboard_theme": "dark", "analytics_enabled": true, "priority_support": true}'),
    ('71a53184-c992-404d-b8e0-2b3a13acd63f', financial_role_id, '{"test_user": true, "dashboard_theme": "professional", "client_management": true, "financial_tools": true}'),
    ('62a6bafe-b994-497e-83b0-0c6b0b4ef284', legal_role_id, '{"test_user": true, "dashboard_theme": "professional", "legal_tools": true, "document_management": true}')
    ON CONFLICT (user_id) DO NOTHING;

    GET DIAGNOSTICS session_count = ROW_COUNT;
    RAISE NOTICE '✅ Created % user sessions', session_count;
END $$;

-- ============================================================================
-- 5. CREATE USER SUBSCRIPTIONS (WITH FIXED CONSTRAINT)
-- ============================================================================

DO $$
DECLARE
    free_tier_id UUID;
    pro_tier_id UUID;
    subscription_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '💰 STEP 5: CREATING USER SUBSCRIPTIONS';
    RAISE NOTICE '';

    -- Get subscription tier IDs
    SELECT id INTO free_tier_id FROM subscription_tiers WHERE slug = 'free';
    SELECT id INTO pro_tier_id FROM subscription_tiers WHERE slug = 'pro';

    -- Create user subscriptions (now with working ON CONFLICT)
    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at) VALUES
    ('2a07ad22-77b0-4a01-bc0a-ea17bd9b77d6', free_tier_id, 'active', NOW() - INTERVAL '30 days'),
    ('be595b4e-58ed-4229-a8fd-7d6c89a3f226', pro_tier_id, 'active', NOW() - INTERVAL '90 days'),
    ('3cdd4257-dc32-4552-a191-3b55ccd6e56a', free_tier_id, 'active', NOW() - INTERVAL '15 days'),
    ('041c2bad-db8e-48f0-8df6-4165ac89075f', pro_tier_id, 'active', NOW() - INTERVAL '180 days'),
    ('71a53184-c992-404d-b8e0-2b3a13acd63f', pro_tier_id, 'active', NOW() - INTERVAL '120 days'),
    ('62a6bafe-b994-497e-83b0-0c6b0b4ef284', pro_tier_id, 'active', NOW() - INTERVAL '200 days')
    ON CONFLICT (user_id, tier_id) DO NOTHING;

    GET DIAGNOSTICS subscription_count = ROW_COUNT;
    RAISE NOTICE '✅ Created % user subscriptions', subscription_count;
END $$;

-- ============================================================================
-- 6. FINAL SUMMARY
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '🎉 TEST USER DEPLOYMENT COMPLETED SUCCESSFULLY';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ WHAT WAS CREATED:';
    RAISE NOTICE '   • 6 test user profiles with actual Supabase UUIDs';
    RAISE NOTICE '   • 6 user role assignments for single-role testing';
    RAISE NOTICE '   • 6 user sessions with appropriate active roles';
    RAISE NOTICE '   • 6 user subscriptions (2 Free, 4 Pro)';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 TEST CREDENTIALS:';
    RAISE NOTICE '   • buyer.free@testuser.ardonie.com / TestUser123!';
    RAISE NOTICE '   • buyer.pro@testuser.ardonie.com / TestUser123!';
    RAISE NOTICE '   • seller.free@testuser.ardonie.com / TestUser123!';
    RAISE NOTICE '   • seller.pro@testuser.ardonie.com / TestUser123!';
    RAISE NOTICE '   • financial.vendor@testuser.ardonie.com / TestUser123!';
    RAISE NOTICE '   • legal.vendor@testuser.ardonie.com / TestUser123!';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 NEXT STEPS:';
    RAISE NOTICE '   1. Run database/VERIFY-ACTUAL-TEST-USERS.sql to confirm deployment';
    RAISE NOTICE '   2. Test authentication with the credentials above';
    RAISE NOTICE '   3. Verify role-based dashboard routing works';
    RAISE NOTICE '   4. Test subscription tier features (Free vs Pro)';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
END $$;
