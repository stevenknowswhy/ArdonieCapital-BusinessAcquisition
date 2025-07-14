// Ardonie Capital - Multi-Role Authentication Service
// Enhanced authentication system supporting multiple user roles
// Backward compatible with existing single-role system

import { supabaseService } from '../../../shared/services/supabase/index.js';

export class MultiRoleAuthService {
    constructor() {
        this.apiBase = '/api/auth';
        this.tokenKey = 'ardonie_auth_token';
        this.userKey = 'ardonie_user_data';
        this.sessionKey = 'ardonie_user_session';
        this.activeRoleKey = 'ardonie_active_role';
        this.multiRoleKey = 'ardonie_user_roles';
    }

    /**
     * Enhanced login with multi-role support
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {boolean} rememberMe - Whether to remember the user
     * @returns {Promise<Object>} Login result with role information
     */
    async login(email, password, rememberMe = false) {
        try {
            console.log('🔐 Multi-Role Auth: Starting login for:', email);

            // Authenticate with Supabase
            const authResponse = await supabaseService.signIn(email, password);
            
            if (!authResponse.success) {
                throw new Error(authResponse.error || 'Authentication failed');
            }

            const { user: authUser, session } = authResponse.data;

            // Get user profile and roles
            const userProfile = await this.getUserProfile(authUser.id);
            const userRoles = await this.getUserRoles(authUser.id);

            console.log('👤 User profile:', userProfile);
            console.log('🎭 User roles:', userRoles);

            // Determine authentication flow
            const authFlow = this.determineAuthFlow(userProfile, userRoles);
            
            // Store authentication data
            await this.storeAuthData(session.access_token, authUser, userProfile, userRoles, rememberMe);

            // Create audit log entry
            await this.logAuthAction('login_success', authUser.id, {
                email: email,
                roles_count: userRoles.length,
                auth_flow: authFlow.type
            });

            console.log('✅ Multi-Role Auth: Login successful');
            
            return {
                success: true,
                user: authUser,
                profile: userProfile,
                roles: userRoles,
                authFlow: authFlow,
                token: session.access_token,
                message: 'Login successful'
            };

        } catch (error) {
            console.error('❌ Multi-Role Auth: Login error:', error);
            
            // Log failed attempt
            await this.logAuthAction('login_failed', null, {
                email: email,
                error: error.message
            });
            
            throw error;
        }
    }

    /**
     * Get user profile from database
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile
     */
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabaseService.client
                .from('profiles')
                .select(`
                    *,
                    companies (
                        id,
                        name,
                        slug
                    )
                `)
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw new Error('Failed to fetch user profile');
        }
    }

    /**
     * Get user roles from database
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of user roles
     */
    async getUserRoles(userId) {
        try {
            const { data, error } = await supabaseService.client
                .from('user_roles')
                .select(`
                    *,
                    roles (
                        id,
                        name,
                        slug,
                        description,
                        category,
                        permissions
                    ),
                    companies (
                        id,
                        name,
                        slug
                    )
                `)
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('assigned_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user roles:', error);
            // Return empty array for backward compatibility
            return [];
        }
    }

    /**
     * Determine authentication flow based on user roles
     * @param {Object} userProfile - User profile data
     * @param {Array} userRoles - User roles array
     * @returns {Object} Authentication flow information
     */
    determineAuthFlow(userProfile, userRoles) {
        // Handle legacy users (backward compatibility)
        if (userRoles.length === 0 && userProfile.role) {
            return {
                type: 'legacy_single_role',
                action: 'direct_redirect',
                role: userProfile.role,
                redirectUrl: this.getRedirectUrlForLegacyRole(userProfile.role)
            };
        }

        // Handle users with no roles
        if (userRoles.length === 0) {
            return {
                type: 'no_roles',
                action: 'contact_admin',
                message: 'No roles assigned. Please contact administrator.'
            };
        }

        // Handle single role users
        if (userRoles.length === 1) {
            const role = userRoles[0].roles;
            return {
                type: 'single_role',
                action: 'direct_redirect',
                role: role,
                redirectUrl: this.getRedirectUrlForRole(role.slug)
            };
        }

        // Handle multi-role users
        return {
            type: 'multi_role',
            action: 'role_selection',
            roles: userRoles.map(ur => ur.roles),
            message: 'Please select your role for this session'
        };
    }

    /**
     * Store authentication data with multi-role support
     * @param {string} token - Auth token
     * @param {Object} authUser - Authenticated user
     * @param {Object} userProfile - User profile
     * @param {Array} userRoles - User roles
     * @param {boolean} rememberMe - Remember preference
     */
    async storeAuthData(token, authUser, userProfile, userRoles, rememberMe) {
        const storage = rememberMe ? localStorage : sessionStorage;
        
        // Store basic auth data
        storage.setItem(this.tokenKey, token);
        storage.setItem('ardonie_auth_status', 'authenticated');
        
        // Store user data
        const userData = {
            id: authUser.id,
            email: authUser.email,
            firstName: userProfile.first_name,
            lastName: userProfile.last_name,
            profile: userProfile,
            roles: userRoles,
            isMultiRole: userRoles.length > 1,
            loginTime: new Date().toISOString()
        };
        
        storage.setItem(this.userKey, JSON.stringify(userData));
        storage.setItem(this.sessionKey, JSON.stringify(userData));
        storage.setItem(this.multiRoleKey, JSON.stringify(userRoles));

        // For backward compatibility, set legacy role if available
        if (userProfile.role) {
            userData.role = userProfile.role;
            userData.selectedRole = userProfile.role;
        }

        console.log('💾 Auth data stored successfully');
    }

    /**
     * Select active role for multi-role users
     * @param {string} roleSlug - Selected role slug
     * @param {string} companyId - Optional company ID
     * @returns {Promise<Object>} Role selection result
     */
    async selectActiveRole(roleSlug, companyId = null) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Find the selected role
            const selectedRole = currentUser.roles.find(ur => 
                ur.roles.slug === roleSlug && 
                (!companyId || ur.company_id === companyId)
            );

            if (!selectedRole) {
                throw new Error('Role not available for user');
            }

            // Update user session in database
            await this.updateUserSession(currentUser.id, selectedRole.roles.id, companyId);

            // Update stored user data
            const updatedUserData = {
                ...currentUser,
                activeRole: selectedRole.roles,
                activeCompany: selectedRole.companies,
                selectedRole: selectedRole.roles.slug,
                roleSelectionTime: new Date().toISOString()
            };

            // Update storage
            const storage = localStorage.getItem(this.userKey) ? localStorage : sessionStorage;
            storage.setItem(this.userKey, JSON.stringify(updatedUserData));
            storage.setItem(this.sessionKey, JSON.stringify(updatedUserData));
            storage.setItem(this.activeRoleKey, JSON.stringify(selectedRole.roles));

            // Log role selection
            await this.logAuthAction('role_selected', currentUser.id, {
                role_slug: roleSlug,
                company_id: companyId,
                role_name: selectedRole.roles.name
            });

            // Dispatch role change event
            document.dispatchEvent(new CustomEvent('roleChanged', {
                detail: { 
                    user: updatedUserData, 
                    role: selectedRole.roles,
                    company: selectedRole.companies
                }
            }));

            console.log('🎭 Active role selected:', selectedRole.roles.name);

            return {
                success: true,
                role: selectedRole.roles,
                company: selectedRole.companies,
                redirectUrl: this.getRedirectUrlForRole(roleSlug)
            };

        } catch (error) {
            console.error('Error selecting active role:', error);
            throw error;
        }
    }

    /**
     * Update user session in database
     * @param {string} userId - User ID
     * @param {string} roleId - Role ID
     * @param {string} companyId - Company ID
     */
    async updateUserSession(userId, roleId, companyId) {
        try {
            const { error } = await supabaseService.client
                .from('user_sessions')
                .upsert({
                    user_id: userId,
                    active_role_id: roleId,
                    company_id: companyId,
                    last_role_switch: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error updating user session:', error);
            // Don't throw - session update is not critical for auth flow
        }
    }

    /**
     * Get current user with role information
     * @returns {Object|null} Current user data
     */
    getCurrentUser() {
        try {
            const userData = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.sessionKey);
            const authStatus = localStorage.getItem('ardonie_auth_status') || sessionStorage.getItem('ardonie_auth_status');
            
            if (userData && authStatus === 'authenticated') {
                return JSON.parse(userData);
            }
            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Check if user has specific role
     * @param {string} roleSlug - Role slug to check
     * @returns {boolean} Whether user has the role
     */
    hasRole(roleSlug) {
        const user = this.getCurrentUser();
        if (!user) return false;

        // Check in new multi-role system
        if (user.roles && Array.isArray(user.roles)) {
            return user.roles.some(ur => ur.roles.slug === roleSlug);
        }

        // Backward compatibility check
        return user.role === roleSlug || user.selectedRole === roleSlug;
    }

    /**
     * Check if user has admin privileges
     * @returns {boolean} Whether user has admin access
     */
    isAdmin() {
        return this.hasRole('super_admin') || 
               this.hasRole('company_admin') || 
               this.hasRole('admin'); // Legacy admin role
    }

    /**
     * Get redirect URL for role
     * @param {string} roleSlug - Role slug
     * @returns {string} Redirect URL
     */
    getRedirectUrlForRole(roleSlug) {
        const roleRedirects = {
            'super_admin': '/dashboard/super-admin-dashboard.html',
            'company_admin': '/dashboard/company-admin-dashboard.html',
            'vendor': '/dashboard/vendor-dashboard.html',
            'seller': '/dashboard/seller-dashboard.html',
            'buyer': '/dashboard/buyer-dashboard.html',
            'blog_editor': '/dashboard/content-management.html',
            'blog_contributor': '/dashboard/content-management.html',
            // Legacy compatibility
            'admin': '/dashboard/super-admin-dashboard.html'
        };

        return roleRedirects[roleSlug] || '/dashboard/buyer-dashboard.html';
    }

    /**
     * Get redirect URL for legacy role (backward compatibility)
     * @param {string} role - Legacy role
     * @returns {string} Redirect URL
     */
    getRedirectUrlForLegacyRole(role) {
        const legacyRedirects = {
            'admin': '/dashboard/super-admin-dashboard.html',
            'seller': '/dashboard/seller-dashboard.html',
            'buyer': '/dashboard/buyer-dashboard.html'
        };

        return legacyRedirects[role] || '/dashboard/buyer-dashboard.html';
    }

    /**
     * Log authentication action
     * @param {string} action - Action type
     * @param {string} userId - User ID
     * @param {Object} details - Additional details
     */
    async logAuthAction(action, userId, details = {}) {
        try {
            await supabaseService.client
                .from('audit_log')
                .insert({
                    user_id: userId,
                    action: action,
                    details: details,
                    ip_address: await this.getClientIP(),
                    user_agent: navigator.userAgent
                });
        } catch (error) {
            console.error('Error logging auth action:', error);
            // Don't throw - logging is not critical
        }
    }

    /**
     * Get client IP address (simplified)
     * @returns {Promise<string>} IP address
     */
    async getClientIP() {
        try {
            // In a real implementation, you might use a service to get the IP
            return 'unknown';
        } catch {
            return 'unknown';
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            const user = this.getCurrentUser();
            
            // Log logout action
            if (user) {
                await this.logAuthAction('logout', user.id);
            }

            // Sign out from Supabase
            await supabaseService.signOut();

            // Clear all stored data
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
            localStorage.removeItem(this.sessionKey);
            localStorage.removeItem(this.activeRoleKey);
            localStorage.removeItem(this.multiRoleKey);
            localStorage.removeItem('ardonie_auth_status');
            
            sessionStorage.removeItem(this.tokenKey);
            sessionStorage.removeItem(this.userKey);
            sessionStorage.removeItem(this.sessionKey);
            sessionStorage.removeItem(this.activeRoleKey);
            sessionStorage.removeItem(this.multiRoleKey);
            sessionStorage.removeItem('ardonie_auth_status');

            // Dispatch logout event
            document.dispatchEvent(new CustomEvent('userLoggedOut'));

            console.log('👋 User logged out successfully');

        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        const authStatus = localStorage.getItem('ardonie_auth_status') || sessionStorage.getItem('ardonie_auth_status');
        const userData = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.sessionKey);
        
        return authStatus === 'authenticated' && userData !== null;
    }
}

}

// Create singleton instance
export const multiRoleAuthService = new MultiRoleAuthService();

// Global access for backward compatibility
window.MultiRoleAuthService = multiRoleAuthService;
