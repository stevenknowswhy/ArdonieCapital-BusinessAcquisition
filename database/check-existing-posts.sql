-- CHECK EXISTING POSTS IN DATABASE
-- This script shows what blog posts already exist to avoid duplicates
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- CHECK CURRENT POSTS IN DATABASE
-- ============================================================================

-- Show all existing posts
SELECT 
    '📋 EXISTING POSTS' as section,
    cp.id,
    cp.slug,
    cp.title,
    bc.name as category_name,
    cp.status,
    cp.created_at
FROM content_pages cp
LEFT JOIN blog_categories bc ON cp.category_id = bc.id
ORDER BY cp.created_at DESC;

-- Count posts by category
SELECT 
    '📊 POSTS PER CATEGORY' as section,
    bc.name as category_name,
    COUNT(cp.id) as post_count
FROM blog_categories bc
LEFT JOIN content_pages cp ON bc.id = cp.category_id
GROUP BY bc.id, bc.name
ORDER BY bc.name;

-- Check for specific slugs that might cause conflicts
SELECT 
    '🔍 SLUG CONFLICTS' as section,
    slug,
    title,
    'EXISTS' as status
FROM content_pages
WHERE slug IN (
    'auto-shop-valuation-factors',
    'dfw-market-trends-2024',
    'due-diligence-checklist',
    'financing-options-auto-shops',
    'express-deal-success-stories',
    'preparing-auto-shop-for-sale'
)
ORDER BY slug;

-- Summary
SELECT 
    '📈 SUMMARY' as section,
    COUNT(*) as total_posts,
    COUNT(DISTINCT category_id) as categories_used,
    CASE 
        WHEN COUNT(*) = 0 THEN 'NO_POSTS - Safe to run all scripts'
        WHEN COUNT(*) < 3 THEN 'PARTIAL_POSTS - Some posts exist, check which ones'
        WHEN COUNT(*) >= 3 AND COUNT(*) < 6 THEN 'MOST_POSTS - Run remaining posts with conflict handling'
        WHEN COUNT(*) >= 6 THEN 'ALL_POSTS - Posts already exist, ready for testing'
        ELSE 'UNKNOWN_STATE'
    END as recommendation
FROM content_pages;

-- Show which posts are missing (if any)
SELECT 
    '❓ MISSING POSTS' as section,
    missing_slug,
    missing_title,
    'NEEDS_TO_BE_CREATED' as status
FROM (
    VALUES 
        ('auto-shop-valuation-factors', '5 Key Factors That Determine Auto Shop Value'),
        ('dfw-market-trends-2024', 'DFW Auto Repair Market Trends 2024'),
        ('due-diligence-checklist', 'Complete Due Diligence Checklist for Auto Shop Buyers'),
        ('financing-options-auto-shops', 'Financing Options for Auto Shop Acquisitions'),
        ('express-deal-success-stories', 'Express Deal Success: From Search to Close in 34 Days'),
        ('preparing-auto-shop-for-sale', 'Preparing Your Auto Shop for Sale: A Seller''s Guide')
) AS expected(missing_slug, missing_title)
WHERE NOT EXISTS (
    SELECT 1 FROM content_pages WHERE slug = expected.missing_slug
);

-- Final recommendation
SELECT 
    '💡 RECOMMENDATION' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM content_pages) >= 6 THEN 
            'All posts already exist! Skip to CMS verification test: http://localhost:8000/cms-verification-test.html'
        WHEN (SELECT COUNT(*) FROM content_pages) >= 3 THEN 
            'Some posts exist. Use ON CONFLICT DO NOTHING or UPDATE in remaining posts script.'
        ELSE 
            'Few or no posts exist. Safe to run the step-by-step scripts.'
    END as action;
