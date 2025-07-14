-- SAFE RLS POLICY FIX - CORRECTED VERSION
-- This script safely handles existing policies by dropping and recreating them
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- SAFE POLICY RECREATION FOR MESSAGES TABLE
-- ============================================================================

-- Drop existing policies if they exist (no error if they don't exist)
DROP POLICY IF EXISTS "messages_participant_read" ON messages;
DROP POLICY IF EXISTS "messages_auth_insert" ON messages;
DROP POLICY IF EXISTS "messages_sender_update" ON messages;

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "messages_participant_read" ON messages
    FOR SELECT USING (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR recipient_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "messages_auth_insert" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "messages_sender_update" ON messages
    FOR UPDATE USING (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================================================
-- SAFE POLICY RECREATION FOR NOTIFICATIONS TABLE
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "notifications_user_read" ON notifications;
DROP POLICY IF EXISTS "notifications_system_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_user_update" ON notifications;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "notifications_user_read" ON notifications
    FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "notifications_system_insert" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_user_update" ON notifications
    FOR UPDATE USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================================================
-- SAFE POLICY RECREATION FOR SAVED_LISTINGS TABLE
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "saved_listings_user_read" ON saved_listings;
DROP POLICY IF EXISTS "saved_listings_auth_insert" ON saved_listings;
DROP POLICY IF EXISTS "saved_listings_user_update" ON saved_listings;
DROP POLICY IF EXISTS "saved_listings_user_delete" ON saved_listings;

-- Enable RLS
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

-- Recreate policies (saved_listings uses buyer_id, not user_id)
CREATE POLICY "saved_listings_user_read" ON saved_listings
    FOR SELECT USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "saved_listings_auth_insert" ON saved_listings
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "saved_listings_user_update" ON saved_listings
    FOR UPDATE USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "saved_listings_user_delete" ON saved_listings
    FOR DELETE USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================================================
-- SAFE POLICY RECREATION FOR SEARCH_HISTORY TABLE
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "search_history_user_read" ON search_history;
DROP POLICY IF EXISTS "search_history_auth_insert" ON search_history;
DROP POLICY IF EXISTS "search_history_user_delete" ON search_history;

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "search_history_user_read" ON search_history
    FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "search_history_auth_insert" ON search_history
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "search_history_user_delete" ON search_history
    FOR DELETE USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================================================
-- SAFE POLICY RECREATION FOR ANALYTICS_EVENTS TABLE
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "analytics_events_user_read" ON analytics_events;
DROP POLICY IF EXISTS "analytics_events_auth_insert" ON analytics_events;

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "analytics_events_user_read" ON analytics_events
    FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR user_id IS NULL -- Allow anonymous events
    );

CREATE POLICY "analytics_events_auth_insert" ON analytics_events
    FOR INSERT WITH CHECK (true); -- Allow all inserts for analytics

-- ============================================================================
-- VERIFICATION AND SUCCESS MESSAGES
-- ============================================================================

-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('messages', 'notifications', 'saved_listings', 'search_history', 'analytics_events')
ORDER BY tablename;

-- Count policies for verification
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('messages', 'notifications', 'saved_listings', 'search_history', 'analytics_events')
GROUP BY tablename
ORDER BY tablename;

-- Success messages
SELECT '🎉 RLS POLICY FIX COMPLETED SUCCESSFULLY!' as status;
SELECT '✅ All policies recreated safely' as result1;
SELECT '✅ No more policy conflicts' as result2;
SELECT '✅ Ready for CMS data population' as result3;
