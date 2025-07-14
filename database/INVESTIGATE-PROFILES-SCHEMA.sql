-- PROFILES TABLE SCHEMA INVESTIGATION
-- Purpose: Investigate the current profiles table schema to identify missing columns
-- Project: BuyMartV1 - Multi-Role Database Schema
-- Generated: 2025-07-12

-- ============================================================================
-- PROFILES TABLE SCHEMA ANALYSIS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 ============================================================================';
    RAISE NOTICE '🔍 INVESTIGATING PROFILES TABLE SCHEMA';
    RAISE NOTICE '🔍 ============================================================================';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. CHECK IF PROFILES TABLE EXISTS
-- ============================================================================

DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ profiles table exists';
    ELSE
        RAISE NOTICE '❌ profiles table does NOT exist';
        RAISE NOTICE '⚠️  This is a critical issue - profiles table must exist for the application to work';
    END IF;
END $$;

-- ============================================================================
-- 2. SHOW ALL COLUMNS IN PROFILES TABLE
-- ============================================================================

DO $$
DECLARE
    col_record RECORD;
    col_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 CURRENT PROFILES TABLE COLUMNS:';
    RAISE NOTICE '   Column Name | Data Type | Is Nullable | Default Value';
    RAISE NOTICE '   ------------|-----------|-------------|---------------';
    
    FOR col_record IN 
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '   % | % | % | %', 
            RPAD(col_record.column_name, 11), 
            RPAD(col_record.data_type, 9), 
            RPAD(col_record.is_nullable, 11),
            COALESCE(col_record.column_default, 'NULL');
        col_count := col_count + 1;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 Total columns in profiles table: %', col_count;
END $$;

-- ============================================================================
-- 3. CHECK FOR EXPECTED COLUMNS FROM TEST SCRIPT
-- ============================================================================

DO $$
DECLARE
    expected_columns TEXT[] := ARRAY[
        'user_id', 'email', 'first_name', 'last_name', 'role', 'phone', 
        'business_type', 'location', 'subscription_tier_id', 'subscription_status',
        'onboarding_completed', 'onboarding_step', 'company_id', 'legacy_role', 
        'migration_status'
    ];
    col_name TEXT;
    col_exists BOOLEAN;
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    existing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 CHECKING FOR EXPECTED COLUMNS FROM TEST SCRIPT:';
    RAISE NOTICE '';
    
    FOREACH col_name IN ARRAY expected_columns
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name = col_name
        ) INTO col_exists;
        
        IF col_exists THEN
            RAISE NOTICE '   ✅ % - EXISTS', col_name;
            existing_columns := array_append(existing_columns, col_name);
        ELSE
            RAISE NOTICE '   ❌ % - MISSING', col_name;
            missing_columns := array_append(missing_columns, col_name);
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 COLUMN ANALYSIS SUMMARY:';
    RAISE NOTICE '   • Existing columns: % of %', array_length(existing_columns, 1), array_length(expected_columns, 1);
    RAISE NOTICE '   • Missing columns: %', array_length(missing_columns, 1);
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '❌ MISSING COLUMNS THAT NEED TO BE ADDED:';
        FOREACH col_name IN ARRAY missing_columns
        LOOP
            RAISE NOTICE '   • %', col_name;
        END LOOP;
    END IF;
    
    IF array_length(existing_columns, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ EXISTING COLUMNS THAT CAN BE USED:';
        FOREACH col_name IN ARRAY existing_columns
        LOOP
            RAISE NOTICE '   • %', col_name;
        END LOOP;
    END IF;
END $$;

-- ============================================================================
-- 4. CHECK PROFILES TABLE CONSTRAINTS AND INDEXES
-- ============================================================================

DO $$
DECLARE
    constraint_record RECORD;
    index_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔗 PROFILES TABLE CONSTRAINTS:';
    
    FOR constraint_record IN 
        SELECT 
            constraint_name,
            constraint_type
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    LOOP
        RAISE NOTICE '   • % (%)', constraint_record.constraint_name, constraint_record.constraint_type;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📇 PROFILES TABLE INDEXES:';
    
    FOR index_record IN 
        SELECT 
            indexname,
            indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        RAISE NOTICE '   • %', index_record.indexname;
    END LOOP;
END $$;

-- ============================================================================
-- 5. CHECK SAMPLE DATA IN PROFILES TABLE
-- ============================================================================

DO $$
DECLARE
    row_count INTEGER;
    sample_record RECORD;
BEGIN
    SELECT COUNT(*) INTO row_count FROM profiles;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 PROFILES TABLE DATA:';
    RAISE NOTICE '   • Total rows: %', row_count;
    
    IF row_count > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '📋 SAMPLE PROFILE RECORD (first row):';
        
        -- Get the first record to see what data looks like
        FOR sample_record IN 
            SELECT * FROM profiles LIMIT 1
        LOOP
            -- This will show the structure of actual data
            RAISE NOTICE '   Sample record found - check actual columns in query result';
        END LOOP;
    ELSE
        RAISE NOTICE '   ℹ️  No data in profiles table yet';
    END IF;
END $$;

-- ============================================================================
-- 6. RECOMMENDATIONS BASED ON FINDINGS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '💡 ============================================================================';
    RAISE NOTICE '💡 RECOMMENDATIONS FOR FIXING TEST USER SCRIPT';
    RAISE NOTICE '💡 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 NEXT STEPS:';
    RAISE NOTICE '   1. Review the column analysis above';
    RAISE NOTICE '   2. Run PROFILES-SCHEMA-FIX.sql to add missing columns';
    RAISE NOTICE '   3. Use PROFILES-TEST-USERS-FIXED.sql for test user creation';
    RAISE NOTICE '   4. Note: email should be in auth.users, not profiles';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT NOTES:';
    RAISE NOTICE '   • Supabase stores email in auth.users table, not profiles';
    RAISE NOTICE '   • profiles.user_id should reference auth.users.id';
    RAISE NOTICE '   • Test users need to be created in Supabase Auth first';
    RAISE NOTICE '   • Then profiles can be created with user_id references';
    RAISE NOTICE '';
    RAISE NOTICE '💡 ============================================================================';
END $$;
