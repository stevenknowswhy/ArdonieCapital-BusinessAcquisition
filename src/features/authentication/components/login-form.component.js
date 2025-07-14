
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


// Password strength requirements
const validatePassword = (password) => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Login Form Component
// Reusable login form with validation and submission handling

import { authService } from '../services/auth.service.js';

export class LoginForm {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            redirectUrl: '/dashboard/',
            showRememberMe: true,
            showForgotPassword: true,
            ...options
        };
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <form id="login-form" class="space-y-6">
                <div>
                    <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email Address
                    </label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required 
                        class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:text-white"
                        placeholder="Enter your email"
                    >
                    <div id="email-error" class="text-red-500 text-sm mt-1 hidden"></div>
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Password
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required 
                        class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:text-white"
                        placeholder="Enter your password"
                    >
                    <div id="password-error" class="text-red-500 text-sm mt-1 hidden"></div>
                </div>

                ${this.options.showRememberMe ? `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input 
                            id="remember-me" 
                            name="remember-me" 
                            type="checkbox" 
                            class="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                        >
                        <label for="remember-me" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                            Remember me
                        </label>
                    </div>
                    ${this.options.showForgotPassword ? `
                    <div class="text-sm">
                        <a href="/auth/forgot-password.html" class="font-medium text-primary hover:text-primary-dark">
                            Forgot your password?
                        </a>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                <div>
                    <button 
                        type="submit" 
                        id="login-button"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span id="login-text">Sign In</span>
                        <span id="login-spinner" class="hidden ml-2">
                            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </span>
                    </button>
                </div>

                <div id="login-error" class="text-red-500 text-sm text-center hidden"></div>
            </form>
        `;
    }

    attachEventListeners() {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('remember-me') === 'on'
        };

        if (!this.validateForm(credentials)) {
            return;
        }

        this.setLoading(true);
        this.clearErrors();

        try {
            await authService.login(credentials);
            window.location.href = this.options.redirectUrl;
        } catch (error) {
            this.showError('Invalid email or password. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    validateForm(credentials) {
        let isValid = true;

        // Email validation
        if (!credentials.email || !this.isValidEmail(credentials.email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Password validation
        if (!credentials.password || credentials.password.length < 6) {
            this.showFieldError('password', 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setLoading(loading) {
        const button = document.getElementById('login-button');
        const text = document.getElementById('login-text');
        const spinner = document.getElementById('login-spinner');

        button.disabled = loading;
        text.textContent = loading ? 'Signing In...' : 'Sign In';
        spinner.classList.toggle('hidden', !loading);
    }

    showError(message) {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    showFieldError(fieldName, message) {
        const errorDiv = document.getElementById(`${fieldName}-error`);
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    clearErrors() {
        const errorDivs = this.container.querySelectorAll('[id$="-error"]');
        errorDivs.forEach(div => {
            div.textContent = '';
            div.classList.add('hidden');
        });
    }
}
