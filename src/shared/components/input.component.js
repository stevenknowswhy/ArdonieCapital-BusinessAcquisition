
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
 * Input Component
 * Reusable input component with validation, labels, and various input types
 */

import { validationUtils } from '../utils/validation.utils.js';

export class InputComponent {
    constructor(options = {}) {
        this.options = {
            type: 'text',
            size: 'medium',
            variant: 'default',
            label: '',
            placeholder: '',
            required: false,
            disabled: false,
            readonly: false,
            validation: null,
            helpText: '',
            errorText: '',
            showValidation: true,
            className: '',
            ...options
        };
        
        this.element = null;
        this.container = null;
        this.input = null;
        this.label = null;
        this.helpElement = null;
        this.errorElement = null;
        this.isValid = true;
        this.value = '';
        this.validators = [];
        this.changeHandlers = [];
        this.inputHandlers = [];
    }

    /**
     * Create input element
     * @param {Object} attributes - Additional attributes
     * @returns {HTMLElement} Input container element
     */
    create(attributes = {}) {
        this.container = document.createElement('div');
        this.container.className = 'input-container space-y-2';
        
        // Create label
        if (this.options.label) {
            this.label = this.createLabel();
            this.container.appendChild(this.label);
        }
        
        // Create input
        this.input = this.createInput(attributes);
        this.container.appendChild(this.input);
        
        // Create help text
        if (this.options.helpText) {
            this.helpElement = this.createHelpText();
            this.container.appendChild(this.helpElement);
        }
        
        // Create error element
        if (this.options.showValidation) {
            this.errorElement = this.createErrorElement();
            this.container.appendChild(this.errorElement);
        }
        
        // Setup validation
        this.setupValidation();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.element = this.container;
        return this.container;
    }

    /**
     * Create label element
     * @returns {HTMLElement} Label element
     */
    createLabel() {
        const label = document.createElement('label');
        label.className = 'block text-sm font-medium text-slate-700 dark:text-slate-300';
        label.textContent = this.options.label;
        
        if (this.options.required) {
            const required = document.createElement('span');
            required.className = 'text-red-500 ml-1';
            required.textContent = '*';
            label.appendChild(required);
        }
        
        return label;
    }

    /**
     * Create input element
     * @param {Object} attributes - Additional attributes
     * @returns {HTMLElement} Input element
     */
    createInput(attributes) {
        const input = document.createElement('input');
        input.type = this.options.type;
        input.placeholder = this.options.placeholder;
        input.required = this.options.required;
        input.disabled = this.options.disabled;
        input.readOnly = this.options.readonly;
        input.className = this.getInputClasses();
        
        // Apply additional attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                input.className += ` ${value}`;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    input.dataset[dataKey] = dataValue;
                });
            } else {
                input.setAttribute(key, value);
            }
        });
        
        // Link label to input
        if (this.label) {
            const inputId = attributes.id || `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            input.id = inputId;
            this.label.setAttribute('for', inputId);
        }
        
        return input;
    }

    /**
     * Get input CSS classes
     * @returns {string} CSS classes
     */
    getInputClasses() {
        const baseClasses = [
            'block',
            'w-full',
            'rounded-md',
            'border',
            'transition-colors',
            'duration-200',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-offset-2',
            'disabled:opacity-50',
            'disabled:cursor-not-allowed'
        ];
        
        // Variant classes
        const variantClasses = this.getVariantClasses();
        
        // Size classes
        const sizeClasses = this.getSizeClasses();
        
        // Validation classes
        const validationClasses = this.getValidationClasses();
        
        // Custom classes
        const customClasses = this.options.className ? this.options.className.split(' ') : [];
        
        return [
            ...baseClasses,
            ...variantClasses,
            ...sizeClasses,
            ...validationClasses,
            ...customClasses
        ].join(' ');
    }

    /**
     * Get variant-specific classes
     * @returns {Array} Array of CSS classes
     */
    getVariantClasses() {
        const variants = {
            default: [
                'border-slate-300',
                'bg-white',
                'text-slate-900',
                'placeholder-slate-400',
                'focus:border-primary',
                'focus:ring-primary',
                'dark:border-slate-600',
                'dark:bg-slate-700',
                'dark:text-white',
                'dark:placeholder-slate-400'
            ],
            success: [
                'border-green-300',
                'bg-green-50',
                'text-green-900',
                'placeholder-green-400',
                'focus:border-green-500',
                'focus:ring-green-500'
            ],
            error: [
                'border-red-300',
                'bg-red-50',
                'text-red-900',
                'placeholder-red-400',
                'focus:border-red-500',
                'focus:ring-red-500'
            ],
            warning: [
                'border-yellow-300',
                'bg-yellow-50',
                'text-yellow-900',
                'placeholder-yellow-400',
                'focus:border-yellow-500',
                'focus:ring-yellow-500'
            ]
        };

        return variants[this.options.variant] || variants.default;
    }

    /**
     * Get size-specific classes
     * @returns {Array} Array of CSS classes
     */
    getSizeClasses() {
        const sizes = {
            small: ['text-sm', 'px-3', 'py-1.5', 'h-8'],
            medium: ['text-sm', 'px-3', 'py-2', 'h-10'],
            large: ['text-base', 'px-4', 'py-3', 'h-12']
        };

        return sizes[this.options.size] || sizes.medium;
    }

    /**
     * Get validation-specific classes
     * @returns {Array} Array of CSS classes
     */
    getValidationClasses() {
        if (!this.options.showValidation) return [];
        
        if (this.isValid === false) {
            return ['border-red-300', 'focus:border-red-500', 'focus:ring-red-500'];
        } else if (this.isValid === true && this.value) {
            return ['border-green-300', 'focus:border-green-500', 'focus:ring-green-500'];
        }
        
        return [];
    }

    /**
     * Create help text element
     * @returns {HTMLElement} Help text element
     */
    createHelpText() {
        const help = document.createElement('p');
        help.className = 'text-sm text-slate-600 dark:text-slate-400';
        help.textContent = this.options.helpText;
        return help;
    }

    /**
     * Create error element
     * @returns {HTMLElement} Error element
     */
    createErrorElement() {
        const error = document.createElement('p');
        error.className = 'text-sm text-red-600 dark:text-red-400 hidden';
        return error;
    }

    /**
     * Setup validation
     */
    setupValidation() {
        // Add built-in validators
        if (this.options.required) {
            this.addValidator((value) => {
                const result = validationUtils.validateRequired(value, this.options.label || 'Field');
                return result.isValid ? null : result.error;
            });
        }
        
        if (this.options.type === 'email') {
            this.addValidator((value) => {
                if (!value) return null; // Skip if empty (handled by required validator)
                const result = validationUtils.validateEmail(value);
                return result.isValid ? null : result.error;
            });
        }
        
        if (this.options.type === 'tel') {
            this.addValidator((value) => {
                if (!value) return null;
                const result = validationUtils.validatePhone(value);
                return result.isValid ? null : result.error;
            });
        }
        
        if (this.options.type === 'url') {
            this.addValidator((value) => {
                if (!value) return null;
                const result = validationUtils.validateUrl(value);
                return result.isValid ? null : result.error;
            });
        }
        
        // Add custom validation
        if (this.options.validation && typeof this.options.validation === 'function') {
            this.addValidator(this.options.validation);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.input) return;
        
        // Input event for real-time validation
        this.input.addEventListener('input', (e) => {
            this.value = e.target.value;
            this.validate();
            this.notifyInputHandlers(e);
        });
        
        // Change event
        this.input.addEventListener('change', (e) => {
            this.value = e.target.value;
            this.validate();
            this.notifyChangeHandlers(e);
        });
        
        // Blur event for validation
        this.input.addEventListener('blur', () => {
            this.validate();
        });
    }

    /**
     * Add validator function
     * @param {Function} validator - Validator function
     */
    addValidator(validator) {
        if (typeof validator === 'function') {
            this.validators.push(validator);
        }
    }

    /**
     * Validate input value
     * @returns {boolean} Validation result
     */
    validate() {
        if (!this.options.showValidation) return true;
        
        const errors = [];
        
        for (const validator of this.validators) {
            const error = validator(this.value);
            if (error) {
                errors.push(error);
            }
        }
        
        this.isValid = errors.length === 0;
        this.updateValidationDisplay(errors);
        this.updateInputClasses();
        
        return this.isValid;
    }

    /**
     * Update validation display
     * @param {Array} errors - Array of error messages
     */
    updateValidationDisplay(errors) {
        if (!this.errorElement) return;
        
        if (errors.length > 0) {
            this.errorElement.textContent = errors[0];
            this.errorElement.classList.remove('hidden');
        } else {
            this.errorElement.classList.add('hidden');
        }
    }

    /**
     * Update input classes based on validation state
     */
    updateInputClasses() {
        if (!this.input) return;
        
        // Remove existing validation classes
        this.input.classList.remove(
            'border-red-300', 'focus:border-red-500', 'focus:ring-red-500',
            'border-green-300', 'focus:border-green-500', 'focus:ring-green-500'
        );
        
        // Add new validation classes
        const validationClasses = this.getValidationClasses();
        validationClasses.forEach(cls => this.input.classList.add(cls));
    }

    /**
     * Set input value
     * @param {string} value - New value
     */
    setValue(value) {
        this.value = value;
        if (this.input) {
            this.input.value = value;
            this.validate();
        }
    }

    /**
     * Get input value
     * @returns {string} Current value
     */
    getValue() {
        return this.input ? this.input.value : this.value;
    }

    /**
     * Set disabled state
     * @param {boolean} disabled - Disabled state
     */
    setDisabled(disabled) {
        this.options.disabled = disabled;
        if (this.input) {
            this.input.disabled = disabled;
        }
    }

    /**
     * Set error message
     * @param {string} message - Error message
     */
    setError(message) {
        this.isValid = false;
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.classList.remove('hidden');
        }
        this.updateInputClasses();
    }

    /**
     * Clear error
     */
    clearError() {
        this.isValid = true;
        if (this.errorElement) {
            this.errorElement.classList.add('hidden');
        }
        this.updateInputClasses();
    }

    /**
     * Add change event listener
     * @param {Function} handler - Change handler
     */
    onChange(handler) {
        if (typeof handler === 'function') {
            this.changeHandlers.push(handler);
        }
    }

    /**
     * Add input event listener
     * @param {Function} handler - Input handler
     */
    onInput(handler) {
        if (typeof handler === 'function') {
            this.inputHandlers.push(handler);
        }
    }

    /**
     * Notify change handlers
     * @param {Event} event - Change event
     */
    notifyChangeHandlers(event) {
        this.changeHandlers.forEach(handler => {
            try {
                handler(event, this.getValue());
            } catch (error) {
                console.error('Input change handler error:', error);
            }
        });
    }

    /**
     * Notify input handlers
     * @param {Event} event - Input event
     */
    notifyInputHandlers(event) {
        this.inputHandlers.forEach(handler => {
            try {
                handler(event, this.getValue());
            } catch (error) {
                console.error('Input handler error:', error);
            }
        });
    }

    /**
     * Focus input
     */
    focus() {
        if (this.input) {
            this.input.focus();
        }
    }

    /**
     * Destroy input component
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        this.element = null;
        this.container = null;
        this.input = null;
        this.label = null;
        this.helpElement = null;
        this.errorElement = null;
        this.validators = [];
        this.changeHandlers = [];
        this.inputHandlers = [];
    }
}

// Export utility functions for creating common input types
export const createEmailInput = (label, options = {}) => {
    const input = new InputComponent({ 
        ...options, 
        type: 'email', 
        label 
    });
    return input.create();
};

export const createPasswordInput = (label, options = {}) => {
    const input = new InputComponent({ 
        ...options, 
        type: 'password', 
        label 
    });
    return input.create();
};

export const createPhoneInput = (label, options = {}) => {
    const input = new InputComponent({ 
        ...options, 
        type: 'tel', 
        label 
    });
    return input.create();
};

export const createTextInput = (label, options = {}) => {
    const input = new InputComponent({ 
        ...options, 
        type: 'text', 
        label 
    });
    return input.create();
};
