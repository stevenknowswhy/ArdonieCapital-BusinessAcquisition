-- Deal Management RLS Policies (Safe Version)
-- Addresses infinite recursion issues by using simple, non-recursive policies
-- Execute this AFTER the deal-management-schema.sql has been deployed successfully

-- =============================================================================
-- CLEANUP: Remove any existing problematic policies
-- =============================================================================

-- Drop all existing deal-related policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view deals they participate in" ON deals;
DROP POLICY IF EXISTS "Users can create deals" ON deals;
DROP POLICY IF EXISTS "Users can update their deals" ON deals;
DROP POLICY IF EXISTS "Buyers can view their deals" ON deals;
DROP POLICY IF EXISTS "Sellers can view their deals" ON deals;
DROP POLICY IF EXISTS "Deal participants can view documents" ON deal_documents;
DROP POLICY IF EXISTS "Deal participants can upload documents" ON deal_documents;
DROP POLICY IF EXISTS "Deal participants can view activities" ON deal_activities;
DROP POLICY IF EXISTS "Deal participants can view milestones" ON deal_milestones;

-- Drop the new policy names we're about to create (COMPLETE LIST)
DROP POLICY IF EXISTS "deals_select_policy" ON deals;
DROP POLICY IF EXISTS "deals_insert_policy" ON deals;
DROP POLICY IF EXISTS "deals_update_policy" ON deals;
DROP POLICY IF EXISTS "deal_documents_select_policy" ON deal_documents;
DROP POLICY IF EXISTS "deal_documents_insert_policy" ON deal_documents;
DROP POLICY IF EXISTS "deal_documents_update_policy" ON deal_documents;
DROP POLICY IF EXISTS "deal_milestones_select_policy" ON deal_milestones;
DROP POLICY IF EXISTS "deal_milestones_insert_policy" ON deal_milestones;
DROP POLICY IF EXISTS "deal_milestones_update_policy" ON deal_milestones;
DROP POLICY IF EXISTS "deal_activities_select_policy" ON deal_activities;
DROP POLICY IF EXISTS "deal_activities_insert_policy" ON deal_activities;

-- Temporarily disable RLS to clear any recursive issues
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE deal_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE deal_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DEALS TABLE: Simple, non-recursive RLS policies
-- =============================================================================

-- Policy 1: Users can view deals where they are buyer or seller
CREATE POLICY "deals_select_policy" ON deals
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            buyer_id = auth.uid() OR 
            seller_id = auth.uid()
        )
    );

-- Policy 2: Users can insert deals where they are buyer or seller
CREATE POLICY "deals_insert_policy" ON deals
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            buyer_id = auth.uid() OR 
            seller_id = auth.uid()
        )
    );

-- Policy 3: Users can update deals where they are buyer or seller
CREATE POLICY "deals_update_policy" ON deals
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            buyer_id = auth.uid() OR 
            seller_id = auth.uid()
        )
    );

-- =============================================================================
-- DEAL DOCUMENTS TABLE: Simple policies based on deal ownership
-- =============================================================================

-- Policy 1: Users can view documents for deals they participate in
CREATE POLICY "deal_documents_select_policy" ON deal_documents
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_documents.deal_id 
            AND (deals.buyer_id = auth.uid() OR deals.seller_id = auth.uid())
        )
    );

-- Policy 2: Users can upload documents for deals they participate in
CREATE POLICY "deal_documents_insert_policy" ON deal_documents
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_documents.deal_id 
            AND (deals.buyer_id = auth.uid() OR deals.seller_id = auth.uid())
        )
    );

-- Policy 3: Users can update documents they uploaded
CREATE POLICY "deal_documents_update_policy" ON deal_documents
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND
        uploaded_by = auth.uid()
    );

-- =============================================================================
-- DEAL MILESTONES TABLE: Simple policies based on deal ownership
-- =============================================================================

-- Policy 1: Users can view milestones for deals they participate in
CREATE POLICY "deal_milestones_select_policy" ON deal_milestones
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_milestones.deal_id 
            AND (deals.buyer_id = auth.uid() OR deals.seller_id = auth.uid())
        )
    );

-- Policy 2: Users can create milestones for deals they participate in
CREATE POLICY "deal_milestones_insert_policy" ON deal_milestones
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_milestones.deal_id 
            AND (deals.buyer_id = auth.uid() OR deals.seller_id = auth.uid())
        )
    );

-- Policy 3: Users can update milestones for deals they participate in
CREATE POLICY "deal_milestones_update_policy" ON deal_milestones
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_milestones.deal_id 
            AND (deals.buyer_id = auth.uid() OR deals.seller_id = auth.uid())
        )
    );

-- =============================================================================
-- DEAL ACTIVITIES TABLE: Simple policies based on deal ownership
-- =============================================================================

-- Policy 1: Users can view activities for deals they participate in
CREATE POLICY "deal_activities_select_policy" ON deal_activities
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_activities.deal_id 
            AND (deals.buyer_id = auth.uid() OR deals.seller_id = auth.uid())
        )
    );

-- Policy 2: Users can create activities for deals they participate in
CREATE POLICY "deal_activities_insert_policy" ON deal_activities
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_activities.deal_id 
            AND (deals.buyer_id = auth.uid() OR deals.seller_id = auth.uid())
        )
    );

-- =============================================================================
-- RE-ENABLE RLS: Turn RLS back on with safe policies
-- =============================================================================

-- Re-enable RLS now that we have simple, non-recursive policies
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- VERIFICATION: Test that policies work without recursion
-- =============================================================================

-- Test queries to verify policies work (should not cause recursion)
DO $$
BEGIN
    -- Test basic table access
    PERFORM COUNT(*) FROM deals;
    PERFORM COUNT(*) FROM deal_documents;
    PERFORM COUNT(*) FROM deal_milestones;
    PERFORM COUNT(*) FROM deal_activities;
    
    RAISE NOTICE 'RLS policies deployed successfully without recursion!';
    RAISE NOTICE 'All deal management tables are now secured with proper access control';
END $$;
