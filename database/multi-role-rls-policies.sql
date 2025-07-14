-- ARDONIE CAPITAL MULTI-ROLE RLS POLICIES
-- Row Level Security policies for enhanced multi-role system
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- 1. SUBSCRIPTION TIERS - Public read, admin write
-- ============================================================================

-- Enable RLS
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Public can read active subscription tiers
CREATE POLICY "subscription_tiers_public_read" ON subscription_tiers
    FOR SELECT USING (is_active = true);

-- Only super admins can modify subscription tiers
CREATE POLICY "subscription_tiers_admin_write" ON subscription_tiers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.slug = 'super_admin'
            AND ur.is_active = true
        )
    );

-- ============================================================================
-- 2. USER SUBSCRIPTIONS - Users can read their own, admins can read all
-- ============================================================================

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
CREATE POLICY "user_subscriptions_own_read" ON user_subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own subscription preferences
CREATE POLICY "user_subscriptions_own_update" ON user_subscriptions
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins can read all subscriptions
CREATE POLICY "user_subscriptions_admin_read" ON user_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.slug IN ('super_admin', 'company_admin')
            AND ur.is_active = true
        )
    );

-- System can insert new subscriptions (for registration)
CREATE POLICY "user_subscriptions_system_insert" ON user_subscriptions
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 3. VENDOR CATEGORIES - Public read, admin write
-- ============================================================================

-- Enable RLS
ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;

-- Public can read active vendor categories
CREATE POLICY "vendor_categories_public_read" ON vendor_categories
    FOR SELECT USING (is_active = true);

-- Only super admins can modify vendor categories
CREATE POLICY "vendor_categories_admin_write" ON vendor_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.slug = 'super_admin'
            AND ur.is_active = true
        )
    );

-- ============================================================================
-- 4. VENDOR PROFILES - Users can manage their own, public can read verified
-- ============================================================================

-- Enable RLS
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Public can read verified vendor profiles
CREATE POLICY "vendor_profiles_public_read" ON vendor_profiles
    FOR SELECT USING (verification_status = 'verified');

-- Users can read and manage their own vendor profiles
CREATE POLICY "vendor_profiles_own_manage" ON vendor_profiles
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins can read and verify all vendor profiles
CREATE POLICY "vendor_profiles_admin_manage" ON vendor_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.slug IN ('super_admin', 'company_admin')
            AND ur.is_active = true
        )
    );

-- ============================================================================
-- 5. DASHBOARD PREFERENCES - Users can only access their own
-- ============================================================================

-- Enable RLS
ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own dashboard preferences
CREATE POLICY "dashboard_preferences_own_access" ON dashboard_preferences
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 6. USAGE ANALYTICS - Users can read their own, admins can read all
-- ============================================================================

-- Enable RLS
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage analytics
CREATE POLICY "usage_analytics_own_read" ON usage_analytics
    FOR SELECT USING (user_id = auth.uid());

-- System can insert usage analytics
CREATE POLICY "usage_analytics_system_insert" ON usage_analytics
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can read all usage analytics
CREATE POLICY "usage_analytics_admin_read" ON usage_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.slug IN ('super_admin', 'company_admin')
            AND ur.is_active = true
        )
    );

-- ============================================================================
-- 7. HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================================================

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, role_slug_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_uuid
        AND r.slug = role_slug_param
        AND ur.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has admin privileges
CREATE OR REPLACE FUNCTION user_is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_has_role(user_uuid, 'super_admin') OR 
           user_has_role(user_uuid, 'company_admin') OR
           user_has_role(user_uuid, 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's subscription tier
CREATE OR REPLACE FUNCTION get_user_subscription_tier(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    tier_slug TEXT;
BEGIN
    SELECT st.slug INTO tier_slug
    FROM user_subscriptions us
    JOIN subscription_tiers st ON us.tier_id = st.id
    WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > NOW())
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    RETURN COALESCE(tier_slug, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access feature based on subscription
CREATE OR REPLACE FUNCTION user_can_access_feature(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    tier_slug TEXT;
    tier_features JSONB;
BEGIN
    tier_slug := get_user_subscription_tier(user_uuid);
    
    SELECT features INTO tier_features
    FROM subscription_tiers
    WHERE slug = tier_slug;
    
    RETURN COALESCE((tier_features ->> feature_name)::BOOLEAN, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '🔒 Multi-role RLS policies created successfully!' as result;
SELECT 'All new tables now have appropriate row-level security policies' as status;
