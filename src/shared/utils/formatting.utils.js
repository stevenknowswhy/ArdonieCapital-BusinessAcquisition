
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
 * Formatting Utilities
 * Common formatting functions for currency, numbers, dates, and text
 */

export class FormattingUtils {
    constructor() {
        // Default locale settings
        this.defaultLocale = 'en-US';
        this.defaultCurrency = 'USD';
        this.defaultTimezone = 'America/New_York';
    }

    /**
     * Format currency with proper locale and symbol
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: USD)
     * @param {string} locale - Locale code (default: en-US)
     * @param {Object} options - Additional formatting options
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currency = this.defaultCurrency, locale = this.defaultLocale, options = {}) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '$0.00';
        }

        const defaultOptions = {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        };

        const formatOptions = { ...defaultOptions, ...options };

        try {
            return new Intl.NumberFormat(locale, formatOptions).format(amount);
        } catch (error) {
            console.error('Currency formatting error:', error);
            return `$${amount.toFixed(2)}`;
        }
    }

    /**
     * Format large currency amounts with abbreviations (K, M, B)
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code
     * @param {number} precision - Decimal places for abbreviated amounts
     * @returns {string} Formatted currency with abbreviation
     */
    formatCurrencyCompact(amount, currency = this.defaultCurrency, precision = 1) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '$0';
        }

        const absAmount = Math.abs(amount);
        const sign = amount < 0 ? '-' : '';

        if (absAmount >= 1e9) {
            return `${sign}${this.formatCurrency(absAmount / 1e9, currency, this.defaultLocale, { 
                minimumFractionDigits: precision, 
                maximumFractionDigits: precision 
            })}B`.replace(currency === 'USD' ? '$' : '', '$');
        } else if (absAmount >= 1e6) {
            return `${sign}${this.formatCurrency(absAmount / 1e6, currency, this.defaultLocale, { 
                minimumFractionDigits: precision, 
                maximumFractionDigits: precision 
            })}M`.replace(currency === 'USD' ? '$' : '', '$');
        } else if (absAmount >= 1e3) {
            return `${sign}${this.formatCurrency(absAmount / 1e3, currency, this.defaultLocale, { 
                minimumFractionDigits: precision, 
                maximumFractionDigits: precision 
            })}K`.replace(currency === 'USD' ? '$' : '', '$');
        } else {
            return this.formatCurrency(amount, currency);
        }
    }

    /**
     * Format numbers with proper locale and separators
     * @param {number} number - Number to format
     * @param {string} locale - Locale code
     * @param {Object} options - Formatting options
     * @returns {string} Formatted number string
     */
    formatNumber(number, locale = this.defaultLocale, options = {}) {
        if (number === null || number === undefined || isNaN(number)) {
            return '0';
        }

        const defaultOptions = {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        };

        const formatOptions = { ...defaultOptions, ...options };

        try {
            return new Intl.NumberFormat(locale, formatOptions).format(number);
        } catch (error) {
            console.error('Number formatting error:', error);
            return number.toString();
        }
    }

    /**
     * Format percentage values
     * @param {number} value - Value to format as percentage (0.15 = 15%)
     * @param {number} decimals - Number of decimal places
     * @param {string} locale - Locale code
     * @returns {string} Formatted percentage string
     */
    formatPercentage(value, decimals = 1, locale = this.defaultLocale) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0%';
        }

        try {
            return new Intl.NumberFormat(locale, {
                style: 'percent',
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(value);
        } catch (error) {
            console.error('Percentage formatting error:', error);
            return `${(value * 100).toFixed(decimals)}%`;
        }
    }

    /**
     * Format dates with various options
     * @param {Date|string} date - Date to format
     * @param {Object} options - Formatting options
     * @param {string} locale - Locale code
     * @returns {string} Formatted date string
     */
    formatDate(date, options = {}, locale = this.defaultLocale) {
        if (!date) {
            return '';
        }

        const dateObj = date instanceof Date ? date : new Date(date);

        if (isNaN(dateObj.getTime())) {
            return '';
        }

        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const formatOptions = { ...defaultOptions, ...options };

        try {
            return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
        } catch (error) {
            console.error('Date formatting error:', error);
            return dateObj.toLocaleDateString();
        }
    }

    /**
     * Format time with various options
     * @param {Date|string} date - Date/time to format
     * @param {Object} options - Formatting options
     * @param {string} locale - Locale code
     * @returns {string} Formatted time string
     */
    formatTime(date, options = {}, locale = this.defaultLocale) {
        if (!date) {
            return '';
        }

        const dateObj = date instanceof Date ? date : new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            return 'Invalid Time';
        }

        const defaultOptions = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };

        const formatOptions = { ...defaultOptions, ...options };

        try {
            return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
        } catch (error) {
            console.error('Time formatting error:', error);
            return dateObj.toLocaleTimeString();
        }
    }

    /**
     * Format relative time (e.g., "2 hours ago", "in 3 days")
     * @param {Date|string} date - Date to compare
     * @param {Date} baseDate - Base date for comparison (default: now)
     * @param {string} locale - Locale code
     * @returns {string} Relative time string
     */
    formatRelativeTime(date, baseDate = new Date(), locale = this.defaultLocale) {
        if (!date) {
            return '';
        }

        const dateObj = date instanceof Date ? date : new Date(date);
        const baseDateObj = baseDate instanceof Date ? baseDate : new Date(baseDate);
        
        if (isNaN(dateObj.getTime()) || isNaN(baseDateObj.getTime())) {
            return 'Invalid Date';
        }

        const diffInSeconds = Math.floor((baseDateObj - dateObj) / 1000);
        const absDiff = Math.abs(diffInSeconds);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(absDiff / interval.seconds);
            if (count >= 1) {
                const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
                return rtf.format(diffInSeconds > 0 ? -count : count, interval.label);
            }
        }

        return 'just now';
    }

    /**
     * Format phone numbers
     * @param {string} phone - Phone number to format
     * @param {string} format - Format type ('us', 'international')
     * @returns {string} Formatted phone number
     */
    formatPhone(phone, format = 'us') {
        if (!phone) {
            return '';
        }

        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '');

        if (format === 'us' && digits.length === 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (format === 'us' && digits.length === 11 && digits[0] === '1') {
            return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        } else if (format === 'international') {
            // Basic international formatting
            if (digits.length > 10) {
                return `+${digits.slice(0, -10)} ${digits.slice(-10, -7)} ${digits.slice(-7, -4)} ${digits.slice(-4)}`;
            }
        }

        return phone; // Return original if no format matches
    }

    /**
     * Format text for display (capitalize, truncate, etc.)
     * @param {string} text - Text to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted text
     */
    formatText(text, options = {}) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        let formatted = text;

        // Trim whitespace
        if (options.trim !== false) {
            formatted = formatted.trim();
        }

        // Capitalize
        if (options.capitalize === 'first') {
            formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
        } else if (options.capitalize === 'words') {
            formatted = formatted.replace(/\w\S*/g, (txt) => 
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        } else if (options.capitalize === 'upper') {
            formatted = formatted.toUpperCase();
        } else if (options.capitalize === 'lower') {
            formatted = formatted.toLowerCase();
        }

        // Truncate
        if (options.maxLength && formatted.length > options.maxLength) {
            formatted = formatted.substring(0, options.maxLength);
            if (options.ellipsis !== false) {
                formatted += '...';
            }
        }

        return formatted;
    }

    /**
     * Format file sizes
     * @param {number} bytes - File size in bytes
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        if (!bytes || isNaN(bytes)) return 'Unknown';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Format business hours
     * @param {Object} hours - Business hours object
     * @returns {string} Formatted business hours
     */
    formatBusinessHours(hours) {
        if (!hours || typeof hours !== 'object') {
            return 'Hours not available';
        }

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        const formatted = [];
        let currentRange = null;

        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            const dayHours = hours[day];

            if (dayHours && dayHours.open && dayHours.close) {
                const hoursString = `${dayHours.open} - ${dayHours.close}`;
                
                if (currentRange && currentRange.hours === hoursString) {
                    currentRange.endDay = i;
                } else {
                    if (currentRange) {
                        formatted.push(this.formatHoursRange(currentRange, dayNames));
                    }
                    currentRange = {
                        startDay: i,
                        endDay: i,
                        hours: hoursString
                    };
                }
            } else {
                if (currentRange) {
                    formatted.push(this.formatHoursRange(currentRange, dayNames));
                    currentRange = null;
                }
                formatted.push(`${dayNames[i]}: Closed`);
            }
        }

        if (currentRange) {
            formatted.push(this.formatHoursRange(currentRange, dayNames));
        }

        return formatted.join('\n');
    }

    /**
     * Helper method to format hours range
     * @param {Object} range - Hours range object
     * @param {Array} dayNames - Array of day names
     * @returns {string} Formatted hours range
     */
    formatHoursRange(range, dayNames) {
        if (range.startDay === range.endDay) {
            return `${dayNames[range.startDay]}: ${range.hours}`;
        } else {
            return `${dayNames[range.startDay]} - ${dayNames[range.endDay]}: ${range.hours}`;
        }
    }

    /**
     * Capitalize first letter of text
     * @param {string} text - Text to capitalize
     * @returns {string} Capitalized text
     */
    capitalize(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    /**
     * Convert text to title case
     * @param {string} text - Text to convert
     * @returns {string} Title case text
     */
    titleCase(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        return text.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} Truncated text
     */
    truncate(text, maxLength, suffix = '...') {
        if (!text || typeof text !== 'string') {
            return '';
        }
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Convert text to camelCase
     * @param {string} text - Text to convert
     * @returns {string} camelCase text
     */
    camelCase(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        return text
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '')
            .replace(/[-_]/g, '');
    }

    /**
     * Convert text to kebab-case
     * @param {string} text - Text to convert
     * @returns {string} kebab-case text
     */
    kebabCase(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        return text
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    }
}

// Export singleton instance
export const formattingUtils = new FormattingUtils();

// Export individual functions for backward compatibility
export const formatCurrency = (amount, currency, locale, options) => 
    formattingUtils.formatCurrency(amount, currency, locale, options);

export const formatNumber = (number, locale, options) => 
    formattingUtils.formatNumber(number, locale, options);

export const formatDate = (date, options, locale) => 
    formattingUtils.formatDate(date, options, locale);

export const formatTime = (date, options, locale) => 
    formattingUtils.formatTime(date, options, locale);

export const formatRelativeTime = (date, baseDate, locale) => 
    formattingUtils.formatRelativeTime(date, baseDate, locale);

export const formatPhone = (phone, format) => 
    formattingUtils.formatPhone(phone, format);

export const formatFileSize = (bytes, decimals) =>
    formattingUtils.formatFileSize(bytes, decimals);

export const capitalize = (text) =>
    formattingUtils.capitalize(text);

export const titleCase = (text) =>
    formattingUtils.titleCase(text);

export const truncate = (text, maxLength, suffix) =>
    formattingUtils.truncate(text, maxLength, suffix);

export const camelCase = (text) =>
    formattingUtils.camelCase(text);

export const kebabCase = (text) =>
    formattingUtils.kebabCase(text);
