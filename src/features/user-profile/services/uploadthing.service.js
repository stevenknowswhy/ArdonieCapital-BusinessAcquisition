/**
 * UploadThing Service for Avatar Management
 * Alternative file storage solution for avatar uploads
 */

class UploadThingService {
    constructor() {
        // UploadThing configuration
        this.apiKey = 'sk_live_your_uploadthing_api_key'; // Replace with actual API key
        this.appId = 'your_app_id'; // Replace with actual app ID
        this.baseUrl = 'https://uploadthing.com/api';
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    }

    /**
     * Upload file to UploadThing
     * @param {File} file - File to upload
     * @param {string} userId - User ID for organization
     * @returns {Promise<Object>} Upload result
     */
    async uploadFile(file, userId) {
        try {
            console.log('🔄 Uploading to UploadThing...');

            // Validate file
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Create FormData
            const formData = new FormData();
            formData.append('files', file);
            formData.append('metadata', JSON.stringify({
                userId: userId,
                type: 'avatar',
                timestamp: Date.now()
            }));

            // Upload to UploadThing
            const response = await fetch(`${this.baseUrl}/uploadFiles`, {
                method: 'POST',
                headers: {
                    'X-Uploadthing-Api-Key': this.apiKey,
                    'X-Uploadthing-Version': '6.0.0'
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Upload failed: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.data || result.data.length === 0) {
                throw new Error('No upload data returned');
            }

            const uploadedFile = result.data[0];
            
            console.log('✅ UploadThing upload successful');
            return {
                success: true,
                url: uploadedFile.url,
                key: uploadedFile.key,
                name: uploadedFile.name,
                size: uploadedFile.size
            };

        } catch (error) {
            console.error('❌ UploadThing upload failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete file from UploadThing
     * @param {string} fileKey - File key to delete
     * @returns {Promise<Object>} Delete result
     */
    async deleteFile(fileKey) {
        try {
            console.log('🔄 Deleting from UploadThing...');

            const response = await fetch(`${this.baseUrl}/deleteFiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Uploadthing-Api-Key': this.apiKey,
                    'X-Uploadthing-Version': '6.0.0'
                },
                body: JSON.stringify({
                    fileKeys: [fileKey]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Delete failed: ${response.status}`);
            }

            console.log('✅ UploadThing delete successful');
            return { success: true };

        } catch (error) {
            console.error('❌ UploadThing delete failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate file before upload
     * @param {File} file - File to validate
     * @returns {Object} Validation result
     */
    validateFile(file) {
        if (!file) {
            return { isValid: false, error: 'No file selected' };
        }

        if (file.size > this.maxFileSize) {
            return { 
                isValid: false, 
                error: `File size must be less than ${this.maxFileSize / 1024 / 1024}MB` 
            };
        }

        if (!this.allowedTypes.includes(file.type)) {
            return { 
                isValid: false, 
                error: 'File type must be JPEG, PNG, or WebP' 
            };
        }

        return { isValid: true };
    }

    /**
     * Get file info from UploadThing
     * @param {string} fileKey - File key
     * @returns {Promise<Object>} File info result
     */
    async getFileInfo(fileKey) {
        try {
            const response = await fetch(`${this.baseUrl}/getFileInfo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Uploadthing-Api-Key': this.apiKey,
                    'X-Uploadthing-Version': '6.0.0'
                },
                body: JSON.stringify({
                    fileKey: fileKey
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to get file info: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                data: result.data
            };

        } catch (error) {
            console.error('Failed to get file info:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Simple UploadThing client for browser use
class SimpleUploadThingClient {
    constructor() {
        this.endpoint = 'https://uploadthing.com/api/uploadFiles';
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    }

    /**
     * Simple upload without API key (for demo/testing)
     * @param {File} file - File to upload
     * @returns {Promise<Object>} Upload result
     */
    async uploadFile(file) {
        try {
            console.log('🔄 Uploading to UploadThing (demo mode)...');

            // For demo purposes, we'll simulate an upload
            // In production, you would need proper UploadThing setup
            
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create a mock URL (in production, this would be the actual UploadThing URL)
            const mockUrl = URL.createObjectURL(file);
            
            console.log('✅ Demo upload successful');
            return {
                success: true,
                url: mockUrl,
                key: `demo_${Date.now()}`,
                name: file.name,
                size: file.size,
                isDemo: true
            };

        } catch (error) {
            console.error('❌ Demo upload failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    validateFile(file) {
        if (!file) {
            return { isValid: false, error: 'No file selected' };
        }

        if (file.size > this.maxFileSize) {
            return { 
                isValid: false, 
                error: `File size must be less than ${this.maxFileSize / 1024 / 1024}MB` 
            };
        }

        if (!this.allowedTypes.includes(file.type)) {
            return { 
                isValid: false, 
                error: 'File type must be JPEG, PNG, or WebP' 
            };
        }

        return { isValid: true };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UploadThingService, SimpleUploadThingClient };
} else {
    window.UploadThingService = UploadThingService;
    window.SimpleUploadThingClient = SimpleUploadThingClient;
}
