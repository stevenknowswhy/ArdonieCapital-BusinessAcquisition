-- FIX USER SUBSCRIPTIONS TABLE SCHEMA
-- Purpose: Add missing unique constraint to user_subscriptions table
-- Fixes: Error 42P10 - ON CONFLICT constraint matching issue
-- Project: BuyMartV1 - Multi-Role Database Schema

-- ============================================================================
-- USER SUBSCRIPTIONS TABLE SCHEMA FIX
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 ============================================================================';
    RAISE NOTICE '🔧 FIXING USER SUBSCRIPTIONS TABLE SCHEMA';
    RAISE NOTICE '🔧 Adding missing unique constraint for ON CONFLICT operations';
    RAISE NOTICE '🔧 ============================================================================';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. CHECK CURRENT USER_SUBSCRIPTIONS TABLE STRUCTURE
-- ============================================================================

DO $$
DECLARE
    table_exists BOOLEAN;
    constraint_exists BOOLEAN;
    index_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 STEP 1: CHECKING CURRENT USER_SUBSCRIPTIONS TABLE STRUCTURE';
    RAISE NOTICE '';
    
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_subscriptions'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ user_subscriptions table exists';
        
        -- Check if unique constraint exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'user_subscriptions'
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%user_id%tier_id%'
        ) INTO constraint_exists;
        
        IF constraint_exists THEN
            RAISE NOTICE '✅ Unique constraint on (user_id, tier_id) already exists';
        ELSE
            RAISE NOTICE '❌ Missing unique constraint on (user_id, tier_id) - NEEDS TO BE ADDED';
        END IF;
        
        -- Check if unique index exists
        SELECT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = 'user_subscriptions'
            AND indexdef LIKE '%user_id%tier_id%'
            AND indexdef LIKE '%UNIQUE%'
        ) INTO index_exists;
        
        IF index_exists THEN
            RAISE NOTICE '✅ Unique index on (user_id, tier_id) exists';
        ELSE
            RAISE NOTICE '❌ Missing unique index on (user_id, tier_id) - NEEDS TO BE ADDED';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ user_subscriptions table does NOT exist';
        RAISE EXCEPTION 'user_subscriptions table must exist before running this fix';
    END IF;
END $$;

-- ============================================================================
-- 2. ADD MISSING UNIQUE CONSTRAINT SAFELY
-- ============================================================================

DO $$
DECLARE
    constraint_exists BOOLEAN;
    duplicate_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 STEP 2: ADDING MISSING UNIQUE CONSTRAINT';
    RAISE NOTICE '';
    
    -- Check if constraint already exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'user_subscriptions'
        AND constraint_type = 'UNIQUE'
        AND constraint_name = 'user_subscriptions_user_tier_unique'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        RAISE NOTICE '✅ Unique constraint already exists - no action needed';
    ELSE
        -- Check for duplicate data that would prevent constraint creation
        SELECT COUNT(*) INTO duplicate_count
        FROM (
            SELECT user_id, tier_id, COUNT(*)
            FROM user_subscriptions
            GROUP BY user_id, tier_id
            HAVING COUNT(*) > 1
        ) duplicates;
        
        IF duplicate_count > 0 THEN
            RAISE NOTICE '⚠️ Found % duplicate (user_id, tier_id) combinations', duplicate_count;
            RAISE NOTICE '⚠️ Cleaning up duplicates before adding constraint...';
            
            -- Remove duplicates, keeping the most recent one
            DELETE FROM user_subscriptions 
            WHERE id NOT IN (
                SELECT DISTINCT ON (user_id, tier_id) id
                FROM user_subscriptions
                ORDER BY user_id, tier_id, created_at DESC
            );
            
            RAISE NOTICE '✅ Cleaned up duplicate subscriptions';
        END IF;
        
        -- Add the unique constraint
        ALTER TABLE user_subscriptions 
        ADD CONSTRAINT user_subscriptions_user_tier_unique 
        UNIQUE (user_id, tier_id);
        
        RAISE NOTICE '✅ Added unique constraint: user_subscriptions_user_tier_unique';
        RAISE NOTICE '✅ ON CONFLICT (user_id, tier_id) operations will now work';
    END IF;
END $$;

-- ============================================================================
-- 3. VERIFY CONSTRAINT CREATION
-- ============================================================================

DO $$
DECLARE
    constraint_exists BOOLEAN;
    constraint_name TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 STEP 3: VERIFYING CONSTRAINT CREATION';
    RAISE NOTICE '';
    
    -- Check if constraint was created successfully
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'user_subscriptions'
        AND constraint_type = 'UNIQUE'
        AND constraint_name = 'user_subscriptions_user_tier_unique'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        RAISE NOTICE '✅ Unique constraint successfully created and verified';
        RAISE NOTICE '✅ user_subscriptions table is ready for ON CONFLICT operations';
    ELSE
        RAISE NOTICE '❌ Failed to create unique constraint';
        RAISE EXCEPTION 'Could not create required unique constraint on user_subscriptions';
    END IF;
END $$;

-- ============================================================================
-- 4. SHOW ALL CONSTRAINTS ON USER_SUBSCRIPTIONS TABLE
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '📋 CURRENT CONSTRAINTS ON USER_SUBSCRIPTIONS TABLE:';

SELECT 
    constraint_name,
    constraint_type,
    CASE 
        WHEN constraint_type = 'UNIQUE' THEN 'Allows ON CONFLICT operations'
        WHEN constraint_type = 'FOREIGN KEY' THEN 'Ensures referential integrity'
        WHEN constraint_type = 'PRIMARY KEY' THEN 'Unique row identifier'
        ELSE 'Other constraint type'
    END as purpose
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'user_subscriptions'
ORDER BY constraint_type, constraint_name;

-- ============================================================================
-- 5. FINAL SUMMARY
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '🎉 USER SUBSCRIPTIONS SCHEMA FIX COMPLETED';
    RAISE NOTICE '🎉 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ WHAT WAS FIXED:';
    RAISE NOTICE '   • Added unique constraint on (user_id, tier_id)';
    RAISE NOTICE '   • Cleaned up any duplicate subscription records';
    RAISE NOTICE '   • Verified constraint creation and functionality';
    RAISE NOTICE '';
    RAISE NOTICE '✅ WHAT THIS ENABLES:';
    RAISE NOTICE '   • ON CONFLICT (user_id, tier_id) DO NOTHING operations';
    RAISE NOTICE '   • ON CONFLICT (user_id, tier_id) DO UPDATE operations';
    RAISE NOTICE '   • Prevents duplicate subscriptions for same user/tier';
    RAISE NOTICE '   • Ensures data integrity in user_subscriptions table';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 NEXT STEPS:';
    RAISE NOTICE '   1. Re-run the test user creation script';
    RAISE NOTICE '   2. ON CONFLICT operations should now work without errors';
    RAISE NOTICE '   3. Verify test user deployment with verification script';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================================================';
END $$;
