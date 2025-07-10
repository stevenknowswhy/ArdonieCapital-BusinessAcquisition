/**
 * Dashboard Utilities Module
 * Utility functions for formatting, validation, and notifications
 * @author Ardonie Capital Development Team
 */

console.log('🔧 Loading Dashboard Utils Module...');

/**
 * Dashboard utility functions
 * Provides common functionality used across dashboard modules
 */
const DashboardUtils = {
    /**
     * Format currency values
     * @param {number} amount - The amount to format
     * @param {string} currency - Currency code (default: USD)
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currency = 'USD') {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return '$0';
        }
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Format large numbers with K/M suffixes
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     */
    formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) {
            return '0';
        }
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    /**
     * Format time ago from date
     * @param {Date} date - Date to format
     * @returns {string} Time ago string
     */
    formatTimeAgo(date) {
        if (!(date instanceof Date) || isNaN(date)) {
            return 'Unknown';
        }
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    },

    /**
     * Format time for display
     * @param {Date} date - Date to format
     * @returns {string} Formatted time string
     */
    formatTime(date) {
        if (!(date instanceof Date) || isNaN(date)) {
            return 'Unknown';
        }
        
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    /**
     * Format file size
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size string
     */
    formatFileSize(bytes) {
        if (typeof bytes !== 'number' || bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Calculate deal progress percentage
     * @param {string} status - Deal status
     * @returns {number} Progress percentage
     */
    calculateDealProgress(status) {
        const progressMap = {
            'initial_interest': 15,
            'due_diligence': 30,
            'negotiation': 50,
            'financing': 70,
            'legal_review': 85,
            'closing': 100
        };
        
        return progressMap[status] || 0;
    },

    /**
     * Auto-resize textarea element
     * @param {HTMLTextAreaElement} textarea - Textarea element to resize
     */
    autoResizeTextarea(textarea) {
        if (!textarea || textarea.tagName !== 'TEXTAREA') return;
        
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    },

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info, warning)
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        
        const typeClasses = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${typeClasses[type] || typeClasses.info}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remove after duration
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    },

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Sanitize HTML content
     * @param {string} html - HTML content to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} Unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Deep clone object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} True if element is in viewport
     */
    isInViewport(element) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Smooth scroll to element
     * @param {HTMLElement|string} target - Element or selector to scroll to
     * @param {number} offset - Offset from top (default: 0)
     */
    scrollToElement(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

// Extend BuyerDashboard prototype with utility methods
if (typeof window !== 'undefined' && window.BuyerDashboard) {
    Object.assign(window.BuyerDashboard.prototype, DashboardUtils);
    console.log('✅ Dashboard Utils methods added to BuyerDashboard prototype');
} else {
    console.warn('⚠️ BuyerDashboard not available, utils methods not added');
}

// Update loading status
if (window.dashboardLoadingStatus) {
    window.dashboardLoadingStatus.modulesLoaded.utils = true;
}

console.log('✅ Dashboard Utils Module loaded');

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardUtils };
}
