/**
 * Multi-Step Registration Form Controller
 * Handles step navigation, validation, and form submission
 */

class MultiStepRegistration {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.isSubmitting = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
        this.setupPasswordValidation();
        this.setupUserTypeToggle();
        this.setupGoogleAuth();
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        
        // Form submission
        document.getElementById('multiStepForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        // Email validation
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', () => this.validateEmail());

        // Password validation
        const passwordInput = document.getElementById('password');
        passwordInput.addEventListener('input', () => this.validatePassword());

        // Password confirmation
        const confirmPasswordInput = document.getElementById('confirm_password');
        confirmPasswordInput.addEventListener('input', () => this.validatePasswordConfirmation());

        // Phone validation
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', () => this.formatPhone());
    }

    setupPasswordValidation() {
        const passwordInput = document.getElementById('password');
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            if (password && window.AuthService) {
                const validation = window.AuthService.validatePassword(password);
                this.showPasswordStrength(validation);
            }
        });
    }

    setupUserTypeToggle() {
        const userTypeRadios = document.querySelectorAll('input[name="user_type"]');
        userTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateRadioStyling();
                this.updateBusinessFieldsVisibility();
            });
        });
    }

    setupGoogleAuth() {
        const googleBtn = document.getElementById('googleSignInBtn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleGoogleSignUp());
        }
    }

    async handleGoogleSignUp() {
        const userTypeRadio = document.querySelector('input[name="user_type"]:checked');
        const userType = userTypeRadio ? userTypeRadio.value : 'buyer';

        const googleBtn = document.getElementById('googleSignInBtn');
        const originalContent = googleBtn.innerHTML;
        
        googleBtn.disabled = true;
        googleBtn.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600 mr-2"></div>
                Signing up with Google...
            </div>
        `;

        try {
            if (window.AuthService) {
                const result = await window.AuthService.signInWithGoogle(userType);
                
                if (result.success) {
                    this.showSuccess('Account created successfully! Redirecting...');
                    
                    setTimeout(() => {
                        if (userType === 'seller') {
                            window.location.href = '../dashboard/seller-dashboard.html';
                        } else {
                            window.location.href = '../dashboard/buyer-dashboard.html';
                        }
                    }, 2000);
                } else {
                    throw new Error(result.error);
                }
            } else {
                throw new Error('Authentication service not available');
            }
        } catch (error) {
            console.error('Google sign-up error:', error);
            this.showError(error.message || 'Google sign-up failed. Please try again.');
        } finally {
            googleBtn.disabled = false;
            googleBtn.innerHTML = originalContent;
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateUI();
                this.populateReviewIfNeeded();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUI();
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateStep1();
            case 2:
                return this.validateStep2();
            case 3:
                return this.validateStep3();
            case 4:
                return this.validateStep4();
            default:
                return true;
        }
    }

    validateStep1() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const userType = document.querySelector('input[name="user_type"]:checked');

        let isValid = true;

        // Email validation
        if (!email || !this.isValidEmail(email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        } else {
            this.clearFieldError('email');
        }

        // Password validation
        if (window.AuthService) {
            const passwordValidation = window.AuthService.validatePassword(password);
            if (!passwordValidation.isValid) {
                this.showFieldError('password', passwordValidation.errors[0]);
                isValid = false;
            } else {
                this.clearFieldError('password');
            }
        }

        // Password confirmation
        if (password !== confirmPassword) {
            this.showFieldError('confirm_password', 'Passwords do not match');
            isValid = false;
        } else {
            this.clearFieldError('confirm_password');
        }

        // User type selection
        if (!userType) {
            this.showError('Please select whether you are a buyer or seller');
            isValid = false;
        }

        return isValid;
    }

    validateStep2() {
        const firstName = document.getElementById('first_name').value;
        const lastName = document.getElementById('last_name').value;
        const phone = document.getElementById('phone').value;

        let isValid = true;

        if (!firstName.trim()) {
            this.showFieldError('first_name', 'First name is required');
            isValid = false;
        } else {
            this.clearFieldError('first_name');
        }

        if (!lastName.trim()) {
            this.showFieldError('last_name', 'Last name is required');
            isValid = false;
        } else {
            this.clearFieldError('last_name');
        }

        if (!phone.trim()) {
            this.showFieldError('phone', 'Phone number is required');
            isValid = false;
        } else {
            this.clearFieldError('phone');
        }

        return isValid;
    }

    validateStep3() {
        const userType = this.formData.user_type || document.querySelector('input[name="user_type"]:checked')?.value;
        
        if (userType === 'seller') {
            const businessName = document.getElementById('business_name').value;
            
            if (!businessName.trim()) {
                this.showFieldError('business_name', 'Business name is required for sellers');
                return false;
            } else {
                this.clearFieldError('business_name');
            }
        }
        
        return true;
    }

    validateStep4() {
        const terms = document.getElementById('terms').checked;
        
        if (!terms) {
            this.showError('Please accept the terms and conditions');
            return false;
        }
        
        return true;
    }

    saveCurrentStepData() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) {
                    this.formData[input.name] = input.value;
                }
            } else if (input.type === 'checkbox') {
                this.formData[input.name] = input.checked;
            } else {
                this.formData[input.name] = input.value;
            }
        });
    }

    updateUI() {
        // Hide all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            const step = document.getElementById(`step-${i}`);
            if (step) {
                step.style.display = 'none';
            }
        }

        // Show current step
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
        }

        // Update progress indicators
        this.updateProgressIndicators();

        // Update navigation buttons
        this.updateNavigationButtons();

        // Update business fields visibility for step 3
        if (this.currentStep === 3) {
            this.updateBusinessFieldsVisibility();
        }
    }

    updateProgressIndicators() {
        for (let i = 1; i <= this.totalSteps; i++) {
            const indicator = document.getElementById(`step-${i}-indicator`);
            const progressBar = document.getElementById(`progress-bar-${i}`);
            
            if (indicator) {
                if (i < this.currentStep) {
                    // Completed step
                    indicator.className = 'flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white text-sm font-medium';
                    indicator.innerHTML = '✓';
                } else if (i === this.currentStep) {
                    // Current step
                    indicator.className = 'flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-medium';
                    indicator.innerHTML = i;
                } else {
                    // Future step
                    indicator.className = 'flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-sm font-medium';
                    indicator.innerHTML = i;
                }
            }

            if (progressBar) {
                const progress = i <= this.currentStep ? 100 : 0;
                progressBar.style.width = `${progress}%`;
            }
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        // Previous button
        if (this.currentStep === 1) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
        }

        // Next/Submit button
        if (this.currentStep === this.totalSteps) {
            nextBtn.innerHTML = 'Create Account';
            nextBtn.type = 'submit';
        } else {
            nextBtn.innerHTML = 'Next →';
            nextBtn.type = 'button';
        }
    }

    updateBusinessFieldsVisibility() {
        const userType = this.formData.user_type || document.querySelector('input[name="user_type"]:checked')?.value;
        const businessFields = document.getElementById('business-fields');
        const buyerFields = document.getElementById('buyer-fields');

        if (userType === 'seller') {
            businessFields.style.display = 'block';
            buyerFields.style.display = 'none';
        } else {
            businessFields.style.display = 'none';
            buyerFields.style.display = 'block';
        }
    }

    populateReviewIfNeeded() {
        if (this.currentStep === 4) {
            this.populateReviewContent();
        }
    }

    populateReviewContent() {
        const reviewContent = document.getElementById('review-content');
        const userType = this.formData.user_type;

        let html = `
            <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 class="font-semibold text-slate-900 dark:text-white mb-3">Account Information</h3>
                <div class="space-y-2 text-sm">
                    <div><span class="font-medium">Email:</span> ${this.formData.email || ''}</div>
                    <div><span class="font-medium">Account Type:</span> ${userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : ''}</div>
                </div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <h3 class="font-semibold text-slate-900 dark:text-white mb-3">Personal Information</h3>
                <div class="space-y-2 text-sm">
                    <div><span class="font-medium">Name:</span> ${this.formData.first_name || ''} ${this.formData.last_name || ''}</div>
                    <div><span class="font-medium">Phone:</span> ${this.formData.phone || ''}</div>
                    <div><span class="font-medium">Location:</span> ${this.formData.location || 'Not specified'}</div>
                </div>
            </div>
        `;

        if (userType === 'seller') {
            html += `
                <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 class="font-semibold text-slate-900 dark:text-white mb-3">Business Information</h3>
                    <div class="space-y-2 text-sm">
                        <div><span class="font-medium">Business Name:</span> ${this.formData.business_name || ''}</div>
                        <div><span class="font-medium">Business Type:</span> ${this.formData.business_type || 'Not specified'}</div>
                        <div><span class="font-medium">Industry:</span> ${this.formData.industry || 'Not specified'}</div>
                        <div><span class="font-medium">Annual Revenue:</span> ${this.formData.annual_revenue || 'Not specified'}</div>
                        <div><span class="font-medium">Employees:</span> ${this.formData.employee_count || 'Not specified'}</div>
                    </div>
                </div>
            `;
        }

        reviewContent.innerHTML = html;
    }

    async handleSubmit() {
        if (this.isSubmitting) return;
        
        this.saveCurrentStepData();
        
        if (!this.validateCurrentStep()) {
            return;
        }

        this.isSubmitting = true;
        const submitBtn = document.getElementById('nextBtn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
            </div>
        `;

        try {
            if (window.AuthService) {
                const result = await window.AuthService.register(this.formData);
                
                if (result.success) {
                    this.showSuccess('Account created successfully! Redirecting...');
                    
                    setTimeout(() => {
                        if (this.formData.user_type === 'seller') {
                            window.location.href = '../dashboard/seller-dashboard.html';
                        } else {
                            window.location.href = '../dashboard/buyer-dashboard.html';
                        }
                    }, 2000);
                } else {
                    throw new Error(result.error);
                }
            } else {
                throw new Error('Authentication service not available');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError(error.message || 'Registration failed. Please try again.');
        } finally {
            this.isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    // Utility methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    formatPhone() {
        const phoneInput = document.getElementById('phone');
        let value = phoneInput.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{3})/, '($1) $2');
        }
        
        phoneInput.value = value;
    }

    updateRadioStyling() {
        document.querySelectorAll('.radio-indicator').forEach(indicator => {
            indicator.classList.remove('bg-primary-dark', 'border-primary-dark');
            indicator.classList.add('border-slate-300');
        });

        const checkedRadio = document.querySelector('input[name="user_type"]:checked');
        if (checkedRadio) {
            const indicator = checkedRadio.parentElement.querySelector('.radio-indicator');
            indicator.classList.remove('border-slate-300');
            indicator.classList.add('bg-primary-dark', 'border-primary-dark');
        }
    }

    showPasswordStrength(validation) {
        const passwordInput = document.getElementById('password');
        const existingIndicator = document.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const strengthDiv = document.createElement('div');
        strengthDiv.className = 'password-strength mt-2';

        const strength = validation.strength;
        let strengthText = '';
        let strengthColor = '';

        if (strength < 30) {
            strengthText = 'Weak';
            strengthColor = 'bg-red-500';
        } else if (strength < 60) {
            strengthText = 'Fair';
            strengthColor = 'bg-yellow-500';
        } else if (strength < 80) {
            strengthText = 'Good';
            strengthColor = 'bg-blue-500';
        } else {
            strengthText = 'Strong';
            strengthColor = 'bg-green-500';
        }

        strengthDiv.innerHTML = `
            <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600 dark:text-slate-300">Password Strength: ${strengthText}</span>
                <span class="text-slate-500">${strength}%</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2 mt-1">
                <div class="${strengthColor} h-2 rounded-full transition-all duration-300" style="width: ${strength}%"></div>
            </div>
        `;

        if (validation.errors.length > 0) {
            const errorList = document.createElement('div');
            errorList.className = 'text-red-500 text-xs mt-1';
            errorList.innerHTML = validation.errors.map(error => `• ${error}`).join('<br>');
            strengthDiv.appendChild(errorList);
        }

        passwordInput.parentNode.appendChild(strengthDiv);
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        this.clearFieldError(fieldId);
        
        field.classList.add('border-red-500');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-red-500 text-xs mt-1';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        field.classList.remove('border-red-500');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        const existingMessage = document.querySelector('.message-alert');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message-alert fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
            type === 'error' 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
        }`;
        messageDiv.textContent = message;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    validateEmail() {
        const email = document.getElementById('email').value;
        if (email && !this.isValidEmail(email)) {
            this.showFieldError('email', 'Please enter a valid email address');
        } else {
            this.clearFieldError('email');
        }
    }

    validatePassword() {
        const password = document.getElementById('password').value;
        if (password && window.AuthService) {
            const validation = window.AuthService.validatePassword(password);
            if (!validation.isValid) {
                this.showFieldError('password', validation.errors[0]);
            } else {
                this.clearFieldError('password');
            }
        }
    }

    validatePasswordConfirmation() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.showFieldError('confirm_password', 'Passwords do not match');
        } else {
            this.clearFieldError('confirm_password');
        }
    }
}

// Initialize the multi-step form when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for AuthService to be available
    const initForm = () => {
        if (window.AuthService) {
            new MultiStepRegistration();
        } else {
            setTimeout(initForm, 100);
        }
    };
    
    initForm();
});
