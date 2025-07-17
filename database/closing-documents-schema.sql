-- Closing Documents Management System Schema
-- This file contains the database schema for the comprehensive closing documents management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for closing documents
DO $$ BEGIN
    CREATE TYPE deal_status AS ENUM ('in-progress', 'pending-review', 'completed', 'on-hold', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deal_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('pending', 'in-review', 'completed', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_category AS ENUM ('purchase', 'due-diligence', 'financing', 'legal', 'employment', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE template_type AS ENUM ('contract', 'form', 'checklist', 'letter', 'report');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM ('created', 'updated', 'uploaded', 'downloaded', 'reviewed', 'approved', 'rejected', 'signed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Deals table for managing business acquisition deals
CREATE TABLE IF NOT EXISTS deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_number TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    purchase_price DECIMAL(15,2) NOT NULL,
    location TEXT NOT NULL,
    city TEXT,
    state TEXT,
    status deal_status DEFAULT 'in-progress' NOT NULL,
    priority deal_priority DEFAULT 'medium' NOT NULL,
    closing_date DATE,
    days_to_closing INTEGER,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    next_milestone TEXT,
    deal_terms JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Documents table for tracking all deal-related documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category document_category NOT NULL,
    status document_status DEFAULT 'pending' NOT NULL,
    file_path TEXT,
    file_size BIGINT,
    file_type TEXT,
    version INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT FALSE,
    due_date DATE,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Document templates table for reusable templates
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category document_category NOT NULL,
    type template_type NOT NULL,
    format TEXT NOT NULL, -- pdf, docx, html, etc.
    file_path TEXT,
    file_size BIGINT,
    preview_content TEXT,
    tags TEXT[],
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    rating_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Document activities table for audit trail and timeline
CREATE TABLE IF NOT EXISTS document_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    activity_type activity_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Deal participants table for managing access control
CREATE TABLE IF NOT EXISTS deal_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL, -- buyer, seller, agent, attorney, lender, etc.
    permissions TEXT[] DEFAULT ARRAY['read'], -- read, write, approve, sign
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(deal_id, user_id)
);

-- Document signatures table for tracking signature requirements
CREATE TABLE IF NOT EXISTS document_signatures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    signer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    signer_role TEXT NOT NULL,
    signature_required BOOLEAN DEFAULT TRUE,
    signed_at TIMESTAMP WITH TIME ZONE,
    signature_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_buyer_id ON deals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deals_seller_id ON deals(seller_id);
CREATE INDEX IF NOT EXISTS idx_deals_agent_id ON deals(agent_id);
CREATE INDEX IF NOT EXISTS idx_deals_closing_date ON deals(closing_date);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);

CREATE INDEX IF NOT EXISTS idx_documents_deal_id ON documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(type);
CREATE INDEX IF NOT EXISTS idx_document_templates_is_active ON document_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_document_activities_deal_id ON document_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_document_activities_document_id ON document_activities(document_id);
CREATE INDEX IF NOT EXISTS idx_document_activities_user_id ON document_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_document_activities_created_at ON document_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_deal_participants_deal_id ON deal_participants(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_participants_user_id ON deal_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_signer_id ON document_signatures(signer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_templates_updated_at ON document_templates;
CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;

-- Deals RLS Policies
DROP POLICY IF EXISTS "Users can view deals they participate in" ON deals;
CREATE POLICY "Users can view deals they participate in" ON deals
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM deal_participants 
            WHERE deal_id = deals.id AND is_active = true
        )
        OR auth.uid() = buyer_id 
        OR auth.uid() = seller_id 
        OR auth.uid() = agent_id
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Agents and admins can create deals" ON deals;
CREATE POLICY "Agents and admins can create deals" ON deals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'seller')
        )
    );

DROP POLICY IF EXISTS "Deal participants can update deals" ON deals;
CREATE POLICY "Deal participants can update deals" ON deals
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM deal_participants 
            WHERE deal_id = deals.id AND is_active = true
            AND 'write' = ANY(permissions)
        )
        OR auth.uid() = agent_id
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Documents RLS Policies
DROP POLICY IF EXISTS "Users can view documents for their deals" ON documents;
CREATE POLICY "Users can view documents for their deals" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE id = documents.deal_id
            AND (
                auth.uid() IN (
                    SELECT user_id FROM deal_participants 
                    WHERE deal_id = deals.id AND is_active = true
                )
                OR auth.uid() = buyer_id 
                OR auth.uid() = seller_id 
                OR auth.uid() = agent_id
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

DROP POLICY IF EXISTS "Deal participants can upload documents" ON documents;
CREATE POLICY "Deal participants can upload documents" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE id = documents.deal_id
            AND (
                auth.uid() IN (
                    SELECT user_id FROM deal_participants 
                    WHERE deal_id = deals.id AND is_active = true
                    AND 'write' = ANY(permissions)
                )
                OR auth.uid() = buyer_id 
                OR auth.uid() = seller_id 
                OR auth.uid() = agent_id
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- Document Templates RLS Policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view active templates" ON document_templates;
CREATE POLICY "Anyone can view active templates" ON document_templates
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage templates" ON document_templates;
CREATE POLICY "Admins can manage templates" ON document_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Document Activities RLS Policies
DROP POLICY IF EXISTS "Users can view activities for their deals" ON document_activities;
CREATE POLICY "Users can view activities for their deals" ON document_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE id = document_activities.deal_id
            AND (
                auth.uid() IN (
                    SELECT user_id FROM deal_participants 
                    WHERE deal_id = deals.id AND is_active = true
                )
                OR auth.uid() = buyer_id 
                OR auth.uid() = seller_id 
                OR auth.uid() = agent_id
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- Deal Participants RLS Policies
DROP POLICY IF EXISTS "Users can view participants for their deals" ON deal_participants;
CREATE POLICY "Users can view participants for their deals" ON deal_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE id = deal_participants.deal_id
            AND (
                auth.uid() IN (
                    SELECT user_id FROM deal_participants dp2
                    WHERE dp2.deal_id = deals.id AND dp2.is_active = true
                )
                OR auth.uid() = buyer_id 
                OR auth.uid() = seller_id 
                OR auth.uid() = agent_id
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- Document Signatures RLS Policies
DROP POLICY IF EXISTS "Users can view signatures for their documents" ON document_signatures;
CREATE POLICY "Users can view signatures for their documents" ON document_signatures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents d
            JOIN deals de ON d.deal_id = de.id
            WHERE d.id = document_signatures.document_id
            AND (
                auth.uid() IN (
                    SELECT user_id FROM deal_participants 
                    WHERE deal_id = de.id AND is_active = true
                )
                OR auth.uid() = de.buyer_id 
                OR auth.uid() = de.seller_id 
                OR auth.uid() = de.agent_id
                OR auth.uid() = document_signatures.signer_id
                OR EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                )
            )
        )
    );
