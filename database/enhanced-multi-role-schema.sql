-- ARDONIE CAPITAL ENHANCED MULTI-ROLE SYSTEM DATABASE SCHEMA
-- Enhanced version with subscription tiers and vendor categories
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- 1. SUBSCRIPTION TIERS TABLE - Free vs Pro tier management
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_tiers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) DEFAULT 0.00,
    price_yearly DECIMAL(10,2) DEFAULT 0.00,
    features JSONB DEFAULT '{}', -- Available features for this tier
    limits JSONB DEFAULT '{}', -- Usage limits (listings, searches, etc.)
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_slug ON subscription_tiers(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_active ON subscription_tiers(is_active);

-- ============================================================================
-- 2. USER SUBSCRIPTIONS TABLE - Track user subscription status
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES subscription_tiers(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    payment_method JSONB DEFAULT '{}', -- Payment details (encrypted)
    billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'yearly', 'lifetime'
    auto_renew BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}', -- Additional subscription data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- One active subscription per user
    UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier_id ON user_subscriptions(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- ============================================================================
-- 3. VENDOR CATEGORIES TABLE - Financial vs Legal professionals
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES vendor_categories(id),
    icon TEXT, -- Icon class or URL
    color TEXT, -- Brand color for category
    required_credentials JSONB DEFAULT '[]', -- Required licenses/certifications
    features JSONB DEFAULT '{}', -- Category-specific features
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_vendor_categories_slug ON vendor_categories(slug);
CREATE INDEX IF NOT EXISTS idx_vendor_categories_parent ON vendor_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_vendor_categories_active ON vendor_categories(is_active);

-- ============================================================================
-- 4. VENDOR PROFILES TABLE - Extended vendor information
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES vendor_categories(id) ON DELETE RESTRICT,
    business_name TEXT NOT NULL,
    license_number TEXT,
    license_state TEXT,
    certifications JSONB DEFAULT '[]', -- Array of certifications
    specializations JSONB DEFAULT '[]', -- Areas of expertise
    service_areas JSONB DEFAULT '[]', -- Geographic service areas
    hourly_rate DECIMAL(10,2),
    minimum_engagement DECIMAL(10,2),
    availability_status TEXT DEFAULT 'available', -- 'available', 'busy', 'unavailable'
    bio TEXT,
    years_experience INTEGER DEFAULT 0,
    education JSONB DEFAULT '[]', -- Educational background
    awards JSONB DEFAULT '[]', -- Professional awards/recognition
    insurance_info JSONB DEFAULT '{}', -- Professional liability insurance
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- One vendor profile per user per category
    UNIQUE(user_id, category_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON vendor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_category_id ON vendor_profiles(category_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_verification_status ON vendor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_featured ON vendor_profiles(is_featured);

-- ============================================================================
-- 5. DASHBOARD PREFERENCES TABLE - User dashboard customization
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_slug TEXT NOT NULL, -- Which role these preferences apply to
    layout_config JSONB DEFAULT '{}', -- Dashboard layout configuration
    widget_preferences JSONB DEFAULT '{}', -- Widget visibility and order
    notification_settings JSONB DEFAULT '{}', -- Dashboard notification preferences
    theme_settings JSONB DEFAULT '{}', -- Theme and appearance settings
    quick_actions JSONB DEFAULT '[]', -- Customized quick action buttons
    default_filters JSONB DEFAULT '{}', -- Default filters for listings/searches
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- One preference set per user per role
    UNIQUE(user_id, role_slug)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_preferences_user_id ON dashboard_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_preferences_role_slug ON dashboard_preferences(role_slug);

-- ============================================================================
-- 6. USAGE ANALYTICS TABLE - Track feature usage for tier management
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL, -- 'listing_view', 'search', 'message_sent', etc.
    role_context TEXT, -- Which role was active during usage
    usage_count INTEGER DEFAULT 1,
    usage_date DATE DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}', -- Additional usage context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- One record per user per feature per day
    UNIQUE(user_id, feature_name, usage_date)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_feature ON usage_analytics(feature_name);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_date ON usage_analytics(usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_role ON usage_analytics(role_context);

-- ============================================================================
-- 7. EXTEND EXISTING TABLES
-- ============================================================================

-- Add subscription tracking to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier_id UUID REFERENCES subscription_tiers(id),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Add indexes for new profile columns
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at);

-- ============================================================================
-- 8. TRIGGERS FOR UPDATED_AT COLUMNS
-- ============================================================================

-- Add triggers for new tables
CREATE TRIGGER update_subscription_tiers_updated_at BEFORE UPDATE ON subscription_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_categories_updated_at BEFORE UPDATE ON vendor_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON vendor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_preferences_updated_at BEFORE UPDATE ON dashboard_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. INITIAL DATA SETUP
-- ============================================================================

-- Insert subscription tiers
INSERT INTO subscription_tiers (id, name, slug, description, price_monthly, price_yearly, features, limits) VALUES
('40000000-0000-0000-0000-000000000001', 'Free', 'free', 'Basic access to platform features', 0.00, 0.00, 
 '{"basic_search": true, "limited_listings": true, "basic_messaging": true}', 
 '{"monthly_searches": 10, "saved_listings": 5, "messages_per_day": 3}'),
('40000000-0000-0000-0000-000000000002', 'Pro', 'pro', 'Full access to all platform features', 29.99, 299.99, 
 '{"unlimited_search": true, "unlimited_listings": true, "priority_messaging": true, "advanced_analytics": true, "vendor_directory": true}', 
 '{"monthly_searches": -1, "saved_listings": -1, "messages_per_day": -1}')
ON CONFLICT (slug) DO NOTHING;

-- Insert vendor categories
INSERT INTO vendor_categories (id, name, slug, description, required_credentials, features) VALUES
('50000000-0000-0000-0000-000000000001', 'Financial Professionals', 'financial', 'Licensed business brokers, CPAs, financial advisors, business valuation experts', 
 '["business_broker_license", "cpa_license", "cfa_certification", "business_valuation_certification"]',
 '{"financial_analysis": true, "valuation_tools": true, "broker_network": true}'),
('50000000-0000-0000-0000-000000000002', 'Legal & Other Professionals', 'legal', 'Business attorneys, tax professionals, insurance agents, consultants', 
 '["bar_admission", "tax_professional_license", "insurance_license", "consulting_certification"]',
 '{"legal_document_templates": true, "compliance_tools": true, "contract_review": true}')
ON CONFLICT (slug) DO NOTHING;

-- Insert enhanced roles for vendor subcategories
INSERT INTO roles (id, name, slug, description, category, permissions) VALUES
('10000000-0000-0000-0000-000000000006', 'Financial Professional', 'financial_professional', 'Licensed financial services provider', 'primary', '{"vendor_dashboard": true, "financial_tools": true, "buyer_features": true}'),
('10000000-0000-0000-0000-000000000007', 'Legal Professional', 'legal_professional', 'Licensed legal services provider', 'primary', '{"vendor_dashboard": true, "legal_tools": true, "buyer_features": true}')
ON CONFLICT (slug) DO NOTHING;

SELECT '🎉 Enhanced multi-role database schema created successfully!' as result;
SELECT 'Includes: Subscription tiers, Vendor categories, Dashboard preferences, Usage analytics' as features;
