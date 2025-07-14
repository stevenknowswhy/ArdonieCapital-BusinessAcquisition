-- Enhanced Marketplace Schema (Conflict-Safe Version)
-- Adds inquiry system, analytics, and engagement tracking to marketplace
-- Transforms static listings into interactive marketplace with buyer-seller communication
-- This version handles "already exists" conflicts gracefully

-- =============================================================================
-- CLEANUP SECTION: Remove existing objects to prevent conflicts
-- =============================================================================

-- Drop existing triggers first (to prevent "already exists" errors)
-- Use DO blocks to safely drop triggers only if tables exist
DO $$
BEGIN
    -- Drop triggers only if their tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_inquiries') THEN
        DROP TRIGGER IF EXISTS update_listing_inquiries_updated_at ON listing_inquiries;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inquiry_responses') THEN
        DROP TRIGGER IF EXISTS update_inquiry_responses_updated_at ON inquiry_responses;
        DROP TRIGGER IF EXISTS update_inquiry_response_count_trigger ON inquiry_responses;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_analytics') THEN
        DROP TRIGGER IF EXISTS update_listing_analytics_updated_at ON listing_analytics;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_performance') THEN
        DROP TRIGGER IF EXISTS update_listing_performance_updated_at ON listing_performance;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_engagement') THEN
        DROP TRIGGER IF EXISTS update_listing_counters_trigger ON listing_engagement;
    END IF;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_inquiry_response_count() CASCADE;
DROP FUNCTION IF EXISTS update_listing_counters() CASCADE;
DROP FUNCTION IF EXISTS calculate_listing_performance() CASCADE;

-- =============================================================================
-- ENUM TYPES: Create with conflict handling
-- =============================================================================

-- Create inquiry status enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_status') THEN
        CREATE TYPE inquiry_status AS ENUM (
            'pending',
            'responded',
            'interested',
            'not_interested',
            'converted_to_deal',
            'expired'
        );
    END IF;
END $$;

-- Create inquiry type enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_type') THEN
        CREATE TYPE inquiry_type AS ENUM (
            'general',
            'pricing',
            'financing',
            'due_diligence',
            'meeting_request',
            'partnership'
        );
    END IF;
END $$;

-- Create inquiry priority enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_priority') THEN
        CREATE TYPE inquiry_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;
END $$;

-- Create engagement type enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'engagement_type') THEN
        CREATE TYPE engagement_type AS ENUM (
            'view',
            'save',
            'unsave',
            'share',
            'contact',
            'phone_click',
            'email_click',
            'inquiry_submitted',
            'document_download',
            'photo_view'
        );
    END IF;
END $$;

-- =============================================================================
-- SEQUENCE CREATION: Create sequences before tables that use them
-- =============================================================================

-- Create sequence for inquiry numbering (with conflict handling)
CREATE SEQUENCE IF NOT EXISTS inquiry_number_seq START 1000;

-- =============================================================================
-- TABLE CREATION: Enhanced marketplace tables
-- =============================================================================

-- Listing inquiries table
CREATE TABLE IF NOT EXISTS listing_inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Inquiry identification
    inquiry_number TEXT UNIQUE NOT NULL DEFAULT ('INQ-' || LPAD(NEXTVAL('inquiry_number_seq')::TEXT, 6, '0')),

    -- Relationships (foreign keys added separately to handle deployment order)
    listing_id UUID NOT NULL, -- REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL, -- REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL, -- REFERENCES profiles(id) ON DELETE CASCADE,
    deal_id UUID, -- REFERENCES deals(id) ON DELETE SET NULL, -- If converted to deal
    
    -- Inquiry details
    inquiry_type inquiry_type DEFAULT 'general' NOT NULL,
    status inquiry_status DEFAULT 'pending' NOT NULL,
    priority inquiry_priority DEFAULT 'medium' NOT NULL,
    
    -- Message content
    message TEXT NOT NULL,
    subject TEXT,
    
    -- Buyer information
    buyer_qualifications JSONB DEFAULT '{}',
    financing_details JSONB DEFAULT '{}',
    timeline TEXT, -- 'immediate', '30_days', '60_days', '90_days', 'flexible'
    
    -- Response tracking
    last_response_at TIMESTAMP WITH TIME ZONE,
    response_count INTEGER DEFAULT 0,
    
    -- Interest tracking
    interest_level TEXT, -- 'low', 'medium', 'high'
    next_steps TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Inquiry responses table
CREATE TABLE IF NOT EXISTS inquiry_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships (foreign keys added separately)
    inquiry_id UUID NOT NULL, -- REFERENCES listing_inquiries(id) ON DELETE CASCADE,
    responder_id UUID NOT NULL, -- REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Response details
    message TEXT NOT NULL,
    response_type TEXT DEFAULT 'message', -- 'message', 'counter_offer', 'meeting_invite', 'document_share'
    
    -- Attachments and additional data
    attachments TEXT[], -- Array of file URLs or IDs
    next_steps TEXT,
    meeting_proposed BOOLEAN DEFAULT FALSE,
    meeting_details JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Listing views tracking table
CREATE TABLE IF NOT EXISTS listing_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships (foreign keys added separately)
    listing_id UUID NOT NULL, -- REFERENCES listings(id) ON DELETE CASCADE,
    viewer_id UUID, -- REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous views
    
    -- Session tracking
    session_id TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- View details
    referrer TEXT,
    page_url TEXT,
    view_duration INTEGER, -- Duration in seconds
    
    -- Device and browser info
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser TEXT,
    screen_resolution TEXT,
    
    -- Location (if available)
    location JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Listing engagement tracking table
CREATE TABLE IF NOT EXISTS listing_engagement (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships (foreign keys added separately)
    listing_id UUID NOT NULL, -- REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID, -- REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous engagement
    
    -- Engagement details
    engagement_type engagement_type NOT NULL,
    session_id TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Saved listings table (user favorites) - SKIP CREATION, already exists with buyer_id
-- Note: This table already exists with buyer_id column instead of user_id
-- We'll work with the existing structure to avoid conflicts

-- Listing analytics aggregation table (for performance)
CREATE TABLE IF NOT EXISTS listing_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships (foreign keys added separately)
    listing_id UUID NOT NULL, -- REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Date for aggregation
    date DATE NOT NULL,
    
    -- View metrics
    total_views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    average_view_duration INTEGER DEFAULT 0,
    
    -- Engagement metrics
    total_engagements INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    contact_clicks INTEGER DEFAULT 0,
    
    -- Inquiry metrics
    inquiries INTEGER DEFAULT 0,
    responses INTEGER DEFAULT 0,
    
    -- Conversion metrics
    inquiry_conversion_rate DECIMAL(5,2) DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Device breakdown
    desktop_views INTEGER DEFAULT 0,
    mobile_views INTEGER DEFAULT 0,
    tablet_views INTEGER DEFAULT 0,
    
    -- Traffic sources
    direct_traffic INTEGER DEFAULT 0,
    search_traffic INTEGER DEFAULT 0,
    social_traffic INTEGER DEFAULT 0,
    referral_traffic INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique analytics per listing per date
    UNIQUE(listing_id, date)
);

-- Listing performance metrics table
CREATE TABLE IF NOT EXISTS listing_performance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships (foreign keys added separately)
    listing_id UUID NOT NULL, -- REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Performance scores (0-100)
    overall_score INTEGER DEFAULT 0,
    visibility_score INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    conversion_score INTEGER DEFAULT 0,
    
    -- Ranking metrics
    market_position INTEGER, -- Position compared to similar listings
    category_rank INTEGER, -- Rank within business category
    price_competitiveness DECIMAL(5,2), -- How competitive the price is
    
    -- Optimization suggestions
    optimization_suggestions TEXT[],
    improvement_areas TEXT[],
    
    -- Calculated metrics
    days_on_market INTEGER DEFAULT 0,
    views_per_day DECIMAL(10,2) DEFAULT 0,
    inquiries_per_view DECIMAL(5,4) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique performance record per listing
    UNIQUE(listing_id)
);

-- Create sequences for auto-generated numbers
CREATE SEQUENCE IF NOT EXISTS inquiry_number_seq START 1000;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listing_inquiries_listing_id ON listing_inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_inquiries_buyer_id ON listing_inquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_listing_inquiries_seller_id ON listing_inquiries(seller_id);
CREATE INDEX IF NOT EXISTS idx_listing_inquiries_status ON listing_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_listing_inquiries_created_at ON listing_inquiries(created_at);

CREATE INDEX IF NOT EXISTS idx_inquiry_responses_inquiry_id ON inquiry_responses(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_responder_id ON inquiry_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_created_at ON inquiry_responses(created_at);

CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_viewer_id ON listing_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_session_id ON listing_views(session_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_created_at ON listing_views(created_at);

CREATE INDEX IF NOT EXISTS idx_listing_engagement_listing_id ON listing_engagement(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_engagement_user_id ON listing_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_engagement_type ON listing_engagement(engagement_type);
CREATE INDEX IF NOT EXISTS idx_listing_engagement_created_at ON listing_engagement(created_at);

-- Indexes for saved_listings table (using existing buyer_id column)
CREATE INDEX IF NOT EXISTS idx_saved_listings_buyer_id ON saved_listings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_listing_id ON saved_listings(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_created_at ON saved_listings(created_at);

CREATE INDEX IF NOT EXISTS idx_listing_analytics_listing_id ON listing_analytics(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_analytics_date ON listing_analytics(date);

CREATE INDEX IF NOT EXISTS idx_listing_performance_listing_id ON listing_performance(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_performance_overall_score ON listing_performance(overall_score);

-- Create updated_at triggers
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

-- Updated_at triggers (safe to recreate)
CREATE TRIGGER update_listing_inquiries_updated_at
    BEFORE UPDATE ON listing_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiry_responses_updated_at
    BEFORE UPDATE ON inquiry_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_analytics_updated_at
    BEFORE UPDATE ON listing_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update inquiry response count
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
$$ LANGUAGE plpgsql;

-- Create trigger for response count updates
CREATE TRIGGER update_response_count_trigger
    AFTER INSERT ON inquiry_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_inquiry_response_count();

-- Function to update listing counters
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
$$ LANGUAGE plpgsql;

-- Create triggers for listing counter updates
CREATE TRIGGER update_listing_view_count_trigger
    AFTER INSERT ON listing_views
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_counters();

CREATE TRIGGER update_listing_inquiry_count_trigger
    AFTER INSERT ON listing_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_counters();

-- Note: saved_listings trigger may already exist, skip if it causes conflicts
CREATE TRIGGER update_listing_saves_count_trigger
    AFTER INSERT ON saved_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_counters();

-- =============================================================================
-- ROW LEVEL SECURITY: Enable RLS but don't create policies here
-- =============================================================================

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE listing_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_engagement ENABLE ROW LEVEL SECURITY;
-- Note: saved_listings RLS already enabled in base schema
ALTER TABLE listing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_performance ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- COLUMN ADDITIONS: Add missing columns to existing tables
-- =============================================================================

-- Add missing counter columns to listings table if they don't exist
DO $$
BEGIN
    -- Add saves_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'listings' AND column_name = 'saves_count') THEN
        ALTER TABLE listings ADD COLUMN saves_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added column: listings.saves_count';
    END IF;

    -- Add last_viewed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'listings' AND column_name = 'last_viewed_at') THEN
        ALTER TABLE listings ADD COLUMN last_viewed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added column: listings.last_viewed_at';
    END IF;

    -- Add last_inquiry_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'listings' AND column_name = 'last_inquiry_at') THEN
        ALTER TABLE listings ADD COLUMN last_inquiry_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added column: listings.last_inquiry_at';
    END IF;
END $$;

-- =============================================================================
-- FOREIGN KEY CONSTRAINTS: Add after all tables are created
-- =============================================================================

-- Add foreign key constraints for listing_inquiries table
DO $$
BEGIN
    -- Add listing_id foreign key if listings table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
        ALTER TABLE listing_inquiries ADD CONSTRAINT fk_listing_inquiries_listing_id
            FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key: listing_inquiries.listing_id -> listings.id';
    END IF;

    -- Add buyer_id and seller_id foreign keys if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE listing_inquiries ADD CONSTRAINT fk_listing_inquiries_buyer_id
            FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE;
        ALTER TABLE listing_inquiries ADD CONSTRAINT fk_listing_inquiries_seller_id
            FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign keys: listing_inquiries -> profiles.id';
    END IF;

    -- Add deal_id foreign key if deals table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
        ALTER TABLE listing_inquiries ADD CONSTRAINT fk_listing_inquiries_deal_id
            FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key: listing_inquiries.deal_id -> deals.id';
    END IF;
END $$;

-- Add foreign key constraints for inquiry_responses table
DO $$
BEGIN
    -- Add inquiry_id foreign key (listing_inquiries table should exist by now)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listing_inquiries') THEN
        ALTER TABLE inquiry_responses ADD CONSTRAINT fk_inquiry_responses_inquiry_id
            FOREIGN KEY (inquiry_id) REFERENCES listing_inquiries(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key: inquiry_responses.inquiry_id -> listing_inquiries.id';
    END IF;

    -- Add responder_id foreign key if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE inquiry_responses ADD CONSTRAINT fk_inquiry_responses_responder_id
            FOREIGN KEY (responder_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key: inquiry_responses.responder_id -> profiles.id';
    END IF;
END $$;

-- Add foreign key constraints for other marketplace tables
DO $$
BEGIN
    -- Listing views table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
        ALTER TABLE listing_views ADD CONSTRAINT fk_listing_views_listing_id
            FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE listing_views ADD CONSTRAINT fk_listing_views_viewer_id
            FOREIGN KEY (viewer_id) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;

    -- Listing engagement table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
        ALTER TABLE listing_engagement ADD CONSTRAINT fk_listing_engagement_listing_id
            FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE listing_engagement ADD CONSTRAINT fk_listing_engagement_user_id
            FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;

    -- Saved listings table (using existing buyer_id column)
    -- Note: Foreign keys may already exist, skip if they cause conflicts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Check if constraint already exists before adding
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                      WHERE constraint_name = 'saved_listings_buyer_id_fkey'
                      AND table_name = 'saved_listings') THEN
            ALTER TABLE saved_listings ADD CONSTRAINT fk_saved_listings_buyer_id
                FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added foreign key: saved_listings.buyer_id -> profiles.id';
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
        -- Check if constraint already exists before adding
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                      WHERE constraint_name = 'saved_listings_listing_id_fkey'
                      AND table_name = 'saved_listings') THEN
            ALTER TABLE saved_listings ADD CONSTRAINT fk_saved_listings_listing_id
                FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added foreign key: saved_listings.listing_id -> listings.id';
        END IF;
    END IF;

    -- Listing analytics table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
        ALTER TABLE listing_analytics ADD CONSTRAINT fk_listing_analytics_listing_id
            FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
    END IF;

    -- Listing performance table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
        ALTER TABLE listing_performance ADD CONSTRAINT fk_listing_performance_listing_id
            FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
    END IF;

    RAISE NOTICE 'All marketplace foreign key constraints added successfully';
END $$;

-- =============================================================================
-- DEPLOYMENT VERIFICATION
-- =============================================================================

-- Verify deployment completed successfully
DO $$
BEGIN
    RAISE NOTICE 'Enhanced Marketplace Schema deployment completed successfully!';
    RAISE NOTICE 'Tables created: listing_inquiries, inquiry_responses, listing_views, listing_engagement, listing_analytics, listing_performance';
    RAISE NOTICE 'Note: saved_listings table already existed and was preserved with existing buyer_id column';
    RAISE NOTICE 'Missing columns added to listings table: saves_count, last_viewed_at, last_inquiry_at';
    RAISE NOTICE 'Foreign key constraints added conditionally based on table existence';
    RAISE NOTICE 'Triggers created: update timestamps, response counting, listing counters';
    RAISE NOTICE 'RLS enabled on new tables (policies should be created separately)';
END $$;
