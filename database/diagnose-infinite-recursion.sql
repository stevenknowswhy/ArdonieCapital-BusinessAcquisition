-- COMPREHENSIVE INFINITE RECURSION DIAGNOSTIC
-- This script identifies ALL possible sources of infinite recursion in deal_participants table
-- Run this to understand why the recursion persists despite previous fixes

-- =============================================================================
-- STEP 1: CHECK ALL POLICIES ON DEAL_PARTICIPANTS TABLE
-- =============================================================================

SELECT 'CHECKING ALL POLICIES ON DEAL_PARTICIPANTS TABLE' as diagnostic_step;

-- List ALL policies on deal_participants table
SELECT 
    'DEAL_PARTICIPANTS_POLICIES' as policy_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'deal_participants'
ORDER BY policyname;

-- =============================================================================
-- STEP 2: CHECK ALL POLICIES ON RELATED TABLES
-- =============================================================================

SELECT 'CHECKING POLICIES ON RELATED TABLES' as diagnostic_step;

-- Check policies on deals table
SELECT 
    'DEALS_POLICIES' as policy_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'deals'
ORDER BY policyname;

-- Check policies on profiles table (foreign key target)
SELECT 
    'PROFILES_POLICIES' as policy_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =============================================================================
-- STEP 3: CHECK RLS STATUS ON ALL TABLES
-- =============================================================================

SELECT 'CHECKING RLS STATUS ON ALL TABLES' as diagnostic_step;

SELECT 
    'RLS_STATUS' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('deal_participants', 'deals', 'profiles', 'deal_documents', 'deal_activities', 'deal_milestones')
ORDER BY tablename;

-- =============================================================================
-- STEP 4: CHECK FOREIGN KEY CONSTRAINTS
-- =============================================================================

SELECT 'CHECKING FOREIGN KEY CONSTRAINTS' as diagnostic_step;

SELECT 
    'FOREIGN_KEYS' as constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'deal_participants';

-- =============================================================================
-- STEP 5: CHECK FOR TRIGGERS
-- =============================================================================

SELECT 'CHECKING FOR TRIGGERS ON DEAL_PARTICIPANTS' as diagnostic_step;

SELECT 
    'TRIGGERS' as trigger_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'deal_participants';

-- =============================================================================
-- STEP 6: CHECK TABLE STRUCTURE
-- =============================================================================

SELECT 'CHECKING TABLE STRUCTURE' as diagnostic_step;

SELECT 
    'TABLE_COLUMNS' as structure_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'deal_participants' 
ORDER BY ordinal_position;

-- =============================================================================
-- STEP 7: TEST BASIC ACCESS PATTERNS
-- =============================================================================

SELECT 'TESTING BASIC ACCESS PATTERNS' as diagnostic_step;

-- Test 1: Check if table exists
SELECT 
    'TABLE_EXISTS' as test_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deal_participants') 
        THEN 'YES' 
        ELSE 'NO' 
    END as result;

-- Test 2: Count total rows (this might trigger recursion)
SELECT 'ATTEMPTING ROW COUNT TEST' as test_type;

-- =============================================================================
-- STEP 8: CHECK FOR CIRCULAR POLICY REFERENCES
-- =============================================================================

SELECT 'CHECKING FOR CIRCULAR POLICY REFERENCES' as diagnostic_step;

-- Look for policies that might reference each other
WITH policy_references AS (
    SELECT 
        tablename,
        policyname,
        qual,
        with_check,
        CASE 
            WHEN qual LIKE '%deal_participants%' OR with_check LIKE '%deal_participants%' THEN 'REFERENCES_DEAL_PARTICIPANTS'
            WHEN qual LIKE '%deals%' OR with_check LIKE '%deals%' THEN 'REFERENCES_DEALS'
            WHEN qual LIKE '%profiles%' OR with_check LIKE '%profiles%' THEN 'REFERENCES_PROFILES'
            ELSE 'NO_OBVIOUS_REFERENCES'
        END as reference_type
    FROM pg_policies 
    WHERE tablename IN ('deal_participants', 'deals', 'profiles')
)
SELECT 
    'CIRCULAR_REFERENCES' as analysis_type,
    tablename,
    policyname,
    reference_type
FROM policy_references
WHERE reference_type != 'NO_OBVIOUS_REFERENCES'
ORDER BY tablename, reference_type;

-- =============================================================================
-- STEP 9: CHECK AUTH CONTEXT
-- =============================================================================

SELECT 'CHECKING AUTH CONTEXT' as diagnostic_step;

-- Check if auth.uid() is available
SELECT 
    'AUTH_CONTEXT' as context_type,
    CASE 
        WHEN auth.uid() IS NULL THEN 'NO_AUTH_USER'
        ELSE 'AUTH_USER_PRESENT'
    END as auth_status;

-- =============================================================================
-- STEP 10: SUMMARY AND RECOMMENDATIONS
-- =============================================================================

SELECT 'DIAGNOSTIC SUMMARY' as final_step;

SELECT 
    'SUMMARY' as summary_type,
    'Check the results above to identify:' as instruction_1,
    '1. Policies with complex qual/with_check expressions' as instruction_2,
    '2. Circular references between tables' as instruction_3,
    '3. Foreign key constraints causing issues' as instruction_4,
    '4. Triggers that might be interfering' as instruction_5,
    '5. RLS enabled on referenced tables' as instruction_6;

-- Final diagnostic query
SELECT 
    'DIAGNOSTIC_COMPLETE' as status,
    'Review all results above to identify recursion source' as next_step,
    'Focus on policies with EXISTS clauses or complex joins' as recommendation;
