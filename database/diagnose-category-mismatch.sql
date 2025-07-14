-- DIAGNOSE CATEGORY MISMATCH ISSUE
-- This script helps identify why Step 3 can't find categories that Step 1 created
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- CHECK ACTUAL CATEGORY DATA IN DATABASE
-- ============================================================================

-- Show all categories with their exact IDs and data types
SELECT 
    'ACTUAL_CATEGORIES' as check_type,
    id,
    id::text as id_as_text,
    name,
    slug,
    created_at
FROM blog_categories
ORDER BY name;

-- Check the exact UUID format and length
SELECT 
    'UUID_FORMAT_CHECK' as check_type,
    id,
    LENGTH(id::text) as uuid_length,
    id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' as is_valid_uuid_format
FROM blog_categories
ORDER BY name;

-- ============================================================================
-- TEST THE EXACT VERIFICATION LOGIC FROM STEP 3
-- ============================================================================

-- Test the exact query that's failing in Step 3
SELECT 
    'VERIFICATION_TEST' as check_type,
    EXISTS (SELECT 1 FROM blog_categories WHERE id = '550e8400-e29b-41d4-a716-446655440001') as business_acquisition_exists,
    EXISTS (SELECT 1 FROM blog_categories WHERE id = '550e8400-e29b-41d4-a716-446655440002') as market_analysis_exists,
    EXISTS (SELECT 1 FROM blog_categories WHERE id = '550e8400-e29b-41d4-a716-446655440003') as due_diligence_exists;

-- Test with explicit UUID casting
SELECT 
    'VERIFICATION_WITH_CASTING' as check_type,
    EXISTS (SELECT 1 FROM blog_categories WHERE id = '550e8400-e29b-41d4-a716-446655440001'::uuid) as business_acquisition_exists,
    EXISTS (SELECT 1 FROM blog_categories WHERE id = '550e8400-e29b-41d4-a716-446655440002'::uuid) as market_analysis_exists,
    EXISTS (SELECT 1 FROM blog_categories WHERE id = '550e8400-e29b-41d4-a716-446655440003'::uuid) as due_diligence_exists;

-- ============================================================================
-- CHECK FOR POTENTIAL ISSUES
-- ============================================================================

-- Check if there are any duplicate slugs or IDs
SELECT 
    'DUPLICATE_CHECK' as check_type,
    slug,
    COUNT(*) as count,
    CASE WHEN COUNT(*) > 1 THEN '❌ DUPLICATE' ELSE '✅ UNIQUE' END as status
FROM blog_categories
GROUP BY slug
HAVING COUNT(*) > 1;

-- Check if IDs match exactly what we expect
SELECT
    'ID_MATCH_CHECK' as check_type,
    expected.expected_id,
    bc.id as actual_id,
    expected.expected_name,
    bc.name as actual_name,
    CASE
        WHEN bc.id IS NULL THEN '❌ CATEGORY_NOT_FOUND'
        WHEN expected.expected_id = bc.id THEN '✅ MATCH'
        ELSE '❌ MISMATCH'
    END as status
FROM (
    VALUES
        ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Business Acquisition'),
        ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Market Analysis'),
        ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'Due Diligence'),
        ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'Financing'),
        ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'Legal & Compliance'),
        ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'Success Stories')
) AS expected(expected_id, expected_name)
LEFT JOIN blog_categories bc ON bc.name = expected.expected_name;

-- ============================================================================
-- SIMPLIFIED ID COMPARISON
-- ============================================================================

-- Simple comparison showing expected vs actual IDs side by side
SELECT
    'SIMPLE_ID_COMPARISON' as check_type,
    'Expected: 550e8400-e29b-41d4-a716-446655440001' as expected_business_acquisition,
    'Actual: ' || COALESCE(
        (SELECT id::text FROM blog_categories WHERE name = 'Business Acquisition'),
        'NOT_FOUND'
    ) as actual_business_acquisition,
    'Expected: 550e8400-e29b-41d4-a716-446655440002' as expected_market_analysis,
    'Actual: ' || COALESCE(
        (SELECT id::text FROM blog_categories WHERE name = 'Market Analysis'),
        'NOT_FOUND'
    ) as actual_market_analysis,
    'Expected: 550e8400-e29b-41d4-a716-446655440003' as expected_due_diligence,
    'Actual: ' || COALESCE(
        (SELECT id::text FROM blog_categories WHERE name = 'Due Diligence'),
        'NOT_FOUND'
    ) as actual_due_diligence;

-- ============================================================================
-- ALTERNATIVE VERIFICATION APPROACHES
-- ============================================================================

-- Try finding by name instead of ID
SELECT 
    'FIND_BY_NAME' as check_type,
    id,
    name,
    '✅ FOUND_BY_NAME' as status
FROM blog_categories
WHERE name IN ('Business Acquisition', 'Market Analysis', 'Due Diligence')
ORDER BY name;

-- Try finding by slug instead of ID
SELECT 
    'FIND_BY_SLUG' as check_type,
    id,
    name,
    slug,
    '✅ FOUND_BY_SLUG' as status
FROM blog_categories
WHERE slug IN ('business-acquisition', 'market-analysis', 'due-diligence')
ORDER BY name;

-- ============================================================================
-- GENERATE CORRECTED VERIFICATION LOGIC
-- ============================================================================

-- Generate the correct verification statements based on actual data
SELECT 
    'CORRECTED_VERIFICATION' as result,
    'IF NOT EXISTS (SELECT 1 FROM blog_categories WHERE id = ''' || id::text || ''') THEN' as verification_statement,
    '    RAISE EXCEPTION ''' || name || ' category not found. Please run STEP 1 first.'';' as error_statement,
    'END IF;' as end_statement
FROM blog_categories
WHERE name IN ('Business Acquisition', 'Market Analysis', 'Due Diligence')
ORDER BY name;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT '🔍 CATEGORY MISMATCH DIAGNOSIS COMPLETE' as status;
SELECT 'Check the results above to identify the exact issue' as instruction;
SELECT 'Look for MISMATCH or DUPLICATE entries' as focus_area;
