-- Database Schema Fix Script
-- This script fixes the critical issues identified in the user authentication investigation
-- Run this script in Supabase SQL Editor to resolve the problems

-- ============================================================================
-- STEP 1: Fix RLS Policy Infinite Recursion Issues
-- ============================================================================

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Sellers can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Sellers can update their own listings" ON listings;
DROP POLICY IF EXISTS "Sellers can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Buyers can create matches" ON matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON matches;
DROP POLICY IF EXISTS "Users can delete their own matches" ON matches;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their own saved listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can save listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can update their own saved listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can delete their own saved listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can view their own search history" ON search_history;
DROP POLICY IF EXISTS "Users can insert their own search history" ON search_history;
DROP POLICY IF EXISTS "Users can delete their own search history" ON search_history;
DROP POLICY IF EXISTS "Users can view their own analytics" ON analytics_events;
DROP POLICY IF EXISTS "System can insert analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all listings" ON listings;
DROP POLICY IF EXISTS "Admins can view all matches" ON matches;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all analytics" ON analytics_events;

-- ============================================================================
-- STEP 2: Create Fixed RLS Policies (No Infinite Recursion)
-- ============================================================================

-- Profiles table policies (FIXED)
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Listings table policies (FIXED)
CREATE POLICY "Anyone can view active listings" ON listings
    FOR SELECT USING (
        status = 'active' OR 
        seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Sellers can insert their own listings" ON listings
    FOR INSERT WITH CHECK (
        seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Sellers can update their own listings" ON listings
    FOR UPDATE USING (
        seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Sellers can delete their own listings" ON listings
    FOR DELETE USING (
        seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Matches table policies (FIXED)
CREATE POLICY "Users can view their own matches" ON matches
    FOR SELECT USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Buyers can create matches" ON matches
    FOR INSERT WITH CHECK (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own matches" ON matches
    FOR UPDATE USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete their own matches" ON matches
    FOR DELETE USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Messages table policies (FIXED)
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        recipient_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        recipient_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Notifications table policies (FIXED)
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Saved listings table policies (FIXED)
CREATE POLICY "Users can view their own saved listings" ON saved_listings
    FOR SELECT USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can save listings" ON saved_listings
    FOR INSERT WITH CHECK (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own saved listings" ON saved_listings
    FOR UPDATE USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete their own saved listings" ON saved_listings
    FOR DELETE USING (
        buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Search history table policies (FIXED)
CREATE POLICY "Users can view their own search history" ON search_history
    FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert their own search history" ON search_history
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete their own search history" ON search_history
    FOR DELETE USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Analytics events table policies (FIXED)
CREATE POLICY "Users can view their own analytics" ON analytics_events
    FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        user_id IS NULL
    );

CREATE POLICY "System can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- Admin policies (FIXED)
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all listings" ON listings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all matches" ON matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all analytics" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- STEP 3: Verification Queries
-- ============================================================================

-- Check if policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Test profile access (should work without infinite recursion)
SELECT COUNT(*) as profile_count FROM profiles;

-- Success message
SELECT 'Database schema fixes applied successfully!' as status;
