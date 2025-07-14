-- STEP 1 ONLY: CREATE BLOG CATEGORIES
-- Run this first to isolate category creation issues
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- CHECK IF BLOG_CATEGORIES TABLE EXISTS
-- ============================================================================

-- Check if blog_categories table exists
SELECT 
    'TABLE_CHECK' as check_type,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_categories'
    ) as table_exists;

-- If table doesn't exist, show table structure from information_schema
SELECT 
    'TABLE_COLUMNS' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'blog_categories'
ORDER BY ordinal_position;

-- ============================================================================
-- CREATE BLOG_CATEGORIES TABLE IF IT DOESN'T EXIST
-- ============================================================================

-- Create blog_categories table with proper structure
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Verify table was created
SELECT 
    'TABLE_CREATED' as result,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_categories'
    ) as table_exists;

-- ============================================================================
-- INSERT BLOG CATEGORIES
-- ============================================================================

-- Clear any existing categories first (for clean test)
-- DELETE FROM blog_categories; -- Uncomment if you want to start fresh

-- Insert blog categories
INSERT INTO blog_categories (id, name, slug, description, color, is_active, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Business Acquisition', 'business-acquisition', 'Guides and insights for acquiring auto repair businesses', '#3b82f6', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Market Analysis', 'market-analysis', 'Market trends and analysis for the auto repair industry', '#10b981', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Due Diligence', 'due-diligence', 'Due diligence processes and checklists for business buyers', '#f59e0b', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'Financing', 'financing', 'Financing options and strategies for business acquisition', '#8b5cf6', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', 'Legal & Compliance', 'legal-compliance', 'Legal considerations and compliance requirements', '#ef4444', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440006', 'Success Stories', 'success-stories', 'Real success stories from our clients', '#06b6d4', true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    updated_at = NOW();

-- ============================================================================
-- VERIFY CATEGORIES WERE CREATED
-- ============================================================================

-- Check total count
SELECT 
    '✅ STEP 1 VERIFICATION' as status,
    COUNT(*) as categories_created
FROM blog_categories;

-- List all categories
SELECT 
    'CATEGORY_LIST' as result,
    id,
    name,
    slug,
    color,
    is_active
FROM blog_categories
ORDER BY name;

-- Check specific category IDs that will be used in blog posts
SELECT 
    'CATEGORY_ID_CHECK' as result,
    id,
    name,
    'EXISTS' as status
FROM blog_categories
WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440006'
)
ORDER BY name;

-- Final success message
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM blog_categories) = 6 
        THEN '✅ STEP 1 COMPLETE: 6 categories created successfully'
        ELSE '❌ STEP 1 FAILED: Expected 6 categories, found ' || (SELECT COUNT(*) FROM blog_categories)::text
    END as final_status;

-- Show category names for verification
SELECT 
    'CATEGORY_NAMES' as result,
    string_agg(name, ', ' ORDER BY name) as all_categories
FROM blog_categories;
