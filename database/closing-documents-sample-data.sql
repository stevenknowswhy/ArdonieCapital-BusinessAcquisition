-- Sample Data for Closing Documents Management System
-- This file contains sample data to populate the closing documents tables

-- Insert sample deals (using existing profile IDs from the system)
INSERT INTO deals (
    id,
    deal_number,
    business_name,
    buyer_id,
    seller_id,
    agent_id,
    purchase_price,
    location,
    city,
    state,
    status,
    priority,
    closing_date,
    days_to_closing,
    progress_percentage,
    next_milestone,
    deal_terms,
    notes
) VALUES 
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'DEAL-001',
    'Premier Auto Service',
    (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    850000.00,
    'Dallas, TX',
    'Dallas',
    'TX',
    'in-progress',
    'high',
    CURRENT_DATE + INTERVAL '12 days',
    12,
    75,
    'Final walkthrough',
    '{"financing_type": "SBA", "earnest_money": 25000, "inspection_period": 10}',
    'High-volume auto repair shop with excellent reputation'
),
(
    'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    'DEAL-002',
    'Quick Lube Express',
    (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1 OFFSET 1),
    (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1 OFFSET 1),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    425000.00,
    'Fort Worth, TX',
    'Fort Worth',
    'TX',
    'pending-review',
    'medium',
    CURRENT_DATE + INTERVAL '5 days',
    5,
    90,
    'Document review',
    '{"financing_type": "Conventional", "earnest_money": 15000, "inspection_period": 7}',
    'Fast-growing quick lube business with multiple bays'
),
(
    'c3d4e5f6-g7h8-9012-cdef-345678901234',
    'DEAL-003',
    'Elite Automotive Repair',
    (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1 OFFSET 2),
    (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1 OFFSET 2),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    1200000.00,
    'Plano, TX',
    'Plano',
    'TX',
    'in-progress',
    'high',
    CURRENT_DATE + INTERVAL '22 days',
    22,
    45,
    'Due diligence review',
    '{"financing_type": "SBA", "earnest_money": 50000, "inspection_period": 14}',
    'Premium automotive repair facility with luxury car specialization'
),
(
    'd4e5f6g7-h8i9-0123-defg-456789012345',
    'DEAL-004',
    'Speedy Auto Care',
    (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1 OFFSET 3),
    (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1 OFFSET 3),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    675000.00,
    'Arlington, TX',
    'Arlington',
    'TX',
    'on-hold',
    'low',
    CURRENT_DATE + INTERVAL '45 days',
    45,
    30,
    'Financing approval',
    '{"financing_type": "Conventional", "earnest_money": 20000, "inspection_period": 10}',
    'General automotive repair shop with steady customer base'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample document templates
INSERT INTO document_templates (
    id,
    name,
    description,
    category,
    type,
    format,
    preview_content,
    tags,
    download_count,
    rating,
    rating_count,
    author_id,
    is_active
) VALUES 
(
    'tpl-001',
    'Asset Purchase Agreement',
    'Comprehensive agreement for purchasing auto repair shop assets',
    'purchase',
    'contract',
    'pdf',
    'This comprehensive Asset Purchase Agreement template covers all essential terms for acquiring auto repair shop assets including equipment, inventory, customer lists, and goodwill.',
    ARRAY['purchase', 'assets', 'contract', 'legal'],
    156,
    4.8,
    32,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    true
),
(
    'tpl-002',
    'Due Diligence Checklist',
    'Complete checklist for auto repair shop due diligence',
    'due-diligence',
    'checklist',
    'html',
    'Comprehensive due diligence checklist covering financial statements, tax returns, equipment condition, customer contracts, employee records, and regulatory compliance.',
    ARRAY['due-diligence', 'checklist', 'review', 'financial'],
    203,
    4.9,
    41,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    true
),
(
    'tpl-003',
    'SBA Loan Application Package',
    'Complete SBA loan application forms and documentation',
    'financing',
    'form',
    'pdf',
    'Complete SBA loan application package including Form 1919, personal financial statements, business plan template, and supporting documentation requirements.',
    ARRAY['sba', 'loan', 'financing', 'application'],
    89,
    4.6,
    18,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    true
),
(
    'tpl-004',
    'Employment Agreement Template',
    'Standard employment agreement for auto repair technicians',
    'employment',
    'contract',
    'docx',
    'Professional employment agreement template specifically designed for auto repair shop employees including technicians, service advisors, and management positions.',
    ARRAY['employment', 'contract', 'technician', 'hr'],
    134,
    4.7,
    28,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    true
),
(
    'tpl-005',
    'Business License Application',
    'Auto repair shop business license application forms',
    'legal',
    'form',
    'pdf',
    'Complete business license application forms for auto repair shop operations including state and local requirements, zoning compliance, and environmental permits.',
    ARRAY['license', 'legal', 'application', 'permits'],
    67,
    4.5,
    14,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    true
),
(
    'tpl-006',
    'Financial Statement Template',
    'Standardized financial statement format for auto repair shops',
    'due-diligence',
    'form',
    'docx',
    'Professional financial statement template designed specifically for auto repair businesses including P&L, balance sheet, and cash flow statements.',
    ARRAY['financial', 'statement', 'template', 'accounting'],
    178,
    4.8,
    36,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    true
),
(
    'tpl-007',
    'Non-Disclosure Agreement',
    'Mutual NDA for business acquisition discussions',
    'legal',
    'contract',
    'pdf',
    'Comprehensive mutual non-disclosure agreement for protecting confidential information during business acquisition negotiations and due diligence processes.',
    ARRAY['nda', 'confidentiality', 'legal', 'acquisition'],
    245,
    4.9,
    52,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    true
),
(
    'tpl-008',
    'Equipment Valuation Form',
    'Detailed form for valuing auto repair equipment',
    'due-diligence',
    'form',
    'html',
    'Comprehensive equipment valuation form for accurate assessment of automotive repair equipment including lifts, diagnostic tools, air compressors, and specialty equipment.',
    ARRAY['equipment', 'valuation', 'assessment', 'appraisal'],
    112,
    4.6,
    23,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    true
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample documents for deals
INSERT INTO documents (
    id,
    deal_id,
    name,
    description,
    category,
    status,
    file_path,
    file_size,
    file_type,
    version,
    is_required,
    due_date,
    uploaded_by,
    metadata
) VALUES 
-- Documents for DEAL-001
(
    'doc-001',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Asset Purchase Agreement',
    'Main purchase agreement for Premier Auto Service',
    'purchase',
    'completed',
    'deals/a1b2c3d4-e5f6-7890-abcd-ef1234567890/asset_purchase_agreement.pdf',
    2457600, -- 2.3 MB
    'application/pdf',
    1,
    true,
    CURRENT_DATE + INTERVAL '5 days',
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    '{"signed_by_buyer": true, "signed_by_seller": true, "notarized": true}'
),
(
    'doc-002',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Financial Statements (3 years)',
    'Historical financial performance data',
    'due-diligence',
    'completed',
    'deals/a1b2c3d4-e5f6-7890-abcd-ef1234567890/financial_statements.pdf',
    5452800, -- 5.2 MB
    'application/pdf',
    1,
    true,
    CURRENT_DATE - INTERVAL '5 days',
    (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1),
    '{"years_covered": ["2021", "2022", "2023"], "audited": false}'
),
(
    'doc-003',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Equipment List & Valuations',
    'Complete inventory and valuation of all equipment',
    'due-diligence',
    'in-review',
    'deals/a1b2c3d4-e5f6-7890-abcd-ef1234567890/equipment_valuation.pdf',
    1992294, -- 1.9 MB
    'application/pdf',
    1,
    true,
    CURRENT_DATE + INTERVAL '3 days',
    (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1),
    '{"appraiser": "AutoEquip Valuations LLC", "appraisal_date": "2024-01-12"}'
),
(
    'doc-004',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'SBA Loan Application',
    'Small Business Administration loan application',
    'financing',
    'completed',
    'deals/a1b2c3d4-e5f6-7890-abcd-ef1234567890/sba_application.pdf',
    1572864, -- 1.5 MB
    'application/pdf',
    1,
    true,
    CURRENT_DATE - INTERVAL '10 days',
    (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1),
    '{"loan_amount": 680000, "sba_program": "7(a)", "lender": "First National Bank"}'
),
-- Documents for DEAL-002
(
    'doc-005',
    'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    'Purchase Agreement',
    'Main purchase agreement for Quick Lube Express',
    'purchase',
    'pending',
    null,
    null,
    null,
    1,
    true,
    CURRENT_DATE + INTERVAL '2 days',
    null,
    null
),
(
    'doc-006',
    'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    'Business License',
    'Current business license and permits',
    'legal',
    'completed',
    'deals/b2c3d4e5-f6g7-8901-bcde-f23456789012/business_license.pdf',
    314572, -- 0.3 MB
    'application/pdf',
    1,
    true,
    CURRENT_DATE - INTERVAL '15 days',
    (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1 OFFSET 1),
    '{"license_number": "BL-2023-4567", "expiration_date": "2024-12-31"}'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample document activities
INSERT INTO document_activities (
    id,
    deal_id,
    document_id,
    user_id,
    activity_type,
    title,
    description,
    metadata
) VALUES 
(
    'act-001',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'doc-001',
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'uploaded',
    'Document uploaded',
    'Asset Purchase Agreement uploaded and ready for review',
    '{"file_size": 2457600, "upload_method": "web"}'
),
(
    'act-002',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'doc-001',
    (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1),
    'signed',
    'Document signed',
    'Asset Purchase Agreement signed by buyer',
    '{"signature_method": "electronic", "ip_address": "192.168.1.100"}'
),
(
    'act-003',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'doc-002',
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'reviewed',
    'Financial review completed',
    'Financial statements reviewed and approved',
    '{"reviewer_notes": "All financial data verified and acceptable"}'
),
(
    'act-004',
    'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    null,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'created',
    'Deal created',
    'New deal created for Quick Lube Express acquisition',
    '{"deal_value": 425000, "created_via": "web_interface"}'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample deal participants
INSERT INTO deal_participants (
    id,
    deal_id,
    user_id,
    role,
    permissions,
    invited_by,
    accepted_at,
    is_active
) VALUES 
(
    'part-001',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1),
    'buyer',
    ARRAY['read', 'write', 'sign'],
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    NOW() - INTERVAL '10 days',
    true
),
(
    'part-002',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1),
    'seller',
    ARRAY['read', 'write', 'sign'],
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    NOW() - INTERVAL '10 days',
    true
),
(
    'part-003',
    'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1 OFFSET 1),
    'buyer',
    ARRAY['read', 'write', 'sign'],
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    NOW() - INTERVAL '5 days',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Update deal progress based on document completion
UPDATE deals SET 
    progress_percentage = (
        SELECT ROUND(
            (COUNT(*) FILTER (WHERE status = 'completed')::FLOAT / COUNT(*)::FLOAT) * 100
        )
        FROM documents 
        WHERE deal_id = deals.id AND is_required = true
    )
WHERE id IN (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    'c3d4e5f6-g7h8-9012-cdef-345678901234',
    'd4e5f6g7-h8i9-0123-defg-456789012345'
);

-- Verification queries
SELECT 'Deals created:' as info, COUNT(*) as count FROM deals;
SELECT 'Document templates created:' as info, COUNT(*) as count FROM document_templates;
SELECT 'Documents created:' as info, COUNT(*) as count FROM documents;
SELECT 'Activities logged:' as info, COUNT(*) as count FROM document_activities;
SELECT 'Participants added:' as info, COUNT(*) as count FROM deal_participants;
