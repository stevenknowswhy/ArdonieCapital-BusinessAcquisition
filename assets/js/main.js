/**
 * Main JavaScript Entry Point for BuyMartV1
 * Coordinates all site-wide functionality and component initialization
 */

// Global configuration
window.BuyMartV1 = {
    version: '1.0.0',
    environment: 'production',
    debug: false,
    components: new Map(),
    services: new Map()
};

/**
 * Initialize all core functionality
 */
async function initializeBuyMartV1() {
    console.log('🚀 Initializing BuyMartV1 Platform...');
    
    try {
        // Initialize core services
        await initializeCoreServices();
        
        // Initialize theme system
        await initializeThemeSystem();
        
        // Initialize navigation
        await initializeNavigation();
        
        // Initialize page-specific functionality
        await initializePageSpecificFeatures();
        
        // Initialize performance monitoring
        initializePerformanceMonitoring();
        
        // Initialize accessibility features
        initializeAccessibilityFeatures();
        
        console.log('✅ BuyMartV1 Platform initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize BuyMartV1 Platform:', error);
    }
}

/**
 * Initialize core services
 */
async function initializeCoreServices() {
    // Initialize authentication service if available
    if (window.AuthService) {
        try {
            await window.AuthService.initialize();
            window.BuyMartV1.services.set('auth', window.AuthService);
        } catch (error) {
            console.warn('Auth service initialization failed:', error);
        }
    }
    
    // Initialize component loader if available
    if (window.componentLoader) {
        window.BuyMartV1.services.set('componentLoader', window.componentLoader);
    }
}

/**
 * Initialize theme system
 */
async function initializeThemeSystem() {
    // Load theme manager if not already loaded
    if (!window.ThemeManager && typeof loadScript === 'function') {
        await loadScript('/assets/js/theme-manager.js');
    }
    
    if (window.ThemeManager) {
        window.ThemeManager.initialize();
        window.BuyMartV1.services.set('theme', window.ThemeManager);
    }
}

/**
 * Initialize navigation system
 */
async function initializeNavigation() {
    // Initialize main navigation if present
    const navElement = document.querySelector('nav');
    if (navElement) {
        // Add responsive navigation handlers
        initializeResponsiveNavigation();
        
        // Initialize mobile menu toggle
        initializeMobileMenu();
    }
}

/**
 * Initialize responsive navigation
 */
function initializeResponsiveNavigation() {
    const mobileMenuButton = document.querySelector('[data-mobile-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('open');
            
            if (isOpen) {
                mobileMenu.classList.remove('open');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            } else {
                mobileMenu.classList.add('open');
                mobileMenuButton.setAttribute('aria-expanded', 'true');
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.remove('open');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/**
 * Initialize mobile menu functionality
 */
function initializeMobileMenu() {
    // Handle mobile menu animations
    const mobileMenuItems = document.querySelectorAll('[data-mobile-menu] a');
    
    mobileMenuItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

/**
 * Initialize page-specific features
 */
async function initializePageSpecificFeatures() {
    const currentPage = getCurrentPageType();
    
    switch (currentPage) {
        case 'homepage':
            await initializeHomepageFeatures();
            break;
        case 'dashboard':
            await initializeDashboardFeatures();
            break;
        case 'auth':
            await initializeAuthFeatures();
            break;
        case 'marketplace':
            await initializeMarketplaceFeatures();
            break;
        default:
            await initializeCommonFeatures();
    }
}

/**
 * Get current page type
 */
function getCurrentPageType() {
    const path = window.location.pathname;
    
    if (path === '/' || path.includes('index')) return 'homepage';
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('auth') || path.includes('login') || path.includes('register')) return 'auth';
    if (path.includes('marketplace') || path.includes('listings')) return 'marketplace';
    
    return 'general';
}

/**
 * Initialize homepage-specific features
 */
async function initializeHomepageFeatures() {
    // Initialize hero section animations
    initializeHeroAnimations();
    
    // Initialize scroll-triggered animations
    initializeScrollAnimations();
    
    // Initialize interactive elements
    initializeInteractiveElements();
}

/**
 * Initialize hero section animations
 */
function initializeHeroAnimations() {
    const heroElements = document.querySelectorAll('[data-animate-hero]');
    
    heroElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`;
        element.classList.add('animate-fade-in-up');
    });
}

/**
 * Initialize scroll-triggered animations
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation triggers
    const animatedElements = document.querySelectorAll('[data-animate-on-scroll]');
    animatedElements.forEach(element => observer.observe(element));
}

/**
 * Initialize interactive elements
 */
function initializeInteractiveElements() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize modals
    initializeModals();
    
    // Initialize form enhancements
    initializeFormEnhancements();
}

/**
 * Initialize tooltips
 */
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

/**
 * Initialize modals
 */
function initializeModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal-trigger');
            openModal(modalId);
        });
    });
    
    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

/**
 * Initialize form enhancements
 */
function initializeFormEnhancements() {
    const forms = document.querySelectorAll('form[data-enhanced]');
    
    forms.forEach(form => {
        // Add real-time validation
        addFormValidation(form);
        
        // Add loading states
        addFormLoadingStates(form);
        
        // Add success/error handling
        addFormFeedback(form);
    });
}

/**
 * Initialize performance monitoring
 */
function initializePerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
        // This would integrate with web-vitals library if available
        console.log('📊 Performance monitoring initialized');
    }
    
    // Monitor component loading times
    if (window.BuyMartV1.services.has('componentLoader')) {
        const loader = window.BuyMartV1.services.get('componentLoader');
        
        // Override loadComponent to add timing
        const originalLoadComponent = loader.loadComponent;
        loader.loadComponent = async function(...args) {
            const start = performance.now();
            const result = await originalLoadComponent.apply(this, args);
            const end = performance.now();
            
            console.log(`⏱️ Component ${args[0]} loaded in ${(end - start).toFixed(2)}ms`);
            return result;
        };
    }
}

/**
 * Initialize accessibility features
 */
function initializeAccessibilityFeatures() {
    // Add skip links
    addSkipLinks();
    
    // Enhance keyboard navigation
    enhanceKeyboardNavigation();
    
    // Add ARIA live regions
    addLiveRegions();
    
    // Initialize focus management
    initializeFocusManagement();
}

/**
 * Utility functions
 */
function showTooltip(event) {
    // Tooltip implementation
}

function hideTooltip(event) {
    // Tooltip implementation
}

function openModal(modalId) {
    // Modal implementation
}

function closeAllModals() {
    // Modal implementation
}

function addFormValidation(form) {
    // Form validation implementation
}

function addFormLoadingStates(form) {
    // Loading states implementation
}

function addFormFeedback(form) {
    // Form feedback implementation
}

function addSkipLinks() {
    // Skip links implementation
}

function enhanceKeyboardNavigation() {
    // Keyboard navigation implementation
}

function addLiveRegions() {
    // ARIA live regions implementation
}

function initializeFocusManagement() {
    // Focus management implementation
}

/**
 * Dashboard-specific initialization
 */
async function initializeDashboardFeatures() {
    console.log('📊 Initializing dashboard features...');
    // Dashboard-specific code would go here
}

/**
 * Auth-specific initialization
 */
async function initializeAuthFeatures() {
    console.log('🔐 Initializing auth features...');
    // Auth-specific code would go here
}

/**
 * Marketplace-specific initialization
 */
async function initializeMarketplaceFeatures() {
    console.log('🏪 Initializing marketplace features...');
    // Marketplace-specific code would go here
}

/**
 * Common features for all pages
 */
async function initializeCommonFeatures() {
    console.log('🔧 Initializing common features...');
    // Common features code would go here
}

/**
 * Global features initialization (called by component loader)
 */
window.initializeGlobalFeatures = async function() {
    console.log('🌐 Initializing global features...');

    try {
        // Initialize theme system enhancements
        if (window.enhanceThemeSystem) {
            window.enhanceThemeSystem();
        }

        // Initialize performance monitoring
        if (window.initializePerformanceMonitoring) {
            window.initializePerformanceMonitoring();
        }

        // Initialize accessibility features
        if (window.initializeAccessibilityFeatures) {
            window.initializeAccessibilityFeatures();
        }

        console.log('✅ Global features initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize global features:', error);
    }
};

/**
 * Script loader utility
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBuyMartV1);
} else {
    initializeBuyMartV1();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeBuyMartV1 };
}
