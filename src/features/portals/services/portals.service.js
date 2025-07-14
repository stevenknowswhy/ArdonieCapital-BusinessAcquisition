
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
 * Portals Service
 * Handles portal management, access control, and customization
 */

export class PortalsService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
        this.baseUrl = '/api/portals';
        this.isInitialized = false;
        this.currentPortal = null;
        this.userPermissions = [];
    }

    /**
     * Initialize the portals service
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('Initializing Portals Service...');
            await this.loadUserPermissions();
            this.isInitialized = true;
            console.log('✅ Portals Service initialized successfully');
        } catch (error) {
            console.error('❌ Portals Service initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load user permissions for portal access
     */
    async loadUserPermissions() {
        try {
            const response = await fetch(`${this.baseUrl}/permissions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.userPermissions = result.permissions || [];
            } else {
                console.warn('Could not load user permissions, using defaults');
                this.userPermissions = [];
            }
        } catch (error) {
            console.warn('Error loading permissions:', error);
            this.userPermissions = [];
        }
    }

    /**
     * Get available portals for the current user
     */
    async getAvailablePortals() {
        const cacheKey = 'available_portals';
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }

        try {
            const response = await fetch(`${this.baseUrl}/available`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const portals = await response.json();
            
            // Cache the result
            this.setCachedData(cacheKey, portals);

            return { success: true, data: portals };

        } catch (error) {
            console.error('Error fetching available portals:', error);
            
            // Return default portals based on user role
            const defaultPortals = this.getDefaultPortals();
            return {
                success: false,
                error: error.message,
                data: defaultPortals
            };
        }
    }

    /**
     * Get portal configuration
     */
    async getPortalConfig(portalType) {
        const cacheKey = `portal_config_${portalType}`;
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }

        try {
            const response = await fetch(`${this.baseUrl}/${portalType}/config`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const config = await response.json();
            
            // Cache the result
            this.setCachedData(cacheKey, config);

            return { success: true, data: config };

        } catch (error) {
            console.error('Error fetching portal config:', error);
            return {
                success: false,
                error: error.message,
                data: this.getDefaultPortalConfig(portalType)
            };
        }
    }

    /**
     * Set current portal
     */
    async setCurrentPortal(portalType) {
        // Validate portal access
        const hasAccess = await this.hasPortalAccess(portalType);
        if (!hasAccess) {
            return {
                success: false,
                error: 'Access denied to this portal'
            };
        }

        try {
            // Get portal configuration
            const configResult = await this.getPortalConfig(portalType);
            if (!configResult.success) {
                throw new Error(configResult.error);
            }

            this.currentPortal = {
                type: portalType,
                config: configResult.data,
                timestamp: Date.now()
            };

            // Track portal access
            await this.trackPortalAccess(portalType);

            return {
                success: true,
                portal: this.currentPortal
            };

        } catch (error) {
            console.error('Error setting current portal:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get portal dashboard data
     */
    async getPortalDashboard(portalType) {
        const cacheKey = `portal_dashboard_${portalType}`;
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }

        try {
            const response = await fetch(`${this.baseUrl}/${portalType}/dashboard`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const dashboard = await response.json();
            
            // Cache the result
            this.setCachedData(cacheKey, dashboard);

            return { success: true, data: dashboard };

        } catch (error) {
            console.error('Error fetching portal dashboard:', error);
            return {
                success: false,
                error: error.message,
                data: this.getDefaultDashboard(portalType)
            };
        }
    }

    /**
     * Update portal preferences
     */
    async updatePortalPreferences(portalType, preferences) {
        try {
            const response = await fetch(`${this.baseUrl}/${portalType}/preferences`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(preferences)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Clear cache to refresh portal data
            this.clearPortalCache(portalType);

            return { success: true, data: result };

        } catch (error) {
            console.error('Error updating portal preferences:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get portal analytics
     */
    async getPortalAnalytics(portalType, timeframe = '30d') {
        try {
            const response = await fetch(`${this.baseUrl}/${portalType}/analytics?timeframe=${timeframe}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const analytics = await response.json();

            return { success: true, data: analytics };

        } catch (error) {
            console.error('Error fetching portal analytics:', error);
            return {
                success: false,
                error: error.message,
                data: {}
            };
        }
    }

    /**
     * Check portal access permissions
     */
    async hasPortalAccess(portalType) {
        // Check if user has specific portal permission
        const hasPermission = this.userPermissions.includes(`access-${portalType}-portal`) ||
                             this.userPermissions.includes('access-all-portals') ||
                             this.userPermissions.includes('admin');

        if (hasPermission) return true;

        // Check role-based access
        const userRole = this.getCurrentUserRole();
        if (userRole === 'admin') return true;
        if (userRole === portalType) return true;

        return false;
    }

    /**
     * Track portal access for analytics
     */
    async trackPortalAccess(portalType) {
        try {
            await fetch(`${this.baseUrl}/analytics/access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify({
                    portalType,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            });
        } catch (error) {
            console.warn('Failed to track portal access:', error);
        }
    }

    /**
     * Get default portals based on user role
     */
    getDefaultPortals() {
        const userRole = this.getCurrentUserRole();
        
        const defaultPortals = [
            {
                type: 'buyer',
                name: 'Buyer Portal',
                description: 'Search and purchase businesses',
                available: ['buyer', 'admin'].includes(userRole)
            },
            {
                type: 'seller',
                name: 'Seller Portal',
                description: 'List and manage business sales',
                available: ['seller', 'admin'].includes(userRole)
            }
        ];

        return defaultPortals.filter(portal => portal.available);
    }

    /**
     * Get default portal configuration
     */
    getDefaultPortalConfig(portalType) {
        const configs = {
            buyer: {
                theme: 'blue',
                layout: 'grid',
                features: ['search', 'saved-listings', 'inquiries'],
                widgets: ['recent-searches', 'saved-listings', 'recommendations']
            },
            seller: {
                theme: 'green',
                layout: 'list',
                features: ['listings-management', 'inquiries', 'analytics'],
                widgets: ['active-listings', 'recent-inquiries', 'performance']
            },
            accountant: {
                theme: 'purple',
                layout: 'dashboard',
                features: ['client-management', 'financial-analysis', 'reports'],
                widgets: ['client-overview', 'financial-summary', 'reports']
            }
        };

        return configs[portalType] || configs.buyer;
    }

    /**
     * Get default dashboard data
     */
    getDefaultDashboard(portalType) {
        const dashboards = {
            buyer: {
                widgets: [
                    { type: 'search', title: 'Quick Search', data: {} },
                    { type: 'saved', title: 'Saved Listings', data: { count: 0 } },
                    { type: 'recommendations', title: 'Recommendations', data: { items: [] } }
                ]
            },
            seller: {
                widgets: [
                    { type: 'listings', title: 'Active Listings', data: { count: 0 } },
                    { type: 'inquiries', title: 'Recent Inquiries', data: { count: 0 } },
                    { type: 'analytics', title: 'Performance', data: { views: 0 } }
                ]
            }
        };

        return dashboards[portalType] || dashboards.buyer;
    }

    /**
     * Utility methods
     */
    getCurrentUserRole() {
        // Get from auth service or localStorage
        const user = JSON.parse(localStorage.getItem('current_user') || '{}');
        return user.role || 'buyer';
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getCachedData(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clearPortalCache(portalType) {
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (key.includes(portalType)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    clearCache() {
        this.cache.clear();
    }

    getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}
