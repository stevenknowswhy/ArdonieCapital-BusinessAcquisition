
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
 * Validation Utilities
 * Common validation functions for forms and user input
 */

export class ValidationUtils {
    constructor() {
        // Email validation regex - RFC 5322 compliant
        this.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        // Phone validation regex - supports multiple formats
        this.phoneRegex = /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
        
        // URL validation regex
        this.urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        
        // Credit card validation regex
        this.creditCardRegex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/;
        
        // Social Security Number regex
        this.ssnRegex = /^(?!666|000|9\d{2})\d{3}-?(?!00)\d{2}-?(?!0{4})\d{4}$/;
        
        // ZIP code regex (US)
        this.zipRegex = /^\d{5}(-\d{4})?$/;
    }

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {Object} Validation result
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { isValid: false, error: 'Email is required' };
        }

        const trimmedEmail = email.trim();
        
        if (trimmedEmail.length === 0) {
            return { isValid: false, error: 'Email is required' };
        }

        if (trimmedEmail.length > 254) {
            return { isValid: false, error: 'Email is too long' };
        }

        if (!this.emailRegex.test(trimmedEmail)) {
            return { isValid: false, error: 'Please enter a valid email address' };
        }

        return { isValid: true, value: trimmedEmail.toLowerCase() };
    }

    /**
     * Validate phone number
     * @param {string} phone - Phone number to validate
     * @returns {Object} Validation result
     */
    validatePhone(phone) {
        if (!phone || typeof phone !== 'string') {
            return { isValid: false, error: 'Phone number is required' };
        }

        const trimmedPhone = phone.trim();
        
        if (trimmedPhone.length === 0) {
            return { isValid: false, error: 'Phone number is required' };
        }

        if (!this.phoneRegex.test(trimmedPhone)) {
            return { isValid: false, error: 'Please enter a valid phone number (e.g., (555) 123-4567)' };
        }

        // Extract and format phone number
        const match = trimmedPhone.match(this.phoneRegex);
        const formatted = `(${match[2]}) ${match[3]}-${match[4]}`;

        return { isValid: true, value: formatted, raw: trimmedPhone };
    }

    /**
     * Validate required field
     * @param {any} value - Value to validate
     * @param {string} fieldName - Name of the field for error message
     * @returns {Object} Validation result
     */
    validateRequired(value, fieldName = 'Field') {
        if (value === null || value === undefined) {
            return { isValid: false, error: `${fieldName} is required` };
        }

        if (typeof value === 'string' && value.trim().length === 0) {
            return { isValid: false, error: `${fieldName} is required` };
        }

        if (Array.isArray(value) && value.length === 0) {
            return { isValid: false, error: `${fieldName} is required` };
        }

        return { isValid: true, value: typeof value === 'string' ? value.trim() : value };
    }

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {Object} Validation result
     */
    validateUrl(url) {
        if (!url || typeof url !== 'string') {
            return { isValid: false, error: 'URL is required' };
        }

        const trimmedUrl = url.trim();
        
        if (trimmedUrl.length === 0) {
            return { isValid: false, error: 'URL is required' };
        }

        if (!this.urlRegex.test(trimmedUrl)) {
            return { isValid: false, error: 'Please enter a valid URL (e.g., https://example.com)' };
        }

        return { isValid: true, value: trimmedUrl };
    }

    /**
     * Validate credit card number using Luhn algorithm
     * @param {string} cardNumber - Credit card number to validate
     * @returns {Object} Validation result
     */
    validateCreditCard(cardNumber) {
        if (!cardNumber || typeof cardNumber !== 'string') {
            return { isValid: false, error: 'Credit card number is required' };
        }

        // Remove spaces and dashes
        const cleanNumber = cardNumber.replace(/[\s-]/g, '');
        
        if (cleanNumber.length === 0) {
            return { isValid: false, error: 'Credit card number is required' };
        }

        if (!/^\d+$/.test(cleanNumber)) {
            return { isValid: false, error: 'Credit card number must contain only digits' };
        }

        if (!this.creditCardRegex.test(cleanNumber)) {
            return { isValid: false, error: 'Please enter a valid credit card number' };
        }

        // Luhn algorithm validation
        if (!this.luhnCheck(cleanNumber)) {
            return { isValid: false, error: 'Invalid credit card number' };
        }

        return { 
            isValid: true, 
            value: cleanNumber,
            formatted: this.formatCreditCard(cleanNumber),
            type: this.getCreditCardType(cleanNumber)
        };
    }

    /**
     * Validate Social Security Number
     * @param {string} ssn - SSN to validate
     * @returns {Object} Validation result
     */
    validateSSN(ssn) {
        if (!ssn || typeof ssn !== 'string') {
            return { isValid: false, error: 'Social Security Number is required' };
        }

        const cleanSSN = ssn.replace(/[\s-]/g, '');
        
        if (cleanSSN.length === 0) {
            return { isValid: false, error: 'Social Security Number is required' };
        }

        if (!/^\d{9}$/.test(cleanSSN)) {
            return { isValid: false, error: 'SSN must be 9 digits' };
        }

        if (!this.ssnRegex.test(ssn)) {
            return { isValid: false, error: 'Please enter a valid Social Security Number' };
        }

        return { 
            isValid: true, 
            value: cleanSSN,
            formatted: `${cleanSSN.slice(0, 3)}-${cleanSSN.slice(3, 5)}-${cleanSSN.slice(5)}`
        };
    }

    /**
     * Validate ZIP code
     * @param {string} zip - ZIP code to validate
     * @returns {Object} Validation result
     */
    validateZip(zip) {
        if (!zip || typeof zip !== 'string') {
            return { isValid: false, error: 'ZIP code is required' };
        }

        const trimmedZip = zip.trim();
        
        if (trimmedZip.length === 0) {
            return { isValid: false, error: 'ZIP code is required' };
        }

        if (!this.zipRegex.test(trimmedZip)) {
            return { isValid: false, error: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)' };
        }

        return { isValid: true, value: trimmedZip };
    }

    /**
     * Validate date
     * @param {string} date - Date string to validate
     * @param {string} format - Expected format (optional)
     * @returns {Object} Validation result
     */
    validateDate(date, format = null) {
        if (!date || typeof date !== 'string') {
            return { isValid: false, error: 'Date is required' };
        }

        const trimmedDate = date.trim();
        
        if (trimmedDate.length === 0) {
            return { isValid: false, error: 'Date is required' };
        }

        const parsedDate = new Date(trimmedDate);
        
        if (isNaN(parsedDate.getTime())) {
            return { isValid: false, error: 'Please enter a valid date' };
        }

        return { isValid: true, value: parsedDate };
    }

    /**
     * Validate age (must be 18 or older)
     * @param {string|Date} birthDate - Birth date
     * @returns {Object} Validation result
     */
    validateAge(birthDate) {
        const dateValidation = this.validateDate(birthDate);
        
        if (!dateValidation.isValid) {
            return dateValidation;
        }

        const birth = dateValidation.value;
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
            ? age - 1 
            : age;

        if (actualAge < 18) {
            return { isValid: false, error: 'You must be at least 18 years old' };
        }

        return { isValid: true, value: birth, age: actualAge };
    }

    /**
     * Luhn algorithm for credit card validation
     * @param {string} cardNumber - Credit card number
     * @returns {boolean} True if valid
     */
    luhnCheck(cardNumber) {
        let sum = 0;
        let isEven = false;

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i), 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    /**
     * Format credit card number for display
     * @param {string} cardNumber - Credit card number
     * @returns {string} Formatted card number
     */
    formatCreditCard(cardNumber) {
        return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
    }

    /**
     * Get credit card type
     * @param {string} cardNumber - Credit card number
     * @returns {string} Card type
     */
    getCreditCardType(cardNumber) {
        if (/^4/.test(cardNumber)) return 'Visa';
        if (/^5[1-5]/.test(cardNumber)) return 'MasterCard';
        if (/^3[47]/.test(cardNumber)) return 'American Express';
        if (/^6(?:011|5)/.test(cardNumber)) return 'Discover';
        return 'Unknown';
    }

    /**
     * Validate multiple fields at once
     * @param {Object} fields - Object with field names as keys and validation configs as values
     * @param {Object} data - Data object to validate
     * @returns {Object} Validation result with errors object
     */
    validateFields(fields, data) {
        const errors = {};
        const validatedData = {};
        let isValid = true;

        for (const [fieldName, config] of Object.entries(fields)) {
            const value = data[fieldName];
            let result;

            switch (config.type) {
                case 'email':
                    result = this.validateEmail(value);
                    break;
                case 'phone':
                    result = this.validatePhone(value);
                    break;
                case 'required':
                    result = this.validateRequired(value, config.label || fieldName);
                    break;
                case 'url':
                    result = this.validateUrl(value);
                    break;
                case 'creditCard':
                    result = this.validateCreditCard(value);
                    break;
                case 'ssn':
                    result = this.validateSSN(value);
                    break;
                case 'zip':
                    result = this.validateZip(value);
                    break;
                case 'date':
                    result = this.validateDate(value, config.format);
                    break;
                case 'age':
                    result = this.validateAge(value);
                    break;
                default:
                    result = { isValid: true, value: value };
            }

            if (!result.isValid) {
                errors[fieldName] = result.error;
                isValid = false;
            } else {
                validatedData[fieldName] = result.value;
            }
        }

        return { isValid, errors, data: validatedData };
    }
}

// Export singleton instance
export const validationUtils = new ValidationUtils();

// Export individual functions for backward compatibility
export const validateEmail = (email) => validationUtils.validateEmail(email).isValid;
export const validatePhone = (phone) => validationUtils.validatePhone(phone).isValid;
export const validateRequired = (value, fieldName) => validationUtils.validateRequired(value, fieldName).isValid;

// Export detailed validation functions that return full objects
export const validateEmailDetailed = (email) => validationUtils.validateEmail(email);
export const validatePhoneDetailed = (phone) => validationUtils.validatePhone(phone);
export const validateRequiredDetailed = (value, fieldName) => validationUtils.validateRequired(value, fieldName);
