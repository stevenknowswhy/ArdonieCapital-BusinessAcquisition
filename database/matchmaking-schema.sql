-- Matchmaking System Schema (Conflict-Safe Version)
-- Intelligent buyer-seller matching with compatibility scoring
-- Supports automated match generation, feedback, and algorithm learning
-- This version handles "already exists" conflicts gracefully

-- =============================================================================
-- CLEANUP SECTION: Remove existing objects to prevent conflicts
-- =============================================================================

-- Drop existing triggers first (to prevent "already exists" errors)
-- Use DO blocks to safely drop triggers only if tables exist
DO $$
BEGIN
    -- Drop triggers only if their tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') THEN
        DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
        DROP TRIGGER IF EXISTS expire_old_matches_trigger ON matches;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'match_feedback') THEN
        DROP TRIGGER IF EXISTS update_match_feedback_updated_at ON match_feedback;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'match_analytics') THEN
        DROP TRIGGER IF EXISTS update_match_analytics_updated_at ON match_analytics;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'match_interactions') THEN
        DROP TRIGGER IF EXISTS update_match_view_tracking_trigger ON match_interactions;
    END IF;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_match_view_tracking() CASCADE;
DROP FUNCTION IF EXISTS expire_old_matches() CASCADE;
DROP FUNCTION IF EXISTS calculate_compatibility_score() CASCADE;

-- =============================================================================
-- ENUM TYPES: Create with conflict handling
-- =============================================================================

-- Create match status enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
        CREATE TYPE match_status AS ENUM (
            'generated',
            'viewed',
            'interested',
            'not_interested',
            'contacted',
            'meeting_scheduled',
            'in_negotiation',
            'deal_created',
            'expired'
        );
    END IF;
END $$;

-- Create feedback type enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_type') THEN
        CREATE TYPE feedback_type AS ENUM (
            'quality',
            'relevance',
            'accuracy',
            'overall'
        );
    END IF;
END $$;

-- Create interaction type enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interaction_type') THEN
        CREATE TYPE interaction_type AS ENUM (
            'viewed',
            'clicked',
            'contacted',
            'saved',
            'shared',
            'status_change',
            'feedback_provided',
            'meeting_scheduled'
        );
    END IF;
END $$;

-- =============================================================================
-- SEQUENCE CREATION: Create sequences before tables that use them
-- =============================================================================

-- Create sequence for match numbering (with conflict handling)
CREATE SEQUENCE IF NOT EXISTS match_number_seq START 1000;

-- =============================================================================
-- COLUMN MIGRATION: Add missing columns to existing matches table
-- =============================================================================

-- Add missing columns to existing matches table if they don't exist
DO $$
BEGIN
    -- Add match_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'match_number') THEN
        ALTER TABLE matches ADD COLUMN match_number TEXT UNIQUE DEFAULT ('MATCH-' || LPAD(NEXTVAL('match_number_seq')::TEXT, 6, '0'));
        RAISE NOTICE 'Added column: matches.match_number';
    END IF;

    -- Add quality_score column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'quality_score') THEN
        ALTER TABLE matches ADD COLUMN quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100);
        RAISE NOTICE 'Added column: matches.quality_score';
    END IF;

    -- Add match_reasons column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'match_reasons') THEN
        ALTER TABLE matches ADD COLUMN match_reasons TEXT[];
        RAISE NOTICE 'Added column: matches.match_reasons';
    END IF;

    -- Add algorithm_version column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'algorithm_version') THEN
        ALTER TABLE matches ADD COLUMN algorithm_version TEXT DEFAULT '1.0';
        RAISE NOTICE 'Added column: matches.algorithm_version';
    END IF;

    -- Add viewed_by_buyer column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'viewed_by_buyer') THEN
        ALTER TABLE matches ADD COLUMN viewed_by_buyer BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added column: matches.viewed_by_buyer';
    END IF;

    -- Add viewed_by_seller column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'viewed_by_seller') THEN
        ALTER TABLE matches ADD COLUMN viewed_by_seller BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added column: matches.viewed_by_seller';
    END IF;

    -- Add buyer_viewed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'buyer_viewed_at') THEN
        ALTER TABLE matches ADD COLUMN buyer_viewed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added column: matches.buyer_viewed_at';
    END IF;

    -- Add seller_viewed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'seller_viewed_at') THEN
        ALTER TABLE matches ADD COLUMN seller_viewed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added column: matches.seller_viewed_at';
    END IF;

    -- Add expires_at column if it doesn't exist (THIS IS THE KEY FIX)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'expires_at') THEN
        ALTER TABLE matches ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');
        RAISE NOTICE 'Added column: matches.expires_at';
    END IF;

    -- Add generated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'generated_at') THEN
        ALTER TABLE matches ADD COLUMN generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
        RAISE NOTICE 'Added column: matches.generated_at';
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'notes') THEN
        ALTER TABLE matches ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added column: matches.notes';
    END IF;

    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'matches' AND column_name = 'metadata') THEN
        ALTER TABLE matches ADD COLUMN metadata JSONB DEFAULT '{}';
        RAISE NOTICE 'Added column: matches.metadata';
    END IF;

    -- Fix compatibility_score data type if needed (existing table uses DECIMAL, enhanced schema expects INTEGER)
    -- Convert DECIMAL(3,2) values (0.00-1.00) to INTEGER (0-100)
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'matches' AND column_name = 'compatibility_score'
               AND data_type = 'numeric') THEN
        -- Update existing values to integer scale (0.75 -> 75)
        UPDATE matches SET compatibility_score = compatibility_score * 100
        WHERE compatibility_score <= 1.0;

        -- Change column type to INTEGER
        ALTER TABLE matches ALTER COLUMN compatibility_score TYPE INTEGER;

        -- Add constraint for 0-100 range
        ALTER TABLE matches ADD CONSTRAINT check_compatibility_score_range
            CHECK (compatibility_score >= 0 AND compatibility_score <= 100);

        RAISE NOTICE 'Converted compatibility_score from DECIMAL to INTEGER (0-100 scale)';
    END IF;
END $$;

-- =============================================================================
-- TABLE CREATION: Matchmaking system tables
-- =============================================================================

-- Matches table - SKIP CREATION, already exists
-- Note: The matches table already exists from the base schema
-- We've added missing columns above via ALTER TABLE statements
-- This ensures compatibility with the existing table structure

-- User preferences table - stores user matching preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- User relationship
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Business preferences
    business_types TEXT[], -- Preferred business types
    price_min DECIMAL(15,2),
    price_max DECIMAL(15,2),
    revenue_min DECIMAL(15,2),
    revenue_max DECIMAL(15,2),
    
    -- Location preferences
    locations TEXT[], -- Preferred locations/regions
    max_distance INTEGER, -- Maximum distance in miles
    
    -- Timeline preferences
    timeline TEXT, -- 'immediate', '30_days', '60_days', '90_days', 'flexible'
    
    -- Experience and qualifications
    experience_years INTEGER,
    industry_experience TEXT[],
    
    -- Financing details (for buyers)
    financing_details JSONB DEFAULT '{}',
    
    -- Notification preferences
    notification_frequency TEXT DEFAULT 'daily', -- 'immediate', 'daily', 'weekly'
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    
    -- Algorithm preferences
    min_compatibility_score INTEGER DEFAULT 60,
    max_matches_per_day INTEGER DEFAULT 10,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure one preference record per user
    UNIQUE(user_id)
);

-- Match feedback table - stores user feedback on matches
CREATE TABLE IF NOT EXISTS match_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Feedback details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_type feedback_type NOT NULL,
    comments TEXT,
    helpful BOOLEAN, -- Was this match helpful?
    
    -- Specific feedback reasons
    reasons TEXT[], -- Array of reason codes
    
    -- Improvement suggestions
    suggestions TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure one feedback per user per match per type
    UNIQUE(match_id, user_id, feedback_type)
);

-- Match interactions table - tracks user interactions with matches
CREATE TABLE IF NOT EXISTS match_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Interaction details
    interaction_type interaction_type NOT NULL,
    
    -- Interaction metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Match scores table - detailed scoring breakdown for matches
CREATE TABLE IF NOT EXISTS match_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    
    -- Detailed scoring breakdown
    business_type_score INTEGER DEFAULT 0,
    price_range_score INTEGER DEFAULT 0,
    location_score INTEGER DEFAULT 0,
    experience_score INTEGER DEFAULT 0,
    timeline_score INTEGER DEFAULT 0,
    financing_score INTEGER DEFAULT 0,
    revenue_range_score INTEGER DEFAULT 0,
    
    -- Scoring weights used
    scoring_weights JSONB DEFAULT '{}',
    
    -- Algorithm details
    algorithm_version TEXT DEFAULT '1.0',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure one score record per match
    UNIQUE(match_id)
);

-- Algorithm learning data table - stores data for improving matching algorithm
CREATE TABLE IF NOT EXISTS algorithm_learning_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    
    -- Learning data
    feedback_rating INTEGER,
    feedback_type feedback_type,
    feedback_reasons TEXT[],
    
    -- Match characteristics at time of feedback
    match_characteristics JSONB DEFAULT '{}',
    
    -- Algorithm version
    algorithm_version TEXT DEFAULT '1.0',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Match analytics table - aggregated analytics for match performance
CREATE TABLE IF NOT EXISTS match_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Date for aggregation
    date DATE NOT NULL,
    
    -- Overall metrics
    total_matches_generated INTEGER DEFAULT 0,
    total_matches_viewed INTEGER DEFAULT 0,
    total_matches_contacted INTEGER DEFAULT 0,
    total_deals_created INTEGER DEFAULT 0,
    
    -- Quality metrics
    average_compatibility_score DECIMAL(5,2) DEFAULT 0,
    average_quality_score DECIMAL(5,2) DEFAULT 0,
    average_feedback_rating DECIMAL(3,2) DEFAULT 0,
    
    -- Conversion metrics
    view_rate DECIMAL(5,2) DEFAULT 0, -- Percentage of matches viewed
    contact_rate DECIMAL(5,2) DEFAULT 0, -- Percentage of matches contacted
    deal_conversion_rate DECIMAL(5,2) DEFAULT 0, -- Percentage converted to deals
    
    -- Algorithm performance
    algorithm_version TEXT DEFAULT '1.0',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique analytics per date
    UNIQUE(date)
);

-- Create sequences for auto-generated numbers
CREATE SEQUENCE IF NOT EXISTS match_number_seq START 1000;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_buyer_id ON matches(buyer_id);
CREATE INDEX IF NOT EXISTS idx_matches_seller_id ON matches(seller_id);
CREATE INDEX IF NOT EXISTS idx_matches_listing_id ON matches(listing_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_compatibility_score ON matches(compatibility_score);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);
CREATE INDEX IF NOT EXISTS idx_matches_expires_at ON matches(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_match_id ON match_feedback(match_id);
CREATE INDEX IF NOT EXISTS idx_match_feedback_user_id ON match_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_match_feedback_rating ON match_feedback(rating);

CREATE INDEX IF NOT EXISTS idx_match_interactions_match_id ON match_interactions(match_id);
CREATE INDEX IF NOT EXISTS idx_match_interactions_user_id ON match_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_interactions_type ON match_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_match_interactions_created_at ON match_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_match_scores_match_id ON match_scores(match_id);

CREATE INDEX IF NOT EXISTS idx_algorithm_learning_match_id ON algorithm_learning_data(match_id);
CREATE INDEX IF NOT EXISTS idx_algorithm_learning_created_at ON algorithm_learning_data(created_at);

CREATE INDEX IF NOT EXISTS idx_match_analytics_date ON match_analytics(date);

-- Note: Triggers are created later in the TRIGGERS section to avoid duplicates

-- Function to update match view tracking
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
$$ LANGUAGE plpgsql;

-- Create trigger for match view tracking
CREATE TRIGGER update_match_view_tracking_trigger
    AFTER INSERT ON match_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_match_view_tracking();

-- Function to expire old matches
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
$$ LANGUAGE plpgsql;

-- Function to calculate daily match analytics
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
        deal_conversion_rate = EXCLUDED.deal_conversion_rate;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- UTILITY FUNCTIONS: Create required functions before triggers
-- =============================================================================

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS: Create triggers for automatic timestamp updates
-- =============================================================================

-- Updated_at triggers (safe to recreate with additional checks)
DO $$
BEGIN
    -- Only create triggers if tables exist and triggers don't already exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_matches_updated_at') THEN
        CREATE TRIGGER update_matches_updated_at
            BEFORE UPDATE ON matches
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_user_preferences_updated_at') THEN
        CREATE TRIGGER update_user_preferences_updated_at
            BEFORE UPDATE ON user_preferences
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'match_feedback')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_match_feedback_updated_at') THEN
        CREATE TRIGGER update_match_feedback_updated_at
            BEFORE UPDATE ON match_feedback
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY: Enable RLS but don't create policies here
-- =============================================================================

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE algorithm_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DEPLOYMENT VERIFICATION
-- =============================================================================

-- Verify deployment completed successfully
DO $$
BEGIN
    RAISE NOTICE 'Matchmaking System Schema deployment completed successfully!';
    RAISE NOTICE 'Tables created: matches, user_preferences, match_feedback, match_interactions, match_scores, algorithm_learning_data, match_analytics';
    RAISE NOTICE 'Triggers created: update timestamps and match tracking';
    RAISE NOTICE 'RLS enabled on all tables (policies should be created separately)';
END $$;
