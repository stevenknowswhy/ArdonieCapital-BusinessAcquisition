-- Check Current Database State
-- Run this to see what tables exist and their RLS status

-- ============================================================================
-- CHECK TABLE EXISTENCE AND RLS STATUS
-- ============================================================================

-- Check which tables exist
SELECT 
    'TABLE_EXISTS' as check_type,
    tablename,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('messages', 'notifications', 'saved_listings', 'search_history', 'analytics_events', 'content_pages', 'blog_categories', 'profiles')
ORDER BY tablename;

-- ============================================================================
-- CHECK EXISTING POLICIES
-- ============================================================================

-- Check existing policies for each table
SELECT 
    'EXISTING_POLICIES' as check_type,
    tablename,
    policyname,
    cmd as policy_type
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('messages', 'notifications', 'saved_listings', 'search_history', 'analytics_events')
ORDER BY tablename, policyname;

-- ============================================================================
-- CHECK COLUMN NAMES FOR USER REFERENCES
-- ============================================================================

-- Check saved_listings columns
SELECT 
    'SAVED_LISTINGS_COLUMNS' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'saved_listings'
AND column_name LIKE '%_id'
ORDER BY column_name;

-- Check search_history columns
SELECT 
    'SEARCH_HISTORY_COLUMNS' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'search_history'
AND column_name LIKE '%_id'
ORDER BY column_name;

-- Check analytics_events columns
SELECT 
    'ANALYTICS_EVENTS_COLUMNS' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'analytics_events'
AND column_name LIKE '%_id'
ORDER BY column_name;

-- Check messages columns
SELECT 
    'MESSAGES_COLUMNS' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'messages'
AND column_name LIKE '%_id'
ORDER BY column_name;

-- Check notifications columns
SELECT 
    'NOTIFICATIONS_COLUMNS' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notifications'
AND column_name LIKE '%_id'
ORDER BY column_name;

-- ============================================================================
-- CHECK CMS TABLES
-- ============================================================================

-- Check if CMS tables exist
SELECT 
    'CMS_TABLES' as check_type,
    tablename,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('content_pages', 'blog_categories')
ORDER BY tablename;

-- Check content_pages count
SELECT 
    'CONTENT_PAGES_COUNT' as check_type,
    COUNT(*) as post_count
FROM content_pages;

-- Check blog_categories count
SELECT 
    'BLOG_CATEGORIES_COUNT' as check_type,
    COUNT(*) as category_count
FROM blog_categories;

-- ============================================================================
-- CHECK USER PERMISSIONS
-- ============================================================================

-- Check if the test user exists and has proper role
SELECT 
    'USER_PERMISSIONS' as check_type,
    au.email,
    p.role,
    p.first_name,
    p.last_name
FROM profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'reforiy538@iamtile.com';

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT '📊 DATABASE STATE SUMMARY' as summary;
SELECT 'Run this script to understand current state before applying fixes' as instruction;
