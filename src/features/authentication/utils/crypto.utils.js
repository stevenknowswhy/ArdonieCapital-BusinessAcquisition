
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


// Password strength requirements
const validatePassword = (password) => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

/**
 * Cryptographic Utilities
 * Provides secure encryption/decryption and hashing functions
 */

export class CryptoUtils {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12; // 96 bits for GCM
        this.tagLength = 16; // 128 bits for GCM
        this.saltLength = 16;
        this.iterations = 100000; // PBKDF2 iterations
    }

    /**
     * Generate a cryptographically secure random key
     * @returns {Promise<CryptoKey>} Generated key
     */
    async generateKey() {
        return await crypto.subtle.generateKey(
            {
                name: this.algorithm,
                length: this.keyLength
            },
            true, // extractable
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Derive key from password using PBKDF2
     * @param {string} password - Password to derive key from
     * @param {Uint8Array} salt - Salt for key derivation
     * @returns {Promise<CryptoKey>} Derived key
     */
    async deriveKeyFromPassword(password, salt) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        
        const baseKey = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveKey']
        );
        
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.iterations,
                hash: 'SHA-256'
            },
            baseKey,
            {
                name: this.algorithm,
                length: this.keyLength
            },
            false, // not extractable
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt data using AES-GCM
     * @param {string} plaintext - Data to encrypt
     * @param {string} password - Password for encryption
     * @returns {Promise<string>} Encrypted data as base64 string
     */
    async encryptData(plaintext, password = process.env.PASSWORD || '') {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(plaintext);
            
            // Generate random salt and IV
            const salt = crypto.getRandomValues(new Uint8Array(this.saltLength));
            const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
            
            // Derive key from password
            const key = await this.deriveKeyFromPassword(password, salt);
            
            // Encrypt the data
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                data
            );
            
            // Combine salt, iv, and encrypted data
            const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
            result.set(salt, 0);
            result.set(iv, salt.length);
            result.set(new Uint8Array(encrypted), salt.length + iv.length);
            
            // Return as base64 string
            return this.arrayBufferToBase64(result);
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt data using AES-GCM
     * @param {string} encryptedData - Base64 encrypted data
     * @param {string} password - Password for decryption
     * @returns {Promise<string>} Decrypted plaintext
     */
    async decryptData(encryptedData, password = process.env.PASSWORD || '') {
        try {
            // Convert from base64
            const data = this.base64ToArrayBuffer(encryptedData);
            
            // Extract salt, iv, and encrypted data
            const salt = data.slice(0, this.saltLength);
            const iv = data.slice(this.saltLength, this.saltLength + this.ivLength);
            const encrypted = data.slice(this.saltLength + this.ivLength);
            
            // Derive key from password
            const key = await this.deriveKeyFromPassword(password, salt);
            
            // Decrypt the data
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                encrypted
            );
            
            // Convert back to string
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Hash data using SHA-256
     * @param {string} data - Data to hash
     * @returns {Promise<string>} Hash as hex string
     */
    async hashData(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        return this.arrayBufferToHex(hashBuffer);
    }

    /**
     * Generate secure random token
     * @param {number} length - Token length in bytes
     * @returns {string} Random token as hex string
     */
    generateSecureToken(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return this.arrayBufferToHex(array);
    }

    /**
     * Generate CSRF token
     * @returns {string} CSRF token
     */
    generateCSRFToken() {
        const timestamp = Date.now().toString();
        const randomBytes = this.generateSecureToken(16);
        return `csrf_${randomBytes}_${timestamp}`;
    }

    /**
     * Validate CSRF token
     * @param {string} token - Token to validate
     * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
     * @returns {boolean} True if token is valid
     */
    validateCSRFToken(token, maxAge = 60 * 60 * 1000) {
        try {
            if (!token || !token.startsWith('csrf_')) {
                return false;
            }
            
            const parts = token.split('_');
            if (parts.length !== 3) {
                return false;
            }
            
            const timestamp = parseInt(parts[2]);
            const age = Date.now() - timestamp;
            
            return age <= maxAge;
        } catch (error) {
            return false;
        }
    }

    /**
     * Generate secure session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return this.generateSecureToken(32);
    }

    /**
     * Create secure hash for password storage (using Web Crypto API)
     * @param {string} password - Password to hash
     * @param {string} salt - Salt for hashing
     * @returns {Promise<string>} Hashed password
     */
    async hashPassword(password, salt = null) {
        if (!salt) {
            salt = this.generateSecureToken(16);
        }
        
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
        const hash = this.arrayBufferToHex(hashBuffer);
        
        return `${salt}:${hash}`;
    }

    /**
     * Verify password against hash
     * @param {string} password - Password to verify
     * @param {string} hashedPassword - Stored hash
     * @returns {Promise<boolean>} True if password matches
     */
    async verifyPassword(password, hashedPassword) {
        try {
            const [salt, hash] = hashedPassword.split(':');
            const newHash = await this.hashPassword(password, salt);
            return newHash === hashedPassword;
        } catch (error) {
            return false;
        }
    }

    /**
     * Convert ArrayBuffer to base64 string
     * @param {ArrayBuffer} buffer - Buffer to convert
     * @returns {string} Base64 string
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Convert base64 string to ArrayBuffer
     * @param {string} base64 - Base64 string to convert
     * @returns {Uint8Array} Array buffer
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * Convert ArrayBuffer to hex string
     * @param {ArrayBuffer} buffer - Buffer to convert
     * @returns {string} Hex string
     */
    arrayBufferToHex(buffer) {
        const bytes = new Uint8Array(buffer);
        return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Convert hex string to ArrayBuffer
     * @param {string} hex - Hex string to convert
     * @returns {Uint8Array} Array buffer
     */
    hexToArrayBuffer(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }

    /**
     * Secure data comparison to prevent timing attacks
     * @param {string} a - First string
     * @param {string} b - Second string
     * @returns {boolean} True if strings are equal
     */
    secureCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        
        return result === 0;
    }

    /**
     * Generate secure random string
     * @param {number} length - String length
     * @param {string} charset - Character set to use
     * @returns {string} Random string
     */
    generateRandomString(length = 16, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            result += charset[array[i] % charset.length];
        }
        
        return result;
    }
}

// Export singleton instance
export const cryptoUtils = new CryptoUtils();
