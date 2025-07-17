/**
 * Comprehensive Security Manager for Job Management System
 * Handles authentication, authorization, input validation, and security monitoring
 */

class SecurityManager {
    constructor() {
        this.csrfToken = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.securityEvents = [];
        this.init();
    }
    
    async init() {
        this.generateCSRFToken();
        this.setupSecurityHeaders();
        this.initializeSessionMonitoring();
        this.setupInputSanitization();
        this.initializeRateLimiting();
        console.log('🔒 Security Manager initialized');
    }
    
    // =============================================================================
    // AUTHENTICATION & SESSION MANAGEMENT
    // =============================================================================
    
    /**
     * Enhanced authentication with security checks
     */
    async authenticateUser(email, password, rememberMe = false) {
        try {
            // Rate limiting check
            if (!this.checkRateLimit(email)) {
                throw new Error('Too many login attempts. Please try again later.');
            }
            
            // Input validation
            const validationResult = this.validateLoginInput(email, password);
            if (!validationResult.isValid) {
                throw new Error(validationResult.error);
            }
            
            // Check for account lockout
            if (this.isAccountLocked(email)) {
                throw new Error('Account is temporarily locked due to multiple failed login attempts.');
            }
            
            // Attempt authentication
            const authResult = await this.performAuthentication(email, password);
            
            if (authResult.success) {
                // Clear failed attempts on successful login
                this.clearFailedAttempts(email);
                
                // Create secure session
                await this.createSecureSession(authResult.user, rememberMe);
                
                // Log security event
                this.logSecurityEvent('LOGIN_SUCCESS', { email, timestamp: new Date() });
                
                return authResult;
            } else {
                // Track failed attempt
                this.trackFailedAttempt(email);
                
                // Log security event
                this.logSecurityEvent('LOGIN_FAILED', { email, timestamp: new Date() });
                
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            this.logSecurityEvent('LOGIN_ERROR', { email, error: error.message, timestamp: new Date() });
            throw error;
        }
    }
    
    /**
     * Create secure session with proper tokens
     */
    async createSecureSession(user, rememberMe = false) {
        const sessionData = {
            userId: user.id,
            email: user.email,
            roles: user.roles || [],
            permissions: await this.getUserPermissions(user.id),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : this.sessionTimeout)).toISOString(),
            csrfToken: this.csrfToken,
            sessionId: this.generateSecureToken()
        };
        
        // Encrypt and store session data
        const encryptedSession = this.encryptData(JSON.stringify(sessionData));
        localStorage.setItem('secure_session', encryptedSession);
        
        // Set session timeout
        if (!rememberMe) {
            setTimeout(() => {
                this.logout();
            }, this.sessionTimeout);
        }
        
        return sessionData;
    }
    
    /**
     * Validate current session
     */
    validateSession() {
        try {
            const encryptedSession = localStorage.getItem('secure_session');
            if (!encryptedSession) return null;
            
            const sessionData = JSON.parse(this.decryptData(encryptedSession));
            
            // Check expiration
            if (new Date() > new Date(sessionData.expiresAt)) {
                this.logout();
                return null;
            }
            
            // Validate CSRF token
            if (sessionData.csrfToken !== this.csrfToken) {
                this.logout();
                throw new Error('Invalid session token');
            }
            
            return sessionData;
        } catch (error) {
            this.logSecurityEvent('SESSION_VALIDATION_ERROR', { error: error.message });
            this.logout();
            return null;
        }
    }
    
    /**
     * Secure logout with cleanup
     */
    logout() {
        // Clear session data
        localStorage.removeItem('secure_session');
        sessionStorage.clear();
        
        // Clear any sensitive data from memory
        this.clearSensitiveData();
        
        // Log security event
        this.logSecurityEvent('LOGOUT', { timestamp: new Date() });
        
        // Redirect to login page
        window.location.href = '/login.html';
    }
    
    // =============================================================================
    // AUTHORIZATION & ROLE-BASED ACCESS CONTROL
    // =============================================================================
    
    /**
     * Check if user has required permission
     */
    hasPermission(permission, userId = null) {
        const session = this.validateSession();
        if (!session) return false;
        
        const userPermissions = session.permissions || [];
        
        // Super admin has all permissions
        if (session.roles.includes('super_admin')) return true;
        
        // Check specific permission
        return userPermissions.includes(permission);
    }
    
    /**
     * Check if user has required role
     */
    hasRole(role, userId = null) {
        const session = this.validateSession();
        if (!session) return false;
        
        return session.roles.includes(role);
    }
    
    /**
     * Get user permissions based on roles
     */
    async getUserPermissions(userId) {
        const rolePermissions = {
            'super_admin': [
                'job.create', 'job.read', 'job.update', 'job.delete',
                'application.read', 'application.update', 'application.delete',
                'interview.create', 'interview.read', 'interview.update', 'interview.delete',
                'analytics.read', 'user.manage', 'system.configure'
            ],
            'company_admin': [
                'job.create', 'job.read', 'job.update',
                'application.read', 'application.update',
                'interview.create', 'interview.read', 'interview.update',
                'analytics.read'
            ],
            'hr_manager': [
                'job.create', 'job.read', 'job.update',
                'application.read', 'application.update',
                'interview.create', 'interview.read', 'interview.update'
            ],
            'recruiter': [
                'job.read', 'application.read', 'application.update',
                'interview.create', 'interview.read', 'interview.update'
            ],
            'hiring_manager': [
                'job.read', 'application.read',
                'interview.read', 'interview.update'
            ],
            'applicant': [
                'job.read', 'application.create', 'application.read.own'
            ]
        };
        
        // Get user roles (this would typically come from database)
        const userRoles = await this.getUserRoles(userId);
        
        // Combine permissions from all roles
        const permissions = new Set();
        userRoles.forEach(role => {
            if (rolePermissions[role]) {
                rolePermissions[role].forEach(permission => permissions.add(permission));
            }
        });
        
        return Array.from(permissions);
    }
    
    /**
     * Authorize specific action
     */
    authorizeAction(action, resourceId = null, userId = null) {
        const session = this.validateSession();
        if (!session) {
            throw new Error('Authentication required');
        }
        
        // Check permission
        if (!this.hasPermission(action, userId)) {
            this.logSecurityEvent('AUTHORIZATION_DENIED', {
                userId: session.userId,
                action,
                resourceId,
                timestamp: new Date()
            });
            throw new Error('Insufficient permissions');
        }
        
        // Additional resource-specific checks
        if (resourceId && action.includes('.update') || action.includes('.delete')) {
            if (!this.canAccessResource(action, resourceId, session.userId)) {
                throw new Error('Access denied to this resource');
            }
        }
        
        return true;
    }
    
    // =============================================================================
    // INPUT VALIDATION & SANITIZATION
    // =============================================================================
    
    /**
     * Comprehensive input sanitization
     */
    sanitizeInput(input, type = 'text') {
        if (typeof input !== 'string') {
            input = String(input);
        }
        
        switch (type) {
            case 'html':
                return this.sanitizeHTML(input);
            case 'sql':
                return this.sanitizeSQL(input);
            case 'email':
                return this.sanitizeEmail(input);
            case 'phone':
                return this.sanitizePhone(input);
            case 'url':
                return this.sanitizeURL(input);
            case 'filename':
                return this.sanitizeFilename(input);
            default:
                return this.sanitizeText(input);
        }
    }
    
    /**
     * Sanitize HTML content
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }
    
    /**
     * Sanitize SQL input (prevent SQL injection)
     */
    sanitizeSQL(input) {
        if (typeof input !== 'string') {
            input = String(input);
        }

        // First, remove dangerous characters that could break out of contexts
        let sanitized = input
            // Remove dangerous characters and escape sequences first
            .replace(/['";\\]/g, '')
            .replace(/\x00/g, '')
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ')
            .replace(/\x1a/g, '')
            .replace(/\t/g, ' ');

        // Remove SQL comments (must be done early to prevent comment-based bypasses)
        sanitized = sanitized
            .replace(/--.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/#.*$/gm, ''); // MySQL style comments

        // Remove complete SQL injection patterns and dangerous statements
        sanitized = sanitized
            // Remove entire dangerous SQL statements and keywords
            .replace(/\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE|UNION|SELECT|FROM|WHERE|HAVING|ORDER|GROUP|INTO|VALUES|SET|TRUNCATE|REPLACE|MERGE|CALL|DECLARE|GRANT|REVOKE|TABLE|DATABASE|SCHEMA|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER)\b[\s\S]*?(?=\b(?:DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE|UNION|SELECT|FROM|WHERE|HAVING|ORDER|GROUP|INTO|VALUES|SET|TRUNCATE|REPLACE|MERGE|CALL|DECLARE|GRANT|REVOKE|TABLE|DATABASE|SCHEMA|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER)\b|$)/gi, '')

            // Remove SQL injection patterns
            .replace(/(\b(OR|AND)\s+\d+\s*[=<>!]+\s*\d+)/gi, '')
            .replace(/(\b(OR|AND)\s+['"]\w*['"]\s*[=<>!]+\s*['"]\w*['"])/gi, '')
            .replace(/(\b(OR|AND)\s+(TRUE|FALSE|NULL))/gi, '')

            // Remove hex and binary literals
            .replace(/0x[0-9a-f]+/gi, '')
            .replace(/0b[01]+/gi, '')

            // Remove dangerous function calls
            .replace(/\b(CHAR|ASCII|SUBSTRING|CONCAT|LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE|BENCHMARK|SLEEP|DELAY|WAITFOR|EXEC|EXECUTE|EVAL|SCRIPT)\s*\(/gi, '')

            // Remove any remaining SQL keywords that might have been missed
            .replace(/\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE|UNION|SELECT|FROM|WHERE|HAVING|ORDER|GROUP|INTO|VALUES|SET|TRUNCATE|REPLACE|MERGE|CALL|DECLARE|GRANT|REVOKE|TABLE|DATABASE|SCHEMA|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER|USERS|INFORMATION_SCHEMA|SYS|MYSQL|PERFORMANCE_SCHEMA)\b/gi, '')

            // Clean up multiple spaces and trim
            .replace(/\s+/g, ' ')
            .trim();

        // Final safety check - if result contains any remaining dangerous patterns, return empty string
        const dangerousPatterns = [
            /\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE|UNION|SELECT|TABLE|DATABASE)\b/i,
            /[';"].*[';"]/, // Quoted strings that might contain injection
            /--/, // Any remaining comments
            /\/\*/, // Any remaining comments
            /\bOR\s+\d+\s*=/i, // OR injection patterns
            /\bAND\s+\d+\s*=/i // AND injection patterns
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(sanitized)) {
                console.warn('SQL Sanitization: Dangerous pattern detected, returning empty string');
                return '';
            }
        }

        return sanitized;
    }
    
    /**
     * Validate SQL input for potential injection attempts
     */
    validateSQLInput(input) {
        if (typeof input !== 'string') {
            input = String(input);
        }

        const dangerousPatterns = [
            /--/,                                    // SQL comments
            /\/\*[\s\S]*?\*\//,                     // Multi-line comments
            /\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE|UNION|TRUNCATE)\b/i,
            /(\bOR\s+\d+\s*=\s*\d+)/i,             // OR 1=1 patterns
            /(\bAND\s+\d+\s*=\s*\d+)/i,            // AND 1=1 patterns
            /['";\\]/,                               // Dangerous quotes and backslashes
            /\x00/,                                  // Null bytes
            /0x[0-9a-f]+/i,                         // Hex literals
            /\b(CHAR|ASCII|SUBSTRING|CONCAT|LOAD_FILE|INTO\s+OUTFILE|BENCHMARK|SLEEP)\s*\(/i
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(input)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Sanitize text input
     */
    sanitizeText(text) {
        return text
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }
    
    /**
     * Validate and sanitize email
     */
    sanitizeEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const sanitized = email.toLowerCase().trim();
        
        if (!emailRegex.test(sanitized)) {
            throw new Error('Invalid email format');
        }
        
        return sanitized;
    }
    
    /**
     * Validate job application input
     */
    validateJobApplicationInput(applicationData) {
        const errors = [];
        
        // Required fields
        if (!applicationData.firstName || applicationData.firstName.trim().length < 2) {
            errors.push('First name must be at least 2 characters');
        }
        
        if (!applicationData.lastName || applicationData.lastName.trim().length < 2) {
            errors.push('Last name must be at least 2 characters');
        }
        
        if (!applicationData.email) {
            errors.push('Email is required');
        } else {
            try {
                this.sanitizeEmail(applicationData.email);
            } catch (error) {
                errors.push('Invalid email format');
            }
        }
        
        if (applicationData.phone && !this.validatePhone(applicationData.phone)) {
            errors.push('Invalid phone number format');
        }
        
        if (!applicationData.coverLetter || applicationData.coverLetter.trim().length < 50) {
            errors.push('Cover letter must be at least 50 characters');
        }
        
        // Sanitize all text inputs
        const sanitizedData = {
            firstName: this.sanitizeText(applicationData.firstName),
            lastName: this.sanitizeText(applicationData.lastName),
            email: this.sanitizeEmail(applicationData.email),
            phone: applicationData.phone ? this.sanitizePhone(applicationData.phone) : null,
            coverLetter: this.sanitizeText(applicationData.coverLetter)
        };
        
        return {
            isValid: errors.length === 0,
            errors,
            sanitizedData
        };
    }
    
    // =============================================================================
    // SECURITY MONITORING & LOGGING
    // =============================================================================
    
    /**
     * Log security events
     */
    logSecurityEvent(eventType, details) {
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ip: this.getClientIP(),
            details
        };
        
        this.securityEvents.push(event);
        
        // Keep only last 1000 events
        if (this.securityEvents.length > 1000) {
            this.securityEvents = this.securityEvents.slice(-1000);
        }
        
        // Send to server for persistent logging
        this.sendSecurityEventToServer(event);
        
        console.log(`🔒 Security Event: ${eventType}`, details);
    }
    
    /**
     * Monitor for suspicious activity
     */
    detectSuspiciousActivity() {
        const recentEvents = this.securityEvents.filter(
            event => new Date() - new Date(event.timestamp) < 5 * 60 * 1000 // Last 5 minutes
        );
        
        // Check for rapid login attempts
        const loginAttempts = recentEvents.filter(event => 
            event.type === 'LOGIN_FAILED' || event.type === 'LOGIN_SUCCESS'
        );
        
        if (loginAttempts.length > 10) {
            this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
                type: 'RAPID_LOGIN_ATTEMPTS',
                count: loginAttempts.length
            });
            return true;
        }
        
        // Check for authorization failures
        const authFailures = recentEvents.filter(event => 
            event.type === 'AUTHORIZATION_DENIED'
        );
        
        if (authFailures.length > 5) {
            this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
                type: 'REPEATED_AUTH_FAILURES',
                count: authFailures.length
            });
            return true;
        }
        
        return false;
    }
    
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    
    /**
     * Generate CSRF token
     */
    generateCSRFToken() {
        this.csrfToken = this.generateSecureToken();
        
        // Add to all forms
        document.querySelectorAll('form').forEach(form => {
            let csrfInput = form.querySelector('input[name="csrf_token"]');
            if (!csrfInput) {
                csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf_token';
                form.appendChild(csrfInput);
            }
            csrfInput.value = this.csrfToken;
        });
    }
    
    /**
     * Generate secure random token
     */
    generateSecureToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * Simple encryption for client-side data
     */
    encryptData(data) {
        // Simple XOR encryption for demo (use proper encryption in production)
        const key = this.generateKey();
        let encrypted = '';
        for (let i = 0; i < data.length; i++) {
            encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(encrypted);
    }
    
    /**
     * Simple decryption for client-side data
     */
    decryptData(encryptedData) {
        const key = this.generateKey();
        const encrypted = atob(encryptedData);
        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
            decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return decrypted;
    }
    
    /**
     * Generate encryption key
     */
    generateKey() {
        return 'BuyMartV1SecureKey2024!'; // In production, use proper key management
    }
    
    /**
     * Rate limiting implementation
     */
    checkRateLimit(identifier) {
        const key = `rate_limit_${identifier}`;
        const attempts = JSON.parse(localStorage.getItem(key) || '[]');
        const now = Date.now();
        
        // Remove attempts older than 1 hour
        const recentAttempts = attempts.filter(timestamp => now - timestamp < 60 * 60 * 1000);
        
        if (recentAttempts.length >= this.maxLoginAttempts) {
            return false;
        }
        
        recentAttempts.push(now);
        localStorage.setItem(key, JSON.stringify(recentAttempts));
        
        return true;
    }
    
    /**
     * Track failed login attempts
     */
    trackFailedAttempt(email) {
        const key = `failed_attempts_${email}`;
        const attempts = JSON.parse(localStorage.getItem(key) || '[]');
        attempts.push(Date.now());
        localStorage.setItem(key, JSON.stringify(attempts));
    }
    
    /**
     * Clear failed attempts
     */
    clearFailedAttempts(email) {
        localStorage.removeItem(`failed_attempts_${email}`);
    }
    
    /**
     * Check if account is locked
     */
    isAccountLocked(email) {
        const key = `failed_attempts_${email}`;
        const attempts = JSON.parse(localStorage.getItem(key) || '[]');
        const now = Date.now();
        
        // Remove attempts older than lockout duration
        const recentAttempts = attempts.filter(timestamp => now - timestamp < this.lockoutDuration);
        
        return recentAttempts.length >= this.maxLoginAttempts;
    }
    
    /**
     * Setup security headers (for reference)
     */
    setupSecurityHeaders() {
        // These would typically be set on the server
        const securityHeaders = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        };
        
        console.log('🔒 Security headers configured:', securityHeaders);
    }
    
    // Placeholder methods for integration
    async performAuthentication(email, password) {
        // This would integrate with your actual authentication system
        return { success: false, user: null };
    }
    
    async getUserRoles(userId) {
        // This would fetch from your database
        return ['applicant'];
    }
    
    canAccessResource(action, resourceId, userId) {
        // This would check resource ownership/permissions
        return true;
    }
    
    getClientIP() {
        // This would get the actual client IP
        return 'unknown';
    }
    
    sendSecurityEventToServer(event) {
        // This would send to your logging service
        console.log('Security event logged:', event);
    }
    
    validatePhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }
    
    sanitizePhone(phone) {
        return phone.replace(/[^\d\+\-\(\)\s]/g, '');
    }
    
    sanitizeURL(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.toString();
        } catch {
            throw new Error('Invalid URL format');
        }
    }
    
    sanitizeFilename(filename) {
        return filename.replace(/[^a-zA-Z0-9\.\-_]/g, '');
    }
    
    validateLoginInput(email, password) {
        if (!email || !password) {
            return { isValid: false, error: 'Email and password are required' };
        }
        
        if (password.length < 8) {
            return { isValid: false, error: 'Password must be at least 8 characters' };
        }
        
        try {
            this.sanitizeEmail(email);
            return { isValid: true };
        } catch (error) {
            return { isValid: false, error: error.message };
        }
    }
    
    initializeSessionMonitoring() {
        // Monitor for session changes
        setInterval(() => {
            this.validateSession();
            this.detectSuspiciousActivity();
        }, 60000); // Check every minute
    }
    
    setupInputSanitization() {
        // Auto-sanitize form inputs
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName === 'FORM') {
                this.sanitizeFormInputs(form);
            }
        });
    }
    
    sanitizeFormInputs(form) {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (input.type !== 'password' && input.type !== 'hidden') {
                input.value = this.sanitizeInput(input.value, input.dataset.sanitize || 'text');
            }
        });
    }
    
    initializeRateLimiting() {
        // Set up rate limiting for API calls
        this.apiCallCounts = new Map();
        this.rateLimitWindow = 60000; // 1 minute
        this.maxApiCalls = 100; // per minute
    }
    
    clearSensitiveData() {
        // Clear any sensitive data from memory
        this.csrfToken = null;
        this.securityEvents = [];
    }
}

// Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
function initializeSecurityManager() {
    if (!window.securityManager) {
        window.securityManager = new SecurityManager();
        console.log('🔒 Security Manager initialized');
        console.log('🔒 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.securityManager)));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSecurityManager);
} else {
    // DOM is already loaded
    initializeSecurityManager();
}

// Expose manual initialization function for testing
window.initializeSecurityManager = initializeSecurityManager;
