# Safe Enhanced Schema Deployment

## Issue Resolution

The error `constraint "fk_content_pages_category" for relation "content_pages" already exists` indicates that part of the enhanced schema was previously deployed.

## Solution: Use Safe Deployment Script

**Instead of the original `enhanced-schema.sql`, use the safe version that handles existing constraints gracefully.**

### Step 1: Clear the SQL Editor and Use Safe Script

1. **Clear the current SQL in the Supabase SQL Editor**
2. **Copy and paste the following safe deployment script:**

```sql
-- Enhanced Database Schema for BuyMartV1 - Safe Deployment Version
-- This version handles existing constraints and tables gracefully

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    reading_time INTEGER DEFAULT 0,
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
    color TEXT DEFAULT '#3B82F6',
    icon TEXT,
    parent_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint safely (only if it doesn't exist)
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
    file_hash TEXT,
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
    commission_rate DECIMAL(5,4) DEFAULT 0.0500,
    commission_amount DECIMAL(15,2),
    notes TEXT,
    documents UUID[],
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
    service_areas TEXT[],
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

-- Create indexes safely
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_status ON content_pages(status);
CREATE INDEX IF NOT EXISTS idx_content_pages_author ON content_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_content_pages_category ON content_pages(category_id);
CREATE INDEX IF NOT EXISTS idx_content_pages_published ON content_pages(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_pages_tags ON content_pages USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON blog_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON blog_categories(is_active);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_content_pages_updated_at ON content_pages;
CREATE TRIGGER update_content_pages_updated_at BEFORE UPDATE ON content_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON blog_categories;
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

SELECT 'Enhanced database schema deployed successfully (safe version)!' as status;
```

3. **Click "Run" to execute the safe schema**

### Step 2: Deploy RLS Policies

After the safe schema deployment succeeds, deploy the RLS policies:

```sql
-- Enhanced RLS Policies for BuyMartV1
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Content pages policies
CREATE POLICY "Anyone can view published content" ON content_pages
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view their own content" ON content_pages
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = author_id)
    );

CREATE POLICY "Authors can create content" ON content_pages
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'blog_editor', 'blog_contributor'))
    );

CREATE POLICY "Authors can update their own content" ON content_pages
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = author_id)
        OR auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin')
    );

-- Blog categories policies
CREATE POLICY "Anyone can view active categories" ON blog_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins and editors can manage categories" ON blog_categories
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('admin', 'blog_editor'))
    );

SELECT 'Enhanced RLS policies deployed successfully!' as status;
```

### Step 3: Verify Deployment

After both scripts complete successfully:

1. **Test Schema**: http://localhost:8000/test-schema-check.html
2. **Final Validation**: http://localhost:8000/test-final-validation.html

You should see all 6 enhanced tables (content_pages, blog_categories, documents, deals, vendors, vendor_reviews) showing as "exists and is accessible".

## What This Safe Script Does

- **Handles Existing Constraints**: Uses `DO $$ BEGIN ... END $$` blocks to check if constraints exist before creating them
- **Safe Table Creation**: Uses `CREATE TABLE IF NOT EXISTS` for all tables
- **Safe Index Creation**: Uses `CREATE INDEX IF NOT EXISTS` for all indexes
- **Safe Trigger Creation**: Uses `DROP TRIGGER IF EXISTS` followed by `CREATE TRIGGER`
- **Safe Data Insertion**: Uses `WHERE NOT EXISTS` to avoid duplicate category entries

This approach will complete the schema deployment without errors, even if some parts were previously deployed.
