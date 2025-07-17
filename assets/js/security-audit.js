/**
 * Security Audit and Monitoring Service
 * Provides comprehensive security monitoring, threat detection, and audit logging
 */

class SecurityAuditService {
    constructor() {
        this.auditLog = [];
        this.securityMetrics = {
            loginAttempts: 0,
            failedLogins: 0,
            successfulLogins: 0,
            suspiciousActivities: 0,
            blockedRequests: 0,
            lastSecurityScan: null
        };
        this.threatDetection = {
            patterns: new Map(),
            thresholds: {
                rapidRequests: 50, // requests per minute
                failedLogins: 5, // per 15 minutes
                suspiciousPatterns: 3 // per hour
            }
        };
        this.init();
    }
    
    init() {
        this.startSecurityMonitoring();
        this.initializeThreatDetection();
        this.setupPerformanceMonitoring();
        console.log('🔍 Security Audit Service initialized');
    }
    
    // =============================================================================
    // AUDIT LOGGING
    // =============================================================================
    
    /**
     * Log security event with comprehensive details
     */
    logSecurityEvent(eventType, details = {}) {
        const auditEntry = {
            id: this.generateAuditId(),
            timestamp: new Date().toISOString(),
            eventType,
            severity: this.getEventSeverity(eventType),
            userId: this.getCurrentUserId(),
            sessionId: this.getCurrentSessionId(),
            ipAddress: this.getClientIP(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            details,
            fingerprint: this.generateFingerprint()
        };

        // Add to local audit log
        this.auditLog.push(auditEntry);

        // Keep only last 1000 entries locally
        if (this.auditLog.length > 1000) {
            this.auditLog = this.auditLog.slice(-1000);
        }

        // Send to server for persistent storage
        this.sendAuditToServer(auditEntry);

        // Check for security threats (only for non-threat events to prevent recursion)
        if (eventType !== 'THREAT_DETECTED') {
            this.analyzeThreatPatterns(auditEntry);
        }

        // Update metrics
        this.updateSecurityMetrics(eventType);

        console.log(`🔍 Security Event: ${eventType}`, auditEntry);
    }

    /**
     * Direct logging without threat analysis (prevents recursion)
     */
    directLogSecurityEvent(eventType, details = {}) {
        try {
            const auditEntry = {
                id: this.generateAuditId(),
                timestamp: new Date().toISOString(),
                eventType,
                severity: this.getEventSeverity(eventType),
                userId: this.getCurrentUserId(),
                sessionId: this.getCurrentSessionId(),
                ipAddress: this.getClientIP(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                details,
                fingerprint: this.generateFingerprint()
            };

            // Add to local audit log
            this.auditLog.push(auditEntry);

            // Keep only last 1000 entries locally
            if (this.auditLog.length > 1000) {
                this.auditLog = this.auditLog.slice(-1000);
            }

            // Send to server for persistent storage
            this.sendAuditToServer(auditEntry);

            // Update metrics
            this.updateSecurityMetrics(eventType);

            console.log(`🔍 Security Event (Direct): ${eventType}`, auditEntry);
        } catch (error) {
            console.error('Security Audit: Error in directLogSecurityEvent:', error);
            // Fallback: at least log the basic event
            this.auditLog.push({
                id: `fallback_${Date.now()}`,
                timestamp: new Date().toISOString(),
                eventType,
                severity: 'MEDIUM',
                userId: 'unknown',
                sessionId: null,
                ipAddress: 'unknown',
                userAgent: navigator.userAgent || 'unknown',
                url: window.location.href || 'unknown',
                details,
                fingerprint: 'error',
                error: error.message
            });
        }
    }
    
    /**
     * Get event severity level
     */
    getEventSeverity(eventType) {
        const severityMap = {
            // Critical events
            'ACCOUNT_COMPROMISED': 'CRITICAL',
            'UNAUTHORIZED_ACCESS': 'CRITICAL',
            'DATA_BREACH': 'CRITICAL',
            'MALICIOUS_ACTIVITY': 'CRITICAL',

            // High severity events
            'LOGIN_FAILED': 'HIGH',
            'ACCOUNT_LOCKED': 'HIGH',
            'PERMISSION_DENIED': 'HIGH',
            'SUSPICIOUS_ACTIVITY': 'HIGH',
            'RATE_LIMIT_EXCEEDED': 'HIGH',
            'THREAT_DETECTED': 'HIGH',
            'BEHAVIORAL_ANOMALY': 'HIGH',

            // Medium severity events
            'PASSWORD_CHANGE': 'MEDIUM',
            'PROFILE_UPDATE': 'MEDIUM',
            'ADMIN_ACTION': 'MEDIUM',
            'DATA_EXPORT': 'MEDIUM',
            'JOB_MANAGEMENT_CREATE': 'MEDIUM',
            'JOB_MANAGEMENT_UPDATE': 'MEDIUM',
            'JOB_MANAGEMENT_DELETE': 'MEDIUM',

            // Low severity events
            'LOGIN_SUCCESS': 'LOW',
            'LOGOUT': 'LOW',
            'PAGE_VIEW': 'LOW',
            'FORM_SUBMISSION': 'LOW',
            'TEST_EVENT': 'LOW',
            'PERFORMANCE_ANOMALY': 'LOW'
        };

        return severityMap[eventType] || 'MEDIUM';
    }
    
    /**
     * Generate unique audit ID
     */
    generateAuditId() {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Generate browser fingerprint for tracking
     */
    generateFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Security fingerprint', 2, 2);
        
        const fingerprint = {
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            canvas: canvas.toDataURL().slice(-50), // Last 50 chars
            plugins: Array.from(navigator.plugins).map(p => p.name).join(',').slice(0, 100)
        };
        
        return btoa(JSON.stringify(fingerprint)).slice(0, 32);
    }
    
    // =============================================================================
    // THREAT DETECTION & ANALYSIS
    // =============================================================================
    
    /**
     * Initialize threat detection patterns
     */
    initializeThreatDetection() {
        // Common attack patterns
        this.threatPatterns = [
            {
                name: 'SQL_INJECTION',
                pattern: /('|(\\')|(;)|(\\;)|(union)|(select)|(insert)|(delete)|(update)|(drop)|(create)|(alter)|(exec)|(execute)|(script)|(javascript))/i,
                severity: 'CRITICAL'
            },
            {
                name: 'XSS_ATTEMPT',
                pattern: /(<script|javascript:|on\w+\s*=|<iframe|<object|<embed)/i,
                severity: 'HIGH'
            },
            {
                name: 'PATH_TRAVERSAL',
                pattern: /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i,
                severity: 'HIGH'
            },
            {
                name: 'COMMAND_INJECTION',
                pattern: /(\||&|;|`|\$\(|\${|<|>)/,
                severity: 'CRITICAL'
            },
            {
                name: 'SUSPICIOUS_USER_AGENT',
                pattern: /(bot|crawler|spider|scraper|scanner|curl|wget|python|perl|php)/i,
                severity: 'MEDIUM'
            }
        ];
    }
    
    /**
     * Analyze patterns for potential threats
     */
    analyzeThreatPatterns(auditEntry) {
        // Prevent recursion by checking if this is already a threat detection event
        if (auditEntry.eventType === 'THREAT_DETECTED' || auditEntry.eventType === 'BEHAVIORAL_ANOMALY') {
            return; // Skip analysis for threat detection events to prevent recursion
        }

        const { details, userAgent, url } = auditEntry;

        // Safely stringify details to avoid circular references
        let inputData = '';
        try {
            inputData = typeof details === 'string' ? details : JSON.stringify(details, null, 0);
        } catch (error) {
            inputData = String(details);
        }

        for (const pattern of this.threatPatterns) {
            try {
                if (pattern.pattern.test(inputData) || pattern.pattern.test(userAgent) || pattern.pattern.test(url)) {
                    this.handleThreatDetection(pattern, auditEntry);
                }
            } catch (error) {
                console.warn('Threat pattern analysis error:', error);
            }
        }

        // Check for behavioral anomalies (only for non-threat events)
        if (auditEntry.eventType !== 'THREAT_DETECTED') {
            this.checkBehavioralAnomalies(auditEntry);
        }

        // Check rate limiting violations
        this.checkRateLimitViolations(auditEntry);
    }
    
    /**
     * Handle detected threats
     */
    handleThreatDetection(pattern, auditEntry) {
        const threatEvent = {
            threatType: pattern.name,
            severity: pattern.severity,
            originalEvent: {
                timestamp: auditEntry.timestamp,
                userId: auditEntry.userId,
                ipAddress: auditEntry.ipAddress
            }, // Simplified to prevent circular reference
            timestamp: new Date().toISOString(),
            blocked: this.shouldBlockRequest(pattern.severity)
        };

        // Log threat detection directly to avoid recursion
        this.directLogSecurityEvent('THREAT_DETECTED', threatEvent);

        // Take protective action
        if (threatEvent.blocked) {
            this.blockSuspiciousActivity(auditEntry);
        }

        // Alert administrators for high/critical threats
        if (['HIGH', 'CRITICAL'].includes(pattern.severity)) {
            this.alertAdministrators(threatEvent);
        }
    }
    
    /**
     * Check for behavioral anomalies
     */
    checkBehavioralAnomalies(auditEntry) {
        // Prevent recursion by checking event type
        if (auditEntry.eventType === 'BEHAVIORAL_ANOMALY' || auditEntry.eventType === 'THREAT_DETECTED') {
            return;
        }

        const userId = auditEntry.userId;
        const recentEvents = this.getRecentEvents(userId, 5 * 60 * 1000); // Last 5 minutes

        // Check for rapid successive actions
        if (recentEvents.length > this.threatDetection.thresholds.rapidRequests) {
            this.directLogSecurityEvent('BEHAVIORAL_ANOMALY', {
                type: 'RAPID_REQUESTS',
                count: recentEvents.length,
                timeWindow: '5 minutes'
            });
        }

        // Check for unusual access patterns
        const uniqueIPs = new Set(recentEvents.map(e => e.ipAddress));
        if (uniqueIPs.size > 3) {
            this.directLogSecurityEvent('BEHAVIORAL_ANOMALY', {
                type: 'MULTIPLE_IPS',
                ipCount: uniqueIPs.size,
                ips: Array.from(uniqueIPs)
            });
        }

        // Check for failed login patterns
        const failedLogins = recentEvents.filter(e => e.eventType === 'LOGIN_FAILED');
        if (failedLogins.length >= this.threatDetection.thresholds.failedLogins) {
            this.directLogSecurityEvent('BEHAVIORAL_ANOMALY', {
                type: 'REPEATED_LOGIN_FAILURES',
                count: failedLogins.length
            });
        }
    }
    
    /**
     * Check rate limiting violations
     */
    checkRateLimitViolations(auditEntry) {
        const identifier = auditEntry.ipAddress || auditEntry.userId;
        const recentRequests = this.getRecentEventsByIdentifier(identifier, 60 * 1000); // Last minute

        if (recentRequests.length > this.threatDetection.thresholds.rapidRequests) {
            // Use directLogSecurityEvent to prevent recursion
            this.directLogSecurityEvent('RATE_LIMIT_EXCEEDED', {
                identifier,
                requestCount: recentRequests.length,
                timeWindow: '1 minute'
            });

            return true;
        }

        return false;
    }
    
    // =============================================================================
    // SECURITY MONITORING
    // =============================================================================
    
    /**
     * Start continuous security monitoring
     */
    startSecurityMonitoring() {
        // Monitor every 30 seconds
        setInterval(() => {
            this.performSecurityScan();
        }, 30000);
        
        // Generate security report every hour
        setInterval(() => {
            this.generateSecurityReport();
        }, 60 * 60 * 1000);
    }
    
    /**
     * Perform comprehensive security scan
     */
    performSecurityScan() {
        const scanResults = {
            timestamp: new Date().toISOString(),
            checks: []
        };
        
        // Check session integrity
        scanResults.checks.push(this.checkSessionIntegrity());
        
        // Check for suspicious patterns
        scanResults.checks.push(this.checkSuspiciousPatterns());
        
        // Check system resources
        scanResults.checks.push(this.checkSystemResources());
        
        // Check data integrity
        scanResults.checks.push(this.checkDataIntegrity());
        
        this.securityMetrics.lastSecurityScan = scanResults;
        
        // Log scan results (use directLogSecurityEvent to prevent potential recursion)
        this.directLogSecurityEvent('SECURITY_SCAN', scanResults);
    }
    
    /**
     * Check session integrity
     */
    checkSessionIntegrity() {
        const session = window.securityManager?.validateSession();
        
        return {
            check: 'SESSION_INTEGRITY',
            status: session ? 'PASS' : 'FAIL',
            details: {
                hasValidSession: !!session,
                sessionExpiry: session?.expiresAt,
                csrfTokenValid: session?.csrfToken === window.securityManager?.csrfToken
            }
        };
    }
    
    /**
     * Check for suspicious patterns in recent events
     */
    checkSuspiciousPatterns() {
        const recentEvents = this.getRecentEvents(null, 10 * 60 * 1000); // Last 10 minutes
        const suspiciousCount = recentEvents.filter(e => 
            e.severity === 'HIGH' || e.severity === 'CRITICAL'
        ).length;
        
        return {
            check: 'SUSPICIOUS_PATTERNS',
            status: suspiciousCount < 5 ? 'PASS' : 'WARN',
            details: {
                suspiciousEventCount: suspiciousCount,
                totalEvents: recentEvents.length
            }
        };
    }
    
    /**
     * Check system resources and performance
     */
    checkSystemResources() {
        const memoryUsage = performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
        } : null;
        
        return {
            check: 'SYSTEM_RESOURCES',
            status: 'PASS',
            details: {
                memoryUsage,
                connectionType: navigator.connection?.effectiveType,
                onLine: navigator.onLine
            }
        };
    }
    
    /**
     * Check data integrity
     */
    checkDataIntegrity() {
        // Basic integrity checks
        const localStorageSize = JSON.stringify(localStorage).length;
        const sessionStorageSize = JSON.stringify(sessionStorage).length;
        
        return {
            check: 'DATA_INTEGRITY',
            status: 'PASS',
            details: {
                localStorageSize,
                sessionStorageSize,
                auditLogSize: this.auditLog.length
            }
        };
    }
    
    // =============================================================================
    // UTILITY METHODS
    // =============================================================================
    
    /**
     * Get recent events for analysis
     */
    getRecentEvents(userId = null, timeWindow = 60000) {
        const cutoff = Date.now() - timeWindow;
        
        return this.auditLog.filter(event => {
            const eventTime = new Date(event.timestamp).getTime();
            const isRecent = eventTime > cutoff;
            const matchesUser = !userId || event.userId === userId;
            
            return isRecent && matchesUser;
        });
    }
    
    /**
     * Get recent events by identifier (IP or user)
     */
    getRecentEventsByIdentifier(identifier, timeWindow = 60000) {
        const cutoff = Date.now() - timeWindow;
        
        return this.auditLog.filter(event => {
            const eventTime = new Date(event.timestamp).getTime();
            const isRecent = eventTime > cutoff;
            const matchesIdentifier = event.ipAddress === identifier || event.userId === identifier;
            
            return isRecent && matchesIdentifier;
        });
    }
    
    /**
     * Update security metrics
     */
    updateSecurityMetrics(eventType) {
        switch (eventType) {
            case 'LOGIN_SUCCESS':
                this.securityMetrics.loginAttempts++;
                this.securityMetrics.successfulLogins++;
                break;
            case 'LOGIN_FAILED':
                this.securityMetrics.loginAttempts++;
                this.securityMetrics.failedLogins++;
                break;
            case 'SUSPICIOUS_ACTIVITY':
                this.securityMetrics.suspiciousActivities++;
                break;
            case 'RATE_LIMIT_EXCEEDED':
                this.securityMetrics.blockedRequests++;
                break;
        }
    }
    
    /**
     * Generate comprehensive security report
     */
    generateSecurityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            period: '1 hour',
            metrics: { ...this.securityMetrics },
            recentEvents: this.getRecentEvents(null, 60 * 60 * 1000), // Last hour
            threatSummary: this.generateThreatSummary(),
            recommendations: this.generateSecurityRecommendations()
        };
        
        // Use directLogSecurityEvent to prevent potential recursion
        this.directLogSecurityEvent('SECURITY_REPORT', report);
        
        return report;
    }
    
    /**
     * Generate threat summary
     */
    generateThreatSummary() {
        const recentEvents = this.getRecentEvents(null, 60 * 60 * 1000);
        const threats = recentEvents.filter(e => e.eventType === 'THREAT_DETECTED');
        
        const threatTypes = {};
        threats.forEach(threat => {
            const type = threat.details?.threatType || 'UNKNOWN';
            threatTypes[type] = (threatTypes[type] || 0) + 1;
        });
        
        return {
            totalThreats: threats.length,
            threatTypes,
            highSeverityThreats: threats.filter(t => ['HIGH', 'CRITICAL'].includes(t.severity)).length
        };
    }
    
    /**
     * Generate security recommendations
     */
    generateSecurityRecommendations() {
        const recommendations = [];
        
        if (this.securityMetrics.failedLogins > 10) {
            recommendations.push('Consider implementing additional rate limiting for login attempts');
        }
        
        if (this.securityMetrics.suspiciousActivities > 5) {
            recommendations.push('Review recent suspicious activities and consider blocking problematic IPs');
        }
        
        if (!this.securityMetrics.lastSecurityScan) {
            recommendations.push('Perform a comprehensive security scan');
        }
        
        return recommendations;
    }
    
    // Placeholder methods for integration
    getCurrentUserId() {
        try {
            return window.securityManager?.validateSession()?.userId || 'anonymous';
        } catch (error) {
            console.warn('Security Audit: Error getting user ID:', error.message);
            return 'anonymous';
        }
    }

    getCurrentSessionId() {
        try {
            return window.securityManager?.validateSession()?.sessionId || null;
        } catch (error) {
            console.warn('Security Audit: Error getting session ID:', error.message);
            return null;
        }
    }

    getClientIP() {
        // This would be provided by the server
        return 'unknown';
    }
    
    sendAuditToServer(auditEntry) {
        // Send to server for persistent storage
        console.log('Audit entry sent to server:', auditEntry);
    }
    
    shouldBlockRequest(severity) {
        return ['CRITICAL', 'HIGH'].includes(severity);
    }
    
    blockSuspiciousActivity(auditEntry) {
        console.warn('Blocking suspicious activity:', auditEntry);
        // Implement blocking logic
    }
    
    alertAdministrators(threatEvent) {
        console.error('Security threat detected - alerting administrators:', threatEvent);
        // Send alerts to administrators
    }
    
    setupPerformanceMonitoring() {
        // Monitor performance metrics that could indicate security issues
        if ('performance' in window) {
            setInterval(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation && navigation.loadEventEnd - navigation.loadEventStart > 10000) {
                    // Use directLogSecurityEvent to prevent potential recursion
                    this.directLogSecurityEvent('PERFORMANCE_ANOMALY', {
                        type: 'SLOW_PAGE_LOAD',
                        loadTime: navigation.loadEventEnd - navigation.loadEventStart
                    });
                }
            }, 30000);
        }
    }
}

// Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
function initializeSecurityAuditService() {
    if (!window.securityAuditService) {
        window.securityAuditService = new SecurityAuditService();
        console.log('🔍 Security Audit Service initialized');
        console.log('🔍 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.securityAuditService)));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSecurityAuditService);
} else {
    // DOM is already loaded
    initializeSecurityAuditService();
}

// Expose manual initialization function for testing
window.initializeSecurityAuditService = initializeSecurityAuditService;
