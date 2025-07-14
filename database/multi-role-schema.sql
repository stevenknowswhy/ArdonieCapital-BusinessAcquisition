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
