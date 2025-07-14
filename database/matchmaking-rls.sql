-- Row Level Security Policies for Matchmaking System
-- Ensures secure access to match data, preferences, and feedback

-- ============================================================================
-- MATCHES TABLE POLICIES
-- ============================================================================

-- Policy: Buyers can view matches where they are the buyer
CREATE POLICY "Buyers can view their matches" ON matches
    FOR SELECT USING (
        buyer_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Sellers can view matches where they are the seller
CREATE POLICY "Sellers can view their matches" ON matches
    FOR SELECT USING (
        seller_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: System can create matches (for algorithm)
CREATE POLICY "System can create matches" ON matches
    FOR INSERT WITH CHECK (true);

-- Policy: Match participants can update match status
CREATE POLICY "Match participants can update matches" ON matches
    FOR UPDATE USING (
        buyer_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR seller_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        buyer_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR seller_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Admins can view all matches
CREATE POLICY "Admins can view all matches" ON matches
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Policy: Only admins can delete matches
CREATE POLICY "Admins can delete matches" ON matches
    FOR DELETE USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- USER PREFERENCES TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can create their own preferences
CREATE POLICY "Users can create their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete their own preferences
CREATE POLICY "Users can delete their own preferences" ON user_preferences
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Admins can view all preferences
CREATE POLICY "Admins can view all preferences" ON user_preferences
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- MATCH FEEDBACK TABLE POLICIES
-- ============================================================================

-- Policy: Users can view feedback for matches they're involved in
CREATE POLICY "Users can view relevant match feedback" ON match_feedback
    FOR SELECT USING (
        match_id IN (
            SELECT id FROM matches WHERE 
            buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Policy: Users can provide feedback for matches they're involved in
CREATE POLICY "Users can provide match feedback" ON match_feedback
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        AND match_id IN (
            SELECT id FROM matches WHERE 
            buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Policy: Users can update their own feedback
CREATE POLICY "Users can update their own feedback" ON match_feedback
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete their own feedback
CREATE POLICY "Users can delete their own feedback" ON match_feedback
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Admins can view all feedback
CREATE POLICY "Admins can view all feedback" ON match_feedback
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- MATCH INTERACTIONS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view interactions for matches they're involved in
CREATE POLICY "Users can view relevant match interactions" ON match_interactions
    FOR SELECT USING (
        match_id IN (
            SELECT id FROM matches WHERE 
            buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Policy: Users can create interactions for matches they're involved in
CREATE POLICY "Users can create match interactions" ON match_interactions
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        AND match_id IN (
            SELECT id FROM matches WHERE 
            buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Policy: Admins can view all interactions
CREATE POLICY "Admins can view all interactions" ON match_interactions
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- MATCH SCORES TABLE POLICIES
-- ============================================================================

-- Policy: Users can view scores for matches they're involved in
CREATE POLICY "Users can view relevant match scores" ON match_scores
    FOR SELECT USING (
        match_id IN (
            SELECT id FROM matches WHERE 
            buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Policy: System can create and update match scores
CREATE POLICY "System can manage match scores" ON match_scores
    FOR ALL USING (true) WITH CHECK (true);

-- Policy: Admins can view all match scores
CREATE POLICY "Admins can view all match scores" ON match_scores
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- ALGORITHM LEARNING DATA TABLE POLICIES
-- ============================================================================

-- Policy: System can create learning data
CREATE POLICY "System can create learning data" ON algorithm_learning_data
    FOR INSERT WITH CHECK (true);

-- Policy: Admins can view all learning data
CREATE POLICY "Admins can view all learning data" ON algorithm_learning_data
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Policy: System can update learning data
CREATE POLICY "System can update learning data" ON algorithm_learning_data
    FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================================
-- MATCH ANALYTICS TABLE POLICIES
-- ============================================================================

-- Policy: Admins can view all analytics
CREATE POLICY "Admins can view all analytics" ON match_analytics
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Policy: System can manage analytics
CREATE POLICY "System can manage analytics" ON match_analytics
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS FOR MATCHMAKING ACCESS CONTROL
-- ============================================================================

-- Function to check if user is involved in a match
CREATE OR REPLACE FUNCTION user_involved_in_match(match_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM matches 
        WHERE id = match_uuid 
        AND (
            buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in a match
CREATE OR REPLACE FUNCTION get_user_match_role(match_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_profile_id UUID;
    match_record RECORD;
BEGIN
    -- Get current user's profile ID
    SELECT id INTO user_profile_id 
    FROM profiles 
    WHERE user_id = auth.uid();
    
    -- Get match information
    SELECT buyer_id, seller_id 
    INTO match_record
    FROM matches 
    WHERE id = match_uuid;
    
    -- Determine user's role in the match
    IF match_record.buyer_id = user_profile_id THEN
        RETURN 'buyer';
    ELSIF match_record.seller_id = user_profile_id THEN
        RETURN 'seller';
    ELSE
        RETURN 'none';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can provide feedback for a match
CREATE OR REPLACE FUNCTION user_can_provide_feedback(match_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM matches 
        WHERE id = match_uuid 
        AND (
            buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
        AND status IN ('viewed', 'interested', 'contacted', 'meeting_scheduled', 'in_negotiation', 'deal_created')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if match has expired
CREATE OR REPLACE FUNCTION is_match_expired(match_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    match_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT expires_at INTO match_expires_at
    FROM matches 
    WHERE id = match_uuid;
    
    RETURN match_expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get match compatibility details
CREATE OR REPLACE FUNCTION get_match_compatibility_details(match_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    match_record RECORD;
    score_record RECORD;
    result JSONB;
BEGIN
    -- Get match and score information
    SELECT m.*, ms.* 
    INTO match_record
    FROM matches m
    LEFT JOIN match_scores ms ON m.id = ms.match_id
    WHERE m.id = match_uuid;
    
    -- Build result JSON
    result := jsonb_build_object(
        'compatibility_score', match_record.compatibility_score,
        'quality_score', match_record.quality_score,
        'match_reasons', match_record.match_reasons,
        'detailed_scores', jsonb_build_object(
            'business_type_score', match_record.business_type_score,
            'price_range_score', match_record.price_range_score,
            'location_score', match_record.location_score,
            'experience_score', match_record.experience_score,
            'timeline_score', match_record.timeline_score,
            'financing_score', match_record.financing_score,
            'revenue_range_score', match_record.revenue_range_score
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
