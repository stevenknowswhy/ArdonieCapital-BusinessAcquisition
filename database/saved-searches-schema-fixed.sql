-- ============================================================================
-- SAVED SEARCHES SCHEMA - Search Alert Functionality (FIXED VERSION)
-- Purpose: Create table and policies for user search alerts
-- Fix: Proper dependency handling and conditional policy cleanup
-- ============================================================================

-- ============================================================================
-- DEPENDENCY VERIFICATION
-- ============================================================================

-- Check if required dependencies exist
DO $$
BEGIN
    -- Check if profiles table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE EXCEPTION 'DEPENDENCY ERROR: profiles table does not exist. Please deploy the core schema first.';
    END IF;
    
    -- Check if uuid_generate_v4 function exists
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uuid_generate_v4') THEN
        RAISE EXCEPTION 'DEPENDENCY ERROR: uuid_generate_v4 function not available. Please enable uuid-ossp extension.';
    END IF;
    
    RAISE NOTICE 'Dependencies verified successfully';
END $$;

-- ============================================================================
-- SAFE CLEANUP SECTION - Only drop if table exists
-- ============================================================================

-- Drop existing policies ONLY if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'saved_searches') THEN
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "saved_searches_user_read" ON saved_searches;
        DROP POLICY IF EXISTS "saved_searches_user_insert" ON saved_searches;
        DROP POLICY IF EXISTS "saved_searches_user_update" ON saved_searches;
        DROP POLICY IF EXISTS "saved_searches_user_delete" ON saved_searches;
        
        RAISE NOTICE 'Existing policies dropped';
    ELSE
        RAISE NOTICE 'No existing saved_searches table found - skipping policy cleanup';
    END IF;
END $$;

-- Drop existing table if it exists (for clean redeployment)
DROP TABLE IF EXISTS saved_searches CASCADE;

-- ============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Ensure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SAVED SEARCHES TABLE
-- Stores user search criteria for automated alerts
-- ============================================================================

CREATE TABLE saved_searches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- User relationship (references profiles table)
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Search criteria
    search_name TEXT NOT NULL, -- User-defined name for the search
    search_query TEXT, -- Text search query
    filters JSONB DEFAULT '{}', -- Search filters (business_type, location, price_range, etc.)
    
    -- Alert preferences
    is_active BOOLEAN DEFAULT TRUE, -- Whether alert is active
    notification_frequency TEXT DEFAULT 'immediate' CHECK (
        notification_frequency IN ('immediate', 'daily', 'weekly')
    ),
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,
    
    -- Alert metadata
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_notification_sent_at TIMESTAMP WITH TIME ZONE,
    total_matches_found INTEGER DEFAULT 0,
    new_matches_since_last_check INTEGER DEFAULT 0,
    
    -- Search configuration
    max_results_per_notification INTEGER DEFAULT 10,
    min_match_score INTEGER DEFAULT 70, -- Minimum compatibility score (0-100)
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Additional search parameters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT saved_searches_user_name_unique UNIQUE(user_id, search_name)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);

-- Index for active searches (for background processing)
CREATE INDEX IF NOT EXISTS idx_saved_searches_active ON saved_searches(is_active, last_checked_at) 
WHERE is_active = TRUE;

-- Index for notification frequency processing
CREATE INDEX IF NOT EXISTS idx_saved_searches_notifications ON saved_searches(
    notification_frequency, last_checked_at, is_active
) WHERE is_active = TRUE;

-- GIN index for filters JSONB
CREATE INDEX IF NOT EXISTS idx_saved_searches_filters ON saved_searches USING GIN(filters);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Create or replace the update timestamp function
CREATE OR REPLACE FUNCTION update_saved_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_saved_searches_updated_at ON saved_searches;
CREATE TRIGGER trigger_saved_searches_updated_at
    BEFORE UPDATE ON saved_searches
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_searches_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Users can read their own saved searches
CREATE POLICY "saved_searches_user_read" ON saved_searches
    FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can insert their own saved searches
CREATE POLICY "saved_searches_user_insert" ON saved_searches
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can update their own saved searches
CREATE POLICY "saved_searches_user_update" ON saved_searches
    FOR UPDATE USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    ) WITH CHECK (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can delete their own saved searches
CREATE POLICY "saved_searches_user_delete" ON saved_searches
    FOR DELETE USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================================================

-- Insert sample saved searches for testing (only if profiles exist)
DO $$
BEGIN
    -- Check if we have any test users to create sample data
    IF EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
        -- Insert sample saved searches for the first user
        INSERT INTO saved_searches (
            user_id, 
            search_name, 
            search_query, 
            filters,
            notification_frequency,
            email_notifications
        ) 
        SELECT 
            p.id,
            'Tech Startups Under $500K',
            'technology startup',
            '{"business_type": ["Technology", "Software"], "price_max": 500000, "location": ["California", "Texas"]}'::jsonb,
            'daily',
            true
        FROM profiles p 
        LIMIT 1
        ON CONFLICT (user_id, search_name) DO NOTHING;
        
        RAISE NOTICE 'Sample saved search created for testing';
    ELSE
        RAISE NOTICE 'No profiles found - skipping sample data creation';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create sample data: %', SQLERRM;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table creation
SELECT 
    'SAVED_SEARCHES_TABLE' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'saved_searches'
    ) THEN '✅ CREATED' ELSE '❌ MISSING' END as status;

-- Verify RLS is enabled
SELECT 
    'SAVED_SEARCHES_RLS' as check_type,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'saved_searches';

-- Count policies
SELECT 
    'SAVED_SEARCHES_POLICIES' as check_type,
    COUNT(*) || ' policies created' as status
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'saved_searches';

-- Verify indexes
SELECT 
    'SAVED_SEARCHES_INDEXES' as check_type,
    COUNT(*) || ' indexes created' as status
FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'saved_searches';

-- Check sample data
SELECT 
    'SAMPLE_DATA' as check_type,
    COUNT(*) || ' sample records created' as status
FROM saved_searches;

-- ============================================================================
-- DEPLOYMENT SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 SAVED SEARCHES SCHEMA DEPLOYMENT COMPLETE!';
    RAISE NOTICE '✅ Table: saved_searches created with full RLS policies';
    RAISE NOTICE '✅ Indexes: Performance indexes created';
    RAISE NOTICE '✅ Triggers: Auto-timestamp updates enabled';
    RAISE NOTICE '✅ Security: Row Level Security policies active';
    RAISE NOTICE '✅ Dependencies: All requirements verified';
    RAISE NOTICE '📋 Ready for: Search alert functionality implementation';
    RAISE NOTICE '';
END $$;
