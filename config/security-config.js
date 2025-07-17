/**
 * Comprehensive Security Configuration for Job Management System
 * Defines security policies, validation rules, and access controls
 */

export const SecurityConfig = {
    // =============================================================================
    // AUTHENTICATION SETTINGS
    // =============================================================================
    authentication: {
        // Session management
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        rememberMeTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
        
        // Password requirements
        passwordPolicy: {
            minLength: 8,
            maxLength: 128,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            preventCommonPasswords: true,
            preventUserInfoInPassword: true
        },
        
        // Account lockout
        lockoutPolicy: {
            maxFailedAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutes
            progressiveLockout: true // Increase lockout time with repeated failures
        },
        
        // Multi-factor authentication
        mfa: {
            enabled: false, // Future enhancement
            methods: ['totp', 'sms', 'email'],
            gracePeriod: 7 * 24 * 60 * 60 * 1000 // 7 days
        }
    },
    
    // =============================================================================
    // AUTHORIZATION & ROLE-BASED ACCESS CONTROL
    // =============================================================================
    authorization: {
        // Role hierarchy (higher roles inherit lower role permissions)
        roleHierarchy: {
            'super_admin': 100,
            'company_admin': 80,
            'hr_manager': 60,
            'recruiter': 40,
            'hiring_manager': 30,
            'applicant': 10,
            'guest': 0
        },
        
        // Permission definitions
        permissions: {
            // Job management permissions
            'job.create': {
                description: 'Create new job postings',
                requiredRoles: ['super_admin', 'company_admin', 'hr_manager']
            },
            'job.read': {
                description: 'View job postings',
                requiredRoles: ['super_admin', 'company_admin', 'hr_manager', 'recruiter', 'hiring_manager', 'applicant', 'guest']
            },
            'job.update': {
                description: 'Update job postings',
                requiredRoles: ['super_admin', 'company_admin', 'hr_manager'],
                resourceCheck: 'canManageJob'
            },
            'job.delete': {
                description: 'Delete job postings',
                requiredRoles: ['super_admin', 'company_admin']
            },
            
            // Application management permissions
            'application.create': {
                description: 'Submit job applications',
                requiredRoles: ['applicant', 'guest']
            },
            'application.read': {
                description: 'View job applications',
                requiredRoles: ['super_admin', 'company_admin', 'hr_manager', 'recruiter'],
                resourceCheck: 'canViewApplication'
            },
            'application.read.own': {
                description: 'View own applications',
                requiredRoles: ['applicant']
            },
            'application.update': {
                description: 'Update application status',
                requiredRoles: ['super_admin', 'company_admin', 'hr_manager', 'recruiter']
            },
            'application.delete': {
                description: 'Delete applications',
                requiredRoles: ['super_admin', 'company_admin']
            },
            
            // Interview management permissions
            'interview.create': {
                description: 'Schedule interviews',
                requiredRoles: ['super_admin', 'company_admin', 'hr_manager', 'recruiter']
            },
            'interview.read': {
                description: 'View interview details',
                requiredRoles: ['super_admin', 'company_admin', 'hr_manager', 'recruiter', 'hiring_manager'],
                resourceCheck: 'canViewInterview'
            },
            'interview.update': {
                description: 'Update interview details',
                requiredRoles: ['super_admin', 'company_admin', 'hr_manager', 'recruiter']
            },
            'interview.delete': {
                description: 'Cancel/delete interviews',
                requiredRoles: ['super_admin', 'company_admin', 'hr_manager']
            },
            
            // Analytics and reporting permissions
            'analytics.read': {
                description: 'View analytics and reports',
                requiredRoles: ['super_admin', 'company_admin', 'hr_manager']
            },
            
            // System administration permissions
            'user.manage': {
                description: 'Manage user accounts',
                requiredRoles: ['super_admin']
            },
            'system.configure': {
                description: 'Configure system settings',
                requiredRoles: ['super_admin']
            }
        }
    },
    
    // =============================================================================
    // INPUT VALIDATION & SANITIZATION
    // =============================================================================
    validation: {
        // Job posting validation rules
        jobPosting: {
            title: {
                required: true,
                minLength: 3,
                maxLength: 100,
                pattern: /^[a-zA-Z0-9\s\-\(\)\/&,\.]+$/,
                sanitize: 'text'
            },
            department: {
                required: true,
                allowedValues: ['Sales', 'Operations', 'Technology', 'Finance', 'Marketing', 'Human Resources', 'Legal', 'Customer Service'],
                sanitize: 'text'
            },
            location: {
                required: true,
                maxLength: 100,
                sanitize: 'text'
            },
            description: {
                required: true,
                minLength: 50,
                maxLength: 5000,
                sanitize: 'html'
            },
            salaryRange: {
                required: true,
                pattern: /^(\$?[\d,]+k?\s*-\s*\$?[\d,]+k?|\$?[\d,]+\+?|competitive|negotiable)$/i,
                sanitize: 'text'
            },
            requirements: {
                required: true,
                minItems: 1,
                maxItems: 20,
                itemMaxLength: 200,
                sanitize: 'text'
            },
            benefits: {
                required: true,
                minItems: 1,
                maxItems: 20,
                itemMaxLength: 200,
                sanitize: 'text'
            }
        },
        
        // Job application validation rules
        jobApplication: {
            firstName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-Z\s\-'\.]+$/,
                sanitize: 'text'
            },
            lastName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-Z\s\-'\.]+$/,
                sanitize: 'text'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                maxLength: 254,
                sanitize: 'email'
            },
            phone: {
                required: false,
                pattern: /^\+?[\d\s\-\(\)]{10,}$/,
                sanitize: 'phone'
            },
            coverLetter: {
                required: true,
                minLength: 50,
                maxLength: 2000,
                sanitize: 'text'
            },
            linkedin: {
                required: false,
                pattern: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/,
                sanitize: 'url'
            }
        }
    },
    
    // =============================================================================
    // RATE LIMITING & ABUSE PREVENTION
    // =============================================================================
    rateLimiting: {
        // API rate limits
        api: {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 100,
            skipSuccessfulRequests: false,
            skipFailedRequests: false
        },
        
        // Login attempt limits
        login: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxAttempts: 5,
            progressiveDelay: true
        },
        
        // Application submission limits
        applications: {
            windowMs: 24 * 60 * 60 * 1000, // 24 hours
            maxApplications: 10, // Per job per user
            globalMaxApplications: 50 // Per user across all jobs
        }
    },
    
    // =============================================================================
    // SECURITY HEADERS & CSP
    // =============================================================================
    securityHeaders: {
        production: {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: https:",
                "connect-src 'self' https:",
                "frame-ancestors 'none'"
            ].join('; '),
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
        },
        development: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'Content-Security-Policy': [
                "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
                "style-src 'self' 'unsafe-inline' https:",
                "img-src 'self' data: https:",
                "connect-src 'self' https: ws: wss:"
            ].join('; ')
        }
    },
    
    // =============================================================================
    // AUDIT & LOGGING
    // =============================================================================
    audit: {
        // Events to log
        logEvents: [
            'LOGIN_SUCCESS',
            'LOGIN_FAILED',
            'LOGOUT',
            'PASSWORD_CHANGE',
            'ACCOUNT_LOCKED',
            'PERMISSION_DENIED',
            'JOB_CREATED',
            'JOB_UPDATED',
            'JOB_DELETED',
            'APPLICATION_SUBMITTED',
            'APPLICATION_STATUS_CHANGED',
            'INTERVIEW_SCHEDULED',
            'SUSPICIOUS_ACTIVITY'
        ],
        
        // Log retention
        retention: {
            securityEvents: 90, // days
            auditTrail: 365, // days
            errorLogs: 30 // days
        },
        
        // Alert thresholds
        alerts: {
            failedLoginThreshold: 10, // per hour
            suspiciousActivityThreshold: 5, // per 5 minutes
            errorRateThreshold: 0.05 // 5% error rate
        }
    },
    
    // =============================================================================
    // FILE UPLOAD SECURITY
    // =============================================================================
    fileUpload: {
        // Allowed file types for resumes
        allowedTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ],
        
        // File size limits
        maxFileSize: 5 * 1024 * 1024, // 5MB
        
        // Security scanning
        virusScanning: true,
        contentValidation: true,
        
        // Storage settings
        storage: {
            path: '/uploads/resumes/',
            encryption: true,
            accessControl: 'private'
        }
    },
    
    // =============================================================================
    // ENCRYPTION & DATA PROTECTION
    // =============================================================================
    encryption: {
        // Algorithms
        symmetric: 'AES-256-GCM',
        asymmetric: 'RSA-2048',
        hashing: 'SHA-256',
        
        // Key management
        keyRotation: 90, // days
        keyStorage: 'secure',
        
        // Data classification
        sensitiveFields: [
            'password',
            'ssn',
            'creditCard',
            'bankAccount',
            'personalNotes'
        ]
    }
};

// Export default configuration
export default SecurityConfig;
