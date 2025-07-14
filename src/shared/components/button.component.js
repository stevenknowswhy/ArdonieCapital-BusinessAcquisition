
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
 * Button Component
 * Reusable button component with multiple variants, sizes, and states
 */

export class ButtonComponent {
    constructor(options = {}) {
        this.options = {
            variant: 'primary',
            size: 'medium',
            disabled: false,
            loading: false,
            fullWidth: false,
            icon: null,
            iconPosition: 'left',
            type: 'button',
            className: '',
            ...options
        };
        
        this.element = null;
        this.loadingSpinner = null;
        this.originalContent = null;
    }

    /**
     * Create button element
     * @param {string} text - Button text
     * @param {Object} attributes - Additional attributes
     * @returns {HTMLElement} Button element
     */
    create(text, attributes = {}) {
        this.element = document.createElement('button');
        this.originalContent = text;
        
        // Set basic attributes
        this.element.type = this.options.type;
        this.element.disabled = this.options.disabled;
        
        // Apply additional attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                this.element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    this.element.dataset[dataKey] = dataValue;
                });
            } else {
                this.element.setAttribute(key, value);
            }
        });
        
        // Apply styles and content
        this.applyStyles();
        this.setContent(text);
        
        // Set up event listeners
        this.setupEventListeners();
        
        return this.element;
    }

    /**
     * Apply button styles based on variant and size
     */
    applyStyles() {
        if (!this.element) return;

        // Base styles
        const baseClasses = [
            'inline-flex',
            'items-center',
            'justify-center',
            'font-medium',
            'rounded-md',
            'transition-all',
            'duration-200',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-offset-2',
            'disabled:opacity-50',
            'disabled:cursor-not-allowed',
            'disabled:pointer-events-none'
        ];

        // Variant styles
        const variantClasses = this.getVariantClasses();
        
        // Size styles
        const sizeClasses = this.getSizeClasses();
        
        // Width styles
        const widthClasses = this.options.fullWidth ? ['w-full'] : [];
        
        // Custom classes
        const customClasses = this.options.className ? this.options.className.split(' ') : [];
        
        // Combine all classes
        const allClasses = [
            ...baseClasses,
            ...variantClasses,
            ...sizeClasses,
            ...widthClasses,
            ...customClasses
        ];
        
        this.element.className = allClasses.join(' ');
    }

    /**
     * Get variant-specific classes
     * @returns {Array} Array of CSS classes
     */
    getVariantClasses() {
        const variants = {
            primary: [
                'text-white',
                'bg-primary',
                'hover:bg-primary-dark',
                'focus:ring-primary',
                'shadow-sm',
                'hover:shadow-md'
            ],
            secondary: [
                'text-slate-700',
                'bg-slate-100',
                'hover:bg-slate-200',
                'focus:ring-slate-500',
                'dark:text-slate-300',
                'dark:bg-slate-700',
                'dark:hover:bg-slate-600'
            ],
            outline: [
                'text-primary',
                'bg-transparent',
                'border',
                'border-primary',
                'hover:bg-primary',
                'hover:text-white',
                'focus:ring-primary'
            ],
            ghost: [
                'text-slate-600',
                'bg-transparent',
                'hover:bg-slate-100',
                'hover:text-slate-900',
                'focus:ring-slate-500',
                'dark:text-slate-400',
                'dark:hover:bg-slate-800',
                'dark:hover:text-slate-100'
            ],
            danger: [
                'text-white',
                'bg-red-600',
                'hover:bg-red-700',
                'focus:ring-red-500',
                'shadow-sm',
                'hover:shadow-md'
            ],
            success: [
                'text-white',
                'bg-green-600',
                'hover:bg-green-700',
                'focus:ring-green-500',
                'shadow-sm',
                'hover:shadow-md'
            ],
            warning: [
                'text-white',
                'bg-yellow-600',
                'hover:bg-yellow-700',
                'focus:ring-yellow-500',
                'shadow-sm',
                'hover:shadow-md'
            ]
        };

        return variants[this.options.variant] || variants.primary;
    }

    /**
     * Get size-specific classes
     * @returns {Array} Array of CSS classes
     */
    getSizeClasses() {
        const sizes = {
            small: ['text-sm', 'px-3', 'py-1.5', 'h-8'],
            medium: ['text-sm', 'px-4', 'py-2', 'h-10'],
            large: ['text-base', 'px-6', 'py-3', 'h-12'],
            xlarge: ['text-lg', 'px-8', 'py-4', 'h-14']
        };

        return sizes[this.options.size] || sizes.medium;
    }

    /**
     * Set button content with optional icon
     * @param {string} text - Button text
     */
    setContent(text) {
        if (!this.element) return;

        const content = [];

        // Add icon if specified
        if (this.options.icon && this.options.iconPosition === 'left') {
            content.push(this.createIcon());
        }

        // Add text
        if (text) {
            const textSpan = document.createElement('span');
            textSpan.textContent = text;
            content.push(textSpan);
        }

        // Add icon if specified (right position)
        if (this.options.icon && this.options.iconPosition === 'right') {
            content.push(this.createIcon());
        }

        // Clear existing content and add new content
        this.element.innerHTML = '';
        content.forEach(item => {
            if (typeof item === 'string') {
                this.element.insertAdjacentHTML('beforeend', item);
            } else {
                this.element.appendChild(item);
            }
        });
    }

    /**
     * Create icon element
     * @returns {HTMLElement} Icon element
     */
    createIcon() {
        const iconContainer = document.createElement('span');
        iconContainer.className = 'flex-shrink-0';
        
        if (this.options.iconPosition === 'left') {
            iconContainer.classList.add('mr-2');
        } else {
            iconContainer.classList.add('ml-2');
        }

        if (typeof this.options.icon === 'string') {
            // SVG string or HTML
            iconContainer.innerHTML = this.options.icon;
        } else if (this.options.icon instanceof HTMLElement) {
            // DOM element
            iconContainer.appendChild(this.options.icon);
        }

        return iconContainer;
    }

    /**
     * Create loading spinner
     * @returns {HTMLElement} Spinner element
     */
    createLoadingSpinner() {
        const spinner = document.createElement('span');
        spinner.className = 'flex-shrink-0 mr-2';
        spinner.innerHTML = `
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;
        return spinner;
    }

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoading(loading) {
        if (!this.element) return;

        this.options.loading = loading;
        this.element.disabled = loading || this.options.disabled;

        if (loading) {
            // Store original content
            this.originalContent = this.element.innerHTML;
            
            // Create loading content
            this.loadingSpinner = this.createLoadingSpinner();
            this.element.innerHTML = '';
            this.element.appendChild(this.loadingSpinner);
            
            const loadingText = document.createElement('span');
            loadingText.textContent = 'Loading...';
            this.element.appendChild(loadingText);
        } else {
            // Restore original content
            if (this.originalContent) {
                this.element.innerHTML = this.originalContent;
            }
            this.loadingSpinner = null;
        }
    }

    /**
     * Set disabled state
     * @param {boolean} disabled - Disabled state
     */
    setDisabled(disabled) {
        if (!this.element) return;

        this.options.disabled = disabled;
        this.element.disabled = disabled || this.options.loading;
    }

    /**
     * Update button variant
     * @param {string} variant - New variant
     */
    setVariant(variant) {
        this.options.variant = variant;
        this.applyStyles();
    }

    /**
     * Update button size
     * @param {string} size - New size
     */
    setSize(size) {
        this.options.size = size;
        this.applyStyles();
    }

    /**
     * Add click event listener
     * @param {Function} handler - Click handler
     */
    onClick(handler) {
        if (this.element && typeof handler === 'function') {
            this.element.addEventListener('click', handler);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.element) return;

        // Add ripple effect on click
        this.element.addEventListener('click', (e) => {
            this.addRippleEffect(e);
        });

        // Add keyboard accessibility
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.element.click();
            }
        });
    }

    /**
     * Add ripple effect
     * @param {Event} event - Click event
     */
    addRippleEffect(event) {
        const button = this.element;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.className = 'absolute rounded-full bg-white opacity-30 pointer-events-none animate-ping';

        // Ensure button has relative positioning
        if (getComputedStyle(button).position === 'static') {
            button.style.position = 'relative';
        }

        button.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * Destroy button component
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.loadingSpinner = null;
        this.originalContent = null;
    }
}

// Export utility functions for creating common button types
export const createPrimaryButton = (text, options = {}) => {
    const button = new ButtonComponent({ ...options, variant: 'primary' });
    return button.create(text);
};

export const createSecondaryButton = (text, options = {}) => {
    const button = new ButtonComponent({ ...options, variant: 'secondary' });
    return button.create(text);
};

export const createOutlineButton = (text, options = {}) => {
    const button = new ButtonComponent({ ...options, variant: 'outline' });
    return button.create(text);
};

export const createDangerButton = (text, options = {}) => {
    const button = new ButtonComponent({ ...options, variant: 'danger' });
    return button.create(text);
};
