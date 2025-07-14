-- Sample Data for Ardonie Capital Database
-- This file contains sample data for testing and development

-- Note: User IDs should be replaced with actual Supabase auth.users IDs
-- These are placeholder UUIDs for demonstration

-- Sample profiles (these would be created after user registration)
INSERT INTO profiles (id, user_id, first_name, last_name, role, company, phone, location, experience_years, budget_min, budget_max, preferred_industries) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'John', 'Buyer', 'buyer', 'Investment Group LLC', '+1-555-0101', 'Dallas, TX', 5, 100000, 500000, ARRAY['automotive', 'retail']),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Jane', 'Seller', 'seller', 'Auto Shop Owner', '+1-555-0102', 'Fort Worth, TX', 15, NULL, NULL, NULL),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Mike', 'Investor', 'buyer', 'Capital Partners', '+1-555-0103', 'Austin, TX', 10, 250000, 1000000, ARRAY['automotive', 'manufacturing']),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Sarah', 'Business Owner', 'seller', 'Quick Lube Express', '+1-555-0104', 'Houston, TX', 8, NULL, NULL, NULL),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Admin', 'User', 'admin', 'Ardonie Capital', '+1-555-0100', 'Dallas, TX', 20, NULL, NULL, NULL);

-- Sample business listings
INSERT INTO listings (id, seller_id, title, description, asking_price, business_type, industry, location, city, state, zip_code, annual_revenue, annual_profit, ebitda, employees, established_year, reason_for_selling, assets_included, status, featured) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Established Auto Repair Shop - Prime Location', 'Well-established auto repair shop in high-traffic area. Includes all equipment, customer base, and trained staff. Perfect opportunity for expansion.', 350000, 'Auto Repair Shop', 'automotive', '123 Main St, Fort Worth, TX', 'Fort Worth', 'TX', '76101', 450000, 85000, 95000, 6, 2010, 'Retirement', ARRAY['building_lease', 'equipment', 'inventory', 'customer_database'], 'active', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Quick Lube Franchise - High Volume', 'Profitable quick lube franchise with excellent location and steady customer flow. Turn-key operation with established processes.', 275000, 'Quick Lube', 'automotive', '456 Commerce Blvd, Houston, TX', 'Houston', 'TX', '77001', 380000, 65000, 72000, 4, 2015, 'Relocation', ARRAY['equipment', 'franchise_rights', 'inventory'], 'active', false),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Tire Shop with Installation Bay', 'Successful tire shop with installation services. Great reputation and loyal customer base. Room for growth with additional services.', 225000, 'Tire Shop', 'automotive', '789 Industrial Way, Fort Worth, TX', 'Fort Worth', 'TX', '76102', 320000, 55000, 62000, 3, 2012, 'New venture', ARRAY['equipment', 'inventory', 'customer_database'], 'active', false);

-- Sample matches
INSERT INTO matches (id, buyer_id, seller_id, listing_id, compatibility_score, match_reasons, status) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 0.85, ARRAY['Budget match', 'Industry preference', 'Geographic proximity'], 'pending'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 0.92, ARRAY['Budget match', 'Industry expertise', 'Experience level'], 'accepted'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 0.78, ARRAY['Budget match', 'Industry preference'], 'pending');

-- Sample messages
INSERT INTO messages (id, match_id, sender_id, recipient_id, subject, content, status) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Interest in Auto Repair Shop', 'Hi Jane, I am very interested in your auto repair shop listing. Could we schedule a time to discuss the details and possibly arrange a visit?', 'delivered'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Re: Interest in Auto Repair Shop', 'Hi Mike, Thank you for your interest! I would be happy to discuss the business with you. Are you available for a call this week?', 'delivered');

-- Sample notifications
INSERT INTO notifications (id, user_id, type, title, message, data) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'new_match', 'New Match Found!', 'We found a new business that matches your criteria.', '{"listing_id": "660e8400-e29b-41d4-a716-446655440001", "compatibility_score": 0.85}'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'new_message', 'New Message', 'You have received a new message from a potential buyer.', '{"message_id": "880e8400-e29b-41d4-a716-446655440001", "sender": "Mike Investor"}'),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'match_accepted', 'Match Accepted', 'Your interest in the auto repair shop has been accepted by the seller.', '{"match_id": "770e8400-e29b-41d4-a716-446655440002"}');

-- Sample saved listings
INSERT INTO saved_listings (id, buyer_id, listing_id, notes) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Interested in this location, need to verify lease terms'),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'Good cash flow, consider for portfolio');

-- Sample search history
INSERT INTO search_history (id, user_id, search_query, filters, results_count) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'auto repair shop', '{"location": "Texas", "price_max": 400000}', 3),
('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'automotive business', '{"price_min": 200000, "price_max": 500000}', 5);

-- Sample analytics events
INSERT INTO analytics_events (id, user_id, event_type, event_data, session_id) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'listing_view', '{"listing_id": "660e8400-e29b-41d4-a716-446655440001", "duration": 45}', 'session_123'),
('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'search_performed', '{"query": "auto repair", "filters": {"location": "Texas"}}', 'session_456'),
('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'match_created', '{"match_id": "770e8400-e29b-41d4-a716-446655440001", "compatibility_score": 0.85}', 'session_789');
