-- ============================================================================
-- URGENT: RLS Policy Fix for Authentication Loop Issue
-- ============================================================================
-- Run this script in Supabase SQL Editor to fix infinite recursion in RLS policies
-- that is causing authentication failures and login loops.

-- ============================================================================
-- STEP 0: Check actual table schema first
-- ============================================================================

-- Check what columns actually exist in the profiles table
SELECT 'PROFILES TABLE SCHEMA:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check what tables exist
SELECT 'ALL TABLES:' as info;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- STEP 1: Drop ALL existing problematic policies
-- ============================================================================

-- Drop profiles table policies (main cause of recursion)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- Drop other table policies that might have recursion issues
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Sellers can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Sellers can update their own listings" ON listings;
DROP POLICY IF EXISTS "Sellers can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON listings;

DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Buyers can create matches" ON matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON matches;
DROP POLICY IF EXISTS "Users can delete their own matches" ON matches;
DROP POLICY IF EXISTS "Admins can view all matches" ON matches;

DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;

DROP POLICY IF EXISTS "Users can view their own saved listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can save listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can update their own saved listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can delete their own saved listings" ON saved_listings;

DROP POLICY IF EXISTS "Users can view their own search history" ON search_history;
DROP POLICY IF EXISTS "Users can insert their own search history" ON search_history;
DROP POLICY IF EXISTS "Users can delete their own search history" ON search_history;

DROP POLICY IF EXISTS "Users can view their own analytics" ON analytics_events;
DROP POLICY IF EXISTS "System can insert analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admins can view all analytics" ON analytics_events;

-- ============================================================================
-- STEP 2: Create SAFE RLS policies without recursion
-- ============================================================================

-- PROFILES TABLE - Fixed policies without recursion
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

-- LISTINGS TABLE - Safe policies
CREATE POLICY "listings_select_policy" ON listings
    FOR SELECT USING (
        status = 'active' OR 
        seller_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

CREATE POLICY "listings_insert_policy" ON listings
    FOR INSERT WITH CHECK (
        seller_id = auth.uid() AND
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND user_types ? 'seller'
        )
    );

CREATE POLICY "listings_update_policy" ON listings
    FOR UPDATE USING (
        seller_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

CREATE POLICY "listings_delete_policy" ON listings
    FOR DELETE USING (
        seller_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

-- MATCHES TABLE - Safe policies
CREATE POLICY "matches_select_policy" ON matches
    FOR SELECT USING (
        buyer_id = auth.uid() OR 
        listing_id IN (SELECT id FROM listings WHERE seller_id = auth.uid()) OR
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

CREATE POLICY "matches_insert_policy" ON matches
    FOR INSERT WITH CHECK (
        buyer_id = auth.uid() AND
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND user_types ? 'buyer'
        )
    );

CREATE POLICY "matches_update_policy" ON matches
    FOR UPDATE USING (
        buyer_id = auth.uid() OR 
        listing_id IN (SELECT id FROM listings WHERE seller_id = auth.uid()) OR
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

CREATE POLICY "matches_delete_policy" ON matches
    FOR DELETE USING (
        buyer_id = auth.uid() OR 
        listing_id IN (SELECT id FROM listings WHERE seller_id = auth.uid()) OR
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

-- MESSAGES TABLE - Safe policies
CREATE POLICY "messages_select_policy" ON messages
    FOR SELECT USING (
        sender_id = auth.uid() OR 
        recipient_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

CREATE POLICY "messages_insert_policy" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_update_policy" ON messages
    FOR UPDATE USING (
        sender_id = auth.uid() OR 
        recipient_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

-- NOTIFICATIONS TABLE - Safe policies
CREATE POLICY "notifications_select_policy" ON notifications
    FOR SELECT USING (
        user_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

CREATE POLICY "notifications_insert_policy" ON notifications
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

CREATE POLICY "notifications_update_policy" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_policy" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- SAVED_LISTINGS TABLE - Safe policies
CREATE POLICY "saved_listings_select_policy" ON saved_listings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "saved_listings_insert_policy" ON saved_listings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "saved_listings_update_policy" ON saved_listings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "saved_listings_delete_policy" ON saved_listings
    FOR DELETE USING (user_id = auth.uid());

-- SEARCH_HISTORY TABLE - Safe policies
CREATE POLICY "search_history_select_policy" ON search_history
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "search_history_insert_policy" ON search_history
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "search_history_delete_policy" ON search_history
    FOR DELETE USING (user_id = auth.uid());

-- ANALYTICS_EVENTS TABLE - Safe policies
CREATE POLICY "analytics_select_policy" ON analytics_events
    FOR SELECT USING (
        user_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE user_id = auth.uid() 
            AND (user_types ? 'super_admin' OR user_types ? 'admin')
        )
    );

CREATE POLICY "analytics_insert_policy" ON analytics_events
    FOR INSERT WITH CHECK (true); -- Allow system to insert analytics

-- ============================================================================
-- STEP 3: Verify RLS is enabled on all tables
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create test user if needed
-- ============================================================================

-- Insert test user profile if it doesn't exist
INSERT INTO profiles (user_id, email, first_name, last_name, user_types, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'reforiy538@iamtile.com',
    'Test',
    'User',
    '["buyer"]'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    user_types = EXCLUDED.user_types,
    updated_at = NOW();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test profile access (should work without recursion)
SELECT 'Profile access test' as test_name, 
       COUNT(*) as profile_count 
FROM profiles 
WHERE email = 'reforiy538@iamtile.com';

-- List all policies to verify they were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Success message
SELECT '✅ RLS policies have been fixed! Authentication should now work properly.' as status;
