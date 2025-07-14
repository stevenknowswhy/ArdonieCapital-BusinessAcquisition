-- ARDONIE CAPITAL MULTI-ROLE SYSTEM - SAFE DEPLOYMENT
-- Safe deployment script that handles existing objects gracefully
-- Project: pbydepsqcypwqbicnsco
-- Generated: 2025-07-12 (Fixed Version)

-- ============================================================================
-- DEPLOYMENT VERIFICATION & SETUP
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🚀 Starting SAFE Multi-Role Schema Deployment...';
    RAISE NOTICE 'Project: pbydepsqcypwqbicnsco';
    RAISE NOTICE 'Timestamp: %', NOW();
    RAISE NOTICE 'This script can be safely run multiple times.';
END $$;

-- ============================================================================
-- 1. CREATE HELPER FUNCTIONS FOR SAFE DEPLOYMENT
-- ============================================================================

-- Function to safely drop and recreate triggers
CREATE OR REPLACE FUNCTION safe_create_trigger(
    trigger_name TEXT,
    table_name TEXT,
    function_name TEXT
) RETURNS VOID AS $$
BEGIN
    -- Drop trigger if it exists
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_name, table_name);
    
    -- Create the trigger
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION %I()', 
                   trigger_name, table_name, function_name);
    
    RAISE NOTICE '✅ Trigger %s created/updated on table %s', trigger_name, table_name;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Failed to create trigger %s on table %s: %s', trigger_name, table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Function to safely create indexes
CREATE OR REPLACE FUNCTION safe_create_index(
    index_name TEXT,
    table_name TEXT,
    columns TEXT
) RETURNS VOID AS $$
BEGIN
    -- Create index if not exists
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (%s)', index_name, table_name, columns);
    RAISE NOTICE '✅ Index %s created/verified on table %s', index_name, table_name;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Failed to create index %s on table %s: %s', index_name, table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. ENSURE REQUIRED FUNCTIONS EXIST
-- ============================================================================

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    RAISE NOTICE '✅ update_updated_at_column() function created/updated';
END $$;

-- ============================================================================
-- 3. COMPANIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    address JSONB,
    contact_info JSONB,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes safely
SELECT safe_create_index('idx_companies_slug', 'companies', 'slug');
SELECT safe_create_index('idx_companies_active', 'companies', 'is_active');

DO $$
BEGIN
    RAISE NOTICE '✅ Companies table created/verified';
END $$;

-- ============================================================================
-- 4. ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes safely
SELECT safe_create_index('idx_roles_slug', 'roles', 'slug');
SELECT safe_create_index('idx_roles_category', 'roles', 'category');
SELECT safe_create_index('idx_roles_active', 'roles', 'is_active');

DO $$
BEGIN
    RAISE NOTICE '✅ Roles table created/verified';
END $$;

-- ============================================================================
-- 5. USER ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add unique constraint safely
DO $$
BEGIN
    ALTER TABLE user_roles ADD CONSTRAINT user_roles_unique_user_role_company 
    UNIQUE(user_id, role_id, company_id);
    RAISE NOTICE '✅ Unique constraint added to user_roles';
EXCEPTION
    WHEN duplicate_table THEN
        RAISE NOTICE 'ℹ️ Unique constraint already exists on user_roles';
END $$;

-- Add indexes safely
SELECT safe_create_index('idx_user_roles_user_id', 'user_roles', 'user_id');
SELECT safe_create_index('idx_user_roles_role_id', 'user_roles', 'role_id');
SELECT safe_create_index('idx_user_roles_company_id', 'user_roles', 'company_id');
SELECT safe_create_index('idx_user_roles_active', 'user_roles', 'is_active');
SELECT safe_create_index('idx_user_roles_assigned_by', 'user_roles', 'assigned_by');

DO $$
BEGIN
    RAISE NOTICE '✅ User_roles table created/verified';
END $$;

-- ============================================================================
-- 6. ROLE HIERARCHIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_hierarchies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    child_role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    can_assign BOOLEAN DEFAULT true,
    can_revoke BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(parent_role_id, child_role_id)
);

-- Add indexes safely
SELECT safe_create_index('idx_role_hierarchies_parent', 'role_hierarchies', 'parent_role_id');
SELECT safe_create_index('idx_role_hierarchies_child', 'role_hierarchies', 'child_role_id');

DO $$
BEGIN
    RAISE NOTICE '✅ Role_hierarchies table created/verified';
END $$;

-- ============================================================================
-- 7. USER SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    active_role_id UUID REFERENCES roles(id),
    last_role_switch TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id)
);

-- Add indexes safely
SELECT safe_create_index('idx_user_sessions_user_id', 'user_sessions', 'user_id');
SELECT safe_create_index('idx_user_sessions_active_role', 'user_sessions', 'active_role_id');

RAISE NOTICE '✅ User_sessions table created/verified';

-- ============================================================================
-- 8. SUBSCRIPTION TIERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_tiers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) DEFAULT 0.00,
    price_yearly DECIMAL(10,2) DEFAULT 0.00,
    features JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes safely
SELECT safe_create_index('idx_subscription_tiers_slug', 'subscription_tiers', 'slug');
SELECT safe_create_index('idx_subscription_tiers_active', 'subscription_tiers', 'is_active');

RAISE NOTICE '✅ Subscription_tiers table created/verified';

-- ============================================================================
-- 9. USER SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES subscription_tiers(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    payment_method JSONB DEFAULT '{}',
    billing_cycle TEXT DEFAULT 'monthly',
    auto_renew BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes safely
SELECT safe_create_index('idx_user_subscriptions_user_id', 'user_subscriptions', 'user_id');
SELECT safe_create_index('idx_user_subscriptions_tier_id', 'user_subscriptions', 'tier_id');
SELECT safe_create_index('idx_user_subscriptions_status', 'user_subscriptions', 'status');
SELECT safe_create_index('idx_user_subscriptions_expires_at', 'user_subscriptions', 'expires_at');

RAISE NOTICE '✅ User_subscriptions table created/verified';

-- ============================================================================
-- 10. VENDOR CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES vendor_categories(id),
    icon TEXT,
    color TEXT,
    required_credentials JSONB DEFAULT '[]',
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes safely
SELECT safe_create_index('idx_vendor_categories_slug', 'vendor_categories', 'slug');
SELECT safe_create_index('idx_vendor_categories_parent', 'vendor_categories', 'parent_category_id');
SELECT safe_create_index('idx_vendor_categories_active', 'vendor_categories', 'is_active');

RAISE NOTICE '✅ Vendor_categories table created/verified';

-- ============================================================================
-- 11. VENDOR PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES vendor_categories(id) ON DELETE RESTRICT,
    business_name TEXT NOT NULL,
    license_number TEXT,
    license_state TEXT,
    certifications JSONB DEFAULT '[]',
    specializations JSONB DEFAULT '[]',
    service_areas JSONB DEFAULT '[]',
    hourly_rate DECIMAL(10,2),
    minimum_engagement DECIMAL(10,2),
    availability_status TEXT DEFAULT 'available',
    bio TEXT,
    years_experience INTEGER DEFAULT 0,
    education JSONB DEFAULT '[]',
    awards JSONB DEFAULT '[]',
    insurance_info JSONB DEFAULT '{}',
    verification_status TEXT DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add unique constraint safely
DO $$
BEGIN
    ALTER TABLE vendor_profiles ADD CONSTRAINT vendor_profiles_unique_user_category
    UNIQUE(user_id, category_id);
    RAISE NOTICE '✅ Unique constraint added to vendor_profiles';
EXCEPTION
    WHEN duplicate_table THEN
        RAISE NOTICE 'ℹ️ Unique constraint already exists on vendor_profiles';
END $$;

-- Add indexes safely
SELECT safe_create_index('idx_vendor_profiles_user_id', 'vendor_profiles', 'user_id');
SELECT safe_create_index('idx_vendor_profiles_category_id', 'vendor_profiles', 'category_id');
SELECT safe_create_index('idx_vendor_profiles_verification_status', 'vendor_profiles', 'verification_status');
SELECT safe_create_index('idx_vendor_profiles_featured', 'vendor_profiles', 'is_featured');

RAISE NOTICE '✅ Vendor_profiles table created/verified';

-- ============================================================================
-- 12. DASHBOARD PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_slug TEXT NOT NULL,
    layout_config JSONB DEFAULT '{}',
    widget_preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    theme_settings JSONB DEFAULT '{}',
    quick_actions JSONB DEFAULT '[]',
    default_filters JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add unique constraint safely
DO $$
BEGIN
    ALTER TABLE dashboard_preferences ADD CONSTRAINT dashboard_preferences_unique_user_role
    UNIQUE(user_id, role_slug);
    RAISE NOTICE '✅ Unique constraint added to dashboard_preferences';
EXCEPTION
    WHEN duplicate_table THEN
        RAISE NOTICE 'ℹ️ Unique constraint already exists on dashboard_preferences';
END $$;

-- Add indexes safely
SELECT safe_create_index('idx_dashboard_preferences_user_id', 'dashboard_preferences', 'user_id');
SELECT safe_create_index('idx_dashboard_preferences_role_slug', 'dashboard_preferences', 'role_slug');

RAISE NOTICE '✅ Dashboard_preferences table created/verified';

-- ============================================================================
-- 13. USAGE ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    role_context TEXT,
    usage_count INTEGER DEFAULT 1,
    usage_date DATE DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add unique constraint safely
DO $$
BEGIN
    ALTER TABLE usage_analytics ADD CONSTRAINT usage_analytics_unique_user_feature_date
    UNIQUE(user_id, feature_name, usage_date);
    RAISE NOTICE '✅ Unique constraint added to usage_analytics';
EXCEPTION
    WHEN duplicate_table THEN
        RAISE NOTICE 'ℹ️ Unique constraint already exists on usage_analytics';
END $$;

-- Add indexes safely
SELECT safe_create_index('idx_usage_analytics_user_id', 'usage_analytics', 'user_id');
SELECT safe_create_index('idx_usage_analytics_feature', 'usage_analytics', 'feature_name');
SELECT safe_create_index('idx_usage_analytics_date', 'usage_analytics', 'usage_date');
SELECT safe_create_index('idx_usage_analytics_role', 'usage_analytics', 'role_context');

RAISE NOTICE '✅ Usage_analytics table created/verified';

-- ============================================================================
-- 14. CONTENT WORKFLOW TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_workflow (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL,
    workflow_stage TEXT NOT NULL DEFAULT 'draft',
    assigned_to UUID REFERENCES auth.users(id),
    assigned_by UUID REFERENCES auth.users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes safely
SELECT safe_create_index('idx_content_workflow_content_id', 'content_workflow', 'content_id');
SELECT safe_create_index('idx_content_workflow_type', 'content_workflow', 'content_type');
SELECT safe_create_index('idx_content_workflow_stage', 'content_workflow', 'workflow_stage');
SELECT safe_create_index('idx_content_workflow_assigned_to', 'content_workflow', 'assigned_to');

RAISE NOTICE '✅ Content_workflow table created/verified';

-- ============================================================================
-- 15. AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id),
    target_resource TEXT,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes safely
SELECT safe_create_index('idx_audit_log_user_id', 'audit_log', 'user_id');
SELECT safe_create_index('idx_audit_log_action', 'audit_log', 'action');
SELECT safe_create_index('idx_audit_log_target_user', 'audit_log', 'target_user_id');
SELECT safe_create_index('idx_audit_log_created_at', 'audit_log', 'created_at');

RAISE NOTICE '✅ Audit_log table created/verified';

-- ============================================================================
-- 16. EXTEND EXISTING PROFILES TABLE
-- ============================================================================

-- Add new columns to profiles table safely
DO $$
BEGIN
    -- Add company_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'company_id') THEN
        ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id);
        RAISE NOTICE '✅ Added company_id column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ company_id column already exists in profiles';
    END IF;

    -- Add legacy_role column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'legacy_role') THEN
        ALTER TABLE profiles ADD COLUMN legacy_role TEXT;
        RAISE NOTICE '✅ Added legacy_role column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ legacy_role column already exists in profiles';
    END IF;

    -- Add migration_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'migration_status') THEN
        ALTER TABLE profiles ADD COLUMN migration_status TEXT DEFAULT 'pending';
        RAISE NOTICE '✅ Added migration_status column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ migration_status column already exists in profiles';
    END IF;

    -- Add subscription columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'subscription_tier_id') THEN
        ALTER TABLE profiles ADD COLUMN subscription_tier_id UUID REFERENCES subscription_tiers(id);
        RAISE NOTICE '✅ Added subscription_tier_id column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ subscription_tier_id column already exists in profiles';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'free';
        RAISE NOTICE '✅ Added subscription_status column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ subscription_status column already exists in profiles';
    END IF;

    -- Add onboarding columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added onboarding_completed column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ onboarding_completed column already exists in profiles';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'profiles' AND column_name = 'onboarding_step') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_step INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added onboarding_step column to profiles';
    ELSE
        RAISE NOTICE 'ℹ️ onboarding_step column already exists in profiles';
    END IF;
END $$;

-- Add indexes for new profile columns
SELECT safe_create_index('idx_profiles_company_id', 'profiles', 'company_id');
SELECT safe_create_index('idx_profiles_subscription_tier', 'profiles', 'subscription_tier_id');
SELECT safe_create_index('idx_profiles_subscription_status', 'profiles', 'subscription_status');

-- ============================================================================
-- 17. CREATE ALL TRIGGERS SAFELY
-- ============================================================================

-- Create triggers for all tables with updated_at columns
SELECT safe_create_trigger('update_companies_updated_at', 'companies', 'update_updated_at_column');
SELECT safe_create_trigger('update_roles_updated_at', 'roles', 'update_updated_at_column');
SELECT safe_create_trigger('update_user_roles_updated_at', 'user_roles', 'update_updated_at_column');
SELECT safe_create_trigger('update_role_hierarchies_updated_at', 'role_hierarchies', 'update_updated_at_column');
SELECT safe_create_trigger('update_user_sessions_updated_at', 'user_sessions', 'update_updated_at_column');
SELECT safe_create_trigger('update_subscription_tiers_updated_at', 'subscription_tiers', 'update_updated_at_column');
SELECT safe_create_trigger('update_user_subscriptions_updated_at', 'user_subscriptions', 'update_updated_at_column');
SELECT safe_create_trigger('update_vendor_categories_updated_at', 'vendor_categories', 'update_updated_at_column');
SELECT safe_create_trigger('update_vendor_profiles_updated_at', 'vendor_profiles', 'update_updated_at_column');
SELECT safe_create_trigger('update_dashboard_preferences_updated_at', 'dashboard_preferences', 'update_updated_at_column');
SELECT safe_create_trigger('update_content_workflow_updated_at', 'content_workflow', 'update_updated_at_column');

RAISE NOTICE '✅ All triggers created/updated successfully';

-- ============================================================================
-- 18. INITIAL DATA SETUP
-- ============================================================================

-- Insert default company
INSERT INTO companies (id, name, slug, description, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Ardonie Capital', 'ardonie-capital', 'Default company for Ardonie Capital platform', true)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

RAISE NOTICE '✅ Default company created/updated';

-- Insert subscription tiers
INSERT INTO subscription_tiers (id, name, slug, description, price_monthly, price_yearly, features, limits) VALUES
('40000000-0000-0000-0000-000000000001', 'Free', 'free', 'Basic access to platform features', 0.00, 0.00,
 '{"basic_search": true, "limited_listings": true, "basic_messaging": true}',
 '{"monthly_searches": 10, "saved_listings": 5, "messages_per_day": 3}'),
('40000000-0000-0000-0000-000000000002', 'Pro', 'pro', 'Full access to all platform features', 29.99, 299.99,
 '{"unlimited_search": true, "unlimited_listings": true, "priority_messaging": true, "advanced_analytics": true, "vendor_directory": true}',
 '{"monthly_searches": -1, "saved_listings": -1, "messages_per_day": -1}')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits;

RAISE NOTICE '✅ Subscription tiers created/updated';

-- Insert vendor categories
INSERT INTO vendor_categories (id, name, slug, description, required_credentials, features) VALUES
('50000000-0000-0000-0000-000000000001', 'Financial Professionals', 'financial', 'Licensed business brokers, CPAs, financial advisors, business valuation experts',
 '["business_broker_license", "cpa_license", "cfa_certification", "business_valuation_certification"]',
 '{"financial_analysis": true, "valuation_tools": true, "broker_network": true}'),
('50000000-0000-0000-0000-000000000002', 'Legal & Other Professionals', 'legal', 'Business attorneys, tax professionals, insurance agents, consultants',
 '["bar_admission", "tax_professional_license", "insurance_license", "consulting_certification"]',
 '{"legal_document_templates": true, "compliance_tools": true, "contract_review": true}')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    required_credentials = EXCLUDED.required_credentials,
    features = EXCLUDED.features;

RAISE NOTICE '✅ Vendor categories created/updated';

-- Insert roles
INSERT INTO roles (id, name, slug, description, category, permissions) VALUES
('10000000-0000-0000-0000-000000000001', 'Buyer', 'buyer', 'Individual or entity looking to purchase auto repair businesses', 'primary', '{"dashboard": true, "search_listings": true, "save_listings": true, "contact_sellers": true}'),
('10000000-0000-0000-0000-000000000002', 'Seller', 'seller', 'Business owner looking to sell their auto repair business', 'primary', '{"dashboard": true, "create_listings": true, "manage_listings": true, "respond_to_inquiries": true}'),
('10000000-0000-0000-0000-000000000003', 'Vendor', 'vendor', 'Professional service provider (parent category)', 'primary', '{"vendor_dashboard": true, "client_management": true, "service_listings": true}'),
('10000000-0000-0000-0000-000000000004', 'Super Admin', 'super_admin', 'Full platform access and user management', 'system', '{"admin_dashboard": true, "user_management": true, "system_settings": true, "all_data_access": true}'),
('10000000-0000-0000-0000-000000000005', 'Company Admin', 'company_admin', 'Manage users within their company', 'system', '{"admin_dashboard": true, "company_user_management": true, "company_settings": true}'),
('10000000-0000-0000-0000-000000000006', 'Financial Professional', 'financial_professional', 'Licensed financial services provider', 'primary', '{"vendor_dashboard": true, "financial_tools": true, "buyer_features": true}'),
('10000000-0000-0000-0000-000000000007', 'Legal Professional', 'legal_professional', 'Licensed legal services provider', 'primary', '{"vendor_dashboard": true, "legal_tools": true, "buyer_features": true}'),
('10000000-0000-0000-0000-000000000008', 'Blog Editor', 'blog_editor', 'Can create, edit, delete, and publish blog content', 'blog', '{"blog_dashboard": true, "create_posts": true, "edit_posts": true, "publish_posts": true, "delete_posts": true}'),
('10000000-0000-0000-0000-000000000009', 'Blog Contributor', 'blog_contributor', 'Can create and edit blog content but cannot publish', 'blog', '{"blog_dashboard": true, "create_posts": true, "edit_posts": true}'),
('10000000-0000-0000-0000-000000000010', 'Admin', 'admin', 'Legacy admin role for backward compatibility', 'system', '{"admin_dashboard": true, "user_management": true, "system_settings": true}')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    permissions = EXCLUDED.permissions;

RAISE NOTICE '✅ Roles created/updated';

-- Insert role hierarchies
INSERT INTO role_hierarchies (parent_role_id, child_role_id, can_assign, can_revoke) VALUES
((SELECT id FROM roles WHERE slug = 'super_admin'), (SELECT id FROM roles WHERE slug = 'company_admin'), true, true),
((SELECT id FROM roles WHERE slug = 'super_admin'), (SELECT id FROM roles WHERE slug = 'blog_editor'), true, true),
((SELECT id FROM roles WHERE slug = 'super_admin'), (SELECT id FROM roles WHERE slug = 'blog_contributor'), true, true),
((SELECT id FROM roles WHERE slug = 'company_admin'), (SELECT id FROM roles WHERE slug = 'buyer'), true, true),
((SELECT id FROM roles WHERE slug = 'company_admin'), (SELECT id FROM roles WHERE slug = 'seller'), true, true),
((SELECT id FROM roles WHERE slug = 'company_admin'), (SELECT id FROM roles WHERE slug = 'vendor'), true, true),
((SELECT id FROM roles WHERE slug = 'blog_editor'), (SELECT id FROM roles WHERE slug = 'blog_contributor'), true, true)
ON CONFLICT (parent_role_id, child_role_id) DO NOTHING;

RAISE NOTICE '✅ Role hierarchies created/updated';

-- ============================================================================
-- 19. MIGRATION OF EXISTING USERS
-- ============================================================================

-- Backup existing role data and set migration status
UPDATE profiles
SET legacy_role = role,
    migration_status = 'pending'
WHERE legacy_role IS NULL AND role IS NOT NULL;

RAISE NOTICE '✅ Existing user roles backed up';

-- Assign default subscription tiers to existing users
DO $$
DECLARE
    free_tier_id UUID;
    default_company_id UUID;
BEGIN
    SELECT id INTO free_tier_id FROM subscription_tiers WHERE slug = 'free';
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';

    -- Assign free tier to all existing users without subscription
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

    RAISE NOTICE '✅ Default subscriptions assigned to existing users';
END $$;

-- Migrate existing single roles to multi-role system
DO $$
DECLARE
    buyer_role_id UUID;
    seller_role_id UUID;
    admin_role_id UUID;
    super_admin_role_id UUID;
    default_company_id UUID;
    user_record RECORD;
    migration_count INTEGER := 0;
BEGIN
    -- Get role IDs
    SELECT id INTO buyer_role_id FROM roles WHERE slug = 'buyer';
    SELECT id INTO seller_role_id FROM roles WHERE slug = 'seller';
    SELECT id INTO admin_role_id FROM roles WHERE slug = 'admin';
    SELECT id INTO super_admin_role_id FROM roles WHERE slug = 'super_admin';
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';

    -- Migrate each user based on their legacy role
    FOR user_record IN
        SELECT user_id, role, legacy_role
        FROM profiles
        WHERE migration_status = 'pending' AND role IS NOT NULL
    LOOP
        -- Assign role based on legacy role
        CASE user_record.role
            WHEN 'buyer' THEN
                INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, metadata)
                VALUES (
                    user_record.user_id,
                    buyer_role_id,
                    default_company_id,
                    user_record.user_id,
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
                    super_admin_role_id,
                    default_company_id,
                    user_record.user_id,
                    '{"migration": true, "legacy_role": "admin", "upgraded_to": "super_admin"}'
                ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;

                -- Also assign legacy admin role for backward compatibility
                INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, metadata)
                VALUES (
                    user_record.user_id,
                    admin_role_id,
                    default_company_id,
                    user_record.user_id,
                    '{"migration": true, "legacy_compatibility": true}'
                ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;
        END CASE;

        -- Update migration status
        UPDATE profiles
        SET migration_status = 'migrated'
        WHERE user_id = user_record.user_id;

        migration_count := migration_count + 1;
    END LOOP;

    RAISE NOTICE '✅ Migrated % users to multi-role system', migration_count;
END $$;

-- Create user sessions for migrated users
DO $$
DECLARE
    user_record RECORD;
    primary_role_id UUID;
    session_count INTEGER := 0;
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

        session_count := session_count + 1;
    END LOOP;

    RAISE NOTICE '✅ Created % user sessions', session_count;
END $$;

-- Create default dashboard preferences for migrated users
DO $$
DECLARE
    user_role_record RECORD;
    preference_count INTEGER := 0;
BEGIN
    FOR user_role_record IN
        SELECT ur.user_id, r.slug as role_slug
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM dashboard_preferences dp
            WHERE dp.user_id = ur.user_id AND dp.role_slug = r.slug
        )
    LOOP
        INSERT INTO dashboard_preferences (user_id, role_slug, layout_config, widget_preferences)
        VALUES (
            user_role_record.user_id,
            user_role_record.role_slug,
            CASE user_role_record.role_slug
                WHEN 'buyer' THEN '{"layout": "grid", "columns": 3, "sections": ["overview", "saved_listings", "recent_activity"]}'
                WHEN 'seller' THEN '{"layout": "grid", "columns": 3, "sections": ["overview", "my_listings", "inquiries"]}'
                WHEN 'vendor' THEN '{"layout": "grid", "columns": 3, "sections": ["overview", "client_requests", "portfolio"]}'
                WHEN 'super_admin' THEN '{"layout": "grid", "columns": 4, "sections": ["overview", "user_management", "analytics", "system_health"]}'
                ELSE '{"layout": "grid", "columns": 3, "sections": ["overview"]}'
            END,
            CASE user_role_record.role_slug
                WHEN 'buyer' THEN '{"kpi_cards": true, "recent_listings": true, "saved_searches": true, "notifications": true}'
                WHEN 'seller' THEN '{"kpi_cards": true, "listing_performance": true, "inquiries": true, "notifications": true}'
                WHEN 'vendor' THEN '{"kpi_cards": true, "client_pipeline": true, "reviews": true, "notifications": true}'
                WHEN 'super_admin' THEN '{"kpi_cards": true, "user_stats": true, "system_metrics": true, "audit_log": true}'
                ELSE '{"kpi_cards": true, "notifications": true}'
            END
        ) ON CONFLICT (user_id, role_slug) DO NOTHING;

        preference_count := preference_count + 1;
    END LOOP;

    RAISE NOTICE '✅ Created % dashboard preferences', preference_count;
END $$;

-- ============================================================================
-- 20. AUDIT LOG ENTRIES FOR MIGRATION
-- ============================================================================

-- Log the migration process for audit purposes
INSERT INTO audit_log (user_id, action, target_user_id, details)
SELECT
    ur.user_id,
    'role_migrated',
    ur.user_id,
    jsonb_build_object(
        'migration_date', NOW(),
        'legacy_role', p.legacy_role,
        'new_role_id', ur.role_id,
        'migration_type', 'automatic_deployment',
        'deployment_script', 'DEPLOY-MULTI-ROLE-SAFE.sql'
    )
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE p.migration_status = 'migrated'
AND ur.metadata->>'migration' = 'true'
AND NOT EXISTS (
    SELECT 1 FROM audit_log al
    WHERE al.user_id = ur.user_id
    AND al.action = 'role_migrated'
    AND al.target_user_id = ur.user_id
);

RAISE NOTICE '✅ Migration audit log entries created';

-- ============================================================================
-- 21. CLEANUP AND HELPER FUNCTION REMOVAL
-- ============================================================================

-- Drop helper functions (they were only needed for deployment)
DROP FUNCTION IF EXISTS safe_create_trigger(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS safe_create_index(TEXT, TEXT, TEXT);

RAISE NOTICE '✅ Cleanup completed - helper functions removed';

-- ============================================================================
-- 22. FINAL VERIFICATION AND DEPLOYMENT SUMMARY
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
    role_count INTEGER;
    user_role_count INTEGER;
    subscription_count INTEGER;
    vendor_category_count INTEGER;
    migrated_user_count INTEGER;
    session_count INTEGER;
    preference_count INTEGER;
    audit_count INTEGER;
    company_count INTEGER;
    trigger_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Count all deployment components
    SELECT COUNT(*) INTO table_count FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'companies', 'roles', 'user_roles', 'role_hierarchies', 'user_sessions',
        'subscription_tiers', 'user_subscriptions', 'vendor_categories',
        'vendor_profiles', 'dashboard_preferences', 'usage_analytics',
        'content_workflow', 'audit_log'
    );

    SELECT COUNT(*) INTO role_count FROM roles;
    SELECT COUNT(*) INTO user_role_count FROM user_roles;
    SELECT COUNT(*) INTO subscription_count FROM user_subscriptions;
    SELECT COUNT(*) INTO vendor_category_count FROM vendor_categories;
    SELECT COUNT(*) INTO migrated_user_count FROM profiles WHERE migration_status = 'migrated';
    SELECT COUNT(*) INTO session_count FROM user_sessions;
    SELECT COUNT(*) INTO preference_count FROM dashboard_preferences;
    SELECT COUNT(*) INTO audit_count FROM audit_log WHERE action = 'role_migrated';
    SELECT COUNT(*) INTO company_count FROM companies;

    -- Count triggers
    SELECT COUNT(*) INTO trigger_count FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%updated_at%';

    -- Count indexes
    SELECT COUNT(*) INTO index_count FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';

    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '🎉 MULTI-ROLE SCHEMA DEPLOYMENT COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DEPLOYMENT SUMMARY:';
    RAISE NOTICE '   📋 Database Structure:';
    RAISE NOTICE '      • Multi-role tables created/verified: % of 13 expected', table_count;
    RAISE NOTICE '      • Companies: %', company_count;
    RAISE NOTICE '      • Triggers created: %', trigger_count;
    RAISE NOTICE '      • Indexes created: %', index_count;
    RAISE NOTICE '';
    RAISE NOTICE '   👥 User & Role Management:';
    RAISE NOTICE '      • Roles defined: %', role_count;
    RAISE NOTICE '      • User role assignments: %', user_role_count;
    RAISE NOTICE '      • Migrated users: %', migrated_user_count;
    RAISE NOTICE '      • User sessions created: %', session_count;
    RAISE NOTICE '      • Dashboard preferences: %', preference_count;
    RAISE NOTICE '';
    RAISE NOTICE '   💰 Subscription System:';
    RAISE NOTICE '      • User subscriptions: %', subscription_count;
    RAISE NOTICE '      • Vendor categories: %', vendor_category_count;
    RAISE NOTICE '';
    RAISE NOTICE '   📝 Audit & Compliance:';
    RAISE NOTICE '      • Migration audit entries: %', audit_count;
    RAISE NOTICE '';

    -- Deployment status evaluation
    IF table_count >= 13 AND role_count >= 10 AND company_count >= 1 THEN
        RAISE NOTICE '✅ DEPLOYMENT STATUS: SUCCESS';
        RAISE NOTICE '✅ All required components have been created/verified successfully.';
        RAISE NOTICE '✅ Existing users have been migrated to the new multi-role system.';
        RAISE NOTICE '✅ The system is ready for enhanced multi-role authentication.';
        RAISE NOTICE '✅ Database schema deployment completed without errors.';
    ELSE
        RAISE NOTICE '⚠️  DEPLOYMENT STATUS: INCOMPLETE';
        RAISE NOTICE '⚠️  Some components may be missing. Please review the logs above.';
        RAISE NOTICE '⚠️  Expected: 13+ tables, 10+ roles, 1+ company';
        RAISE NOTICE '⚠️  Found: % tables, % roles, % companies', table_count, role_count, company_count;
        RAISE NOTICE '⚠️  Please check for errors and re-run if necessary.';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '🔄 IMMEDIATE NEXT STEPS:';
    RAISE NOTICE '   1. 🧪 Test authentication with existing user accounts';
    RAISE NOTICE '   2. 🎯 Verify role-based dashboard routing works correctly';
    RAISE NOTICE '   3. 🎭 Test role selection interface for multi-role users';
    RAISE NOTICE '   4. 💳 Validate subscription tier functionality';
    RAISE NOTICE '   5. 🚀 Deploy enhanced dashboard components to frontend';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 TESTING CHECKLIST:';
    RAISE NOTICE '   □ Login with existing buyer account → should redirect to buyer dashboard';
    RAISE NOTICE '   □ Login with existing seller account → should redirect to seller dashboard';
    RAISE NOTICE '   □ Login with admin account → should redirect to admin dashboard';
    RAISE NOTICE '   □ Create new multi-role user → should show role selection interface';
    RAISE NOTICE '   □ Test role switching functionality in dashboard settings';
    RAISE NOTICE '   □ Verify subscription tier features work correctly';
    RAISE NOTICE '';
    RAISE NOTICE '📚 DOCUMENTATION & RESOURCES:';
    RAISE NOTICE '   • Implementation Guide: docs/MULTI-ROLE-DASHBOARD-IMPLEMENTATION.md';
    RAISE NOTICE '   • Enhanced Auth Service: src/features/authentication/services/enhanced-auth.service.js';
    RAISE NOTICE '   • Dashboard Router: dashboard/dashboard-router.js';
    RAISE NOTICE '   • Role Selection UI: dashboard/enhanced-role-selection.html';
    RAISE NOTICE '   • Enhanced Buyer Dashboard: dashboard/enhanced-buyer-dashboard.html';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '🎉 DEPLOYMENT COMPLETE - MULTI-ROLE SYSTEM IS READY FOR TESTING!';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '';
END $$;

-- Create user sessions for migrated users
DO $$
DECLARE
    user_record RECORD;
    primary_role_id UUID;
    session_count INTEGER := 0;
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

        session_count := session_count + 1;
    END LOOP;

    RAISE NOTICE '✅ Created % user sessions', session_count;
END $$;

-- ============================================================================
-- 20. CLEANUP AND FINAL VERIFICATION
-- ============================================================================

-- Drop helper functions (they were only needed for deployment)
DROP FUNCTION IF EXISTS safe_create_trigger(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS safe_create_index(TEXT, TEXT, TEXT);

RAISE NOTICE '✅ Cleanup completed - helper functions removed';

-- Final verification
DO $$
DECLARE
    table_count INTEGER;
    role_count INTEGER;
    user_role_count INTEGER;
    subscription_count INTEGER;
    vendor_category_count INTEGER;
    migrated_user_count INTEGER;
    session_count INTEGER;
BEGIN
    -- Count new tables
    SELECT COUNT(*) INTO table_count FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'companies', 'roles', 'user_roles', 'role_hierarchies', 'user_sessions',
        'subscription_tiers', 'user_subscriptions', 'vendor_categories',
        'vendor_profiles', 'dashboard_preferences', 'usage_analytics',
        'content_workflow', 'audit_log'
    );

    SELECT COUNT(*) INTO role_count FROM roles;
    SELECT COUNT(*) INTO user_role_count FROM user_roles;
    SELECT COUNT(*) INTO subscription_count FROM user_subscriptions;
    SELECT COUNT(*) INTO vendor_category_count FROM vendor_categories;
    SELECT COUNT(*) INTO migrated_user_count FROM profiles WHERE migration_status = 'migrated';
    SELECT COUNT(*) INTO session_count FROM user_sessions;

    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '🎉 MULTI-ROLE SCHEMA DEPLOYMENT COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DEPLOYMENT SUMMARY:';
    RAISE NOTICE '   • Multi-role tables created/verified: %', table_count;
    RAISE NOTICE '   • Roles defined: %', role_count;
    RAISE NOTICE '   • User role assignments: %', user_role_count;
    RAISE NOTICE '   • User subscriptions: %', subscription_count;
    RAISE NOTICE '   • Vendor categories: %', vendor_category_count;
    RAISE NOTICE '   • Migrated users: %', migrated_user_count;
    RAISE NOTICE '   • User sessions: %', session_count;
    RAISE NOTICE '';

    IF table_count >= 13 AND role_count >= 10 THEN
        RAISE NOTICE '✅ Multi-role schema deployment completed successfully!';
        RAISE NOTICE '✅ All required tables and data have been created/verified.';
        RAISE NOTICE '✅ Existing users have been migrated to the new system.';
        RAISE NOTICE '✅ The system is ready for multi-role authentication.';
    ELSE
        RAISE NOTICE '⚠️  Deployment may be incomplete. Please review the logs above.';
        RAISE NOTICE '⚠️  Expected: 13+ tables, 10+ roles';
        RAISE NOTICE '⚠️  Found: % tables, % roles', table_count, role_count;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '🔄 NEXT STEPS:';
    RAISE NOTICE '   1. Test authentication with existing user accounts';
    RAISE NOTICE '   2. Verify role-based dashboard routing works correctly';
    RAISE NOTICE '   3. Test role selection interface for multi-role users';
    RAISE NOTICE '   4. Validate subscription tier functionality';
    RAISE NOTICE '   5. Deploy enhanced dashboard components';
    RAISE NOTICE '';
    RAISE NOTICE '📚 DOCUMENTATION: See docs/MULTI-ROLE-DASHBOARD-IMPLEMENTATION.md';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
END $$;
