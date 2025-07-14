-- ============================================================================
-- EMERGENCY BYPASS: Temporarily Disable RLS for Testing
-- ============================================================================
-- Use this ONLY if the main fix doesn't work and you need immediate access
-- Remember to re-enable RLS after testing!

-- ============================================================================
-- STEP 1: Check what tables exist first
-- ============================================================================

-- Check what tables we have
SELECT 'EXISTING TABLES:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check profiles table schema
SELECT 'PROFILES SCHEMA:' as info;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles' ORDER BY ordinal_position;

-- ============================================================================
-- OPTION 1: Temporarily disable RLS on profiles table only
-- ============================================================================

-- Disable RLS on profiles table (TEMPORARY)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test query to verify access
SELECT 'Emergency bypass active - profiles table accessible' as status,
       COUNT(*) as profile_count 
FROM profiles;

-- ============================================================================
-- OPTION 2: Create a super permissive policy for testing
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "emergency_bypass_policy" ON profiles;

-- Create emergency bypass policy (allows all operations)
CREATE POLICY "emergency_bypass_policy" ON profiles
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- OPTION 3: Complete RLS disable (LAST RESORT)
-- ============================================================================

-- Uncomment these lines ONLY if absolutely necessary:
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE saved_listings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TO RE-ENABLE RLS AFTER TESTING
-- ============================================================================

-- Re-enable RLS when ready:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "emergency_bypass_policy" ON profiles;

-- Then run the main supabase-rls-fix.sql script

SELECT '⚠️ Emergency bypass applied. Remember to re-enable RLS and apply proper policies!' as warning;
