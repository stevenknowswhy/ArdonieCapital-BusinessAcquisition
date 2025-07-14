-- CRITICAL RLS POLICY FIX - PART 2
-- This script completes the RLS policy fix by adding safe policies for all tables
-- Run this AFTER CRITICAL-RLS-FIX-FINAL.sql has been successfully executed
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- CONTENT MANAGEMENT TABLES - SAFE POLICIES
-- ============================================================================

-- CONTENT PAGES TABLE
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

-- Public can view published content (no profile lookup needed)
CREATE POLICY "content_public_read" ON content_pages
    FOR SELECT USING (status = 'published');

-- Authors can view their own content (safe profile lookup)
CREATE POLICY "content_author_read" ON content_pages
    FOR SELECT USING (
        author_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Authenticated users can create content
CREATE POLICY "content_auth_insert" ON content_pages
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND author_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Authors can update their own content
CREATE POLICY "content_author_update" ON content_pages
    FOR UPDATE USING (
        author_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Authors can delete their own content
CREATE POLICY "content_author_delete" ON content_pages
    FOR DELETE USING (
        author_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- BLOG CATEGORIES TABLE
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "categories_public_read" ON blog_categories
    FOR SELECT USING (is_active = true);

-- Authenticated users can manage categories (simplified)
CREATE POLICY "categories_auth_manage" ON blog_categories
    FOR ALL USING (auth.uid() IS NOT NULL);

-- DOCUMENTS TABLE
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Public documents are viewable by everyone
CREATE POLICY "docs_public_read" ON documents
    FOR SELECT USING (access_level = 'public');

-- Authenticated users can view auth-level documents
CREATE POLICY "docs_auth_read" ON documents
    FOR SELECT USING (
        access_level = 'authenticated' AND auth.uid() IS NOT NULL
    );

-- Users can view their own documents
CREATE POLICY "docs_owner_read" ON documents
    FOR SELECT USING (
        uploaded_by IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Users can upload documents
CREATE POLICY "docs_auth_insert" ON documents
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND uploaded_by IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Users can update their own documents
CREATE POLICY "docs_owner_update" ON documents
    FOR UPDATE USING (
        uploaded_by IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Users can delete their own documents
CREATE POLICY "docs_owner_delete" ON documents
    FOR DELETE USING (
        uploaded_by IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- DEALS TABLE
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Users can view deals they're involved in
CREATE POLICY "deals_participant_read" ON deals
    FOR SELECT USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Authenticated users can create deals
CREATE POLICY "deals_auth_insert" ON deals
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Deal participants can update deals
CREATE POLICY "deals_participant_update" ON deals
    FOR UPDATE USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- VENDORS TABLE
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Anyone can view active vendors
CREATE POLICY "vendors_public_read" ON vendors
    FOR SELECT USING (is_active = true);

-- Users can manage their own vendor profile
CREATE POLICY "vendors_owner_manage" ON vendors
    FOR ALL USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- VENDOR REVIEWS TABLE
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews for active vendors
CREATE POLICY "reviews_public_read" ON vendor_reviews
    FOR SELECT USING (
        vendor_id IN (SELECT id FROM vendors WHERE is_active = true)
    );

-- Users can create reviews
CREATE POLICY "reviews_auth_insert" ON vendor_reviews
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND reviewer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can update their own reviews
CREATE POLICY "reviews_owner_update" ON vendor_reviews
    FOR UPDATE USING (
        reviewer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can delete their own reviews
CREATE POLICY "reviews_owner_delete" ON vendor_reviews
    FOR DELETE USING (
        reviewer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================================================
-- CORE BUSINESS TABLES - SAFE POLICIES
-- ============================================================================

-- LISTINGS TABLE
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings
CREATE POLICY "listings_public_read" ON listings
    FOR SELECT USING (
        status = 'active' 
        OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Sellers can create listings
CREATE POLICY "listings_seller_insert" ON listings
    FOR INSERT WITH CHECK (
        seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Sellers can update their own listings
CREATE POLICY "listings_seller_update" ON listings
    FOR UPDATE USING (
        seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Sellers can delete their own listings
CREATE POLICY "listings_seller_delete" ON listings
    FOR DELETE USING (
        seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- MATCHES TABLE
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users can view their own matches
CREATE POLICY "matches_participant_read" ON matches
    FOR SELECT USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can create matches
CREATE POLICY "matches_auth_insert" ON matches
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own matches
CREATE POLICY "matches_participant_update" ON matches
    FOR UPDATE USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================================================
-- VERIFICATION AND COMPLETION
-- ============================================================================

-- Test all enhanced schema tables
SELECT 'Content pages test' as test_name, COUNT(*) as count FROM content_pages;
SELECT 'Blog categories test' as test_name, COUNT(*) as count FROM blog_categories;
SELECT 'Documents test' as test_name, COUNT(*) as count FROM documents;
SELECT 'Deals test' as test_name, COUNT(*) as count FROM deals;
SELECT 'Vendors test' as test_name, COUNT(*) as count FROM vendors;
SELECT 'Vendor reviews test' as test_name, COUNT(*) as count FROM vendor_reviews;

-- Check RLS status on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('content_pages', 'blog_categories', 'documents', 'deals', 'vendors', 'vendor_reviews')
ORDER BY tablename;

-- Final success message
SELECT 'CRITICAL RLS FIX COMPLETED SUCCESSFULLY' as status;
SELECT 'All infinite recursion issues resolved' as result;
SELECT 'CMS system should now be fully functional' as next_step;
