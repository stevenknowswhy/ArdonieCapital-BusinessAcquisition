/**
 * Avatar Management Service
 * Handles avatar upload, processing, and management for user profiles
 */

import { supabaseService } from '../../shared/services/supabase/supabase.service.js';

class AvatarService {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        this.bucketName = 'avatars';
    }

    /**
     * Upload and process avatar image
     * @param {File} file - Image file to upload
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Upload result
     */
    async uploadAvatar(file, userId) {
        try {
            console.log('🔄 Starting avatar upload...');

            // Validate file
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Process image (resize, compress)
            const processedFile = await this.processImage(file);
            
            // Generate unique filename
            const fileName = this.generateFileName(userId, processedFile.type);
            
            // Upload to Supabase Storage
            const uploadResult = await supabaseService.uploadFile(
                this.bucketName,
                fileName,
                processedFile
            );

            if (!uploadResult.success) {
                throw new Error(uploadResult.error);
            }

            // Get public URL
            const urlResult = await supabaseService.getPublicUrl(this.bucketName, fileName);
            
            if (!urlResult.success) {
                throw new Error('Failed to get avatar URL');
            }

            // Update user profile with new avatar URL
            const updateResult = await this.updateProfileAvatar(userId, urlResult.publicUrl);
            
            if (!updateResult.success) {
                throw new Error('Failed to update profile with avatar URL');
            }

            console.log('✅ Avatar uploaded successfully');
            return {
                success: true,
                avatarUrl: urlResult.publicUrl,
                fileName: fileName
            };

        } catch (error) {
            console.error('❌ Avatar upload failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate uploaded file
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
     * Process image (resize and compress)
     * @param {File} file - Original image file
     * @returns {Promise<File>} Processed image file
     */
    async processImage(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Set target dimensions (square, max 400x400)
                const maxSize = 400;
                const size = Math.min(img.width, img.height, maxSize);
                
                canvas.width = size;
                canvas.height = size;

                // Calculate crop position for center crop
                const cropX = (img.width - size) / 2;
                const cropY = (img.height - size) / 2;

                // Draw cropped and resized image
                ctx.drawImage(img, cropX, cropY, size, size, 0, 0, size, size);

                // Convert to blob with compression
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Create new file from blob
                            const processedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(processedFile);
                        } else {
                            reject(new Error('Failed to process image'));
                        }
                    },
                    'image/jpeg',
                    0.85 // 85% quality
                );
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Generate unique filename for avatar
     * @param {string} userId - User ID
     * @param {string} fileType - File MIME type
     * @returns {string} Generated filename
     */
    generateFileName(userId, fileType) {
        const timestamp = Date.now();
        const extension = fileType.split('/')[1] || 'jpg';
        return `${userId}/avatar_${timestamp}.${extension}`;
    }

    /**
     * Update user profile with new avatar URL
     * @param {string} userId - User ID
     * @param {string} avatarUrl - New avatar URL
     * @returns {Promise<Object>} Update result
     */
    async updateProfileAvatar(userId, avatarUrl) {
        try {
            const result = await supabaseService.update(
                'profiles',
                { avatar_url: avatarUrl, updated_at: new Date().toISOString() },
                { user_id: userId }
            );

            return result;
        } catch (error) {
            console.error('Failed to update profile avatar:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete avatar from storage and profile
     * @param {string} userId - User ID
     * @param {string} fileName - Avatar filename to delete
     * @returns {Promise<Object>} Delete result
     */
    async deleteAvatar(userId, fileName) {
        try {
            console.log('🔄 Deleting avatar...');

            // Delete from storage
            const deleteResult = await supabaseService.deleteFile(this.bucketName, fileName);
            
            if (!deleteResult.success) {
                console.warn('Failed to delete avatar file:', deleteResult.error);
            }

            // Remove avatar URL from profile
            const updateResult = await supabaseService.update(
                'profiles',
                { avatar_url: null, updated_at: new Date().toISOString() },
                { user_id: userId }
            );

            if (!updateResult.success) {
                throw new Error('Failed to update profile');
            }

            console.log('✅ Avatar deleted successfully');
            return { success: true };

        } catch (error) {
            console.error('❌ Avatar deletion failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current user avatar URL
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Avatar URL result
     */
    async getCurrentAvatar(userId) {
        try {
            const result = await supabaseService.select('profiles', {
                select: 'avatar_url',
                eq: { user_id: userId }
            });

            if (!result.success || result.data.length === 0) {
                return { success: false, error: 'Profile not found' };
            }

            return {
                success: true,
                avatarUrl: result.data[0].avatar_url
            };

        } catch (error) {
            console.error('Failed to get current avatar:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create avatar preview from file
     * @param {File} file - Image file
     * @returns {Promise<string>} Data URL for preview
     */
    async createPreview(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }
}

// Create and export singleton instance
const avatarService = new AvatarService();
export { avatarService };
export default avatarService;
