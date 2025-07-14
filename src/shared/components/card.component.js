
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
 * Card Component
 * Reusable card component with header, body, and footer sections
 */

export class CardComponent {
    constructor(options = {}) {
        this.options = {
            variant: 'default',
            size: 'medium',
            shadow: 'medium',
            border: true,
            rounded: true,
            hoverable: false,
            clickable: false,
            className: '',
            ...options
        };
        
        this.element = null;
        this.header = null;
        this.body = null;
        this.footer = null;
        this.clickHandler = null;
    }

    /**
     * Create card element
     * @param {Object} content - Card content
     * @returns {HTMLElement} Card element
     */
    create(content = {}) {
        this.element = document.createElement('div');
        this.element.className = this.getCardClasses();
        
        // Add sections based on content
        if (content.header) {
            this.header = this.createHeader(content.header);
            this.element.appendChild(this.header);
        }
        
        if (content.body) {
            this.body = this.createBody(content.body);
            this.element.appendChild(this.body);
        }
        
        if (content.footer) {
            this.footer = this.createFooter(content.footer);
            this.element.appendChild(this.footer);
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        return this.element;
    }

    /**
     * Get card CSS classes
     * @returns {string} CSS classes
     */
    getCardClasses() {
        const baseClasses = ['card'];
        
        // Variant classes
        const variantClasses = this.getVariantClasses();
        
        // Size classes
        const sizeClasses = this.getSizeClasses();
        
        // Shadow classes
        const shadowClasses = this.getShadowClasses();
        
        // Border classes
        const borderClasses = this.options.border ? ['border', 'border-slate-200', 'dark:border-slate-700'] : [];
        
        // Rounded classes
        const roundedClasses = this.options.rounded ? ['rounded-lg'] : [];
        
        // Interactive classes
        const interactiveClasses = [];
        if (this.options.hoverable) {
            interactiveClasses.push('hover:shadow-lg', 'transition-shadow', 'duration-200');
        }
        if (this.options.clickable) {
            interactiveClasses.push('cursor-pointer', 'hover:bg-slate-50', 'dark:hover:bg-slate-800');
        }
        
        // Custom classes
        const customClasses = this.options.className ? this.options.className.split(' ') : [];
        
        return [
            ...baseClasses,
            ...variantClasses,
            ...sizeClasses,
            ...shadowClasses,
            ...borderClasses,
            ...roundedClasses,
            ...interactiveClasses,
            ...customClasses
        ].join(' ');
    }

    /**
     * Get variant-specific classes
     * @returns {Array} Array of CSS classes
     */
    getVariantClasses() {
        const variants = {
            default: ['bg-white', 'dark:bg-slate-800'],
            primary: ['bg-primary-50', 'border-primary-200', 'dark:bg-primary-900', 'dark:border-primary-700'],
            secondary: ['bg-slate-50', 'border-slate-200', 'dark:bg-slate-700', 'dark:border-slate-600'],
            success: ['bg-green-50', 'border-green-200', 'dark:bg-green-900', 'dark:border-green-700'],
            warning: ['bg-yellow-50', 'border-yellow-200', 'dark:bg-yellow-900', 'dark:border-yellow-700'],
            danger: ['bg-red-50', 'border-red-200', 'dark:bg-red-900', 'dark:border-red-700'],
            info: ['bg-blue-50', 'border-blue-200', 'dark:bg-blue-900', 'dark:border-blue-700']
        };

        return variants[this.options.variant] || variants.default;
    }

    /**
     * Get size-specific classes
     * @returns {Array} Array of CSS classes
     */
    getSizeClasses() {
        const sizes = {
            small: ['text-sm'],
            medium: ['text-base'],
            large: ['text-lg']
        };

        return sizes[this.options.size] || sizes.medium;
    }

    /**
     * Get shadow-specific classes
     * @returns {Array} Array of CSS classes
     */
    getShadowClasses() {
        const shadows = {
            none: [],
            small: ['shadow-sm'],
            medium: ['shadow-md'],
            large: ['shadow-lg'],
            xlarge: ['shadow-xl']
        };

        return shadows[this.options.shadow] || shadows.medium;
    }

    /**
     * Create card header
     * @param {Object} headerContent - Header content
     * @returns {HTMLElement} Header element
     */
    createHeader(headerContent) {
        const header = document.createElement('div');
        header.className = 'card-header px-6 py-4 border-b border-slate-200 dark:border-slate-700';
        
        if (typeof headerContent === 'string') {
            header.innerHTML = headerContent;
        } else if (headerContent instanceof HTMLElement) {
            header.appendChild(headerContent);
        } else if (typeof headerContent === 'object') {
            // Structured header content
            if (headerContent.title) {
                const title = document.createElement('h3');
                title.className = 'text-lg font-semibold text-slate-900 dark:text-white';
                title.textContent = headerContent.title;
                header.appendChild(title);
            }
            
            if (headerContent.subtitle) {
                const subtitle = document.createElement('p');
                subtitle.className = 'mt-1 text-sm text-slate-600 dark:text-slate-400';
                subtitle.textContent = headerContent.subtitle;
                header.appendChild(subtitle);
            }
            
            if (headerContent.actions) {
                const actions = document.createElement('div');
                actions.className = 'mt-2 flex space-x-2';
                
                if (Array.isArray(headerContent.actions)) {
                    headerContent.actions.forEach(action => {
                        if (action instanceof HTMLElement) {
                            actions.appendChild(action);
                        }
                    });
                } else if (headerContent.actions instanceof HTMLElement) {
                    actions.appendChild(headerContent.actions);
                }
                
                header.appendChild(actions);
            }
        }
        
        return header;
    }

    /**
     * Create card body
     * @param {string|HTMLElement|Object} bodyContent - Body content
     * @returns {HTMLElement} Body element
     */
    createBody(bodyContent) {
        const body = document.createElement('div');
        body.className = 'card-body px-6 py-4';
        
        if (typeof bodyContent === 'string') {
            body.innerHTML = bodyContent;
        } else if (bodyContent instanceof HTMLElement) {
            body.appendChild(bodyContent);
        } else if (typeof bodyContent === 'object') {
            // Structured body content
            if (bodyContent.content) {
                if (typeof bodyContent.content === 'string') {
                    body.innerHTML = bodyContent.content;
                } else if (bodyContent.content instanceof HTMLElement) {
                    body.appendChild(bodyContent.content);
                }
            }
            
            if (bodyContent.image) {
                const img = document.createElement('img');
                img.src = bodyContent.image.src;
                img.alt = bodyContent.image.alt || '';
                img.className = 'w-full h-48 object-cover rounded-md mb-4';
                body.insertBefore(img, body.firstChild);
            }
        }
        
        return body;
    }

    /**
     * Create card footer
     * @param {string|HTMLElement|Array} footerContent - Footer content
     * @returns {HTMLElement} Footer element
     */
    createFooter(footerContent) {
        const footer = document.createElement('div');
        footer.className = 'card-footer px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700';
        
        if (typeof footerContent === 'string') {
            footer.innerHTML = footerContent;
        } else if (footerContent instanceof HTMLElement) {
            footer.appendChild(footerContent);
        } else if (Array.isArray(footerContent)) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'flex justify-end space-x-3';
            
            footerContent.forEach(item => {
                if (item instanceof HTMLElement) {
                    buttonContainer.appendChild(item);
                }
            });
            
            footer.appendChild(buttonContainer);
        }
        
        return footer;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.options.clickable && this.clickHandler) {
            this.element.addEventListener('click', this.clickHandler);
            this.element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.clickHandler(e);
                }
            });
            
            // Make focusable
            this.element.setAttribute('tabindex', '0');
            this.element.setAttribute('role', 'button');
        }
    }

    /**
     * Set click handler
     * @param {Function} handler - Click handler
     */
    onClick(handler) {
        this.clickHandler = handler;
        this.options.clickable = true;
        this.setupEventListeners();
    }

    /**
     * Update card content
     * @param {Object} content - New content
     */
    updateContent(content) {
        if (content.header && this.header) {
            const newHeader = this.createHeader(content.header);
            this.header.replaceWith(newHeader);
            this.header = newHeader;
        }
        
        if (content.body && this.body) {
            const newBody = this.createBody(content.body);
            this.body.replaceWith(newBody);
            this.body = newBody;
        }
        
        if (content.footer && this.footer) {
            const newFooter = this.createFooter(content.footer);
            this.footer.replaceWith(newFooter);
            this.footer = newFooter;
        }
    }

    /**
     * Add loading state to card
     */
    setLoading(loading = true) {
        if (loading) {
            this.element.classList.add('opacity-50', 'pointer-events-none');
            
            // Add loading spinner
            const spinner = document.createElement('div');
            spinner.className = 'card-loading absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-slate-800 dark:bg-opacity-75';
            spinner.innerHTML = `
                <svg class="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            `;
            
            this.element.style.position = 'relative';
            this.element.appendChild(spinner);
        } else {
            this.element.classList.remove('opacity-50', 'pointer-events-none');
            
            const spinner = this.element.querySelector('.card-loading');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    /**
     * Destroy card component
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.element = null;
        this.header = null;
        this.body = null;
        this.footer = null;
        this.clickHandler = null;
    }
}

// Export utility functions for creating common card types
export const createInfoCard = (title, content, options = {}) => {
    const card = new CardComponent({ ...options, variant: 'info' });
    return card.create({
        header: { title },
        body: content
    });
};

export const createWarningCard = (title, content, options = {}) => {
    const card = new CardComponent({ ...options, variant: 'warning' });
    return card.create({
        header: { title },
        body: content
    });
};

export const createSuccessCard = (title, content, options = {}) => {
    const card = new CardComponent({ ...options, variant: 'success' });
    return card.create({
        header: { title },
        body: content
    });
};

export const createDangerCard = (title, content, options = {}) => {
    const card = new CardComponent({ ...options, variant: 'danger' });
    return card.create({
        header: { title },
        body: content
    });
};
