/**
 * User Profile Service
 * Handles all user profile-related operations including data fetching, updating, and management
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

class ProfileService {
    constructor() {
        this.currentProfile = null;
        this.profileCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get current user's profile
     * @returns {Promise<Object>} User profile data
     */
    async getCurrentUserProfile() {
        try {
            // Get current user from auth
            const userResponse = await supabaseService.getCurrentUser();
            if (!userResponse.success || !userResponse.user) {
                throw new Error('User not authenticated');
            }

            const user = userResponse.user;
            const cacheKey = `profile_${user.id}`;

            // Check cache first
            if (this.profileCache.has(cacheKey)) {
                const cached = this.profileCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return { success: true, data: cached.data };
                }
            }

            // Fetch profile from database
            const profileResponse = await supabaseService.select('profiles', {
                eq: { user_id: user.id }
            });

            if (!profileResponse.success) {
                throw new Error('Failed to fetch profile');
            }

            if (profileResponse.data.length === 0) {
                // Profile doesn't exist, create one
                console.log('Profile not found, creating new profile...');
                const createResult = await this.createProfile(user.id, user.email);
                if (!createResult.success) {
                    throw new Error('Failed to create profile');
                }
                // Fetch the newly created profile
                const newProfileResponse = await supabaseService.select('profiles', {
                    eq: { user_id: user.id }
                });
                if (!newProfileResponse.success || newProfileResponse.data.length === 0) {
                    throw new Error('Failed to fetch newly created profile');
                }
                profileResponse.data = newProfileResponse.data;
            }

            const profile = {
                ...profileResponse.data[0],
                email: user.email,
                emailVerified: user.email_confirmed_at !== null,
                lastSignIn: user.last_sign_in_at,
                createdAt: user.created_at
            };

            // Cache the result
            this.profileCache.set(cacheKey, {
                data: profile,
                timestamp: Date.now()
            });

            this.currentProfile = profile;
            return { success: true, data: profile };

        } catch (error) {
            console.error('Get current user profile error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create a new profile for a user
     * @param {string} userId - User ID
     * @param {string} email - User email
     * @returns {Promise<Object>} Create result
     */
    async createProfile(userId, email) {
        try {
            const profileData = {
                user_id: userId,
                email: email,
                first_name: '',
                last_name: '',
                role: 'buyer', // Default role
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const result = await supabaseService.insert('profiles', profileData);

            if (!result.success) {
                throw new Error('Failed to create profile');
            }

            console.log('✅ Profile created successfully');
            return { success: true, data: result.data };

        } catch (error) {
            console.error('Create profile error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update user profile information
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Update result
     */
    async updateProfile(profileData) {
        try {
            // Get current user
            const userResponse = await supabaseService.getCurrentUser();
            if (!userResponse.success || !userResponse.user) {
                throw new Error('User not authenticated');
            }

            const userId = userResponse.user.id;

            // Prepare update data
            const updateData = {
                ...profileData,
                updated_at: new Date().toISOString()
            };

            // Remove fields that shouldn't be updated directly
            delete updateData.id;
            delete updateData.user_id;
            delete updateData.email;
            delete updateData.emailVerified;
            delete updateData.lastSignIn;
            delete updateData.createdAt;

            // Update profile in database
            const result = await supabaseService.update('profiles', updateData, {
                user_id: userId
            });

            if (!result.success) {
                throw new Error('Failed to update profile');
            }

            // Clear cache
            this.clearCache(userId);

            // Refresh current profile
            await this.getCurrentUserProfile();

            return { success: true, data: result.data };

        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Upload and update user avatar
     * @param {File} file - Avatar image file
     * @returns {Promise<Object>} Upload result
     */
    async uploadAvatar(file) {
        try {
            // Validate file
            if (!file) {
                throw new Error('No file provided');
            }

            if (!file.type.startsWith('image/')) {
                throw new Error('File must be an image');
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                throw new Error('File size must be less than 5MB');
            }

            // Get current user
            const userResponse = await supabaseService.getCurrentUser();
            if (!userResponse.success || !userResponse.user) {
                throw new Error('User not authenticated');
            }

            const userId = userResponse.user.id;
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/avatar.${fileExt}`;

            // Upload to Supabase storage
            const uploadResult = await supabaseService.uploadFile('avatars', fileName, file);
            
            if (!uploadResult.success) {
                throw new Error('Failed to upload avatar');
            }

            // Get public URL
            const urlResult = await supabaseService.getPublicUrl('avatars', fileName);
            
            if (!urlResult.success) {
                throw new Error('Failed to get avatar URL');
            }

            // Update profile with new avatar URL
            const updateResult = await this.updateProfile({
                avatar_url: urlResult.publicUrl
            });

            if (!updateResult.success) {
                throw new Error('Failed to update profile with avatar URL');
            }

            return { 
                success: true, 
                data: { 
                    avatarUrl: urlResult.publicUrl,
                    fileName: fileName
                }
            };

        } catch (error) {
            console.error('Upload avatar error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update user preferences
     * @param {Object} preferences - User preferences
     * @returns {Promise<Object>} Update result
     */
    async updatePreferences(preferences) {
        try {
            // Get current profile
            const profileResult = await this.getCurrentUserProfile();
            if (!profileResult.success) {
                throw new Error('Failed to get current profile');
            }

            const currentProfile = profileResult.data;
            const currentDetails = currentProfile.business_details || {};

            // Merge preferences with existing business details
            const updatedDetails = {
                ...currentDetails,
                preferences: {
                    ...currentDetails.preferences,
                    ...preferences
                }
            };

            // Update profile
            const result = await this.updateProfile({
                business_details: updatedDetails
            });

            return result;

        } catch (error) {
            console.error('Update preferences error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Change result
     */
    async changePassword(currentPassword, newPassword) {
        try {
            // Validate passwords
            if (!currentPassword || !newPassword) {
                throw new Error('Both current and new passwords are required');
            }

            if (newPassword.length < 6) {
                throw new Error('New password must be at least 6 characters long');
            }

            // Use Supabase auth to update password
            const result = await supabaseService.updatePassword(newPassword);

            if (!result.success) {
                throw new Error(result.error || 'Failed to update password');
            }

            return { success: true, message: 'Password updated successfully' };

        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Resend email verification
     * @returns {Promise<Object>} Resend result
     */
    async resendEmailVerification() {
        try {
            const result = await supabaseService.resendEmailConfirmation();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to resend verification email');
            }

            return { success: true, message: 'Verification email sent successfully' };

        } catch (error) {
            console.error('Resend email verification error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete user account
     * @param {string} confirmationText - Confirmation text
     * @returns {Promise<Object>} Delete result
     */
    async deleteAccount(confirmationText) {
        try {
            if (confirmationText !== 'DELETE') {
                throw new Error('Invalid confirmation text');
            }

            // Get current user
            const userResponse = await supabaseService.getCurrentUser();
            if (!userResponse.success || !userResponse.user) {
                throw new Error('User not authenticated');
            }

            const userId = userResponse.user.id;

            // Delete profile (this will cascade delete related data due to foreign key constraints)
            const deleteResult = await supabaseService.delete('profiles', {
                user_id: userId
            });

            if (!deleteResult.success) {
                throw new Error('Failed to delete profile');
            }

            // Sign out user
            await supabaseService.signOut();

            // Clear cache
            this.clearCache(userId);
            this.currentProfile = null;

            return { success: true, message: 'Account deleted successfully' };

        } catch (error) {
            console.error('Delete account error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get profile by user ID (for viewing other users)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Profile data
     */
    async getProfileById(userId) {
        try {
            const cacheKey = `profile_${userId}`;

            // Check cache first
            if (this.profileCache.has(cacheKey)) {
                const cached = this.profileCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return { success: true, data: cached.data };
                }
            }

            // Fetch profile from database
            const profileResponse = await supabaseService.select('profiles', {
                eq: { user_id: userId }
            });

            if (!profileResponse.success) {
                throw new Error('Failed to fetch profile');
            }

            if (profileResponse.data.length === 0) {
                throw new Error('Profile not found');
            }

            const profile = profileResponse.data[0];

            // Cache the result
            this.profileCache.set(cacheKey, {
                data: profile,
                timestamp: Date.now()
            });

            return { success: true, data: profile };

        } catch (error) {
            console.error('Get profile by ID error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Clear profile cache
     * @param {string} userId - Optional user ID to clear specific cache
     */
    clearCache(userId = null) {
        if (userId) {
            this.profileCache.delete(`profile_${userId}`);
        } else {
            this.profileCache.clear();
        }
    }

    /**
     * Get cached profile
     * @returns {Object|null} Cached profile or null
     */
    getCachedProfile() {
        return this.currentProfile;
    }
}

// Export singleton instance
export const profileService = new ProfileService();
export default profileService;
