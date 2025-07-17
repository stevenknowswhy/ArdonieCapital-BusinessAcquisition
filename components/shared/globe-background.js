/**
 * 3D Globe Background Component for BuyMartV1
 * Integrates globe.gl library for interactive 3D globe background
 */

class GlobeBackground {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = null;
        this.globe = null;
        this.isInitialized = false;
        this.animationId = null;
        
        // Default configuration
        this.config = {
            autoRotate: true,
            rotationSpeed: 0.5, // degrees per second
            globeImageUrl: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
            bumpImageUrl: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
            backgroundImageUrl: null,
            backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent background
            showAtmosphere: true,
            atmosphereColor: '#3b82f6', // Blue atmosphere
            atmosphereAltitude: 0.15,
            enableInteraction: false, // Disable interaction for background use
            width: null, // Auto-detect
            height: null, // Auto-detect
            pointOfView: { lat: 20, lng: -100, altitude: 2.5 }, // Focus on North America
            waitForGlobeReady: true,
            animateIn: false, // Disable animation for background use
            ...options
        };
    }

    /**
     * Initialize the globe background
     */
    async init() {
        try {
            console.log('🌍 Initializing 3D Globe Background...');
            
            // Find container element
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                throw new Error(`Container element with ID '${this.containerId}' not found`);
            }

            // Load globe.gl library if not already loaded
            await this.loadGlobeLibrary();

            // Create globe instance
            this.createGlobe();

            // Configure globe appearance
            this.configureGlobe();

            // Wait for globe to be fully ready before final configuration
            this.waitForGlobeReady().then(() => {
                // Final configuration after globe is ready
                this.finalizeGlobeConfiguration();

                // Start auto-rotation if enabled
                if (this.config.autoRotate) {
                    this.startAutoRotation();
                }

                // Handle resize events
                this.setupResizeHandler();

                // Handle theme changes
                this.setupThemeHandler();

                this.isInitialized = true;

                // Add fade-in effect
                setTimeout(() => {
                    this.container.classList.add('globe-loaded');
                }, 500);

                console.log('✅ 3D Globe Background initialized successfully');
            });


        } catch (error) {
            console.error('❌ Failed to initialize 3D Globe Background:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Load globe.gl library from CDN
     */
    async loadGlobeLibrary() {
        return new Promise((resolve, reject) => {
            // Check if Globe is already available
            if (window.Globe) {
                resolve();
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/globe.gl@2.32.0/dist/globe.gl.min.js';
            script.onload = () => {
                console.log('📦 Globe.gl library loaded successfully');
                resolve();
            };
            script.onerror = () => {
                reject(new Error('Failed to load globe.gl library'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Create the globe instance
     */
    createGlobe() {
        try {
            // Create globe container
            const globeContainer = document.createElement('div');
            globeContainer.id = `${this.containerId}-globe`;
            globeContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                pointer-events: ${this.config.enableInteraction ? 'auto' : 'none'};
            `;

            // Add debug border in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                globeContainer.style.border = '2px solid rgba(59, 130, 246, 0.5)';
                globeContainer.style.boxSizing = 'border-box';
                console.log('🔍 Debug mode: Added border to globe container');
            }

            this.container.appendChild(globeContainer);
            console.log('📦 Globe container created and appended:', globeContainer);

            // Initialize globe with error handling
            this.globe = new Globe(globeContainer, {
                rendererConfig: {
                    antialias: true,
                    alpha: true,
                    preserveDrawingBuffer: true
                },
                waitForGlobeReady: this.config.waitForGlobeReady,
                animateIn: this.config.animateIn
            });

            // Set dimensions
            const width = this.config.width || this.container.clientWidth;
            const height = this.config.height || this.container.clientHeight;

            this.globe
                .width(width)
                .height(height);

            console.log(`🌍 Globe instance created successfully (${width}x${height})`);
            console.log('🌍 Globe object:', this.globe);

            // Check if globe has a renderer
            if (this.globe.renderer && this.globe.renderer()) {
                console.log('🎨 Globe renderer available:', this.globe.renderer());
            } else {
                console.warn('⚠️ Globe renderer not immediately available');
            }

        } catch (error) {
            console.error('❌ Failed to create globe instance:', error);
            throw new Error(`Globe creation failed: ${error.message}`);
        }
    }

    /**
     * Configure globe appearance and behavior
     */
    configureGlobe() {
        console.log('🔧 Configuring globe appearance...');

        try {
            this.globe
                // Globe appearance
                .globeImageUrl(this.config.globeImageUrl)
                .bumpImageUrl(this.config.bumpImageUrl)
                .backgroundImageUrl(this.config.backgroundImageUrl)
                .backgroundColor(this.config.backgroundColor)

                // Atmosphere
                .showAtmosphere(this.config.showAtmosphere)
                .atmosphereColor(this.config.atmosphereColor)
                .atmosphereAltitude(this.config.atmosphereAltitude)

                // Interaction
                .enablePointerInteraction(this.config.enableInteraction)

                // Initial position
                .pointOfView(this.config.pointOfView, 0);

            console.log('✅ Globe configuration applied successfully');

            // Disable orbit controls for background use with proper error handling
            this.disableControls();

        } catch (error) {
            console.error('❌ Error configuring globe:', error);
            throw error;
        }
    }

    /**
     * Wait for globe to be fully ready
     */
    async waitForGlobeReady() {
        return new Promise((resolve) => {
            console.log('⏳ Waiting for globe to be ready...');

            // If globe has onGlobeReady callback, use it
            if (this.globe && typeof this.globe.onGlobeReady === 'function') {
                this.globe.onGlobeReady(() => {
                    console.log('🌍 Globe ready callback triggered');
                    this.verifyGlobeRendering();
                    resolve();
                });
            } else {
                // Fallback: wait and check multiple times
                console.log('🌍 Using fallback globe ready detection');
                let attempts = 0;
                const checkReady = () => {
                    attempts++;
                    if (this.globe && this.globe.renderer && this.globe.renderer()) {
                        console.log(`🌍 Globe renderer detected after ${attempts} attempts`);
                        this.verifyGlobeRendering();
                        resolve();
                    } else if (attempts < 10) {
                        setTimeout(checkReady, 200);
                    } else {
                        console.warn('⚠️ Globe ready timeout, proceeding anyway');
                        resolve();
                    }
                };
                checkReady();
            }
        });
    }

    /**
     * Verify that the globe is actually rendering
     */
    verifyGlobeRendering() {
        try {
            if (this.globe && this.globe.renderer && this.globe.renderer()) {
                const renderer = this.globe.renderer();
                console.log('🎨 Globe renderer info:', {
                    domElement: !!renderer.domElement,
                    context: !!renderer.getContext(),
                    size: renderer.getSize({}),
                    pixelRatio: renderer.getPixelRatio()
                });

                // Check if canvas is in DOM
                const canvas = renderer.domElement;
                if (canvas && canvas.parentNode) {
                    console.log('✅ Globe canvas is in DOM');
                    console.log('📐 Canvas dimensions:', canvas.width, 'x', canvas.height);

                    // Add visual debugging
                    if (window.location.hostname === 'localhost') {
                        canvas.style.border = '1px solid rgba(255, 0, 0, 0.5)';
                        console.log('🔍 Added debug border to canvas');
                    }
                } else {
                    console.warn('⚠️ Globe canvas not found in DOM');
                }
            } else {
                console.warn('⚠️ Globe renderer not available for verification');
            }
        } catch (error) {
            console.warn('⚠️ Globe rendering verification failed:', error);
        }
    }

    /**
     * Finalize globe configuration after it's fully ready
     */
    finalizeGlobeConfiguration() {
        try {
            // Now that globe is ready, safely disable controls
            this.disableControls();

            // Any other final configuration can go here
            console.log('🔧 Globe configuration finalized');
        } catch (error) {
            console.warn('⚠️ Error during final globe configuration:', error);
        }
    }

    /**
     * Safely disable globe controls with proper error handling
     */
    disableControls() {
        if (!this.config.enableInteraction) {
            try {
                // Check if globe and controls method exist
                if (this.globe && typeof this.globe.controls === 'function') {
                    const controls = this.globe.controls();
                    if (controls && typeof controls.enabled !== 'undefined') {
                        controls.enabled = false;
                        console.log('🎮 Globe controls disabled successfully');
                    } else if (controls) {
                        // Try alternative disable methods
                        console.log('🎮 Globe controls object exists, trying alternative disable methods');
                        if (typeof controls.enableRotate !== 'undefined') {
                            controls.enableRotate = false;
                            controls.enableZoom = false;
                            controls.enablePan = false;
                            console.log('🎮 Globe controls disabled via alternative method');
                        } else {
                            console.log('🎮 Globe controls object found but no known disable properties');
                        }
                    } else {
                        console.log('🎮 Globe controls object not yet available');
                    }
                } else {
                    console.warn('⚠️ Globe controls method not available, will retry after initialization');
                    // Retry after a short delay to allow globe to fully initialize
                    setTimeout(() => {
                        this.disableControls();
                    }, 100);
                }
            } catch (error) {
                console.warn('⚠️ Failed to disable globe controls:', error.message);
                // Fallback: try alternative approach
                this.disableControlsFallback();
            }
        }
    }

    /**
     * Fallback method to disable controls using alternative approaches
     */
    disableControlsFallback() {
        try {
            // Alternative approach: disable pointer interaction entirely
            if (this.globe && typeof this.globe.enablePointerInteraction === 'function') {
                this.globe.enablePointerInteraction(false);
                console.log('🎮 Globe interaction disabled via fallback method');
            }
        } catch (error) {
            console.warn('⚠️ Fallback control disable also failed:', error.message);
            console.log('ℹ️ Globe will remain interactive (this may be acceptable for background use)');
        }
    }

    /**
     * Start auto-rotation animation
     */
    startAutoRotation() {
        let lastTime = Date.now();
        let currentLng = this.config.pointOfView.lng;

        const animate = () => {
            if (!this.isInitialized || !this.config.autoRotate) {
                return;
            }

            const currentTime = Date.now();
            const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
            lastTime = currentTime;

            // Update longitude for rotation
            currentLng += this.config.rotationSpeed * deltaTime;
            if (currentLng >= 360) {
                currentLng -= 360;
            }

            // Update globe point of view
            this.globe.pointOfView({
                lat: this.config.pointOfView.lat,
                lng: currentLng,
                altitude: this.config.pointOfView.altitude
            }, 0);

            this.animationId = requestAnimationFrame(animate);
        };

        this.animationId = requestAnimationFrame(animate);
    }

    /**
     * Stop auto-rotation animation
     */
    stopAutoRotation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Setup window resize handler
     */
    setupResizeHandler() {
        const resizeHandler = () => {
            if (this.globe && this.container) {
                const width = this.container.clientWidth;
                const height = this.container.clientHeight;
                this.globe.width(width).height(height);
            }
        };

        window.addEventListener('resize', resizeHandler);
        
        // Store reference for cleanup
        this.resizeHandler = resizeHandler;
    }

    /**
     * Setup theme change handler
     */
    setupThemeHandler() {
        const themeHandler = () => {
            this.updateTheme();
        };

        // Listen for theme changes
        document.addEventListener('themeChanged', themeHandler);
        
        // Store reference for cleanup
        this.themeHandler = themeHandler;
    }

    /**
     * Update globe appearance based on current theme
     */
    updateTheme() {
        if (!this.globe) return;

        const isDarkMode = document.documentElement.classList.contains('dark');
        
        if (isDarkMode) {
            this.globe
                .atmosphereColor('#3b82f6') // Blue atmosphere for dark mode
                .backgroundColor('rgba(0, 0, 0, 0)');
        } else {
            this.globe
                .atmosphereColor('#60a5fa') // Lighter blue for light mode
                .backgroundColor('rgba(255, 255, 255, 0)');
        }
    }

    /**
     * Handle initialization errors gracefully
     */
    handleInitializationError(error) {
        console.warn('🚨 Globe background failed to initialize, falling back to static background');
        console.error('Error details:', error);

        // Add fallback styling to container
        if (this.container) {
            this.container.style.background = `
                radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
            `;
            this.container.classList.add('globe-fallback');
            console.log('🎨 Applied fallback background styling');
        }

        // Emit custom event for debugging
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('globeInitializationFailed', {
                detail: { error: error.message, containerId: this.containerId }
            }));
        }
    }

    /**
     * Pause globe rendering for performance
     */
    pause() {
        if (this.globe && this.globe.pauseAnimation) {
            this.globe.pauseAnimation();
        }
        this.stopAutoRotation();
    }

    /**
     * Resume globe rendering
     */
    resume() {
        if (this.globe && this.globe.resumeAnimation) {
            this.globe.resumeAnimation();
        }
        if (this.config.autoRotate) {
            this.startAutoRotation();
        }
    }

    /**
     * Destroy the globe and clean up resources
     */
    destroy() {
        this.stopAutoRotation();
        
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        if (this.themeHandler) {
            document.removeEventListener('themeChanged', this.themeHandler);
        }
        
        if (this.globe) {
            // Remove globe container
            const globeContainer = document.getElementById(`${this.containerId}-globe`);
            if (globeContainer) {
                globeContainer.remove();
            }
        }
        
        this.isInitialized = false;
        this.globe = null;
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.globe) {
            this.configureGlobe();
            
            if (newConfig.autoRotate !== undefined) {
                if (newConfig.autoRotate) {
                    this.startAutoRotation();
                } else {
                    this.stopAutoRotation();
                }
            }
        }
    }
}

// Export for use in other modules
window.GlobeBackground = GlobeBackground;

// Auto-initialize if container exists (fallback)
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌍 Globe background script: DOM loaded, checking for container...');
    const globeContainer = document.getElementById('globe-background-container');
    if (globeContainer && !window.heroGlobeBackground) {
        console.log('🌍 Globe container found, initializing globe background...');
        // Initialize with a slight delay to ensure hero section is fully loaded
        setTimeout(() => {
            try {
                window.heroGlobeBackground = new GlobeBackground('globe-background-container', {
                    autoRotate: true,
                    rotationSpeed: 0.3, // Slower rotation for background
                    enableInteraction: false,
                    showAtmosphere: true,
                    atmosphereColor: '#3b82f6',
                    pointOfView: { lat: 20, lng: -100, altitude: 2.8 }
                });
                window.heroGlobeBackground.init();
            } catch (error) {
                console.error('🚨 Failed to initialize globe background in fallback:', error);
            }
        }, 1000);
    } else if (!globeContainer) {
        console.log('ℹ️ Globe container not found, skipping fallback initialization');
    } else {
        console.log('ℹ️ Globe background already initialized, skipping fallback');
    }
});

// Add global debugging helpers
if (typeof window !== 'undefined') {
    window.debugGlobe = {
        checkGlobeStatus: () => {
            console.log('🔍 Globe Debug Status:');
            console.log('- Globe.gl library loaded:', typeof window.Globe !== 'undefined');
            console.log('- GlobeBackground class available:', typeof window.GlobeBackground !== 'undefined');
            console.log('- Hero globe instance:', window.heroGlobeBackground ? 'exists' : 'not found');
            if (window.heroGlobeBackground) {
                console.log('- Globe initialized:', window.heroGlobeBackground.isInitialized);
                console.log('- Globe instance:', window.heroGlobeBackground.globe ? 'exists' : 'not found');
            }
        },
        reinitializeGlobe: () => {
            console.log('🔄 Attempting to reinitialize globe...');
            if (window.heroGlobeBackground) {
                window.heroGlobeBackground.destroy();
            }
            window.heroGlobeBackground = new GlobeBackground('globe-background-container', {
                autoRotate: true,
                rotationSpeed: 0.3,
                enableInteraction: false,
                showAtmosphere: true,
                atmosphereColor: '#3b82f6',
                pointOfView: { lat: 20, lng: -100, altitude: 2.8 }
            });
            window.heroGlobeBackground.init();
        }
    };
}
