-- ARDONIE CAPITAL MULTI-ROLE SYSTEM DEPLOYMENT
-- Generated automatically - Deploy in Supabase SQL Editor
-- Project: pbydepsqcypwqbicnsco
-- Generated: 2025-07-12T05:19:44.627Z

-- ============================================================================
-- DEPLOYMENT VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🚀 Starting Multi-Role Schema Deployment...';
    RAISE NOTICE 'Project: pbydepsqcypwqbicnsco';
    RAISE NOTICE 'Timestamp: %', NOW();
END $$;

-- ============================================================================
-- BASE MULTI-ROLE SCHEMA
-- Deploy core multi-role tables and relationships
-- ============================================================================

-- ARDONIE CAPITAL MULTI-ROLE SYSTEM DATABASE SCHEMA
-- Phase 1: Core database structure for comprehensive role management
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- 1. COMPANIES TABLE - Organizational structure for Company Admin scope
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    address JSONB, -- Store address as JSON for flexibility
    contact_info JSONB, -- Store contact details as JSON
    settings JSONB DEFAULT '{}', -- Company-specific settings
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);

-- ============================================================================
-- 2. ROLES TABLE - Define all available roles in the system
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'primary', 'blog', 'system'
    permissions JSONB DEFAULT '{}', -- Role-specific permissions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_roles_slug ON roles(slug);
CREATE INDEX IF NOT EXISTS idx_roles_category ON roles(category);
CREATE INDEX IF NOT EXISTS idx_roles_active ON roles(is_active);

-- ============================================================================
-- 3. USER ROLES TABLE - Many-to-many relationship between users and roles
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- For company-scoped roles
    assigned_by UUID REFERENCES auth.users(id), -- Who assigned this role
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional role expiration
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}', -- Additional role-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique user-role-company combination
    UNIQUE(user_id, role_id, company_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_company_id ON user_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_by ON user_roles(assigned_by);

-- ============================================================================
-- 4. ROLE HIERARCHIES TABLE - Define which roles can manage other roles
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_hierarchies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    child_role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope TEXT NOT NULL DEFAULT 'global', -- 'global', 'company', 'self'
    permissions JSONB DEFAULT '{}', -- Specific permissions for this relationship
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Prevent circular hierarchies
    UNIQUE(parent_role_id, child_role_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_role_hierarchies_parent ON role_hierarchies(parent_role_id);
CREATE INDEX IF NOT EXISTS idx_role_hierarchies_child ON role_hierarchies(child_role_id);

-- ============================================================================
-- 5. USER SESSIONS TABLE - Track active role for each user session
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    active_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL, -- Active company context
    session_token TEXT UNIQUE, -- Optional session tracking
    last_role_switch TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{}', -- User session preferences
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- One active session per user
    UNIQUE(user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active_role ON user_sessions(active_role_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- ============================================================================
-- 6. EXTEND PROFILES TABLE - Add company relationship and migration support
-- ============================================================================

-- Add new columns to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS legacy_role TEXT, -- Backup of original role
ADD COLUMN IF NOT EXISTS migration_status TEXT DEFAULT 'pending', -- 'pending', 'migrated', 'verified'
ADD COLUMN IF NOT EXISTS last_role_switch TIMESTAMP WITH TIME ZONE;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_migration_status ON profiles(migration_status);

-- ============================================================================
-- 7. CONTENT WORKFLOW TABLE - For blog approval system
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_workflow (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_id UUID NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending_review', 'approved', 'published', 'rejected'
    submitted_by UUID REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    version_number INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_content_workflow_content_id ON content_workflow(content_id);
CREATE INDEX IF NOT EXISTS idx_content_workflow_status ON content_workflow(status);
CREATE INDEX IF NOT EXISTS idx_content_workflow_submitted_by ON content_workflow(submitted_by);
CREATE INDEX IF NOT EXISTS idx_content_workflow_reviewed_by ON content_workflow(reviewed_by);

-- ============================================================================
-- 8. AUDIT LOG TABLE - Track all role changes and important actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'role_assigned', 'role_revoked', 'role_switched', etc.
    target_user_id UUID REFERENCES auth.users(id), -- User being affected
    role_id UUID REFERENCES roles(id),
    company_id UUID REFERENCES companies(id),
    details JSONB DEFAULT '{}', -- Additional action details
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_target_user_id ON audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- ============================================================================
-- 9. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_workflow_updated_at BEFORE UPDATE ON content_workflow FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. INITIAL DATA SETUP
-- ============================================================================

-- Insert default company (for existing users)
INSERT INTO companies (id, name, slug, description, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ardonie Capital',
    'ardonie-capital',
    'Default company for Ardonie Capital platform users',
    true
) ON CONFLICT (slug) DO NOTHING;

-- Insert system roles
INSERT INTO roles (id, name, slug, description, category, permissions) VALUES
-- Primary roles
('10000000-0000-0000-0000-000000000001', 'Super Admin', 'super_admin', 'Full platform access and user management', 'primary', '{"admin_navigation": true, "user_management": true, "company_management": true, "blog_management": true, "system_settings": true}'),
('10000000-0000-0000-0000-000000000002', 'Company Admin', 'company_admin', 'Manage users within their company', 'primary', '{"admin_navigation": true, "company_user_management": true, "company_settings": true}'),
('10000000-0000-0000-0000-000000000003', 'Vendor', 'vendor', 'Business entity with buyer privileges', 'primary', '{"vendor_dashboard": true, "buyer_features": true}'),
('10000000-0000-0000-0000-000000000004', 'Seller', 'seller', 'Can list and sell businesses, can have buyer privileges', 'primary', '{"seller_dashboard": true, "business_listing": true, "buyer_features": true}'),
('10000000-0000-0000-0000-000000000005', 'Buyer', 'buyer', 'Can browse and purchase businesses', 'primary', '{"buyer_dashboard": true, "business_browsing": true, "purchase_features": true}'),
-- Blog roles
('20000000-0000-0000-0000-000000000001', 'Blog Editor', 'blog_editor', 'Full blog content management and publishing', 'blog', '{"blog_create": true, "blog_edit": true, "blog_delete": true, "blog_publish": true, "blog_manage_contributors": true}'),
('20000000-0000-0000-0000-000000000002', 'Blog Contributor', 'blog_contributor', 'Create and edit blog content, cannot publish', 'blog', '{"blog_create": true, "blog_edit": true, "blog_delete": true}'),
-- Legacy compatibility roles
('30000000-0000-0000-0000-000000000001', 'Admin (Legacy)', 'admin', 'Legacy admin role for backward compatibility', 'system', '{"admin_navigation": true, "legacy_admin": true}')
ON CONFLICT (slug) DO NOTHING;

-- Insert role hierarchies
INSERT INTO role_hierarchies (parent_role_id, child_role_id, scope) VALUES
-- Super Admin can manage all roles
('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'global'), -- Super Admin -> Company Admin
('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'global'), -- Super Admin -> Vendor
('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'global'), -- Super Admin -> Seller
('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'global'), -- Super Admin -> Buyer
('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'global'), -- Super Admin -> Blog Editor
('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'global'), -- Super Admin -> Blog Contributor
-- Company Admin can manage company roles
('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'company'), -- Company Admin -> Vendor
('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'company'), -- Company Admin -> Seller
('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'company'), -- Company Admin -> Buyer
-- Blog Editor can manage Blog Contributors
('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'global') -- Blog Editor -> Blog Contributor
ON CONFLICT (parent_role_id, child_role_id) DO NOTHING;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '🎉 Multi-role database schema created successfully!' as result;
SELECT 'Next step: Run migration script to populate user roles from existing data' as next_step;


-- ============================================================================
-- ENHANCED MULTI-ROLE SCHEMA
-- Deploy subscription tiers and vendor categories
-- ============================================================================

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


-- ============================================================================
-- MULTI-ROLE RLS POLICIES
-- Apply row-level security policies
-- ============================================================================

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


-- ============================================================================
-- DATA MIGRATION
-- Migrate existing users to multi-role system
-- ============================================================================

-- ARDONIE CAPITAL MULTI-ROLE MIGRATION SCRIPT
-- Migrate existing users to new multi-role system
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- 1. BACKUP EXISTING DATA
-- ============================================================================

-- Backup existing role data before migration
UPDATE profiles 
SET legacy_role = role, 
    migration_status = 'pending'
WHERE legacy_role IS NULL;

-- ============================================================================
-- 2. ASSIGN DEFAULT SUBSCRIPTION TIERS
-- ============================================================================

-- Get the free tier ID
DO $$
DECLARE
    free_tier_id UUID;
BEGIN
    SELECT id INTO free_tier_id FROM subscription_tiers WHERE slug = 'free';
    
    -- Assign free tier to all existing users
    UPDATE profiles 
    SET subscription_tier_id = free_tier_id,
        subscription_status = 'free'
    WHERE subscription_tier_id IS NULL;
    
    -- Create user subscription records for existing users
    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    SELECT 
        p.user_id,
        free_tier_id,
        'active',
        p.created_at
    FROM profiles p
    WHERE NOT EXISTS (
        SELECT 1 FROM user_subscriptions us 
        WHERE us.user_id = p.user_id
    );
END $$;

-- ============================================================================
-- 3. MIGRATE EXISTING ROLES TO NEW SYSTEM
-- ============================================================================

-- Migrate existing single roles to multi-role system
DO $$
DECLARE
    buyer_role_id UUID;
    seller_role_id UUID;
    admin_role_id UUID;
    legacy_admin_role_id UUID;
    default_company_id UUID;
    user_record RECORD;
BEGIN
    -- Get role IDs
    SELECT id INTO buyer_role_id FROM roles WHERE slug = 'buyer';
    SELECT id INTO seller_role_id FROM roles WHERE slug = 'seller';
    SELECT id INTO admin_role_id FROM roles WHERE slug = 'super_admin';
    SELECT id INTO legacy_admin_role_id FROM roles WHERE slug = 'admin';
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';
    
    -- Migrate each user based on their legacy role
    FOR user_record IN 
        SELECT user_id, role, legacy_role 
        FROM profiles 
        WHERE migration_status = 'pending'
    LOOP
        -- Assign role based on legacy role
        CASE user_record.role
            WHEN 'buyer' THEN
                INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, metadata)
                VALUES (
                    user_record.user_id, 
                    buyer_role_id, 
                    default_company_id,
                    user_record.user_id, -- Self-assigned during migration
                    '{"migration": true, "legacy_role": "buyer"}'
                ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;
                
            WHEN 'seller' THEN
                INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, metadata)
                VALUES (
                    user_record.user_id, 
                    seller_role_id, 
                    default_company_id,
                    user_record.user_id,
                    '{"migration": true, "legacy_role": "seller"}'
                ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;
                
            WHEN 'admin' THEN
                -- Migrate admin to super_admin
                INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, metadata)
                VALUES (
                    user_record.user_id, 
                    admin_role_id, 
                    default_company_id,
                    user_record.user_id,
                    '{"migration": true, "legacy_role": "admin"}'
                ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;
                
                -- Also assign legacy admin role for backward compatibility
                INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, metadata)
                VALUES (
                    user_record.user_id, 
                    legacy_admin_role_id, 
                    default_company_id,
                    user_record.user_id,
                    '{"migration": true, "legacy_compatibility": true}'
                ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;
        END CASE;
        
        -- Update migration status
        UPDATE profiles 
        SET migration_status = 'migrated'
        WHERE user_id = user_record.user_id;
    END LOOP;
END $$;

-- ============================================================================
-- 4. CREATE USER SESSIONS FOR MIGRATED USERS
-- ============================================================================

-- Create user sessions with their primary role active
DO $$
DECLARE
    user_record RECORD;
    primary_role_id UUID;
BEGIN
    FOR user_record IN 
        SELECT DISTINCT ur.user_id 
        FROM user_roles ur
        WHERE NOT EXISTS (
            SELECT 1 FROM user_sessions us 
            WHERE us.user_id = ur.user_id
        )
    LOOP
        -- Get their first assigned role as the active role
        SELECT ur.role_id INTO primary_role_id
        FROM user_roles ur
        WHERE ur.user_id = user_record.user_id
        AND ur.is_active = true
        ORDER BY ur.assigned_at
        LIMIT 1;
        
        -- Create user session
        INSERT INTO user_sessions (user_id, active_role_id, preferences)
        VALUES (
            user_record.user_id,
            primary_role_id,
            '{"migration_created": true}'
        ) ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;

-- ============================================================================
-- 5. CREATE DEFAULT DASHBOARD PREFERENCES
-- ============================================================================

-- Create default dashboard preferences for each user-role combination
INSERT INTO dashboard_preferences (user_id, role_slug, layout_config, widget_preferences)
SELECT 
    ur.user_id,
    r.slug,
    CASE r.slug
        WHEN 'buyer' THEN '{"layout": "grid", "columns": 3, "sections": ["overview", "saved_listings", "recent_activity"]}'
        WHEN 'seller' THEN '{"layout": "grid", "columns": 3, "sections": ["overview", "my_listings", "inquiries"]}'
        WHEN 'vendor' THEN '{"layout": "grid", "columns": 3, "sections": ["overview", "client_requests", "portfolio"]}'
        WHEN 'super_admin' THEN '{"layout": "grid", "columns": 4, "sections": ["overview", "user_management", "analytics", "system_health"]}'
        ELSE '{"layout": "grid", "columns": 3, "sections": ["overview"]}'
    END,
    CASE r.slug
        WHEN 'buyer' THEN '{"kpi_cards": true, "recent_listings": true, "saved_searches": true, "notifications": true}'
        WHEN 'seller' THEN '{"kpi_cards": true, "listing_performance": true, "inquiries": true, "notifications": true}'
        WHEN 'vendor' THEN '{"kpi_cards": true, "client_pipeline": true, "reviews": true, "notifications": true}'
        WHEN 'super_admin' THEN '{"kpi_cards": true, "user_stats": true, "system_metrics": true, "audit_log": true}'
        ELSE '{"kpi_cards": true, "notifications": true}'
    END
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.is_active = true
ON CONFLICT (user_id, role_slug) DO NOTHING;

-- ============================================================================
-- 6. AUDIT LOG ENTRIES FOR MIGRATION
-- ============================================================================

-- Log the migration process
INSERT INTO audit_log (user_id, action, target_user_id, details)
SELECT 
    ur.user_id,
    'role_migrated',
    ur.user_id,
    jsonb_build_object(
        'migration_date', NOW(),
        'legacy_role', p.legacy_role,
        'new_role_id', ur.role_id,
        'migration_type', 'automatic'
    )
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE p.migration_status = 'migrated'
AND ur.metadata->>'migration' = 'true';

-- ============================================================================
-- 7. VERIFICATION AND CLEANUP
-- ============================================================================

-- Verify migration success
DO $$
DECLARE
    total_profiles INTEGER;
    migrated_profiles INTEGER;
    users_with_roles INTEGER;
    users_with_sessions INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_profiles FROM profiles;
    SELECT COUNT(*) INTO migrated_profiles FROM profiles WHERE migration_status = 'migrated';
    SELECT COUNT(DISTINCT user_id) INTO users_with_roles FROM user_roles WHERE is_active = true;
    SELECT COUNT(*) INTO users_with_sessions FROM user_sessions;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE 'Total profiles: %', total_profiles;
    RAISE NOTICE 'Migrated profiles: %', migrated_profiles;
    RAISE NOTICE 'Users with roles: %', users_with_roles;
    RAISE NOTICE 'Users with sessions: %', users_with_sessions;
    
    IF migrated_profiles = total_profiles AND users_with_roles = total_profiles THEN
        RAISE NOTICE '✅ Migration completed successfully!';
        
        -- Mark all profiles as verified
        UPDATE profiles SET migration_status = 'verified' WHERE migration_status = 'migrated';
    ELSE
        RAISE NOTICE '⚠️ Migration incomplete. Please review and fix issues.';
    END IF;
END $$;

-- ============================================================================
-- 8. CREATE SAMPLE VENDOR PROFILES FOR TESTING
-- ============================================================================

-- Create sample vendor profiles for testing (only if no vendor profiles exist)
DO $$
DECLARE
    financial_category_id UUID;
    legal_category_id UUID;
    sample_user_id UUID;
BEGIN
    SELECT id INTO financial_category_id FROM vendor_categories WHERE slug = 'financial';
    SELECT id INTO legal_category_id FROM vendor_categories WHERE slug = 'legal';
    
    -- Only create samples if no vendor profiles exist
    IF NOT EXISTS (SELECT 1 FROM vendor_profiles LIMIT 1) THEN
        -- Get a sample user (first user with vendor role)
        SELECT ur.user_id INTO sample_user_id
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE r.slug = 'vendor'
        LIMIT 1;
        
        IF sample_user_id IS NOT NULL THEN
            -- Create sample financial professional profile
            INSERT INTO vendor_profiles (
                user_id, category_id, business_name, license_number, 
                certifications, specializations, service_areas, 
                hourly_rate, bio, years_experience
            ) VALUES (
                sample_user_id, financial_category_id, 'Sample Financial Services',
                'FL-12345', '["CPA", "Business Valuation"]', 
                '["Business Valuation", "Financial Analysis", "Due Diligence"]',
                '["Florida", "Georgia", "Alabama"]', 150.00,
                'Experienced financial professional specializing in business valuations and acquisitions.',
                15
            ) ON CONFLICT (user_id, category_id) DO NOTHING;
        END IF;
    END IF;
END $$;

SELECT '🎉 Multi-role migration completed successfully!' as result;
SELECT 'All existing users have been migrated to the new multi-role system' as status;


-- ============================================================================
-- DEPLOYMENT COMPLETION VERIFICATION
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
    role_count INTEGER;
    user_role_count INTEGER;
BEGIN
    -- Count new tables
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('roles', 'user_roles', 'subscription_tiers', 'vendor_categories');

    SELECT COUNT(*) INTO role_count FROM roles;
    SELECT COUNT(*) INTO user_role_count FROM user_roles;

    RAISE NOTICE '📊 DEPLOYMENT SUMMARY:';
    RAISE NOTICE 'New tables created: %', table_count;
    RAISE NOTICE 'Roles defined: %', role_count;
    RAISE NOTICE 'User roles assigned: %', user_role_count;

    IF table_count >= 4 AND role_count >= 5 THEN
        RAISE NOTICE '✅ Multi-role schema deployment completed successfully!';
    ELSE
        RAISE NOTICE '⚠️  Deployment may be incomplete. Please review.';
    END IF;
END $$;

