
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
 * Mobile Menu Hook
 * Manages mobile navigation menu functionality and responsive behavior
 */

export class MobileMenuHook {
    constructor() {
        this.isOpen = false;
        this.menuButton = null;
        this.menu = null;
        this.overlay = null;
        this.listeners = new Set();
        this.breakpoint = 768; // md breakpoint in pixels
        this.scrollPosition = 0;
        
        this.init();
    }

    /**
     * Initialize mobile menu system
     */
    init() {
        // Find menu elements
        this.findMenuElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup responsive behavior
        this.setupResponsiveBehavior();
        
        // Initialize accessibility
        this.initializeAccessibility();
    }

    /**
     * Find menu elements in the DOM
     */
    findMenuElements() {
        // Look for common mobile menu selectors
        this.menuButton = document.querySelector('[data-mobile-menu-button]') ||
                         document.getElementById('mobile-menu-button') ||
                         document.querySelector('.mobile-menu-button');
        
        this.menu = document.querySelector('[data-mobile-menu]') ||
                   document.getElementById('mobile-menu') ||
                   document.querySelector('.mobile-menu');
        
        // Create overlay if it doesn't exist
        this.createOverlay();
    }

    /**
     * Create overlay element for mobile menu
     */
    createOverlay() {
        this.overlay = document.querySelector('[data-mobile-menu-overlay]') ||
                      document.getElementById('mobile-menu-overlay');
        
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'mobile-menu-overlay fixed inset-0 bg-black bg-opacity-50 z-40 hidden';
            this.overlay.setAttribute('data-mobile-menu-overlay', '');
            document.body.appendChild(this.overlay);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Menu button click
        if (this.menuButton) {
            this.menuButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }

        // Overlay click to close
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.close();
            });
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Close menu when clicking menu links
        if (this.menu) {
            this.menu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && !e.target.hasAttribute('data-no-close')) {
                    this.close();
                }
            });
        }

        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    /**
     * Setup responsive behavior
     */
    setupResponsiveBehavior() {
        // Close menu when screen becomes large
        this.handleResize();
    }

    /**
     * Initialize accessibility features
     */
    initializeAccessibility() {
        if (this.menuButton) {
            // Set ARIA attributes
            this.menuButton.setAttribute('aria-expanded', 'false');
            this.menuButton.setAttribute('aria-controls', this.menu?.id || 'mobile-menu');
            this.menuButton.setAttribute('aria-label', 'Toggle mobile menu');
        }

        if (this.menu) {
            // Set menu role and hidden state
            this.menu.setAttribute('role', 'navigation');
            this.menu.setAttribute('aria-label', 'Mobile navigation');
        }
    }

    /**
     * Open mobile menu
     */
    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        
        // Store current scroll position
        this.scrollPosition = window.pageYOffset;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.scrollPosition}px`;
        document.body.style.width = '100%';
        
        // Show menu and overlay
        if (this.menu) {
            this.menu.classList.remove('hidden');
            this.menu.classList.add('mobile-menu-open');
        }
        
        if (this.overlay) {
            this.overlay.classList.remove('hidden');
        }
        
        // Update button state
        this.updateButtonState();
        
        // Focus management
        this.manageFocus(true);
        
        // Notify listeners
        this.notifyListeners('open');
        
        // Dispatch event
        this.dispatchEvent('mobileMenuOpen');
    }

    /**
     * Close mobile menu
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, this.scrollPosition);
        
        // Hide menu and overlay
        if (this.menu) {
            this.menu.classList.add('hidden');
            this.menu.classList.remove('mobile-menu-open');
        }
        
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
        
        // Update button state
        this.updateButtonState();
        
        // Focus management
        this.manageFocus(false);
        
        // Notify listeners
        this.notifyListeners('close');
        
        // Dispatch event
        this.dispatchEvent('mobileMenuClose');
    }

    /**
     * Toggle mobile menu
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Update menu button state
     */
    updateButtonState() {
        if (!this.menuButton) return;

        // Update ARIA expanded
        this.menuButton.setAttribute('aria-expanded', this.isOpen.toString());
        
        // Update button icon/text
        const openIcon = this.menuButton.querySelector('[data-menu-icon="open"]');
        const closeIcon = this.menuButton.querySelector('[data-menu-icon="close"]');
        
        if (openIcon && closeIcon) {
            openIcon.style.display = this.isOpen ? 'none' : 'block';
            closeIcon.style.display = this.isOpen ? 'block' : 'none';
        }
        
        // Update button text
        const buttonText = this.menuButton.querySelector('[data-menu-text]');
        if (buttonText) {
            buttonText.textContent = this.isOpen ? 'Close Menu' : 'Open Menu';
        }
        
        // Toggle active class
        this.menuButton.classList.toggle('menu-open', this.isOpen);
    }

    /**
     * Manage focus for accessibility
     * @param {boolean} menuOpen - Whether menu is open
     */
    manageFocus(menuOpen) {
        if (menuOpen) {
            // Focus first focusable element in menu
            const firstFocusable = this.menu?.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        } else {
            // Return focus to menu button
            if (this.menuButton) {
                this.menuButton.focus();
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const isLargeScreen = window.innerWidth >= this.breakpoint;
        
        if (isLargeScreen && this.isOpen) {
            // Close menu on large screens
            this.close();
        }
        
        // Update menu visibility based on screen size
        if (this.menu) {
            if (isLargeScreen) {
                this.menu.classList.remove('hidden');
                this.menu.classList.add('desktop-menu');
            } else {
                this.menu.classList.remove('desktop-menu');
                if (!this.isOpen) {
                    this.menu.classList.add('hidden');
                }
            }
        }
    }

    /**
     * Check if menu is open
     * @returns {boolean} Menu open state
     */
    getIsOpen() {
        return this.isOpen;
    }

    /**
     * Check if current screen is mobile size
     * @returns {boolean} True if mobile size
     */
    isMobileSize() {
        return window.innerWidth < this.breakpoint;
    }

    /**
     * Set breakpoint for mobile/desktop switch
     * @param {number} breakpoint - Breakpoint in pixels
     */
    setBreakpoint(breakpoint) {
        this.breakpoint = breakpoint;
        this.handleResize();
    }

    /**
     * Add event listener
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    addListener(callback) {
        this.listeners.add(callback);
        
        return () => {
            this.listeners.delete(callback);
        };
    }

    /**
     * Remove event listener
     * @param {Function} callback - Callback function
     */
    removeListener(callback) {
        this.listeners.delete(callback);
    }

    /**
     * Notify listeners of state change
     * @param {string} action - Action that occurred
     */
    notifyListeners(action) {
        const eventData = {
            action,
            isOpen: this.isOpen,
            isMobile: this.isMobileSize()
        };
        
        this.listeners.forEach(callback => {
            try {
                callback(eventData);
            } catch (error) {
                console.error('Mobile menu listener error:', error);
            }
        });
    }

    /**
     * Dispatch custom event
     * @param {string} eventName - Event name
     */
    dispatchEvent(eventName) {
        window.dispatchEvent(new CustomEvent(eventName, {
            detail: {
                isOpen: this.isOpen,
                isMobile: this.isMobileSize()
            }
        }));
    }

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Reinitialize mobile menu (useful after DOM changes)
     */
    reinitialize() {
        this.close();
        this.findMenuElements();
        this.setupEventListeners();
        this.initializeAccessibility();
    }

    /**
     * Destroy mobile menu instance
     */
    destroy() {
        this.close();
        this.listeners.clear();
        
        // Remove event listeners
        if (this.menuButton) {
            this.menuButton.removeEventListener('click', this.toggle);
        }
        
        if (this.overlay) {
            this.overlay.removeEventListener('click', this.close);
        }
        
        // Remove overlay if created by this instance
        if (this.overlay && this.overlay.hasAttribute('data-mobile-menu-overlay')) {
            this.overlay.remove();
        }
    }
}

// Export singleton instance
export const useMobileMenu = new MobileMenuHook();

// Export hook functions for easier usage
export const openMobileMenu = () => useMobileMenu.open();
export const closeMobileMenu = () => useMobileMenu.close();
export const toggleMobileMenu = () => useMobileMenu.toggle();
export const isMobileMenuOpen = () => useMobileMenu.getIsOpen();
export const isMobileSize = () => useMobileMenu.isMobileSize();
export const addMobileMenuListener = (callback) => useMobileMenu.addListener(callback);
export const removeMobileMenuListener = (callback) => useMobileMenu.removeListener(callback);
