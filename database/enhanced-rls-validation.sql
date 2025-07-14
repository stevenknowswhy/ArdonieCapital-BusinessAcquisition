-- Enhanced RLS Validation and Security Policies for BuyMartV1
-- Comprehensive Row Level Security with role-based access control
-- Run this to enhance existing RLS policies with multi-role support

-- ============================================================================
-- STEP 1: DROP EXISTING PROBLEMATIC POLICIES
-- ============================================================================

-- Drop all existing policies to avoid conflicts
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 2: ENHANCED HELPER FUNCTIONS FOR RLS (PUBLIC SCHEMA)
-- ============================================================================

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        JOIN profiles p ON ur.user_id = p.user_id
        WHERE p.user_id = auth.uid()
        AND r.slug = required_role
        AND ur.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.user_has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        JOIN profiles p ON ur.user_id = p.user_id
        WHERE p.user_id = auth.uid()
        AND r.slug = ANY(required_roles)
        AND ur.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.user_has_any_role(ARRAY['admin', 'super_admin', 'company_admin']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's profile ID
CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM profiles
        WHERE user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: ENHANCED PROFILES TABLE POLICIES
-- ============================================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles (public information)
CREATE POLICY "profiles_select_all" ON profiles
    FOR SELECT USING (true);

-- Users can insert their own profile during registration
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Admins can update any profile
CREATE POLICY "profiles_update_admin" ON profiles
    FOR UPDATE USING (public.user_is_admin());

-- Users can delete their own profile
CREATE POLICY "profiles_delete_own" ON profiles
    FOR DELETE USING (user_id = auth.uid());

-- Admins can delete any profile
CREATE POLICY "profiles_delete_admin" ON profiles
    FOR DELETE USING (public.user_is_admin());

-- ============================================================================
-- STEP 4: ENHANCED LISTINGS TABLE POLICIES
-- ============================================================================

-- Enable RLS on listings table
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings
CREATE POLICY "listings_select_active" ON listings
    FOR SELECT USING (
        status = 'active' OR
        seller_id = public.get_user_profile_id() OR
        public.user_is_admin()
    );

-- Sellers can insert their own listings
CREATE POLICY "listings_insert_seller" ON listings
    FOR INSERT WITH CHECK (
        public.user_has_any_role(ARRAY['seller', 'admin', 'super_admin']) AND
        (seller_id = public.get_user_profile_id() OR public.user_is_admin())
    );

-- Sellers can update their own listings
CREATE POLICY "listings_update_seller" ON listings
    FOR UPDATE USING (
        seller_id = public.get_user_profile_id() OR public.user_is_admin()
    );

-- Sellers can delete their own listings
CREATE POLICY "listings_delete_seller" ON listings
    FOR DELETE USING (
        seller_id = public.get_user_profile_id() OR public.user_is_admin()
    );

-- ============================================================================
-- STEP 5: USER ROLES TABLE POLICIES
-- ============================================================================

-- Enable RLS on user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "user_roles_select_own" ON user_roles
    FOR SELECT USING (
        user_id = auth.uid() OR public.user_is_admin()
    );

-- Only admins can insert user roles
CREATE POLICY "user_roles_insert_admin" ON user_roles
    FOR INSERT WITH CHECK (public.user_is_admin());

-- Only admins can update user roles
CREATE POLICY "user_roles_update_admin" ON user_roles
    FOR UPDATE USING (public.user_is_admin());

-- Only admins can delete user roles
CREATE POLICY "user_roles_delete_admin" ON user_roles
    FOR DELETE USING (public.user_is_admin());

-- ============================================================================
-- STEP 6: SUBSCRIPTION TABLES POLICIES
-- ============================================================================

-- Enable RLS on user_subscriptions table
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "user_subscriptions_select_own" ON user_subscriptions
    FOR SELECT USING (
        user_id = auth.uid() OR public.user_is_admin()
    );

-- Only system/admin can insert subscriptions
CREATE POLICY "user_subscriptions_insert_admin" ON user_subscriptions
    FOR INSERT WITH CHECK (public.user_is_admin());

-- Only system/admin can update subscriptions
CREATE POLICY "user_subscriptions_update_admin" ON user_subscriptions
    FOR UPDATE USING (public.user_is_admin());

-- Subscription tiers are public
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscription_tiers_select_all" ON subscription_tiers
    FOR SELECT USING (true);

-- ============================================================================
-- STEP 7: MESSAGING AND NOTIFICATIONS POLICIES
-- ============================================================================

-- Messages table policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_participant" ON messages
    FOR SELECT USING (
        sender_id = public.get_user_profile_id() OR
        recipient_id = public.get_user_profile_id() OR
        public.user_is_admin()
    );

CREATE POLICY "messages_insert_sender" ON messages
    FOR INSERT WITH CHECK (
        sender_id = public.get_user_profile_id() AND
        public.user_has_any_role(ARRAY['buyer', 'seller', 'vendor', 'admin', 'super_admin'])
    );

CREATE POLICY "messages_update_participant" ON messages
    FOR UPDATE USING (
        sender_id = public.get_user_profile_id() OR
        recipient_id = public.get_user_profile_id() OR
        public.user_is_admin()
    );

-- Notifications table policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT USING (
        user_id = public.get_user_profile_id() OR public.user_is_admin()
    );

CREATE POLICY "notifications_insert_system" ON notifications
    FOR INSERT WITH CHECK (true); -- System can create notifications

CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (
        user_id = public.get_user_profile_id() OR public.user_is_admin()
    );

CREATE POLICY "notifications_delete_own" ON notifications
    FOR DELETE USING (
        user_id = public.get_user_profile_id() OR public.user_is_admin()
    );

-- ============================================================================
-- STEP 8: SAVED LISTINGS AND SEARCH HISTORY POLICIES
-- ============================================================================

-- Saved listings policies
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_listings_select_own" ON saved_listings
    FOR SELECT USING (
        buyer_id = public.get_user_profile_id() OR public.user_is_admin()
    );

CREATE POLICY "saved_listings_insert_buyer" ON saved_listings
    FOR INSERT WITH CHECK (
        buyer_id = public.get_user_profile_id() AND
        public.user_has_any_role(ARRAY['buyer', 'admin', 'super_admin'])
    );

CREATE POLICY "saved_listings_update_own" ON saved_listings
    FOR UPDATE USING (
        buyer_id = public.get_user_profile_id() OR public.user_is_admin()
    );

CREATE POLICY "saved_listings_delete_own" ON saved_listings
    FOR DELETE USING (
        buyer_id = public.get_user_profile_id() OR public.user_is_admin()
    );

-- Search history policies
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_history_select_own" ON search_history
    FOR SELECT USING (
        user_id = public.get_user_profile_id() OR public.user_is_admin()
    );

CREATE POLICY "search_history_insert_own" ON search_history
    FOR INSERT WITH CHECK (
        user_id = public.get_user_profile_id()
    );

CREATE POLICY "search_history_delete_own" ON search_history
    FOR DELETE USING (
        user_id = public.get_user_profile_id() OR public.user_is_admin()
    );

-- ============================================================================
-- STEP 9: VENDOR AND DEAL POLICIES
-- ============================================================================

-- Vendor profiles policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendor_profiles') THEN
        ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
        
        EXECUTE 'CREATE POLICY "vendor_profiles_select_all" ON vendor_profiles
            FOR SELECT USING (true)';
            
        EXECUTE 'CREATE POLICY "vendor_profiles_insert_vendor" ON vendor_profiles
            FOR INSERT WITH CHECK (
                user_id = auth.uid() AND
                public.user_has_any_role(ARRAY[''vendor'', ''admin'', ''super_admin''])
            )';
            
        EXECUTE 'CREATE POLICY "vendor_profiles_update_own" ON vendor_profiles
            FOR UPDATE USING (
                user_id = auth.uid() OR public.user_is_admin()
            )';
    END IF;
END $$;

-- Deals table policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
        ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
        
        EXECUTE 'CREATE POLICY "deals_select_participant" ON deals
            FOR SELECT USING (
                buyer_id = public.get_user_profile_id() OR
                seller_id = public.get_user_profile_id() OR
                public.user_is_admin()
            )';

        EXECUTE 'CREATE POLICY "deals_insert_participant" ON deals
            FOR INSERT WITH CHECK (
                (buyer_id = public.get_user_profile_id() AND public.user_has_role(''buyer'')) OR
                (seller_id = public.get_user_profile_id() AND public.user_has_role(''seller'')) OR
                public.user_is_admin()
            )';

        EXECUTE 'CREATE POLICY "deals_update_participant" ON deals
            FOR UPDATE USING (
                buyer_id = public.get_user_profile_id() OR
                seller_id = public.get_user_profile_id() OR
                public.user_is_admin()
            )';
    END IF;
END $$;

-- ============================================================================
-- STEP 10: ANALYTICS AND AUDIT POLICIES
-- ============================================================================

-- Analytics events policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_select_own_or_admin" ON analytics_events
    FOR SELECT USING (
        user_id = public.get_user_profile_id() OR
        user_id IS NULL OR
        public.user_is_admin()
    );

CREATE POLICY "analytics_insert_system" ON analytics_events
    FOR INSERT WITH CHECK (true); -- System can insert analytics

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 'listings', 'user_roles', 'user_subscriptions', 
    'messages', 'notifications', 'saved_listings', 'search_history', 
    'analytics_events', 'subscription_tiers'
)
ORDER BY tablename;

-- Success message
SELECT 'Enhanced RLS policies applied successfully! All tables now have comprehensive role-based security.' as status;