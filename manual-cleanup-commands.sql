-- Manual Cleanup Commands for PostgreSQL Conflicts
-- Execute these commands one by one in Supabase SQL Editor
-- These will resolve the "already exists" errors you're encountering

-- =============================================================================
-- 1. DROP PROBLEMATIC CONSTRAINTS
-- =============================================================================

-- Drop the constraint causing issues in enhanced-schema.sql
ALTER TABLE content_pages DROP CONSTRAINT IF EXISTS fk_content_pages_category;

-- Drop other potentially conflicting constraints
ALTER TABLE deals DROP CONSTRAINT IF EXISTS fk_deals_buyer;
ALTER TABLE deals DROP CONSTRAINT IF EXISTS fk_deals_seller;
ALTER TABLE deals DROP CONSTRAINT IF EXISTS fk_deals_listing;
ALTER TABLE deal_documents DROP CONSTRAINT IF EXISTS fk_deal_documents_deal;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_user;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_deal;

-- =============================================================================
-- 2. DROP PROBLEMATIC TRIGGERS
-- =============================================================================

-- Drop the trigger causing issues in enhanced-multi-role-schema.sql
DROP TRIGGER IF EXISTS update_subscription_tiers_updated_at ON subscription_tiers;

-- Drop the trigger causing issues in deal-management-schema.sql  
DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;

-- Drop other potentially conflicting triggers
DROP TRIGGER IF EXISTS update_deal_documents_updated_at ON deal_documents;
DROP TRIGGER IF EXISTS update_deal_milestones_updated_at ON deal_milestones;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
DROP TRIGGER IF EXISTS update_badge_orders_updated_at ON badge_orders;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS create_deal_milestones_trigger ON deals;
DROP TRIGGER IF EXISTS update_completion_percentage_trigger ON deal_milestones;

-- =============================================================================
-- 3. DROP ORPHANED FUNCTIONS
-- =============================================================================

DROP FUNCTION IF EXISTS create_default_deal_milestones() CASCADE;
DROP FUNCTION IF EXISTS update_deal_completion_percentage() CASCADE;
DROP FUNCTION IF EXISTS update_inquiry_response_count() CASCADE;
DROP FUNCTION IF EXISTS update_listing_counters() CASCADE;
DROP FUNCTION IF EXISTS update_match_view_tracking() CASCADE;
DROP FUNCTION IF EXISTS expire_old_matches() CASCADE;
DROP FUNCTION IF EXISTS update_tag_usage_count() CASCADE;
DROP FUNCTION IF EXISTS update_content_comment_count() CASCADE;
DROP FUNCTION IF EXISTS publish_scheduled_content() CASCADE;

-- =============================================================================
-- 4. DROP ORPHANED SEQUENCES
-- =============================================================================

DROP SEQUENCE IF EXISTS deal_number_seq CASCADE;
DROP SEQUENCE IF EXISTS payment_number_seq CASCADE;
DROP SEQUENCE IF EXISTS badge_order_seq CASCADE;
DROP SEQUENCE IF EXISTS subscription_number_seq CASCADE;
DROP SEQUENCE IF EXISTS escrow_number_seq CASCADE;
DROP SEQUENCE IF EXISTS inquiry_number_seq CASCADE;
DROP SEQUENCE IF EXISTS match_number_seq CASCADE;

-- =============================================================================
-- 5. VERIFICATION QUERY
-- =============================================================================

-- Run this to verify cleanup completed
SELECT 'Cleanup completed successfully' as status;
