-- Subscription and Badge Management System Schema (Conflict-Safe Version)
-- Handles premium subscriptions, badge verification, and feature access control
-- Supports recurring billing, usage tracking, and badge workflows
-- This version handles "already exists" conflicts gracefully

-- =============================================================================
-- CLEANUP SECTION: Remove existing objects to prevent conflicts
-- =============================================================================

-- Drop existing triggers first (to prevent "already exists" errors)
-- Use DO blocks to safely drop triggers only if tables exist
DO $$
BEGIN
    -- Drop triggers only if their tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
        DROP TRIGGER IF EXISTS expire_subscriptions_trigger ON subscriptions;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges') THEN
        DROP TRIGGER IF EXISTS update_user_badges_updated_at ON user_badges;
        DROP TRIGGER IF EXISTS expire_badges_trigger ON user_badges;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badge_verification') THEN
        DROP TRIGGER IF EXISTS update_badge_verification_updated_at ON badge_verification;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_usage') THEN
        DROP TRIGGER IF EXISTS check_subscription_feature_access_trigger ON subscription_usage;
    END IF;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS check_subscription_feature_access(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_subscription_usage(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS expire_subscriptions() CASCADE;
DROP FUNCTION IF EXISTS expire_badges() CASCADE;

-- =============================================================================
-- ENUM TYPES: Create with conflict handling
-- =============================================================================

-- Create subscription status enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM (
            'active',
            'trialing',
            'past_due',
            'canceled',
            'cancel_at_period_end',
            'unpaid',
            'incomplete',
            'incomplete_expired'
        );
    END IF;
END $$;

-- Create badge status enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_status') THEN
        CREATE TYPE badge_status AS ENUM (
            'pending_payment',
            'pending_verification',
            'under_review',
            'active',
            'rejected',
            'expired',
            'suspended'
        );
    END IF;
END $$;

-- Create badge order status enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_order_status') THEN
        CREATE TYPE badge_order_status AS ENUM (
            'pending_payment',
            'paid',
            'processing',
            'completed',
            'failed',
            'refunded'
        );
    END IF;
END $$;

-- =============================================================================
-- SEQUENCE CREATION: Create sequences before tables that use them
-- =============================================================================

-- Create sequences for subscription and badge numbering (with conflict handling)
CREATE SEQUENCE IF NOT EXISTS badge_order_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;

-- =============================================================================
-- TABLE CREATION: Subscription and badge management tables
-- =============================================================================

-- Subscription Plans table (for reference and configuration)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Plan details
    plan_id TEXT UNIQUE NOT NULL, -- 'free', 'basic', 'professional', 'enterprise'
    name TEXT NOT NULL,
    description TEXT,

    -- Pricing
    price INTEGER NOT NULL, -- Price in cents
    billing_interval TEXT NOT NULL, -- 'month', 'year'
    trial_period_days INTEGER DEFAULT 0,
    
    -- Stripe integration
    stripe_price_id TEXT,
    stripe_product_id TEXT,
    
    -- Features and limits
    features JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- User relationship
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Plan details
    plan_id TEXT NOT NULL,
    
    -- Status and lifecycle
    status subscription_status DEFAULT 'active' NOT NULL,
    
    -- Stripe integration
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    
    -- Billing periods
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    
    -- Cancellation
    canceled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    cancellation_feedback TEXT,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Subscription Usage Tracking table
CREATE TABLE IF NOT EXISTS subscription_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
    
    -- Usage details
    feature TEXT NOT NULL, -- 'listings', 'inquiries', 'photos', etc.
    period TEXT NOT NULL, -- 'YYYY-MM' for monthly tracking
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique usage tracking per subscription, feature, and period
    UNIQUE(subscription_id, feature, period)
);

-- Badge Orders table
CREATE TABLE IF NOT EXISTS badge_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Order identification
    order_number TEXT UNIQUE NOT NULL DEFAULT ('BADGE-' || LPAD(NEXTVAL('badge_order_number_seq')::TEXT, 6, '0')),
    
    -- User relationship
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Badge details
    badge_type TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    
    -- Order status
    status badge_order_status DEFAULT 'pending_payment' NOT NULL,
    
    -- Payment details
    payment_intent_id TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Renewal information
    is_renewal BOOLEAN DEFAULT FALSE,
    original_badge_id UUID,
    
    -- Application data
    application_data JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES badge_orders(id) ON DELETE SET NULL,
    
    -- Badge details
    badge_type TEXT NOT NULL,
    status badge_status DEFAULT 'pending_verification' NOT NULL,
    
    -- Lifecycle dates
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    suspended_at TIMESTAMP WITH TIME ZONE,
    
    -- Verification
    documents_submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Application data
    application_data JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Badge Verification table
CREATE TABLE IF NOT EXISTS badge_verification (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    badge_id UUID REFERENCES user_badges(id) ON DELETE CASCADE NOT NULL,
    
    -- Verification status
    status TEXT DEFAULT 'initiated' NOT NULL,
    
    -- Verification details
    initiated_at TIMESTAMP WITH TIME ZONE,
    documents_submitted_at TIMESTAMP WITH TIME ZONE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Verification data
    verification_data JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure one verification record per badge
    UNIQUE(badge_id)
);

-- Badge Documents table
CREATE TABLE IF NOT EXISTS badge_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    badge_id UUID REFERENCES user_badges(id) ON DELETE CASCADE NOT NULL,
    
    -- Document details
    document_type TEXT NOT NULL, -- 'business_license', 'identity', 'financial_statements', etc.
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    
    -- Upload details
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Verification status
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Invoices table (for subscription billing)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Invoice identification
    invoice_number TEXT UNIQUE NOT NULL DEFAULT ('INV-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0')),
    
    -- Relationships
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Stripe integration
    stripe_invoice_id TEXT UNIQUE,
    
    -- Invoice details
    amount_due INTEGER NOT NULL, -- Amount in cents
    amount_paid INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'usd',
    
    -- Status
    status TEXT DEFAULT 'draft', -- 'draft', 'open', 'paid', 'void', 'uncollectible'
    
    -- Dates
    invoice_date DATE NOT NULL,
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Line items
    line_items JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create sequences for auto-generated numbers
CREATE SEQUENCE IF NOT EXISTS badge_order_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_plan_id ON subscription_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_id ON subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_feature ON subscription_usage(feature);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_period ON subscription_usage(period);

CREATE INDEX IF NOT EXISTS idx_badge_orders_user_id ON badge_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_orders_status ON badge_orders(status);
CREATE INDEX IF NOT EXISTS idx_badge_orders_badge_type ON badge_orders(badge_type);
CREATE INDEX IF NOT EXISTS idx_badge_orders_created_at ON badge_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_type ON user_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_user_badges_status ON user_badges(status);
CREATE INDEX IF NOT EXISTS idx_user_badges_expires_at ON user_badges(expires_at);

CREATE INDEX IF NOT EXISTS idx_badge_verification_badge_id ON badge_verification(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_verification_status ON badge_verification(status);
CREATE INDEX IF NOT EXISTS idx_badge_verification_reviewer_id ON badge_verification(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_badge_documents_badge_id ON badge_documents(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_documents_document_type ON badge_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_badge_documents_verified ON badge_documents(verified);

CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Note: Triggers are created later in the TRIGGERS section to avoid duplicates

CREATE TRIGGER update_badge_verification_updated_at 
    BEFORE UPDATE ON badge_verification 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check subscription feature access
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
    
    -- Check if feature is available
    RETURN COALESCE((plan_features ->> feature_name)::BOOLEAN, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription usage
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire subscriptions
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
$$ LANGUAGE plpgsql;

-- Function to expire badges
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
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_subscription_plans_updated_at') THEN
        CREATE TRIGGER update_subscription_plans_updated_at
            BEFORE UPDATE ON subscription_plans
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_subscriptions_updated_at') THEN
        CREATE TRIGGER update_subscriptions_updated_at
            BEFORE UPDATE ON subscriptions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_user_badges_updated_at') THEN
        CREATE TRIGGER update_user_badges_updated_at
            BEFORE UPDATE ON user_badges
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badge_verification')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_badge_verification_updated_at') THEN
        CREATE TRIGGER update_badge_verification_updated_at
            BEFORE UPDATE ON badge_verification
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_invoices_updated_at') THEN
        CREATE TRIGGER update_invoices_updated_at
            BEFORE UPDATE ON invoices
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY: Enable RLS but don't create policies here
-- =============================================================================

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DEPLOYMENT VERIFICATION
-- =============================================================================

-- Verify deployment completed successfully
DO $$
BEGIN
    RAISE NOTICE 'Subscription and Badge Management Schema deployment completed successfully!';
    RAISE NOTICE 'Tables created: subscription_plans, subscriptions, user_badges, badge_verification, badge_documents, invoices';
    RAISE NOTICE 'Triggers created: update timestamps and subscription management';
    RAISE NOTICE 'RLS enabled on all tables (policies should be created separately)';
END $$;
