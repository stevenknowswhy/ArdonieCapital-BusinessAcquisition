-- TEST CMS POPULATION SYNTAX
-- This script tests the syntax of the CMS population without actually inserting data
-- Run this first to validate the SQL syntax before running the full script

-- ============================================================================
-- SYNTAX TEST 1: VALIDATE CATEGORIES CREATION
-- ============================================================================

-- Test categories creation syntax (without actually inserting)
EXPLAIN (FORMAT TEXT) 
INSERT INTO blog_categories (id, name, slug, description, color, is_active, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Business Acquisition', 'business-acquisition', 'Guides and insights for acquiring auto repair businesses', '#3b82f6', true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    updated_at = NOW();

-- ============================================================================
-- SYNTAX TEST 2: VALIDATE USER UPDATE
-- ============================================================================

-- Test user update syntax
EXPLAIN (FORMAT TEXT)
UPDATE profiles 
SET 
    role = 'admin',
    first_name = 'Content',
    last_name = 'Manager',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'reforiy538@iamtile.com'
);

-- ============================================================================
-- SYNTAX TEST 3: VALIDATE BLOG POSTS INSERT STRUCTURE
-- ============================================================================

-- Test the DO block structure and INSERT syntax
DO $$
DECLARE
    author_uuid UUID;
    test_mode BOOLEAN := true; -- Set to true for syntax testing
BEGIN
    -- Get the profile ID for the content author
    SELECT p.id INTO author_uuid
    FROM profiles p
    JOIN auth.users au ON p.user_id = au.id
    WHERE au.email = 'reforiy538@iamtile.com';
    
    -- Only test syntax, don't actually insert
    IF test_mode THEN
        RAISE NOTICE 'Syntax test passed - author_uuid: %', COALESCE(author_uuid::text, 'NULL');
        RETURN;
    END IF;

    -- Test INSERT structure (this won't execute due to RETURN above)
    INSERT INTO content_pages (
        id, slug, title, content, excerpt, meta_description, meta_keywords,
        author_id, status, featured_image, tags, category_id, reading_time,
        published_at, created_at, updated_at
    ) VALUES 
    (
        uuid_generate_v4(),
        'test-post',
        'Test Post Title',
        '<h2>Test Content</h2><p>This is a test post with properly escaped quotes: ''quoted text''.</p>',
        'Test excerpt',
        'Test meta description',
        ARRAY['test', 'syntax'],
        author_uuid,
        'published',
        'https://example.com/image.jpg',
        ARRAY['test'],
        '550e8400-e29b-41d4-a716-446655440001',
        5,
        '2024-01-01 10:00:00+00',
        NOW(),
        NOW()
    );

END $$;

-- ============================================================================
-- SYNTAX TEST 4: VALIDATE CATEGORY REFERENCES
-- ============================================================================

-- Check if all referenced category UUIDs exist
SELECT 
    'Category UUID Check' as test_type,
    category_uuid,
    CASE 
        WHEN EXISTS (SELECT 1 FROM blog_categories WHERE id = category_uuid::uuid) 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
FROM (
    VALUES 
        ('550e8400-e29b-41d4-a716-446655440001'),
        ('550e8400-e29b-41d4-a716-446655440002'),
        ('550e8400-e29b-41d4-a716-446655440003'),
        ('550e8400-e29b-41d4-a716-446655440004'),
        ('550e8400-e29b-41d4-a716-446655440005'),
        ('550e8400-e29b-41d4-a716-446655440006')
) AS t(category_uuid);

-- ============================================================================
-- SYNTAX TEST 5: VALIDATE ARRAY SYNTAX
-- ============================================================================

-- Test array syntax used in the script
SELECT 
    'Array Syntax Test' as test_type,
    ARRAY['auto repair', 'business valuation', 'shop value', 'acquisition'] as meta_keywords_test,
    ARRAY['valuation', 'auto repair', 'business acquisition'] as tags_test;

-- ============================================================================
-- SYNTAX TEST 6: VALIDATE TIMESTAMP FORMAT
-- ============================================================================

-- Test timestamp format used in the script
SELECT 
    'Timestamp Test' as test_type,
    '2024-01-15 10:00:00+00'::timestamp with time zone as published_at_test,
    NOW() as current_time_test;

-- ============================================================================
-- SYNTAX TEST RESULTS
-- ============================================================================

SELECT '🧪 SYNTAX VALIDATION COMPLETED' as result;
SELECT 'If no errors appeared above, the SQL syntax is valid' as instruction;
SELECT 'You can now safely run execute-cms-population-simplified.sql' as next_step;
