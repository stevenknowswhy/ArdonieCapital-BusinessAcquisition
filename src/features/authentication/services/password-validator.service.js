
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
 * Password Validation Service
 * Handles password strength validation and security checks
 */

export class PasswordValidatorService {
    constructor() {
        this.minLength = 12;
        this.maxLength = 128;
        this.weakPatterns = [
            /(.)\1{2,}/, // Repeated characters
            /123456|654321|qwerty|password|admin|letmein|welcome/i, // Common sequences
            /^[a-zA-Z]+$/, // Only letters
            /^[0-9]+$/, // Only numbers
        ];
    }

    /**
     * Validate password strength and security
     * @param {string} password - Password to validate
     * @returns {Object} Validation result with errors and strength score
     */
    validatePassword(password) {
        const errors = [];
        
        // Basic length validation
        if (!password || password.length < this.minLength) {
            errors.push(`Password must be at least ${this.minLength} characters long`);
        }
        
        if (password && password.length > this.maxLength) {
            errors.push(`Password must not exceed ${this.maxLength} characters`);
        }
        
        if (!password) {
            return {
                isValid: false,
                errors: errors,
                strength: 0,
                strengthLabel: 'No Password'
            };
        }
        
        // Character type requirements
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        // Check for weak patterns
        for (const pattern of this.weakPatterns) {
            if (pattern.test(password)) {
                errors.push('Password contains common weak patterns');
                break;
            }
        }
        
        // Calculate strength score
        const strength = this.calculatePasswordStrength(password);
        const strengthLabel = this.getStrengthLabel(strength);
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            strength: strength,
            strengthLabel: strengthLabel
        };
    }

    /**
     * Calculate password strength score (0-100)
     * @param {string} password - Password to analyze
     * @returns {number} Strength score
     */
    calculatePasswordStrength(password) {
        let score = 0;
        
        // Length scoring (up to 25 points)
        score += Math.min(password.length * 2, 25);
        
        // Character variety scoring
        if (/[a-z]/.test(password)) score += 5; // Lowercase
        if (/[A-Z]/.test(password)) score += 5; // Uppercase
        if (/\d/.test(password)) score += 5; // Numbers
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10; // Special chars
        
        // Complexity bonuses
        if (password.length >= 16) score += 10; // Long password bonus
        if (password.length >= 20) score += 5; // Very long password bonus
        
        // Multiple special characters bonus
        const specialCharCount = (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
        if (specialCharCount >= 2) score += 5;
        
        // Mixed case bonus
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 5;
        
        // Numbers and letters mix bonus
        if (/\d/.test(password) && /[a-zA-Z]/.test(password)) score += 5;
        
        // Entropy bonus for character variety
        const uniqueChars = new Set(password).size;
        if (uniqueChars >= password.length * 0.7) score += 10; // High character variety
        
        // Penalty for weak patterns
        for (const pattern of this.weakPatterns) {
            if (pattern.test(password)) {
                score -= 20;
                break;
            }
        }
        
        return Math.max(0, Math.min(score, 100));
    }

    /**
     * Get strength label based on score
     * @param {number} score - Strength score (0-100)
     * @returns {string} Strength label
     */
    getStrengthLabel(score) {
        if (score < 30) return 'Very Weak';
        if (score < 50) return 'Weak';
        if (score < 70) return 'Fair';
        if (score < 85) return 'Good';
        if (score < 95) return 'Strong';
        return 'Very Strong';
    }

    /**
     * Get strength color for UI display
     * @param {number} score - Strength score (0-100)
     * @returns {string} CSS color class
     */
    getStrengthColor(score) {
        if (score < 30) return 'text-red-500';
        if (score < 50) return 'text-orange-500';
        if (score < 70) return 'text-yellow-500';
        if (score < 85) return 'text-blue-500';
        if (score < 95) return 'text-green-500';
        return 'text-emerald-500';
    }

    /**
     * Validate password confirmation match
     * @param {string} password - Original password
     * @param {string} confirmPassword - Confirmation password
     * @returns {Object} Validation result
     */
    validatePasswordConfirmation(password, confirmPassword) {
        const errors = [];
        
        if (!confirmPassword) {
            errors.push('Password confirmation is required');
        } else if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Check if password meets minimum security requirements
     * @param {string} password - Password to check
     * @returns {boolean} True if password meets requirements
     */
    meetsMinimumRequirements(password) {
        const validation = this.validatePassword(password);
        return validation.isValid && validation.strength >= 50;
    }

    /**
     * Generate password strength requirements text
     * @returns {Array} Array of requirement strings
     */
    getPasswordRequirements() {
        return [
            `At least ${this.minLength} characters long`,
            'At least one uppercase letter (A-Z)',
            'At least one lowercase letter (a-z)',
            'At least one number (0-9)',
            'At least one special character (!@#$%^&*)',
            'No common weak patterns (123456, qwerty, etc.)',
            'No repeated characters (aaa, 111, etc.)'
        ];
    }

    /**
     * Generate a secure password suggestion
     * @param {number} length - Desired password length (default: 16)
     * @returns {string} Generated secure password
     */
    generateSecurePassword(length = 16) {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let password = '';
        
        // Ensure at least one character from each category
        password += this.getRandomChar(lowercase);
        password += this.getRandomChar(uppercase);
        password += this.getRandomChar(numbers);
        password += this.getRandomChar(special);
        
        // Fill remaining length with random characters from all categories
        const allChars = lowercase + uppercase + numbers + special;
        for (let i = 4; i < length; i++) {
            password += this.getRandomChar(allChars);
        }
        
        // Shuffle the password to avoid predictable patterns
        return this.shuffleString(password);
    }

    /**
     * Get random character from string
     * @param {string} chars - Character set to choose from
     * @returns {string} Random character
     */
    getRandomChar(chars) {
        const array = new Uint8Array(1);
        crypto.getRandomValues(array);
        return chars[array[0] % chars.length];
    }

    /**
     * Shuffle string characters randomly
     * @param {string} str - String to shuffle
     * @returns {string} Shuffled string
     */
    shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }
}

// Export singleton instance
export const passwordValidator = new PasswordValidatorService();
