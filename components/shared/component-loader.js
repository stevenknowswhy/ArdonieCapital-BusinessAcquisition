/**
 * Component Loader - Modular Component System for BuyMartV1
 * Loads HTML components dynamically and maintains functionality
 */

class ComponentLoader {
    constructor() {
        this.loadedComponents = new Set();
        this.componentCache = new Map();
    }

    /**
     * Load a component from the components directory
     * @param {string} componentPath - Path to the component (e.g., 'sections/hero-section')
     * @param {string} targetSelector - CSS selector for the target container
     * @param {Object} options - Loading options
     */
    async loadComponent(componentPath, targetSelector, options = {}) {
        try {
            console.log(`🔄 Loading component: ${componentPath} -> ${targetSelector}`);

            const {
                cache = true,
                replace = true,
                beforeLoad = null,
                afterLoad = null
            } = options;

            // Execute before load callback
            if (beforeLoad && typeof beforeLoad === 'function') {
                beforeLoad();
            }

            // Check cache first
            let componentHTML;
            if (cache && this.componentCache.has(componentPath)) {
                componentHTML = this.componentCache.get(componentPath);
                console.log(`📦 Using cached component: ${componentPath}`);
            } else {
                // Fetch component HTML
                console.log(`🌐 Fetching component: /components/${componentPath}.html`);
                const response = await fetch(`/components/${componentPath}.html`);
                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn(`⚠️ Component not found (404): ${componentPath} - hiding container`);
                        // Hide the container if component doesn't exist
                        const targetElement = document.querySelector(targetSelector);
                        if (targetElement) {
                            targetElement.style.display = 'none';
                            console.log(`🙈 Hidden container: ${targetSelector}`);
                        }
                        return false;
                    }
                    throw new Error(`HTTP ${response.status}: Failed to load component: ${componentPath}`);
                }
                componentHTML = await response.text();
                console.log(`📄 Component HTML loaded (${componentHTML.length} chars): ${componentPath}`);

                // Cache the component
                if (cache) {
                    this.componentCache.set(componentPath, componentHTML);
                }
            }

            // Find target element
            console.log(`🎯 Looking for target element: ${targetSelector}`);
            const targetElement = document.querySelector(targetSelector);
            if (!targetElement) {
                console.error(`❌ Target element not found: ${targetSelector}`);
                console.log('Available elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => `#${el.id}`));
                throw new Error(`Target element not found: ${targetSelector}`);
            }
            console.log(`✅ Target element found:`, targetElement);

            // Insert component HTML and execute scripts
            if (replace) {
                targetElement.innerHTML = componentHTML;
                console.log(`🔄 Replaced content in ${targetSelector}`);
            } else {
                targetElement.insertAdjacentHTML('beforeend', componentHTML);
                console.log(`➕ Appended content to ${targetSelector}`);
            }

            // Execute any script tags in the loaded component
            this.executeScripts(targetElement, componentPath);

            // Verify insertion
            if (targetElement.innerHTML.trim().length === 0) {
                console.warn(`⚠️ Target element appears empty after insertion: ${targetSelector}`);
            } else {
                console.log(`✅ Content successfully inserted into ${targetSelector} (${targetElement.innerHTML.length} chars)`);
            }

            // Mark as loaded
            this.loadedComponents.add(componentPath);

            // Execute after load callback
            if (afterLoad && typeof afterLoad === 'function') {
                try {
                    afterLoad();
                    console.log(`🎉 After load callback executed for: ${componentPath}`);
                } catch (callbackError) {
                    console.error(`❌ After load callback failed for ${componentPath}:`, callbackError);
                }
            }

            console.log(`✅ Component loaded successfully: ${componentPath}`);
            return true;

        } catch (error) {
            console.error(`❌ Failed to load component ${componentPath}:`, error);
            console.error('Error details:', {
                componentPath,
                targetSelector,
                error: error.message,
                stack: error.stack
            });
            return false;
        }
    }

    /**
     * Execute script tags within a loaded component
     * @param {Element} container - The container element with the loaded component
     * @param {string} componentPath - Path of the component for logging
     */
    executeScripts(container, componentPath) {
        try {
            console.log(`🔧 Executing scripts for component: ${componentPath}`);

            // Find all script tags in the loaded component
            const scripts = container.querySelectorAll('script');
            console.log(`📜 Found ${scripts.length} script tags in ${componentPath}`);

            scripts.forEach((script, index) => {
                try {
                    console.log(`⚡ Executing script ${index + 1}/${scripts.length} for ${componentPath}`);

                    // Create a new script element to ensure execution
                    const newScript = document.createElement('script');

                    // Copy attributes
                    Array.from(script.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });

                    // Copy script content
                    newScript.textContent = script.textContent;

                    // Remove the old script tag
                    script.remove();

                    // Append the new script to head to execute it
                    document.head.appendChild(newScript);

                    console.log(`✅ Script ${index + 1} executed successfully for ${componentPath}`);

                    // Remove the script from head after execution to keep DOM clean
                    setTimeout(() => {
                        if (newScript.parentNode) {
                            newScript.parentNode.removeChild(newScript);
                        }
                    }, 100);

                } catch (scriptError) {
                    console.error(`❌ Failed to execute script ${index + 1} for ${componentPath}:`, scriptError);
                }
            });

            console.log(`🎉 Script execution completed for ${componentPath}`);

        } catch (error) {
            console.error(`❌ Script execution failed for ${componentPath}:`, error);
        }
    }

    /**
     * Load multiple components in sequence
     * @param {Array} components - Array of component configurations
     */
    async loadComponents(components) {
        const results = [];
        for (const component of components) {
            const { path, target, options = {} } = component;
            const result = await this.loadComponent(path, target, options);
            results.push({ path, success: result });
        }
        return results;
    }

    /**
     * Load multiple components in parallel
     * @param {Array} components - Array of component configurations
     */
    async loadComponentsParallel(components) {
        const promises = components.map(component => {
            const { path, target, options = {} } = component;
            return this.loadComponent(path, target, options).then(success => ({ path, success }));
        });
        return Promise.all(promises);
    }

    /**
     * Check if a component is loaded
     * @param {string} componentPath - Path to the component
     */
    isLoaded(componentPath) {
        return this.loadedComponents.has(componentPath);
    }

    /**
     * Clear component cache
     */
    clearCache() {
        this.componentCache.clear();
        console.log('🧹 Component cache cleared');
    }

    /**
     * Get loading statistics
     */
    getStats() {
        return {
            loadedComponents: Array.from(this.loadedComponents),
            cachedComponents: Array.from(this.componentCache.keys()),
            totalLoaded: this.loadedComponents.size,
            totalCached: this.componentCache.size
        };
    }
}

// Create global instance
window.componentLoader = new ComponentLoader();

/**
 * Convenience function to load a single component
 */
window.loadComponent = (path, target, options) => {
    return window.componentLoader.loadComponent(path, target, options);
};

/**
 * Initialize modular homepage
 */
async function initializeModularHomepage() {
    console.log('🚀 Initializing modular homepage...');
    
    const components = [
        // Note: Navigation is now loaded via JavaScript (main-navigation.js)
        // Hero Section
        {
            path: 'sections/hero-section',
            target: '#hero-container',
            options: {
                afterLoad: () => {
                    console.log('🦸 Hero section loaded');
                    // Reinitialize hero section JavaScript
                    if (window.initializeHeroSection) {
                        window.initializeHeroSection();
                    }
                }
            }
        },
        // How It Works Section
        {
            path: 'sections/how-it-works-section',
            target: '#how-it-works-container',
            options: {
                afterLoad: () => {
                    console.log('⚙️ How it works section loaded');
                    // Reinitialize how it works JavaScript
                    if (window.initializeHowItWorks) {
                        window.initializeHowItWorks();
                    }
                }
            }
        },
        // Why Choose Section
        {
            path: 'sections/why-choose-section',
            target: '#why-choose-container',
            options: {
                afterLoad: () => {
                    console.log('✨ Why choose section loaded');
                    // Reinitialize why choose JavaScript
                    if (window.initializeWhyChoose) {
                        window.initializeWhyChoose();
                    }
                }
            }
        },
        // Trust & Testimonials Section
        {
            path: 'sections/trust-testimonials-section',
            target: '#trust-testimonials-container',
            options: {
                afterLoad: () => {
                    console.log('🤝 Trust & testimonials section loaded');
                    // Initialize testimonials JavaScript if needed
                    if (window.initializeTrustTestimonials) {
                        window.initializeTrustTestimonials();
                    }
                }
            }
        },
        // Featured Listings Section (if exists)
        {
            path: 'sections/featured-listings-section',
            target: '#featured-listings-container',
            options: {
                afterLoad: () => {
                    console.log('🏪 Featured listings section loaded');
                    // Initialize featured listings JavaScript if needed
                    if (window.initializeFeaturedListings) {
                        window.initializeFeaturedListings();
                    }
                }
            }
        },
        // Free Resources Section
        {
            path: 'sections/free-resources-section',
            target: '#free-resources-container',
            options: {
                afterLoad: () => {
                    console.log('📚 Free resources section loaded');
                    // Initialize resources JavaScript if needed
                    if (window.initializeFreeResources) {
                        window.initializeFreeResources();
                    }
                }
            }
        },
        // Footer Component
        {
            path: 'footer',
            target: '#footer-container',
            options: {
                afterLoad: () => {
                    console.log('🦶 Footer component loaded');
                    // Initialize footer JavaScript if needed
                    if (window.initializeFooter) {
                        window.initializeFooter();
                    }
                }
            }
        }
    ];

    try {
        console.log(`🚀 Starting to load ${components.length} components...`);

        // Load components sequentially for better debugging
        const results = await window.componentLoader.loadComponents(components);
        const successful = results.filter(r => r.success).length;
        const total = results.length;

        console.log(`✅ Loaded ${successful}/${total} components successfully`);

        // Log detailed results
        results.forEach(result => {
            if (result.success) {
                console.log(`✅ ${result.path}: SUCCESS`);
            } else {
                console.error(`❌ ${result.path}: FAILED`);
            }
        });

        // Initialize any global functionality after all components are loaded
        if (window.initializeGlobalFeatures) {
            window.initializeGlobalFeatures();
        }

        // Initialize 3D Globe Background for hero section
        await initializeGlobeBackground();

        return results;
    } catch (error) {
        console.error('❌ Failed to initialize modular homepage:', error);
        console.error('Error details:', error);
        return [];
    }
}

/**
 * Initialize 3D Globe Background
 */
async function initializeGlobeBackground() {
    try {
        console.log('🌍 Loading 3D Globe Background...');

        // Load globe background script
        const globeScript = document.createElement('script');
        globeScript.src = '/components/shared/globe-background.js';
        globeScript.onload = () => {
            console.log('📦 Globe background script loaded');

            // Initialize globe background for hero section
            if (document.getElementById('hero-section') && window.GlobeBackground) {
                setTimeout(() => {
                    window.heroGlobeBackground = new window.GlobeBackground('globe-background-container', {
                        autoRotate: true,
                        rotationSpeed: 0.3, // Slower rotation for background
                        enableInteraction: false,
                        showAtmosphere: true,
                        atmosphereColor: '#3b82f6',
                        pointOfView: { lat: 20, lng: -100, altitude: 2.8 } // Focus on North America
                    });
                    window.heroGlobeBackground.init();
                }, 500);
            }
        };
        globeScript.onerror = () => {
            console.warn('⚠️ Failed to load globe background script, using fallback');
        };

        document.head.appendChild(globeScript);

    } catch (error) {
        console.warn('⚠️ Globe background initialization failed:', error);
    }
}

// Auto-initialize when DOM is ready (only on modular homepage)
function shouldAutoInitialize() {
    // Only auto-initialize on the main modular homepage
    const isModularHomepage = document.querySelector('#hero-container') &&
                              document.querySelector('#main-navigation-container') &&
                              document.querySelector('#footer-container');
    return isModularHomepage;
}

if (shouldAutoInitialize()) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeModularHomepage);
    } else {
        initializeModularHomepage();
    }
} else {
    console.log('🔧 Component loader loaded but not auto-initializing (not on modular homepage)');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentLoader;
}
