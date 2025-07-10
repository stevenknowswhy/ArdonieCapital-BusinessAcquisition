// Ardonie Capital - Admin Navigation Integration
// Automatically integrates admin navigation with existing pages
// Ensures consistent placement across the entire website

(function() {
    'use strict';

    // Admin Navigation Integration Manager
    window.AdminNavigationIntegration = {
        
        // Configuration
        config: {
            mainNavSelector: '#main-navigation-container',
            adminNavContainerId: 'admin-navigation-container',
            adminRoles: ['admin'], // Only 'admin' role exists in database enum
            autoInit: true,
            debugMode: false
        },

        // Initialize integration
        init: function() {
            this.log('🚀 Admin Navigation Integration: Starting initialization...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        },

        // Setup admin navigation integration
        setup: function() {
            this.log('🔧 Setting up admin navigation integration...');
            
            // Load required dependencies
            this.loadDependencies()
                .then(() => {
                    // Create admin navigation container
                    this.createAdminNavigationContainer();
                    
                    // Initialize admin navigation component
                    this.initializeAdminNavigation();
                    
                    // Setup event listeners
                    this.setupEventListeners();
                    
                    // Initial visibility check
                    this.checkAndUpdateVisibility();
                    
                    this.log('✅ Admin navigation integration complete');
                })
                .catch(error => {
                    console.error('❌ Admin Navigation Integration failed:', error);
                });
        },

        // Load required dependencies
        loadDependencies: function() {
            return new Promise((resolve, reject) => {
                const dependencies = [
                    '/components/admin-navigation.js',
                    '/assets/css/admin-navigation.css'
                ];

                let loadedCount = 0;
                const totalDependencies = dependencies.length;

                dependencies.forEach(dep => {
                    if (dep.endsWith('.js')) {
                        this.loadScript(dep)
                            .then(() => {
                                loadedCount++;
                                if (loadedCount === totalDependencies) resolve();
                            })
                            .catch(reject);
                    } else if (dep.endsWith('.css')) {
                        this.loadStylesheet(dep);
                        loadedCount++;
                        if (loadedCount === totalDependencies) resolve();
                    }
                });
            });
        },

        // Load JavaScript file
        loadScript: function(src) {
            return new Promise((resolve, reject) => {
                // Check if already loaded
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        },

        // Load CSS file
        loadStylesheet: function(href) {
            // Check if already loaded
            if (document.querySelector(`link[href="${href}"]`)) {
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        },

        // Create admin navigation container
        createAdminNavigationContainer: function() {
            this.log('📦 Creating admin navigation container...');
            
            // Check if container already exists
            if (document.getElementById(this.config.adminNavContainerId)) {
                this.log('ℹ️ Admin navigation container already exists');
                return;
            }

            // Find main navigation
            const mainNav = document.querySelector(this.config.mainNavSelector) || 
                           document.querySelector('nav[role="navigation"]') ||
                           document.querySelector('nav');

            if (!mainNav) {
                this.log('⚠️ Main navigation not found, cannot position admin navigation');
                return;
            }

            // Create admin navigation container
            const adminNavContainer = document.createElement('div');
            adminNavContainer.id = this.config.adminNavContainerId;
            adminNavContainer.className = 'admin-navigation-wrapper';

            // Insert after main navigation
            mainNav.parentNode.insertBefore(adminNavContainer, mainNav.nextSibling);
            
            this.log('✅ Admin navigation container created');
        },

        // Initialize admin navigation component
        initializeAdminNavigation: function() {
            this.log('🎯 Initializing admin navigation component...');
            
            // Wait for admin navigation component to be available
            const checkComponent = () => {
                if (window.ArdonieAdminNavigation) {
                    window.ArdonieAdminNavigation.init(this.config.adminNavContainerId);
                    this.log('✅ Admin navigation component initialized');
                } else {
                    this.log('⏳ Waiting for admin navigation component...');
                    setTimeout(checkComponent, 100);
                }
            };

            checkComponent();
        },

        // Setup event listeners
        setupEventListeners: function() {
            this.log('🔗 Setting up event listeners...');

            // Listen for authentication events
            document.addEventListener('authenticationComplete', () => {
                this.log('🔄 Auth complete - checking admin navigation visibility');
                setTimeout(() => this.checkAndUpdateVisibility(), 200);
            });

            document.addEventListener('authStateChanged', () => {
                this.log('🔄 Auth state changed - checking admin navigation visibility');
                this.checkAndUpdateVisibility();
            });

            // Listen for role changes
            document.addEventListener('roleChanged', () => {
                this.log('🔄 Role changed - checking admin navigation visibility');
                this.checkAndUpdateVisibility();
            });

            // Listen for logout events
            document.addEventListener('userLoggedOut', () => {
                this.log('👋 User logged out - hiding admin navigation');
                this.hideAdminNavigation();
            });

            // Listen for page navigation
            window.addEventListener('popstate', () => {
                this.log('🔄 Page navigation - checking admin navigation visibility');
                setTimeout(() => this.checkAndUpdateVisibility(), 100);
            });
        },

        // Check and update admin navigation visibility
        checkAndUpdateVisibility: function() {
            this.log('🔍 Checking admin navigation visibility...');
            
            if (window.ArdonieAdminNavigation) {
                window.ArdonieAdminNavigation.updateVisibility();
            } else {
                this.log('⚠️ Admin navigation component not available');
            }
        },

        // Hide admin navigation
        hideAdminNavigation: function() {
            if (window.ArdonieAdminNavigation) {
                window.ArdonieAdminNavigation.hideAdminNavigation();
            }
        },

        // Utility: Logging with debug mode
        log: function(message) {
            if (this.config.debugMode || window.location.search.includes('debug=admin-nav')) {
                console.log(`[AdminNavIntegration] ${message}`);
            }
        },

        // Public API: Manual refresh
        refresh: function() {
            this.log('🔄 Manual refresh requested');
            this.checkAndUpdateVisibility();
        },

        // Public API: Enable debug mode
        enableDebug: function() {
            this.config.debugMode = true;
            this.log('🐛 Debug mode enabled');
        },

        // Public API: Check if user is admin
        isCurrentUserAdmin: function() {
            if (window.ArdonieAdminNavigation) {
                return window.ArdonieAdminNavigation.isAdminUser();
            }
            return false;
        }
    };

    // Auto-initialize if enabled
    if (window.AdminNavigationIntegration.config.autoInit) {
        window.AdminNavigationIntegration.init();
    }

    // Global access
    window.AdminNavIntegration = window.AdminNavigationIntegration;

    // Expose refresh function globally for manual triggers
    window.refreshAdminNavigation = function() {
        window.AdminNavigationIntegration.refresh();
    };

})();
