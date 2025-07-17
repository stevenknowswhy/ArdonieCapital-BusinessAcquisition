-- =====================================================
-- Marketplace CMS Database Schema
-- Complete database structure for CMS-integrated marketplace
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- LISTINGS TABLE
-- Core business listings with comprehensive information
-- =====================================================

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Basic Information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    business_type VARCHAR(100),
    location VARCHAR(255),
    
    -- Financial Information
    price BIGINT, -- Asking price in cents
    revenue BIGINT, -- Annual revenue in cents
    profit BIGINT, -- Annual profit/cash flow in cents
    
    -- Business Details
    established_year INTEGER,
    employees INTEGER,
    square_footage INTEGER,
    
    -- Media and Features
    images JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    
    -- Status and Flags
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'withdrawn')),
    express_seller BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', 
            COALESCE(title, '') || ' ' || 
            COALESCE(description, '') || ' ' || 
            COALESCE(business_type, '') || ' ' || 
            COALESCE(location, '')
        )
    ) STORED
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_business_type ON listings(business_type);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_revenue ON listings(revenue);
CREATE INDEX IF NOT EXISTS idx_listings_express_seller ON listings(express_seller);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_search_vector ON listings USING GIN(search_vector);

-- =====================================================
-- SAVED LISTINGS TABLE
-- User favorites/wishlist functionality
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique buyer-listing combination
    UNIQUE(buyer_id, listing_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_listings_buyer_id ON saved_listings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_listing_id ON saved_listings(listing_id);

-- =====================================================
-- CONVERSATIONS TABLE
-- Messaging system between buyers and sellers
-- =====================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Conversation metadata
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique conversation per buyer-seller-listing combination
    UNIQUE(buyer_id, seller_id, listing_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

-- =====================================================
-- MESSAGES TABLE
-- Individual messages within conversations
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Message content
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'system')),
    
    -- Message status
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- =====================================================
-- LISTING VIEWS TABLE
-- Track listing views for analytics
-- =====================================================

CREATE TABLE IF NOT EXISTS listing_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous views
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_viewer_id ON listing_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_created_at ON listing_views(created_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update updated_at timestamp on listings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_listings_updated_at 
    BEFORE UPDATE ON listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update conversation last_message_at when new message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

-- Listings policies
CREATE POLICY "Public can view active listings" ON listings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can manage their own listings" ON listings
    FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all listings" ON listings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- Saved listings policies
CREATE POLICY "Users can manage their own saved listings" ON saved_listings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.id = buyer_id
        )
    );

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND (profiles.id = buyer_id OR profiles.id = seller_id)
        )
    );

CREATE POLICY "Users can create conversations as buyers" ON conversations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.id = buyer_id
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE c.id = conversation_id 
            AND (c.buyer_id = p.id OR c.seller_id = p.id)
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            JOIN profiles p ON p.user_id = auth.uid()
            WHERE c.id = conversation_id 
            AND (c.buyer_id = p.id OR c.seller_id = p.id)
            AND p.id = sender_id
        )
    );

-- Listing views policies (allow all authenticated users to create views)
CREATE POLICY "Anyone can create listing views" ON listing_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own listing views" ON listing_views
    FOR SELECT USING (
        viewer_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.id = viewer_id
        )
    );

-- =====================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- =====================================================

-- Insert sample listings (only if no listings exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM listings LIMIT 1) THEN
        -- Get a sample seller profile
        INSERT INTO listings (
            seller_id,
            title,
            description,
            business_type,
            location,
            price,
            revenue,
            profit,
            established_year,
            employees,
            square_footage,
            images,
            features,
            express_seller,
            featured
        ) VALUES 
        (
            (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1),
            'Premier Auto Service Center',
            'Established full-service auto repair shop with loyal customer base and modern equipment. This business has been serving the Plano community for over 15 years with exceptional service and competitive pricing.',
            'Full Service Auto Repair',
            'Plano, TX',
            85000000, -- $850,000
            120000000, -- $1,200,000
            28500000, -- $285,000
            2008,
            12,
            8500,
            '["https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80"]',
            '["ASE Certified Technicians", "Modern Equipment", "Loyal Customer Base", "Prime Location", "Established Reputation"]',
            true,
            true
        ),
        (
            (SELECT id FROM profiles WHERE role = 'seller' LIMIT 1),
            'Elite Transmission Specialists',
            'Specialized transmission repair shop with 25+ years in business and excellent reputation. This niche business has built a strong reputation for quality transmission repairs and rebuilds.',
            'Transmission Repair',
            'Arlington, TX',
            65000000, -- $650,000
            85000000, -- $850,000
            19500000, -- $195,000
            1998,
            8,
            6000,
            '["https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80"]',
            '["Transmission Specialists", "25+ Years Experience", "Excellent Reputation", "Niche Market", "Warranty Program"]',
            false,
            false
        );
    END IF;
END $$;

-- =====================================================
-- FUNCTIONS FOR MARKETPLACE OPERATIONS
-- =====================================================

-- Function to get listings with filters
CREATE OR REPLACE FUNCTION get_filtered_listings(
    search_term TEXT DEFAULT NULL,
    business_types TEXT[] DEFAULT NULL,
    min_price BIGINT DEFAULT NULL,
    max_price BIGINT DEFAULT NULL,
    location_filter TEXT DEFAULT NULL,
    express_only BOOLEAN DEFAULT false,
    sort_by TEXT DEFAULT 'newest',
    page_size INTEGER DEFAULT 9,
    page_number INTEGER DEFAULT 1
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    business_type VARCHAR,
    location VARCHAR,
    price BIGINT,
    revenue BIGINT,
    profit BIGINT,
    established_year INTEGER,
    employees INTEGER,
    square_footage INTEGER,
    images JSONB,
    features JSONB,
    express_seller BOOLEAN,
    featured BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    seller_name TEXT,
    seller_company VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.title,
        l.description,
        l.business_type,
        l.location,
        l.price,
        l.revenue,
        l.profit,
        l.established_year,
        l.employees,
        l.square_footage,
        l.images,
        l.features,
        l.express_seller,
        l.featured,
        l.created_at,
        CONCAT(p.first_name, ' ', p.last_name) as seller_name,
        p.company as seller_company
    FROM listings l
    JOIN profiles p ON l.seller_id = p.id
    WHERE 
        l.status = 'active'
        AND (search_term IS NULL OR l.search_vector @@ plainto_tsquery('english', search_term))
        AND (business_types IS NULL OR l.business_type = ANY(business_types))
        AND (min_price IS NULL OR l.price >= min_price)
        AND (max_price IS NULL OR l.price <= max_price)
        AND (location_filter IS NULL OR l.location ILIKE '%' || location_filter || '%')
        AND (NOT express_only OR l.express_seller = true)
    ORDER BY 
        CASE 
            WHEN sort_by = 'price_asc' THEN l.price
            WHEN sort_by = 'revenue_asc' THEN l.revenue
            ELSE NULL
        END ASC,
        CASE 
            WHEN sort_by = 'price_desc' THEN l.price
            WHEN sort_by = 'revenue_desc' THEN l.revenue
            WHEN sort_by = 'newest' THEN EXTRACT(EPOCH FROM l.created_at)
            ELSE NULL
        END DESC,
        CASE 
            WHEN sort_by = 'oldest' THEN EXTRACT(EPOCH FROM l.created_at)
            ELSE NULL
        END ASC
    LIMIT page_size
    OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_filtered_listings TO authenticated;

COMMIT;
