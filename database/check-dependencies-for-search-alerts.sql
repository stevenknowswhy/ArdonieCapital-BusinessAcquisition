-- ============================================================================
-- DEPENDENCY CHECKER FOR SEARCH ALERTS SCHEMA
-- Run this BEFORE deploying saved-searches-schema to identify issues
-- ============================================================================

-- Check 1: Verify profiles table exists
SELECT 
    'PROFILES_TABLE' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING - Deploy core schema first' END as status;

-- Check 2: Verify uuid-ossp extension
SELECT 
    'UUID_EXTENSION' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
    ) THEN '✅ ENABLED' ELSE '❌ MISSING - Run: CREATE EXTENSION "uuid-ossp"' END as status;

-- Check 3: Verify auth schema exists (for RLS policies)
SELECT 
    'AUTH_SCHEMA' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING - Supabase auth not configured' END as status;

-- Check 4: Verify profiles table structure
SELECT 
    'PROFILES_STRUCTURE' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'id'
        AND data_type = 'uuid'
    ) THEN '✅ CORRECT' ELSE '❌ INVALID - profiles.id must be UUID' END as status;

-- Check 5: Verify if saved_searches already exists
SELECT 
    'SAVED_SEARCHES_EXISTS' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'saved_searches'
    ) THEN '⚠️ ALREADY EXISTS - Will be dropped and recreated' 
    ELSE '✅ READY - Table will be created' END as status;

-- Check 6: List all existing tables for reference
SELECT 
    'EXISTING_TABLES' as check_type,
    string_agg(table_name, ', ' ORDER BY table_name) as status
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check 7: Verify sample user exists for testing
SELECT 
    'SAMPLE_USERS' as check_type,
    CASE WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1)
    THEN '✅ ' || (SELECT COUNT(*)::text FROM profiles) || ' users available for testing'
    ELSE '⚠️ NO USERS - Sample data creation will be skipped' END as status;

-- ============================================================================
-- SUMMARY AND RECOMMENDATIONS
-- ============================================================================

DO $$
DECLARE
    profiles_exists BOOLEAN;
    uuid_enabled BOOLEAN;
    auth_exists BOOLEAN;
    can_deploy BOOLEAN := TRUE;
    issues TEXT := '';
BEGIN
    -- Check all dependencies
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) INTO profiles_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
    ) INTO uuid_enabled;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'
    ) INTO auth_exists;
    
    -- Build issues list
    IF NOT profiles_exists THEN
        can_deploy := FALSE;
        issues := issues || '- profiles table missing' || chr(10);
    END IF;
    
    IF NOT uuid_enabled THEN
        can_deploy := FALSE;
        issues := issues || '- uuid-ossp extension not enabled' || chr(10);
    END IF;
    
    IF NOT auth_exists THEN
        can_deploy := FALSE;
        issues := issues || '- auth schema missing (Supabase auth not configured)' || chr(10);
    END IF;
    
    -- Display results
    RAISE NOTICE '';
    RAISE NOTICE '🔍 DEPENDENCY CHECK RESULTS:';
    RAISE NOTICE '================================';
    
    IF can_deploy THEN
        RAISE NOTICE '✅ ALL DEPENDENCIES SATISFIED';
        RAISE NOTICE '🚀 Ready to deploy saved-searches-schema-fixed.sql';
        RAISE NOTICE '';
        RAISE NOTICE 'Next steps:';
        RAISE NOTICE '1. Copy database/saved-searches-schema-fixed.sql';
        RAISE NOTICE '2. Paste into Supabase SQL Editor';
        RAISE NOTICE '3. Click Run';
    ELSE
        RAISE NOTICE '❌ DEPLOYMENT BLOCKED - MISSING DEPENDENCIES:';
        RAISE NOTICE '%', issues;
        RAISE NOTICE '';
        RAISE NOTICE 'Required actions:';
        
        IF NOT profiles_exists THEN
            RAISE NOTICE '1. Deploy core schema: database/schema.sql or database/enhanced-schema.sql';
        END IF;
        
        IF NOT uuid_enabled THEN
            RAISE NOTICE '2. Enable UUID extension: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";';
        END IF;
        
        IF NOT auth_exists THEN
            RAISE NOTICE '3. Verify Supabase project configuration and authentication setup';
        END IF;
    END IF;
    
    RAISE NOTICE '';
END $$;
