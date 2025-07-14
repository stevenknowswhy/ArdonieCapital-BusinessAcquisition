/**
 * Profile Error Handler
 * Centralized error handling and user feedback for profile operations
 */

export class ProfileErrorHandler {
    constructor() {
        this.errorMessages = {
            // Network errors
            'NetworkError': 'Network connection failed. Please check your internet connection.',
            'TimeoutError': 'Request timed out. Please try again.',
            
            // Authentication errors
            'AuthenticationError': 'Authentication failed. Please log in again.',
            'UnauthorizedError': 'You are not authorized to perform this action.',
            'SessionExpiredError': 'Your session has expired. Please log in again.',
            
            // Validation errors
            'ValidationError': 'Please check your input and try again.',
            'InvalidEmailError': 'Please enter a valid email address.',
            'InvalidPasswordError': 'Password must be at least 6 characters long.',
            'PasswordMismatchError': 'Passwords do not match.',
            
            // File upload errors
            'FileSizeError': 'File size is too large. Maximum size is 5MB.',
            'FileTypeError': 'File type not supported. Please use JPEG, PNG, GIF, or WebP.',
            'UploadError': 'Failed to upload file. Please try again.',
            
            // Database errors
            'DatabaseError': 'Database operation failed. Please try again.',
            'ProfileNotFoundError': 'Profile not found.',
            'UpdateFailedError': 'Failed to update profile. Please try again.',
            
            // Generic errors
            'UnknownError': 'An unexpected error occurred. Please try again.',
            'ServerError': 'Server error. Please try again later.',
            'MaintenanceError': 'System is under maintenance. Please try again later.'
        };

        this.retryableErrors = [
            'NetworkError',
            'TimeoutError',
            'ServerError',
            'DatabaseError'
        ];

        this.logLevel = 'error'; // 'debug', 'info', 'warn', 'error'
    }

    /**
     * Handle error with appropriate user feedback
     * @param {Error|string} error - Error to handle
     * @param {Object} options - Handling options
     * @returns {Object} Error handling result
     */
    handleError(error, options = {}) {
        const {
            showToast = true,
            logError = true,
            retryable = false,
            context = 'profile'
        } = options;

        // Normalize error
        const normalizedError = this.normalizeError(error);
        
        // Log error
        if (logError) {
            this.logError(normalizedError, context);
        }

        // Get user-friendly message
        const userMessage = this.getUserMessage(normalizedError);

        // Show toast notification
        if (showToast) {
            this.showErrorToast(userMessage, {
                retryable: retryable || this.isRetryable(normalizedError.type)
            });
        }

        return {
            type: normalizedError.type,
            message: userMessage,
            originalError: error,
            retryable: this.isRetryable(normalizedError.type),
            handled: true
        };
    }

    /**
     * Handle validation errors specifically
     * @param {Object} validationResult - Validation result from validator
     * @param {HTMLElement} form - Form element to show errors on
     */
    handleValidationErrors(validationResult, form = null) {
        if (validationResult.isValid) return;

        // Show field-specific errors
        if (validationResult.fieldErrors && form) {
            this.showFieldErrors(validationResult.fieldErrors, form);
        }

        // Show general validation toast
        const firstError = validationResult.errors[0];
        this.showErrorToast(firstError);

        return {
            type: 'ValidationError',
            message: firstError,
            fieldErrors: validationResult.fieldErrors,
            handled: true
        };
    }

    /**
     * Handle async operation with loading states and error handling
     * @param {Function} operation - Async operation to execute
     * @param {Object} options - Operation options
     * @returns {Promise<Object>} Operation result
     */
    async handleAsyncOperation(operation, options = {}) {
        const {
            loadingElement = null,
            successMessage = null,
            errorContext = 'operation',
            retryable = true,
            maxRetries = 3
        } = options;

        let attempts = 0;
        
        while (attempts < maxRetries) {
            try {
                // Show loading state
                if (loadingElement) {
                    this.setLoadingState(loadingElement, true);
                }

                // Execute operation
                const result = await operation();

                // Hide loading state
                if (loadingElement) {
                    this.setLoadingState(loadingElement, false);
                }

                // Show success message
                if (successMessage && result.success) {
                    this.showSuccessToast(successMessage);
                }

                return result;

            } catch (error) {
                attempts++;
                
                // Hide loading state
                if (loadingElement) {
                    this.setLoadingState(loadingElement, false);
                }

                // Handle error
                const errorResult = this.handleError(error, {
                    context: errorContext,
                    retryable: retryable && attempts < maxRetries
                });

                // If not retryable or max attempts reached, return error
                if (!errorResult.retryable || attempts >= maxRetries) {
                    return {
                        success: false,
                        error: errorResult.message,
                        type: errorResult.type
                    };
                }

                // Wait before retry
                await this.delay(1000 * attempts);
            }
        }
    }

    /**
     * Normalize error to consistent format
     * @param {Error|string} error - Error to normalize
     * @returns {Object} Normalized error
     */
    normalizeError(error) {
        if (typeof error === 'string') {
            return {
                type: 'UnknownError',
                message: error,
                stack: null
            };
        }

        if (error instanceof Error) {
            // Determine error type based on error properties
            let type = 'UnknownError';
            
            if (error.name === 'NetworkError' || error.message.includes('network')) {
                type = 'NetworkError';
            } else if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
                type = 'TimeoutError';
            } else if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
                type = 'AuthenticationError';
            } else if (error.message.includes('validation')) {
                type = 'ValidationError';
            } else if (error.message.includes('file size')) {
                type = 'FileSizeError';
            } else if (error.message.includes('file type')) {
                type = 'FileTypeError';
            } else if (error.message.includes('upload')) {
                type = 'UploadError';
            } else if (error.message.includes('database')) {
                type = 'DatabaseError';
            } else if (error.message.includes('server') || error.status >= 500) {
                type = 'ServerError';
            }

            return {
                type,
                message: error.message,
                stack: error.stack,
                status: error.status
            };
        }

        return {
            type: 'UnknownError',
            message: 'An unknown error occurred',
            stack: null
        };
    }

    /**
     * Get user-friendly error message
     * @param {Object} normalizedError - Normalized error
     * @returns {string} User-friendly message
     */
    getUserMessage(normalizedError) {
        return this.errorMessages[normalizedError.type] || 
               normalizedError.message || 
               this.errorMessages.UnknownError;
    }

    /**
     * Check if error is retryable
     * @param {string} errorType - Error type
     * @returns {boolean} Whether error is retryable
     */
    isRetryable(errorType) {
        return this.retryableErrors.includes(errorType);
    }

    /**
     * Show error toast notification
     * @param {string} message - Error message
     * @param {Object} options - Toast options
     */
    showErrorToast(message, options = {}) {
        const { retryable = false } = options;
        
        this.showToast(message, 'error', {
            duration: retryable ? 8000 : 5000,
            actions: retryable ? [{ text: 'Retry', action: 'retry' }] : []
        });
    }

    /**
     * Show success toast notification
     * @param {string} message - Success message
     */
    showSuccessToast(message) {
        this.showToast(message, 'success', { duration: 3000 });
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - Toast type (success, error, info, warning)
     * @param {Object} options - Toast options
     */
    showToast(message, type = 'info', options = {}) {
        const { duration = 5000, actions = [] } = options;
        
        const container = document.getElementById('toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast mb-4 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full max-w-md`;
        
        // Set toast color based on type
        const colorClasses = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        toast.className += ` ${colorClasses[type] || colorClasses.info}`;

        // Create toast content
        const content = `
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                    ${actions.length > 0 ? `
                        <div class="mt-2 flex space-x-2">
                            ${actions.map(action => `
                                <button class="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors" 
                                        onclick="handleToastAction('${action.action}', this)">
                                    ${action.text}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <button class="ml-4 text-white hover:text-gray-200 flex-shrink-0" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        toast.innerHTML = content;
        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Auto remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('translate-x-full');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    /**
     * Show field-specific validation errors
     * @param {Object} fieldErrors - Field errors object
     * @param {HTMLElement} form - Form element
     */
    showFieldErrors(fieldErrors, form) {
        // Clear existing errors
        form.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });

        // Show new errors
        for (const [fieldName, errors] of Object.entries(fieldErrors)) {
            const field = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (field && errors.length > 0) {
                // Add error styling
                field.classList.add('border-red-500');
                field.classList.remove('border-green-500');

                // Add error message
                const errorElement = document.createElement('div');
                errorElement.className = 'field-error text-red-500 text-sm mt-1';
                errorElement.textContent = errors[0];
                field.parentElement.appendChild(errorElement);
            }
        }
    }

    /**
     * Set loading state for element
     * @param {HTMLElement} element - Element to set loading state
     * @param {boolean} loading - Whether to show loading state
     */
    setLoadingState(element, loading) {
        if (loading) {
            element.disabled = true;
            element.classList.add('opacity-50', 'cursor-not-allowed');
            
            // Add loading spinner if it's a button
            if (element.tagName === 'BUTTON') {
                const originalText = element.textContent;
                element.dataset.originalText = originalText;
                element.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                `;
            }
        } else {
            element.disabled = false;
            element.classList.remove('opacity-50', 'cursor-not-allowed');
            
            // Restore original text if it's a button
            if (element.tagName === 'BUTTON' && element.dataset.originalText) {
                element.textContent = element.dataset.originalText;
                delete element.dataset.originalText;
            }
        }
    }

    /**
     * Create toast container if it doesn't exist
     * @returns {HTMLElement} Toast container
     */
    createToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-20 right-4 z-50';
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Log error for debugging
     * @param {Object} error - Error to log
     * @param {string} context - Error context
     */
    logError(error, context) {
        if (this.logLevel === 'debug' || this.logLevel === 'error') {
            console.group(`🚨 Profile Error [${context}]`);
            console.error('Type:', error.type);
            console.error('Message:', error.message);
            if (error.stack) {
                console.error('Stack:', error.stack);
            }
            console.groupEnd();
        }
    }

    /**
     * Delay execution
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Delay promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global toast action handler
window.handleToastAction = function(action, element) {
    if (action === 'retry') {
        // Trigger retry event
        window.dispatchEvent(new CustomEvent('profile:retry'));
        element.closest('.toast').remove();
    }
};

// Export singleton instance
export const profileErrorHandler = new ProfileErrorHandler();
export default profileErrorHandler;
