-- PROFILES TABLE SCHEMA FIX
-- Purpose: Add missing columns to profiles table for multi-role functionality
-- Project: BuyMartV1 - Multi-Role Database Schema
-- Generated: 2025-07-12

-- ============================================================================
-- PROFILES TABLE SCHEMA EXTENSION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 ============================================================================';
    RAISE NOTICE '🔧 FIXING PROFILES TABLE SCHEMA - ADDING MISSING COLUMNS';
    RAISE NOTICE '🔧 ============================================================================';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. ADD BUSINESS AND LOCATION COLUMNS
-- ============================================================================

DO $$
BEGIN
    -- Add business_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'business_type') THEN
        ALTER TABLE profiles ADD COLUMN business_type TEXT;
        RAISE NOTICE '✅ Added business_type column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ business_type column already exists in profiles';
    END IF;

    -- Add location column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE profiles ADD COLUMN location TEXT;
        RAISE NOTICE '✅ Added location column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ location column already exists in profiles';
    END IF;

    -- Add phone column (if it doesn't exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
        RAISE NOTICE '✅ Added phone column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ phone column already exists in profiles';
    END IF;
END $$;

-- ============================================================================
-- 2. ADD SUBSCRIPTION-RELATED COLUMNS
-- ============================================================================

DO $$
BEGIN
    -- Add subscription_tier_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_tier_id') THEN
        ALTER TABLE profiles ADD COLUMN subscription_tier_id UUID REFERENCES subscription_tiers(id);
        RAISE NOTICE '✅ Added subscription_tier_id column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ subscription_tier_id column already exists in profiles';
    END IF;

    -- Add subscription_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'free';
        RAISE NOTICE '✅ Added subscription_status column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ subscription_status column already exists in profiles';
    END IF;
END $$;

-- ============================================================================
-- 3. ADD ONBOARDING COLUMNS
-- ============================================================================

DO $$
BEGIN
    -- Add onboarding_completed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added onboarding_completed column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ onboarding_completed column already exists in profiles';
    END IF;

    -- Add onboarding_step column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'onboarding_step') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_step INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added onboarding_step column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ onboarding_step column already exists in profiles';
    END IF;
END $$;

-- ============================================================================
-- 4. ADD COMPANY AND MIGRATION COLUMNS
-- ============================================================================

DO $$
BEGIN
    -- Add company_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'company_id') THEN
        ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id);
        RAISE NOTICE '✅ Added company_id column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ company_id column already exists in profiles';
    END IF;

    -- Add legacy_role column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'legacy_role') THEN
        ALTER TABLE profiles ADD COLUMN legacy_role TEXT;
        RAISE NOTICE '✅ Added legacy_role column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ legacy_role column already exists in profiles';
    END IF;

    -- Add migration_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'migration_status') THEN
        ALTER TABLE profiles ADD COLUMN migration_status TEXT DEFAULT 'pending';
        RAISE NOTICE '✅ Added migration_status column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ migration_status column already exists in profiles';
    END IF;
END $$;

-- ============================================================================
-- 5. ADD INDEXES FOR NEW COLUMNS
-- ============================================================================

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_migration_status ON profiles(migration_status);
CREATE INDEX IF NOT EXISTS idx_profiles_business_type ON profiles(business_type);

DO $$
BEGIN
    RAISE NOTICE '✅ Created indexes for new profile columns';
END $$;

-- ============================================================================
-- 6. SET DEFAULT VALUES FOR EXISTING USERS
-- ============================================================================

DO $$
DECLARE
    default_company_id UUID;
    free_tier_id UUID;
    updated_count INTEGER;
BEGIN
    -- Get default company and free tier IDs
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';
    SELECT id INTO free_tier_id FROM subscription_tiers WHERE slug = 'free';
    
    -- Update existing users with default values
    UPDATE profiles 
    SET 
        company_id = default_company_id,
        subscription_tier_id = free_tier_id,
        subscription_status = 'free',
        onboarding_completed = CASE WHEN role IS NOT NULL THEN true ELSE false END,
        onboarding_step = CASE WHEN role IS NOT NULL THEN 0 ELSE 1 END,
        migration_status = CASE WHEN role IS NOT NULL THEN 'migrated' ELSE 'new' END
    WHERE 
        company_id IS NULL 
        OR subscription_tier_id IS NULL 
        OR subscription_status IS NULL
        OR onboarding_completed IS NULL
        OR onboarding_step IS NULL
        OR migration_status IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE '✅ Updated % existing profiles with default values', updated_count;
END $$;

-- ============================================================================
-- 7. VERIFY SCHEMA FIXES
-- ============================================================================

DO $$
DECLARE
    expected_columns TEXT[] := ARRAY[
        'business_type', 'location', 'phone', 'subscription_tier_id', 
        'subscription_status', 'onboarding_completed', 'onboarding_step', 
        'company_id', 'legacy_role', 'migration_status'
    ];
    col_name TEXT;
    col_exists BOOLEAN;
    missing_count INTEGER := 0;
    existing_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VERIFYING SCHEMA FIXES:';
    
    FOREACH col_name IN ARRAY expected_columns
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name = col_name
        ) INTO col_exists;
        
        IF col_exists THEN
            existing_count := existing_count + 1;
        ELSE
            missing_count := missing_count + 1;
            RAISE NOTICE '❌ Still missing: %', col_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 SCHEMA FIX RESULTS:';
    RAISE NOTICE '   • Successfully added: % columns', existing_count;
    RAISE NOTICE '   • Still missing: % columns', missing_count;
    
    IF missing_count = 0 THEN
        RAISE NOTICE '✅ All required columns have been added successfully!';
        RAISE NOTICE '✅ profiles table is now ready for test user creation';
    ELSE
        RAISE NOTICE '⚠️ Some columns are still missing - check errors above';
    END IF;
END $$;

-- ============================================================================
-- 8. FINAL SUMMARY
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '🎉 PROFILES TABLE SCHEMA FIX COMPLETED';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ WHAT WAS ADDED:';
    RAISE NOTICE '   • Business and location columns for user profiles';
    RAISE NOTICE '   • Subscription tier and status tracking';
    RAISE NOTICE '   • Onboarding progress tracking';
    RAISE NOTICE '   • Company association and migration status';
    RAISE NOTICE '   • Appropriate indexes for performance';
    RAISE NOTICE '   • Default values for existing users';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 NEXT STEPS:';
    RAISE NOTICE '   1. Run INVESTIGATE-PROFILES-SCHEMA.sql to verify changes';
    RAISE NOTICE '   2. Use PROFILES-TEST-USERS-FIXED.sql for test user creation';
    RAISE NOTICE '   3. Create auth.users entries through Supabase dashboard first';
    RAISE NOTICE '   4. Then run the fixed test user script';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ IMPORTANT NOTE:';
    RAISE NOTICE '   • email column is NOT in profiles (it''s in auth.users)';
    RAISE NOTICE '   • Test users must be created in Supabase Auth first';
    RAISE NOTICE '   • Then profiles can reference auth.users.id';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
END $$;
