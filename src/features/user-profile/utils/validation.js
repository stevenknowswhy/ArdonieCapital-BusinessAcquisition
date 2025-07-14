/**
 * Profile Validation Utilities
 * Comprehensive validation functions for user profile data
 */

export class ProfileValidator {
    constructor() {
        this.rules = {
            firstName: {
                required: true,
                minLength: 1,
                maxLength: 50,
                pattern: /^[a-zA-Z\s\-'\.]+$/,
                message: 'First name must contain only letters, spaces, hyphens, apostrophes, and periods'
            },
            lastName: {
                required: true,
                minLength: 1,
                maxLength: 50,
                pattern: /^[a-zA-Z\s\-'\.]+$/,
                message: 'Last name must contain only letters, spaces, hyphens, apostrophes, and periods'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            phone: {
                required: false,
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Please enter a valid phone number'
            },
            website: {
                required: false,
                pattern: /^https?:\/\/.+\..+/,
                message: 'Website must be a valid URL starting with http:// or https://'
            },
            linkedinUrl: {
                required: false,
                pattern: /^https?:\/\/(www\.)?linkedin\.com\/.+/,
                message: 'LinkedIn URL must be a valid LinkedIn profile URL'
            },
            bio: {
                required: false,
                maxLength: 500,
                message: 'Bio must be no more than 500 characters'
            },
            company: {
                required: false,
                maxLength: 100,
                message: 'Company name must be no more than 100 characters'
            },
            location: {
                required: false,
                maxLength: 100,
                message: 'Location must be no more than 100 characters'
            },
            password: {
                required: true,
                minLength: 6,
                maxLength: 128,
                pattern: /^(?=.*[a-zA-Z])(?=.*\d).*$/,
                message: 'Password must be at least 6 characters and contain both letters and numbers'
            }
        };
    }

    /**
     * Validate a single field
     * @param {string} fieldName - Name of the field to validate
     * @param {any} value - Value to validate
     * @returns {Object} Validation result
     */
    validateField(fieldName, value) {
        const rule = this.rules[fieldName];
        if (!rule) {
            return { isValid: true, errors: [] };
        }

        const errors = [];
        const stringValue = value ? String(value).trim() : '';

        // Required validation
        if (rule.required && !stringValue) {
            errors.push(`${this.formatFieldName(fieldName)} is required`);
            return { isValid: false, errors };
        }

        // Skip other validations if field is empty and not required
        if (!stringValue && !rule.required) {
            return { isValid: true, errors: [] };
        }

        // Length validations
        if (rule.minLength && stringValue.length < rule.minLength) {
            errors.push(`${this.formatFieldName(fieldName)} must be at least ${rule.minLength} characters`);
        }

        if (rule.maxLength && stringValue.length > rule.maxLength) {
            errors.push(`${this.formatFieldName(fieldName)} must be no more than ${rule.maxLength} characters`);
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(stringValue)) {
            errors.push(rule.message || `${this.formatFieldName(fieldName)} format is invalid`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate multiple fields
     * @param {Object} data - Object containing field values
     * @returns {Object} Validation result
     */
    validateFields(data) {
        const allErrors = [];
        const fieldErrors = {};

        for (const [fieldName, value] of Object.entries(data)) {
            const result = this.validateField(fieldName, value);
            if (!result.isValid) {
                fieldErrors[fieldName] = result.errors;
                allErrors.push(...result.errors);
            }
        }

        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            fieldErrors
        };
    }

    /**
     * Validate personal information form data
     * @param {Object} formData - Form data to validate
     * @returns {Object} Validation result
     */
    validatePersonalInfo(formData) {
        const fieldsToValidate = {
            firstName: formData.first_name || formData.firstName,
            lastName: formData.last_name || formData.lastName,
            phone: formData.phone,
            website: formData.website,
            linkedinUrl: formData.linkedin_url || formData.linkedinUrl,
            bio: formData.bio,
            company: formData.company,
            location: formData.location
        };

        return this.validateFields(fieldsToValidate);
    }

    /**
     * Validate password change data
     * @param {Object} passwordData - Password change data
     * @returns {Object} Validation result
     */
    validatePasswordChange(passwordData) {
        const errors = [];

        // Current password validation
        if (!passwordData.currentPassword) {
            errors.push('Current password is required');
        }

        // New password validation
        const newPasswordResult = this.validateField('password', passwordData.newPassword);
        if (!newPasswordResult.isValid) {
            errors.push(...newPasswordResult.errors);
        }

        // Confirm password validation
        if (!passwordData.confirmPassword) {
            errors.push('Password confirmation is required');
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.push('New passwords do not match');
        }

        // Check if new password is different from current
        if (passwordData.currentPassword && passwordData.newPassword && 
            passwordData.currentPassword === passwordData.newPassword) {
            errors.push('New password must be different from current password');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate file upload
     * @param {File} file - File to validate
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    validateFile(file, options = {}) {
        const errors = [];
        
        const defaults = {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        };

        const config = { ...defaults, ...options };

        if (!file) {
            errors.push('No file selected');
            return { isValid: false, errors };
        }

        // File type validation
        if (!config.allowedTypes.includes(file.type)) {
            errors.push(`File type not allowed. Allowed types: ${config.allowedTypes.join(', ')}`);
        }

        // File extension validation
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!config.allowedExtensions.includes(fileExtension)) {
            errors.push(`File extension not allowed. Allowed extensions: ${config.allowedExtensions.join(', ')}`);
        }

        // File size validation
        if (file.size > config.maxSize) {
            const maxSizeMB = config.maxSize / (1024 * 1024);
            errors.push(`File size must be less than ${maxSizeMB}MB`);
        }

        // File name validation
        if (file.name.length > 255) {
            errors.push('File name is too long');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate preferences data
     * @param {Object} preferences - Preferences to validate
     * @returns {Object} Validation result
     */
    validatePreferences(preferences) {
        const errors = [];

        // Validate boolean preferences
        const booleanFields = ['emailNotifications', 'listingAlerts', 'messageNotifications'];
        
        for (const field of booleanFields) {
            if (preferences.hasOwnProperty(field) && typeof preferences[field] !== 'boolean') {
                errors.push(`${this.formatFieldName(field)} must be true or false`);
            }
        }

        // Validate theme preference
        if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
            errors.push('Theme must be light, dark, or system');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Real-time field validation for UI
     * @param {HTMLElement} field - Input field element
     * @param {string} fieldName - Name of the field
     * @returns {Object} Validation result
     */
    validateFieldRealTime(field, fieldName) {
        const value = field.value;
        const result = this.validateField(fieldName, value);

        // Update field UI
        this.updateFieldUI(field, result);

        return result;
    }

    /**
     * Update field UI based on validation result
     * @param {HTMLElement} field - Input field element
     * @param {Object} validationResult - Validation result
     */
    updateFieldUI(field, validationResult) {
        const errorContainer = field.parentElement.querySelector('.field-error');
        
        // Remove existing error classes
        field.classList.remove('border-red-500', 'border-green-500');
        
        if (validationResult.isValid) {
            field.classList.add('border-green-500');
            if (errorContainer) {
                errorContainer.textContent = '';
                errorContainer.classList.add('hidden');
            }
        } else {
            field.classList.add('border-red-500');
            if (errorContainer) {
                errorContainer.textContent = validationResult.errors[0];
                errorContainer.classList.remove('hidden');
            } else {
                // Create error container if it doesn't exist
                const error = document.createElement('div');
                error.className = 'field-error text-red-500 text-sm mt-1';
                error.textContent = validationResult.errors[0];
                field.parentElement.appendChild(error);
            }
        }
    }

    /**
     * Format field name for display
     * @param {string} fieldName - Field name to format
     * @returns {string} Formatted field name
     */
    formatFieldName(fieldName) {
        const nameMap = {
            firstName: 'First name',
            lastName: 'Last name',
            email: 'Email',
            phone: 'Phone number',
            website: 'Website',
            linkedinUrl: 'LinkedIn URL',
            bio: 'Bio',
            company: 'Company',
            location: 'Location',
            password: 'Password',
            currentPassword: 'Current password',
            newPassword: 'New password',
            confirmPassword: 'Confirm password',
            emailNotifications: 'Email notifications',
            listingAlerts: 'Listing alerts',
            messageNotifications: 'Message notifications'
        };

        return nameMap[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').toLowerCase();
    }

    /**
     * Sanitize input data
     * @param {Object} data - Data to sanitize
     * @returns {Object} Sanitized data
     */
    sanitizeData(data) {
        const sanitized = {};

        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                // Trim whitespace and remove potentially harmful characters
                sanitized[key] = value.trim().replace(/[<>]/g, '');
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }
}

// Export singleton instance
export const profileValidator = new ProfileValidator();
export default profileValidator;
