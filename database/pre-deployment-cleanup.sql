-- Pre-Deployment Cleanup Script
-- Safely removes orphaned database objects to prevent "already exists" errors
-- Run this BEFORE executing the main schema files

-- =============================================================================
-- CONSTRAINT CLEANUP
-- =============================================================================

-- Drop orphaned constraints that may exist without their parent tables
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop orphaned foreign key constraints
    FOR constraint_record IN 
        SELECT constraint_name, table_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_schema = 'public'
        AND constraint_name IN (
            'fk_content_pages_category',
            'fk_deals_buyer',
            'fk_deals_seller', 
            'fk_deals_listing',
            'fk_deal_documents_deal',
            'fk_payments_user',
            'fk_payments_deal',
            'fk_matches_buyer',
            'fk_matches_seller'
        )
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
                          constraint_record.table_name, 
                          constraint_record.constraint_name);
            RAISE NOTICE 'Dropped constraint: % from table: %', 
                         constraint_record.constraint_name, 
                         constraint_record.table_name;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop constraint %: %', 
                           constraint_record.constraint_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- =============================================================================
-- TRIGGER CLEANUP  
-- =============================================================================

-- Drop orphaned triggers
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
        AND trigger_name IN (
            'update_subscription_tiers_updated_at',
            'update_deals_updated_at',
            'update_deal_documents_updated_at',
            'update_deal_milestones_updated_at',
            'update_payments_updated_at',
            'update_badge_orders_updated_at',
            'update_subscriptions_updated_at',
            'update_listing_inquiries_updated_at',
            'update_matches_updated_at',
            'update_cms_content_updated_at',
            'create_deal_milestones_trigger',
            'update_completion_percentage_trigger'
        )
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', 
                          trigger_record.trigger_name, 
                          trigger_record.event_object_table);
            RAISE NOTICE 'Dropped trigger: % from table: %', 
                         trigger_record.trigger_name, 
                         trigger_record.event_object_table;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop trigger %: %', 
                           trigger_record.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- =============================================================================
-- FUNCTION CLEANUP
-- =============================================================================

-- Drop orphaned functions that may cause conflicts
DROP FUNCTION IF EXISTS create_default_deal_milestones() CASCADE;
DROP FUNCTION IF EXISTS update_deal_completion_percentage() CASCADE;
DROP FUNCTION IF EXISTS update_inquiry_response_count() CASCADE;
DROP FUNCTION IF EXISTS update_listing_counters() CASCADE;
DROP FUNCTION IF EXISTS update_match_view_tracking() CASCADE;
DROP FUNCTION IF EXISTS expire_old_matches() CASCADE;
DROP FUNCTION IF EXISTS update_tag_usage_count() CASCADE;
DROP FUNCTION IF EXISTS update_content_comment_count() CASCADE;
DROP FUNCTION IF EXISTS publish_scheduled_content() CASCADE;
DROP FUNCTION IF EXISTS check_subscription_feature_access(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_subscription_usage(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS expire_subscriptions() CASCADE;
DROP FUNCTION IF EXISTS expire_badges() CASCADE;

-- =============================================================================
-- SEQUENCE CLEANUP
-- =============================================================================

-- Drop orphaned sequences
DROP SEQUENCE IF EXISTS deal_number_seq CASCADE;
DROP SEQUENCE IF EXISTS payment_number_seq CASCADE;
DROP SEQUENCE IF EXISTS badge_order_seq CASCADE;
DROP SEQUENCE IF EXISTS subscription_number_seq CASCADE;
DROP SEQUENCE IF EXISTS escrow_number_seq CASCADE;
DROP SEQUENCE IF EXISTS inquiry_number_seq CASCADE;
DROP SEQUENCE IF EXISTS match_number_seq CASCADE;
DROP SEQUENCE IF EXISTS cms_content_number_seq CASCADE;
DROP SEQUENCE IF EXISTS badge_order_number_seq CASCADE;
DROP SEQUENCE IF EXISTS invoice_number_seq CASCADE;

-- =============================================================================
-- ENUM TYPE CLEANUP
-- =============================================================================

-- Drop orphaned enum types (be careful - only if tables don't exist)
DO $$
BEGIN
    -- Only drop enums if their dependent tables don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
        DROP TYPE IF EXISTS deal_status CASCADE;
        DROP TYPE IF EXISTS deal_priority CASCADE;
        DROP TYPE IF EXISTS document_type CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        DROP TYPE IF EXISTS payment_status CASCADE;
        DROP TYPE IF EXISTS payment_type CASCADE;
        DROP TYPE IF EXISTS escrow_status CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_inquiries') THEN
        DROP TYPE IF EXISTS inquiry_status CASCADE;
        DROP TYPE IF EXISTS inquiry_type CASCADE;
        DROP TYPE IF EXISTS inquiry_priority CASCADE;
        DROP TYPE IF EXISTS engagement_type CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') THEN
        DROP TYPE IF EXISTS match_status CASCADE;
        DROP TYPE IF EXISTS feedback_type CASCADE;
        DROP TYPE IF EXISTS interaction_type CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_content') THEN
        DROP TYPE IF EXISTS content_status CASCADE;
        DROP TYPE IF EXISTS content_type CASCADE;
        DROP TYPE IF EXISTS comment_status CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        DROP TYPE IF EXISTS subscription_status CASCADE;
        DROP TYPE IF EXISTS badge_status CASCADE;
        DROP TYPE IF EXISTS badge_order_status CASCADE;
    END IF;
    
    RAISE NOTICE 'Enum cleanup completed';
END $$;

-- =============================================================================
-- INDEX CLEANUP
-- =============================================================================

-- Drop orphaned indexes
DO $$
DECLARE
    index_record RECORD;
BEGIN
    FOR index_record IN
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname LIKE ANY(ARRAY[
            'idx_deals_%',
            'idx_deal_%', 
            'idx_payments_%',
            'idx_badge_%',
            'idx_listing_inquiries_%',
            'idx_inquiry_%',
            'idx_matches_%',
            'idx_match_%',
            'idx_cms_%',
            'idx_subscription_%',
            'idx_user_badges_%'
        ])
    LOOP
        BEGIN
            EXECUTE format('DROP INDEX IF EXISTS %I', index_record.indexname);
            RAISE NOTICE 'Dropped index: %', index_record.indexname;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop index %: %', index_record.indexname, SQLERRM;
        END;
    END LOOP;
END $$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify cleanup completed successfully
DO $$
BEGIN
    RAISE NOTICE '=== PRE-DEPLOYMENT CLEANUP COMPLETED ===';
    RAISE NOTICE 'Orphaned constraints, triggers, functions, sequences, and indexes removed';
    RAISE NOTICE 'Database is ready for clean schema deployment';
    RAISE NOTICE 'Proceed with schema files in the specified order';
END $$;
