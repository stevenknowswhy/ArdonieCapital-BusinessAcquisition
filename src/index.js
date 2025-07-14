
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
 * Ardonie Capital Platform - Main Application Entry Point
 * This file demonstrates proper import/export patterns for the feature-based architecture
 */

// Core feature imports through their public APIs (barrel exports)
import {
    AuthService,
    authConfig,
    getAuthCapabilities
} from './features/authentication/index.js';

import {
    DashboardService,
    dashboardConfig,
    getDashboardCapabilities,
    getAvailableComponents as getDashboardComponents
} from './features/dashboard/index.js';

import {
    MarketplaceService,
    marketplaceConfig,
    getMarketplaceCapabilities,
    getAvailableComponents as getMarketplaceComponents
} from './features/marketplace/index.js';

// Shared utilities and components through barrel exports
import {
    HeaderComponent,
    ButtonComponent,
    ModalComponent,
    CardComponent,
    InputComponent
} from './shared/components/index.js';

import {
    validationUtils,
    formattingUtils,
    storageUtils,
    uiUtils,
    useTheme,
    useMobileMenu,
    // Legacy exports for backward compatibility
    formatCurrency,
    formatDate,
    debounce,
    storage,
    api,
    eventBus
} from './shared/index.js';

// Dynamic imports for optional features
const loadOptionalFeatures = async () => {
    const optionalFeatures = {};

    // Try to load blog feature
    try {
        const blogModule = await import('./features/blog/index.js');
        optionalFeatures.blog = blogModule;
        console.log('✅ Blog feature loaded');
    } catch (e) {
        console.debug('Blog feature not available');
    }

    // Try to load matchmaking feature
    try {
        const matchmakingModule = await import('./features/matchmaking/index.js');
        optionalFeatures.matchmaking = matchmakingModule;
        console.log('✅ Matchmaking feature loaded');
    } catch (e) {
        console.debug('Matchmaking feature not available');
    }

    // Try to load tools feature
    try {
        const toolsModule = await import('./features/tools/index.js');
        optionalFeatures.tools = toolsModule;
        console.log('✅ Tools feature loaded');
    } catch (e) {
        console.debug('Tools feature not available');
    }

    // Try to load portals feature
    try {
        const portalsModule = await import('./features/portals/index.js');
        optionalFeatures.portals = portalsModule;
        console.log('✅ Portals feature loaded');
    } catch (e) {
        console.debug('Portals feature not available');
    }

    return optionalFeatures;
};

// Application configuration with proper feature detection
const appConfig = {
    name: 'Ardonie Capital Platform',
    version: '1.0.0',
    environment: 'development', // Browser environment default
    apiBaseUrl: '/api',
    features: {
        // Core features (always available)
        authentication: authConfig,
        dashboard: dashboardConfig,
        marketplace: marketplaceConfig,
        // Optional features (loaded dynamically)
        blog: null,
        matchmaking: null,
        tools: null,
        portals: null
    },
    modules: {
        shared: true,
        authentication: true,
        dashboard: true,
        marketplace: true,
        blog: false,
        matchmaking: false,
        tools: false,
        portals: false
    },
    ui: {
        theme: 'default',
        responsive: true,
        accessibility: true,
        animations: true
    }
};

// Feature capability detection
const detectFeatureCapabilities = async () => {
    const capabilities = {
        authentication: await getAuthCapabilities?.() || {},
        dashboard: await getDashboardCapabilities?.() || {},
        marketplace: await getMarketplaceCapabilities?.() || {}
    };

    // Load optional features and their capabilities
    const optionalFeatures = await loadOptionalFeatures();

    if (optionalFeatures.blog) {
        capabilities.blog = optionalFeatures.blog.getBlogCapabilities?.() || {};
        appConfig.features.blog = optionalFeatures.blog.blogConfig || {};
        appConfig.modules.blog = true;
    }

    if (optionalFeatures.matchmaking) {
        capabilities.matchmaking = optionalFeatures.matchmaking.getMatchmakingCapabilities?.() || {};
        appConfig.features.matchmaking = optionalFeatures.matchmaking.matchmakingConfig || {};
        appConfig.modules.matchmaking = true;
    }

    if (optionalFeatures.tools) {
        capabilities.tools = optionalFeatures.tools.getToolsCapabilities?.() || {};
        appConfig.features.tools = optionalFeatures.tools.toolsConfig || {};
        appConfig.modules.tools = true;
    }

    if (optionalFeatures.portals) {
        capabilities.portals = optionalFeatures.portals.getPortalsCapabilities?.() || {};
        appConfig.features.portals = optionalFeatures.portals.portalsConfig || {};
        appConfig.modules.portals = true;
    }

    return capabilities;
};

// Enhanced Application class with proper module management
class ArdonieCapitalApp {
    constructor() {
        this.features = new Map();
        this.services = new Map();
        this.components = new Map();
        this.capabilities = {};
        this.initialized = false;
        this.moduleRegistry = new Map();
    }

    // Initialize the application with proper import/export handling
    async init() {
        if (this.initialized) return;

        try {
            console.log(`🚀 Initializing ${appConfig.name} v${appConfig.version}`);

            // Detect feature capabilities first
            this.capabilities = await detectFeatureCapabilities();
            console.log('📊 Feature capabilities detected:', this.capabilities);

            // Initialize shared utilities
            await this.initializeSharedUtilities();

            // Initialize core services
            await this.initializeServices();

            // Initialize components
            await this.initializeComponents();

            // Set up global event listeners
            this.setupGlobalEvents();

            // Initialize page-specific features
            await this.initializePageFeatures();

            this.initialized = true;
            console.log('✅ Application initialized successfully');

            // Emit initialization complete event
            eventBus.emit('app:initialized', {
                config: appConfig,
                capabilities: this.capabilities
            });

        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            throw error;
        }
    }

    // Initialize shared utilities using proper imports
    async initializeSharedUtilities() {
        try {
            // Initialize theme system
            if (useTheme?.init) {
                await useTheme.init();
                console.log('✅ Theme system initialized');
            }

            // Initialize mobile menu
            if (useMobileMenu?.init) {
                await useMobileMenu.init();
                console.log('✅ Mobile menu initialized');
            }

            console.log('✅ Shared utilities initialized');
        } catch (error) {
            console.warn('⚠️ Some shared utilities failed to initialize:', error);
        }
    }

    // Initialize all services using proper imports
    async initializeServices() {
        try {
            // Register core services (always available)
            this.services.set('auth', new AuthService());
            this.services.set('dashboard', new DashboardService());
            this.services.set('marketplace', new MarketplaceService());

            // Register optional services if available
            const optionalFeatures = await loadOptionalFeatures();

            if (optionalFeatures.blog?.BlogService) {
                this.services.set('blog', new optionalFeatures.blog.BlogService());
                console.log('✅ Blog service initialized');
            }

            if (optionalFeatures.matchmaking?.MatchmakingService) {
                this.services.set('matchmaking', new optionalFeatures.matchmaking.MatchmakingService());
                console.log('✅ Matchmaking service initialized');
            }

            if (optionalFeatures.tools?.ToolsService) {
                this.services.set('tools', new optionalFeatures.tools.ToolsService());
                console.log('✅ Tools service initialized');
            }

            if (optionalFeatures.portals?.PortalsService) {
                this.services.set('portals', new optionalFeatures.portals.PortalsService());
                console.log('✅ Portals service initialized');
            }

            console.log('✅ Services initialized');
        } catch (error) {
            console.error('❌ Service initialization failed:', error);
            throw error;
        }
    }

    // Initialize components using proper imports and dynamic loading
    async initializeComponents() {
        try {
            // Initialize header if container exists
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                const header = new HeaderComponent('header-container', {
                    brand: 'Ardonie Capital',
                    brandUrl: '/',
                    showAuth: true,
                    showNavigation: true
                });
                this.components.set('header', header);
            }

            // Register shared component classes for dynamic use
            this.components.set('ButtonComponent', ButtonComponent);
            this.components.set('ModalComponent', ModalComponent);
            this.components.set('CardComponent', CardComponent);
            this.components.set('InputComponent', InputComponent);

            // Load feature-specific components dynamically
            const [dashboardComponents, marketplaceComponents] = await Promise.all([
                getDashboardComponents?.() || {},
                getMarketplaceComponents?.() || {}
            ]);

            // Register dashboard components
            Object.entries(dashboardComponents).forEach(([name, component]) => {
                this.components.set(`dashboard${name}`, component);
            });

            // Register marketplace components
            Object.entries(marketplaceComponents).forEach(([name, component]) => {
                this.components.set(`marketplace${name}`, component);
            });

            // Register optional feature components
            const optionalFeatures = await loadOptionalFeatures();

            if (optionalFeatures.blog?.getAvailableComponents) {
                const blogComponents = await optionalFeatures.blog.getAvailableComponents();
                Object.entries(blogComponents).forEach(([name, component]) => {
                    this.components.set(`blog${name}`, component);
                });
            }

            if (optionalFeatures.matchmaking?.getAvailableComponents) {
                const matchmakingComponents = await optionalFeatures.matchmaking.getAvailableComponents();
                Object.entries(matchmakingComponents).forEach(([name, component]) => {
                    this.components.set(`matchmaking${name}`, component);
                });
            }

            if (optionalFeatures.tools?.getAvailableComponents) {
                const toolsComponents = await optionalFeatures.tools.getAvailableComponents();
                Object.entries(toolsComponents).forEach(([name, component]) => {
                    this.components.set(`tools${name}`, component);
                });
            }

            if (optionalFeatures.portals?.getAvailableComponents) {
                const portalsComponents = await optionalFeatures.portals.getAvailableComponents();
                Object.entries(portalsComponents).forEach(([name, component]) => {
                    this.components.set(`portals${name}`, component);
                });
            }

            console.log('✅ Components initialized:', Array.from(this.components.keys()));
        } catch (error) {
            console.error('❌ Component initialization failed:', error);
            // Don't throw here, components are not critical for basic functionality
        }
    }

  // Set up global event listeners
  setupGlobalEvents() {
    // Handle authentication state changes
    eventBus.on('auth:login', (userData) => {
      console.log('User logged in:', userData);
      this.handleAuthStateChange(true);
    });

    eventBus.on('auth:logout', () => {
      console.log('User logged out');
      this.handleAuthStateChange(false);
    });

    // Handle page navigation
    window.addEventListener('popstate', this.handlePageChange.bind(this));
    
    // Handle unhandled errors
    window.addEventListener('error', this.handleGlobalError.bind(this));
    
    console.log('Global events set up');
  }

  // Initialize features based on current page
  initializePageFeatures() {
    const currentPage = this.getCurrentPage();
    
    switch (currentPage) {
      case 'login':
      case 'register':
        this.initializeAuthenticationFeature();
        break;
        
      case 'dashboard':
      case 'buyer-dashboard':
      case 'seller-dashboard':
        this.initializeDashboardFeature();
        break;
        
      case 'listings':
      case 'marketplace':
        this.initializeMarketplaceFeature();
        break;
        
      case 'matches':
      case 'matchmaking':
        this.initializeMatchmakingFeature();
        break;
        
      case 'blog':
        this.initializeBlogFeature();
        break;
        
      case 'valuation':
      case 'due-diligence':
        this.initializeToolsFeature();
        break;
        
      default:
        console.log('No specific feature initialization for current page');
    }
  }

  // Feature initialization methods
  initializeAuthenticationFeature() {
    const loginFormContainer = document.getElementById('login-form-container');
    if (loginFormContainer) {
      const loginForm = new LoginForm('login-form-container', {
        redirectUrl: '/dashboard/',
        showRememberMe: true
      });
      this.components.set('loginForm', loginForm);
    }
    
    console.log('Authentication feature initialized');
  }

  initializeDashboardFeature() {
    const dashboardHeaderContainer = document.getElementById('dashboard-header');
    if (dashboardHeaderContainer) {
      const dashboardHeader = new DashboardHeader('dashboard-header');
      this.components.set('dashboardHeader', dashboardHeader);
    }
    
    console.log('Dashboard feature initialized');
  }

  initializeMarketplaceFeature() {
    const listingsContainer = document.getElementById('listings-container');
    if (listingsContainer) {
      // Initialize marketplace components
      console.log('Marketplace feature initialized');
    }
  }

  initializeMatchmakingFeature() {
    const matchesContainer = document.getElementById('matches-container');
    if (matchesContainer) {
      // Initialize matchmaking components
      console.log('Matchmaking feature initialized');
    }
  }

  initializeBlogFeature() {
    const blogContainer = document.getElementById('blog-container');
    if (blogContainer) {
      // Initialize blog components
      console.log('Blog feature initialized');
    }
  }

  initializeToolsFeature() {
    const toolsContainer = document.getElementById('tools-container');
    if (toolsContainer) {
      const calculator = new ValuationCalculator('tools-container');
      this.components.set('valuationCalculator', calculator);
    }
    
    console.log('Tools feature initialized');
  }

  // Utility methods
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'home';
    return page;
  }

  handleAuthStateChange(isAuthenticated) {
    // Update UI based on authentication state
    const header = this.components.get('header');
    if (header) {
      // Refresh header to show/hide auth elements
      header.init();
    }
  }

  handlePageChange(event) {
    // Handle page navigation
    console.log('Page changed:', window.location.pathname);
    this.initializePageFeatures();
  }

  handleGlobalError(event) {
    console.error('Global error:', event.error);
    // Could send to error reporting service
  }

  // Public API methods
  getService(serviceName) {
    return this.services.get(serviceName);
  }

  getComponent(componentName) {
    return this.components.get(componentName);
  }

  getConfig() {
    return { ...appConfig };
  }

  // Enhanced module management methods

  // Get module capabilities
  getCapabilities(moduleName = null) {
    if (moduleName) {
      return this.capabilities[moduleName] || {};
    }
    return this.capabilities;
  }

  // Check if a module is available
  isModuleAvailable(moduleName) {
    return appConfig.modules[moduleName] === true;
  }

  // Dynamically load a module using proper imports
  async loadModule(moduleName) {
    if (this.moduleRegistry.has(moduleName)) {
      return this.moduleRegistry.get(moduleName);
    }

    try {
      let module;
      switch (moduleName) {
        case 'authentication':
          module = await import('./features/authentication/index.js');
          break;
        case 'dashboard':
          module = await import('./features/dashboard/index.js');
          break;
        case 'marketplace':
          module = await import('./features/marketplace/index.js');
          break;
        case 'shared':
          module = await import('./shared/index.js');
          break;
        case 'blog':
          module = await import('./features/blog/index.js');
          break;
        case 'matchmaking':
          module = await import('./features/matchmaking/index.js');
          break;
        case 'tools':
          module = await import('./features/tools/index.js');
          break;
        case 'portals':
          module = await import('./features/portals/index.js');
          break;
        default:
          throw new Error(`Unknown module: ${moduleName}`);
      }

      this.moduleRegistry.set(moduleName, module);
      console.log(`✅ Module '${moduleName}' loaded dynamically`);
      return module;
    } catch (error) {
      console.error(`❌ Failed to load module '${moduleName}':`, error);
      throw error;
    }
  }

  // Expose utilities globally with both new and legacy patterns
  getUtilities() {
    return {
      // New modular utilities
      validation: validationUtils,
      formatting: formattingUtils,
      storage: storageUtils,
      ui: uiUtils,
      theme: useTheme,
      mobileMenu: useMobileMenu,

      // Legacy utilities for backward compatibility
      formatCurrency,
      formatDate,
      debounce,
      storage,
      api,
      eventBus
    };
  }

  // Get all available modules
  getAvailableModules() {
    return Object.keys(appConfig.modules).filter(module => appConfig.modules[module]);
  }
}

// Create and export global app instance
const app = new ArdonieCapitalApp();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export for global access (maintain backward compatibility)
window.BuyMartApp = app;
window.ArdonieCapitalApp = app;

// Export the app instance and key utilities
export default app;

// Named exports for specific functionality
export {
  app as ardonieApp,
  appConfig,
  detectFeatureCapabilities,
  loadOptionalFeatures
};

// Export key classes and utilities for direct use
export {
  AuthService,
  DashboardService,
  MarketplaceService,
  HeaderComponent,
  ButtonComponent,
  ModalComponent,
  CardComponent,
  InputComponent,
  validationUtils,
  formattingUtils,
  storageUtils,
  uiUtils,
  useTheme,
  useMobileMenu
};

// Export optional feature services (will be undefined if not loaded)
export const getOptionalServices = async () => {
  const optionalFeatures = await loadOptionalFeatures();
  return {
    BlogService: optionalFeatures.blog?.BlogService,
    MatchmakingService: optionalFeatures.matchmaking?.MatchmakingService,
    ToolsService: optionalFeatures.tools?.ToolsService,
    PortalsService: optionalFeatures.portals?.PortalsService
  };
};
