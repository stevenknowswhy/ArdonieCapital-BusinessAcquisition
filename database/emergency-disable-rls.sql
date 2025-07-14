-- EMERGENCY RLS BYPASS - Use only for immediate testing
-- This script temporarily disables RLS to allow CMS testing
-- WARNING: This removes security restrictions - use only for debugging

-- Disable RLS on all affected tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'content_pages', 'blog_categories', 'documents', 'deals', 'vendors', 'vendor_reviews');

SELECT 'RLS temporarily disabled for testing - REMEMBER TO RE-ENABLE AFTER FIXING POLICIES' as warning;
