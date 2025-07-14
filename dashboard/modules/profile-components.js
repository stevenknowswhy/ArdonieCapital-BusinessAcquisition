/**
 * Profile Components Module
 * Handles all profile page functionality including form management, validation, and UI updates
 */

class ProfileComponents {
    constructor() {
        this.profileService = null;
        this.profileValidator = null;
        this.errorHandler = null;
        this.currentProfile = null;
        this.activeTab = 'personal';
        this.formData = {};
        this.isLoading = false;
        this.validationEnabled = true;

        this.init();
    }

    /**
     * Initialize profile components
     */
    async init() {
        console.log('🔄 Initializing profile components...');

        try {
            // Wait for services to be available
            await this.waitForServices();

            // Load current profile
            await this.loadCurrentProfile();

            // Setup event listeners
            this.setupEventListeners();

            // Setup real-time validation
            this.setupRealTimeValidation();

            // Initialize UI
            this.initializeUI();

            // Load subscription data
            await this.loadSubscriptionData();

            console.log('✅ Profile components initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize profile components:', error);
            if (this.errorHandler) {
                this.errorHandler.handleError(error, { context: 'initialization' });
            } else {
                this.showError('Failed to load profile. Please refresh the page.');
            }
        }
    }

    /**
     * Wait for all required services to be available
     */
    async waitForServices() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;

            const checkServices = () => {
                const servicesReady = window.profileService &&
                                    window.profileValidator &&
                                    window.profileErrorHandler;

                if (servicesReady) {
                    this.profileService = window.profileService;
                    this.profileValidator = window.profileValidator;
                    this.errorHandler = window.profileErrorHandler;
                    resolve();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkServices, 100);
                } else {
                    reject(new Error('Required services not available'));
                }
            };

            checkServices();
        });
    }

    /**
     * Setup real-time validation for form fields
     */
    setupRealTimeValidation() {
        if (!this.validationEnabled || !this.profileValidator) return;

        // Personal info form fields
        const personalFields = [
            'first-name', 'last-name', 'phone', 'website',
            'linkedin', 'bio', 'company', 'location'
        ];

        personalFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                // Map field ID to validation field name
                const fieldName = this.mapFieldIdToValidationName(fieldId);

                field.addEventListener('blur', () => {
                    this.profileValidator.validateFieldRealTime(field, fieldName);
                });

                field.addEventListener('input', () => {
                    // Clear error state on input
                    field.classList.remove('border-red-500');
                    const errorElement = field.parentElement.querySelector('.field-error');
                    if (errorElement) {
                        errorElement.classList.add('hidden');
                    }
                });
            }
        });

        // Password fields
        const passwordFields = ['current-password', 'new-password', 'confirm-password'];
        passwordFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => {
                    this.validatePasswordField(field, fieldId);
                });
            }
        });
    }

    /**
     * Map field ID to validation field name
     */
    mapFieldIdToValidationName(fieldId) {
        const mapping = {
            'first-name': 'firstName',
            'last-name': 'lastName',
            'phone': 'phone',
            'website': 'website',
            'linkedin': 'linkedinUrl',
            'bio': 'bio',
            'company': 'company',
            'location': 'location'
        };

        return mapping[fieldId] || fieldId;
    }

    /**
     * Validate individual password field
     */
    validatePasswordField(field, fieldId) {
        if (!this.profileValidator) return;

        let validationResult;

        if (fieldId === 'new-password') {
            validationResult = this.profileValidator.validateField('password', field.value);
        } else if (fieldId === 'confirm-password') {
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = field.value;

            if (confirmPassword && newPassword !== confirmPassword) {
                validationResult = { isValid: false, errors: ['Passwords do not match'] };
            } else {
                validationResult = { isValid: true, errors: [] };
            }
        } else {
            // For current password, just check if it's not empty
            validationResult = {
                isValid: field.value.length > 0,
                errors: field.value.length === 0 ? ['Current password is required'] : []
            };
        }

        this.profileValidator.updateFieldUI(field, validationResult);
    }

    /**
     * Load current user profile
     */
    async loadCurrentProfile() {
        try {
            this.setLoading(true);

            console.log('🔄 Loading current user profile...');

            // Check if profile service is available
            if (!this.profileService) {
                throw new Error('Profile service not available');
            }

            console.log('✅ Profile service available, fetching profile...');
            const result = await this.profileService.getCurrentUserProfile();
            console.log('📊 Profile fetch result:', result);

            if (result && result.success) {
                this.currentProfile = result.data;
                console.log('✅ Profile data loaded:', this.currentProfile);
                this.populateProfileData();
                this.updateProfileDisplay();
            } else {
                console.error('❌ Profile fetch failed:', result);
                throw new Error(result?.error || 'Failed to load profile');
            }
        } catch (error) {
            console.error('❌ Load profile error:', error);

            // Show detailed error information
            const errorMessage = `Failed to load profile: ${error.message}`;
            this.showError(errorMessage);

            // Try to show some default data to prevent stuck loading state
            this.showDefaultProfileData();
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Show default profile data when loading fails
     */
    showDefaultProfileData() {
        console.log('🔄 Showing default profile data...');

        // Set default values to prevent "Loading..." from being stuck
        this.setTextContent('profile-display-name', 'User Profile');
        this.setTextContent('profile-role-badge', 'User');
        this.setTextContent('member-since', 'Unknown');
        this.setTextContent('email-verified', '❌ Not Available');
        this.setTextContent('last-login', 'Unknown');
        this.setTextContent('verification-status', 'Unable to verify email status');

        // Try to get basic user info from Supabase directly
        this.loadBasicUserInfo();
    }

    /**
     * Load basic user info directly from Supabase
     */
    async loadBasicUserInfo() {
        try {
            console.log('🔄 Attempting to load basic user info...');

            if (window.supabaseService && window.supabaseService.getCurrentUser) {
                const userResult = await window.supabaseService.getCurrentUser();
                console.log('👤 User result:', userResult);

                if (userResult && userResult.success && userResult.user) {
                    const user = userResult.user;

                    // Update display with available user data
                    this.setTextContent('profile-display-name', user.email || 'User');
                    this.setFieldValue('email', user.email || '');
                    this.setTextContent('email-verified', user.email_confirmed_at ? '✅ Verified' : '❌ Not Verified');
                    this.setTextContent('member-since', user.created_at ? this.formatDate(user.created_at) : 'Unknown');
                    this.setTextContent('last-login', user.last_sign_in_at ? this.formatDate(user.last_sign_in_at) : 'Unknown');

                    console.log('✅ Basic user info loaded successfully');
                } else {
                    console.log('⚠️ No user session found');
                    this.setTextContent('profile-display-name', 'Not Logged In');
                }
            }
        } catch (error) {
            console.error('❌ Failed to load basic user info:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Avatar upload
        const avatarUpload = document.getElementById('avatar-upload');
        const avatarContainer = document.querySelector('.profile-avatar-upload');
        
        if (avatarContainer && avatarUpload) {
            avatarContainer.addEventListener('click', () => {
                avatarUpload.click();
            });
            
            avatarUpload.addEventListener('change', (e) => {
                this.handleAvatarUpload(e.target.files[0]);
            });
        }

        // Personal info form
        const personalForm = document.getElementById('personal-info-form');
        if (personalForm) {
            personalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePersonalInfoSubmit();
            });
        }

        // Password form
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordChange();
            });
        }

        // Preferences
        const savePreferencesBtn = document.getElementById('save-preferences');
        if (savePreferencesBtn) {
            savePreferencesBtn.addEventListener('click', () => {
                this.handlePreferencesSave();
            });
        }

        // Email verification
        const resendVerificationBtn = document.getElementById('resend-verification');
        if (resendVerificationBtn) {
            resendVerificationBtn.addEventListener('click', () => {
                this.handleResendVerification();
            });
        }

        // Account deletion
        const deleteAccountBtn = document.getElementById('delete-account');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                this.handleAccountDeletion();
            });
        }

        // Subscription management
        const cancelSubscriptionBtn = document.getElementById('cancel-subscription');
        if (cancelSubscriptionBtn) {
            cancelSubscriptionBtn.addEventListener('click', () => {
                this.handleCancelSubscription();
            });
        }

        const closeAccountBtn = document.getElementById('close-account');
        if (closeAccountBtn) {
            closeAccountBtn.addEventListener('click', () => {
                this.handleCloseAccount();
            });
        }

        const addPaymentMethodBtn = document.getElementById('add-payment-method');
        if (addPaymentMethodBtn) {
            addPaymentMethodBtn.addEventListener('click', () => {
                this.handleAddPaymentMethod();
            });
        }

        // Back to dashboard
        const backBtn = document.getElementById('back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.handleBackToDashboard();
            });
        }

        // Theme selection
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleThemeChange(e.target.value);
            });
        });
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        // Set current theme
        const currentTheme = localStorage.getItem('theme') || 'system';
        const themeRadio = document.querySelector(`input[name="theme"][value="${currentTheme}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
        }

        // Hide loading overlay
        const authLoading = document.getElementById('auth-loading');
        if (authLoading) {
            authLoading.style.display = 'none';
        }
    }

    /**
     * Populate profile data in forms
     */
    populateProfileData() {
        if (!this.currentProfile) return;

        const profile = this.currentProfile;

        // Personal information
        this.setFieldValue('first-name', profile.first_name);
        this.setFieldValue('last-name', profile.last_name);
        this.setFieldValue('email', profile.email);
        this.setFieldValue('phone', profile.phone);
        this.setFieldValue('location', profile.location);
        this.setFieldValue('company', profile.company);
        this.setFieldValue('bio', profile.bio);
        this.setFieldValue('website', profile.website);
        this.setFieldValue('linkedin', profile.linkedin_url);

        // Preferences
        const preferences = profile.business_details?.preferences || {};
        this.setCheckboxValue('email-notifications', preferences.emailNotifications !== false);
        this.setCheckboxValue('listing-alerts', preferences.listingAlerts !== false);
        this.setCheckboxValue('message-notifications', preferences.messageNotifications !== false);
    }

    /**
     * Update profile display elements
     */
    updateProfileDisplay() {
        if (!this.currentProfile) return;

        const profile = this.currentProfile;

        // Display name
        const displayName = this.formatDisplayName(profile);
        this.setTextContent('profile-display-name', displayName);

        // Role badge
        const roleText = this.formatRole(profile.role);
        this.setTextContent('profile-role-badge', roleText);

        // Member since
        const memberSince = this.formatDate(profile.createdAt);
        this.setTextContent('member-since', memberSince);

        // Email verified
        const verifiedText = profile.emailVerified ? '✅ Verified' : '❌ Not Verified';
        this.setTextContent('email-verified', verifiedText);
        
        // Show/hide resend verification button
        const resendBtn = document.getElementById('resend-verification');
        if (resendBtn) {
            resendBtn.style.display = profile.emailVerified ? 'none' : 'block';
        }

        // Last login
        const lastLogin = this.formatDate(profile.lastSignIn);
        this.setTextContent('last-login', lastLogin);

        // Avatar
        this.updateAvatar(profile.avatar_url);

        // Verification status
        const verificationStatus = profile.emailVerified ? 
            'Your email is verified' : 
            'Please verify your email address';
        this.setTextContent('verification-status', verificationStatus);
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.remove('active', 'border-primary', 'text-primary');
            tab.classList.add('border-transparent', 'text-slate-500');
        });

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active', 'border-primary', 'text-primary');
            activeTab.classList.remove('border-transparent', 'text-slate-500');
        }

        // Show/hide tab content
        document.querySelectorAll('.profile-section').forEach(section => {
            section.classList.add('hidden');
        });

        const activeSection = document.getElementById(`${tabName}-tab`);
        if (activeSection) {
            activeSection.classList.remove('hidden');
        }

        this.activeTab = tabName;
    }

    /**
     * Handle avatar upload
     */
    async handleAvatarUpload(file) {
        if (!file) return;

        if (!this.profileValidator || !this.errorHandler) {
            this.showError('Validation services not available');
            return;
        }

        const avatarContainer = document.querySelector('.profile-avatar-upload');

        await this.errorHandler.handleAsyncOperation(
            async () => {
                // Validate file
                const validation = this.profileValidator.validateFile(file, {
                    maxSize: 5 * 1024 * 1024, // 5MB
                    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                });

                if (!validation.isValid) {
                    throw new Error(validation.errors.join(', '));
                }

                // Upload avatar
                const result = await this.profileService.uploadAvatar(file);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to upload avatar');
                }

                // Update avatar display
                this.updateAvatar(result.data.avatarUrl);

                // Update current profile
                this.currentProfile.avatar_url = result.data.avatarUrl;

                return result;
            },
            {
                loadingElement: avatarContainer,
                successMessage: 'Avatar updated successfully',
                errorContext: 'avatar-upload',
                retryable: true
            }
        );

        // Clear the file input
        const fileInput = document.getElementById('avatar-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    /**
     * Handle personal info form submission
     */
    async handlePersonalInfoSubmit() {
        if (!this.profileValidator || !this.errorHandler) {
            this.showError('Validation services not available');
            return;
        }

        const form = document.getElementById('personal-info-form');
        const submitButton = form.querySelector('button[type="submit"]');

        await this.errorHandler.handleAsyncOperation(
            async () => {
                // Get form data
                const formData = this.getPersonalFormData();

                // Sanitize data
                const sanitizedData = this.profileValidator.sanitizeData(formData);

                // Validate data
                const validation = this.profileValidator.validatePersonalInfo(sanitizedData);
                if (!validation.isValid) {
                    this.errorHandler.handleValidationErrors(validation, form);
                    throw new Error('Validation failed');
                }

                // Update profile
                const result = await this.profileService.updateProfile(sanitizedData);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to update profile');
                }

                // Update current profile
                Object.assign(this.currentProfile, sanitizedData);
                this.updateProfileDisplay();

                return result;
            },
            {
                loadingElement: submitButton,
                successMessage: 'Profile updated successfully',
                errorContext: 'profile-update',
                retryable: true
            }
        );
    }

    /**
     * Handle password change
     */
    async handlePasswordChange() {
        if (!this.profileValidator || !this.errorHandler) {
            this.showError('Validation services not available');
            return;
        }

        const form = document.getElementById('password-form');
        const submitButton = form.querySelector('button[type="submit"]');

        await this.errorHandler.handleAsyncOperation(
            async () => {
                const passwordData = {
                    currentPassword: this.getFieldValue('current-password'),
                    newPassword: this.getFieldValue('new-password'),
                    confirmPassword: this.getFieldValue('confirm-password')
                };

                // Validate password data
                const validation = this.profileValidator.validatePasswordChange(passwordData);
                if (!validation.isValid) {
                    this.errorHandler.handleValidationErrors(validation, form);
                    throw new Error('Password validation failed');
                }

                // Change password
                const result = await this.profileService.changePassword(
                    passwordData.currentPassword,
                    passwordData.newPassword
                );

                if (!result.success) {
                    throw new Error(result.error || 'Failed to update password');
                }

                // Clear form on success
                form.reset();

                // Clear any validation styling
                form.querySelectorAll('input').forEach(input => {
                    input.classList.remove('border-red-500', 'border-green-500');
                });

                return result;
            },
            {
                loadingElement: submitButton,
                successMessage: 'Password updated successfully',
                errorContext: 'password-change',
                retryable: false // Password changes shouldn't be retried automatically
            }
        );
    }

    /**
     * Handle preferences save
     */
    async handlePreferencesSave() {
        try {
            this.setLoading(true);
            
            const preferences = {
                emailNotifications: this.getCheckboxValue('email-notifications'),
                listingAlerts: this.getCheckboxValue('listing-alerts'),
                messageNotifications: this.getCheckboxValue('message-notifications')
            };

            const result = await this.profileService.updatePreferences(preferences);
            
            if (result.success) {
                this.showSuccess('Preferences saved successfully');
            } else {
                this.showError(result.error || 'Failed to save preferences');
            }
        } catch (error) {
            console.error('Preferences save error:', error);
            this.showError('Failed to save preferences');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle email verification resend
     */
    async handleResendVerification() {
        try {
            this.setLoading(true);

            const result = await this.profileService.resendEmailVerification();

            if (result.success) {
                this.showSuccess('Verification email sent successfully');
            } else {
                this.showError(result.error || 'Failed to send verification email');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            this.showError('Failed to send verification email');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle account deletion
     */
    async handleAccountDeletion() {
        const confirmed = confirm(
            'Are you sure you want to delete your account? This action cannot be undone.\n\n' +
            'Type "DELETE" in the next prompt to confirm.'
        );

        if (!confirmed) return;

        const confirmationText = prompt('Type "DELETE" to confirm account deletion:');

        if (confirmationText !== 'DELETE') {
            this.showError('Account deletion cancelled - incorrect confirmation text');
            return;
        }

        try {
            this.setLoading(true);

            const result = await this.profileService.deleteAccount(confirmationText);

            if (result.success) {
                alert('Account deleted successfully. You will be redirected to the home page.');
                window.location.href = '../index.html';
            } else {
                this.showError(result.error || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Account deletion error:', error);
            this.showError('Failed to delete account');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle back to dashboard navigation
     */
    handleBackToDashboard() {
        // Determine which dashboard to return to based on user role
        if (!this.currentProfile) {
            window.location.href = '../index.html';
            return;
        }

        const role = this.currentProfile.role;
        let dashboardUrl = '../index.html';

        switch (role) {
            case 'buyer':
                dashboardUrl = './buyer-dashboard.html';
                break;
            case 'seller':
                dashboardUrl = './seller-dashboard.html';
                break;
            case 'admin':
                dashboardUrl = './super-admin-dashboard.html';
                break;
            default:
                dashboardUrl = './buyer-dashboard.html';
        }

        window.location.href = dashboardUrl;
    }

    /**
     * Handle theme change
     */
    handleThemeChange(theme) {
        localStorage.setItem('theme', theme);

        // Apply theme immediately
        const html = document.documentElement;

        if (theme === 'dark') {
            html.classList.add('dark');
        } else if (theme === 'light') {
            html.classList.remove('dark');
        } else { // system
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemPrefersDark) {
                html.classList.add('dark');
            } else {
                html.classList.remove('dark');
            }
        }

        this.showSuccess('Theme updated successfully');
    }

    /**
     * Get personal form data
     */
    getPersonalFormData() {
        return {
            first_name: this.getFieldValue('first-name'),
            last_name: this.getFieldValue('last-name'),
            phone: this.getFieldValue('phone'),
            location: this.getFieldValue('location'),
            company: this.getFieldValue('company'),
            bio: this.getFieldValue('bio'),
            website: this.getFieldValue('website'),
            linkedin_url: this.getFieldValue('linkedin')
        };
    }

    /**
     * Validate personal data
     */
    validatePersonalData(data) {
        const errors = [];

        if (!data.first_name || data.first_name.trim().length === 0) {
            errors.push('First name is required');
        }

        if (!data.last_name || data.last_name.trim().length === 0) {
            errors.push('Last name is required');
        }

        if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone)) {
            errors.push('Please enter a valid phone number');
        }

        if (data.website && !/^https?:\/\/.+/.test(data.website)) {
            errors.push('Website must be a valid URL starting with http:// or https://');
        }

        if (data.linkedin_url && !/^https?:\/\/.+/.test(data.linkedin_url)) {
            errors.push('LinkedIn URL must be a valid URL starting with http:// or https://');
        }

        if (data.bio && data.bio.length > 500) {
            errors.push('Bio must be no more than 500 characters');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate avatar file
     */
    validateAvatarFile(file) {
        const errors = [];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            errors.push('File must be a valid image (JPEG, PNG, GIF, or WebP)');
        }

        if (file.size > maxSize) {
            errors.push('File size must be less than 5MB');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Update avatar display
     */
    updateAvatar(avatarUrl) {
        const avatarImg = document.getElementById('user-avatar');
        const defaultAvatar = document.getElementById('default-avatar');

        if (avatarUrl && avatarImg && defaultAvatar) {
            avatarImg.src = avatarUrl;
            avatarImg.classList.remove('hidden');
            defaultAvatar.classList.add('hidden');
        } else if (avatarImg && defaultAvatar) {
            avatarImg.classList.add('hidden');
            defaultAvatar.classList.remove('hidden');
        }
    }

    /**
     * Format display name
     */
    formatDisplayName(profile) {
        if (!profile) return 'Unknown User';

        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';

        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        } else if (firstName) {
            return firstName;
        } else if (lastName) {
            return lastName;
        } else {
            return profile.email || 'Unknown User';
        }
    }

    /**
     * Format role for display
     */
    formatRole(role) {
        const roleMap = {
            'buyer': 'Express Buyer',
            'seller': 'Express Seller',
            'vendor': 'Vendor Partner',
            'admin': 'Administrator'
        };

        return roleMap[role] || 'User';
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return 'Unknown';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Unknown';
        }
    }

    /**
     * Utility methods for DOM manipulation
     */
    setFieldValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
        }
    }

    getFieldValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    }

    setCheckboxValue(id, checked) {
        const element = document.getElementById(id);
        if (element) {
            element.checked = checked;
        }
    }

    getCheckboxValue(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    }

    setTextContent(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text || '';
        }
    }

    setLoading(loading) {
        this.isLoading = loading;

        // Update loading states for buttons
        const buttons = document.querySelectorAll('button[type="submit"], #save-preferences, #resend-verification');
        buttons.forEach(button => {
            if (loading) {
                button.disabled = true;
                button.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                button.disabled = false;
                button.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `mb-4 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;

        if (type === 'success') {
            toast.className += ' bg-green-500 text-white';
        } else if (type === 'error') {
            toast.className += ' bg-red-500 text-white';
        } else {
            toast.className += ' bg-blue-500 text-white';
        }

        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, 5000);
    }

    /**
     * Handle subscription cancellation
     */
    async handleCancelSubscription() {
        const confirmed = confirm(
            'Are you sure you want to cancel your subscription?\n\n' +
            'You will continue to have access until the end of your current billing period.'
        );

        if (!confirmed) return;

        try {
            this.setLoading(true);

            // TODO: Implement actual subscription cancellation
            // For now, show a success message
            this.showSuccess('Subscription cancellation request submitted. You will receive a confirmation email shortly.');

            // Update UI to show cancelled status
            this.updateSubscriptionStatus('cancelled');

        } catch (error) {
            console.error('Cancel subscription error:', error);
            this.showError('Failed to cancel subscription. Please try again or contact support.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle account closure
     */
    async handleCloseAccount() {
        const confirmed = confirm(
            'Are you sure you want to permanently close your account?\n\n' +
            'This will delete all your data and cannot be undone.\n\n' +
            'Type "CLOSE ACCOUNT" in the next prompt to confirm.'
        );

        if (!confirmed) return;

        const confirmationText = prompt('Type "CLOSE ACCOUNT" to confirm permanent account closure:');

        if (confirmationText !== 'CLOSE ACCOUNT') {
            this.showError('Account closure cancelled - incorrect confirmation text');
            return;
        }

        try {
            this.setLoading(true);

            // TODO: Implement actual account closure
            // For now, show a message and redirect
            alert('Account closure request submitted. You will be logged out and receive a confirmation email.');
            window.location.href = '../index.html';

        } catch (error) {
            console.error('Close account error:', error);
            this.showError('Failed to close account. Please contact support.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle adding payment method
     */
    async handleAddPaymentMethod() {
        try {
            // TODO: Integrate with payment processor (Stripe, etc.)
            // For now, show a placeholder message
            this.showSuccess('Payment method setup will be available soon. Please contact support for premium upgrades.');

        } catch (error) {
            console.error('Add payment method error:', error);
            this.showError('Failed to add payment method. Please try again.');
        }
    }

    /**
     * Update subscription status in UI
     */
    updateSubscriptionStatus(status) {
        const statusBadge = document.getElementById('subscription-status-badge');
        const statusText = document.getElementById('subscription-status-text');
        const description = document.getElementById('subscription-description');

        if (status === 'cancelled') {
            if (statusBadge) {
                statusBadge.className = 'px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
                statusBadge.textContent = 'Cancelled';
            }
            if (statusText) {
                statusText.textContent = 'Ends soon';
            }
            if (description) {
                description.textContent = 'Your subscription will end at the next billing cycle';
            }
        }
    }

    /**
     * Load subscription data
     */
    async loadSubscriptionData() {
        try {
            // TODO: Implement actual subscription data loading
            // For now, show default free plan data
            console.log('Loading subscription data...');

            // Update usage stats with mock data
            this.setTextContent('listings-count', '2');
            this.setTextContent('messages-count', '15');
            this.setTextContent('premium-features', '0');

        } catch (error) {
            console.error('Failed to load subscription data:', error);
        }
    }
}

// Global functions for subscription management
window.upgradeToPlan = function(planType) {
    console.log(`Upgrading to ${planType} plan...`);

    if (window.profileComponents) {
        window.profileComponents.showSuccess(`${planType.charAt(0).toUpperCase() + planType.slice(1)} plan upgrade will be available soon. Please contact support for immediate upgrades.`);
    } else {
        alert(`${planType.charAt(0).toUpperCase() + planType.slice(1)} plan upgrade will be available soon. Please contact support.`);
    }
};

// Initialize profile components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileComponents = new ProfileComponents();
});

// Export for use in other modules
export { ProfileComponents };
export default ProfileComponents;
