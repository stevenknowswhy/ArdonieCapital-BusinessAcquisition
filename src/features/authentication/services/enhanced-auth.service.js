/**
 * Enhanced Authentication Service with Multi-Role Support
 * Integrates with the new multi-role database schema
 * Backward compatible with existing single-role system
 */

import { supabaseService } from '../../../shared/services/supabase/index.js';
import { MultiRoleAuthService } from './multi-role-auth.service.js';

export class EnhancedAuthService {
    constructor() {
        this.apiBase = '/api/auth';
        this.tokenKey = 'ardonie_auth_token';
        this.userKey = 'ardonie_user_data';
        this.sessionKey = 'ardonie_user_session';
        this.activeRoleKey = 'ardonie_active_role';
        this.multiRoleService = new MultiRoleAuthService();
        this.isInitialized = false;
    }

    /**
     * Initialize the enhanced authentication service
     */
    async init() {
        try {
            console.log('🔐 Initializing Enhanced Authentication Service...');
            
            // Initialize Supabase service
            if (!supabaseService.isInitialized) {
                await supabaseService.init();
            }
            
            this.isInitialized = true;
            console.log('✅ Enhanced Authentication Service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Authentication Service:', error);
            throw error;
        }
    }

    /**
     * Enhanced login with multi-role support
     */
    async login(email, password, rememberMe = false) {
        try {
            console.log('🔐 Enhanced Auth: Starting login for:', email);

            // Ensure service is initialized
            if (!this.isInitialized) {
                await this.init();
            }

            // Authenticate with Supabase
            const authResponse = await supabaseService.signIn(email, password);
            
            if (!authResponse.success) {
                throw new Error(authResponse.error || 'Authentication failed');
            }

            const user = authResponse.data.user;
            const session = authResponse.data.session;

            // Get user profile and roles
            const userProfile = await this.getUserProfile(user.id);
            const userRoles = await this.getUserRoles(user.id);
            const userSubscription = await this.getUserSubscription(user.id);

            // Determine authentication flow
            const authFlow = this.determineAuthFlow(userProfile, userRoles);

            // Create enhanced user object
            const userData = {
                id: user.id,
                email: user.email,
                firstName: userProfile?.first_name || '',
                lastName: userProfile?.last_name || '',
                profile: userProfile,
                roles: userRoles,
                subscription: userSubscription,
                authFlow: authFlow,
                session: session,
                verified: user.email_confirmed_at !== null,
                createdAt: user.created_at
            };

            // Handle different authentication flows
            if (authFlow.type === 'single_role' || authFlow.type === 'legacy_single_role') {
                // Direct redirect for single role users
                userData.selectedRole = authFlow.role;
                await this.setActiveRole(user.id, authFlow.role);
            } else if (authFlow.type === 'multi_role') {
                // Multi-role users need role selection
                userData.needsRoleSelection = true;
            }

            // Store user data
            this.storeUserData(userData, rememberMe);

            // Update user session
            await this.updateUserSession(user.id, userData.selectedRole);

            console.log('✅ Enhanced login completed successfully');

            return {
                success: true,
                user: userData,
                authFlow: authFlow,
                redirectUrl: authFlow.redirectUrl || this.getDefaultRedirectUrl(userData)
            };

        } catch (error) {
            console.error('❌ Enhanced login error:', error);
            throw error;
        }
    }

    /**
     * Enhanced registration with multi-role support
     */
    async register(userData) {
        try {
            console.log('📝 Enhanced Auth: Starting registration for:', userData.email);

            // Ensure service is initialized
            if (!this.isInitialized) {
                await this.init();
            }

            // Register with Supabase
            const authResponse = await supabaseService.signUp(
                userData.email,
                userData.password,
                {
                    first_name: userData.firstName,
                    last_name: userData.lastName
                }
            );

            if (!authResponse.success) {
                throw new Error(authResponse.error || 'Registration failed');
            }

            const user = authResponse.data.user;

            // Create user profile
            const profileData = {
                user_id: user.id,
                first_name: userData.firstName,
                last_name: userData.lastName,
                company: userData.company || '',
                phone: userData.phone || '',
                onboarding_completed: false,
                onboarding_step: 0,
                migration_status: 'verified' // New users are already in new system
            };

            const profileResponse = await supabaseService.insert('profiles', profileData);
            if (!profileResponse.success) {
                throw new Error('Failed to create user profile');
            }

            // Assign default subscription tier (free)
            await this.assignDefaultSubscription(user.id);

            // Assign user roles based on registration data
            if (userData.userTypes && userData.userTypes.length > 0) {
                await this.assignUserRoles(user.id, userData.userTypes);
            } else {
                // Default to buyer role
                await this.assignUserRoles(user.id, ['buyer']);
            }

            console.log('✅ Enhanced registration completed successfully');

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    needsEmailVerification: !user.email_confirmed_at
                }
            };

        } catch (error) {
            console.error('❌ Enhanced registration error:', error);
            throw error;
        }
    }

    /**
     * Get user profile from database
     */
    async getUserProfile(userId) {
        try {
            const response = await supabaseService.select('profiles', {
                eq: { user_id: userId }
            });

            if (response.success && response.data.length > 0) {
                return response.data[0];
            }
            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    /**
     * Get user roles from database
     */
    async getUserRoles(userId) {
        try {
            const response = await supabaseService.select('user_roles', {
                eq: { user_id: userId, is_active: true },
                join: {
                    table: 'roles',
                    on: 'role_id',
                    select: ['id', 'name', 'slug', 'category', 'permissions']
                }
            });

            if (response.success) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching user roles:', error);
            return [];
        }
    }

    /**
     * Get user subscription information
     */
    async getUserSubscription(userId) {
        try {
            const response = await supabaseService.select('user_subscriptions', {
                eq: { user_id: userId, status: 'active' },
                join: {
                    table: 'subscription_tiers',
                    on: 'tier_id',
                    select: ['id', 'name', 'slug', 'features', 'limits']
                }
            });

            if (response.success && response.data.length > 0) {
                return response.data[0];
            }
            
            // Return default free tier if no subscription found
            return {
                tier: { slug: 'free', name: 'Free', features: {}, limits: {} },
                status: 'active'
            };
        } catch (error) {
            console.error('Error fetching user subscription:', error);
            return { tier: { slug: 'free' }, status: 'active' };
        }
    }

    /**
     * Determine authentication flow based on user roles
     */
    determineAuthFlow(userProfile, userRoles) {
        // Handle legacy users (backward compatibility)
        if (userRoles.length === 0 && userProfile?.role) {
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

        // Single role - direct redirect
        if (userRoles.length === 1) {
            const role = userRoles[0].roles || userRoles[0];
            return {
                type: 'single_role',
                action: 'direct_redirect',
                role: role.slug,
                redirectUrl: this.getRedirectUrlForRole(role.slug)
            };
        }

        // Multiple roles - show role selection
        return {
            type: 'multi_role',
            action: 'show_role_selection',
            roles: userRoles,
            redirectUrl: '/dashboard/role-selection.html'
        };
    }

    /**
     * Get redirect URL for legacy roles
     */
    getRedirectUrlForLegacyRole(role) {
        const roleUrls = {
            'buyer': '/dashboard/buyer-dashboard.html',
            'seller': '/dashboard/seller-dashboard.html',
            'admin': '/dashboard/super-admin-dashboard.html'
        };
        return roleUrls[role] || '/dashboard/';
    }

    /**
     * Get redirect URL for new role system
     */
    getRedirectUrlForRole(roleSlug) {
        const roleUrls = {
            'buyer': '/dashboard/buyer-dashboard.html',
            'seller': '/dashboard/seller-dashboard.html',
            'vendor': '/dashboard/vendor-dashboard.html',
            'financial_professional': '/dashboard/vendor-dashboard.html',
            'legal_professional': '/dashboard/vendor-dashboard.html',
            'super_admin': '/dashboard/super-admin-dashboard.html',
            'company_admin': '/dashboard/admin-dashboard.html',
            'blog_editor': '/dashboard/content-management.html',
            'blog_contributor': '/dashboard/content-management.html'
        };
        return roleUrls[roleSlug] || '/dashboard/';
    }

    /**
     * Get default redirect URL
     */
    getDefaultRedirectUrl(userData) {
        if (userData.needsRoleSelection) {
            return '/dashboard/role-selection.html';
        }
        if (userData.selectedRole) {
            return this.getRedirectUrlForRole(userData.selectedRole);
        }
        return '/dashboard/';
    }

    /**
     * Store user data in localStorage/sessionStorage
     */
    storeUserData(userData, rememberMe = false) {
        const storage = rememberMe ? localStorage : sessionStorage;
        
        // Store main user data
        storage.setItem(this.userKey, JSON.stringify(userData));
        
        // Store session token if available
        if (userData.session?.access_token) {
            storage.setItem(this.tokenKey, userData.session.access_token);
        }
        
        // Store active role if selected
        if (userData.selectedRole) {
            storage.setItem(this.activeRoleKey, userData.selectedRole);
        }
    }

    /**
     * Assign default subscription tier to new user
     */
    async assignDefaultSubscription(userId) {
        try {
            // Get free tier ID
            const tierResponse = await supabaseService.select('subscription_tiers', {
                eq: { slug: 'free' }
            });

            if (tierResponse.success && tierResponse.data.length > 0) {
                const freeTier = tierResponse.data[0];
                
                // Create subscription record
                await supabaseService.insert('user_subscriptions', {
                    user_id: userId,
                    tier_id: freeTier.id,
                    status: 'active',
                    started_at: new Date().toISOString(),
                    billing_cycle: 'monthly',
                    auto_renew: false
                });

                // Update profile with subscription info
                await supabaseService.update('profiles', 
                    { 
                        subscription_tier_id: freeTier.id,
                        subscription_status: 'free'
                    },
                    { user_id: userId }
                );
            }
        } catch (error) {
            console.error('Error assigning default subscription:', error);
        }
    }

    /**
     * Assign roles to user
     */
    async assignUserRoles(userId, roleTypes) {
        try {
            // Get default company ID
            const companyResponse = await supabaseService.select('companies', {
                eq: { slug: 'ardonie-capital' }
            });

            const defaultCompanyId = companyResponse.success && companyResponse.data.length > 0 
                ? companyResponse.data[0].id 
                : null;

            // Map role types to role IDs
            for (const roleType of roleTypes) {
                const roleResponse = await supabaseService.select('roles', {
                    eq: { slug: roleType }
                });

                if (roleResponse.success && roleResponse.data.length > 0) {
                    const role = roleResponse.data[0];
                    
                    // Assign role to user
                    await supabaseService.insert('user_roles', {
                        user_id: userId,
                        role_id: role.id,
                        company_id: defaultCompanyId,
                        assigned_by: userId, // Self-assigned during registration
                        is_active: true,
                        metadata: { registration: true, role_type: roleType }
                    });
                }
            }
        } catch (error) {
            console.error('Error assigning user roles:', error);
        }
    }

    /**
     * Set active role for user session
     */
    async setActiveRole(userId, roleSlug) {
        try {
            // Get role ID
            const roleResponse = await supabaseService.select('roles', {
                eq: { slug: roleSlug }
            });

            if (roleResponse.success && roleResponse.data.length > 0) {
                const role = roleResponse.data[0];
                
                // Update or create user session
                await supabaseService.upsert('user_sessions', {
                    user_id: userId,
                    active_role_id: role.id,
                    last_role_switch: new Date().toISOString()
                });

                // Store in local storage
                localStorage.setItem(this.activeRoleKey, roleSlug);
            }
        } catch (error) {
            console.error('Error setting active role:', error);
        }
    }

    /**
     * Update user session information
     */
    async updateUserSession(userId, activeRole = null) {
        try {
            const sessionData = {
                user_id: userId,
                last_role_switch: new Date().toISOString(),
                preferences: { last_login: new Date().toISOString() }
            };

            if (activeRole) {
                const roleResponse = await supabaseService.select('roles', {
                    eq: { slug: activeRole }
                });

                if (roleResponse.success && roleResponse.data.length > 0) {
                    sessionData.active_role_id = roleResponse.data[0].id;
                }
            }

            await supabaseService.upsert('user_sessions', sessionData);
        } catch (error) {
            console.error('Error updating user session:', error);
        }
    }

    /**
     * Get current authenticated user with enhanced role information
     */
    async getCurrentUser() {
        try {
            // Check if user is authenticated with Supabase
            const sessionResponse = await supabaseService.getCurrentSession();
            if (!sessionResponse.success || !sessionResponse.session) {
                return null;
            }

            const user = sessionResponse.session.user;

            // Get enhanced user data
            const userProfile = await this.getUserProfile(user.id);
            const userRoles = await this.getUserRoles(user.id);
            const userSubscription = await this.getUserSubscription(user.id);

            // Get active role from session
            const activeRole = localStorage.getItem(this.activeRoleKey);

            return {
                id: user.id,
                email: user.email,
                firstName: userProfile?.first_name || '',
                lastName: userProfile?.last_name || '',
                profile: userProfile,
                roles: userRoles,
                subscription: userSubscription,
                selectedRole: activeRole,
                verified: user.email_confirmed_at !== null,
                createdAt: user.created_at
            };

        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Check if user has specific role
     */
    hasRole(roleSlug) {
        const userData = JSON.parse(localStorage.getItem(this.userKey) || '{}');
        
        if (userData.roles && Array.isArray(userData.roles)) {
            return userData.roles.some(ur => {
                const role = ur.roles || ur;
                return role.slug === roleSlug;
            });
        }

        // Backward compatibility check
        return userData.role === roleSlug || userData.selectedRole === roleSlug;
    }

    /**
     * Check if user has admin privileges
     */
    isAdmin() {
        return this.hasRole('super_admin') || 
               this.hasRole('company_admin') || 
               this.hasRole('admin'); // Legacy admin role
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
        const userData = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
        return !!(token && userData);
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Sign out from Supabase
            await supabaseService.signOut();
            
            // Clear local storage
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
            localStorage.removeItem(this.activeRoleKey);
            sessionStorage.removeItem(this.tokenKey);
            sessionStorage.removeItem(this.userKey);
            sessionStorage.removeItem(this.activeRoleKey);
            
            console.log('✅ User logged out successfully');
            
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            throw error;
        }
    }
}

// Create and export singleton instance
export const enhancedAuthService = new EnhancedAuthService();
