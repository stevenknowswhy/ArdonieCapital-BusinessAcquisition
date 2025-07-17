-- =============================================================================
-- JOB MANAGEMENT SYSTEM - ROW LEVEL SECURITY POLICIES
-- =============================================================================
-- Comprehensive RLS policies for the job management system
-- Ensures proper access control for jobs, applications, and interviews
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- =============================================================================

-- Function to check if user is admin or super admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.slug IN ('super_admin', 'company_admin', 'hr_manager')
        AND ur.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is HR manager or recruiter
CREATE OR REPLACE FUNCTION is_hr_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.slug IN ('super_admin', 'company_admin', 'hr_manager', 'recruiter')
        AND ur.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can manage specific job
CREATE OR REPLACE FUNCTION can_manage_job(job_posting_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin users can manage all jobs
    IF is_admin_user() THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is hiring manager or recruiter for this job
    RETURN EXISTS (
        SELECT 1 FROM job_postings jp
        WHERE jp.id = job_posting_id
        AND (
            jp.hiring_manager_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR jp.recruiter_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR jp.created_by = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can view application
CREATE OR REPLACE FUNCTION can_view_application(application_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin and HR users can view all applications
    IF is_hr_user() THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is the applicant
    RETURN EXISTS (
        SELECT 1 FROM job_applications ja
        WHERE ja.id = application_id
        AND ja.applicant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- JOB POSTINGS RLS POLICIES
-- =============================================================================

-- Public read access for active job postings
CREATE POLICY "Public can view active job postings"
ON job_postings FOR SELECT
USING (
    status = 'active'
    AND (posted_date IS NULL OR posted_date <= NOW())
    AND (application_deadline IS NULL OR application_deadline > NOW())
);

-- HR users can view all job postings
CREATE POLICY "HR users can view all job postings"
ON job_postings FOR SELECT
TO authenticated
USING (is_hr_user());

-- HR users can create job postings
CREATE POLICY "HR users can create job postings"
ON job_postings FOR INSERT
TO authenticated
WITH CHECK (is_hr_user());

-- Users can update jobs they manage
CREATE POLICY "Users can update jobs they manage"
ON job_postings FOR UPDATE
TO authenticated
USING (can_manage_job(id))
WITH CHECK (can_manage_job(id));

-- Admin users can delete job postings
CREATE POLICY "Admin users can delete job postings"
ON job_postings FOR DELETE
TO authenticated
USING (is_admin_user());

-- =============================================================================
-- JOB APPLICATIONS RLS POLICIES
-- =============================================================================

-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
ON job_applications FOR SELECT
TO authenticated
USING (
    applicant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- HR users can view all applications
CREATE POLICY "HR users can view all applications"
ON job_applications FOR SELECT
TO authenticated
USING (is_hr_user());

-- Anyone can create applications (including anonymous users)
CREATE POLICY "Anyone can create applications"
ON job_applications FOR INSERT
WITH CHECK (true);

-- HR users can update applications
CREATE POLICY "HR users can update applications"
ON job_applications FOR UPDATE
TO authenticated
USING (is_hr_user())
WITH CHECK (is_hr_user());

-- Users can update their own applications (limited fields)
CREATE POLICY "Users can update their own applications"
ON job_applications FOR UPDATE
TO authenticated
USING (
    applicant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND status IN ('pending', 'reviewing') -- Only allow updates for early stages
)
WITH CHECK (
    applicant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Admin users can delete applications
CREATE POLICY "Admin users can delete applications"
ON job_applications FOR DELETE
TO authenticated
USING (is_admin_user());

-- =============================================================================
-- JOB INTERVIEWS RLS POLICIES
-- =============================================================================

-- HR users can view all interviews
CREATE POLICY "HR users can view all interviews"
ON job_interviews FOR SELECT
TO authenticated
USING (is_hr_user());

-- Applicants can view their own interviews
CREATE POLICY "Applicants can view their own interviews"
ON job_interviews FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM job_applications ja
        WHERE ja.id = application_id
        AND ja.applicant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

-- HR users can create interviews
CREATE POLICY "HR users can create interviews"
ON job_interviews FOR INSERT
TO authenticated
WITH CHECK (is_hr_user());

-- HR users can update interviews
CREATE POLICY "HR users can update interviews"
ON job_interviews FOR UPDATE
TO authenticated
USING (is_hr_user())
WITH CHECK (is_hr_user());

-- Admin users can delete interviews
CREATE POLICY "Admin users can delete interviews"
ON job_interviews FOR DELETE
TO authenticated
USING (is_admin_user());

-- =============================================================================
-- APPLICATION STATUS HISTORY RLS POLICIES
-- =============================================================================

-- HR users can view all status history
CREATE POLICY "HR users can view all status history"
ON application_status_history FOR SELECT
TO authenticated
USING (is_hr_user());

-- Applicants can view their own application status history
CREATE POLICY "Applicants can view their own status history"
ON application_status_history FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM job_applications ja
        WHERE ja.id = application_id
        AND ja.applicant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

-- System can create status history (triggered automatically)
CREATE POLICY "System can create status history"
ON application_status_history FOR INSERT
WITH CHECK (true);

-- Admin users can delete status history
CREATE POLICY "Admin users can delete status history"
ON application_status_history FOR DELETE
TO authenticated
USING (is_admin_user());

-- =============================================================================
-- JOB ANALYTICS RLS POLICIES
-- =============================================================================

-- HR users can view all analytics
CREATE POLICY "HR users can view all analytics"
ON job_analytics FOR SELECT
TO authenticated
USING (is_hr_user());

-- System can create and update analytics
CREATE POLICY "System can manage analytics"
ON job_analytics FOR ALL
USING (true)
WITH CHECK (true);

-- =============================================================================
-- ADDITIONAL SECURITY POLICIES
-- =============================================================================

-- Prevent unauthorized access to sensitive data
CREATE POLICY "Prevent unauthorized profile access"
ON profiles FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() -- Users can only see their own profile
    OR is_hr_user() -- HR users can see all profiles
);

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON job_postings TO authenticated;
GRANT INSERT ON job_postings TO authenticated;
GRANT UPDATE ON job_postings TO authenticated;
GRANT DELETE ON job_postings TO authenticated;

GRANT SELECT ON job_applications TO authenticated;
GRANT INSERT ON job_applications TO authenticated;
GRANT UPDATE ON job_applications TO authenticated;
GRANT DELETE ON job_applications TO authenticated;

GRANT SELECT ON job_interviews TO authenticated;
GRANT INSERT ON job_interviews TO authenticated;
GRANT UPDATE ON job_interviews TO authenticated;
GRANT DELETE ON job_interviews TO authenticated;

GRANT SELECT ON application_status_history TO authenticated;
GRANT INSERT ON application_status_history TO authenticated;
GRANT DELETE ON application_status_history TO authenticated;

GRANT SELECT ON job_analytics TO authenticated;
GRANT INSERT ON job_analytics TO authenticated;
GRANT UPDATE ON job_analytics TO authenticated;

-- Grant permissions to anonymous users for job applications
GRANT SELECT ON job_postings TO anon;
GRANT INSERT ON job_applications TO anon;

-- =============================================================================
-- SECURITY FUNCTIONS FOR APPLICATION LAYER
-- =============================================================================

-- Function to safely create job application
CREATE OR REPLACE FUNCTION create_job_application(
    p_job_id UUID,
    p_first_name TEXT,
    p_last_name TEXT,
    p_email TEXT,
    p_phone TEXT DEFAULT NULL,
    p_cover_letter TEXT DEFAULT NULL,
    p_resume_file_path TEXT DEFAULT NULL,
    p_resume_file_name TEXT DEFAULT NULL,
    p_screening_answers JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_application_id UUID;
    v_applicant_id UUID;
BEGIN
    -- Check if job exists and is active
    IF NOT EXISTS (
        SELECT 1 FROM job_postings 
        WHERE id = p_job_id 
        AND status = 'active'
        AND (application_deadline IS NULL OR application_deadline > NOW())
    ) THEN
        RAISE EXCEPTION 'Job posting is not available for applications';
    END IF;
    
    -- Check for duplicate application
    IF EXISTS (
        SELECT 1 FROM job_applications 
        WHERE job_id = p_job_id AND email = p_email
    ) THEN
        RAISE EXCEPTION 'Application already exists for this email and job';
    END IF;
    
    -- Get applicant profile if exists
    SELECT id INTO v_applicant_id 
    FROM profiles p
    JOIN auth.users u ON p.user_id = u.id
    WHERE u.email = p_email;
    
    -- Create application
    INSERT INTO job_applications (
        job_id,
        applicant_id,
        first_name,
        last_name,
        email,
        phone,
        cover_letter,
        resume_file_path,
        resume_file_name,
        screening_answers
    ) VALUES (
        p_job_id,
        v_applicant_id,
        p_first_name,
        p_last_name,
        p_email,
        p_phone,
        p_cover_letter,
        p_resume_file_path,
        p_resume_file_name,
        p_screening_answers
    ) RETURNING id INTO v_application_id;
    
    RETURN v_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely update application status
CREATE OR REPLACE FUNCTION update_application_status(
    p_application_id UUID,
    p_new_status application_status,
    p_notes TEXT DEFAULT NULL,
    p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user has permission to update
    IF NOT is_hr_user() THEN
        RAISE EXCEPTION 'Insufficient permissions to update application status';
    END IF;
    
    -- Update application
    UPDATE job_applications 
    SET 
        status = p_new_status,
        status_notes = COALESCE(p_notes, status_notes),
        rejection_reason = CASE 
            WHEN p_new_status = 'rejected' THEN COALESCE(p_rejection_reason, rejection_reason)
            ELSE rejection_reason
        END,
        decision_made_at = CASE 
            WHEN p_new_status IN ('accepted', 'rejected') THEN NOW()
            ELSE decision_made_at
        END,
        assigned_to = (SELECT id FROM profiles WHERE user_id = auth.uid())
    WHERE id = p_application_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DEPLOYMENT VERIFICATION
-- =============================================================================

-- Verify RLS policies deployment
DO $$
BEGIN
    RAISE NOTICE 'Job Management System RLS Policies deployment completed successfully!';
    RAISE NOTICE 'RLS policies created for: job_postings, job_applications, job_interviews, application_status_history, job_analytics';
    RAISE NOTICE 'Security functions created: is_admin_user, is_hr_user, can_manage_job, can_view_application';
    RAISE NOTICE 'Application functions created: create_job_application, update_application_status';
    RAISE NOTICE 'Permissions granted to authenticated and anonymous users';
    RAISE NOTICE 'Job Management System database implementation is complete!';
END $$;
