-- INSERT REMAINING BLOG POSTS - CONFLICT SAFE VERSION
-- This version handles duplicate slugs gracefully using ON CONFLICT DO NOTHING
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- INSERT REMAINING 3 BLOG POSTS (CONFLICT SAFE)
-- ============================================================================

DO $$
DECLARE
    author_uuid UUID;
    financing_id UUID;
    success_stories_id UUID;
    legal_compliance_id UUID;
    category_count INTEGER;
    posts_before INTEGER;
    posts_after INTEGER;
BEGIN
    -- Get the profile ID for the content author
    SELECT p.id INTO author_uuid
    FROM profiles p
    JOIN auth.users au ON p.user_id = au.id
    WHERE au.email = 'reforiy538@iamtile.com';

    -- Check if author exists
    IF author_uuid IS NULL THEN
        RAISE EXCEPTION 'Author not found for email: reforiy538@iamtile.com';
    END IF;

    -- Check if categories exist (count check)
    SELECT COUNT(*) INTO category_count FROM blog_categories;
    IF category_count < 6 THEN
        RAISE EXCEPTION 'Only % categories found, expected 6. Please run step1-create-categories-only.sql first.', category_count;
    END IF;

    -- Get category IDs by name
    SELECT id INTO financing_id FROM blog_categories WHERE name = 'Financing';
    SELECT id INTO success_stories_id FROM blog_categories WHERE name = 'Success Stories';
    SELECT id INTO legal_compliance_id FROM blog_categories WHERE name = 'Legal & Compliance';

    -- Verify we found all required categories
    IF financing_id IS NULL OR success_stories_id IS NULL OR legal_compliance_id IS NULL THEN
        RAISE EXCEPTION 'Some categories not found. Available: %', 
            (SELECT string_agg(name, ', ') FROM blog_categories);
    END IF;

    -- Count posts before insertion
    SELECT COUNT(*) INTO posts_before FROM content_pages;

    -- Log the category IDs we're using
    RAISE NOTICE 'Using category IDs: Financing=%, Success Stories=%, Legal & Compliance=%', 
        financing_id, success_stories_id, legal_compliance_id;
    RAISE NOTICE 'Posts before insertion: %', posts_before;

    -- Insert remaining blog posts with conflict handling
    INSERT INTO content_pages (
        id, slug, title, content, excerpt, meta_description, meta_keywords,
        author_id, status, featured_image, tags, category_id, reading_time,
        published_at, created_at, updated_at
    ) VALUES 
    
    -- Post 4: Financing Options
    (
        uuid_generate_v4(),
        'financing-options-auto-shops',
        'Financing Options for Auto Shop Acquisitions',
        '<h2>Financing Overview</h2><p>Securing the right financing is crucial for a successful auto shop acquisition. Understanding your options and preparing properly can make the difference between closing your deal and losing your dream business.</p><h3>SBA Loans</h3><p>Small Business Administration loans are often the best option with SBA 7(a) loans up to $5 million, lower down payments of 10-15%, longer terms up to 25 years, and competitive rates.</p><h3>Conventional Bank Loans</h3><p>Traditional bank financing with faster processing, relationship banking benefits, higher down payments of 25-30%, and shorter terms of 5-10 years.</p><h3>Seller Financing</h3><p>Many auto shop sales include seller financing with partial financing, earnout provisions, consulting agreements, and asset-based terms.</p>',
        'Securing the right financing is crucial for a successful auto shop acquisition. Learn about SBA loans, conventional financing, and seller financing options.',
        'Securing the right financing is crucial for a successful auto shop acquisition. Learn about SBA loans, conventional financing, and seller financing options.',
        ARRAY['financing', 'SBA loans', 'auto shop acquisition', 'business loans'],
        author_uuid,
        'published',
        'https://images.unsplash.com/photo-1554224154-26032fced8bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80',
        ARRAY['financing', 'SBA loans', 'business acquisition', 'auto shop'],
        financing_id,
        9,
        '2024-01-20 10:00:00+00',
        NOW(),
        NOW()
    ),
    
    -- Post 5: Express Deal Success Story
    (
        uuid_generate_v4(),
        'express-deal-success-stories',
        'Express Deal Success: From Search to Close in 34 Days',
        '<h2>Success Story Overview</h2><p>Meet John Martinez, who successfully acquired a thriving auto repair shop in Plano, Texas through our Express Deal program. His story demonstrates how the right approach and expert guidance can accelerate your business acquisition timeline.</p><h3>The Challenge</h3><p>John had been searching for the right auto shop for over 18 months with limited time, market competition, financing complexity, and due diligence challenges.</p><h3>The Express Deal Solution</h3><p>Our program provided pre-qualified listings, financing pre-approval, dedicated support, and accelerated timeline.</p><h3>The Results</h3><p>Acquisition completed in just 34 days with systematic progress through identification, due diligence, documentation, and closing phases.</p><h3>Post-Acquisition Success</h3><p>Six months later: 15% revenue growth, 95% customer retention, team stability, and expansion plans.</p>',
        'Meet John Martinez, who successfully acquired a thriving auto repair shop in Plano, Texas through our Express Deal program in just 34 days.',
        'Meet John Martinez, who successfully acquired a thriving auto repair shop in Plano, Texas through our Express Deal program in just 34 days.',
        ARRAY['success story', 'express deal', 'auto shop acquisition', 'case study'],
        author_uuid,
        'published',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80',
        ARRAY['success story', 'express deal', 'case study', 'auto shop'],
        success_stories_id,
        7,
        '2024-01-25 10:00:00+00',
        NOW(),
        NOW()
    ),
    
    -- Post 6: Preparing Auto Shop for Sale
    (
        uuid_generate_v4(),
        'preparing-auto-shop-for-sale',
        'Preparing Your Auto Shop for Sale: A Seller''s Guide',
        '<h2>Preparation Overview</h2><p>Selling your auto repair shop requires careful preparation to maximize value and ensure a smooth transaction. This comprehensive guide will help you prepare your business for sale and attract qualified buyers.</p><h3>Financial Preparation</h3><p>Clean, organized financials are essential including financial statements, tax compliance, expense normalization, revenue documentation, and cash flow analysis.</p><h3>Operational Improvements</h3><p>Optimize operations to increase value through equipment maintenance, facility upgrades, process documentation, staff training, and customer database organization.</p><h3>Legal and Compliance</h3><p>Address all requirements including license renewals, environmental compliance, contract review, lease documentation, and insurance policies.</p>',
        'Selling your auto repair shop requires careful preparation to maximize value and ensure a smooth transaction. Learn how to prepare your business for sale.',
        'Selling your auto repair shop requires careful preparation to maximize value and ensure a smooth transaction. Learn how to prepare your business for sale.',
        ARRAY['selling auto shop', 'business sale preparation', 'seller guide', 'exit strategy'],
        author_uuid,
        'published',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80',
        ARRAY['selling', 'auto shop', 'business sale', 'preparation'],
        legal_compliance_id,
        11,
        '2024-01-30 10:00:00+00',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING; -- Handle duplicates gracefully

    -- Count posts after insertion
    SELECT COUNT(*) INTO posts_after FROM content_pages;

    -- Success message
    RAISE NOTICE '✅ Script completed. Posts before: %, Posts after: %, New posts added: %', 
        posts_before, posts_after, (posts_after - posts_before);

END $$;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Show final state
SELECT 
    '✅ FINAL STATE' as status,
    COUNT(*) as total_posts,
    'Ready for CMS verification test' as next_step
FROM content_pages;

-- List all posts
SELECT 
    'ALL_POSTS' as result,
    cp.title,
    bc.name as category_name,
    cp.status
FROM content_pages cp
LEFT JOIN blog_categories bc ON cp.category_id = bc.id
ORDER BY cp.published_at DESC;
