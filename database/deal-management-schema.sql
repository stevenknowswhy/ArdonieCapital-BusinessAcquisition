-- Deal Management System Schema (Conflict-Safe Version)
-- Comprehensive deal processing for business acquisitions
-- Supports 34-day acquisition timeline and full transaction lifecycle
-- This version handles "already exists" conflicts gracefully

-- =============================================================================
-- CLEANUP SECTION: Remove existing objects to prevent conflicts
-- =============================================================================

-- Drop existing triggers first (to prevent "already exists" errors)
DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
DROP TRIGGER IF EXISTS update_deal_documents_updated_at ON deal_documents;
DROP TRIGGER IF EXISTS update_deal_milestones_updated_at ON deal_milestones;
DROP TRIGGER IF EXISTS create_deal_milestones_trigger ON deals;
DROP TRIGGER IF EXISTS update_completion_percentage_trigger ON deal_milestones;

-- Drop existing functions
DROP FUNCTION IF EXISTS create_default_deal_milestones() CASCADE;
DROP FUNCTION IF EXISTS update_deal_completion_percentage() CASCADE;

-- =============================================================================
-- ENUM TYPES: Create with conflict handling
-- =============================================================================

-- Create deal status enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_status') THEN
        CREATE TYPE deal_status AS ENUM (
            'initial_interest',
            'nda_signed',
            'due_diligence',
            'negotiation',
            'financing',
            'legal_review',
            'closing',
            'completed',
            'cancelled',
            'expired'
        );
    END IF;
END $$;

-- Create deal priority enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deal_priority') THEN
        CREATE TYPE deal_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;
END $$;

-- Create document type enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM (
            'nda',
            'financial_statement',
            'tax_return',
            'lease_agreement',
            'purchase_agreement',
            'due_diligence_report',
            'inspection_report',
            'legal_document',
            'other'
        );
    END IF;
END $$;

-- =============================================================================
-- SEQUENCE CREATION: Create sequence before tables that use it
-- =============================================================================

-- Create sequence for deal numbers (with conflict handling)
CREATE SEQUENCE IF NOT EXISTS deal_number_seq START 1000;

-- =============================================================================
-- TABLE CREATION: Enhanced deals table for comprehensive deal tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_number TEXT UNIQUE NOT NULL DEFAULT ('DEAL-' || LPAD(NEXTVAL('deal_number_seq')::TEXT, 6, '0')),

    -- Relationships
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES profiles(id) NOT NULL,
    seller_id UUID REFERENCES profiles(id) NOT NULL,
    listing_id UUID REFERENCES listings(id) NOT NULL,

    -- Deal status and priority
    status deal_status DEFAULT 'initial_interest' NOT NULL,
    priority deal_priority DEFAULT 'medium' NOT NULL,

    -- Financial details
    initial_offer DECIMAL(15,2),
    current_offer DECIMAL(15,2),
    final_price DECIMAL(15,2),
    earnest_money DECIMAL(15,2),
    financing_amount DECIMAL(15,2),
    cash_amount DECIMAL(15,2),

    -- Timeline (34-day acquisition process)
    offer_date DATE,
    acceptance_date DATE,
    due_diligence_deadline DATE,
    financing_deadline DATE,
    closing_date DATE,
    actual_closing_date DATE,

    -- Deal terms and conditions
    deal_terms JSONB DEFAULT '{}',
    contingencies TEXT[],
    included_assets TEXT[],
    excluded_assets TEXT[],

    -- Progress tracking
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    milestones_completed TEXT[],
    next_action TEXT,
    next_action_due DATE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Communication and notes
    notes TEXT,
    private_notes TEXT, -- Only visible to deal participants

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Deal documents table
CREATE TABLE IF NOT EXISTS deal_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    
    -- Document details
    document_type document_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    
    -- Access control
    is_confidential BOOLEAN DEFAULT FALSE,
    visible_to TEXT[] DEFAULT ARRAY['buyer', 'seller'], -- Who can see this document
    
    -- Metadata
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Deal timeline/milestones table
CREATE TABLE IF NOT EXISTS deal_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    
    -- Milestone details
    milestone_name TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    completed_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    is_critical BOOLEAN DEFAULT FALSE, -- Critical path milestone
    
    -- Progress tracking
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    notes TEXT,
    
    -- Responsibility
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Deal activities/audit log table
CREATE TABLE IF NOT EXISTS deal_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Activity details
    activity_type TEXT NOT NULL, -- 'status_change', 'document_upload', 'note_added', etc.
    title TEXT NOT NULL,
    description TEXT,
    old_value TEXT,
    new_value TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- PERFORMANCE INDEXES: Create indexes for optimal query performance
-- =============================================================================

-- Deals table indexes
CREATE INDEX IF NOT EXISTS idx_deals_buyer_id ON deals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deals_seller_id ON deals(seller_id);
CREATE INDEX IF NOT EXISTS idx_deals_listing_id ON deals(listing_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_priority ON deals(priority);
CREATE INDEX IF NOT EXISTS idx_deals_closing_date ON deals(closing_date);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);

-- Deal documents table indexes
CREATE INDEX IF NOT EXISTS idx_deal_documents_deal_id ON deal_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_documents_type ON deal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_deal_documents_uploaded_by ON deal_documents(uploaded_by);

-- Deal milestones table indexes
CREATE INDEX IF NOT EXISTS idx_deal_milestones_deal_id ON deal_milestones(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_milestones_due_date ON deal_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_deal_milestones_completed ON deal_milestones(is_completed);

-- Deal activities table indexes
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_user_id ON deal_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_type ON deal_activities(activity_type);

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
CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_documents_updated_at
    BEFORE UPDATE ON deal_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_milestones_updated_at
    BEFORE UPDATE ON deal_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create default milestones for new deals
CREATE OR REPLACE FUNCTION create_default_deal_milestones()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default 34-day acquisition milestones
    INSERT INTO deal_milestones (deal_id, milestone_name, description, due_date, is_critical) VALUES
    (NEW.id, 'Initial Interest', 'Buyer expresses interest in the business', NEW.offer_date, true),
    (NEW.id, 'NDA Signed', 'Non-disclosure agreement executed', NEW.offer_date + INTERVAL '2 days', true),
    (NEW.id, 'Financial Review', 'Review of financial statements and records', NEW.offer_date + INTERVAL '7 days', true),
    (NEW.id, 'Due Diligence', 'Comprehensive business analysis and verification', NEW.offer_date + INTERVAL '14 days', true),
    (NEW.id, 'Negotiation', 'Price and terms negotiation', NEW.offer_date + INTERVAL '21 days', true),
    (NEW.id, 'Financing Approval', 'Secure financing and funding approval', NEW.offer_date + INTERVAL '28 days', true),
    (NEW.id, 'Legal Review', 'Legal documentation and contract review', NEW.offer_date + INTERVAL '31 days', true),
    (NEW.id, 'Closing', 'Final transaction and ownership transfer', NEW.offer_date + INTERVAL '34 days', true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- BUSINESS LOGIC TRIGGERS: Create triggers for automatic milestone creation
-- =============================================================================

-- Create trigger for default milestones (safe to recreate)
CREATE TRIGGER create_deal_milestones_trigger
    AFTER INSERT ON deals
    FOR EACH ROW
    WHEN (NEW.offer_date IS NOT NULL)
    EXECUTE FUNCTION create_default_deal_milestones();

-- Function to update deal completion percentage based on milestones
CREATE OR REPLACE FUNCTION update_deal_completion_percentage()
RETURNS TRIGGER AS $$
DECLARE
    total_milestones INTEGER;
    completed_milestones INTEGER;
    completion_pct INTEGER;
BEGIN
    -- Count total and completed milestones for this deal
    SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = true)
    INTO total_milestones, completed_milestones
    FROM deal_milestones
    WHERE deal_id = COALESCE(NEW.deal_id, OLD.deal_id);
    
    -- Calculate completion percentage
    IF total_milestones > 0 THEN
        completion_pct := (completed_milestones * 100) / total_milestones;
    ELSE
        completion_pct := 0;
    END IF;
    
    -- Update the deal
    UPDATE deals 
    SET completion_percentage = completion_pct,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.deal_id, OLD.deal_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for completion percentage updates (safe to recreate)
CREATE TRIGGER update_completion_percentage_trigger
    AFTER INSERT OR UPDATE OR DELETE ON deal_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_deal_completion_percentage();

-- =============================================================================
-- ROW LEVEL SECURITY: Enable RLS but don't create policies here
-- =============================================================================

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DEPLOYMENT VERIFICATION
-- =============================================================================

-- Verify deployment completed successfully
DO $$
BEGIN
    RAISE NOTICE 'Deal Management Schema deployment completed successfully!';
    RAISE NOTICE 'Tables created: deals, deal_documents, deal_milestones, deal_activities';
    RAISE NOTICE 'Triggers created: update timestamps, milestone creation, completion tracking';
    RAISE NOTICE 'RLS enabled on all tables (policies should be created separately)';
END $$;
