
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
 * Modal Component
 * Reusable modal dialog component with accessibility and animation support
 */

export class ModalComponent {
    constructor(options = {}) {
        this.options = {
            size: 'medium',
            closable: true,
            closeOnOverlay: true,
            closeOnEscape: true,
            showHeader: true,
            showFooter: false,
            animation: 'fade',
            backdrop: true,
            className: '',
            ...options
        };
        
        this.element = null;
        this.overlay = null;
        this.dialog = null;
        this.isOpen = false;
        this.focusableElements = [];
        this.previousFocus = null;
        this.onCloseCallback = null;
        this.onOpenCallback = null;
    }

    /**
     * Create modal element
     * @param {Object} content - Modal content
     * @returns {HTMLElement} Modal element
     */
    create(content = {}) {
        this.element = document.createElement('div');
        this.element.className = 'modal-container fixed inset-0 z-50 hidden';
        this.element.setAttribute('role', 'dialog');
        this.element.setAttribute('aria-modal', 'true');
        this.element.setAttribute('aria-hidden', 'true');

        // Create overlay
        this.createOverlay();
        
        // Create dialog
        this.createDialog(content);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Append to body
        document.body.appendChild(this.element);
        
        return this.element;
    }

    /**
     * Create modal overlay
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay absolute inset-0 bg-black transition-opacity duration-300';

        if (this.options.backdrop) {
            this.overlay.classList.add('modal-backdrop-enhanced');
        } else {
            this.overlay.classList.add('bg-opacity-0');
        }

        this.element.appendChild(this.overlay);
    }

    /**
     * Create modal dialog
     * @param {Object} content - Modal content
     */
    createDialog(content) {
        this.dialog = document.createElement('div');
        this.dialog.className = this.getDialogClasses();
        
        // Create dialog content
        const dialogContent = document.createElement('div');
        dialogContent.className = 'modal-content bg-white dark:bg-slate-800 rounded-lg shadow-xl transform transition-all duration-300 scale-95 opacity-0';
        
        // Add header
        if (this.options.showHeader) {
            dialogContent.appendChild(this.createHeader(content.title, content.subtitle));
        }
        
        // Add body
        dialogContent.appendChild(this.createBody(content.body));
        
        // Add footer
        if (this.options.showFooter && content.footer) {
            dialogContent.appendChild(this.createFooter(content.footer));
        }
        
        this.dialog.appendChild(dialogContent);
        this.element.appendChild(this.dialog);
    }

    /**
     * Get dialog CSS classes based on size
     * @returns {string} CSS classes
     */
    getDialogClasses() {
        const baseClasses = [
            'modal-dialog',
            'relative',
            'flex',
            'items-center',
            'justify-center',
            'min-h-full',
            'p-4',
            'text-center',
            'sm:p-0'
        ];

        const sizeClasses = this.getSizeClasses();
        const customClasses = this.options.className ? this.options.className.split(' ') : [];
        
        return [...baseClasses, ...sizeClasses, ...customClasses].join(' ');
    }

    /**
     * Get size-specific classes
     * @returns {Array} Array of CSS classes
     */
    getSizeClasses() {
        const sizes = {
            small: ['sm:max-w-sm'],
            medium: ['sm:max-w-lg'],
            large: ['sm:max-w-2xl'],
            xlarge: ['sm:max-w-4xl'],
            full: ['sm:max-w-full', 'sm:m-4']
        };

        return sizes[this.options.size] || sizes.medium;
    }

    /**
     * Create modal header
     * @param {string} title - Modal title
     * @param {string} subtitle - Modal subtitle
     * @returns {HTMLElement} Header element
     */
    createHeader(title, subtitle) {
        const header = document.createElement('div');
        header.className = 'modal-header px-6 py-4 border-b border-slate-200 dark:border-slate-700';
        
        const headerContent = document.createElement('div');
        headerContent.className = 'flex items-center justify-between';
        
        // Title section
        const titleSection = document.createElement('div');
        titleSection.className = 'text-left';
        
        if (title) {
            const titleElement = document.createElement('h3');
            titleElement.className = 'text-lg font-semibold text-slate-900 dark:text-white';
            titleElement.textContent = title;
            titleSection.appendChild(titleElement);
        }
        
        if (subtitle) {
            const subtitleElement = document.createElement('p');
            subtitleElement.className = 'mt-1 text-sm text-slate-600 dark:text-slate-400';
            subtitleElement.textContent = subtitle;
            titleSection.appendChild(subtitleElement);
        }
        
        headerContent.appendChild(titleSection);
        
        // Close button
        if (this.options.closable) {
            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.className = 'modal-close text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors';
            closeButton.setAttribute('aria-label', 'Close modal');
            closeButton.innerHTML = `
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            `;
            
            closeButton.addEventListener('click', () => this.close());
            headerContent.appendChild(closeButton);
        }
        
        header.appendChild(headerContent);
        return header;
    }

    /**
     * Create modal body
     * @param {string|HTMLElement} content - Body content
     * @returns {HTMLElement} Body element
     */
    createBody(content) {
        const body = document.createElement('div');
        body.className = 'modal-body px-6 py-4';
        
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        } else if (content) {
            body.textContent = content.toString();
        }
        
        return body;
    }

    /**
     * Create modal footer
     * @param {Array|HTMLElement} content - Footer content
     * @returns {HTMLElement} Footer element
     */
    createFooter(content) {
        const footer = document.createElement('div');
        footer.className = 'modal-footer px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3';
        
        if (Array.isArray(content)) {
            content.forEach(item => {
                if (item instanceof HTMLElement) {
                    footer.appendChild(item);
                }
            });
        } else if (content instanceof HTMLElement) {
            footer.appendChild(content);
        }
        
        return footer;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Overlay click to close
        if (this.options.closeOnOverlay) {
            this.overlay.addEventListener('click', () => this.close());
        }
        
        // Escape key to close
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
        }
        
        // Prevent dialog click from closing modal
        this.dialog.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Handle keyboard events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        if (!this.isOpen) return;
        
        if (event.key === 'Escape' && this.options.closeOnEscape) {
            this.close();
        } else if (event.key === 'Tab') {
            this.handleTabKey(event);
        }
    }

    /**
     * Handle tab key for focus management
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleTabKey(event) {
        const focusableElements = this.getFocusableElements();
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Get focusable elements within modal
     * @returns {Array} Array of focusable elements
     */
    getFocusableElements() {
        const selectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])'
        ];
        
        return Array.from(this.element.querySelectorAll(selectors.join(', ')));
    }

    /**
     * Open modal
     */
    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.previousFocus = document.activeElement;
        
        // Show modal
        this.element.classList.remove('hidden');
        this.element.setAttribute('aria-hidden', 'false');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Animate in
        requestAnimationFrame(() => {
            this.overlay.classList.remove('opacity-0');
            this.overlay.classList.add('opacity-100');
            
            const content = this.dialog.querySelector('.modal-content');
            if (content) {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }
        });
        
        // Focus management
        setTimeout(() => {
            const focusableElements = this.getFocusableElements();
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }, 100);
        
        // Callback
        if (this.onOpenCallback) {
            this.onOpenCallback();
        }
        
        // Dispatch event
        this.element.dispatchEvent(new CustomEvent('modalOpen'));
    }

    /**
     * Close modal
     */
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        // Animate out
        this.overlay.classList.remove('opacity-100');
        this.overlay.classList.add('opacity-0');
        
        const content = this.dialog.querySelector('.modal-content');
        if (content) {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
        }
        
        // Hide modal after animation
        setTimeout(() => {
            this.element.classList.add('hidden');
            this.element.setAttribute('aria-hidden', 'true');
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Restore focus
            if (this.previousFocus) {
                this.previousFocus.focus();
            }
        }, 300);
        
        // Callback
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
        
        // Dispatch event
        this.element.dispatchEvent(new CustomEvent('modalClose'));
    }

    /**
     * Set close callback
     * @param {Function} callback - Close callback
     */
    onClose(callback) {
        this.onCloseCallback = callback;
    }

    /**
     * Set open callback
     * @param {Function} callback - Open callback
     */
    onOpen(callback) {
        this.onOpenCallback = callback;
    }

    /**
     * Update modal content
     * @param {Object} content - New content
     */
    updateContent(content) {
        if (content.title || content.subtitle) {
            const header = this.element.querySelector('.modal-header');
            if (header) {
                header.replaceWith(this.createHeader(content.title, content.subtitle));
            }
        }
        
        if (content.body) {
            const body = this.element.querySelector('.modal-body');
            if (body) {
                body.replaceWith(this.createBody(content.body));
            }
        }
        
        if (content.footer) {
            const footer = this.element.querySelector('.modal-footer');
            if (footer) {
                footer.replaceWith(this.createFooter(content.footer));
            }
        }
    }

    /**
     * Destroy modal
     */
    destroy() {
        this.close();
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Remove from DOM
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.element = null;
        this.overlay = null;
        this.dialog = null;
    }
}

// Export utility functions for creating common modal types
export const createConfirmModal = (title, message, onConfirm, onCancel) => {
    const modal = new ModalComponent({ 
        size: 'small', 
        showFooter: true 
    });
    
    // Create footer buttons
    const cancelButton = document.createElement('button');
    cancelButton.className = 'px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => {
        modal.close();
        if (onCancel) onCancel();
    };
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700';
    confirmButton.textContent = 'Confirm';
    confirmButton.onclick = () => {
        modal.close();
        if (onConfirm) onConfirm();
    };
    
    modal.create({
        title: title,
        body: message,
        footer: [cancelButton, confirmButton]
    });
    
    return modal;
};

export const createAlertModal = (title, message) => {
    const modal = new ModalComponent({ 
        size: 'small', 
        showFooter: true 
    });
    
    const okButton = document.createElement('button');
    okButton.className = 'px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark';
    okButton.textContent = 'OK';
    okButton.onclick = () => modal.close();
    
    modal.create({
        title: title,
        body: message,
        footer: [okButton]
    });
    
    return modal;
};
