-- Row Level Security Policies for Enhanced Marketplace
-- Ensures secure access to inquiry, analytics, and engagement data

-- ============================================================================
-- LISTING INQUIRIES TABLE POLICIES
-- ============================================================================

-- Policy: Buyers can view their own inquiries
CREATE POLICY "Buyers can view their own inquiries" ON listing_inquiries
    FOR SELECT USING (
        buyer_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Sellers can view inquiries for their listings
CREATE POLICY "Sellers can view inquiries for their listings" ON listing_inquiries
    FOR SELECT USING (
        seller_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Buyers can create inquiries
CREATE POLICY "Buyers can create inquiries" ON listing_inquiries
    FOR INSERT WITH CHECK (
        buyer_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Inquiry participants can update inquiries
CREATE POLICY "Inquiry participants can update inquiries" ON listing_inquiries
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

-- Policy: Admins can view all inquiries
CREATE POLICY "Admins can view all inquiries" ON listing_inquiries
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- INQUIRY RESPONSES TABLE POLICIES
-- ============================================================================

-- Policy: Inquiry participants can view responses
CREATE POLICY "Inquiry participants can view responses" ON inquiry_responses
    FOR SELECT USING (
        inquiry_id IN (
            SELECT id FROM listing_inquiries WHERE 
            buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Policy: Inquiry participants can create responses
CREATE POLICY "Inquiry participants can create responses" ON inquiry_responses
    FOR INSERT WITH CHECK (
        responder_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        AND inquiry_id IN (
            SELECT id FROM listing_inquiries WHERE 
            buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Policy: Response authors can update their responses
CREATE POLICY "Response authors can update responses" ON inquiry_responses
    FOR UPDATE USING (
        responder_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        responder_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Admins can view all responses
CREATE POLICY "Admins can view all responses" ON inquiry_responses
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- LISTING VIEWS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own view history
CREATE POLICY "Users can view their own view history" ON listing_views
    FOR SELECT USING (
        viewer_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Listing owners can view views of their listings
CREATE POLICY "Listing owners can view listing views" ON listing_views
    FOR SELECT USING (
        listing_id IN (
            SELECT id FROM listings WHERE seller_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Policy: Anyone can create view records (for analytics)
CREATE POLICY "Anyone can create view records" ON listing_views
    FOR INSERT WITH CHECK (true);

-- Policy: Admins can view all view records
CREATE POLICY "Admins can view all view records" ON listing_views
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- LISTING ENGAGEMENT TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own engagement history
CREATE POLICY "Users can view their own engagement" ON listing_engagement
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Listing owners can view engagement on their listings
CREATE POLICY "Listing owners can view listing engagement" ON listing_engagement
    FOR SELECT USING (
        listing_id IN (
            SELECT id FROM listings WHERE seller_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Policy: Anyone can create engagement records (for analytics)
CREATE POLICY "Anyone can create engagement records" ON listing_engagement
    FOR INSERT WITH CHECK (true);

-- Policy: Admins can view all engagement records
CREATE POLICY "Admins can view all engagement records" ON listing_engagement
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- SAVED LISTINGS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own saved listings
CREATE POLICY "Users can view their own saved listings" ON saved_listings
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can save listings
CREATE POLICY "Users can save listings" ON saved_listings
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can update their own saved listings
CREATE POLICY "Users can update their own saved listings" ON saved_listings
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete their own saved listings
CREATE POLICY "Users can delete their own saved listings" ON saved_listings
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Admins can view all saved listings
CREATE POLICY "Admins can view all saved listings" ON saved_listings
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- LISTING ANALYTICS TABLE POLICIES
-- ============================================================================

-- Policy: Listing owners can view analytics for their listings
CREATE POLICY "Listing owners can view listing analytics" ON listing_analytics
    FOR SELECT USING (
        listing_id IN (
            SELECT id FROM listings WHERE seller_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Policy: System can create and update analytics records
CREATE POLICY "System can manage analytics records" ON listing_analytics
    FOR ALL USING (true) WITH CHECK (true);

-- Policy: Admins can view all analytics
CREATE POLICY "Admins can view all analytics" ON listing_analytics
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- LISTING PERFORMANCE TABLE POLICIES
-- ============================================================================

-- Policy: Listing owners can view performance metrics for their listings
CREATE POLICY "Listing owners can view listing performance" ON listing_performance
    FOR SELECT USING (
        listing_id IN (
            SELECT id FROM listings WHERE seller_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Policy: System can create and update performance records
CREATE POLICY "System can manage performance records" ON listing_performance
    FOR ALL USING (true) WITH CHECK (true);

-- Policy: Admins can view all performance metrics
CREATE POLICY "Admins can view all performance metrics" ON listing_performance
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- HELPER FUNCTIONS FOR MARKETPLACE ACCESS CONTROL
-- ============================================================================

-- Function to check if user can access inquiry
CREATE OR REPLACE FUNCTION user_can_access_inquiry(inquiry_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM listing_inquiries 
        WHERE id = inquiry_uuid 
        AND (
            buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns listing
CREATE OR REPLACE FUNCTION user_owns_listing(listing_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM listings 
        WHERE id = listing_uuid 
        AND seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in inquiry
CREATE OR REPLACE FUNCTION get_user_inquiry_role(inquiry_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_profile_id UUID;
    inquiry_record RECORD;
BEGIN
    -- Get current user's profile ID
    SELECT id INTO user_profile_id 
    FROM profiles 
    WHERE user_id = auth.uid();
    
    -- Get inquiry information
    SELECT buyer_id, seller_id 
    INTO inquiry_record
    FROM listing_inquiries 
    WHERE id = inquiry_uuid;
    
    -- Determine user's role in the inquiry
    IF inquiry_record.buyer_id = user_profile_id THEN
        RETURN 'buyer';
    ELSIF inquiry_record.seller_id = user_profile_id THEN
        RETURN 'seller';
    ELSE
        RETURN 'none';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can view listing analytics
CREATE OR REPLACE FUNCTION user_can_view_listing_analytics(listing_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM listings 
        WHERE id = listing_uuid 
        AND seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    ) OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
