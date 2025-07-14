-- Content Management System (CMS) Schema (Conflict-Safe Version)
-- Comprehensive CMS for blogs, pages, resources, and dynamic content
-- Supports content creation, editing, publishing, comments, and analytics
-- This version handles "already exists" conflicts gracefully

-- =============================================================================
-- CLEANUP SECTION: Remove existing objects to prevent conflicts
-- =============================================================================

-- Drop existing triggers first (to prevent "already exists" errors)
-- Use DO blocks to safely drop triggers only if tables exist
DO $$
BEGIN
    -- Drop triggers only if their tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_categories') THEN
        DROP TRIGGER IF EXISTS update_cms_categories_updated_at ON cms_categories;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_tags') THEN
        DROP TRIGGER IF EXISTS update_cms_tags_updated_at ON cms_tags;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_content') THEN
        DROP TRIGGER IF EXISTS update_cms_content_updated_at ON cms_content;
        DROP TRIGGER IF EXISTS publish_scheduled_content_trigger ON cms_content;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_comments') THEN
        DROP TRIGGER IF EXISTS update_cms_comments_updated_at ON cms_comments;
        DROP TRIGGER IF EXISTS update_content_comment_count_trigger ON cms_comments;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_media') THEN
        DROP TRIGGER IF EXISTS update_cms_media_updated_at ON cms_media;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_content_tags') THEN
        DROP TRIGGER IF EXISTS update_tag_usage_count_trigger ON cms_content_tags;
    END IF;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_tag_usage_count() CASCADE;
DROP FUNCTION IF EXISTS update_content_comment_count() CASCADE;
DROP FUNCTION IF EXISTS publish_scheduled_content() CASCADE;

-- =============================================================================
-- ENUM TYPES: Create with conflict handling
-- =============================================================================

-- Create content status enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
        CREATE TYPE content_status AS ENUM (
            'draft',
            'review',
            'scheduled',
            'published',
            'archived',
            'deleted'
        );
    END IF;
END $$;

-- Create content type enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
        CREATE TYPE content_type AS ENUM (
            'blog',
            'page',
            'resource',
            'guide',
            'news',
            'faq',
            'announcement'
        );
    END IF;
END $$;

-- Create comment status enum (with conflict handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_status') THEN
        CREATE TYPE comment_status AS ENUM (
            'pending',
            'approved',
            'rejected',
            'spam'
        );
    END IF;
END $$;

-- =============================================================================
-- SEQUENCE CREATION: Create sequences before tables that use them
-- =============================================================================

-- Create sequence for CMS content numbering (with conflict handling)
CREATE SEQUENCE IF NOT EXISTS cms_content_number_seq START 1000;

-- =============================================================================
-- TABLE CREATION: CMS system tables
-- =============================================================================

-- CMS Categories table
CREATE TABLE IF NOT EXISTS cms_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Category details
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6', -- Hex color for UI

    -- Hierarchy support
    parent_id UUID REFERENCES cms_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,

    -- Content type association
    content_type content_type NOT NULL,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- CMS Tags table
CREATE TABLE IF NOT EXISTS cms_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Tag details
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6B7280', -- Hex color for UI
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- CMS Content table (main content storage)
CREATE TABLE IF NOT EXISTS cms_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Content identification
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content_type content_type NOT NULL,
    
    -- Content body
    content TEXT NOT NULL,
    excerpt TEXT,
    
    -- Status and publishing
    status content_status DEFAULT 'draft' NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    
    -- Authorship
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    
    -- Organization
    category_id UUID REFERENCES cms_categories(id) ON DELETE SET NULL,
    
    -- Media
    featured_image TEXT, -- URL or file path
    gallery JSONB DEFAULT '[]', -- Array of image URLs
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    canonical_url TEXT,
    
    -- Social sharing
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    
    -- Content settings
    settings JSONB DEFAULT '{}', -- Content-specific settings
    
    -- Analytics and engagement
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique slug per content type
    UNIQUE(slug, content_type)
);

-- CMS Content Tags junction table
CREATE TABLE IF NOT EXISTS cms_content_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    content_id UUID REFERENCES cms_content(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES cms_tags(id) ON DELETE CASCADE NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique content-tag pairs
    UNIQUE(content_id, tag_id)
);

-- CMS Comments table
CREATE TABLE IF NOT EXISTS cms_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    content_id UUID REFERENCES cms_content(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES cms_comments(id) ON DELETE CASCADE, -- For threaded comments
    
    -- Comment content
    content TEXT NOT NULL,
    
    -- Status and moderation
    status comment_status DEFAULT 'pending' NOT NULL,
    moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_reason TEXT,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    
    -- Spam detection
    is_spam BOOLEAN DEFAULT FALSE,
    spam_score DECIMAL(3,2) DEFAULT 0.0,
    
    -- Technical details
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- CMS Content Revisions table
CREATE TABLE IF NOT EXISTS cms_content_revisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    content_id UUID REFERENCES cms_content(id) ON DELETE CASCADE NOT NULL,
    
    -- Revision details
    content_snapshot JSONB NOT NULL, -- Full content state at time of revision
    change_note TEXT,
    
    -- Authorship
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- CMS Analytics table
CREATE TABLE IF NOT EXISTS cms_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Event details
    event_type TEXT NOT NULL, -- 'content_viewed', 'content_shared', 'comment_created', etc.
    event_data JSONB DEFAULT '{}',
    
    -- Session tracking
    session_id TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Referrer information
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- CMS Media Library table
CREATE TABLE IF NOT EXISTS cms_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- File details
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL, -- Size in bytes
    mime_type TEXT NOT NULL,
    
    -- Image-specific details
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    
    -- Organization
    folder TEXT DEFAULT 'uploads',
    
    -- Authorship
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- CMS Settings table (for global CMS configuration)
CREATE TABLE IF NOT EXISTS cms_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Setting details
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type TEXT DEFAULT 'general', -- 'general', 'seo', 'social', 'email', etc.
    
    -- Metadata
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Whether setting can be accessed publicly
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create sequences for auto-generated numbers
CREATE SEQUENCE IF NOT EXISTS cms_content_number_seq START 1000;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cms_categories_content_type ON cms_categories(content_type);
CREATE INDEX IF NOT EXISTS idx_cms_categories_parent_id ON cms_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_cms_categories_slug ON cms_categories(slug);

CREATE INDEX IF NOT EXISTS idx_cms_tags_name ON cms_tags(name);
CREATE INDEX IF NOT EXISTS idx_cms_tags_slug ON cms_tags(slug);
CREATE INDEX IF NOT EXISTS idx_cms_tags_usage_count ON cms_tags(usage_count);

CREATE INDEX IF NOT EXISTS idx_cms_content_content_type ON cms_content(content_type);
CREATE INDEX IF NOT EXISTS idx_cms_content_status ON cms_content(status);
CREATE INDEX IF NOT EXISTS idx_cms_content_author_id ON cms_content(author_id);
CREATE INDEX IF NOT EXISTS idx_cms_content_category_id ON cms_content(category_id);
CREATE INDEX IF NOT EXISTS idx_cms_content_slug ON cms_content(slug);
CREATE INDEX IF NOT EXISTS idx_cms_content_published_at ON cms_content(published_at);
CREATE INDEX IF NOT EXISTS idx_cms_content_created_at ON cms_content(created_at);
CREATE INDEX IF NOT EXISTS idx_cms_content_deleted_at ON cms_content(deleted_at);

-- Full-text search index for content
CREATE INDEX IF NOT EXISTS idx_cms_content_search ON cms_content USING gin(to_tsvector('english', title || ' ' || content || ' ' || COALESCE(excerpt, '')));

CREATE INDEX IF NOT EXISTS idx_cms_content_tags_content_id ON cms_content_tags(content_id);
CREATE INDEX IF NOT EXISTS idx_cms_content_tags_tag_id ON cms_content_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_cms_comments_content_id ON cms_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_cms_comments_author_id ON cms_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_cms_comments_parent_id ON cms_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_cms_comments_status ON cms_comments(status);
CREATE INDEX IF NOT EXISTS idx_cms_comments_created_at ON cms_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_cms_content_revisions_content_id ON cms_content_revisions(content_id);
CREATE INDEX IF NOT EXISTS idx_cms_content_revisions_created_at ON cms_content_revisions(created_at);

CREATE INDEX IF NOT EXISTS idx_cms_analytics_event_type ON cms_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_cms_analytics_user_id ON cms_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_cms_analytics_created_at ON cms_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_cms_analytics_event_data ON cms_analytics USING gin(event_data);

CREATE INDEX IF NOT EXISTS idx_cms_media_uploaded_by ON cms_media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_cms_media_mime_type ON cms_media(mime_type);
CREATE INDEX IF NOT EXISTS idx_cms_media_folder ON cms_media(folder);
CREATE INDEX IF NOT EXISTS idx_cms_media_created_at ON cms_media(created_at);

CREATE INDEX IF NOT EXISTS idx_cms_settings_setting_key ON cms_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_cms_settings_setting_type ON cms_settings(setting_type);

-- Note: Triggers are created later in the TRIGGERS section to avoid duplicates

CREATE TRIGGER update_cms_settings_updated_at 
    BEFORE UPDATE ON cms_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE cms_tags 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE cms_tags 
        SET usage_count = GREATEST(usage_count - 1, 0) 
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tag usage count
CREATE TRIGGER update_tag_usage_count_trigger
    AFTER INSERT OR DELETE ON cms_content_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

-- Function to update content comment count
CREATE OR REPLACE FUNCTION update_content_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE cms_content 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.content_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
            UPDATE cms_content 
            SET comment_count = comment_count + 1 
            WHERE id = NEW.content_id;
        ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
            UPDATE cms_content 
            SET comment_count = GREATEST(comment_count - 1, 0) 
            WHERE id = NEW.content_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE cms_content 
        SET comment_count = GREATEST(comment_count - 1, 0) 
        WHERE id = OLD.content_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for content comment count
CREATE TRIGGER update_content_comment_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON cms_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_content_comment_count();

-- Function to auto-publish scheduled content
CREATE OR REPLACE FUNCTION publish_scheduled_content()
RETURNS INTEGER AS $$
DECLARE
    published_count INTEGER;
BEGIN
    UPDATE cms_content 
    SET status = 'published',
        published_at = NOW(),
        updated_at = NOW()
    WHERE status = 'scheduled' 
    AND scheduled_at <= NOW();
    
    GET DIAGNOSTICS published_count = ROW_COUNT;
    
    RETURN published_count;
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
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_categories')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_cms_categories_updated_at') THEN
        CREATE TRIGGER update_cms_categories_updated_at
            BEFORE UPDATE ON cms_categories
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_tags')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_cms_tags_updated_at') THEN
        CREATE TRIGGER update_cms_tags_updated_at
            BEFORE UPDATE ON cms_tags
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_content')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_cms_content_updated_at') THEN
        CREATE TRIGGER update_cms_content_updated_at
            BEFORE UPDATE ON cms_content
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_comments')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_cms_comments_updated_at') THEN
        CREATE TRIGGER update_cms_comments_updated_at
            BEFORE UPDATE ON cms_comments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_media')
       AND NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_cms_media_updated_at') THEN
        CREATE TRIGGER update_cms_media_updated_at
            BEFORE UPDATE ON cms_media
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY: Enable RLS but don't create policies here
-- =============================================================================

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE cms_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DEPLOYMENT VERIFICATION
-- =============================================================================

-- Verify deployment completed successfully
DO $$
BEGIN
    RAISE NOTICE 'CMS Schema deployment completed successfully!';
    RAISE NOTICE 'Tables created: cms_categories, cms_tags, cms_content, cms_comments, cms_media, cms_analytics, cms_settings';
    RAISE NOTICE 'Triggers created: update timestamps, tag usage counting, comment counting';
    RAISE NOTICE 'RLS enabled on all tables (policies should be created separately)';
END $$;
