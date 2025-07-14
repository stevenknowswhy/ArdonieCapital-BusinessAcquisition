
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

// Shared Header Component
// Reusable header component used across all pages

export class HeaderComponent {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showAuth: true,
            showNavigation: true,
            brand: 'Ardonie Capital',
            brandUrl: '/',
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
            <header class="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
                <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center h-16">
                        <!-- Logo -->
                        <div class="flex items-center">
                            <a href="${this.options.brandUrl}" class="flex items-center">
                                <span class="text-2xl font-bold text-primary-dark dark:text-primary-light">
                                    ${this.options.brand}
                                </span>
                            </a>
                        </div>

                        ${this.options.showNavigation ? this.renderNavigation() : ''}
                        ${this.options.showAuth ? this.renderAuthSection() : ''}

                        <!-- Mobile menu button -->
                        <div class="md:hidden">
                            <button id="mobile-menu-button" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Mobile menu -->
                    <div id="mobile-menu" class="hidden md:hidden pb-4">
                        ${this.options.showNavigation ? this.renderMobileNavigation() : ''}
                        ${this.options.showAuth ? this.renderMobileAuth() : ''}
                    </div>
                </div>
            </header>
        `;
    }

    renderNavigation() {
        return `
            <!-- Desktop Navigation -->
            <nav class="hidden md:flex space-x-8">
                <a href="/express-deal.html" class="text-accent-dark hover:text-accent dark:text-accent-light font-medium">🚖 Express Deal</a>
                <a href="/marketplace/listings.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light">Browse Listings</a>
                <a href="/for-sellers.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light">For Sellers</a>
                <a href="/for-buyers.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light">For Buyers</a>
                <a href="/blog/index.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light">Blog</a>
                <a href="/contact.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light">Contact</a>
            </nav>
        `;
    }

    renderAuthSection() {
        const isAuthenticated = this.isUserAuthenticated();
        
        if (isAuthenticated) {
            return `
                <!-- Authenticated User Menu -->
                <div class="hidden md:flex items-center space-x-4">
                    <div class="relative">
                        <button id="user-menu-button" class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            <img class="h-8 w-8 rounded-full" src="https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff" alt="User avatar">
                            <span class="ml-2 text-slate-700 dark:text-slate-300">Dashboard</span>
                            <svg class="ml-1 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        
                        <div id="user-menu-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-50">
                            <a href="/dashboard/" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Dashboard</a>
                            <a href="/profile/" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Profile</a>
                            <a href="/settings/" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Settings</a>
                            <hr class="my-1 border-slate-200 dark:border-slate-600">
                            <button id="logout-button" class="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Sign Out</button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <!-- Guest User Auth -->
                <div class="hidden md:flex items-center space-x-4">
                    <a href="/auth/login.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light">Sign In</a>
                    <a href="/auth/register.html" class="text-white bg-primary-dark hover:bg-primary rounded-md px-4 py-2">Get Started</a>
                </div>
            `;
        }
    }

    renderMobileNavigation() {
        return `
            <div class="flex flex-col space-y-2">
                <a href="/express-deal.html" class="text-accent-dark hover:text-accent dark:text-accent-light font-medium py-2">🚖 Express Deal</a>
                <a href="/marketplace/listings.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light py-2">Browse Listings</a>
                <a href="/for-sellers.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light py-2">For Sellers</a>
                <a href="/for-buyers.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light py-2">For Buyers</a>
                <a href="/blog/index.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light py-2">Blog</a>
                <a href="/contact.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light py-2">Contact</a>
            </div>
        `;
    }

    renderMobileAuth() {
        const isAuthenticated = this.isUserAuthenticated();
        
        if (isAuthenticated) {
            return `
                <div class="flex flex-col space-y-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <a href="/dashboard/" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light py-2">Dashboard</a>
                    <a href="/profile/" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light py-2">Profile</a>
                    <button id="mobile-logout-button" class="text-left text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light py-2">Sign Out</button>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col space-y-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <a href="/auth/login.html" class="text-slate-600 hover:text-primary-dark dark:text-slate-300 dark:hover:text-primary-light py-2">Sign In</a>
                    <a href="/auth/register.html" class="text-white bg-primary-dark hover:bg-primary rounded-md px-4 py-2 inline-block mt-2">Get Started</a>
                </div>
            `;
        }
    }

    attachEventListeners() {
        // Mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // User menu dropdown
        const userMenuButton = document.getElementById('user-menu-button');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        
        if (userMenuButton && userMenuDropdown) {
            userMenuButton.addEventListener('click', () => {
                userMenuDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (event) => {
                if (!userMenuButton.contains(event.target) && !userMenuDropdown.contains(event.target)) {
                    userMenuDropdown.classList.add('hidden');
                }
            });
        }

        // Logout functionality
        const logoutButton = document.getElementById('logout-button');
        const mobileLogoutButton = document.getElementById('mobile-logout-button');
        
        [logoutButton, mobileLogoutButton].forEach(button => {
            if (button) {
                button.addEventListener('click', this.handleLogout.bind(this));
            }
        });
    }

    handleLogout() {
        // Clear authentication data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Redirect to home page
        window.location.href = '/';
    }

    isUserAuthenticated() {
        return !!localStorage.getItem('auth_token');
    }
}
