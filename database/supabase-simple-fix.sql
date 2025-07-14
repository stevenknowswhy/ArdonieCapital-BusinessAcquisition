-- ============================================================================
-- SIMPLE RLS FIX: Emergency Authentication Fix
-- ============================================================================
-- This script fixes authentication issues by creating simple, safe RLS policies

-- ============================================================================
-- STEP 1: Check what we're working with
-- ============================================================================

-- Check profiles table schema
SELECT 'PROFILES TABLE COLUMNS:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check existing policies
SELECT 'EXISTING POLICIES:' as info;
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- ============================================================================
-- STEP 2: Emergency fix - Drop all existing policies
-- ============================================================================

-- Drop ALL existing policies on profiles table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON profiles';
    END LOOP;
END $$;

-- Drop policies on other tables that might cause issues
DO $$
DECLARE
    policy_record RECORD;
    table_name TEXT;
BEGIN
    FOR table_name IN VALUES ('listings'), ('matches'), ('messages'), ('notifications'), ('saved_listings'), ('search_history'), ('analytics_events')
    LOOP
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = table_name
        LOOP
            EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON ' || table_name;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 3: Create SIMPLE, SAFE policies
-- ============================================================================

-- PROFILES TABLE - Ultra-simple policies
-- Allow users to see their own profile and admins to see all
CREATE POLICY "profiles_select_simple" ON profiles
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid()::text = 'admin_user_id'  -- Replace with actual admin user ID if needed
    );

-- Allow users to insert their own profile
CREATE POLICY "profiles_insert_simple" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_simple" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "profiles_delete_simple" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Handle other tables with simple policies
-- ============================================================================

-- LISTINGS TABLE (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listings') THEN
        -- Simple listing policies
        EXECUTE 'CREATE POLICY "listings_select_simple" ON listings FOR SELECT USING (true)';  -- Allow all to view
        EXECUTE 'CREATE POLICY "listings_insert_simple" ON listings FOR INSERT WITH CHECK (seller_id = auth.uid())';
        EXECUTE 'CREATE POLICY "listings_update_simple" ON listings FOR UPDATE USING (seller_id = auth.uid())';
        EXECUTE 'CREATE POLICY "listings_delete_simple" ON listings FOR DELETE USING (seller_id = auth.uid())';
    END IF;
END $$;

-- MATCHES TABLE (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches') THEN
        EXECUTE 'CREATE POLICY "matches_select_simple" ON matches FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid())';
        EXECUTE 'CREATE POLICY "matches_insert_simple" ON matches FOR INSERT WITH CHECK (buyer_id = auth.uid())';
        EXECUTE 'CREATE POLICY "matches_update_simple" ON matches FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid())';
        EXECUTE 'CREATE POLICY "matches_delete_simple" ON matches FOR DELETE USING (buyer_id = auth.uid() OR seller_id = auth.uid())';
    END IF;
END $$;

-- MESSAGES TABLE (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
        EXECUTE 'CREATE POLICY "messages_select_simple" ON messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid())';
        EXECUTE 'CREATE POLICY "messages_insert_simple" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid())';
        EXECUTE 'CREATE POLICY "messages_update_simple" ON messages FOR UPDATE USING (sender_id = auth.uid())';
    END IF;
END $$;

-- NOTIFICATIONS TABLE (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        EXECUTE 'CREATE POLICY "notifications_select_simple" ON notifications FOR SELECT USING (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "notifications_insert_simple" ON notifications FOR INSERT WITH CHECK (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "notifications_update_simple" ON notifications FOR UPDATE USING (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "notifications_delete_simple" ON notifications FOR DELETE USING (user_id = auth.uid())';
    END IF;
END $$;

-- SAVED_LISTINGS TABLE (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_listings') THEN
        EXECUTE 'CREATE POLICY "saved_listings_select_simple" ON saved_listings FOR SELECT USING (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "saved_listings_insert_simple" ON saved_listings FOR INSERT WITH CHECK (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "saved_listings_update_simple" ON saved_listings FOR UPDATE USING (user_id = auth.uid())';
        EXECUTE 'CREATE POLICY "saved_listings_delete_simple" ON saved_listings FOR DELETE USING (user_id = auth.uid())';
    END IF;
END $$;

-- ============================================================================
-- STEP 5: Ensure RLS is enabled
-- ============================================================================

-- Enable RLS on profiles (main table)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other tables if they exist
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN VALUES ('listings'), ('matches'), ('messages'), ('notifications'), ('saved_listings'), ('search_history'), ('analytics_events')
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = table_name) THEN
            EXECUTE 'ALTER TABLE ' || table_name || ' ENABLE ROW LEVEL SECURITY';
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 6: Test the fix
-- ============================================================================

-- Test profile access
SELECT 'TESTING PROFILE ACCESS:' as test;
SELECT COUNT(*) as profile_count FROM profiles;

-- Show final policies
SELECT 'FINAL POLICIES:' as info;
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ Simple RLS policies applied! Authentication should work now.' as status;

-- ============================================================================
-- STEP 7: Create test user if needed
-- ============================================================================

-- Insert test user (adjust columns based on your actual schema)
INSERT INTO profiles (user_id, email, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'reforiy538@iamtile.com',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

SELECT '✅ Test user created/updated.' as status;
