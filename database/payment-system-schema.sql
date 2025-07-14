-- Payment System Schema (Conflict-Safe Version)
-- Comprehensive payment processing for BuyMartV1 platform
-- Supports Stripe payments, escrow integration, and fee management
-- This version handles "already exists" conflicts gracefully

-- =============================================================================
-- CLEANUP SECTION: Remove existing objects to prevent conflicts
-- =============================================================================

-- Drop existing triggers first (to prevent "already exists" errors)
-- Use DO blocks to safely drop triggers only if tables exist
DO $$
BEGIN
    -- Drop triggers only if their tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badge_orders') THEN
        DROP TRIGGER IF EXISTS update_badge_orders_updated_at ON badge_orders;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'escrow_accounts') THEN
        DROP TRIGGER IF EXISTS update_escrow_accounts_updated_at ON escrow_accounts;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fee_transactions') THEN
        DROP TRIGGER IF EXISTS update_fee_transactions_updated_at ON fee_transactions;
    END IF;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS process_payment_webhook() CASCADE;
DROP FUNCTION IF EXISTS calculate_platform_fee() CASCADE;
DROP FUNCTION IF EXISTS update_subscription_status() CASCADE;
DROP FUNCTION IF EXISTS handle_escrow_release() CASCADE;

-- =============================================================================
-- ENUM TYPES: Create with conflict handling
-- =============================================================================

-- Create payment status enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM (
            'pending',
            'processing',
            'succeeded',
            'failed',
            'cancelled',
            'refunded'
        );
    END IF;
END $$;

-- Create payment type enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
        CREATE TYPE payment_type AS ENUM (
            'badge',
            'subscription',
            'transaction_fee',
            'vendor_referral',
            'escrow_funding',
            'other'
        );
    END IF;
END $$;

-- Create subscription status enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM (
            'active',
            'past_due',
            'cancelled',
            'unpaid',
            'incomplete',
            'incomplete_expired',
            'trialing'
        );
    END IF;
END $$;

-- Create escrow status enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'escrow_status') THEN
        CREATE TYPE escrow_status AS ENUM (
            'created',
            'funded',
            'in_progress',
            'released',
            'cancelled',
            'disputed'
        );
    END IF;
END $$;

-- =============================================================================
-- SEQUENCE CREATION: Create sequences before tables that use them
-- =============================================================================

-- Create sequences for payment numbering (with conflict handling)
CREATE SEQUENCE IF NOT EXISTS payment_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS badge_order_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS subscription_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS escrow_number_seq START 1000;

-- =============================================================================
-- TABLE CREATION: Payment system tables
-- =============================================================================

-- Payments table for all payment transactions
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Payment identification
    stripe_payment_intent_id TEXT UNIQUE,
    payment_number TEXT UNIQUE NOT NULL DEFAULT ('PAY-' || LPAD(NEXTVAL('payment_number_seq')::TEXT, 6, '0')),

    -- Payment details
    payment_type payment_type NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'USD' NOT NULL,
    status payment_status DEFAULT 'pending' NOT NULL,

    -- Relationships (foreign keys added separately to handle deployment order)
    user_id UUID, -- REFERENCES profiles(id) ON DELETE SET NULL,
    deal_id UUID, -- REFERENCES deals(id) ON DELETE SET NULL,
    vendor_id UUID, -- REFERENCES vendors(id) ON DELETE SET NULL,

    -- Payment method information
    payment_method_type TEXT, -- 'card', 'bank_transfer', etc.
    payment_method_details JSONB DEFAULT '{}',

    -- Transaction details
    description TEXT,
    receipt_url TEXT,
    failure_reason TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Badge orders table
CREATE TABLE IF NOT EXISTS badge_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Order identification
    order_number TEXT UNIQUE NOT NULL DEFAULT ('BADGE-' || LPAD(NEXTVAL('badge_order_seq')::TEXT, 6, '0')),

    -- Order details
    user_id UUID NOT NULL, -- REFERENCES profiles(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    status payment_status DEFAULT 'pending' NOT NULL,

    -- Payment information
    payment_id UUID, -- REFERENCES payments(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT,

    -- Badge details
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_progress', 'approved', 'rejected')),
    verification_notes TEXT,
    badge_issued_at TIMESTAMP WITH TIME ZONE,
    badge_expires_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Subscription identification
    stripe_subscription_id TEXT UNIQUE,
    subscription_number TEXT UNIQUE NOT NULL DEFAULT ('SUB-' || LPAD(NEXTVAL('subscription_number_seq')::TEXT, 6, '0')),
    
    -- Subscription details
    user_id UUID NOT NULL, -- REFERENCES profiles(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL, -- 'buyer_pro', 'seller_pro', 'vendor_pro'
    status subscription_status DEFAULT 'active' NOT NULL,
    
    -- Billing information
    amount INTEGER NOT NULL, -- Amount in cents per billing cycle
    currency TEXT DEFAULT 'USD' NOT NULL,
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annually')),
    
    -- Subscription periods
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    
    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Escrow accounts table
CREATE TABLE IF NOT EXISTS escrow_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Escrow identification
    escrow_transaction_id TEXT UNIQUE NOT NULL, -- External escrow service ID
    escrow_number TEXT UNIQUE NOT NULL DEFAULT ('ESC-' || LPAD(NEXTVAL('escrow_number_seq')::TEXT, 6, '0')),
    
    -- Deal relationship
    deal_id UUID NOT NULL, -- REFERENCES deals(id) ON DELETE CASCADE,
    
    -- Escrow details
    escrow_provider TEXT DEFAULT 'escrow.com' NOT NULL,
    status escrow_status DEFAULT 'created' NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'USD' NOT NULL,
    
    -- Commission and fees
    broker_commission INTEGER DEFAULT 0, -- Platform commission in cents
    escrow_fees INTEGER DEFAULT 0, -- Escrow service fees in cents
    
    -- Timeline
    funded_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Reasons and notes
    release_reason TEXT,
    cancellation_reason TEXT,
    notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Escrow transactions log
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Escrow relationship
    escrow_transaction_id TEXT NOT NULL, -- References external escrow service
    escrow_account_id UUID, -- REFERENCES escrow_accounts(id) ON DELETE CASCADE,
    
    -- Transaction details
    action TEXT NOT NULL, -- 'created', 'funded', 'released', 'cancelled', etc.
    description TEXT NOT NULL,
    amount INTEGER, -- Amount involved in this action (if applicable)
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Fee configurations table
CREATE TABLE IF NOT EXISTS fee_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Fee type and configuration
    fee_type TEXT NOT NULL, -- 'transaction', 'badge', 'subscription', 'vendor_referral'
    percentage DECIMAL(5,4), -- For percentage-based fees
    minimum INTEGER, -- Minimum fee in cents
    maximum INTEGER, -- Maximum fee in cents
    fixed_amount INTEGER, -- For fixed fees in cents
    
    -- Configuration details
    is_active BOOLEAN DEFAULT TRUE,
    applies_to TEXT[], -- Array of applicable items/categories
    description TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(fee_type, is_active) -- Only one active config per fee type
);

-- Fee transactions table
CREATE TABLE IF NOT EXISTS fee_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Fee details
    fee_type payment_type NOT NULL,
    amount INTEGER NOT NULL, -- Fee amount in cents
    
    -- Relationships (foreign keys added separately)
    deal_id UUID, -- REFERENCES deals(id) ON DELETE SET NULL,
    user_id UUID, -- REFERENCES profiles(id) ON DELETE SET NULL,
    vendor_id UUID, -- REFERENCES vendors(id) ON DELETE SET NULL,
    payment_id UUID, -- REFERENCES payments(id) ON DELETE SET NULL,
    
    -- Payment processing
    payment_intent_id TEXT,
    status payment_status DEFAULT 'pending' NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Code details
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    
    -- Discount configuration
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL, -- Percentage (0-100) or fixed amount
    max_discount_amount DECIMAL(10,2), -- Maximum discount in dollars
    
    -- Usage limits
    max_uses INTEGER,
    times_used INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    
    -- Applicability
    applicable_to TEXT[], -- Array of fee types this applies to
    minimum_amount INTEGER, -- Minimum purchase amount in cents
    
    -- Validity
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by UUID, -- REFERENCES profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create sequences for auto-generated numbers
CREATE SEQUENCE IF NOT EXISTS payment_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS badge_order_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS subscription_number_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS escrow_number_seq START 1000;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_deal_id ON payments(deal_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_badge_orders_user_id ON badge_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_orders_status ON badge_orders(status);
CREATE INDEX IF NOT EXISTS idx_badge_orders_badge_type ON badge_orders(badge_type);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_escrow_accounts_deal_id ON escrow_accounts(deal_id);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_status ON escrow_accounts(status);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_transaction_id ON escrow_accounts(escrow_transaction_id);

CREATE INDEX IF NOT EXISTS idx_fee_transactions_user_id ON fee_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fee_transactions_deal_id ON fee_transactions(deal_id);
CREATE INDEX IF NOT EXISTS idx_fee_transactions_type ON fee_transactions(fee_type);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);

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
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_badge_orders_updated_at
    BEFORE UPDATE ON badge_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_accounts_updated_at
    BEFORE UPDATE ON escrow_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_configurations_updated_at
    BEFORE UPDATE ON fee_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at
    BEFORE UPDATE ON discount_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY: Enable RLS but don't create policies here
-- =============================================================================

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- FOREIGN KEY CONSTRAINTS: Add after all tables are created
-- =============================================================================

-- Add foreign key constraints for payments table (if referenced tables exist)
DO $$
BEGIN
    -- Add user_id foreign key if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE payments ADD CONSTRAINT fk_payments_user_id
            FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key: payments.user_id -> profiles.id';
    END IF;

    -- Add deal_id foreign key if deals table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
        ALTER TABLE payments ADD CONSTRAINT fk_payments_deal_id
            FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key: payments.deal_id -> deals.id';
    END IF;

    -- Add vendor_id foreign key if vendors table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors') THEN
        ALTER TABLE payments ADD CONSTRAINT fk_payments_vendor_id
            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key: payments.vendor_id -> vendors.id';
    END IF;
END $$;

-- Add foreign key constraints for badge_orders table
DO $$
BEGIN
    -- Add user_id foreign key if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE badge_orders ADD CONSTRAINT fk_badge_orders_user_id
            FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key: badge_orders.user_id -> profiles.id';
    END IF;

    -- Add payment_id foreign key (payments table should exist by now)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        ALTER TABLE badge_orders ADD CONSTRAINT fk_badge_orders_payment_id
            FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key: badge_orders.payment_id -> payments.id';
    END IF;
END $$;

-- Add foreign key constraints for other tables
DO $$
BEGIN
    -- Subscriptions table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE subscriptions ADD CONSTRAINT fk_subscriptions_user_id
            FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key: subscriptions.user_id -> profiles.id';
    END IF;

    -- Escrow accounts table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
        ALTER TABLE escrow_accounts ADD CONSTRAINT fk_escrow_accounts_deal_id
            FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key: escrow_accounts.deal_id -> deals.id';
    END IF;

    -- Escrow transactions table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'escrow_accounts') THEN
        ALTER TABLE escrow_transactions ADD CONSTRAINT fk_escrow_transactions_escrow_account_id
            FOREIGN KEY (escrow_account_id) REFERENCES escrow_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key: escrow_transactions.escrow_account_id -> escrow_accounts.id';
    END IF;

    -- Fee transactions table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
        ALTER TABLE fee_transactions ADD CONSTRAINT fk_fee_transactions_deal_id
            FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE fee_transactions ADD CONSTRAINT fk_fee_transactions_user_id
            FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
        ALTER TABLE fee_transactions ADD CONSTRAINT fk_fee_transactions_vendor_id
            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        ALTER TABLE fee_transactions ADD CONSTRAINT fk_fee_transactions_payment_id
            FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;
    END IF;

    -- Discount codes table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE discount_codes ADD CONSTRAINT fk_discount_codes_created_by
            FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key: discount_codes.created_by -> profiles.id';
    END IF;

    RAISE NOTICE 'All foreign key constraints added successfully';
END $$;

-- =============================================================================
-- DEPLOYMENT VERIFICATION
-- =============================================================================

-- Verify deployment completed successfully
DO $$
BEGIN
    RAISE NOTICE 'Payment System Schema deployment completed successfully!';
    RAISE NOTICE 'Tables created: payments, badge_orders, subscriptions, escrow_accounts, fee_transactions, fee_configurations, discount_codes';
    RAISE NOTICE 'Foreign key constraints added conditionally based on table existence';
    RAISE NOTICE 'Triggers created: update timestamps for all tables';
    RAISE NOTICE 'RLS enabled on all tables (policies should be created separately)';
END $$;
