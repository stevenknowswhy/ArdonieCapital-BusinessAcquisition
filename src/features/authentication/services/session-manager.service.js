
// GDPR Compliance utilities
const GDPRCompliance = {
    requestConsent: (purpose) => {
        return new Promise((resolve) => {
            // Implementation for consent request
            const consent = confirm(`Do you consent to data processing for ${purpose}?`);
            resolve(consent);
        });
    },
    
    deleteUserData: (userId) => {
        // Implementation for right to erasure
        console.log(`Deleting data for user ${userId}`);
    },
    
    exportUserData: (userId) => {
        // Implementation for data portability
        console.log(`Exporting data for user ${userId}`);
    }
};

/**
 * Session Manager Service
 * Handles user session management, timeouts, and security
 */

export class SessionManagerService {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.warningTime = 5 * 60 * 1000; // 5 minutes before timeout
        this.checkInterval = 60 * 1000; // Check every minute
        this.sessionKey = 'ardonie_session';
        this.lastActivityKey = 'ardonie_last_activity';
        
        this.timeoutWarningCallback = null;
        this.sessionExpiredCallback = null;
        this.sessionTimer = null;
        this.warningTimer = null;
        
        this.setupSessionMonitoring();
    }

    /**
     * Start a new user session
     * @param {Object} userData - User data to store in session
     * @param {boolean} rememberMe - Whether to extend session duration
     */
    startSession(userData, rememberMe = false) {
        const sessionData = {
            user: userData,
            startTime: Date.now(),
            lastActivity: Date.now(),
            rememberMe: rememberMe,
            sessionId: this.generateSessionId(),
            expiresAt: Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : this.sessionTimeout)
        };

        this.storeSessionData(sessionData);
        this.updateLastActivity();
        this.startSessionTimers();
        
        console.log('Session started for user:', userData.email);
    }

    /**
     * End the current session
     */
    endSession() {
        this.clearSessionData();
        this.clearTimers();
        
        if (this.sessionExpiredCallback) {
            this.sessionExpiredCallback();
        }
        
        console.log('Session ended');
    }

    /**
     * Check if user has an active session
     * @returns {boolean} True if session is active
     */
    isSessionActive() {
        const sessionData = this.getSessionData();
        
        if (!sessionData) {
            return false;
        }
        
        // Check if session has expired
        if (Date.now() > sessionData.expiresAt) {
            this.endSession();
            return false;
        }
        
        // Check if session has been inactive too long (for non-remember-me sessions)
        if (!sessionData.rememberMe) {
            const timeSinceActivity = Date.now() - sessionData.lastActivity;
            if (timeSinceActivity > this.sessionTimeout) {
                this.endSession();
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get current session data
     * @returns {Object|null} Session data or null if no active session
     */
    getSessionData() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.error('Failed to retrieve session data:', error);
            return null;
        }
    }

    /**
     * Get current user data from session
     * @returns {Object|null} User data or null if no active session
     */
    getCurrentUser() {
        const sessionData = this.getSessionData();
        return sessionData ? sessionData.user : null;
    }

    /**
     * Update last activity timestamp
     */
    updateLastActivity() {
        const sessionData = this.getSessionData();
        
        if (sessionData) {
            sessionData.lastActivity = Date.now();
            this.storeSessionData(sessionData);
        }
        
        localStorage.setItem(this.lastActivityKey, Date.now().toString());
    }

    /**
     * Extend session duration
     * @param {number} additionalTime - Additional time in milliseconds
     */
    extendSession(additionalTime = this.sessionTimeout) {
        const sessionData = this.getSessionData();
        
        if (sessionData) {
            sessionData.expiresAt = Math.max(sessionData.expiresAt, Date.now() + additionalTime);
            this.storeSessionData(sessionData);
            this.startSessionTimers(); // Restart timers with new expiration
        }
    }

    /**
     * Set up session monitoring and activity tracking
     */
    setupSessionMonitoring() {
        // Skip setup when document is not available
        if (typeof document === 'undefined') {
            return;
        }

        // Track user activity
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        activityEvents.forEach(event => {
            document.addEventListener(event, this.throttle(() => {
                if (this.isSessionActive()) {
                    this.updateLastActivity();
                }
            }, 30000), true); // Throttle to once per 30 seconds
        });

        // Check session status periodically
        setInterval(() => {
            this.checkSessionStatus();
        }, this.checkInterval);

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isSessionActive()) {
                this.updateLastActivity();
            }
        });
    }

    /**
     * Start session timeout timers
     */
    startSessionTimers() {
        this.clearTimers();
        
        const sessionData = this.getSessionData();
        if (!sessionData) return;
        
        const timeUntilExpiry = sessionData.expiresAt - Date.now();
        const timeUntilWarning = timeUntilExpiry - this.warningTime;
        
        // Set warning timer
        if (timeUntilWarning > 0) {
            this.warningTimer = setTimeout(() => {
                if (this.timeoutWarningCallback) {
                    this.timeoutWarningCallback(this.warningTime / 1000 / 60); // Minutes until expiry
                }
            }, timeUntilWarning);
        }
        
        // Set session expiry timer
        if (timeUntilExpiry > 0) {
            this.sessionTimer = setTimeout(() => {
                this.endSession();
            }, timeUntilExpiry);
        }
    }

    /**
     * Clear all session timers
     */
    clearTimers() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
            this.warningTimer = null;
        }
    }

    /**
     * Check session status and handle expiry
     */
    checkSessionStatus() {
        if (!this.isSessionActive()) {
            this.clearTimers();
        }
    }

    /**
     * Store session data securely
     * @param {Object} sessionData - Session data to store
     */
    storeSessionData(sessionData) {
        try {
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        } catch (error) {
            console.error('Failed to store session data:', error);
        }
    }

    /**
     * Clear all session data
     */
    clearSessionData() {
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.lastActivityKey);
    }

    /**
     * Generate unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Set callback for session timeout warning
     * @param {Function} callback - Callback function
     */
    onTimeoutWarning(callback) {
        this.timeoutWarningCallback = callback;
    }

    /**
     * Set callback for session expiry
     * @param {Function} callback - Callback function
     */
    onSessionExpired(callback) {
        this.sessionExpiredCallback = callback;
    }

    /**
     * Get time remaining in current session
     * @returns {number} Time remaining in milliseconds
     */
    getTimeRemaining() {
        const sessionData = this.getSessionData();
        
        if (!sessionData) {
            return 0;
        }
        
        return Math.max(0, sessionData.expiresAt - Date.now());
    }

    /**
     * Get session statistics
     * @returns {Object} Session statistics
     */
    getSessionStats() {
        const sessionData = this.getSessionData();
        
        if (!sessionData) {
            return null;
        }
        
        return {
            sessionId: sessionData.sessionId,
            startTime: new Date(sessionData.startTime),
            lastActivity: new Date(sessionData.lastActivity),
            expiresAt: new Date(sessionData.expiresAt),
            timeRemaining: this.getTimeRemaining(),
            rememberMe: sessionData.rememberMe,
            isActive: this.isSessionActive()
        };
    }

    /**
     * Throttle function to limit execution frequency
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Export singleton instance
export const sessionManager = new SessionManagerService();
