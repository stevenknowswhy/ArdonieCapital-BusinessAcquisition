-- Row Level Security Policies for Deal Management System
-- Ensures data privacy and access control for deal-related tables

-- ============================================================================
-- DEALS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view deals they are involved in (buyer, seller, or assigned)
CREATE POLICY "Users can view their deals" ON deals
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
        )
    );

-- Policy: Buyers can create deals for listings they're interested in
CREATE POLICY "Buyers can create deals" ON deals
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = buyer_id)
        AND (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('buyer', 'admin')
    );

-- Policy: Deal participants can update deals
CREATE POLICY "Deal participants can update deals" ON deals
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
        )
    ) WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
        )
    );

-- Policy: Only admins can delete deals
CREATE POLICY "Admins can delete deals" ON deals
    FOR DELETE USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- DEAL DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view documents for deals they're involved in
CREATE POLICY "Users can view deal documents" ON deal_documents
    FOR SELECT USING (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
        AND (
            -- Check visibility permissions
            NOT is_confidential 
            OR auth.uid() = (SELECT user_id FROM profiles WHERE id = uploaded_by)
            OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
            OR (
                -- Check if user role is in visible_to array
                (SELECT role FROM profiles WHERE user_id = auth.uid()) = ANY(visible_to)
            )
        )
    );

-- Policy: Deal participants can upload documents
CREATE POLICY "Deal participants can upload documents" ON deal_documents
    FOR INSERT WITH CHECK (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
        AND auth.uid() = (SELECT user_id FROM profiles WHERE id = uploaded_by)
    );

-- Policy: Document uploaders and admins can update documents
CREATE POLICY "Document owners can update documents" ON deal_documents
    FOR UPDATE USING (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = uploaded_by)
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    ) WITH CHECK (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = uploaded_by)
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Policy: Document uploaders and admins can delete documents
CREATE POLICY "Document owners can delete documents" ON deal_documents
    FOR DELETE USING (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = uploaded_by)
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- DEAL MILESTONES TABLE POLICIES
-- ============================================================================

-- Policy: Users can view milestones for deals they're involved in
CREATE POLICY "Users can view deal milestones" ON deal_milestones
    FOR SELECT USING (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
    );

-- Policy: Deal participants can create milestones
CREATE POLICY "Deal participants can create milestones" ON deal_milestones
    FOR INSERT WITH CHECK (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
    );

-- Policy: Deal participants and assigned users can update milestones
CREATE POLICY "Deal participants can update milestones" ON deal_milestones
    FOR UPDATE USING (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
        OR auth.uid() = (SELECT user_id FROM profiles WHERE id = assigned_to)
    ) WITH CHECK (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
        OR auth.uid() = (SELECT user_id FROM profiles WHERE id = assigned_to)
    );

-- Policy: Deal participants and admins can delete milestones
CREATE POLICY "Deal participants can delete milestones" ON deal_milestones
    FOR DELETE USING (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- DEAL ACTIVITIES TABLE POLICIES
-- ============================================================================

-- Policy: Users can view activities for deals they're involved in
CREATE POLICY "Users can view deal activities" ON deal_activities
    FOR SELECT USING (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
    );

-- Policy: Deal participants can create activities (audit log entries)
CREATE POLICY "Deal participants can create activities" ON deal_activities
    FOR INSERT WITH CHECK (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
        AND (
            user_id IS NULL 
            OR auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)
        )
    );

-- Policy: Only admins can update activities (audit log should be immutable)
CREATE POLICY "Admins can update activities" ON deal_activities
    FOR UPDATE USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    ) WITH CHECK (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Policy: Only admins can delete activities
CREATE POLICY "Admins can delete activities" ON deal_activities
    FOR DELETE USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- HELPER FUNCTIONS FOR DEAL ACCESS CONTROL
-- ============================================================================

-- Function to check if user has access to a deal
CREATE OR REPLACE FUNCTION user_has_deal_access(deal_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM deals 
        WHERE id = deal_uuid 
        AND auth.uid() IN (
            SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can modify a deal
CREATE OR REPLACE FUNCTION user_can_modify_deal(deal_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM deals 
        WHERE id = deal_uuid 
        AND (
            auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
            OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in a deal
CREATE OR REPLACE FUNCTION get_user_deal_role(deal_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_profile_id UUID;
    deal_record RECORD;
BEGIN
    -- Get current user's profile ID
    SELECT id INTO user_profile_id 
    FROM profiles 
    WHERE user_id = auth.uid();
    
    -- Get deal information
    SELECT buyer_id, seller_id, assigned_to 
    INTO deal_record
    FROM deals 
    WHERE id = deal_uuid;
    
    -- Determine user's role in the deal
    IF deal_record.buyer_id = user_profile_id THEN
        RETURN 'buyer';
    ELSIF deal_record.seller_id = user_profile_id THEN
        RETURN 'seller';
    ELSIF deal_record.assigned_to = user_profile_id THEN
        RETURN 'assigned';
    ELSE
        RETURN 'none';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
