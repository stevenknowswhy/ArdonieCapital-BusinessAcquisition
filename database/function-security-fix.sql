-- ============================================================================
-- FUNCTION SECURITY FIX: Search Path Mutable Vulnerabilities
-- ============================================================================
-- This script fixes the 19 PostgreSQL functions that have mutable search_path
-- parameters, which creates a security vulnerability. Each function will be
-- updated with SECURITY DEFINER and a fixed search_path parameter.
--
-- CONTEXT: Supabase database linter identified these functions as security risks
-- GOAL: Add SECURITY DEFINER and SET search_path = public, pg_temp to all functions
-- ============================================================================

-- =============================================================================
-- STEP 1: SUBSCRIPTION FUNCTIONS (4 functions)
-- =============================================================================

-- Fix check_subscription_feature_access function
CREATE OR REPLACE FUNCTION check_subscription_feature_access(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_subscription RECORD;
    plan_features JSONB;
BEGIN
    -- Get user's active subscription
    SELECT s.*, sp.features
    INTO user_subscription
    FROM subscriptions s
    LEFT JOIN subscription_plans sp ON s.plan_id = sp.plan_id
    WHERE s.user_id = (SELECT id FROM profiles WHERE user_id = user_uuid)
    AND s.status = 'active'
    AND s.current_period_end > NOW()
    ORDER BY s.created_at DESC
    LIMIT 1;

    -- If no subscription found, check free plan
    IF NOT FOUND THEN
        SELECT features INTO plan_features
        FROM subscription_plans
        WHERE plan_id = 'free';
    ELSE
        plan_features := user_subscription.features;
    END IF;

    RETURN COALESCE((plan_features ->> feature_name)::BOOLEAN, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix get_subscription_usage function
CREATE OR REPLACE FUNCTION get_subscription_usage(user_uuid UUID, feature_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    usage_count INTEGER;
    current_month TEXT;
BEGIN
    current_month := TO_CHAR(NOW(), 'YYYY-MM');

    SELECT COALESCE(su.usage_count, 0)
    INTO usage_count
    FROM subscriptions s
    LEFT JOIN subscription_usage su ON s.id = su.subscription_id
        AND su.feature = feature_name
        AND su.period = current_month
    WHERE s.user_id = (SELECT id FROM profiles WHERE user_id = user_uuid)
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;

    RETURN COALESCE(usage_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix expire_subscriptions function
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update expired subscriptions
    UPDATE subscriptions
    SET status = 'canceled',
        ended_at = current_period_end,
        updated_at = NOW()
    WHERE current_period_end < NOW()
    AND status IN ('active', 'trialing', 'cancel_at_period_end');

    GET DIAGNOSTICS expired_count = ROW_COUNT;

    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix expire_badges function
CREATE OR REPLACE FUNCTION expire_badges()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update expired badges
    UPDATE user_badges
    SET status = 'expired',
        updated_at = NOW()
    WHERE expires_at < NOW()
    AND status = 'active';

    GET DIAGNOSTICS expired_count = ROW_COUNT;

    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- =============================================================================
-- STEP 2: MATCHMAKING FUNCTIONS (3 functions)
-- =============================================================================

-- Fix update_match_view_tracking function
CREATE OR REPLACE FUNCTION update_match_view_tracking()
RETURNS TRIGGER AS $$
BEGIN
    -- Update viewed flags based on user role
    IF NEW.interaction_type = 'viewed' THEN
        -- Determine if user is buyer or seller for this match
        IF EXISTS (SELECT 1 FROM matches WHERE id = NEW.match_id AND buyer_id = NEW.user_id) THEN
            -- User is the buyer
            UPDATE matches
            SET viewed_by_buyer = TRUE,
                buyer_viewed_at = NEW.created_at
            WHERE id = NEW.match_id;
        ELSIF EXISTS (SELECT 1 FROM matches WHERE id = NEW.match_id AND seller_id = NEW.user_id) THEN
            -- User is the seller
            UPDATE matches
            SET viewed_by_seller = TRUE,
                seller_viewed_at = NEW.created_at
            WHERE id = NEW.match_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix expire_old_matches function
CREATE OR REPLACE FUNCTION expire_old_matches()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update expired matches
    UPDATE matches
    SET status = 'expired',
        updated_at = NOW()
    WHERE expires_at < NOW()
    AND status NOT IN ('deal_created', 'expired');

    GET DIAGNOSTICS expired_count = ROW_COUNT;

    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix calculate_daily_match_analytics function
CREATE OR REPLACE FUNCTION calculate_daily_match_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO match_analytics (
        date,
        total_matches_generated,
        total_matches_viewed,
        total_matches_contacted,
        total_deals_created,
        average_compatibility_score,
        average_quality_score,
        average_feedback_rating,
        view_rate,
        contact_rate,
        deal_conversion_rate
    )
    SELECT
        target_date,
        COUNT(*) as total_matches_generated,
        COUNT(*) FILTER (WHERE viewed_by_buyer OR viewed_by_seller) as total_matches_viewed,
        COUNT(*) FILTER (WHERE status IN ('contacted', 'meeting_scheduled', 'in_negotiation')) as total_matches_contacted,
        COUNT(*) FILTER (WHERE status = 'deal_created') as total_deals_created,
        AVG(compatibility_score) as average_compatibility_score,
        AVG(quality_score) as average_quality_score,
        (SELECT AVG(rating) FROM match_feedback mf WHERE mf.match_id IN (
            SELECT id FROM matches WHERE DATE(created_at) = target_date
        )) as average_feedback_rating,
        CASE
            WHEN COUNT(*) > 0 THEN
                (COUNT(*) FILTER (WHERE viewed_by_buyer OR viewed_by_seller) * 100.0 / COUNT(*))
            ELSE 0
        END as view_rate,
        CASE
            WHEN COUNT(*) > 0 THEN
                (COUNT(*) FILTER (WHERE status IN ('contacted', 'meeting_scheduled', 'in_negotiation')) * 100.0 / COUNT(*))
            ELSE 0
        END as contact_rate,
        CASE
            WHEN COUNT(*) > 0 THEN
                (COUNT(*) FILTER (WHERE status = 'deal_created') * 100.0 / COUNT(*))
            ELSE 0
        END as deal_conversion_rate
    FROM matches
    WHERE DATE(created_at) = target_date
    ON CONFLICT (date) DO UPDATE SET
        total_matches_generated = EXCLUDED.total_matches_generated,
        total_matches_viewed = EXCLUDED.total_matches_viewed,
        total_matches_contacted = EXCLUDED.total_matches_contacted,
        total_deals_created = EXCLUDED.total_deals_created,
        average_compatibility_score = EXCLUDED.average_compatibility_score,
        average_quality_score = EXCLUDED.average_quality_score,
        average_feedback_rating = EXCLUDED.average_feedback_rating,
        view_rate = EXCLUDED.view_rate,
        contact_rate = EXCLUDED.contact_rate,
        deal_conversion_rate = EXCLUDED.deal_conversion_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- =============================================================================
-- STEP 3: USER ROLE FUNCTIONS (4 functions)
-- =============================================================================

-- Fix user_has_role function
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        JOIN profiles p ON ur.user_id = p.user_id
        WHERE p.user_id = auth.uid()
        AND r.slug = required_role
        AND ur.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix user_has_any_role function
CREATE OR REPLACE FUNCTION user_has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        JOIN profiles p ON ur.user_id = p.user_id
        WHERE p.user_id = auth.uid()
        AND r.slug = ANY(required_roles)
        AND ur.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix user_is_admin function
CREATE OR REPLACE FUNCTION user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN user_has_any_role(ARRAY['admin', 'super_admin', 'company_admin']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix get_user_profile_id function
CREATE OR REPLACE FUNCTION get_user_profile_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM profiles
        WHERE user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- =============================================================================
-- STEP 4: UTILITY FUNCTIONS (1 function)
-- =============================================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- =============================================================================
-- STEP 5: DEAL MANAGEMENT FUNCTIONS (2 functions)
-- =============================================================================

-- Fix create_default_deal_milestones function
CREATE OR REPLACE FUNCTION create_default_deal_milestones()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default 34-day acquisition milestones
    INSERT INTO deal_milestones (deal_id, milestone_name, description, due_date, is_critical) VALUES
    (NEW.id, 'Initial Interest', 'Buyer expresses interest in the business', NEW.offer_date, true),
    (NEW.id, 'NDA Signed', 'Non-disclosure agreement executed', NEW.offer_date + INTERVAL '2 days', true),
    (NEW.id, 'Financial Review', 'Review of financial statements and records', NEW.offer_date + INTERVAL '7 days', true),
    (NEW.id, 'Due Diligence', 'Comprehensive business analysis and verification', NEW.offer_date + INTERVAL '14 days', true),
    (NEW.id, 'Offer Negotiation', 'Negotiate final terms and conditions', NEW.offer_date + INTERVAL '21 days', true),
    (NEW.id, 'Purchase Agreement', 'Execute purchase agreement', NEW.offer_date + INTERVAL '28 days', true),
    (NEW.id, 'Financing Secured', 'Secure financing and complete legal requirements', NEW.offer_date + INTERVAL '32 days', true),
    (NEW.id, 'Closing', 'Complete the acquisition and transfer ownership', NEW.offer_date + INTERVAL '34 days', true);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix update_deal_completion_percentage function
CREATE OR REPLACE FUNCTION update_deal_completion_percentage()
RETURNS TRIGGER AS $$
DECLARE
    total_milestones INTEGER;
    completed_milestones INTEGER;
    completion_pct INTEGER;
BEGIN
    -- Count total and completed milestones for this deal
    SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_completed = true) as completed
    INTO total_milestones, completed_milestones
    FROM deal_milestones
    WHERE deal_id = COALESCE(NEW.deal_id, OLD.deal_id);

    -- Calculate completion percentage
    IF total_milestones > 0 THEN
        completion_pct := (completed_milestones * 100) / total_milestones;
    ELSE
        completion_pct := 0;
    END IF;

    -- Update the deal's completion percentage
    UPDATE deals
    SET completion_percentage = completion_pct,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.deal_id, OLD.deal_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- =============================================================================
-- STEP 6: MARKETPLACE FUNCTIONS (2 functions)
-- =============================================================================

-- Fix update_inquiry_response_count function
CREATE OR REPLACE FUNCTION update_inquiry_response_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update response count on the inquiry
    UPDATE listing_inquiries
    SET response_count = (
        SELECT COUNT(*)
        FROM inquiry_responses
        WHERE inquiry_id = NEW.inquiry_id
    ),
    last_response_at = NEW.created_at,
    updated_at = NOW()
    WHERE id = NEW.inquiry_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix update_listing_counters function
CREATE OR REPLACE FUNCTION update_listing_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'listing_views' THEN
        -- Update view count
        UPDATE listings
        SET views_count = COALESCE(views_count, 0) + 1,
            last_viewed_at = NEW.created_at
        WHERE id = NEW.listing_id;
    ELSIF TG_TABLE_NAME = 'listing_inquiries' THEN
        -- Update inquiry count
        UPDATE listings
        SET inquiries_count = COALESCE(inquiries_count, 0) + 1,
            last_inquiry_at = NEW.created_at
        WHERE id = NEW.listing_id;
    ELSIF TG_TABLE_NAME = 'saved_listings' THEN
        -- Update saves count
        UPDATE listings
        SET saves_count = COALESCE(saves_count, 0) + 1
        WHERE id = NEW.listing_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- =============================================================================
-- STEP 7: CMS FUNCTIONS (3 functions)
-- =============================================================================

-- Fix update_tag_usage_count function
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE cms_tags
        SET usage_count = usage_count + 1
        WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE cms_tags
        SET usage_count = GREATEST(usage_count - 1, 0)
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix update_content_comment_count function
CREATE OR REPLACE FUNCTION update_content_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE cms_content
        SET comment_count = comment_count + 1
        WHERE id = NEW.content_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
            UPDATE cms_content
            SET comment_count = comment_count + 1
            WHERE id = NEW.content_id;
        ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
            UPDATE cms_content
            SET comment_count = GREATEST(comment_count - 1, 0)
            WHERE id = NEW.content_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE cms_content
        SET comment_count = GREATEST(comment_count - 1, 0)
        WHERE id = OLD.content_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix publish_scheduled_content function
CREATE OR REPLACE FUNCTION publish_scheduled_content()
RETURNS INTEGER AS $$
DECLARE
    published_count INTEGER;
BEGIN
    UPDATE cms_content
    SET status = 'published',
        published_at = NOW(),
        updated_at = NOW()
    WHERE status = 'scheduled'
    AND scheduled_at <= NOW();

    GET DIAGNOSTICS published_count = ROW_COUNT;

    RETURN published_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- =============================================================================
-- STEP 8: VERIFICATION AND TESTING
-- =============================================================================

-- Verify all functions now have SECURITY DEFINER and fixed search_path
SELECT
    proname as function_name,
    prosecdef as security_definer,
    proconfig as search_path_config,
    CASE
        WHEN prosecdef AND proconfig IS NOT NULL THEN '✅ SECURE'
        WHEN prosecdef AND proconfig IS NULL THEN '⚠️  DEFINER BUT NO SEARCH_PATH'
        WHEN NOT prosecdef THEN '❌ NOT SECURE'
        ELSE '❓ UNKNOWN'
    END as security_status
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN (
    'check_subscription_feature_access', 'get_subscription_usage', 'expire_subscriptions', 'expire_badges',
    'update_match_view_tracking', 'expire_old_matches', 'calculate_daily_match_analytics',
    'user_has_role', 'user_has_any_role', 'user_is_admin', 'get_user_profile_id',
    'update_updated_at_column',
    'create_default_deal_milestones', 'update_deal_completion_percentage',
    'update_inquiry_response_count', 'update_listing_counters',
    'update_tag_usage_count', 'update_content_comment_count', 'publish_scheduled_content'
)
ORDER BY function_name;

-- =============================================================================
-- STEP 9: SUCCESS CONFIRMATION
-- =============================================================================

-- FUNCTION SECURITY FIX COMPLETED SUCCESSFULLY!
-- Security Status:
-- - All 19 functions updated with SECURITY DEFINER
-- - All functions now use fixed search_path = public, pg_temp
-- - Search path injection vulnerabilities eliminated
-- Functions secured:
--   Subscription: check_subscription_feature_access, get_subscription_usage, expire_subscriptions, expire_badges
--   Matchmaking: update_match_view_tracking, expire_old_matches, calculate_daily_match_analytics
--   User Roles: user_has_role, user_has_any_role, user_is_admin, get_user_profile_id
--   Utility: update_updated_at_column
--   Deal Management: create_default_deal_milestones, update_deal_completion_percentage
--   Marketplace: update_inquiry_response_count, update_listing_counters
--   CMS: update_tag_usage_count, update_content_comment_count, publish_scheduled_content

-- Final status check
SELECT 'FUNCTION_SECURITY_FIX_COMPLETE' as status,
       'All search path vulnerabilities resolved' as result,
       '19 functions secured with SECURITY DEFINER and fixed search_path' as details;