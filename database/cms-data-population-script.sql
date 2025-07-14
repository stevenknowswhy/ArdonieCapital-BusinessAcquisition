-- CMS Data Population Script
-- This script populates the CMS with blog content and fixes authentication issues
-- Project: pbydepsqcypwqbicnsco (BuyMartV1)

-- ============================================================================
-- STEP 1: CREATE BLOG CATEGORIES
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
-- STEP 2: CREATE CONTENT AUTHOR PROFILE
-- ============================================================================

-- Create a content author user (if not exists)
-- Note: This assumes the user reforiy538@iamtile.com exists in auth.users
-- If not, you'll need to create it through Supabase Auth first

-- Update the existing user's profile to have content creation permissions
UPDATE profiles 
SET 
    role = 'blog_editor',
    first_name = 'Content',
    last_name = 'Manager',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'reforiy538@iamtile.com'
);

-- If the profile doesn't exist, create it
INSERT INTO profiles (id, user_id, first_name, last_name, role, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    au.id,
    'Content',
    'Manager',
    'blog_editor',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'reforiy538@iamtile.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = au.id
);

-- ============================================================================
-- STEP 3: INSERT BLOG CONTENT
-- ============================================================================

-- Get the author_id for content creation
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
        '<p>When it comes to buying or selling an auto repair shop, understanding valuation is crucial. Whether you''re a potential buyer looking to make an informed offer or a seller wanting to maximize your return, these five key factors will significantly impact the final price.</p>

<h2>1. Financial Performance and Cash Flow</h2>
<p>The most critical factor in any business valuation is financial performance. For auto repair shops, buyers focus heavily on:</p>
<ul>
<li><strong>Annual Revenue:</strong> Consistent revenue growth over 3-5 years demonstrates market demand and business stability</li>
<li><strong>Net Cash Flow:</strong> The actual money the business generates after all expenses, typically valued at 2-4x annual cash flow</li>
<li><strong>Profit Margins:</strong> Higher margins indicate efficient operations and pricing power</li>
<li><strong>Seasonal Variations:</strong> Understanding revenue patterns throughout the year</li>
</ul>

<h2>2. Location and Market Demographics</h2>
<p>Location can make or break an auto repair shop''s value. Key considerations include:</p>
<ul>
<li><strong>Visibility and Accessibility:</strong> High-traffic areas with easy access drive more customers</li>
<li><strong>Demographics:</strong> Areas with older vehicles and middle-income households typically generate more repair business</li>
<li><strong>Competition Density:</strong> Too much competition can hurt, but some competition validates market demand</li>
<li><strong>Lease Terms:</strong> Long-term, favorable lease agreements add significant value</li>
</ul>

<h2>3. Equipment and Facility Condition</h2>
<p>The physical assets of the shop directly impact both operational efficiency and valuation:</p>
<ul>
<li><strong>Modern Equipment:</strong> Up-to-date diagnostic tools, lifts, and specialty equipment</li>
<li><strong>Facility Size and Layout:</strong> Adequate bay space and efficient workflow design</li>
<li><strong>Building Condition:</strong> Well-maintained facilities require less immediate investment</li>
<li><strong>Environmental Compliance:</strong> Proper waste disposal systems and environmental certifications</li>
</ul>

<h2>4. Customer Base and Reputation</h2>
<p>A loyal customer base is one of the most valuable assets of any auto repair shop:</p>
<ul>
<li><strong>Customer Retention Rate:</strong> High repeat customer percentages indicate quality service</li>
<li><strong>Online Reviews:</strong> Strong Google, Yelp, and Facebook ratings build trust</li>
<li><strong>Fleet Accounts:</strong> Commercial contracts provide steady, predictable revenue</li>
<li><strong>Referral Network:</strong> Relationships with insurance companies, dealerships, and other businesses</li>
</ul>

<h2>5. Staff and Management Systems</h2>
<p>The human element and operational systems significantly impact value:</p>
<ul>
<li><strong>Skilled Technicians:</strong> Certified, experienced staff who can handle complex repairs</li>
<li><strong>Management Systems:</strong> Efficient scheduling, inventory, and customer management systems</li>
<li><strong>Owner Dependency:</strong> Shops that can operate without daily owner involvement are more valuable</li>
<li><strong>Training Programs:</strong> Ongoing staff development and certification programs</li>
</ul>',
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
        '<p>The Dallas-Fort Worth metroplex continues to be one of the most dynamic auto repair markets in the United States. With a growing population, aging vehicle fleet, and robust economy, 2024 presents unique opportunities for both buyers and sellers in the auto repair industry.</p>

<h2>Market Size and Growth</h2>
<p>The DFW auto repair market has shown remarkable resilience and growth:</p>
<ul>
<li><strong>Market Value:</strong> The DFW auto repair market is valued at approximately $2.8 billion annually</li>
<li><strong>Growth Rate:</strong> 4.2% year-over-year growth, outpacing the national average of 3.1%</li>
<li><strong>Shop Count:</strong> Over 3,200 independent auto repair facilities across the metroplex</li>
<li><strong>Employment:</strong> The industry employs over 28,000 technicians and support staff</li>
</ul>

<h2>Key Market Drivers</h2>
<p>Several factors are driving growth in the DFW auto repair market:</p>
<ul>
<li><strong>Population Growth:</strong> DFW adds approximately 150,000 new residents annually</li>
<li><strong>Aging Vehicle Fleet:</strong> Average vehicle age in Texas is 12.2 years, driving repair demand</li>
<li><strong>Economic Stability:</strong> Diverse economy provides stable customer base</li>
<li><strong>Corporate Relocations:</strong> Major companies moving to DFW bring high-income professionals</li>
</ul>

<h2>Investment Opportunities</h2>
<p>The current market presents several investment opportunities:</p>
<ul>
<li><strong>Acquisition Targets:</strong> Many baby boomer shop owners looking to retire</li>
<li><strong>Consolidation Plays:</strong> Opportunities to acquire multiple locations</li>
<li><strong>Technology Upgrades:</strong> Shops needing modernization present value-add opportunities</li>
<li><strong>Specialty Services:</strong> Growing demand for electric vehicle and hybrid repair services</li>
</ul>',
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
    );

    -- Post 3: Due Diligence Checklist
    (
        uuid_generate_v4(),
        'due-diligence-checklist',
        'Complete Due Diligence Checklist for Auto Shop Buyers',
        '<p>Buying an auto repair shop is a significant investment that requires thorough due diligence. This comprehensive checklist will help you evaluate every aspect of the business before making your final decision.</p>

<h2>Financial Due Diligence</h2>
<ul>
<li><strong>Financial Statements:</strong> Review 3-5 years of profit & loss statements, balance sheets, and cash flow statements</li>
<li><strong>Tax Returns:</strong> Verify business and personal tax returns match financial statements</li>
<li><strong>Revenue Analysis:</strong> Analyze revenue trends, seasonality, and customer concentration</li>
<li><strong>Expense Review:</strong> Examine all operating expenses for accuracy and sustainability</li>
<li><strong>Working Capital:</strong> Assess inventory levels, accounts receivable, and payables</li>
</ul>

<h2>Operational Due Diligence</h2>
<ul>
<li><strong>Equipment Inspection:</strong> Professional assessment of all tools, lifts, and diagnostic equipment</li>
<li><strong>Facility Condition:</strong> Building inspection including HVAC, electrical, and structural elements</li>
<li><strong>Lease Review:</strong> Terms, renewal options, rent escalations, and assignment rights</li>
<li><strong>Permits & Licenses:</strong> Verify all required business licenses and environmental permits</li>
<li><strong>Insurance Coverage:</strong> Review current policies and claims history</li>
</ul>

<h2>Legal Due Diligence</h2>
<ul>
<li><strong>Corporate Structure:</strong> Review business entity formation and ownership structure</li>
<li><strong>Contracts Review:</strong> Examine supplier agreements, customer contracts, and employment agreements</li>
<li><strong>Litigation History:</strong> Check for pending or past legal issues</li>
<li><strong>Environmental Compliance:</strong> Verify compliance with environmental regulations</li>
<li><strong>Intellectual Property:</strong> Review trademarks, trade names, and proprietary processes</li>
</ul>',
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
        '<p>Securing the right financing is crucial for a successful auto shop acquisition. Understanding your options and preparing properly can make the difference between closing your deal and losing your dream business.</p>

<h2>SBA Loans</h2>
<p>Small Business Administration loans are often the best option for auto shop acquisitions:</p>
<ul>
<li><strong>SBA 7(a) Loans:</strong> Up to $5 million with competitive rates and terms</li>
<li><strong>Lower Down Payments:</strong> Typically 10-15% vs 25-30% for conventional loans</li>
<li><strong>Longer Terms:</strong> Up to 25 years for real estate, 10 years for equipment</li>
<li><strong>Competitive Rates:</strong> Prime + 2.75% to 4.75% depending on loan size</li>
</ul>

<h2>Conventional Bank Loans</h2>
<p>Traditional bank financing remains a viable option:</p>
<ul>
<li><strong>Faster Processing:</strong> Quicker approval process than SBA loans</li>
<li><strong>Relationship Banking:</strong> Leverage existing banking relationships</li>
<li><strong>Higher Down Payments:</strong> Typically require 25-30% down</li>
<li><strong>Shorter Terms:</strong> Usually 5-10 years with balloon payments</li>
</ul>

<h2>Seller Financing</h2>
<p>Many auto shop sales include seller financing components:</p>
<ul>
<li><strong>Partial Financing:</strong> Seller finances 10-30% of purchase price</li>
<li><strong>Earnout Provisions:</strong> Performance-based payments over time</li>
<li><strong>Consulting Agreements:</strong> Transition assistance with deferred compensation</li>
<li><strong>Asset-Based Terms:</strong> Equipment or inventory financing by seller</li>
</ul>',
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
        '<p>Meet John Martinez, who successfully acquired a thriving auto repair shop in Plano, Texas through our Express Deal program. His story demonstrates how the right approach and expert guidance can accelerate your business acquisition timeline.</p>

<h2>The Challenge</h2>
<p>John had been searching for the right auto shop to purchase for over 18 months:</p>
<ul>
<li><strong>Limited Time:</strong> Working full-time while searching for opportunities</li>
<li><strong>Market Competition:</strong> Multiple buyers competing for quality shops</li>
<li><strong>Financing Complexity:</strong> Navigating SBA loan requirements and timelines</li>
<li><strong>Due Diligence:</strong> Ensuring thorough evaluation without losing deals</li>
</ul>

<h2>The Express Deal Solution</h2>
<p>Our Express Deal program provided John with:</p>
<ul>
<li><strong>Pre-Qualified Listings:</strong> Access to vetted, acquisition-ready businesses</li>
<li><strong>Financing Pre-Approval:</strong> SBA loan pre-approval before making offers</li>
<li><strong>Dedicated Support:</strong> Single point of contact throughout the process</li>
<li><strong>Accelerated Timeline:</strong> Streamlined due diligence and closing process</li>
</ul>

<h2>The Results</h2>
<p>John''s acquisition was completed in just 34 days:</p>
<ul>
<li><strong>Day 1-7:</strong> Identified target business and submitted offer</li>
<li><strong>Day 8-21:</strong> Completed due diligence and finalized financing</li>
<li><strong>Day 22-28:</strong> Legal documentation and final approvals</li>
<li><strong>Day 29-34:</strong> Closing and business transition</li>
</ul>

<h2>Post-Acquisition Success</h2>
<p>Six months after closing, John''s business is thriving:</p>
<ul>
<li><strong>Revenue Growth:</strong> 15% increase in monthly revenue</li>
<li><strong>Customer Retention:</strong> 95% customer retention rate</li>
<li><strong>Team Stability:</strong> All key employees remained with the business</li>
<li><strong>Expansion Plans:</strong> Already exploring second location opportunities</li>
</ul>',
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
        '<p>Selling your auto repair shop requires careful preparation to maximize value and ensure a smooth transaction. This comprehensive guide will help you prepare your business for sale and attract qualified buyers.</p>

<h2>Financial Preparation</h2>
<p>Clean, organized financials are essential for a successful sale:</p>
<ul>
<li><strong>Financial Statements:</strong> Prepare 3-5 years of audited or reviewed financial statements</li>
<li><strong>Tax Compliance:</strong> Ensure all tax filings are current and accurate</li>
<li><strong>Expense Normalization:</strong> Identify and document owner perks and one-time expenses</li>
<li><strong>Revenue Documentation:</strong> Provide detailed revenue breakdowns by service type</li>
<li><strong>Cash Flow Analysis:</strong> Demonstrate consistent cash generation</li>
</ul>

<h2>Operational Improvements</h2>
<p>Optimize operations to increase business value:</p>
<ul>
<li><strong>Equipment Maintenance:</strong> Ensure all equipment is in excellent working condition</li>
<li><strong>Facility Upgrades:</strong> Address any deferred maintenance or cosmetic issues</li>
<li><strong>Process Documentation:</strong> Create standard operating procedures for all key processes</li>
<li><strong>Staff Training:</strong> Ensure team can operate independently of owner</li>
<li><strong>Customer Database:</strong> Organize and document customer relationships</li>
</ul>

<h2>Legal and Compliance</h2>
<p>Address all legal and regulatory requirements:</p>
<ul>
<li><strong>License Renewals:</strong> Ensure all business licenses are current</li>
<li><strong>Environmental Compliance:</strong> Complete any required environmental assessments</li>
<li><strong>Contract Review:</strong> Organize all supplier and customer agreements</li>
<li><strong>Lease Documentation:</strong> Ensure lease is transferable with favorable terms</li>
<li><strong>Insurance Policies:</strong> Review and update all insurance coverage</li>
</ul>',
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
