-- STEP 3 FIXED: INSERT FIRST 3 BLOG POSTS
-- Fixed version with robust category verification
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- PRE-FLIGHT CHECKS (ENHANCED)
-- ============================================================================

-- Check that categories exist
SELECT 
    'CATEGORIES_CHECK' as check_type,
    COUNT(*) as category_count,
    CASE 
        WHEN COUNT(*) >= 6 THEN '✅ CATEGORIES_READY'
        ELSE '❌ CATEGORIES_MISSING'
    END as status
FROM blog_categories;

-- Check that author exists
SELECT 
    'AUTHOR_CHECK' as check_type,
    p.id as author_id,
    au.email,
    p.role,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ AUTHOR_READY'
        ELSE '❌ AUTHOR_MISSING'
    END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE au.email = 'reforiy538@iamtile.com';

-- Enhanced category verification - check by name AND show actual IDs
SELECT 
    'ENHANCED_CATEGORY_CHECK' as check_type,
    bc.id,
    bc.name,
    bc.slug,
    '✅ EXISTS' as status
FROM blog_categories bc
WHERE bc.name IN ('Business Acquisition', 'Market Analysis', 'Due Diligence')
ORDER BY bc.name;

-- ============================================================================
-- INSERT FIRST 3 BLOG POSTS (WITH ROBUST VERIFICATION)
-- ============================================================================

DO $$
DECLARE
    author_uuid UUID;
    category_count INTEGER;
    business_acquisition_id UUID;
    market_analysis_id UUID;
    due_diligence_id UUID;
BEGIN
    -- Get the profile ID for the content author
    SELECT p.id INTO author_uuid
    FROM profiles p
    JOIN auth.users au ON p.user_id = au.id
    WHERE au.email = 'reforiy538@iamtile.com';

    -- Check if author exists
    IF author_uuid IS NULL THEN
        RAISE EXCEPTION 'Author not found for email: reforiy538@iamtile.com. Please run STEP 2 first.';
    END IF;

    -- Check if categories exist (count check)
    SELECT COUNT(*) INTO category_count FROM blog_categories;
    IF category_count < 6 THEN
        RAISE EXCEPTION 'Only % categories found, expected 6. Please run STEP 1 first.', category_count;
    END IF;

    -- Get category IDs by name (more robust than hardcoded UUIDs)
    SELECT id INTO business_acquisition_id 
    FROM blog_categories 
    WHERE name = 'Business Acquisition';
    
    SELECT id INTO market_analysis_id 
    FROM blog_categories 
    WHERE name = 'Market Analysis';
    
    SELECT id INTO due_diligence_id 
    FROM blog_categories 
    WHERE name = 'Due Diligence';

    -- Verify we found all required categories
    IF business_acquisition_id IS NULL THEN
        RAISE EXCEPTION 'Business Acquisition category not found by name. Available categories: %', 
            (SELECT string_agg(name, ', ') FROM blog_categories);
    END IF;
    
    IF market_analysis_id IS NULL THEN
        RAISE EXCEPTION 'Market Analysis category not found by name. Available categories: %', 
            (SELECT string_agg(name, ', ') FROM blog_categories);
    END IF;
    
    IF due_diligence_id IS NULL THEN
        RAISE EXCEPTION 'Due Diligence category not found by name. Available categories: %', 
            (SELECT string_agg(name, ', ') FROM blog_categories);
    END IF;

    -- Log the category IDs we're using
    RAISE NOTICE 'Using category IDs: Business Acquisition=%, Market Analysis=%, Due Diligence=%', 
        business_acquisition_id, market_analysis_id, due_diligence_id;

    -- Insert first 3 blog posts using the found category IDs
    INSERT INTO content_pages (
        id, slug, title, content, excerpt, meta_description, meta_keywords,
        author_id, status, featured_image, tags, category_id, reading_time,
        published_at, created_at, updated_at
    ) VALUES 
    
    -- Post 1: Auto Shop Valuation Factors
    (
        uuid_generate_v4(),
        'auto-shop-valuation-factors',
        '5 Key Factors That Determine Auto Shop Value',
        '<h2>Understanding Auto Shop Valuation</h2><p>When it comes to buying or selling an auto repair shop, understanding valuation is crucial. Whether you''re a potential buyer looking to make an informed offer or a seller wanting to maximize your return, these five key factors will significantly impact the final price.</p><h3>1. Financial Performance and Cash Flow</h3><p>The most critical factor in any business valuation is financial performance. For auto repair shops, buyers focus heavily on annual revenue, net cash flow, profit margins, and seasonal variations.</p><h3>2. Location and Market Demographics</h3><p>Location can make or break an auto repair shop''s value. Key considerations include visibility, accessibility, demographics, competition density, and lease terms.</p><h3>3. Equipment and Facility Condition</h3><p>The physical assets of the shop directly impact both operational efficiency and valuation, including modern equipment, facility size and layout, building condition, and environmental compliance.</p><h3>4. Customer Base and Reputation</h3><p>A loyal customer base is one of the most valuable assets, including customer retention rate, online reviews, fleet accounts, and referral networks.</p><h3>5. Staff and Management Systems</h3><p>The human element and operational systems significantly impact value through skilled technicians, management systems, owner dependency, and training programs.</p>',
        'Understanding what drives auto repair shop valuations can help both buyers and sellers make informed decisions. Learn the critical factors that impact pricing.',
        'Understanding what drives auto repair shop valuations can help both buyers and sellers make informed decisions. Learn the critical factors that impact pricing.',
        ARRAY['auto repair', 'business valuation', 'shop value', 'acquisition'],
        author_uuid,
        'published',
        'https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80',
        ARRAY['valuation', 'auto repair', 'business acquisition'],
        business_acquisition_id, -- Using dynamic category ID
        8,
        '2024-01-15 10:00:00+00',
        NOW(),
        NOW()
    ),
    
    -- Post 2: DFW Market Trends
    (
        uuid_generate_v4(),
        'dfw-market-trends-2024',
        'DFW Auto Repair Market Trends 2024',
        '<h2>Market Overview</h2><p>The Dallas-Fort Worth metroplex continues to be one of the most dynamic auto repair markets in the United States. With a growing population, aging vehicle fleet, and robust economy, 2024 presents unique opportunities for both buyers and sellers in the auto repair industry.</p><h3>Market Size and Growth</h3><p>The DFW auto repair market has shown remarkable resilience and growth with a market value of approximately $2.8 billion annually, 4.2% year-over-year growth, over 3,200 independent auto repair facilities, and employment of over 28,000 technicians.</p><h3>Key Market Drivers</h3><p>Several factors are driving growth including population growth of 150,000 new residents annually, aging vehicle fleet with average age of 12.2 years, economic stability, and corporate relocations bringing high-income professionals.</p><h3>Investment Opportunities</h3><p>The current market presents acquisition targets, consolidation plays, technology upgrades, and specialty services opportunities.</p>',
        'The Dallas-Fort Worth metroplex continues to be one of the most dynamic auto repair markets in the United States. Discover the trends shaping 2024.',
        'The Dallas-Fort Worth metroplex continues to be one of the most dynamic auto repair markets in the United States. Discover the trends shaping 2024.',
        ARRAY['DFW market', 'auto repair trends', 'market analysis', 'Dallas Fort Worth'],
        author_uuid,
        'published',
        'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80',
        ARRAY['market trends', 'DFW', 'auto repair', 'investment'],
        market_analysis_id, -- Using dynamic category ID
        10,
        '2024-01-10 10:00:00+00',
        NOW(),
        NOW()
    ),
    
    -- Post 3: Due Diligence Checklist
    (
        uuid_generate_v4(),
        'due-diligence-checklist',
        'Complete Due Diligence Checklist for Auto Shop Buyers',
        '<h2>Due Diligence Overview</h2><p>Buying an auto repair shop is a significant investment that requires thorough due diligence. This comprehensive checklist will help you evaluate every aspect of the business before making your final decision.</p><h3>Financial Due Diligence</h3><p>Review 3-5 years of financial statements, tax returns, revenue analysis, expense review, and working capital assessment.</p><h3>Operational Due Diligence</h3><p>Professional equipment inspection, facility condition assessment, lease review, permits and licenses verification, and insurance coverage review.</p><h3>Legal Due Diligence</h3><p>Corporate structure review, contracts examination, litigation history check, environmental compliance verification, and intellectual property review.</p>',
        'A comprehensive due diligence checklist to help auto shop buyers evaluate every aspect of the business before making their final decision.',
        'A comprehensive due diligence checklist to help auto shop buyers evaluate every aspect of the business before making their final decision.',
        ARRAY['due diligence', 'auto shop buying', 'business acquisition', 'checklist'],
        author_uuid,
        'published',
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80',
        ARRAY['due diligence', 'checklist', 'auto shop', 'buying guide'],
        due_diligence_id, -- Using dynamic category ID
        12,
        '2024-01-05 10:00:00+00',
        NOW(),
        NOW()
    );

    -- Success message
    RAISE NOTICE '✅ First 3 blog posts inserted successfully with category IDs: %, %, %', 
        business_acquisition_id, market_analysis_id, due_diligence_id;

END $$;

-- ============================================================================
-- VERIFY POSTS WERE CREATED
-- ============================================================================

-- Check posts count
SELECT 
    '✅ STEP 3 VERIFICATION' as status,
    COUNT(*) as posts_created
FROM content_pages;

-- List created posts with their actual category relationships
SELECT 
    'CREATED_POSTS' as result,
    cp.title,
    bc.name as category_name,
    bc.id as category_id,
    cp.status,
    cp.published_at
FROM content_pages cp
LEFT JOIN blog_categories bc ON cp.category_id = bc.id
ORDER BY cp.published_at DESC;

-- Final success message
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM content_pages) >= 3 
        THEN '✅ STEP 3 COMPLETE: First 3 blog posts created successfully'
        ELSE '❌ STEP 3 FAILED: Expected at least 3 posts, found ' || (SELECT COUNT(*) FROM content_pages)::text
    END as final_status;
