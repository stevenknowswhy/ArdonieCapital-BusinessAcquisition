-- FIXED TEST USERS FOR PROFILES TABLE
-- Purpose: Create test user profiles that work with actual Supabase schema
-- Project: BuyMartV1 - Multi-Role Database Schema
-- Generated: 2025-07-12

-- ============================================================================
-- IMPORTANT: PREREQUISITES
-- ============================================================================
-- 1. Run PROFILES-SCHEMA-FIX.sql first to add missing columns
-- 2. Create auth.users entries through Supabase Auth Dashboard first
-- 3. Then run this script to create corresponding profiles

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 ============================================================================';
    RAISE NOTICE '🧪 CREATING FIXED TEST USER PROFILES';
    RAISE NOTICE '🧪 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ PREREQUISITES:';
    RAISE NOTICE '   1. PROFILES-SCHEMA-FIX.sql must be run first';
    RAISE NOTICE '   2. Auth users must be created in Supabase Dashboard';
    RAISE NOTICE '   3. Use these UUIDs when creating auth users:';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. SINGLE-ROLE TEST USER PROFILES
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
    financial_category_id UUID;
    legal_category_id UUID;
BEGIN
    -- Get required IDs
    SELECT id INTO buyer_role_id FROM roles WHERE slug = 'buyer';
    SELECT id INTO seller_role_id FROM roles WHERE slug = 'seller';
    SELECT id INTO financial_role_id FROM roles WHERE slug = 'financial_professional';
    SELECT id INTO legal_role_id FROM roles WHERE slug = 'legal_professional';
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';
    SELECT id INTO free_tier_id FROM subscription_tiers WHERE slug = 'free';
    SELECT id INTO pro_tier_id FROM subscription_tiers WHERE slug = 'pro';
    SELECT id INTO financial_category_id FROM vendor_categories WHERE slug = 'financial';
    SELECT id INTO legal_category_id FROM vendor_categories WHERE slug = 'legal';

    RAISE NOTICE '📋 Creating Single-Role Test User Profiles...';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 AUTH USER CREATION REQUIRED:';
    RAISE NOTICE '   Create these users in Supabase Auth Dashboard with these exact UUIDs:';
    RAISE NOTICE '';

    -- ========================================================================
    -- BUYER PROFILES
    -- ========================================================================
    
    RAISE NOTICE '   👤 buyer.free@testuser.ardonie.com';
    RAISE NOTICE '      UUID: 11111111-1111-1111-1111-111111111001';
    RAISE NOTICE '      Password: TestUser123!';
    
    -- Test Buyer 1: Free Tier
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '11111111-1111-1111-1111-111111111001',
        'Sarah', 'Johnson',
        'buyer',
        '+1-555-0101',
        'Individual Investor',
        'Austin, TX',
        free_tier_id,
        'free',
        false,
        2,
        default_company_id,
        'buyer',
        'migrated'
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

    RAISE NOTICE '   👤 buyer.pro@testuser.ardonie.com';
    RAISE NOTICE '      UUID: 11111111-1111-1111-1111-111111111002';
    RAISE NOTICE '      Password: TestUser123!';
    
    -- Test Buyer 2: Pro Tier
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '11111111-1111-1111-1111-111111111002',
        'Michael', 'Chen',
        'buyer',
        '+1-555-0102',
        'Private Equity Firm',
        'San Francisco, CA',
        pro_tier_id,
        'active',
        true,
        0,
        default_company_id,
        'buyer',
        'migrated'
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

    -- ========================================================================
    -- SELLER PROFILES
    -- ========================================================================
    
    RAISE NOTICE '   👤 seller.free@testuser.ardonie.com';
    RAISE NOTICE '      UUID: 22222222-2222-2222-2222-222222222001';
    RAISE NOTICE '      Password: TestUser123!';
    
    -- Test Seller 1: Free Tier
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '22222222-2222-2222-2222-222222222001',
        'Robert', 'Martinez',
        'seller',
        '+1-555-0201',
        'Auto Repair Shop',
        'Phoenix, AZ',
        free_tier_id,
        'free',
        false,
        3,
        default_company_id,
        'seller',
        'migrated'
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

    RAISE NOTICE '   👤 seller.pro@testuser.ardonie.com';
    RAISE NOTICE '      UUID: 22222222-2222-2222-2222-222222222002';
    RAISE NOTICE '      Password: TestUser123!';
    
    -- Test Seller 2: Pro Tier
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '22222222-2222-2222-2222-222222222002',
        'Jennifer', 'Williams',
        'seller',
        '+1-555-0202',
        'Multi-Location Auto Group',
        'Dallas, TX',
        pro_tier_id,
        'active',
        true,
        0,
        default_company_id,
        'seller',
        'migrated'
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

    -- ========================================================================
    -- VENDOR PROFILES
    -- ========================================================================

    RAISE NOTICE '   👤 financial.vendor@testuser.ardonie.com';
    RAISE NOTICE '      UUID: 33333333-3333-3333-3333-333333333001';
    RAISE NOTICE '      Password: TestUser123!';

    -- Financial Professional
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '33333333-3333-3333-3333-333333333001',
        'David', 'Thompson',
        'vendor',
        '+1-555-0301',
        'Financial Services',
        'Chicago, IL',
        pro_tier_id,
        'active',
        true,
        0,
        default_company_id,
        'vendor',
        'migrated'
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

    RAISE NOTICE '   👤 legal.vendor@testuser.ardonie.com';
    RAISE NOTICE '      UUID: 33333333-3333-3333-3333-333333333002';
    RAISE NOTICE '      Password: TestUser123!';

    -- Legal Professional
    INSERT INTO profiles (
        user_id, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '33333333-3333-3333-3333-333333333002',
        'Amanda', 'Rodriguez',
        'vendor',
        '+1-555-0302',
        'Legal Services',
        'Miami, FL',
        pro_tier_id,
        'active',
        true,
        0,
        default_company_id,
        'vendor',
        'migrated'
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

    RAISE NOTICE '';
    RAISE NOTICE '✅ Single-role test user profiles created successfully';
END $$;

-- ============================================================================
-- 2. CREATE USER ROLES FOR SINGLE-ROLE USERS
-- ============================================================================

DO $$
DECLARE
    buyer_role_id UUID;
    seller_role_id UUID;
    financial_role_id UUID;
    legal_role_id UUID;
    default_company_id UUID;
BEGIN
    -- Get required IDs
    SELECT id INTO buyer_role_id FROM roles WHERE slug = 'buyer';
    SELECT id INTO seller_role_id FROM roles WHERE slug = 'seller';
    SELECT id INTO financial_role_id FROM roles WHERE slug = 'financial_professional';
    SELECT id INTO legal_role_id FROM roles WHERE slug = 'legal_professional';
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';

    RAISE NOTICE '📋 Creating user role assignments...';

    -- Assign roles to test users
    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata) VALUES
    ('11111111-1111-1111-1111-111111111001', buyer_role_id, default_company_id, '11111111-1111-1111-1111-111111111001', true, '{"test_user": true, "category": "single_role_buyer", "tier": "free"}'),
    ('11111111-1111-1111-1111-111111111002', buyer_role_id, default_company_id, '11111111-1111-1111-1111-111111111002', true, '{"test_user": true, "category": "single_role_buyer", "tier": "pro"}'),
    ('22222222-2222-2222-2222-222222222001', seller_role_id, default_company_id, '22222222-2222-2222-2222-222222222001', true, '{"test_user": true, "category": "single_role_seller", "tier": "free"}'),
    ('22222222-2222-2222-2222-222222222002', seller_role_id, default_company_id, '22222222-2222-2222-2222-222222222002', true, '{"test_user": true, "category": "single_role_seller", "tier": "pro"}'),
    ('33333333-3333-3333-3333-333333333001', financial_role_id, default_company_id, '33333333-3333-3333-3333-333333333001', true, '{"test_user": true, "category": "single_role_vendor", "vendor_type": "financial"}'),
    ('33333333-3333-3333-3333-333333333002', legal_role_id, default_company_id, '33333333-3333-3333-3333-333333333002', true, '{"test_user": true, "category": "single_role_vendor", "vendor_type": "legal"}')
    ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    RAISE NOTICE '✅ User role assignments created successfully';
END $$;
