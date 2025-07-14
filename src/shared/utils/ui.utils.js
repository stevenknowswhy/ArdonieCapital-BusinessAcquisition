
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
 * UI Utilities
 * Common UI functions for loading states, toasts, modals, and interactions
 */

export class UIUtils {
    constructor() {
        this.toastContainer = null;
        this.modalContainer = null;
        this.loadingElements = new Set();
        this.activeModals = new Set();
        this.scrollPosition = 0;
    }

    /**
     * Show loading state on element
     * @param {HTMLElement|string} element - Element or selector
     * @param {Object} options - Loading options
     */
    showLoading(element, options = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;

        const config = {
            text: 'Loading...',
            spinner: true,
            overlay: false,
            disableElement: true,
            ...options
        };

        // Store original state
        const originalState = {
            disabled: el.disabled,
            innerHTML: el.innerHTML,
            classList: [...el.classList]
        };
        el._originalState = originalState;

        // Add loading class
        el.classList.add('loading');
        this.loadingElements.add(el);

        // Show element
        el.style.display = 'block';

        // Disable element if requested
        if (config.disableElement) {
            el.disabled = true;
        }

        // Add spinner and text
        if (config.spinner || config.text) {
            const loadingContent = this.createLoadingContent(config);
            if (el.tagName === 'BUTTON') {
                el.innerHTML = loadingContent;
            } else {
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'loading-overlay';
                loadingDiv.innerHTML = loadingContent;
                el.style.position = 'relative';
                el.appendChild(loadingDiv);
            }
        }

        // Add overlay if requested
        if (config.overlay) {
            this.addLoadingOverlay(el);
        }
    }

    /**
     * Hide loading state from element
     * @param {HTMLElement|string} element - Element or selector
     */
    hideLoading(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el || !this.loadingElements.has(el)) return;

        // Restore original state
        if (el._originalState) {
            el.disabled = el._originalState.disabled;
            el.innerHTML = el._originalState.innerHTML;
            el.className = el._originalState.classList.join(' ');
            delete el._originalState;
        }

        // Hide element
        el.style.display = 'none';

        // Remove loading overlay
        const overlay = el.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }

        // Remove from tracking
        this.loadingElements.delete(el);
    }

    /**
     * Create loading content HTML
     * @param {Object} config - Loading configuration
     * @returns {string} Loading HTML
     */
    createLoadingContent(config) {
        let html = '';

        if (config.spinner) {
            html += `
                <svg class="animate-spin h-4 w-4 inline-block mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            `;
        }

        if (config.text) {
            html += `<span>${config.text}</span>`;
        }

        return html;
    }

    /**
     * Add loading overlay to element
     * @param {HTMLElement} element - Target element
     */
    addLoadingOverlay(element) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10';
        overlay.innerHTML = this.createLoadingContent({ spinner: true, text: 'Loading...' });
        element.appendChild(overlay);
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     * @param {Object} options - Additional options
     */
    showToast(message, type = 'info', duration = 3000, options = {}) {
        if (!this.toastContainer) {
            this.createToastContainer();
        }

        const toast = this.createToastElement(message, type, options);
        this.toastContainer.appendChild(toast);

        // Animate in
        const animateIn = () => {
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
        };

        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(animateIn);
        } else {
            // Fallback for Node.js environment
            setTimeout(animateIn, 0);
        }

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        // Manual close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.removeToast(toast));
        }

        return toast;
    }

    /**
     * Create toast container
     */
    createToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
        this.toastContainer.id = 'toast-container';
        document.body.appendChild(this.toastContainer);
    }

    /**
     * Create toast element
     * @param {string} message - Toast message
     * @param {string} type - Toast type
     * @param {Object} options - Toast options
     * @returns {HTMLElement} Toast element
     */
    createToastElement(message, type, options) {
        const toast = document.createElement('div');
        const typeClasses = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };

        toast.className = `
            ${typeClasses[type] || typeClasses.info}
            px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full
            flex items-center justify-between min-w-80 max-w-md
        `.trim();

        const icon = this.getToastIcon(type);
        
        toast.innerHTML = `
            <div class="flex items-center">
                ${icon}
                <span class="ml-2">${message}</span>
            </div>
            ${options.closable !== false ? '<button class="toast-close ml-4 text-lg font-bold">&times;</button>' : ''}
        `;

        return toast;
    }

    /**
     * Get toast icon based on type
     * @param {string} type - Toast type
     * @returns {string} Icon HTML
     */
    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return `<span class="text-lg">${icons[type] || icons.info}</span>`;
    }

    /**
     * Remove toast
     * @param {HTMLElement} toast - Toast element
     */
    removeToast(toast) {
        toast.classList.remove('translate-x-0');
        toast.classList.add('translate-x-full');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Smooth scroll to element
     * @param {string|HTMLElement} target - Target element or selector
     * @param {number} offset - Offset from top
     * @param {number} duration - Animation duration
     */
    scrollToElement(target, offset = 0, duration = 500) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        const startPosition = window.pageYOffset;
        const distance = offsetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    }

    /**
     * Easing function for smooth scrolling
     * @param {number} t - Current time
     * @param {number} b - Start value
     * @param {number} c - Change in value
     * @param {number} d - Duration
     * @returns {number} Eased value
     */
    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @param {Object} options - Copy options
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text, options = {}) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }

            if (options.showToast !== false) {
                this.showToast('Copied to clipboard!', 'success', 2000);
            }

            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            
            if (options.showToast !== false) {
                this.showToast('Failed to copy to clipboard', 'error', 3000);
            }
            
            return false;
        }
    }

    /**
     * Show/hide element with animation
     * @param {HTMLElement|string} element - Element or selector
     * @param {boolean} show - Whether to show or hide
     * @param {string} animation - Animation type
     */
    toggleElement(element, show, animation = 'fade') {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;

        if (animation === 'fade') {
            if (show) {
                el.classList.remove('hidden');
                el.style.opacity = '0';
                requestAnimationFrame(() => {
                    el.style.transition = 'opacity 0.3s ease';
                    el.style.opacity = '1';
                });
            } else {
                el.style.transition = 'opacity 0.3s ease';
                el.style.opacity = '0';
                setTimeout(() => {
                    el.classList.add('hidden');
                }, 300);
            }
        } else if (animation === 'slide') {
            if (show) {
                el.classList.remove('hidden');
                el.style.maxHeight = '0';
                el.style.overflow = 'hidden';
                requestAnimationFrame(() => {
                    el.style.transition = 'max-height 0.3s ease';
                    el.style.maxHeight = el.scrollHeight + 'px';
                });
            } else {
                el.style.transition = 'max-height 0.3s ease';
                el.style.maxHeight = '0';
                setTimeout(() => {
                    el.classList.add('hidden');
                }, 300);
            }
        } else {
            // No animation
            el.classList.toggle('hidden', !show);
        }
    }

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
    }

    /**
     * Throttle function calls
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

    /**
     * Add ripple effect to element
     * @param {HTMLElement} element - Target element
     * @param {Event} event - Click event
     */
    addRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Initialize tooltips for elements with data-tooltip attribute
     */
    initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => this.showTooltip(e));
            element.addEventListener('mouseleave', () => this.hideTooltip());
        });
    }

    /**
     * Show tooltip
     * @param {Event} event - Mouse event
     */
    showTooltip(event) {
        const element = event.target;
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;

        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.className = 'absolute z-50 px-2 py-1 text-sm text-white bg-slate-900 rounded shadow-lg pointer-events-none';
        tooltip.textContent = tooltipText;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
}

// Export singleton instance
export const uiUtils = new UIUtils();

// Export individual functions for backward compatibility
export const showLoading = (element, options) => uiUtils.showLoading(element, options);
export const hideLoading = (element) => uiUtils.hideLoading(element);
export const showToast = (message, type, duration, options) => uiUtils.showToast(message, type, duration, options);
export const scrollToElement = (target, offset, duration) => uiUtils.scrollToElement(target, offset, duration);
export const copyToClipboard = (text, options) => uiUtils.copyToClipboard(text, options);
export const debounce = (func, wait) => uiUtils.debounce(func, wait);
export const throttle = (func, limit) => uiUtils.throttle(func, limit);
