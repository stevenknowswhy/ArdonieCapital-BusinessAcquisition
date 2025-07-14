-- ============================================================================
-- RLS POLICY GAPS FIX: deal_notes and deal_valuations Tables
-- ============================================================================
-- This script addresses the remaining security gaps identified by the Supabase
-- database linter: RLS enabled but no policies defined for deal_notes and 
-- deal_valuations tables.

-- ============================================================================
-- STEP 1: VERIFY TABLE EXISTENCE AND CURRENT RLS STATUS
-- ============================================================================

-- Check if tables exist and their RLS status
SELECT 
    'TABLE_EXISTENCE_CHECK' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('deal_notes', 'deal_valuations')
ORDER BY tablename;

-- ============================================================================
-- STEP 2: CONDITIONAL RLS POLICIES FOR deal_notes TABLE
-- ============================================================================

-- Check if deal_notes table exists before creating policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deal_notes') THEN
        -- Drop existing policies (conflict-safe)
        DROP POLICY IF EXISTS "deal_notes_select_participants" ON deal_notes;
        DROP POLICY IF EXISTS "deal_notes_insert_participants" ON deal_notes;
        DROP POLICY IF EXISTS "deal_notes_update_author" ON deal_notes;
        DROP POLICY IF EXISTS "deal_notes_delete_author" ON deal_notes;

        -- Policy: Deal participants can view notes
        CREATE POLICY "deal_notes_select_participants" ON deal_notes
            FOR SELECT USING (
                auth.uid() IS NOT NULL AND
                deal_id IN (
                    SELECT id FROM deals 
                    WHERE buyer_id = get_user_profile_id() 
                    OR seller_id = get_user_profile_id()
                )
            );

        -- Policy: Deal participants can create notes
        CREATE POLICY "deal_notes_insert_participants" ON deal_notes
            FOR INSERT WITH CHECK (
                auth.uid() IS NOT NULL AND
                user_id = get_user_profile_id() AND
                deal_id IN (
                    SELECT id FROM deals
                    WHERE buyer_id = get_user_profile_id()
                    OR seller_id = get_user_profile_id()
                )
            );

        -- Policy: Authors can update their own notes
        CREATE POLICY "deal_notes_update_author" ON deal_notes
            FOR UPDATE USING (
                auth.uid() IS NOT NULL AND
                user_id = get_user_profile_id()
            );

        -- Policy: Authors can delete their own notes
        CREATE POLICY "deal_notes_delete_author" ON deal_notes
            FOR DELETE USING (
                auth.uid() IS NOT NULL AND
                user_id = get_user_profile_id()
            );

        RAISE NOTICE 'RLS policies created for deal_notes table';
    ELSE
        RAISE NOTICE 'deal_notes table does not exist - skipping policy creation';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: CONDITIONAL RLS POLICIES FOR deal_valuations TABLE
-- ============================================================================

-- Check if deal_valuations table exists before creating policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deal_valuations') THEN
        -- Drop existing policies (conflict-safe)
        DROP POLICY IF EXISTS "deal_valuations_select_participants" ON deal_valuations;
        DROP POLICY IF EXISTS "deal_valuations_insert_participants" ON deal_valuations;
        DROP POLICY IF EXISTS "deal_valuations_update_creator" ON deal_valuations;

        -- Policy: Deal participants can view valuations
        CREATE POLICY "deal_valuations_select_participants" ON deal_valuations
            FOR SELECT USING (
                auth.uid() IS NOT NULL AND
                deal_id IN (
                    SELECT id FROM deals 
                    WHERE buyer_id = get_user_profile_id() 
                    OR seller_id = get_user_profile_id()
                )
            );

        -- Policy: Deal participants can create valuations
        CREATE POLICY "deal_valuations_insert_participants" ON deal_valuations
            FOR INSERT WITH CHECK (
                auth.uid() IS NOT NULL AND
                performed_by = get_user_profile_id() AND
                deal_id IN (
                    SELECT id FROM deals
                    WHERE buyer_id = get_user_profile_id()
                    OR seller_id = get_user_profile_id()
                )
            );

        -- Policy: Creators can update their own valuations
        CREATE POLICY "deal_valuations_update_creator" ON deal_valuations
            FOR UPDATE USING (
                auth.uid() IS NOT NULL AND
                performed_by = get_user_profile_id()
            );

        RAISE NOTICE 'RLS policies created for deal_valuations table';
    ELSE
        RAISE NOTICE 'deal_valuations table does not exist - skipping policy creation';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: VERIFICATION AND TESTING
-- ============================================================================

-- Verify policies are created for existing tables
SELECT 
    'POLICY_VERIFICATION' as check_type,
    tablename,
    policyname,
    cmd as policy_type,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has conditions'
        ELSE 'No conditions'
    END as has_conditions
FROM pg_policies 
WHERE tablename IN ('deal_notes', 'deal_valuations')
ORDER BY tablename, policyname;

-- Test table access (should not return errors for existing tables)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deal_notes') THEN
        PERFORM COUNT(*) FROM deal_notes WHERE 1=0;
        RAISE NOTICE 'deal_notes table access test: SUCCESS';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deal_valuations') THEN
        PERFORM COUNT(*) FROM deal_valuations WHERE 1=0;
        RAISE NOTICE 'deal_valuations table access test: SUCCESS';
    END IF;
END $$;

-- ============================================================================
-- STEP 5: FINAL STATUS REPORT
-- ============================================================================

-- Generate final status report
SELECT 
    'RLS_POLICY_GAPS_FIX_COMPLETE' as status,
    'RLS policy gaps addressed for existing tables' as result,
    'Tables with RLS enabled now have appropriate policies or do not exist' as details;

-- Show final RLS status for all tables
SELECT 
    'FINAL_RLS_STATUS' as report_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count,
    CASE 
        WHEN rowsecurity = true AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) > 0 THEN '✅ SECURE'
        WHEN rowsecurity = true AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) = 0 THEN '❌ BLOCKED'
        WHEN rowsecurity = false THEN '⚠️ NO_RLS'
        ELSE '❓ UNKNOWN'
    END as security_status
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('deal_notes', 'deal_valuations')
ORDER BY tablename;
