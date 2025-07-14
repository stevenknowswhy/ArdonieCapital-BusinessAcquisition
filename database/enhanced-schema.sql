-- Enhanced Database Schema for BuyMartV1
-- Additional tables required for content management, blog system, and vendor management
-- Run this after the base schema.sql has been applied

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

-- Blog categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT, -- Icon class or SVG
    parent_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint for content_pages category
ALTER TABLE content_pages 
ADD CONSTRAINT fk_content_pages_category 
FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL;

-- Document management table
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    access_level TEXT DEFAULT 'public' CHECK (access_level IN ('public', 'authenticated', 'premium', 'admin')),
    download_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    version TEXT DEFAULT '1.0',
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- ENHANCED DEAL MANAGEMENT
-- ============================================================================

-- Enhanced deals table for comprehensive deal tracking
CREATE TABLE IF NOT EXISTS deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES profiles(id) NOT NULL,
    seller_id UUID REFERENCES profiles(id) NOT NULL,
    listing_id UUID REFERENCES listings(id) NOT NULL,
    deal_number TEXT UNIQUE NOT NULL, -- Auto-generated deal reference
    status TEXT DEFAULT 'initial_interest' CHECK (status IN (
        'initial_interest', 'nda_signed', 'due_diligence', 'negotiation', 
        'financing', 'legal_review', 'closing', 'completed', 'cancelled', 'expired'
    )),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Financial details
    initial_offer DECIMAL(15,2),
    current_offer DECIMAL(15,2),
    final_price DECIMAL(15,2),
    earnest_money DECIMAL(15,2),
    financing_amount DECIMAL(15,2),
    cash_amount DECIMAL(15,2),
    
    -- Timeline
    offer_date DATE,
    acceptance_date DATE,
    due_diligence_deadline DATE,
    financing_deadline DATE,
    closing_date DATE,
    actual_closing_date DATE,
    
    -- Deal terms and conditions
    deal_terms JSONB,
    contingencies TEXT[],
    included_assets TEXT[],
    excluded_assets TEXT[],
    
    -- Documentation
    documents TEXT[], -- Array of document IDs or file paths
    notes TEXT,
    private_notes TEXT, -- Only visible to deal participants
    
    -- Progress tracking
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    milestones_completed TEXT[],
    next_action TEXT,
    next_action_due DATE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- VENDOR MANAGEMENT SYSTEM
-- ============================================================================

-- Vendors table for service providers
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    vendor_type TEXT NOT NULL CHECK (vendor_type IN (
        'broker', 'attorney', 'accountant', 'lender', 'appraiser', 'consultant',
        'insurance', 'marketing', 'technology', 'other'
    )),
    
    -- Business details
    license_number TEXT,
    tax_id TEXT,
    business_address TEXT,
    service_areas TEXT[], -- Geographic areas served
    specializations TEXT[], -- Specific areas of expertise
    certifications TEXT[], -- Professional certifications
    
    -- Performance metrics
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    total_deals INTEGER DEFAULT 0,
    successful_deals INTEGER DEFAULT 0,
    average_deal_time INTEGER DEFAULT 0, -- in days
    
    -- Pricing and availability
    hourly_rate DECIMAL(10,2),
    project_rate_min DECIMAL(15,2),
    project_rate_max DECIMAL(15,2),
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
    
    -- Status and verification
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Contact preferences
    preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'both')),
    response_time_hours INTEGER DEFAULT 24,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Vendor reviews table
CREATE TABLE IF NOT EXISTS vendor_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    pros TEXT[],
    cons TEXT[],
    would_recommend BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE, -- Verified purchase/service
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(vendor_id, reviewer_id, deal_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Content Management Indexes
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_status ON content_pages(status);
CREATE INDEX IF NOT EXISTS idx_content_pages_published_at ON content_pages(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_pages_author ON content_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_content_pages_category ON content_pages(category_id);
CREATE INDEX IF NOT EXISTS idx_content_pages_tags ON content_pages USING GIN (tags);

-- Blog Categories Indexes
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON blog_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON blog_categories(is_active);

-- Documents Indexes
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_access_level ON documents(access_level);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_documents_featured ON documents(is_featured);

-- Deals Indexes
CREATE INDEX IF NOT EXISTS idx_deals_buyer_id ON deals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deals_seller_id ON deals(seller_id);
CREATE INDEX IF NOT EXISTS idx_deals_listing_id ON deals(listing_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_closing_date ON deals(closing_date);
CREATE INDEX IF NOT EXISTS idx_deals_deal_number ON deals(deal_number);
CREATE INDEX IF NOT EXISTS idx_deals_priority ON deals(priority);

-- Vendors Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(vendor_type);
CREATE INDEX IF NOT EXISTS idx_vendors_service_areas ON vendors USING GIN (service_areas);
CREATE INDEX IF NOT EXISTS idx_vendors_specializations ON vendors USING GIN (specializations);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_vendors_verified ON vendors(verified);
CREATE INDEX IF NOT EXISTS idx_vendors_featured ON vendors(featured);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);

-- Vendor Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor ON vendor_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_reviewer ON vendor_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_rating ON vendor_reviews(rating);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all new tables
CREATE TRIGGER update_content_pages_updated_at BEFORE UPDATE ON content_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_reviews_updated_at BEFORE UPDATE ON vendor_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function to generate unique deal numbers
CREATE OR REPLACE FUNCTION generate_deal_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_suffix TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT 'DEAL-' || year_suffix || '-' || LPAD((COUNT(*) + 1)::TEXT, 4, '0')
    INTO new_number
    FROM deals 
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update blog category post count
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_categories 
        SET post_count = post_count + 1 
        WHERE id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE blog_categories 
        SET post_count = post_count - 1 
        WHERE id = OLD.category_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.category_id != NEW.category_id THEN
            UPDATE blog_categories 
            SET post_count = post_count - 1 
            WHERE id = OLD.category_id;
            UPDATE blog_categories 
            SET post_count = post_count + 1 
            WHERE id = NEW.category_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply category post count trigger
CREATE TRIGGER update_blog_category_post_count
    AFTER INSERT OR UPDATE OR DELETE ON content_pages
    FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

-- Function to auto-generate deal numbers
CREATE OR REPLACE FUNCTION set_deal_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.deal_number IS NULL OR NEW.deal_number = '' THEN
        NEW.deal_number := generate_deal_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply deal number trigger
CREATE TRIGGER set_deal_number_trigger
    BEFORE INSERT ON deals
    FOR EACH ROW EXECUTE FUNCTION set_deal_number();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE content_pages IS 'Dynamic content management for blog posts and CMS pages';
COMMENT ON TABLE blog_categories IS 'Hierarchical categorization system for blog content';
COMMENT ON TABLE documents IS 'File management system for business documents and resources';
COMMENT ON TABLE deals IS 'Comprehensive deal tracking and management system';
COMMENT ON TABLE vendors IS 'Service provider directory and management';
COMMENT ON TABLE vendor_reviews IS 'Review and rating system for vendors';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Enhanced database schema applied successfully!';
    RAISE NOTICE 'New tables created: content_pages, blog_categories, documents, deals, vendors, vendor_reviews';
    RAISE NOTICE 'Next step: Apply RLS policies with enhanced-rls-policies.sql';
END $$;