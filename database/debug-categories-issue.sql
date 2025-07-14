-- DEBUG CATEGORIES ISSUE
-- This script helps identify why categories weren't created

-- ============================================================================
-- CHECK 1: DOES BLOG_CATEGORIES TABLE EXIST?
-- ============================================================================

-- Check if blog_categories table exists
SELECT 
    'TABLE_EXISTS' as check_type,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'blog_categories'
    ) as table_exists;

-- ============================================================================
-- CHECK 2: WHAT'S THE CURRENT SCHEMA OF BLOG_CATEGORIES?
-- ============================================================================

-- Check blog_categories table structure
SELECT 
    'COLUMN_INFO' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'blog_categories'
ORDER BY ordinal_position;

-- ============================================================================
-- CHECK 3: ARE THERE ANY EXISTING CATEGORIES?
-- ============================================================================

-- Check existing categories
SELECT 
    'EXISTING_CATEGORIES' as check_type,
    COUNT(*) as category_count
FROM blog_categories;

-- List existing categories if any
SELECT 
    'CATEGORY_LIST' as check_type,
    id,
    name,
    slug
FROM blog_categories
ORDER BY name;

-- ============================================================================
-- CHECK 4: TEST CATEGORY INSERTION MANUALLY
-- ============================================================================

-- Try to insert one category manually to see what happens
BEGIN;

-- Test insert
INSERT INTO blog_categories (id, name, slug, description, color, is_active, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Business Acquisition', 'business-acquisition', 'Guides and insights for acquiring auto repair businesses', '#3b82f6', true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    updated_at = NOW();

-- Check if it was inserted
SELECT 
    'TEST_INSERT_RESULT' as check_type,
    id,
    name,
    slug
FROM blog_categories
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- Rollback the test
ROLLBACK;

-- ============================================================================
-- CHECK 5: VERIFY FOREIGN KEY CONSTRAINT
-- ============================================================================

-- Check foreign key constraints on content_pages
SELECT 
    'FK_CONSTRAINTS' as check_type,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'content_pages'
    AND kcu.column_name = 'category_id';

-- ============================================================================
-- SOLUTION: CREATE CATEGORIES SEPARATELY
-- ============================================================================

-- Create all categories first (run this if the above checks show issues)
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

-- Verify categories were created
SELECT 
    'CATEGORIES_CREATED' as result,
    COUNT(*) as count,
    string_agg(name, ', ' ORDER BY name) as category_names
FROM blog_categories;

-- ============================================================================
-- FINAL CHECK
-- ============================================================================

SELECT '🔍 CATEGORIES DEBUG COMPLETED' as status;
SELECT 'Check the results above to understand why categories failed to create' as instruction;
SELECT 'If categories were created successfully, you can now run the blog posts insertion' as next_step;
