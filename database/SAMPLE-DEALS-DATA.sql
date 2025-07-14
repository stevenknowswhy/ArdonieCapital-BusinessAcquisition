-- SAMPLE DEALS DATA FOR BUYMART V1 TESTING
-- Creates sample deals for testing the enhanced active deals integration
-- Project: pbydepsqcypwqbicnsco
-- Generated: 2025-07-12

-- ============================================================================
-- PART 1: INSERT SAMPLE DEALS
-- ============================================================================

-- Sample Deal 1: Premier Auto Service (Due Diligence Stage)
INSERT INTO deals (
    business_name,
    business_type,
    location,
    asking_price,
    negotiated_price,
    ebitda,
    revenue,
    status,
    progress_percentage,
    start_date,
    expected_closing_date,
    last_activity_date,
    created_by,
    metadata
) VALUES (
    'Premier Auto Service',
    'Full Service Auto Repair',
    'Dallas, TX',
    850000,
    775000,
    180000,
    1200000,
    'due_diligence',
    35,
    '2024-11-15',
    '2025-02-15',
    NOW() - INTERVAL '2 days',
    (SELECT id FROM profiles WHERE email = 'buyer.free@testuser.ardonie.com' LIMIT 1),
    '{"established_year": 2015, "employees": 8, "bay_count": 6}'::jsonb
) ON CONFLICT DO NOTHING;

-- Sample Deal 2: Elite Collision Center (Negotiation Stage)
INSERT INTO deals (
    business_name,
    business_type,
    location,
    asking_price,
    negotiated_price,
    ebitda,
    revenue,
    status,
    progress_percentage,
    start_date,
    expected_closing_date,
    last_activity_date,
    created_by,
    metadata
) VALUES (
    'Elite Collision Center',
    'Auto Body Shop',
    'Austin, TX',
    1200000,
    1050000,
    250000,
    1800000,
    'negotiation',
    55,
    '2024-10-20',
    '2025-03-20',
    NOW() - INTERVAL '1 day',
    (SELECT id FROM profiles WHERE email = 'buyer.free@testuser.ardonie.com' LIMIT 1),
    '{"established_year": 2012, "employees": 12, "certifications": ["I-CAR", "ASE"]}'::jsonb
) ON CONFLICT DO NOTHING;

-- Sample Deal 3: Quick Lube Express (Initial Interest Stage)
INSERT INTO deals (
    business_name,
    business_type,
    location,
    asking_price,
    ebitda,
    revenue,
    status,
    progress_percentage,
    start_date,
    expected_closing_date,
    last_activity_date,
    created_by,
    metadata
) VALUES (
    'Quick Lube Express',
    'Quick Lube',
    'Houston, TX',
    450000,
    95000,
    650000,
    'initial_interest',
    15,
    '2024-12-01',
    '2025-04-01',
    NOW() - INTERVAL '3 hours',
    (SELECT id FROM profiles WHERE email = 'buyer.free@testuser.ardonie.com' LIMIT 1),
    '{"established_year": 2018, "employees": 4, "franchise": false}'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 2: ADD DEAL PARTICIPANTS
-- ============================================================================

-- Add buyer as participant for all deals
INSERT INTO deal_participants (deal_id, user_id, role, permissions)
SELECT 
    d.id,
    p.id,
    'buyer',
    '{"view": true, "edit": true, "admin": false}'::jsonb
FROM deals d
CROSS JOIN profiles p
WHERE p.email = 'buyer.free@testuser.ardonie.com'
AND NOT EXISTS (
    SELECT 1 FROM deal_participants dp 
    WHERE dp.deal_id = d.id AND dp.user_id = p.id
);

-- Add sample sellers as participants
INSERT INTO deal_participants (deal_id, user_id, role, permissions)
SELECT 
    d.id,
    p.id,
    'seller',
    '{"view": true, "edit": true, "admin": false}'::jsonb
FROM deals d
CROSS JOIN profiles p
WHERE p.email = 'seller.free@testuser.ardonie.com'
AND d.business_name IN ('Premier Auto Service', 'Elite Collision Center')
AND NOT EXISTS (
    SELECT 1 FROM deal_participants dp 
    WHERE dp.deal_id = d.id AND dp.user_id = p.id
);

-- ============================================================================
-- PART 3: ADD SAMPLE DEAL ACTIVITIES
-- ============================================================================

-- Activities for Premier Auto Service
INSERT INTO deal_activities (deal_id, user_id, activity_type, title, description, status, created_at)
SELECT 
    d.id,
    p.id,
    'document_request',
    'Financial Statements Requested',
    'Requested last 3 years of financial statements and tax returns',
    'completed',
    NOW() - INTERVAL '5 days'
FROM deals d
CROSS JOIN profiles p
WHERE d.business_name = 'Premier Auto Service'
AND p.email = 'buyer.free@testuser.ardonie.com';

INSERT INTO deal_activities (deal_id, user_id, activity_type, title, description, status, due_date, created_at)
SELECT 
    d.id,
    p.id,
    'site_visit',
    'Facility Inspection Scheduled',
    'On-site inspection of the auto repair facility and equipment',
    'pending',
    CURRENT_DATE + INTERVAL '3 days',
    NOW() - INTERVAL '2 days'
FROM deals d
CROSS JOIN profiles p
WHERE d.business_name = 'Premier Auto Service'
AND p.email = 'buyer.free@testuser.ardonie.com';

-- Activities for Elite Collision Center
INSERT INTO deal_activities (deal_id, user_id, activity_type, title, description, status, created_at)
SELECT 
    d.id,
    p.id,
    'offer_submitted',
    'Initial Offer Submitted',
    'Submitted offer of $1,050,000 with financing contingency',
    'completed',
    NOW() - INTERVAL '7 days'
FROM deals d
CROSS JOIN profiles p
WHERE d.business_name = 'Elite Collision Center'
AND p.email = 'buyer.free@testuser.ardonie.com';

INSERT INTO deal_activities (deal_id, user_id, activity_type, title, description, status, due_date, created_at)
SELECT 
    d.id,
    p.id,
    'negotiation',
    'Price Negotiation in Progress',
    'Negotiating final purchase price and terms',
    'in_progress',
    CURRENT_DATE + INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
FROM deals d
CROSS JOIN profiles p
WHERE d.business_name = 'Elite Collision Center'
AND p.email = 'buyer.free@testuser.ardonie.com';

-- Activities for Quick Lube Express
INSERT INTO deal_activities (deal_id, user_id, activity_type, title, description, status, created_at)
SELECT 
    d.id,
    p.id,
    'meeting',
    'Initial Meeting with Seller',
    'First meeting to discuss business overview and sale terms',
    'completed',
    NOW() - INTERVAL '2 days'
FROM deals d
CROSS JOIN profiles p
WHERE d.business_name = 'Quick Lube Express'
AND p.email = 'buyer.free@testuser.ardonie.com';

-- ============================================================================
-- PART 4: ADD SAMPLE DEAL NOTES
-- ============================================================================

-- Notes for Premier Auto Service
INSERT INTO deal_notes (deal_id, user_id, note_text, is_private)
SELECT 
    d.id,
    p.id,
    'Strong financials with consistent growth over past 3 years. Equipment is well-maintained. Location has good visibility and traffic flow.',
    false
FROM deals d
CROSS JOIN profiles p
WHERE d.business_name = 'Premier Auto Service'
AND p.email = 'buyer.free@testuser.ardonie.com';

-- Notes for Elite Collision Center
INSERT INTO deal_notes (deal_id, user_id, note_text, is_private)
SELECT 
    d.id,
    p.id,
    'Excellent reputation with insurance companies. Modern paint booth and equipment. Seller motivated due to retirement.',
    false
FROM deals d
CROSS JOIN profiles p
WHERE d.business_name = 'Elite Collision Center'
AND p.email = 'buyer.free@testuser.ardonie.com';

-- Private note for buyer
INSERT INTO deal_notes (deal_id, user_id, note_text, is_private)
SELECT 
    d.id,
    p.id,
    'Need to verify insurance contracts and check for any pending litigation. Consider bringing in partner for this deal.',
    true
FROM deals d
CROSS JOIN profiles p
WHERE d.business_name = 'Elite Collision Center'
AND p.email = 'buyer.free@testuser.ardonie.com';

-- ============================================================================
-- PART 5: ADD SAMPLE DEAL VALUATIONS
-- ============================================================================

-- Valuation for Premier Auto Service
INSERT INTO deal_valuations (deal_id, valuation_type, valuation_amount, performed_by, methodology, assumptions)
SELECT 
    d.id,
    'income_approach',
    780000,
    p.id,
    'Discounted Cash Flow analysis based on 3-year average EBITDA',
    '{"discount_rate": 0.12, "growth_rate": 0.03, "terminal_multiple": 4.5}'::jsonb
FROM deals d
CROSS JOIN profiles p
WHERE d.business_name = 'Premier Auto Service'
AND p.email = 'buyer.free@testuser.ardonie.com';

-- Valuation for Elite Collision Center
INSERT INTO deal_valuations (deal_id, valuation_type, valuation_amount, performed_by, methodology, assumptions)
SELECT 
    d.id,
    'market_approach',
    1100000,
    p.id,
    'Comparable sales analysis of similar auto body shops in Texas',
    '{"comparable_count": 5, "average_multiple": 4.4, "location_adjustment": 1.1}'::jsonb
FROM deals d
CROSS JOIN profiles p
WHERE d.business_name = 'Elite Collision Center'
AND p.email = 'buyer.free@testuser.ardonie.com';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify deals were created
SELECT 
    business_name,
    status,
    asking_price,
    progress_percentage,
    (SELECT COUNT(*) FROM deal_participants WHERE deal_id = deals.id) as participant_count,
    (SELECT COUNT(*) FROM deal_activities WHERE deal_id = deals.id) as activity_count
FROM deals
WHERE created_by = (SELECT id FROM profiles WHERE email = 'buyer.free@testuser.ardonie.com' LIMIT 1)
ORDER BY created_at DESC;

-- Verify deal participants
SELECT 
    d.business_name,
    p.first_name || ' ' || p.last_name as participant_name,
    dp.role,
    dp.is_active
FROM deals d
JOIN deal_participants dp ON dp.deal_id = d.id
JOIN profiles p ON p.id = dp.user_id
WHERE d.created_by = (SELECT id FROM profiles WHERE email = 'buyer.free@testuser.ardonie.com' LIMIT 1)
ORDER BY d.business_name, dp.role;

-- Test the helper function
SELECT get_user_active_deals_count(
    (SELECT id FROM profiles WHERE email = 'buyer.free@testuser.ardonie.com' LIMIT 1)
) as active_deals_count;

SELECT '🔥 Sample deals data created successfully!' as result;
SELECT 'Ready for testing enhanced active deals integration' as status;
