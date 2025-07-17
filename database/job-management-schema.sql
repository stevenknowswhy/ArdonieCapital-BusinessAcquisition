-- =============================================================================
-- JOB MANAGEMENT SYSTEM DATABASE SCHEMA
-- =============================================================================
-- Comprehensive database schema for the careers page job management system
-- Includes jobs, applications, interviews, and analytics with RLS policies
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CUSTOM TYPES AND ENUMS
-- =============================================================================

-- Job status enumeration
DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('draft', 'active', 'paused', 'closed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Job type enumeration
DO $$ BEGIN
    CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'temporary', 'freelance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Application status enumeration
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'interview_scheduled', 'interview_completed', 'reference_check', 'offer_extended', 'accepted', 'rejected', 'withdrawn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Interview type enumeration
DO $$ BEGIN
    CREATE TYPE interview_type AS ENUM ('phone_screening', 'video_interview', 'in_person', 'panel_interview', 'technical_assessment', 'final_interview');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Priority level enumeration
DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic Information
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    job_type job_type NOT NULL DEFAULT 'full_time',
    
    -- Job Details
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL DEFAULT '{}',
    benefits TEXT[] NOT NULL DEFAULT '{}',
    responsibilities TEXT[] DEFAULT '{}',
    qualifications TEXT[] DEFAULT '{}',
    
    -- Compensation
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    salary_currency TEXT DEFAULT 'USD',
    salary_period TEXT DEFAULT 'yearly', -- yearly, monthly, hourly
    
    -- Status and Visibility
    status job_status DEFAULT 'draft' NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_remote BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    priority priority_level DEFAULT 'medium',
    
    -- Timeline
    posted_date TIMESTAMP WITH TIME ZONE,
    application_deadline TIMESTAMP WITH TIME ZONE,
    start_date DATE,
    
    -- Hiring Details
    positions_available INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    max_applications INTEGER,
    
    -- SEO and Marketing
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    
    -- Internal Management
    hiring_manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    recruiter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    
    -- Additional Data
    external_job_id TEXT, -- For integration with external job boards
    source TEXT DEFAULT 'internal', -- internal, linkedin, indeed, etc.
    metadata JSONB DEFAULT '{}',
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_salary_range CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max),
    CONSTRAINT valid_positions CHECK (positions_filled <= positions_available),
    CONSTRAINT valid_deadline CHECK (application_deadline IS NULL OR application_deadline > posted_date)
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    applicant_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Applicant Information (for non-registered users)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    
    -- Application Details
    cover_letter TEXT,
    resume_file_path TEXT,
    resume_file_name TEXT,
    resume_file_size INTEGER,
    additional_documents JSONB DEFAULT '[]',
    
    -- Experience and Preferences
    years_experience INTEGER,
    current_salary DECIMAL(12,2),
    expected_salary DECIMAL(12,2),
    available_start_date DATE,
    willing_to_relocate BOOLEAN DEFAULT FALSE,
    requires_visa_sponsorship BOOLEAN DEFAULT FALSE,
    
    -- Application Status
    status application_status DEFAULT 'pending' NOT NULL,
    status_notes TEXT,
    rejection_reason TEXT,
    
    -- Screening Questions
    screening_answers JSONB DEFAULT '{}',
    
    -- Internal Assessment
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    internal_notes TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Timeline Tracking
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    interview_scheduled_at TIMESTAMP WITH TIME ZONE,
    decision_made_at TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Source Tracking
    application_source TEXT DEFAULT 'website', -- website, linkedin, referral, etc.
    referrer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Additional Data
    metadata JSONB DEFAULT '{}',
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_application_per_job UNIQUE(job_id, email),
    CONSTRAINT valid_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

-- Interview Scheduling Table
CREATE TABLE IF NOT EXISTS job_interviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    
    -- Interview Details
    interview_type interview_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    timezone TEXT DEFAULT 'UTC',
    
    -- Location/Platform
    location TEXT, -- Physical address or meeting room
    meeting_url TEXT, -- Video conference link
    meeting_id TEXT, -- Meeting ID for video calls
    meeting_password TEXT, -- Meeting password
    
    -- Participants
    interviewer_ids UUID[] DEFAULT '{}', -- Array of interviewer profile IDs
    interviewer_emails TEXT[] DEFAULT '{}', -- For external interviewers
    
    -- Status and Results
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Feedback and Scoring
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    technical_rating INTEGER CHECK (technical_rating >= 1 AND technical_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    cultural_fit_rating INTEGER CHECK (cultural_fit_rating >= 1 AND cultural_fit_rating <= 5),
    
    -- Interview Notes
    interviewer_notes TEXT,
    candidate_feedback TEXT,
    strengths TEXT[],
    concerns TEXT[],
    
    -- Recommendations
    recommendation TEXT CHECK (recommendation IN ('strong_hire', 'hire', 'no_hire', 'strong_no_hire')),
    next_steps TEXT,
    
    -- Additional Data
    metadata JSONB DEFAULT '{}',
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Application Status History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE NOT NULL,
    
    -- Status Change Details
    previous_status application_status,
    new_status application_status NOT NULL,
    change_reason TEXT,
    notes TEXT,
    
    -- Change Metadata
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Additional Data
    metadata JSONB DEFAULT '{}'
);

-- Job Analytics Table
CREATE TABLE IF NOT EXISTS job_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    
    -- Date for analytics (daily aggregation)
    analytics_date DATE NOT NULL,
    
    -- View Metrics
    page_views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    
    -- Application Metrics
    applications_received INTEGER DEFAULT 0,
    applications_qualified INTEGER DEFAULT 0,
    applications_rejected INTEGER DEFAULT 0,
    
    -- Source Tracking
    source_breakdown JSONB DEFAULT '{}', -- {"website": 10, "linkedin": 5, "referral": 2}
    
    -- Performance Metrics
    time_to_first_application INTEGER, -- Hours
    average_application_quality DECIMAL(3,2),
    
    -- Additional Data
    metadata JSONB DEFAULT '{}',
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_job_analytics_per_date UNIQUE(job_id, analytics_date)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Job Postings Indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_department ON job_postings(department);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location);
CREATE INDEX IF NOT EXISTS idx_job_postings_job_type ON job_postings(job_type);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_date ON job_postings(posted_date);
CREATE INDEX IF NOT EXISTS idx_job_postings_deadline ON job_postings(application_deadline);
CREATE INDEX IF NOT EXISTS idx_job_postings_featured ON job_postings(is_featured);
CREATE INDEX IF NOT EXISTS idx_job_postings_slug ON job_postings(slug);

-- Job Applications Indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON job_applications(email);
CREATE INDEX IF NOT EXISTS idx_job_applications_submitted_at ON job_applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_job_applications_assigned_to ON job_applications(assigned_to);
CREATE INDEX IF NOT EXISTS idx_job_applications_rating ON job_applications(rating);

-- Interview Indexes
CREATE INDEX IF NOT EXISTS idx_job_interviews_application_id ON job_interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_job_interviews_scheduled_date ON job_interviews(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_job_interviews_status ON job_interviews(status);

-- Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_job_analytics_job_id ON job_analytics(job_id);
CREATE INDEX IF NOT EXISTS idx_job_analytics_date ON job_analytics(analytics_date);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_interviews_updated_at BEFORE UPDATE ON job_interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_analytics_updated_at BEFORE UPDATE ON job_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update application count on job postings
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE job_postings 
        SET application_count = application_count + 1 
        WHERE id = NEW.job_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE job_postings 
        SET application_count = application_count - 1 
        WHERE id = OLD.job_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply application count trigger
CREATE TRIGGER update_application_count_trigger 
    AFTER INSERT OR DELETE ON job_applications 
    FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

-- Function to create status history entry
CREATE OR REPLACE FUNCTION create_application_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO application_status_history (
            application_id,
            previous_status,
            new_status,
            change_reason,
            changed_by
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            'Status updated',
            NEW.assigned_to
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply status history trigger
CREATE TRIGGER create_status_history_trigger 
    AFTER UPDATE ON job_applications 
    FOR EACH ROW EXECUTE FUNCTION create_application_status_history();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DEPLOYMENT VERIFICATION
-- =============================================================================

-- Verify deployment completed successfully
DO $$
BEGIN
    RAISE NOTICE 'Job Management System Schema deployment completed successfully!';
    RAISE NOTICE 'Tables created: job_postings, job_applications, job_interviews, application_status_history, job_analytics';
    RAISE NOTICE 'Custom types created: job_status, job_type, application_status, interview_type, priority_level';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Triggers created: update timestamps, application count, status history';
    RAISE NOTICE 'RLS enabled on all tables (policies should be created separately)';
    RAISE NOTICE 'Next step: Deploy RLS policies using job-management-rls.sql';
END $$;
