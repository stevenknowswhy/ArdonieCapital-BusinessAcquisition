# Enhanced Database Schema Deployment Guide

## CRITICAL: Deploy Enhanced Schema Now

The Content Management Backend requires the enhanced database schema to be deployed to Supabase. Follow these exact steps:

### Step 1: Deploy Enhanced Schema

1. **Open Supabase SQL Editor**: https://app.supabase.com/project/pbydepsqcypwqbicnsco/sql/new

2. **Copy and paste the following SQL** (from `database/enhanced-schema.sql`):

```sql
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

-- Add foreign key constraint for content_pages category_id
ALTER TABLE content_pages 
ADD CONSTRAINT fk_content_pages_category 
FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL;

-- ============================================================================
-- DOCUMENT MANAGEMENT SYSTEM
-- ============================================================================

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

-- ============================================================================
-- ENHANCED MARKETPLACE TABLES
-- ============================================================================

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
-- INDEXES FOR PERFORMANCE
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
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_content_pages_updated_at BEFORE UPDATE ON content_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_reviews_updated_at BEFORE UPDATE ON vendor_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA SEEDING
-- ============================================================================

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, color, icon, sort_order) VALUES
('Business Acquisition', 'business-acquisition', 'Guides and insights on acquiring businesses', '#3B82F6', '🏢', 1),
('Market Analysis', 'market-analysis', 'Market trends and analysis reports', '#10B981', '📊', 2),
('Due Diligence', 'due-diligence', 'Due diligence processes and checklists', '#F59E0B', '🔍', 3),
('Financing', 'financing', 'Business financing options and strategies', '#8B5CF6', '💰', 4),
('Legal & Compliance', 'legal-compliance', 'Legal aspects of business transactions', '#EF4444', '⚖️', 5),
('Success Stories', 'success-stories', 'Client success stories and case studies', '#06B6D4', '🎉', 6)
ON CONFLICT (slug) DO NOTHING;

-- Enhanced schema deployment completed
SELECT 'Enhanced database schema deployed successfully!' as status;
```

3. **Click "Run" to execute the schema**

### Step 2: Deploy RLS Policies

1. **In the same SQL Editor, copy and paste the following** (from `database/enhanced-rls-policies.sql`):

```sql
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
        auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'blog_editor', 'blog_contributor'))
    );

-- Authors can update their own content, admins can update any
CREATE POLICY "Authors can update their own content" ON content_pages
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = author_id)
        OR auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin')
    );

-- Only admins can delete content
CREATE POLICY "Only admins can delete content" ON content_pages
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin')
    );

-- ============================================================================
-- BLOG CATEGORIES POLICIES
-- ============================================================================

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON blog_categories
    FOR SELECT USING (is_active = true);

-- Only admins and blog editors can manage categories
CREATE POLICY "Admins and editors can manage categories" ON blog_categories
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'blog_editor'))
    );

-- ============================================================================
-- DOCUMENTS POLICIES
-- ============================================================================

-- Users can view public documents
CREATE POLICY "Anyone can view public documents" ON documents
    FOR SELECT USING (access_level = 'public' AND is_active = true);

-- Users can view their own documents
CREATE POLICY "Users can view their own documents" ON documents
    FOR SELECT USING (
        uploaded_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can upload documents
CREATE POLICY "Users can upload documents" ON documents
    FOR INSERT WITH CHECK (
        uploaded_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can update their own documents
CREATE POLICY "Users can update their own documents" ON documents
    FOR UPDATE USING (
        uploaded_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can delete their own documents, admins can delete any
CREATE POLICY "Users can delete their own documents" ON documents
    FOR DELETE USING (
        uploaded_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin')
    );

-- ============================================================================
-- DEALS POLICIES
-- ============================================================================

-- Users can view deals they're involved in
CREATE POLICY "Users can view their deals" ON deals
    FOR SELECT USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'broker'))
    );

-- Users can create deals for listings they have access to
CREATE POLICY "Users can create deals" ON deals
    FOR INSERT WITH CHECK (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'broker'))
    );

-- Users can update deals they're involved in
CREATE POLICY "Users can update their deals" ON deals
    FOR UPDATE USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'broker'))
    );

-- ============================================================================
-- VENDORS POLICIES
-- ============================================================================

-- Anyone can view active vendors
CREATE POLICY "Anyone can view active vendors" ON vendors
    FOR SELECT USING (is_active = true);

-- Users can manage their own vendor profile
CREATE POLICY "Users can manage their vendor profile" ON vendors
    FOR ALL USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin')
    );

-- ============================================================================
-- VENDOR REVIEWS POLICIES
-- ============================================================================

-- Anyone can view reviews for active vendors
CREATE POLICY "Anyone can view vendor reviews" ON vendor_reviews
    FOR SELECT USING (
        vendor_id IN (SELECT id FROM vendors WHERE is_active = true)
    );

-- Users can create reviews for vendors they've worked with
CREATE POLICY "Users can create vendor reviews" ON vendor_reviews
    FOR INSERT WITH CHECK (
        reviewer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON vendor_reviews
    FOR UPDATE USING (
        reviewer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can delete their own reviews, admins can delete any
CREATE POLICY "Users can delete their own reviews" ON vendor_reviews
    FOR DELETE USING (
        reviewer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin')
    );

-- RLS policies deployment completed
SELECT 'Enhanced RLS policies deployed successfully!' as status;
```

2. **Click "Run" to execute the RLS policies**

### Step 3: Verify Deployment

After running both SQL scripts, return to the test page and verify:
- http://localhost:8000/test-schema-check.html

You should see all 6 enhanced tables (content_pages, blog_categories, documents, deals, vendors, vendor_reviews) showing as "exists and is accessible".

### Next Steps

Once the enhanced schema is deployed:
1. Run comprehensive CMS tests: http://localhost:8000/verify-cms-deployment.html
2. Test content management dashboard: http://localhost:8000/dashboard/content-management.html
3. Verify dynamic blog functionality: http://localhost:8000/blog/dynamic-blog.html

**CRITICAL**: The enhanced schema deployment is required for the Content Management Backend to function properly. Please complete this step before proceeding to the next Database Migration Plan task.
