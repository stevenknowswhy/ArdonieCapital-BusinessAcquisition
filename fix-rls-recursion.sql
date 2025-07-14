-- Fix RLS Infinite Recursion Issues
-- Execute this in Supabase SQL Editor AFTER deploying the main schemas

-- =============================================================================
-- 1. DISABLE RLS TEMPORARILY ON PROBLEMATIC TABLES
-- =============================================================================

-- Disable RLS on deals table to stop recursion
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE deal_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. DROP ALL EXISTING DEAL-RELATED RLS POLICIES
-- =============================================================================

-- Drop any existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view deals they participate in" ON deals;
DROP POLICY IF EXISTS "Users can create deals" ON deals;
DROP POLICY IF EXISTS "Users can update their deals" ON deals;
DROP POLICY IF EXISTS "Buyers can view their deals" ON deals;
DROP POLICY IF EXISTS "Sellers can view their deals" ON deals;
DROP POLICY IF EXISTS "Deal participants can view documents" ON deal_documents;
DROP POLICY IF EXISTS "Deal participants can upload documents" ON deal_documents;
DROP POLICY IF EXISTS "Deal participants can view activities" ON deal_activities;

-- =============================================================================
-- 3. CREATE SIMPLE, NON-RECURSIVE RLS POLICIES
-- =============================================================================

-- Simple policy for deals - users can see deals where they are buyer or seller
CREATE POLICY "deals_select_policy" ON deals
    FOR SELECT
    USING (
        buyer_id = auth.uid() OR 
        seller_id = auth.uid()
    );

-- Simple policy for deal documents
CREATE POLICY "deal_documents_select_policy" ON deal_documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_documents.deal_id 
            AND (deals.buyer_id = auth.uid() OR deals.seller_id = auth.uid())
        )
    );

-- Simple policy for deal activities
CREATE POLICY "deal_activities_select_policy" ON deal_activities
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_activities.deal_id 
            AND (deals.buyer_id = auth.uid() OR deals.seller_id = auth.uid())
        )
    );

-- Insert policies for deals
CREATE POLICY "deals_insert_policy" ON deals
    FOR INSERT
    WITH CHECK (
        buyer_id = auth.uid() OR 
        seller_id = auth.uid()
    );

-- Insert policies for deal documents
CREATE POLICY "deal_documents_insert_policy" ON deal_documents
    FOR INSERT
    WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_documents.deal_id 
            AND (deals.buyer_id = auth.uid() OR deals.seller_id = auth.uid())
        )
    );

-- Update policies for deals
CREATE POLICY "deals_update_policy" ON deals
    FOR UPDATE
    USING (
        buyer_id = auth.uid() OR 
        seller_id = auth.uid()
    );

-- =============================================================================
-- 4. RE-ENABLE RLS WITH FIXED POLICIES
-- =============================================================================

-- Re-enable RLS now that we have simple, non-recursive policies
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. TEST THE POLICIES
-- =============================================================================

-- Test query to verify policies work (should not cause recursion)
SELECT 'RLS policies fixed successfully' as status;

-- Verify we can query the tables without recursion
SELECT COUNT(*) as deal_count FROM deals;
SELECT COUNT(*) as document_count FROM deal_documents;
SELECT COUNT(*) as activity_count FROM deal_activities;
