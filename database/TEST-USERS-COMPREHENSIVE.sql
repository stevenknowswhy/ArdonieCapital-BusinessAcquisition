-- COMPREHENSIVE TEST USERS FOR MULTI-ROLE SYSTEM VALIDATION
-- Project: BuyMartV1 - Ardonie Capital Multi-Role Database
-- Purpose: Create diverse test users to validate authentication flows and role-based functionality
-- Generated: 2025-07-12

-- ============================================================================
-- IMPORTANT: TEST DATA IDENTIFICATION
-- ============================================================================
-- All test users have email addresses ending with @testuser.ardonie.com
-- This allows easy identification and cleanup of test data
-- DO NOT use these accounts for production purposes

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 ============================================================================';
    RAISE NOTICE '🧪 CREATING COMPREHENSIVE TEST USERS FOR MULTI-ROLE VALIDATION';
    RAISE NOTICE '🧪 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Test User Categories:';
    RAISE NOTICE '   • Single-role users (direct dashboard routing)';
    RAISE NOTICE '   • Multi-role users (role selection interface)';
    RAISE NOTICE '   • Admin users (administrative functionality)';
    RAISE NOTICE '   • Content users (blog/content management)';
    RAISE NOTICE '   • Vendor professionals (financial & legal services)';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 All test emails end with @testuser.ardonie.com';
    RAISE NOTICE '🔑 Default password for all test users: TestUser123!';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. SINGLE-ROLE USERS (Direct Dashboard Routing)
-- ============================================================================

-- Get required IDs for role assignments
DO $$
DECLARE
    buyer_role_id UUID;
    seller_role_id UUID;
    vendor_role_id UUID;
    financial_role_id UUID;
    legal_role_id UUID;
    default_company_id UUID;
    free_tier_id UUID;
    pro_tier_id UUID;
    financial_category_id UUID;
    legal_category_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO buyer_role_id FROM roles WHERE slug = 'buyer';
    SELECT id INTO seller_role_id FROM roles WHERE slug = 'seller';
    SELECT id INTO vendor_role_id FROM roles WHERE slug = 'vendor';
    SELECT id INTO financial_role_id FROM roles WHERE slug = 'financial_professional';
    SELECT id INTO legal_role_id FROM roles WHERE slug = 'legal_professional';
    
    -- Get company and subscription IDs
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';
    SELECT id INTO free_tier_id FROM subscription_tiers WHERE slug = 'free';
    SELECT id INTO pro_tier_id FROM subscription_tiers WHERE slug = 'pro';
    
    -- Get vendor category IDs
    SELECT id INTO financial_category_id FROM vendor_categories WHERE slug = 'financial';
    SELECT id INTO legal_category_id FROM vendor_categories WHERE slug = 'legal';

    RAISE NOTICE '📋 Creating Single-Role Test Users...';

    -- ========================================================================
    -- BUYER ONLY USERS
    -- ========================================================================
    
    -- Test Buyer 1: Free Tier - New User
    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '11111111-1111-1111-1111-111111111001',
        'buyer.free@testuser.ardonie.com',
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
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Assign buyer role
    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '11111111-1111-1111-1111-111111111001',
        buyer_role_id,
        default_company_id,
        '11111111-1111-1111-1111-111111111001',
        true,
        '{"test_user": true, "category": "single_role_buyer", "tier": "free"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    -- Create user session
    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '11111111-1111-1111-1111-111111111001',
        buyer_role_id,
        '{"test_user": true, "dashboard_theme": "light", "notifications": true}'
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Create subscription
    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '11111111-1111-1111-1111-111111111001',
        free_tier_id,
        'active',
        NOW() - INTERVAL '30 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    -- Test Buyer 2: Pro Tier - Experienced User
    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '11111111-1111-1111-1111-111111111002',
        'buyer.pro@testuser.ardonie.com',
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
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '11111111-1111-1111-1111-111111111002',
        buyer_role_id,
        default_company_id,
        '11111111-1111-1111-1111-111111111002',
        true,
        '{"test_user": true, "category": "single_role_buyer", "tier": "pro"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '11111111-1111-1111-1111-111111111002',
        buyer_role_id,
        '{"test_user": true, "dashboard_theme": "dark", "notifications": true, "advanced_filters": true}'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '11111111-1111-1111-1111-111111111002',
        pro_tier_id,
        'active',
        NOW() - INTERVAL '90 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    -- ========================================================================
    -- SELLER ONLY USERS
    -- ========================================================================
    
    -- Test Seller 1: Free Tier - First-time Seller
    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '22222222-2222-2222-2222-222222222001',
        'seller.free@testuser.ardonie.com',
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
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '22222222-2222-2222-2222-222222222001',
        seller_role_id,
        default_company_id,
        '22222222-2222-2222-2222-222222222001',
        true,
        '{"test_user": true, "category": "single_role_seller", "tier": "free", "business_type": "auto_repair"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '22222222-2222-2222-2222-222222222001',
        seller_role_id,
        '{"test_user": true, "dashboard_theme": "light", "listing_alerts": true}'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '22222222-2222-2222-2222-222222222001',
        free_tier_id,
        'active',
        NOW() - INTERVAL '15 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    -- Test Seller 2: Pro Tier - Multi-location Owner
    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '22222222-2222-2222-2222-222222222002',
        'seller.pro@testuser.ardonie.com',
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
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '22222222-2222-2222-2222-222222222002',
        seller_role_id,
        default_company_id,
        '22222222-2222-2222-2222-222222222002',
        true,
        '{"test_user": true, "category": "single_role_seller", "tier": "pro", "business_type": "multi_location"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '22222222-2222-2222-2222-222222222002',
        seller_role_id,
        '{"test_user": true, "dashboard_theme": "dark", "analytics_enabled": true, "priority_support": true}'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '22222222-2222-2222-2222-222222222002',
        pro_tier_id,
        'active',
        NOW() - INTERVAL '180 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    -- ========================================================================
    -- VENDOR ONLY USERS
    -- ========================================================================

    -- Test Financial Professional: CPA/Business Broker
    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '33333333-3333-3333-3333-333333333001',
        'financial.vendor@testuser.ardonie.com',
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
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '33333333-3333-3333-3333-333333333001',
        financial_role_id,
        default_company_id,
        '33333333-3333-3333-3333-333333333001',
        true,
        '{"test_user": true, "category": "single_role_vendor", "vendor_type": "financial", "specialization": "business_valuation"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '33333333-3333-3333-3333-333333333001',
        financial_role_id,
        '{"test_user": true, "dashboard_theme": "professional", "client_management": true, "financial_tools": true}'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '33333333-3333-3333-3333-333333333001',
        pro_tier_id,
        'active',
        NOW() - INTERVAL '120 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    -- Create vendor profile for financial professional
    INSERT INTO vendor_profiles (
        user_id, category_id, business_name, license_number, license_state,
        certifications, specializations, service_areas, hourly_rate, minimum_engagement,
        availability_status, bio, years_experience, verification_status, verified_at
    ) VALUES (
        '33333333-3333-3333-3333-333333333001',
        financial_category_id,
        'Thompson Financial Advisory',
        'CPA-IL-12345',
        'IL',
        '["CPA", "Business Broker License", "CVA Certification"]',
        '["Business Valuation", "M&A Advisory", "Financial Due Diligence", "Tax Planning"]',
        '["Illinois", "Indiana", "Wisconsin"]',
        350.00,
        5000.00,
        'available',
        'Experienced CPA and business broker specializing in automotive industry transactions. 15+ years helping buyers and sellers navigate complex deals.',
        15,
        'verified',
        NOW() - INTERVAL '60 days'
    ) ON CONFLICT (user_id, category_id) DO NOTHING;

    -- Test Legal Professional: Business Attorney
    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '33333333-3333-3333-3333-333333333002',
        'legal.vendor@testuser.ardonie.com',
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
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '33333333-3333-3333-3333-333333333002',
        legal_role_id,
        default_company_id,
        '33333333-3333-3333-3333-333333333002',
        true,
        '{"test_user": true, "category": "single_role_vendor", "vendor_type": "legal", "specialization": "business_law"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '33333333-3333-3333-3333-333333333002',
        legal_role_id,
        '{"test_user": true, "dashboard_theme": "professional", "legal_tools": true, "document_management": true}'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '33333333-3333-3333-3333-333333333002',
        pro_tier_id,
        'active',
        NOW() - INTERVAL '200 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    -- Create vendor profile for legal professional
    INSERT INTO vendor_profiles (
        user_id, category_id, business_name, license_number, license_state,
        certifications, specializations, service_areas, hourly_rate, minimum_engagement,
        availability_status, bio, years_experience, verification_status, verified_at
    ) VALUES (
        '33333333-3333-3333-3333-333333333002',
        legal_category_id,
        'Rodriguez Business Law Group',
        'FL-BAR-67890',
        'FL',
        '["Florida Bar", "Business Law Certification", "M&A Specialist"]',
        '["Business Acquisitions", "Contract Law", "Corporate Structure", "Regulatory Compliance"]',
        '["Florida", "Georgia", "South Carolina"]',
        425.00,
        7500.00,
        'available',
        'Business attorney with extensive experience in automotive industry acquisitions and regulatory compliance. Specializes in complex M&A transactions.',
        12,
        'verified',
        NOW() - INTERVAL '45 days'
    ) ON CONFLICT (user_id, category_id) DO NOTHING;

    RAISE NOTICE '✅ Single-role test users created successfully';
END $$;

-- ============================================================================
-- 2. MULTI-ROLE USERS (Role Selection Interface Testing)
-- ============================================================================

DO $$
DECLARE
    buyer_role_id UUID;
    seller_role_id UUID;
    vendor_role_id UUID;
    financial_role_id UUID;
    legal_role_id UUID;
    default_company_id UUID;
    free_tier_id UUID;
    pro_tier_id UUID;
    financial_category_id UUID;
    legal_category_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO buyer_role_id FROM roles WHERE slug = 'buyer';
    SELECT id INTO seller_role_id FROM roles WHERE slug = 'seller';
    SELECT id INTO vendor_role_id FROM roles WHERE slug = 'vendor';
    SELECT id INTO financial_role_id FROM roles WHERE slug = 'financial_professional';
    SELECT id INTO legal_role_id FROM roles WHERE slug = 'legal_professional';

    -- Get company and subscription IDs
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';
    SELECT id INTO free_tier_id FROM subscription_tiers WHERE slug = 'free';
    SELECT id INTO pro_tier_id FROM subscription_tiers WHERE slug = 'pro';

    -- Get vendor category IDs
    SELECT id INTO financial_category_id FROM vendor_categories WHERE slug = 'financial';
    SELECT id INTO legal_category_id FROM vendor_categories WHERE slug = 'legal';

    RAISE NOTICE '📋 Creating Multi-Role Test Users...';

    -- ========================================================================
    -- BUYER + SELLER COMBINATION
    -- ========================================================================

    -- Test User: Buyer + Seller (Business Owner looking to buy and sell)
    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '44444444-4444-4444-4444-444444444001',
        'buyer.seller@testuser.ardonie.com',
        'James', 'Anderson',
        'buyer',  -- Primary role for legacy compatibility
        '+1-555-0401',
        'Auto Service Chain Owner',
        'Atlanta, GA',
        pro_tier_id,
        'active',
        true,
        0,
        default_company_id,
        'buyer',
        'migrated'
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Assign buyer role
    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '44444444-4444-4444-4444-444444444001',
        buyer_role_id,
        default_company_id,
        '44444444-4444-4444-4444-444444444001',
        true,
        '{"test_user": true, "category": "multi_role", "roles": ["buyer", "seller"], "primary_role": "buyer"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    -- Assign seller role
    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '44444444-4444-4444-4444-444444444001',
        seller_role_id,
        default_company_id,
        '44444444-4444-4444-4444-444444444001',
        true,
        '{"test_user": true, "category": "multi_role", "roles": ["buyer", "seller"], "secondary_role": "seller"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    -- Create user session with buyer as active role
    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '44444444-4444-4444-4444-444444444001',
        buyer_role_id,
        '{"test_user": true, "multi_role": true, "available_roles": ["buyer", "seller"], "role_switch_count": 0}'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '44444444-4444-4444-4444-444444444001',
        pro_tier_id,
        'active',
        NOW() - INTERVAL '150 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    -- ========================================================================
    -- BUYER + FINANCIAL VENDOR COMBINATION
    -- ========================================================================

    -- Test User: Buyer + Financial Professional (Investment Advisor who also buys)
    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '44444444-4444-4444-4444-444444444002',
        'buyer.financial@testuser.ardonie.com',
        'Lisa', 'Parker',
        'buyer',  -- Primary role for legacy compatibility
        '+1-555-0402',
        'Investment Advisory & Auto Acquisition',
        'Denver, CO',
        pro_tier_id,
        'active',
        true,
        0,
        default_company_id,
        'buyer',
        'migrated'
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Assign buyer role
    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '44444444-4444-4444-4444-444444444002',
        buyer_role_id,
        default_company_id,
        '44444444-4444-4444-4444-444444444002',
        true,
        '{"test_user": true, "category": "multi_role", "roles": ["buyer", "financial_professional"], "primary_role": "buyer"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    -- Assign financial professional role
    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '44444444-4444-4444-4444-444444444002',
        financial_role_id,
        default_company_id,
        '44444444-4444-4444-4444-444444444002',
        true,
        '{"test_user": true, "category": "multi_role", "roles": ["buyer", "financial_professional"], "secondary_role": "financial_professional"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    -- Create user session with buyer as active role
    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '44444444-4444-4444-4444-444444444002',
        buyer_role_id,
        '{"test_user": true, "multi_role": true, "available_roles": ["buyer", "financial_professional"], "role_switch_count": 0}'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '44444444-4444-4444-4444-444444444002',
        pro_tier_id,
        'active',
        NOW() - INTERVAL '75 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    -- Create vendor profile for financial services
    INSERT INTO vendor_profiles (
        user_id, category_id, business_name, license_number, license_state,
        certifications, specializations, service_areas, hourly_rate, minimum_engagement,
        availability_status, bio, years_experience, verification_status, verified_at
    ) VALUES (
        '44444444-4444-4444-4444-444444444002',
        financial_category_id,
        'Parker Investment & Auto Advisory',
        'CFA-CO-54321',
        'CO',
        '["CFA", "Series 7", "Series 66", "Business Broker License"]',
        '["Investment Analysis", "Business Valuation", "Portfolio Management", "Auto Industry Expertise"]',
        '["Colorado", "Wyoming", "Utah"]',
        300.00,
        3000.00,
        'available',
        'CFA and licensed business broker with dual expertise in investment management and automotive industry acquisitions.',
        10,
        'verified',
        NOW() - INTERVAL '30 days'
    ) ON CONFLICT (user_id, category_id) DO NOTHING;

    RAISE NOTICE '✅ Multi-role test users created successfully';
END $$;

-- ============================================================================
-- 3. ADMIN USERS (Administrative Functionality Testing)
-- ============================================================================

DO $$
DECLARE
    super_admin_role_id UUID;
    company_admin_role_id UUID;
    admin_role_id UUID;
    default_company_id UUID;
    pro_tier_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO super_admin_role_id FROM roles WHERE slug = 'super_admin';
    SELECT id INTO company_admin_role_id FROM roles WHERE slug = 'company_admin';
    SELECT id INTO admin_role_id FROM roles WHERE slug = 'admin';

    -- Get company and subscription IDs
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';
    SELECT id INTO pro_tier_id FROM subscription_tiers WHERE slug = 'pro';

    RAISE NOTICE '📋 Creating Admin Test Users...';

    -- ========================================================================
    -- SUPER ADMIN USER
    -- ========================================================================

    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '55555555-5555-5555-5555-555555555001',
        'super.admin@testuser.ardonie.com',
        'Alex', 'Morgan',
        'admin',  -- Legacy role for compatibility
        '+1-555-0501',
        'Platform Administration',
        'Austin, TX',
        pro_tier_id,
        'active',
        true,
        0,
        default_company_id,
        'admin',
        'migrated'
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Assign super admin role
    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '55555555-5555-5555-5555-555555555001',
        super_admin_role_id,
        default_company_id,
        '55555555-5555-5555-5555-555555555001',
        true,
        '{"test_user": true, "category": "admin", "admin_level": "super", "permissions": "all"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    -- Also assign legacy admin role for backward compatibility
    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '55555555-5555-5555-5555-555555555001',
        admin_role_id,
        default_company_id,
        '55555555-5555-5555-5555-555555555001',
        true,
        '{"test_user": true, "category": "admin", "admin_level": "legacy", "compatibility": true}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '55555555-5555-5555-5555-555555555001',
        super_admin_role_id,
        '{"test_user": true, "admin_dashboard": true, "system_monitoring": true, "user_management": true}'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '55555555-5555-5555-5555-555555555001',
        pro_tier_id,
        'active',
        NOW() - INTERVAL '365 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    -- ========================================================================
    -- COMPANY ADMIN USER
    -- ========================================================================

    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '55555555-5555-5555-5555-555555555002',
        'company.admin@testuser.ardonie.com',
        'Taylor', 'Davis',
        'admin',  -- Legacy role for compatibility
        '+1-555-0502',
        'Company Management',
        'Austin, TX',
        pro_tier_id,
        'active',
        true,
        0,
        default_company_id,
        'admin',
        'migrated'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '55555555-5555-5555-5555-555555555002',
        company_admin_role_id,
        default_company_id,
        '55555555-5555-5555-5555-555555555001',  -- Assigned by super admin
        true,
        '{"test_user": true, "category": "admin", "admin_level": "company", "scope": "ardonie_capital"}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '55555555-5555-5555-5555-555555555002',
        company_admin_role_id,
        '{"test_user": true, "company_dashboard": true, "user_management": true, "company_settings": true}'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '55555555-5555-5555-5555-555555555002',
        pro_tier_id,
        'active',
        NOW() - INTERVAL '300 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    RAISE NOTICE '✅ Admin test users created successfully';
END $$;

-- ============================================================================
-- 4. CONTENT USERS (Blog/Content Management Testing)
-- ============================================================================

DO $$
DECLARE
    blog_editor_role_id UUID;
    blog_contributor_role_id UUID;
    default_company_id UUID;
    free_tier_id UUID;
    pro_tier_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO blog_editor_role_id FROM roles WHERE slug = 'blog_editor';
    SELECT id INTO blog_contributor_role_id FROM roles WHERE slug = 'blog_contributor';

    -- Get company and subscription IDs
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';
    SELECT id INTO free_tier_id FROM subscription_tiers WHERE slug = 'free';
    SELECT id INTO pro_tier_id FROM subscription_tiers WHERE slug = 'pro';

    RAISE NOTICE '📋 Creating Content Management Test Users...';

    -- ========================================================================
    -- BLOG EDITOR USER
    -- ========================================================================

    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '66666666-6666-6666-6666-666666666001',
        'blog.editor@testuser.ardonie.com',
        'Morgan', 'Lee',
        'buyer',  -- Default role for legacy compatibility
        '+1-555-0601',
        'Content Management',
        'Austin, TX',
        pro_tier_id,
        'active',
        true,
        0,
        default_company_id,
        'buyer',
        'migrated'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '66666666-6666-6666-6666-666666666001',
        blog_editor_role_id,
        default_company_id,
        '55555555-5555-5555-5555-555555555001',  -- Assigned by super admin
        true,
        '{"test_user": true, "category": "content", "content_role": "editor", "permissions": ["create", "edit", "publish", "delete"]}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '66666666-6666-6666-6666-666666666001',
        blog_editor_role_id,
        '{"test_user": true, "blog_dashboard": true, "content_management": true, "publishing_tools": true}'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '66666666-6666-6666-6666-666666666001',
        pro_tier_id,
        'active',
        NOW() - INTERVAL '180 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    -- ========================================================================
    -- BLOG CONTRIBUTOR USER
    -- ========================================================================

    INSERT INTO profiles (
        user_id, email, first_name, last_name, role, phone, business_type, location,
        subscription_tier_id, subscription_status, onboarding_completed, onboarding_step,
        company_id, legacy_role, migration_status
    ) VALUES (
        '66666666-6666-6666-6666-666666666002',
        'blog.contributor@testuser.ardonie.com',
        'Jordan', 'Smith',
        'buyer',  -- Default role for legacy compatibility
        '+1-555-0602',
        'Content Creation',
        'Remote',
        free_tier_id,
        'free',
        true,
        0,
        default_company_id,
        'buyer',
        'migrated'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, is_active, metadata)
    VALUES (
        '66666666-6666-6666-6666-666666666002',
        blog_contributor_role_id,
        default_company_id,
        '66666666-6666-6666-6666-666666666001',  -- Assigned by blog editor
        true,
        '{"test_user": true, "category": "content", "content_role": "contributor", "permissions": ["create", "edit"]}'
    ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

    INSERT INTO user_sessions (user_id, active_role_id, preferences)
    VALUES (
        '66666666-6666-6666-6666-666666666002',
        blog_contributor_role_id,
        '{"test_user": true, "blog_dashboard": true, "content_creation": true, "draft_management": true}'
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    VALUES (
        '66666666-6666-6666-6666-666666666002',
        free_tier_id,
        'active',
        NOW() - INTERVAL '60 days'
    ) ON CONFLICT (user_id, tier_id) DO NOTHING;

    RAISE NOTICE '✅ Content management test users created successfully';
END $$;

-- ============================================================================
-- 5. DASHBOARD PREFERENCES FOR ALL TEST USERS
-- ============================================================================

-- Create dashboard preferences for all test users based on their roles
INSERT INTO dashboard_preferences (user_id, role_slug, layout_config, widget_preferences, notification_settings, theme_settings) VALUES
-- Single-role buyers
('11111111-1111-1111-1111-111111111001', 'buyer',
 '{"layout": "grid", "columns": 3, "sections": ["overview", "saved_listings", "recent_activity", "quick_match"]}',
 '{"kpi_cards": true, "recent_listings": true, "saved_searches": true, "notifications": true, "quick_actions": ["search", "save", "contact"]}',
 '{"email": true, "push": false, "sms": false, "frequency": "daily"}',
 '{"mode": "light", "accent_color": "blue", "compact_view": false}'),

('11111111-1111-1111-1111-111111111002', 'buyer',
 '{"layout": "grid", "columns": 4, "sections": ["overview", "saved_listings", "analytics", "recent_activity", "market_insights"]}',
 '{"kpi_cards": true, "recent_listings": true, "saved_searches": true, "notifications": true, "analytics": true, "advanced_filters": true}',
 '{"email": true, "push": true, "sms": true, "frequency": "immediate"}',
 '{"mode": "dark", "accent_color": "green", "compact_view": true}'),

-- Single-role sellers
('22222222-2222-2222-2222-222222222001', 'seller',
 '{"layout": "grid", "columns": 3, "sections": ["overview", "my_listings", "inquiries", "performance"]}',
 '{"kpi_cards": true, "listing_performance": true, "inquiries": true, "notifications": true, "listing_tools": true}',
 '{"email": true, "push": false, "sms": false, "frequency": "daily"}',
 '{"mode": "light", "accent_color": "orange", "compact_view": false}'),

('22222222-2222-2222-2222-222222222002', 'seller',
 '{"layout": "grid", "columns": 4, "sections": ["overview", "my_listings", "inquiries", "analytics", "market_trends"]}',
 '{"kpi_cards": true, "listing_performance": true, "inquiries": true, "notifications": true, "analytics": true, "priority_support": true}',
 '{"email": true, "push": true, "sms": true, "frequency": "immediate"}',
 '{"mode": "dark", "accent_color": "purple", "compact_view": true}'),

-- Vendor professionals
('33333333-3333-3333-3333-333333333001', 'financial_professional',
 '{"layout": "grid", "columns": 4, "sections": ["overview", "client_pipeline", "financial_tools", "market_analysis"]}',
 '{"kpi_cards": true, "client_pipeline": true, "financial_tools": true, "market_data": true, "professional_network": true}',
 '{"email": true, "push": true, "sms": true, "frequency": "immediate"}',
 '{"mode": "professional", "accent_color": "navy", "compact_view": false}'),

('33333333-3333-3333-3333-333333333002', 'legal_professional',
 '{"layout": "grid", "columns": 4, "sections": ["overview", "client_cases", "legal_tools", "document_management"]}',
 '{"kpi_cards": true, "client_pipeline": true, "legal_tools": true, "document_management": true, "compliance_alerts": true}',
 '{"email": true, "push": true, "sms": true, "frequency": "immediate"}',
 '{"mode": "professional", "accent_color": "burgundy", "compact_view": false}'),

-- Multi-role users (create preferences for each role)
('44444444-4444-4444-4444-444444444001', 'buyer',
 '{"layout": "grid", "columns": 3, "sections": ["overview", "saved_listings", "recent_activity"]}',
 '{"kpi_cards": true, "recent_listings": true, "saved_searches": true, "role_switcher": true}',
 '{"email": true, "push": true, "sms": false, "frequency": "daily"}',
 '{"mode": "auto", "accent_color": "teal", "compact_view": false}'),

('44444444-4444-4444-4444-444444444001', 'seller',
 '{"layout": "grid", "columns": 3, "sections": ["overview", "my_listings", "inquiries"]}',
 '{"kpi_cards": true, "listing_performance": true, "inquiries": true, "role_switcher": true}',
 '{"email": true, "push": true, "sms": false, "frequency": "daily"}',
 '{"mode": "auto", "accent_color": "teal", "compact_view": false}'),

('44444444-4444-4444-4444-444444444002', 'buyer',
 '{"layout": "grid", "columns": 4, "sections": ["overview", "saved_listings", "analytics", "investment_tools"]}',
 '{"kpi_cards": true, "recent_listings": true, "investment_analysis": true, "role_switcher": true}',
 '{"email": true, "push": true, "sms": true, "frequency": "immediate"}',
 '{"mode": "professional", "accent_color": "gold", "compact_view": true}'),

('44444444-4444-4444-4444-444444444002', 'financial_professional',
 '{"layout": "grid", "columns": 4, "sections": ["overview", "client_pipeline", "financial_tools", "investment_portfolio"]}',
 '{"kpi_cards": true, "client_pipeline": true, "financial_tools": true, "investment_tracking": true, "role_switcher": true}',
 '{"email": true, "push": true, "sms": true, "frequency": "immediate"}',
 '{"mode": "professional", "accent_color": "gold", "compact_view": true}'),

-- Admin users
('55555555-5555-5555-5555-555555555001', 'super_admin',
 '{"layout": "grid", "columns": 4, "sections": ["overview", "user_management", "system_health", "analytics", "audit_log"]}',
 '{"kpi_cards": true, "user_stats": true, "system_metrics": true, "audit_log": true, "admin_tools": true}',
 '{"email": true, "push": true, "sms": true, "frequency": "immediate"}',
 '{"mode": "admin", "accent_color": "red", "compact_view": false}'),

('55555555-5555-5555-5555-555555555002', 'company_admin',
 '{"layout": "grid", "columns": 3, "sections": ["overview", "company_users", "company_settings", "reports"]}',
 '{"kpi_cards": true, "user_management": true, "company_metrics": true, "reports": true}',
 '{"email": true, "push": true, "sms": false, "frequency": "daily"}',
 '{"mode": "admin", "accent_color": "blue", "compact_view": false}'),

-- Content users
('66666666-6666-6666-6666-666666666001', 'blog_editor',
 '{"layout": "grid", "columns": 3, "sections": ["overview", "content_management", "publishing_queue", "analytics"]}',
 '{"kpi_cards": true, "content_stats": true, "publishing_tools": true, "seo_tools": true}',
 '{"email": true, "push": true, "sms": false, "frequency": "daily"}',
 '{"mode": "content", "accent_color": "green", "compact_view": false}'),

('66666666-6666-6666-6666-666666666002', 'blog_contributor',
 '{"layout": "grid", "columns": 2, "sections": ["overview", "my_drafts", "content_calendar"]}',
 '{"kip_cards": true, "draft_management": true, "content_calendar": true, "writing_tools": true}',
 '{"email": true, "push": false, "sms": false, "frequency": "weekly"}',
 '{"mode": "content", "accent_color": "green", "compact_view": true}')

ON CONFLICT (user_id, role_slug) DO NOTHING;

-- ============================================================================
-- 6. FINAL SUMMARY AND TESTING INSTRUCTIONS
-- ============================================================================

DO $$
DECLARE
    total_test_users INTEGER;
    single_role_users INTEGER;
    multi_role_users INTEGER;
    admin_users INTEGER;
    content_users INTEGER;
    vendor_profiles INTEGER;
    dashboard_prefs INTEGER;
BEGIN
    -- Count test users
    SELECT COUNT(*) INTO total_test_users FROM profiles WHERE email LIKE '%@testuser.ardonie.com';
    SELECT COUNT(*) INTO single_role_users FROM profiles WHERE email LIKE '%@testuser.ardonie.com' AND user_id::text LIKE '11111111%' OR user_id::text LIKE '22222222%' OR user_id::text LIKE '33333333%';
    SELECT COUNT(*) INTO multi_role_users FROM profiles WHERE email LIKE '%@testuser.ardonie.com' AND user_id::text LIKE '44444444%';
    SELECT COUNT(*) INTO admin_users FROM profiles WHERE email LIKE '%@testuser.ardonie.com' AND user_id::text LIKE '55555555%';
    SELECT COUNT(*) INTO content_users FROM profiles WHERE email LIKE '%@testuser.ardonie.com' AND user_id::text LIKE '66666666%';
    SELECT COUNT(*) INTO vendor_profiles FROM vendor_profiles WHERE user_id IN (SELECT user_id FROM profiles WHERE email LIKE '%@testuser.ardonie.com');
    SELECT COUNT(*) INTO dashboard_prefs FROM dashboard_preferences WHERE user_id IN (SELECT user_id FROM profiles WHERE email LIKE '%@testuser.ardonie.com');

    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '🎉 COMPREHENSIVE TEST USERS CREATED SUCCESSFULLY!';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 TEST USER SUMMARY:';
    RAISE NOTICE '   • Total test users created: %', total_test_users;
    RAISE NOTICE '   • Single-role users: % (Buyer, Seller, Vendor)', single_role_users;
    RAISE NOTICE '   • Multi-role users: % (Buyer+Seller, Buyer+Vendor)', multi_role_users;
    RAISE NOTICE '   • Admin users: % (Super Admin, Company Admin)', admin_users;
    RAISE NOTICE '   • Content users: % (Blog Editor, Contributor)', content_users;
    RAISE NOTICE '   • Vendor profiles: %', vendor_profiles;
    RAISE NOTICE '   • Dashboard preferences: %', dashboard_prefs;
    RAISE NOTICE '';
    RAISE NOTICE '🔐 LOGIN CREDENTIALS:';
    RAISE NOTICE '   • All test emails end with: @testuser.ardonie.com';
    RAISE NOTICE '   • Default password for all: TestUser123!';
    RAISE NOTICE '   • Test users are clearly marked for easy cleanup';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTING SCENARIOS:';
    RAISE NOTICE '';
    RAISE NOTICE '   📋 SINGLE-ROLE TESTING (Direct Dashboard Routing):';
    RAISE NOTICE '      • buyer.free@testuser.ardonie.com → Buyer Dashboard (Free Tier)';
    RAISE NOTICE '      • buyer.pro@testuser.ardonie.com → Buyer Dashboard (Pro Tier)';
    RAISE NOTICE '      • seller.free@testuser.ardonie.com → Seller Dashboard (Free Tier)';
    RAISE NOTICE '      • seller.pro@testuser.ardonie.com → Seller Dashboard (Pro Tier)';
    RAISE NOTICE '      • financial.vendor@testuser.ardonie.com → Financial Vendor Dashboard';
    RAISE NOTICE '      • legal.vendor@testuser.ardonie.com → Legal Vendor Dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '   🎭 MULTI-ROLE TESTING (Role Selection Interface):';
    RAISE NOTICE '      • buyer.seller@testuser.ardonie.com → Role Selection → Choose Role';
    RAISE NOTICE '      • buyer.financial@testuser.ardonie.com → Role Selection → Choose Role';
    RAISE NOTICE '      • Test role switching within dashboard settings';
    RAISE NOTICE '';
    RAISE NOTICE '   👑 ADMIN TESTING (Administrative Functions):';
    RAISE NOTICE '      • super.admin@testuser.ardonie.com → Super Admin Dashboard';
    RAISE NOTICE '      • company.admin@testuser.ardonie.com → Company Admin Dashboard';
    RAISE NOTICE '      • Test user management, system settings, audit logs';
    RAISE NOTICE '';
    RAISE NOTICE '   📝 CONTENT TESTING (Blog/Content Management):';
    RAISE NOTICE '      • blog.editor@testuser.ardonie.com → Blog Editor Dashboard';
    RAISE NOTICE '      • blog.contributor@testuser.ardonie.com → Blog Contributor Dashboard';
    RAISE NOTICE '      • Test content creation, editing, publishing workflows';
    RAISE NOTICE '';
    RAISE NOTICE '   💰 SUBSCRIPTION TESTING (Feature Access Control):';
    RAISE NOTICE '      • Free tier users: Limited features, search restrictions';
    RAISE NOTICE '      • Pro tier users: Full features, unlimited access';
    RAISE NOTICE '      • Test feature restrictions and upgrade prompts';
    RAISE NOTICE '';
    RAISE NOTICE '   🏢 VENDOR TESTING (Professional Services):';
    RAISE NOTICE '      • Financial professionals: Business valuation tools';
    RAISE NOTICE '      • Legal professionals: Contract and compliance tools';
    RAISE NOTICE '      • Test vendor profiles, service listings, client management';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 VALIDATION CHECKLIST:';
    RAISE NOTICE '   □ Single-role users redirect to correct dashboard';
    RAISE NOTICE '   □ Multi-role users see role selection interface';
    RAISE NOTICE '   □ Role switching works in dashboard settings';
    RAISE NOTICE '   □ Subscription tiers show correct feature access';
    RAISE NOTICE '   □ Admin users can access administrative functions';
    RAISE NOTICE '   □ Content users can manage blog/content workflows';
    RAISE NOTICE '   □ Vendor professionals have specialized tools';
    RAISE NOTICE '   □ Dashboard preferences load correctly for each role';
    RAISE NOTICE '   □ KPI cards show real data (not mock data)';
    RAISE NOTICE '   □ Navigation and UI adapt to user roles';
    RAISE NOTICE '';
    RAISE NOTICE '🧹 CLEANUP INSTRUCTIONS:';
    RAISE NOTICE '   To remove all test users after testing:';
    RAISE NOTICE '   DELETE FROM profiles WHERE email LIKE ''%%@testuser.ardonie.com'';';
    RAISE NOTICE '   (This will cascade delete all related records)';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '🎉 TEST USERS READY - BEGIN MULTI-ROLE SYSTEM VALIDATION!';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '';
END $$;
