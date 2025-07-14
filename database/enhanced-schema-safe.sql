-- Enhanced Database Schema for BuyMartV1 - Safe Deployment Version
-- This version handles existing constraints and tables gracefully
-- Run this if the original enhanced-schema.sql encounters constraint conflicts

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CONTENT MANAGEMENT SYSTEM TABLES
-- ============================================================================

-- Content pages table for blog posts and CMS content
CREATE TABLE IF NOT EXISTS content_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured_image TEXT,
    tags TEXT[],
    category_id UUID,
    view_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0, -- estimated reading time in minutes
    seo_score INTEGER DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Blog categories table for organizing content
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6', -- Default blue color
    icon TEXT, -- Icon class or emoji
    parent_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint for content_pages category_id (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_content_pages_category' 
        AND table_name = 'content_pages'
    ) THEN
        ALTER TABLE content_pages 
        ADD CONSTRAINT fk_content_pages_category 
        FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Documents table for file management
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    file_hash TEXT, -- For duplicate detection
    title TEXT,
    description TEXT,
    tags TEXT[],
    category TEXT,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    access_level TEXT DEFAULT 'private' CHECK (access_level IN ('public', 'private', 'restricted')),
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Deals table for business acquisition opportunities
CREATE TABLE IF NOT EXISTS deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'negotiating', 'due_diligence', 'closing', 'completed', 'cancelled')),
    offer_amount DECIMAL(15,2),
    terms TEXT,
    conditions TEXT[],
    due_diligence_deadline DATE,
    closing_date DATE,
    commission_rate DECIMAL(5,4) DEFAULT 0.0500, -- 5% default
    commission_amount DECIMAL(15,2),
    notes TEXT,
    documents UUID[], -- Array of document IDs
    milestones JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Vendors table for service providers
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    services TEXT[] NOT NULL,
    specializations TEXT[],
    service_areas TEXT[], -- Geographic areas served
    license_number TEXT,
    insurance_info JSONB,
    certifications TEXT[],
    years_experience INTEGER,
    hourly_rate DECIMAL(10,2),
    project_rate_min DECIMAL(15,2),
    project_rate_max DECIMAL(15,2),
    availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    response_time_hours INTEGER DEFAULT 24,
    portfolio_items JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Vendor reviews table
CREATE TABLE IF NOT EXISTS vendor_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT NOT NULL,
    pros TEXT[],
    cons TEXT[],
    would_recommend BOOLEAN DEFAULT true,
    service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
    communication INTEGER CHECK (communication >= 1 AND communication <= 5),
    timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5),
    value_for_money INTEGER CHECK (value_for_money >= 1 AND value_for_money <= 5),
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE (CREATE ONLY IF NOT EXISTS)
-- ============================================================================

-- Content pages indexes
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_status ON content_pages(status);
CREATE INDEX IF NOT EXISTS idx_content_pages_author ON content_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_content_pages_category ON content_pages(category_id);
CREATE INDEX IF NOT EXISTS idx_content_pages_published ON content_pages(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_pages_tags ON content_pages USING GIN(tags);

-- Blog categories indexes
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON blog_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON blog_categories(is_active);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_access_level ON documents(access_level);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(file_hash);

-- Deals indexes
CREATE INDEX IF NOT EXISTS idx_deals_listing ON deals(listing_id);
CREATE INDEX IF NOT EXISTS idx_deals_buyer ON deals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deals_seller ON deals(seller_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);

-- Vendors indexes
CREATE INDEX IF NOT EXISTS idx_vendors_profile ON vendors(profile_id);
CREATE INDEX IF NOT EXISTS idx_vendors_business_type ON vendors(business_type);
CREATE INDEX IF NOT EXISTS idx_vendors_services ON vendors USING GIN(services);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_featured ON vendors(is_featured);

-- Vendor reviews indexes
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor ON vendor_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_reviewer ON vendor_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_rating ON vendor_reviews(rating DESC);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES (CREATE OR REPLACE)
-- ============================================================================

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables (DROP IF EXISTS first)
DROP TRIGGER IF EXISTS update_content_pages_updated_at ON content_pages;
CREATE TRIGGER update_content_pages_updated_at BEFORE UPDATE ON content_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON blog_categories;
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendor_reviews_updated_at ON vendor_reviews;
CREATE TRIGGER update_vendor_reviews_updated_at BEFORE UPDATE ON vendor_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA SEEDING (INSERT ONLY IF NOT EXISTS)
-- ============================================================================

-- Insert default blog categories (only if they don't exist)
INSERT INTO blog_categories (name, slug, description, color, icon, sort_order) 
SELECT * FROM (VALUES
    ('Business Acquisition', 'business-acquisition', 'Guides and insights on acquiring businesses', '#3B82F6', '🏢', 1),
    ('Market Analysis', 'market-analysis', 'Market trends and analysis reports', '#10B981', '📊', 2),
    ('Due Diligence', 'due-diligence', 'Due diligence processes and checklists', '#F59E0B', '🔍', 3),
    ('Financing', 'financing', 'Business financing options and strategies', '#8B5CF6', '💰', 4),
    ('Legal & Compliance', 'legal-compliance', 'Legal aspects of business transactions', '#EF4444', '⚖️', 5),
    ('Success Stories', 'success-stories', 'Client success stories and case studies', '#06B6D4', '🎉', 6)
) AS new_categories(name, slug, description, color, icon, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM blog_categories WHERE slug = new_categories.slug
);

-- Enhanced schema deployment completed successfully
SELECT 'Enhanced database schema deployed successfully (safe version)!' as status;
