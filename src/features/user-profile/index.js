/**
 * User Profile Feature - Public API
 * Central export point for all user profile functionality
 */

// Services
export { profileService } from './services/profile.service.js';

// Feature metadata
export const USER_PROFILE_FEATURE_NAME = 'user-profile';
export const USER_PROFILE_FEATURE_VERSION = '1.0.0';
export const USER_PROFILE_FEATURE_DESCRIPTION = 'User profile management system with data persistence and preferences';

// Feature configuration
export const userProfileConfig = {
    // Service settings
    service: {
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
        maxAvatarSize: 5 * 1024 * 1024, // 5MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        enableCache: true,
        enableRealTimeUpdates: false // Future enhancement
    },

    // UI settings
    ui: {
        enableAvatarUpload: true,
        enablePasswordChange: true,
        enableAccountDeletion: true,
        enablePreferences: true,
        enableNotificationSettings: true,
        enableThemeSelection: true
    },

    // Validation rules
    validation: {
        firstName: {
            required: true,
            minLength: 1,
            maxLength: 50
        },
        lastName: {
            required: true,
            minLength: 1,
            maxLength: 50
        },
        phone: {
            required: false,
            pattern: /^[\+]?[1-9][\d]{0,15}$/
        },
        website: {
            required: false,
            pattern: /^https?:\/\/.+/
        },
        bio: {
            required: false,
            maxLength: 500
        },
        password: {
            minLength: 6,
            maxLength: 128
        }
    },

    // Feature flags
    features: {
        avatarUpload: true,
        passwordChange: true,
        emailVerification: true,
        accountDeletion: true,
        preferences: true,
        notifications: true,
        themeSelection: true,
        twoFactorAuth: false, // Future enhancement
        socialLinks: true,
        businessDetails: true
    }
};

// Feature capabilities
export const userProfileCapabilities = {
    // Data management
    dataManagement: {
        create: false, // Profiles are created during registration
        read: true,
        update: true,
        delete: true,
        cache: true,
        realTime: false // Future enhancement
    },

    // File management
    fileManagement: {
        avatarUpload: true,
        imageProcessing: false, // Future enhancement
        multipleFiles: false,
        fileValidation: true
    },

    // Security features
    security: {
        passwordChange: true,
        emailVerification: true,
        accountDeletion: true,
        dataEncryption: true,
        auditLog: false // Future enhancement
    },

    // User experience
    userExperience: {
        preferences: true,
        notifications: true,
        themeSelection: true,
        accessibility: true,
        mobileOptimized: true
    }
};

// Utility functions
export const userProfileUtils = {
    /**
     * Validate profile data
     * @param {Object} profileData - Profile data to validate
     * @returns {Object} Validation result
     */
    validateProfileData(profileData) {
        const errors = [];
        const config = userProfileConfig.validation;

        // Validate first name
        if (config.firstName.required && !profileData.firstName) {
            errors.push('First name is required');
        } else if (profileData.firstName) {
            if (profileData.firstName.length < config.firstName.minLength) {
                errors.push(`First name must be at least ${config.firstName.minLength} characters`);
            }
            if (profileData.firstName.length > config.firstName.maxLength) {
                errors.push(`First name must be no more than ${config.firstName.maxLength} characters`);
            }
        }

        // Validate last name
        if (config.lastName.required && !profileData.lastName) {
            errors.push('Last name is required');
        } else if (profileData.lastName) {
            if (profileData.lastName.length < config.lastName.minLength) {
                errors.push(`Last name must be at least ${config.lastName.minLength} characters`);
            }
            if (profileData.lastName.length > config.lastName.maxLength) {
                errors.push(`Last name must be no more than ${config.lastName.maxLength} characters`);
            }
        }

        // Validate phone
        if (profileData.phone && !config.phone.pattern.test(profileData.phone)) {
            errors.push('Please enter a valid phone number');
        }

        // Validate website
        if (profileData.website && !config.website.pattern.test(profileData.website)) {
            errors.push('Please enter a valid website URL (must start with http:// or https://)');
        }

        // Validate bio
        if (profileData.bio && profileData.bio.length > config.bio.maxLength) {
            errors.push(`Bio must be no more than ${config.bio.maxLength} characters`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate password
     * @param {string} password - Password to validate
     * @returns {Object} Validation result
     */
    validatePassword(password) {
        const errors = [];
        const config = userProfileConfig.validation.password;

        if (!password) {
            errors.push('Password is required');
        } else {
            if (password.length < config.minLength) {
                errors.push(`Password must be at least ${config.minLength} characters`);
            }
            if (password.length > config.maxLength) {
                errors.push(`Password must be no more than ${config.maxLength} characters`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Validate image file for avatar upload
     * @param {File} file - Image file to validate
     * @returns {Object} Validation result
     */
    validateAvatarFile(file) {
        const errors = [];
        const config = userProfileConfig.service;

        if (!file) {
            errors.push('No file selected');
            return { isValid: false, errors: errors };
        }

        // Check file type
        if (!config.allowedImageTypes.includes(file.type)) {
            errors.push('File must be a valid image (JPEG, PNG, GIF, or WebP)');
        }

        // Check file size
        if (file.size > config.maxAvatarSize) {
            const maxSizeMB = config.maxAvatarSize / (1024 * 1024);
            errors.push(`File size must be less than ${maxSizeMB}MB`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Format user display name
     * @param {Object} profile - User profile
     * @returns {string} Formatted display name
     */
    formatDisplayName(profile) {
        if (!profile) return 'Unknown User';
        
        const firstName = profile.first_name || profile.firstName || '';
        const lastName = profile.last_name || profile.lastName || '';
        
        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        } else if (firstName) {
            return firstName;
        } else if (lastName) {
            return lastName;
        } else {
            return profile.email || 'Unknown User';
        }
    },

    /**
     * Get user initials for avatar fallback
     * @param {Object} profile - User profile
     * @returns {string} User initials
     */
    getUserInitials(profile) {
        if (!profile) return 'U';
        
        const firstName = profile.first_name || profile.firstName || '';
        const lastName = profile.last_name || profile.lastName || '';
        
        if (firstName && lastName) {
            return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        } else if (firstName) {
            return firstName.charAt(0).toUpperCase();
        } else if (lastName) {
            return lastName.charAt(0).toUpperCase();
        } else if (profile.email) {
            return profile.email.charAt(0).toUpperCase();
        } else {
            return 'U';
        }
    }
};

// Export default configuration
export default {
    config: userProfileConfig,
    capabilities: userProfileCapabilities,
    utils: userProfileUtils
};
