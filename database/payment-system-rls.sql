-- Row Level Security Policies for Payment System
-- Ensures secure access to payment and financial data

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own payments
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can create payments for themselves
CREATE POLICY "Users can create their own payments" ON payments
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: System can update payment status (for webhooks)
CREATE POLICY "System can update payment status" ON payments
    FOR UPDATE USING (true) WITH CHECK (true);

-- Policy: Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- BADGE ORDERS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own badge orders
CREATE POLICY "Users can view their own badge orders" ON badge_orders
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can create their own badge orders
CREATE POLICY "Users can create their own badge orders" ON badge_orders
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: System and admins can update badge orders
CREATE POLICY "System and admins can update badge orders" ON badge_orders
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    ) WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Policy: Admins can view all badge orders
CREATE POLICY "Admins can view all badge orders" ON badge_orders
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can create their own subscriptions
CREATE POLICY "Users can create their own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Policy: Users and system can update subscriptions
CREATE POLICY "Users and system can update subscriptions" ON subscriptions
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    ) WITH CHECK (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Policy: Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- ESCROW ACCOUNTS TABLE POLICIES
-- ============================================================================

-- Policy: Deal participants can view escrow accounts
CREATE POLICY "Deal participants can view escrow accounts" ON escrow_accounts
    FOR SELECT USING (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
    );

-- Policy: Deal participants can create escrow accounts
CREATE POLICY "Deal participants can create escrow accounts" ON escrow_accounts
    FOR INSERT WITH CHECK (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
    );

-- Policy: Deal participants and system can update escrow accounts
CREATE POLICY "Deal participants can update escrow accounts" ON escrow_accounts
    FOR UPDATE USING (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    ) WITH CHECK (
        deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Policy: Admins can view all escrow accounts
CREATE POLICY "Admins can view all escrow accounts" ON escrow_accounts
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- ESCROW TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view escrow transactions for their deals
CREATE POLICY "Users can view escrow transactions for their deals" ON escrow_transactions
    FOR SELECT USING (
        escrow_account_id IN (
            SELECT id FROM escrow_accounts WHERE deal_id IN (
                SELECT id FROM deals WHERE auth.uid() IN (
                    SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
                )
            )
        )
    );

-- Policy: System can create escrow transaction logs
CREATE POLICY "System can create escrow transaction logs" ON escrow_transactions
    FOR INSERT WITH CHECK (true);

-- Policy: Admins can view all escrow transactions
CREATE POLICY "Admins can view all escrow transactions" ON escrow_transactions
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- FEE CONFIGURATIONS TABLE POLICIES
-- ============================================================================

-- Policy: Everyone can view active fee configurations
CREATE POLICY "Everyone can view active fee configurations" ON fee_configurations
    FOR SELECT USING (is_active = true);

-- Policy: Only admins can modify fee configurations
CREATE POLICY "Admins can modify fee configurations" ON fee_configurations
    FOR ALL USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    ) WITH CHECK (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- FEE TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own fee transactions
CREATE POLICY "Users can view their own fee transactions" ON fee_transactions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR deal_id IN (
            SELECT id FROM deals WHERE auth.uid() IN (
                SELECT user_id FROM profiles WHERE id IN (buyer_id, seller_id, assigned_to)
            )
        )
    );

-- Policy: System can create fee transactions
CREATE POLICY "System can create fee transactions" ON fee_transactions
    FOR INSERT WITH CHECK (true);

-- Policy: System can update fee transaction status
CREATE POLICY "System can update fee transaction status" ON fee_transactions
    FOR UPDATE USING (true) WITH CHECK (true);

-- Policy: Admins can view all fee transactions
CREATE POLICY "Admins can view all fee transactions" ON fee_transactions
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- DISCOUNT CODES TABLE POLICIES
-- ============================================================================

-- Policy: Everyone can view active discount codes (for validation)
CREATE POLICY "Everyone can view active discount codes" ON discount_codes
    FOR SELECT USING (
        is_active = true 
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- Policy: Only admins can manage discount codes
CREATE POLICY "Admins can manage discount codes" ON discount_codes
    FOR ALL USING (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    ) WITH CHECK (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- HELPER FUNCTIONS FOR PAYMENT ACCESS CONTROL
-- ============================================================================

-- Function to check if user has access to payment data
CREATE OR REPLACE FUNCTION user_has_payment_access(payment_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM payments 
        WHERE id = payment_uuid 
        AND user_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access deal-related payments
CREATE OR REPLACE FUNCTION user_has_deal_payment_access(deal_uuid UUID)
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

-- Function to validate discount code usage
CREATE OR REPLACE FUNCTION can_use_discount_code(code_text TEXT, user_profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    code_record RECORD;
    user_usage_count INTEGER;
BEGIN
    -- Get discount code
    SELECT * INTO code_record 
    FROM discount_codes 
    WHERE code = UPPER(code_text) AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check expiration
    IF code_record.expires_at IS NOT NULL AND code_record.expires_at <= NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- Check start date
    IF code_record.starts_at IS NOT NULL AND code_record.starts_at > NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- Check total usage limit
    IF code_record.max_uses IS NOT NULL AND code_record.times_used >= code_record.max_uses THEN
        RETURN FALSE;
    END IF;
    
    -- Check per-user usage limit
    IF code_record.max_uses_per_user IS NOT NULL THEN
        SELECT COUNT(*) INTO user_usage_count
        FROM payments p
        WHERE p.user_id = user_profile_id 
        AND p.metadata->>'discount_code' = code_text;
        
        IF user_usage_count >= code_record.max_uses_per_user THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
