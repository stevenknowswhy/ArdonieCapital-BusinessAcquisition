-- Row Level Security Policies for Ardonie Capital Database
-- These policies ensure users can only access data they're authorized to see

-- Profiles table policies
-- Users can view all profiles but only update their own
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Listings table policies
-- All users can view active listings, but only sellers can manage their own
CREATE POLICY "Anyone can view active listings" ON listings
    FOR SELECT USING (
        status = 'active' OR 
        (auth.uid() IN (SELECT user_id FROM profiles WHERE id = seller_id))
    );

CREATE POLICY "Sellers can insert their own listings" ON listings
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = seller_id)
    );

CREATE POLICY "Sellers can update their own listings" ON listings
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = seller_id)
    );

CREATE POLICY "Sellers can delete their own listings" ON listings
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = seller_id)
    );

-- Matches table policies
-- Users can only see matches involving them
CREATE POLICY "Users can view their own matches" ON matches
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE id = buyer_id OR id = seller_id
        )
    );

CREATE POLICY "Buyers can create matches" ON matches
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = buyer_id)
    );

CREATE POLICY "Users can update their own matches" ON matches
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE id = buyer_id OR id = seller_id
        )
    );

CREATE POLICY "Users can delete their own matches" ON matches
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE id = buyer_id OR id = seller_id
        )
    );

-- Messages table policies
-- Users can only see messages they sent or received
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE id = sender_id OR id = recipient_id
        )
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = sender_id)
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE id = sender_id OR id = recipient_id
        )
    );

-- Notifications table policies
-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id)
    );

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id)
    );

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id)
    );

-- Saved listings table policies
-- Users can only manage their own saved listings
CREATE POLICY "Users can view their own saved listings" ON saved_listings
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = buyer_id)
    );

CREATE POLICY "Users can save listings" ON saved_listings
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = buyer_id)
    );

CREATE POLICY "Users can update their own saved listings" ON saved_listings
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = buyer_id)
    );

CREATE POLICY "Users can delete their own saved listings" ON saved_listings
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = buyer_id)
    );

-- Search history table policies
-- Users can only see their own search history
CREATE POLICY "Users can view their own search history" ON search_history
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id)
    );

CREATE POLICY "Users can insert their own search history" ON search_history
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id)
    );

CREATE POLICY "Users can delete their own search history" ON search_history
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id)
    );

-- Analytics events table policies
-- Users can only see their own analytics data
CREATE POLICY "Users can view their own analytics" ON analytics_events
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id) OR
        user_id IS NULL
    );

CREATE POLICY "System can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- Admin policies (for users with admin role)
-- Admins can view and manage all data
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all listings" ON listings
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can view all matches" ON matches
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can view all messages" ON messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can view all analytics" ON analytics_events
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE role = 'admin'
        )
    );
