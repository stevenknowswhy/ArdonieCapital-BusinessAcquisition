-- Fixed Row Level Security Policies for Ardonie Capital Database
-- This file fixes the infinite recursion issues in the original RLS policies

-- First, drop all existing policies to avoid conflicts
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

-- FIXED Profiles table policies
-- Users can view all profiles but only update their own
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- FIXED Listings table policies
-- All users can view active listings, but only sellers can manage their own
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

-- FIXED Matches table policies
-- Users can only see matches involving them
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

-- FIXED Messages table policies
-- Users can only see messages they sent or received
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

-- FIXED Notifications table policies
-- Users can only see their own notifications
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

-- FIXED Saved listings table policies
-- Users can only manage their own saved listings
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

-- FIXED Search history table policies
-- Users can only see their own search history
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

-- FIXED Analytics events table policies
-- Users can only see their own analytics data
CREATE POLICY "Users can view their own analytics" ON analytics_events
    FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        user_id IS NULL
    );

CREATE POLICY "System can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- FIXED Admin policies (for users with admin role)
-- Admins can view and manage all data
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
