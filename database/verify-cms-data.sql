-- CMS Data Verification Script
-- Run this in Supabase SQL Editor to check the current state of your CMS data

-- ============================================================================
-- STEP 1: Check Blog Categories
-- ============================================================================

SELECT 
    'CATEGORIES' as check_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM blog_categories;

-- List all categories
SELECT 
    name,
    slug,
    color,
    is_active,
    created_at
FROM blog_categories 
ORDER BY name;

-- ============================================================================
-- STEP 2: Check Blog Posts
-- ============================================================================

SELECT 
    'POSTS' as check_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count
FROM content_pages;

-- List all posts with categories
SELECT 
    cp.title,
    cp.slug,
    cp.status,
    bc.name as category_name,
    cp.published_at,
    cp.created_at
FROM content_pages cp
LEFT JOIN blog_categories bc ON cp.category_id = bc.id
ORDER BY cp.created_at DESC;

-- ============================================================================
-- STEP 3: Check User Permissions
-- ============================================================================

-- Check if the content author exists and has proper permissions
SELECT 
    'USER_PERMISSIONS' as check_type,
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at,
    p.updated_at
FROM profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'reforiy538@iamtile.com';

-- ============================================================================
-- STEP 4: Check Content-Category Relationships
-- ============================================================================

-- Posts per category
SELECT 
    bc.name as category_name,
    bc.slug as category_slug,
    COUNT(cp.id) as post_count
FROM blog_categories bc
LEFT JOIN content_pages cp ON bc.id = cp.category_id
GROUP BY bc.id, bc.name, bc.slug
ORDER BY post_count DESC, bc.name;

-- ============================================================================
-- STEP 5: Check for Data Integrity Issues
-- ============================================================================

-- Posts without categories
SELECT 
    'ORPHANED_POSTS' as issue_type,
    COUNT(*) as count
FROM content_pages 
WHERE category_id IS NULL;

-- Posts without authors
SELECT 
    'POSTS_WITHOUT_AUTHORS' as issue_type,
    COUNT(*) as count
FROM content_pages 
WHERE author_id IS NULL;

-- Categories without posts
SELECT 
    'EMPTY_CATEGORIES' as issue_type,
    bc.name as category_name,
    bc.slug as category_slug
FROM blog_categories bc
LEFT JOIN content_pages cp ON bc.id = cp.category_id
WHERE cp.id IS NULL AND bc.is_active = true;

-- ============================================================================
-- STEP 6: Sample Content Check
-- ============================================================================

-- Show first post content (truncated)
SELECT 
    title,
    LEFT(content, 200) || '...' as content_preview,
    excerpt,
    reading_time,
    tags
FROM content_pages 
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 1;

-- ============================================================================
-- EXPECTED RESULTS AFTER SUCCESSFUL POPULATION:
-- ============================================================================

/*
CATEGORIES: total_count = 6, active_count = 6
POSTS: total_count = 6, published_count = 6, draft_count = 0
USER_PERMISSIONS: email = reforiy538@iamtile.com, role = blog_editor
ORPHANED_POSTS: count = 0
POSTS_WITHOUT_AUTHORS: count = 0
EMPTY_CATEGORIES: Should show 0 empty categories (all should have posts)

Categories should include:
- Business Acquisition
- Market Analysis  
- Due Diligence
- Financing
- Legal & Compliance
- Success Stories

Posts should include:
- 5 Key Factors That Determine Auto Shop Value
- DFW Auto Repair Market Trends 2024
- Complete Due Diligence Checklist for Auto Shop Buyers
- Financing Options for Auto Shop Acquisitions
- Express Deal Success: From Search to Close in 34 Days
- Preparing Your Auto Shop for Sale: A Seller's Guide
*/
