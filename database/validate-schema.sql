-- Database Schema Validation Script for BuyMartV1
-- Comprehensive validation of database structure, RLS policies, and data integrity
-- Run this to verify the database is properly configured

-- ============================================================================
-- VALIDATION FUNCTIONS
-- ============================================================================

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION validate_table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if RLS is enabled on a table
CREATE OR REPLACE FUNCTION validate_rls_enabled(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = $1 
        AND rowsecurity = true
    );
END;
$$ LANGUAGE plpgsql;

-- Function to count policies on a table
CREATE OR REPLACE FUNCTION count_table_policies(table_name TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = $1
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CORE TABLES VALIDATION
-- ============================================================================

SELECT 'CORE TABLES VALIDATION' as validation_section;

-- Check core tables exist
WITH core_tables AS (
    SELECT unnest(ARRAY[
        'profiles', 'listings', 'messages', 'notifications', 
        'saved_listings', 'search_history', 'analytics_events'
    ]) as table_name
),
validation_results AS (
    SELECT 
        table_name,
        validate_table_exists(table_name) as exists,
        CASE WHEN validate_table_exists(table_name) 
             THEN validate_rls_enabled(table_name) 
             ELSE false END as rls_enabled,
        CASE WHEN validate_table_exists(table_name) 
             THEN count_table_policies(table_name) 
             ELSE 0 END as policy_count
    FROM core_tables
)
SELECT 
    table_name,
    CASE WHEN exists THEN '✅' ELSE '❌' END as table_exists,
    CASE WHEN rls_enabled THEN '✅' ELSE '❌' END as rls_status,
    policy_count,
    CASE 
        WHEN NOT exists THEN '❌ TABLE MISSING'
        WHEN NOT rls_enabled THEN '⚠️ RLS DISABLED'
        WHEN policy_count = 0 THEN '⚠️ NO POLICIES'
        WHEN policy_count < 2 THEN '⚠️ FEW POLICIES'
        ELSE '✅ CONFIGURED'
    END as status
FROM validation_results
ORDER BY table_name;

-- ============================================================================
-- MULTI-ROLE SYSTEM VALIDATION
-- ============================================================================

SELECT 'MULTI-ROLE SYSTEM VALIDATION' as validation_section;

-- Check multi-role tables exist
WITH role_tables AS (
    SELECT unnest(ARRAY[
        'roles', 'user_roles', 'subscription_tiers', 'user_subscriptions'
    ]) as table_name
),
role_validation AS (
    SELECT 
        table_name,
        validate_table_exists(table_name) as exists,
        CASE WHEN validate_table_exists(table_name) 
             THEN validate_rls_enabled(table_name) 
             ELSE false END as rls_enabled,
        CASE WHEN validate_table_exists(table_name) 
             THEN count_table_policies(table_name) 
             ELSE 0 END as policy_count
    FROM role_tables
)
SELECT 
    table_name,
    CASE WHEN exists THEN '✅' ELSE '❌' END as table_exists,
    CASE WHEN rls_enabled THEN '✅' ELSE '❌' END as rls_status,
    policy_count,
    CASE 
        WHEN NOT exists THEN '❌ TABLE MISSING'
        WHEN NOT rls_enabled THEN '⚠️ RLS DISABLED'
        WHEN policy_count = 0 THEN '⚠️ NO POLICIES'
        ELSE '✅ CONFIGURED'
    END as status
FROM role_validation
ORDER BY table_name;

-- ============================================================================
-- HELPER FUNCTIONS VALIDATION
-- ============================================================================

SELECT 'HELPER FUNCTIONS VALIDATION' as validation_section;

-- Check if helper functions exist
WITH helper_functions AS (
    SELECT unnest(ARRAY[
        'auth.has_role', 'auth.has_any_role', 'auth.is_admin', 'auth.get_profile_id'
    ]) as function_name
)
SELECT 
    function_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname || '.' || p.proname = function_name
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM helper_functions;

-- ============================================================================
-- DATA INTEGRITY VALIDATION
-- ============================================================================

SELECT 'DATA INTEGRITY VALIDATION' as validation_section;

-- Check for orphaned records
SELECT 
    'profiles_without_auth_user' as check_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN '✅ CLEAN' ELSE '⚠️ ORPHANED' END as status
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.user_id);

-- Check for profiles without roles (if user_roles table exists)
DO $$
BEGIN
    IF validate_table_exists('user_roles') THEN
        PERFORM (
            SELECT 
                'profiles_without_roles' as check_name,
                COUNT(*) as count,
                CASE WHEN COUNT(*) = 0 THEN '✅ ALL_HAVE_ROLES' ELSE '⚠️ MISSING_ROLES' END as status
            FROM profiles p
            WHERE NOT EXISTS (
                SELECT 1 FROM user_roles ur 
                WHERE ur.user_id = p.user_id AND ur.is_active = true
            )
        );
    END IF;
END $$;

-- Check for active listings without valid sellers
SELECT 
    'active_listings_invalid_sellers' as check_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN '✅ VALID' ELSE '❌ INVALID' END as status
FROM listings l
WHERE l.status = 'active' 
AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = l.seller_id);

-- ============================================================================
-- SECURITY VALIDATION
-- ============================================================================

SELECT 'SECURITY VALIDATION' as validation_section;

-- Check RLS is enabled on all critical tables
WITH critical_tables AS (
    SELECT unnest(ARRAY[
        'profiles', 'listings', 'messages', 'notifications', 
        'saved_listings', 'user_roles', 'user_subscriptions'
    ]) as table_name
)
SELECT 
    'rls_coverage' as check_name,
    COUNT(*) as total_tables,
    SUM(CASE WHEN validate_rls_enabled(table_name) THEN 1 ELSE 0 END) as rls_enabled_count,
    CASE 
        WHEN COUNT(*) = SUM(CASE WHEN validate_rls_enabled(table_name) THEN 1 ELSE 0 END) 
        THEN '✅ FULL_COVERAGE' 
        ELSE '❌ INCOMPLETE' 
    END as status
FROM critical_tables;

-- Check for tables without policies
SELECT 
    'tables_without_policies' as check_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN '✅ ALL_PROTECTED' ELSE '⚠️ UNPROTECTED' END as status
FROM pg_tables t
WHERE t.schemaname = 'public' 
AND t.rowsecurity = true
AND NOT EXISTS (
    SELECT 1 FROM pg_policies p 
    WHERE p.schemaname = 'public' AND p.tablename = t.tablename
);

-- ============================================================================
-- PERFORMANCE VALIDATION
-- ============================================================================

SELECT 'PERFORMANCE VALIDATION' as validation_section;

-- Check for missing indexes on foreign keys
WITH foreign_keys AS (
    SELECT 
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
    AND tc.table_schema = 'public'
),
missing_indexes AS (
    SELECT 
        fk.table_name,
        fk.column_name
    FROM foreign_keys fk
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_indexes i
        WHERE i.schemaname = 'public'
        AND i.tablename = fk.table_name
        AND i.indexdef LIKE '%' || fk.column_name || '%'
    )
)
SELECT 
    'missing_fk_indexes' as check_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) = 0 THEN '✅ OPTIMIZED' ELSE '⚠️ NEEDS_INDEXES' END as status
FROM missing_indexes;

-- ============================================================================
-- OVERALL HEALTH SCORE
-- ============================================================================

SELECT 'OVERALL HEALTH SCORE' as validation_section;

WITH health_checks AS (
    -- Core tables check
    SELECT 
        CASE WHEN COUNT(*) = 7 THEN 20 ELSE (COUNT(*) * 20 / 7) END as core_tables_score
    FROM (
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('profiles', 'listings', 'messages', 'notifications', 'saved_listings', 'search_history', 'analytics_events')
    ) t
    
    UNION ALL
    
    -- RLS coverage check
    SELECT 
        CASE WHEN rls_count = total_count THEN 30 ELSE (rls_count * 30 / total_count) END as rls_score
    FROM (
        SELECT 
            COUNT(*) as total_count,
            SUM(CASE WHEN rowsecurity THEN 1 ELSE 0 END) as rls_count
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'listings', 'messages', 'notifications', 'saved_listings', 'user_roles')
    ) rls_check
    
    UNION ALL
    
    -- Policies check
    SELECT 
        CASE WHEN policy_count >= 15 THEN 25 ELSE (policy_count * 25 / 15) END as policies_score
    FROM (
        SELECT COUNT(*) as policy_count
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) policy_check
    
    UNION ALL
    
    -- Helper functions check
    SELECT 
        CASE WHEN function_count = 4 THEN 15 ELSE (function_count * 15 / 4) END as functions_score
    FROM (
        SELECT COUNT(*) as function_count
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'auth' 
        AND p.proname IN ('has_role', 'has_any_role', 'is_admin', 'get_profile_id')
    ) func_check
    
    UNION ALL
    
    -- Data integrity check
    SELECT 
        CASE WHEN orphaned_count = 0 THEN 10 ELSE GREATEST(0, 10 - orphaned_count) END as integrity_score
    FROM (
        SELECT COUNT(*) as orphaned_count
        FROM profiles p
        WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.user_id)
    ) integrity_check
)
SELECT 
    ROUND(SUM(core_tables_score), 0) as total_score,
    CASE 
        WHEN SUM(core_tables_score) >= 90 THEN '🟢 EXCELLENT'
        WHEN SUM(core_tables_score) >= 75 THEN '🟡 GOOD'
        WHEN SUM(core_tables_score) >= 60 THEN '🟠 FAIR'
        ELSE '🔴 NEEDS_ATTENTION'
    END as health_status,
    'Database validation complete. Review individual checks above for details.' as summary
FROM health_checks;

-- Clean up validation functions
DROP FUNCTION IF EXISTS validate_table_exists(TEXT);
DROP FUNCTION IF EXISTS validate_rls_enabled(TEXT);
DROP FUNCTION IF EXISTS count_table_policies(TEXT);
