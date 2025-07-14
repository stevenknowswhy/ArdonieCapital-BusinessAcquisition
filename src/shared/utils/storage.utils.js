
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
 * Storage Utilities
 * Enhanced localStorage and sessionStorage helpers with error handling and encryption
 */

export class StorageUtils {
    constructor() {
        this.prefix = 'ardonie_';
        this.encryptionKey = 'ardonie_storage_key';
        this.compressionThreshold = 1024; // Compress data larger than 1KB
    }

    /**
     * Save data to localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @param {Object} options - Storage options
     * @returns {boolean} Success status
     */
    saveToLocalStorage(key, data, options = {}) {
        try {
            const storageKey = this.getStorageKey(key, options.prefix);
            const serializedData = this.serializeData(data, options);
            
            localStorage.setItem(storageKey, serializedData);
            
            // Set expiration if specified
            if (options.expiresIn) {
                const expirationTime = Date.now() + options.expiresIn;
                localStorage.setItem(`${storageKey}_expires`, expirationTime.toString());
            }
            
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.handleQuotaExceeded('localStorage');
            }
            
            return false;
        }
    }

    /**
     * Load data from localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @param {Object} options - Storage options
     * @returns {any} Retrieved data or default value
     */
    loadFromLocalStorage(key, defaultValue = null, options = {}) {
        try {
            const storageKey = this.getStorageKey(key, options.prefix);
            
            // Check expiration
            if (this.isExpired(storageKey)) {
                this.removeFromLocalStorage(key, options);
                return defaultValue;
            }
            
            const serializedData = localStorage.getItem(storageKey);
            
            if (serializedData === null) {
                return defaultValue;
            }
            
            return this.deserializeData(serializedData, options);
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     * @param {Object} options - Storage options
     * @returns {boolean} Success status
     */
    removeFromLocalStorage(key, options = {}) {
        try {
            const storageKey = this.getStorageKey(key, options.prefix);
            localStorage.removeItem(storageKey);
            localStorage.removeItem(`${storageKey}_expires`);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }

    /**
     * Save data to sessionStorage with error handling
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @param {Object} options - Storage options
     * @returns {boolean} Success status
     */
    saveToSessionStorage(key, data, options = {}) {
        try {
            const storageKey = this.getStorageKey(key, options.prefix);
            const serializedData = this.serializeData(data, options);
            
            sessionStorage.setItem(storageKey, serializedData);
            return true;
        } catch (error) {
            console.error('Failed to save to sessionStorage:', error);
            
            if (error.name === 'QuotaExceededError') {
                this.handleQuotaExceeded('sessionStorage');
            }
            
            return false;
        }
    }

    /**
     * Load data from sessionStorage with error handling
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @param {Object} options - Storage options
     * @returns {any} Retrieved data or default value
     */
    loadFromSessionStorage(key, defaultValue = null, options = {}) {
        try {
            const storageKey = this.getStorageKey(key, options.prefix);
            const serializedData = sessionStorage.getItem(storageKey);
            
            if (serializedData === null) {
                return defaultValue;
            }
            
            return this.deserializeData(serializedData, options);
        } catch (error) {
            console.error('Failed to load from sessionStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove data from sessionStorage
     * @param {string} key - Storage key
     * @param {Object} options - Storage options
     * @returns {boolean} Success status
     */
    removeFromSessionStorage(key, options = {}) {
        try {
            const storageKey = this.getStorageKey(key, options.prefix);
            sessionStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('Failed to remove from sessionStorage:', error);
            return false;
        }
    }

    /**
     * Clear all storage data with optional prefix filter
     * @param {string} storageType - 'localStorage' or 'sessionStorage'
     * @param {string} prefix - Optional prefix filter
     * @returns {boolean} Success status
     */
    clearStorage(storageType = 'localStorage', prefix = null) {
        try {
            const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
            
            if (prefix) {
                const keysToRemove = [];
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key && key.startsWith(prefix)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => storage.removeItem(key));
            } else {
                storage.clear();
            }
            
            return true;
        } catch (error) {
            console.error(`Failed to clear ${storageType}:`, error);
            return false;
        }
    }

    /**
     * Get storage usage information
     * @param {string} storageType - 'localStorage' or 'sessionStorage'
     * @returns {Object} Storage usage information
     */
    getStorageInfo(storageType = 'localStorage') {
        try {
            const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
            let totalSize = 0;
            let itemCount = 0;
            const items = {};

            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key) {
                    const value = storage.getItem(key);
                    const size = new Blob([value]).size;
                    totalSize += size;
                    itemCount++;
                    items[key] = { size, value: value.substring(0, 100) + '...' };
                }
            }

            return {
                type: storageType,
                totalSize,
                itemCount,
                items,
                formattedSize: this.formatBytes(totalSize)
            };
        } catch (error) {
            console.error(`Failed to get ${storageType} info:`, error);
            return null;
        }
    }

    /**
     * Check if storage is available
     * @param {string} storageType - 'localStorage' or 'sessionStorage'
     * @returns {boolean} Availability status
     */
    isStorageAvailable(storageType = 'localStorage') {
        try {
            const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Serialize data for storage
     * @param {any} data - Data to serialize
     * @param {Object} options - Serialization options
     * @returns {string} Serialized data
     */
    serializeData(data, options = {}) {
        let serialized = JSON.stringify({
            data: data,
            timestamp: Date.now(),
            version: '1.0'
        });

        // Compress if data is large
        if (options.compress && serialized.length > this.compressionThreshold) {
            serialized = this.compressString(serialized);
        }

        // Encrypt if requested
        if (options.encrypt) {
            serialized = this.encryptString(serialized);
        }

        return serialized;
    }

    /**
     * Deserialize data from storage
     * @param {string} serializedData - Serialized data
     * @param {Object} options - Deserialization options
     * @returns {any} Deserialized data
     */
    deserializeData(serializedData, options = {}) {
        let data = serializedData;

        // Decrypt if encrypted
        if (options.encrypt) {
            data = this.decryptString(data);
        }

        // Decompress if compressed
        if (options.compress) {
            data = this.decompressString(data);
        }

        const parsed = JSON.parse(data);
        return parsed.data;
    }

    /**
     * Get storage key with prefix
     * @param {string} key - Original key
     * @param {string} customPrefix - Custom prefix
     * @returns {string} Prefixed key
     */
    getStorageKey(key, customPrefix = null) {
        const prefix = customPrefix || this.prefix;
        return `${prefix}${key}`;
    }

    /**
     * Check if stored data has expired
     * @param {string} storageKey - Storage key
     * @returns {boolean} Expiration status
     */
    isExpired(storageKey) {
        try {
            const expirationTime = localStorage.getItem(`${storageKey}_expires`);
            if (!expirationTime) {
                return false;
            }
            return Date.now() > parseInt(expirationTime);
        } catch (error) {
            return false;
        }
    }

    /**
     * Handle quota exceeded error
     * @param {string} storageType - Storage type
     */
    handleQuotaExceeded(storageType) {
        console.warn(`${storageType} quota exceeded. Attempting cleanup...`);
        
        try {
            // Remove expired items first
            this.cleanupExpiredItems(storageType);
            
            // If still over quota, remove oldest items
            this.cleanupOldestItems(storageType, 10);
        } catch (error) {
            console.error('Failed to cleanup storage:', error);
        }
    }

    /**
     * Clean up expired items
     * @param {string} storageType - Storage type
     */
    cleanupExpiredItems(storageType) {
        const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
        const keysToRemove = [];

        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.endsWith('_expires')) {
                const expirationTime = parseInt(storage.getItem(key));
                if (Date.now() > expirationTime) {
                    const dataKey = key.replace('_expires', '');
                    keysToRemove.push(key, dataKey);
                }
            }
        }

        keysToRemove.forEach(key => storage.removeItem(key));
    }

    /**
     * Clean up oldest items
     * @param {string} storageType - Storage type
     * @param {number} count - Number of items to remove
     */
    cleanupOldestItems(storageType, count) {
        const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
        const items = [];

        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith(this.prefix) && !key.endsWith('_expires')) {
                try {
                    const data = JSON.parse(storage.getItem(key));
                    items.push({ key, timestamp: data.timestamp || 0 });
                } catch (error) {
                    // Remove invalid items
                    items.push({ key, timestamp: 0 });
                }
            }
        }

        // Sort by timestamp and remove oldest
        items.sort((a, b) => a.timestamp - b.timestamp);
        items.slice(0, count).forEach(item => {
            storage.removeItem(item.key);
            storage.removeItem(`${item.key}_expires`);
        });
    }

    /**
     * Simple string compression (placeholder for actual compression)
     * @param {string} str - String to compress
     * @returns {string} Compressed string
     */
    compressString(str) {
        // This is a placeholder. In a real implementation, you might use
        // a library like pako for gzip compression
        return btoa(str);
    }

    /**
     * Simple string decompression (placeholder for actual decompression)
     * @param {string} str - String to decompress
     * @returns {string} Decompressed string
     */
    decompressString(str) {
        // This is a placeholder. In a real implementation, you might use
        // a library like pako for gzip decompression
        return atob(str);
    }

    /**
     * Simple string encryption (placeholder for actual encryption)
     * @param {string} str - String to encrypt
     * @returns {string} Encrypted string
     */
    encryptString(str) {
        // This is a placeholder. In a real implementation, you would use
        // proper encryption like AES from the Web Crypto API
        return btoa(str);
    }

    /**
     * Simple string decryption (placeholder for actual decryption)
     * @param {string} str - String to decrypt
     * @returns {string} Decrypted string
     */
    decryptString(str) {
        // This is a placeholder. In a real implementation, you would use
        // proper decryption like AES from the Web Crypto API
        return atob(str);
    }

    /**
     * Format bytes to human readable format
     * @param {number} bytes - Bytes to format
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Export singleton instance
export const storageUtils = new StorageUtils();

// Export individual functions for backward compatibility
export const saveToLocalStorage = (key, data, options) => 
    storageUtils.saveToLocalStorage(key, data, options);

export const loadFromLocalStorage = (key, defaultValue, options) => 
    storageUtils.loadFromLocalStorage(key, defaultValue, options);

export const removeFromLocalStorage = (key, options) => 
    storageUtils.removeFromLocalStorage(key, options);

export const saveToSessionStorage = (key, data, options) => 
    storageUtils.saveToSessionStorage(key, data, options);

export const loadFromSessionStorage = (key, defaultValue, options) => 
    storageUtils.loadFromSessionStorage(key, defaultValue, options);

export const removeFromSessionStorage = (key, options) =>
    storageUtils.removeFromSessionStorage(key, options);

// Additional aliases for test compatibility - simple localStorage/sessionStorage wrappers
export const setStorageItem = (key, data) => {
    // In test environment, use global.localStorage, otherwise use window.localStorage
    const storage = global.localStorage || (typeof window !== 'undefined' && window.localStorage);
    if (storage) {
        const value = typeof data === 'string' ? data : JSON.stringify(data);
        storage.setItem(key, value);
    }
};

export const getStorageItem = (key, defaultValue = null) => {
    const storage = global.localStorage || (typeof window !== 'undefined' && window.localStorage);
    if (storage) {
        const value = storage.getItem(key);
        if (value === null) return defaultValue;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
    return defaultValue;
};

export const removeStorageItem = (key) => {
    const storage = global.localStorage || (typeof window !== 'undefined' && window.localStorage);
    if (storage) {
        storage.removeItem(key);
    }
};

export const setSessionItem = (key, data) => {
    const storage = global.sessionStorage || (typeof window !== 'undefined' && window.sessionStorage);
    if (storage) {
        const value = typeof data === 'string' ? data : JSON.stringify(data);
        storage.setItem(key, value);
    }
};

export const getSessionItem = (key, defaultValue = null) => {
    const storage = global.sessionStorage || (typeof window !== 'undefined' && window.sessionStorage);
    if (storage) {
        const value = storage.getItem(key);
        if (value === null) return defaultValue;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
    return defaultValue;
};

export const removeSessionItem = (key) => {
    const storage = global.sessionStorage || (typeof window !== 'undefined' && window.sessionStorage);
    if (storage) {
        storage.removeItem(key);
    }
};
