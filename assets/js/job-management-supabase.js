/**
 * Job Management Supabase Integration Service
 * Handles database operations for the job management system
 */

class JobManagementService {
    constructor() {
        this.supabase = window.supabase;
        this.isConnected = false;
        this.init();
    }
    
    async init() {
        if (this.supabase) {
            try {
                // Test connection
                const { data, error } = await this.supabase.from('job_postings').select('count').limit(1);
                this.isConnected = !error;
                console.log('Job Management Service initialized:', this.isConnected ? 'Connected' : 'Offline');
            } catch (error) {
                console.warn('Supabase connection failed, using offline mode:', error);
                this.isConnected = false;
            }
        }
    }
    
    // =============================================================================
    // JOB POSTINGS OPERATIONS
    // =============================================================================
    
    async getActiveJobs() {
        if (!this.isConnected) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('job_postings')
                .select('*')
                .eq('status', 'active')
                .order('posted_date', { ascending: false });
            
            if (error) throw error;
            
            return data.map(job => this.transformJobFromDB(job));
        } catch (error) {
            console.error('Error fetching active jobs:', error);
            return null;
        }
    }
    
    async getJobById(jobId) {
        if (!this.isConnected) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('job_postings')
                .select('*')
                .eq('id', jobId)
                .single();
            
            if (error) throw error;
            
            return this.transformJobFromDB(data);
        } catch (error) {
            console.error('Error fetching job by ID:', error);
            return null;
        }
    }
    
    async createJob(jobData) {
        if (!this.isConnected) return null;
        
        try {
            const dbJob = this.transformJobToDB(jobData);
            
            const { data, error } = await this.supabase
                .from('job_postings')
                .insert([dbJob])
                .select()
                .single();
            
            if (error) throw error;
            
            return this.transformJobFromDB(data);
        } catch (error) {
            console.error('Error creating job:', error);
            throw error;
        }
    }
    
    async updateJob(jobId, jobData) {
        if (!this.isConnected) return null;
        
        try {
            const dbJob = this.transformJobToDB(jobData);
            
            const { data, error } = await this.supabase
                .from('job_postings')
                .update(dbJob)
                .eq('id', jobId)
                .select()
                .single();
            
            if (error) throw error;
            
            return this.transformJobFromDB(data);
        } catch (error) {
            console.error('Error updating job:', error);
            throw error;
        }
    }
    
    async deleteJob(jobId) {
        if (!this.isConnected) return false;
        
        try {
            const { error } = await this.supabase
                .from('job_postings')
                .delete()
                .eq('id', jobId);
            
            if (error) throw error;
            
            return true;
        } catch (error) {
            console.error('Error deleting job:', error);
            return false;
        }
    }
    
    async toggleJobStatus(jobId) {
        if (!this.isConnected) return null;
        
        try {
            // First get current status
            const { data: currentJob, error: fetchError } = await this.supabase
                .from('job_postings')
                .select('status')
                .eq('id', jobId)
                .single();
            
            if (fetchError) throw fetchError;
            
            // Toggle status
            const newStatus = currentJob.status === 'active' ? 'paused' : 'active';
            
            const { data, error } = await this.supabase
                .from('job_postings')
                .update({ status: newStatus })
                .eq('id', jobId)
                .select()
                .single();
            
            if (error) throw error;
            
            return this.transformJobFromDB(data);
        } catch (error) {
            console.error('Error toggling job status:', error);
            return null;
        }
    }
    
    // =============================================================================
    // JOB APPLICATIONS OPERATIONS
    // =============================================================================
    
    async getApplicationsForJob(jobId) {
        if (!this.isConnected) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('job_applications')
                .select('*')
                .eq('job_id', jobId)
                .order('submitted_at', { ascending: false });
            
            if (error) throw error;
            
            return data.map(app => this.transformApplicationFromDB(app));
        } catch (error) {
            console.error('Error fetching applications for job:', error);
            return null;
        }
    }
    
    async getAllApplications() {
        if (!this.isConnected) return null;
        
        try {
            const { data, error } = await this.supabase
                .from('job_applications')
                .select(`
                    *,
                    job_postings (
                        title,
                        department
                    )
                `)
                .order('submitted_at', { ascending: false });
            
            if (error) throw error;
            
            return data.map(app => this.transformApplicationFromDB(app));
        } catch (error) {
            console.error('Error fetching all applications:', error);
            return null;
        }
    }
    
    async createApplication(applicationData) {
        if (!this.isConnected) return null;
        
        try {
            const { data, error } = await this.supabase.rpc('create_job_application', {
                p_job_id: applicationData.jobId,
                p_first_name: applicationData.firstName,
                p_last_name: applicationData.lastName,
                p_email: applicationData.email,
                p_phone: applicationData.phone,
                p_cover_letter: applicationData.coverLetter,
                p_resume_file_path: applicationData.resumeFilePath,
                p_resume_file_name: applicationData.resumeFileName,
                p_screening_answers: applicationData.screeningAnswers || {}
            });
            
            if (error) throw error;
            
            return data; // Returns the application ID
        } catch (error) {
            console.error('Error creating application:', error);
            throw error;
        }
    }
    
    async updateApplicationStatus(applicationId, status, notes = null, rejectionReason = null) {
        if (!this.isConnected) return false;
        
        try {
            const { data, error } = await this.supabase.rpc('update_application_status', {
                p_application_id: applicationId,
                p_new_status: status,
                p_notes: notes,
                p_rejection_reason: rejectionReason
            });
            
            if (error) throw error;
            
            return true;
        } catch (error) {
            console.error('Error updating application status:', error);
            return false;
        }
    }
    
    // =============================================================================
    // ANALYTICS OPERATIONS
    // =============================================================================
    
    async getJobAnalytics(jobId, startDate = null, endDate = null) {
        if (!this.isConnected) return null;
        
        try {
            let query = this.supabase
                .from('job_analytics')
                .select('*')
                .eq('job_id', jobId)
                .order('analytics_date', { ascending: false });
            
            if (startDate) {
                query = query.gte('analytics_date', startDate);
            }
            
            if (endDate) {
                query = query.lte('analytics_date', endDate);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Error fetching job analytics:', error);
            return null;
        }
    }
    
    async getDashboardStats() {
        if (!this.isConnected) return null;
        
        try {
            // Get job counts by status
            const { data: jobStats, error: jobError } = await this.supabase
                .from('job_postings')
                .select('status')
                .not('deleted_at', 'is', null);
            
            if (jobError) throw jobError;
            
            // Get application counts by status
            const { data: appStats, error: appError } = await this.supabase
                .from('job_applications')
                .select('status');
            
            if (appError) throw appError;
            
            // Calculate statistics
            const totalJobs = jobStats.length;
            const activeJobs = jobStats.filter(job => job.status === 'active').length;
            const totalApplications = appStats.length;
            const pendingApplications = appStats.filter(app => app.status === 'pending').length;
            
            return {
                totalJobs,
                activeJobs,
                totalApplications,
                pendingApplications,
                averageApplicationsPerJob: totalJobs > 0 ? Math.round(totalApplications / totalJobs * 10) / 10 : 0
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return null;
        }
    }
    
    // =============================================================================
    // DATA TRANSFORMATION HELPERS
    // =============================================================================
    
    transformJobFromDB(dbJob) {
        return {
            id: dbJob.id,
            title: dbJob.title,
            department: dbJob.department,
            location: dbJob.location,
            type: this.formatJobType(dbJob.job_type),
            salaryRange: this.formatSalaryRange(dbJob.salary_min, dbJob.salary_max, dbJob.salary_currency),
            description: dbJob.description,
            requirements: dbJob.requirements || [],
            benefits: dbJob.benefits || [],
            responsibilities: dbJob.responsibilities || [],
            qualifications: dbJob.qualifications || [],
            deadline: dbJob.application_deadline ? new Date(dbJob.application_deadline).toISOString().split('T')[0] : null,
            postedDate: new Date(dbJob.posted_date || dbJob.created_at),
            isActive: dbJob.status === 'active',
            status: dbJob.status,
            isFeatured: dbJob.is_featured,
            isRemote: dbJob.is_remote,
            isUrgent: dbJob.is_urgent,
            positionsAvailable: dbJob.positions_available,
            positionsFilled: dbJob.positions_filled,
            applicationCount: dbJob.application_count || 0,
            viewCount: dbJob.view_count || 0
        };
    }
    
    transformJobToDB(frontendJob) {
        return {
            title: frontendJob.title,
            slug: this.generateSlug(frontendJob.title),
            department: frontendJob.department,
            location: frontendJob.location,
            job_type: this.parseJobType(frontendJob.type),
            description: frontendJob.description,
            requirements: frontendJob.requirements || [],
            benefits: frontendJob.benefits || [],
            responsibilities: frontendJob.responsibilities || [],
            qualifications: frontendJob.qualifications || [],
            salary_min: this.parseSalaryMin(frontendJob.salaryRange),
            salary_max: this.parseSalaryMax(frontendJob.salaryRange),
            salary_currency: 'USD',
            application_deadline: frontendJob.deadline ? new Date(frontendJob.deadline).toISOString() : null,
            posted_date: frontendJob.postedDate ? new Date(frontendJob.postedDate).toISOString() : new Date().toISOString(),
            status: frontendJob.status || 'active',
            is_featured: frontendJob.isFeatured || false,
            is_remote: frontendJob.isRemote || false,
            is_urgent: frontendJob.isUrgent || false,
            positions_available: frontendJob.positionsAvailable || 1
        };
    }
    
    transformApplicationFromDB(dbApp) {
        return {
            id: dbApp.id,
            jobId: dbApp.job_id,
            jobTitle: dbApp.job_postings?.title || 'Unknown Position',
            name: `${dbApp.first_name} ${dbApp.last_name}`,
            firstName: dbApp.first_name,
            lastName: dbApp.last_name,
            email: dbApp.email,
            phone: dbApp.phone,
            coverLetter: dbApp.cover_letter,
            resumeFile: dbApp.resume_file_path ? {
                name: dbApp.resume_file_name,
                path: dbApp.resume_file_path,
                size: dbApp.resume_file_size
            } : null,
            status: dbApp.status,
            submittedAt: new Date(dbApp.submitted_at),
            rating: dbApp.rating,
            internalNotes: dbApp.internal_notes,
            statusNotes: dbApp.status_notes,
            rejectionReason: dbApp.rejection_reason,
            yearsExperience: dbApp.years_experience,
            expectedSalary: dbApp.expected_salary,
            availableStartDate: dbApp.available_start_date,
            applicationSource: dbApp.application_source
        };
    }
    
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    
    formatJobType(jobType) {
        const typeMap = {
            'full_time': 'Full-time',
            'part_time': 'Part-time',
            'contract': 'Contract',
            'internship': 'Internship',
            'temporary': 'Temporary',
            'freelance': 'Freelance'
        };
        return typeMap[jobType] || jobType;
    }
    
    parseJobType(jobType) {
        const typeMap = {
            'Full-time': 'full_time',
            'Part-time': 'part_time',
            'Contract': 'contract',
            'Internship': 'internship',
            'Temporary': 'temporary',
            'Freelance': 'freelance'
        };
        return typeMap[jobType] || 'full_time';
    }
    
    formatSalaryRange(min, max, currency = 'USD') {
        if (!min && !max) return 'Competitive salary';
        
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        if (min && max) {
            return `${formatter.format(min)} - ${formatter.format(max)}`;
        } else if (min) {
            return `${formatter.format(min)}+`;
        } else {
            return `Up to ${formatter.format(max)}`;
        }
    }
    
    parseSalaryMin(salaryRange) {
        if (!salaryRange) return null;
        const match = salaryRange.match(/\$?([\d,]+)/);
        return match ? parseInt(match[1].replace(/,/g, '')) : null;
    }
    
    parseSalaryMax(salaryRange) {
        if (!salaryRange) return null;
        const matches = salaryRange.match(/\$?([\d,]+)/g);
        if (matches && matches.length > 1) {
            return parseInt(matches[1].replace(/[\$,]/g, ''));
        }
        return null;
    }
    
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}

// Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
function initializeJobManagementService() {
    if (!window.jobManagementService) {
        window.jobManagementService = new JobManagementService();
        console.log('💼 Job Management Service initialized');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeJobManagementService);
} else {
    // DOM is already loaded
    initializeJobManagementService();
}

// Also provide a manual initialization function for testing
window.initializeJobManagementService = initializeJobManagementService;
