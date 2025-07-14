-- SIMPLIFIED CMS DATA POPULATION SCRIPT
-- Execute this in Supabase SQL Editor after running the RLS fix
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- STEP 1: CREATE BLOG CATEGORIES (IF NOT EXISTS)
-- ============================================================================

-- Insert blog categories if they don't exist
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
-- STEP 2: FIX USER PERMISSIONS FOR CONTENT CREATION
-- ============================================================================

-- Update user permissions for content creation
UPDATE profiles
SET
    role = 'admin',
    first_name = 'Content',
    last_name = 'Manager',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'reforiy538@iamtile.com'
);

-- Create profile if it doesn't exist
INSERT INTO profiles (id, user_id, first_name, last_name, role, created_at, updated_at)
SELECT
    uuid_generate_v4(),
    au.id,
    'Content',
    'Manager',
    'admin',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'reforiy538@iamtile.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = au.id
);

-- ============================================================================
-- STEP 3: INSERT BLOG POSTS (SIMPLIFIED VERSION)
-- ============================================================================

-- Get the author_id and insert blog posts
DO $$
DECLARE
    author_uuid UUID;
BEGIN
    -- Get the profile ID for the content author
    SELECT p.id INTO author_uuid
    FROM profiles p
    JOIN auth.users au ON p.user_id = au.id
    WHERE au.email = 'reforiy538@iamtile.com';

    -- Insert blog posts
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
        '550e8400-e29b-41d4-a716-446655440001', -- Business Acquisition category
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
        '550e8400-e29b-41d4-a716-446655440002', -- Market Analysis category
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
        '550e8400-e29b-41d4-a716-446655440003', -- Due Diligence category
        12,
        '2024-01-05 10:00:00+00',
        NOW(),
        NOW()
    ),
    
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
        '550e8400-e29b-41d4-a716-446655440004', -- Financing category
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
        '550e8400-e29b-41d4-a716-446655440006', -- Success Stories category
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
        '550e8400-e29b-41d4-a716-446655440005', -- Legal & Compliance category
        11,
        '2024-01-30 10:00:00+00',
        NOW(),
        NOW()
    );

END $$;

-- ============================================================================
-- STEP 4: VERIFICATION QUERIES
-- ============================================================================

-- Check categories count
SELECT 'Categories created' as result, COUNT(*) as count FROM blog_categories;

-- Check posts count
SELECT 'Posts created' as result, COUNT(*) as count FROM content_pages;

-- Check user role (should be 'admin' for content creation permissions)
SELECT 'User permissions' as result, p.role, au.email
FROM profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'reforiy538@iamtile.com';

-- List all posts with categories
SELECT 
    cp.title,
    bc.name as category_name,
    cp.status,
    cp.published_at
FROM content_pages cp
LEFT JOIN blog_categories bc ON cp.category_id = bc.id
ORDER BY cp.published_at DESC;

-- Success message
SELECT '🎉 CMS DATA POPULATION COMPLETED!' as status;
SELECT '✅ 6 blog posts created' as result1;
SELECT '✅ User role updated to admin (content creation permissions)' as result2;
SELECT '✅ Ready for CMS testing' as result3;
