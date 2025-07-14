-- Enhanced RLS Policies for BuyMartV1
-- Row Level Security policies for the new enhanced schema tables
-- Run this after enhanced-schema.sql has been applied

-- ============================================================================
-- ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CONTENT PAGES (BLOG/CMS) POLICIES
-- ============================================================================

-- Public can view published content
CREATE POLICY "Anyone can view published content" ON content_pages
    FOR SELECT USING (status = 'published');

-- Authors can view their own content (any status)
CREATE POLICY "Authors can view their own content" ON content_pages
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = author_id)
    );

-- Authors can create content
CREATE POLICY "Authors can create content" ON content_pages
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = author_id)
    );

-- Authors can update their own content
CREATE POLICY "Authors can update their own content" ON content_pages
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = author_id)
    );

-- Authors can delete their own content
CREATE POLICY "Authors can delete their own content" ON content_pages
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = author_id)
    );

-- Admins can manage all content
CREATE POLICY "Admins can manage all content" ON content_pages
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE role = 'admin'
        )
    );

-- ============================================================================
-- BLOG CATEGORIES POLICIES
-- ============================================================================

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON blog_categories
    FOR SELECT USING (is_active = true);

-- Admins can view all categories
CREATE POLICY "Admins can view all categories" ON blog_categories
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE role = 'admin'
        )
    );

-- Only admins can manage categories
CREATE POLICY "Only admins can manage categories" ON blog_categories
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE role = 'admin'
        )
    );

-- ============================================================================
-- DOCUMENTS POLICIES
-- ============================================================================

-- Public documents are viewable by anyone
CREATE POLICY "Anyone can view public documents" ON documents
    FOR SELECT USING (access_level = 'public');

-- Authenticated users can view authenticated-level documents
CREATE POLICY "Authenticated users can view auth documents" ON documents
    FOR SELECT USING (
        access_level = 'authenticated' AND auth.uid() IS NOT NULL
    );

-- Premium users can view premium documents (implement premium role check)
CREATE POLICY "Premium users can view premium documents" ON documents
    FOR SELECT USING (
        access_level = 'premium' AND 
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE role IN ('admin') -- Extend with premium role logic
        )
    );

-- Admin-only documents
CREATE POLICY "Admins can view admin documents" ON documents
    FOR SELECT USING (
        access_level = 'admin' AND 
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE role = 'admin'
        )
    );

-- Users can upload documents
CREATE POLICY "Users can upload documents" ON documents
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = uploaded_by)
    );

-- Users can update their own documents
CREATE POLICY "Users can update their own documents" ON documents
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = uploaded_by)
    );

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents" ON documents
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = uploaded_by)
    );

-- Admins can manage all documents
CREATE POLICY "Admins can manage all documents" ON documents
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE role = 'admin'
        )
    );

-- ============================================================================
-- DEALS POLICIES
-- ============================================================================

-- Users can view deals they're involved in
CREATE POLICY "Users can view their deals" ON deals
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE id IN (buyer_id, seller_id, assigned_to)
        )
    );

-- Buyers can create deals
CREATE POLICY "Buyers can create deals" ON deals
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = buyer_id)
    );

-- Deal participants can update deals
CREATE POLICY "Deal participants can update deals" ON deals
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE id IN (buyer_id, seller_id, assigned_to)
        )
    );

-- Deal participants can delete deals (with restrictions)
CREATE POLICY "Deal participants can delete deals" ON deals
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE id IN (buyer_id, seller_id)
        ) AND status IN ('initial_interest', 'cancelled')
    );

-- Admins can manage all deals
CREATE POLICY "Admins can manage all deals" ON deals
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE role = 'admin'
        )
    );

-- ============================================================================
-- VENDORS POLICIES
-- ============================================================================

-- Anyone can view active verified vendors
CREATE POLICY "Anyone can view active vendors" ON vendors
    FOR SELECT USING (is_active = true AND verified = true);

-- Authenticated users can view all active vendors
CREATE POLICY "Authenticated users can view all active vendors" ON vendors
    FOR SELECT USING (
        is_active = true AND auth.uid() IS NOT NULL
    );

-- Vendors can view their own profile (any status)
CREATE POLICY "Vendors can view their own profile" ON vendors
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id)
    );

-- Users can create vendor profiles
CREATE POLICY "Users can create vendor profiles" ON vendors
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id)
    );

-- Vendors can update their own profile
CREATE POLICY "Vendors can update their own profile" ON vendors
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id)
    );

-- Vendors can delete their own profile
CREATE POLICY "Vendors can delete their own profile" ON vendors
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id)
    );

-- Admins can manage all vendor profiles
CREATE POLICY "Admins can manage all vendors" ON vendors
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE role = 'admin'
        )
    );

-- ============================================================================
-- VENDOR REVIEWS POLICIES
-- ============================================================================

-- Anyone can view reviews for active vendors
CREATE POLICY "Anyone can view vendor reviews" ON vendor_reviews
    FOR SELECT USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE is_active = true
        )
    );

-- Users can create reviews for vendors they've worked with
CREATE POLICY "Users can create vendor reviews" ON vendor_reviews
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = reviewer_id) AND
        (deal_id IS NULL OR deal_id IN (
            SELECT id FROM deals 
            WHERE buyer_id = reviewer_id OR seller_id = reviewer_id
        ))
    );

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON vendor_reviews
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = reviewer_id)
    );

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" ON vendor_reviews
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = reviewer_id)
    );

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews" ON vendor_reviews
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE role = 'admin'
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS FOR POLICY OPTIMIZATION
-- ============================================================================

-- Function to check if user is admin (for policy optimization)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns profile
CREATE OR REPLACE FUNCTION owns_profile(profile_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = profile_uuid AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is involved in deal
CREATE OR REPLACE FUNCTION involved_in_deal(deal_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM deals d
        JOIN profiles p ON p.id IN (d.buyer_id, d.seller_id, d.assigned_to)
        WHERE d.id = deal_uuid AND p.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant permissions on new tables
GRANT SELECT, INSERT, UPDATE, DELETE ON content_pages TO authenticated;
GRANT SELECT ON content_pages TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON blog_categories TO authenticated;
GRANT SELECT ON blog_categories TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;
GRANT SELECT ON documents TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON deals TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON vendors TO authenticated;
GRANT SELECT ON vendors TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_reviews TO authenticated;
GRANT SELECT ON vendor_reviews TO anon;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
    table_name TEXT;
    rls_enabled BOOLEAN;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t 
        WHERE t.table_schema = 'public' 
        AND t.table_name IN ('content_pages', 'blog_categories', 'documents', 'deals', 'vendors', 'vendor_reviews')
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class 
        WHERE relname = table_name;
        
        IF rls_enabled THEN
            RAISE NOTICE 'RLS enabled on table: %', table_name;
        ELSE
            RAISE WARNING 'RLS NOT enabled on table: %', table_name;
        END IF;
    END LOOP;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Enhanced RLS policies applied successfully!';
    RAISE NOTICE 'All new tables now have comprehensive Row Level Security';
    RAISE NOTICE 'Next step: Test the policies and deploy to production';
END $$;
