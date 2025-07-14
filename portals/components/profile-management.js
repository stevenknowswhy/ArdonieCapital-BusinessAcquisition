/**
 * Profile Management Component with Subscription Handling
 * Comprehensive user profile management with role-based features
 */

class ProfileManagement {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.userProfile = null;
        this.subscriptionInfo = null;
        this.roleBasedAuth = null;
        this.init();
    }

    async init() {
        console.log('👤 Initializing Profile Management...');
        
        // Wait for dependencies
        await this.waitForDependencies();
        
        // Check authentication
        if (!this.checkAuthentication()) {
            return;
        }
        
        // Initialize Supabase client
        this.initializeSupabase();
        
        // Load user data
        await this.loadUserData();
        
        // Setup UI
        this.setupUI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Profile Management initialized successfully');
    }

    async waitForDependencies(maxWait = 10000) {
        const startTime = Date.now();
        while ((!window.supabase || !window.roleBasedAuth) && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (!window.supabase || !window.roleBasedAuth) {
            throw new Error('Required dependencies not available');
        }
        this.roleBasedAuth = window.roleBasedAuth;
    }

    checkAuthentication() {
        if (!this.roleBasedAuth.requireAuthentication()) {
            return false;
        }
        this.currentUser = this.roleBasedAuth.getCurrentUser();
        return true;
    }

    initializeSupabase() {
        const SUPABASE_URL = 'https://pbydepsqcypwqbicnsco.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';
        
        this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized for profile management');
    }

    async loadUserData() {
        try {
            // Load user profile
            await this.loadUserProfile();
            
            // Load subscription information
            await this.loadSubscriptionInfo();
            
            // Load user roles (refresh from database)
            await this.roleBasedAuth.refreshRolesFromDatabase();

        } catch (error) {
            console.error('❌ Failed to load user data:', error);
        }
    }

    async loadUserProfile() {
        try {
            const { data: profile, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) {
                console.error('❌ Profile load error:', error);
                return;
            }

            this.userProfile = profile;
            console.log('✅ User profile loaded:', profile);

        } catch (error) {
            console.error('❌ Failed to load user profile:', error);
        }
    }

    async loadSubscriptionInfo() {
        try {
            const { data: subscription, error } = await this.supabase
                .from('user_subscriptions')
                .select(`
                    *,
                    subscription_tiers (
                        name,
                        slug,
                        price,
                        features,
                        limits
                    )
                `)
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active')
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('❌ Subscription load error:', error);
                return;
            }

            this.subscriptionInfo = subscription || {
                subscription_tiers: {
                    name: 'Free',
                    slug: 'free',
                    price: 0,
                    features: {},
                    limits: {}
                },
                status: 'free'
            };

            console.log('✅ Subscription info loaded:', this.subscriptionInfo);

        } catch (error) {
            console.error('❌ Failed to load subscription info:', error);
        }
    }

    setupUI() {
        this.renderProfileForm();
        this.renderSubscriptionInfo();
        this.renderRoleManagement();
        this.applyRoleBasedVisibility();
    }

    renderProfileForm() {
        const container = document.getElementById('profile-form-container');
        if (!container || !this.userProfile) return;

        container.innerHTML = `
            <form id="profile-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="first_name" class="block text-sm font-medium text-gray-700">First Name</label>
                        <input type="text" id="first_name" name="first_name" value="${this.userProfile.first_name || ''}" 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    </div>
                    <div>
                        <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name</label>
                        <input type="text" id="last_name" name="last_name" value="${this.userProfile.last_name || ''}" 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    </div>
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" name="email" value="${this.currentUser.email}" disabled
                           class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm">
                    <p class="mt-1 text-sm text-gray-500">Email cannot be changed. Contact support if needed.</p>
                </div>

                <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" id="phone" name="phone" value="${this.userProfile.phone || ''}" 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                </div>

                <div>
                    <label for="business_type" class="block text-sm font-medium text-gray-700">Business Type</label>
                    <select id="business_type" name="business_type" 
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="">Select Business Type</option>
                        <option value="auto_repair" ${this.userProfile.business_type === 'auto_repair' ? 'selected' : ''}>Auto Repair Shop</option>
                        <option value="automotive_service" ${this.userProfile.business_type === 'automotive_service' ? 'selected' : ''}>Automotive Service</option>
                        <option value="dealership" ${this.userProfile.business_type === 'dealership' ? 'selected' : ''}>Dealership</option>
                        <option value="parts_supplier" ${this.userProfile.business_type === 'parts_supplier' ? 'selected' : ''}>Parts Supplier</option>
                        <option value="other" ${this.userProfile.business_type === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>

                <div>
                    <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
                    <input type="text" id="location" name="location" value="${this.userProfile.location || ''}" 
                           placeholder="City, State"
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                </div>

                <div>
                    <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea id="bio" name="bio" rows="3" 
                              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                              placeholder="Tell us about yourself or your business...">${this.userProfile.bio || ''}</textarea>
                </div>

                <div class="flex justify-end space-x-3">
                    <button type="button" id="cancel-profile-edit" 
                            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                        Save Changes
                    </button>
                </div>
            </form>
        `;
    }

    renderSubscriptionInfo() {
        const container = document.getElementById('subscription-info-container');
        if (!container || !this.subscriptionInfo) return;

        const tier = this.subscriptionInfo.subscription_tiers;
        const isProUser = tier.slug === 'pro';

        container.innerHTML = `
            <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Current Plan</h3>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${
                        isProUser ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }">
                        ${tier.name}
                    </span>
                </div>

                <div class="space-y-4">
                    <div>
                        <p class="text-2xl font-bold text-gray-900">
                            $${tier.price || 0}<span class="text-sm font-normal text-gray-500">/month</span>
                        </p>
                    </div>

                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Plan Features</h4>
                        <ul class="space-y-1 text-sm text-gray-600">
                            ${this.renderPlanFeatures(tier)}
                        </ul>
                    </div>

                    ${!isProUser ? `
                        <div class="pt-4 border-t border-gray-200">
                            <button onclick="profileManagement.showUpgradeModal()" 
                                    class="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                                Upgrade to Pro
                            </button>
                        </div>
                    ` : `
                        <div class="pt-4 border-t border-gray-200">
                            <button onclick="profileManagement.showBillingModal()" 
                                    class="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
                                Manage Billing
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderPlanFeatures(tier) {
        const features = {
            'free': [
                'Basic listing search',
                'Contact sellers',
                'Save up to 5 listings',
                'Basic support'
            ],
            'pro': [
                'Advanced search filters',
                'Unlimited saved listings',
                'Express Deal eligibility',
                'Priority support',
                'Deal analytics',
                'Document management'
            ]
        };

        const planFeatures = features[tier.slug] || features['free'];
        return planFeatures.map(feature => `
            <li class="flex items-center">
                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                ${feature}
            </li>
        `).join('');
    }

    renderRoleManagement() {
        const container = document.getElementById('role-management-container');
        if (!container) return;

        const userRoles = this.roleBasedAuth.getUserRoles();
        const isAdmin = this.roleBasedAuth.hasAnyRole(['admin', 'super_admin']);

        container.innerHTML = `
            <div class="bg-white rounded-lg border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Roles</h3>
                
                <div class="space-y-3">
                    ${userRoles.map(role => `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <span class="font-medium text-gray-900">${this.getRoleDisplayName(role)}</span>
                                <p class="text-sm text-gray-600">${this.getRoleDescription(role)}</p>
                            </div>
                            <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                        </div>
                    `).join('')}
                </div>

                ${isAdmin ? `
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <button onclick="profileManagement.showRoleRequestModal()" 
                                class="text-primary-600 hover:text-primary-700 text-sm">
                            Request Additional Roles
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'buyer': 'Buyer',
            'seller': 'Seller',
            'vendor': 'Vendor',
            'admin': 'Administrator',
            'super_admin': 'Super Administrator',
            'blog_editor': 'Blog Editor',
            'blog_contributor': 'Blog Contributor'
        };
        return roleNames[role] || role;
    }

    getRoleDescription(role) {
        const descriptions = {
            'buyer': 'Search and purchase businesses',
            'seller': 'List and sell businesses',
            'vendor': 'Provide professional services',
            'admin': 'Manage platform operations',
            'super_admin': 'Full system administration',
            'blog_editor': 'Create and manage blog content',
            'blog_contributor': 'Write blog articles'
        };
        return descriptions[role] || 'Platform access';
    }

    applyRoleBasedVisibility() {
        // Apply role-based visibility to profile sections
        this.roleBasedAuth.applyRoleBasedVisibility();

        // Show/hide admin-only sections
        const adminSections = document.querySelectorAll('[data-admin-only]');
        const isAdmin = this.roleBasedAuth.hasAnyRole(['admin', 'super_admin']);
        adminSections.forEach(section => {
            section.style.display = isAdmin ? 'block' : 'none';
        });
    }

    setupEventListeners() {
        // Profile form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        }

        // Cancel profile edit
        const cancelButton = document.getElementById('cancel-profile-edit');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.cancelProfileEdit());
        }
    }

    async handleProfileSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            const profileData = Object.fromEntries(formData.entries());

            // Remove empty values
            Object.keys(profileData).forEach(key => {
                if (profileData[key] === '') {
                    delete profileData[key];
                }
            });

            console.log('💾 Saving profile data:', profileData);

            const { error } = await this.supabase
                .from('profiles')
                .update(profileData)
                .eq('user_id', this.currentUser.id);

            if (error) {
                throw error;
            }

            // Update local profile data
            Object.assign(this.userProfile, profileData);

            // Show success message
            this.showSuccessMessage('Profile updated successfully!');

            // Refresh UI
            this.setupUI();

        } catch (error) {
            console.error('❌ Failed to save profile:', error);
            this.showErrorMessage('Failed to save profile: ' + error.message);
        }
    }

    cancelProfileEdit() {
        this.setupUI(); // Reset form to original values
    }

    showUpgradeModal() {
        alert('Upgrade to Pro!\n\nPro features include:\n- Advanced search filters\n- Unlimited saved listings\n- Express Deal eligibility\n- Priority support\n- Deal analytics\n\nContact support to upgrade your account.');
    }

    showBillingModal() {
        alert('Billing Management\n\nTo manage your billing information, cancel subscription, or update payment methods, please contact our support team.\n\nEmail: support@ardonie.com\nPhone: 424-253-4019');
    }

    showRoleRequestModal() {
        alert('Request Additional Roles\n\nTo request additional roles or permissions, please contact our admin team with your business requirements.\n\nEmail: admin@ardonie.com');
    }

    showSuccessMessage(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showErrorMessage(message) {
        // Simple error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize profile management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManagement = new ProfileManagement();
});
