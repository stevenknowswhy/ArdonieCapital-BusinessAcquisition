// Ardonie Capital - Main Navigation Component
// Modern Responsive Navigation with Mobile Menu
// JavaScript template to avoid CORS issues with local development

window.ArdonieNavigation = {
    template: `
<nav class="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <!-- Logo/Brand -->
            <div class="flex-shrink-0">
                <a href="/" class="flex items-center space-x-2 text-2xl font-bold text-primary hover:text-primary-dark transition-colors duration-200" aria-label="Ardonie Capital Home">
                    <span class="text-blue-600">Ardonie Capital</span>
                </a>
            </div>

            <!-- Desktop Navigation -->
            <div class="hidden lg:flex lg:items-center lg:space-x-8">
                <!-- Main Navigation Links -->
                <a href="/" class="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Home</a>

                <!-- For Buyers -->
                <div class="relative group">
                    <button class="flex items-center space-x-1 text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                            aria-expanded="false" aria-haspopup="true">
                        <span>For Buyers</span>
                        <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="py-1" role="menu">
                            <a href="/for-buyers.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Buyer Overview</a>
                            <a href="/marketplace/listings.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Browse Listings</a>
                            <a href="/express-deal.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Express Deal Program</a>
                            <a href="/dashboard/buyer-dashboard.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Buyer Dashboard</a>
                        </div>
                    </div>
                </div>

                <!-- For Sellers -->
                <div class="relative group">
                    <button class="flex items-center space-x-1 text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                            aria-expanded="false" aria-haspopup="true">
                        <span>For Sellers</span>
                        <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="py-1" role="menu">
                            <a href="/for-sellers.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Seller Overview</a>
                            <a href="/marketplace/list-business.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">List Your Business</a>
                            <a href="/dashboard/seller-dashboard.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Seller Dashboard</a>
                        </div>
                    </div>
                </div>

                <!-- For Vendors -->
                <div class="relative group">
                    <button class="flex items-center space-x-1 text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                            aria-expanded="false" aria-haspopup="true">
                        <span>For Vendors</span>
                        <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="py-1" role="menu">
                            <a href="/vendor-portal/financial-institutions.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Financial Institutions</a>
                            <a href="/vendor-portal/legal-firms.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Legal Firms</a>
                            <a href="/vendor-portal/accounting-firms.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Accounting Firms</a>
                            <a href="/portals/lender-portal.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Lender Portal</a>
                        </div>
                    </div>
                </div>

                <!-- Resources -->
                <div class="relative group">
                    <button class="flex items-center space-x-1 text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                            aria-expanded="false" aria-haspopup="true">
                        <span>Resources</span>
                        <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="py-1" role="menu">
                            <a href="/free-resources.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Free Tools</a>
                            <a href="/blog/" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Blog</a>
                            <a href="/how-it-works.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">How It Works</a>
                            <a href="/about-us.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">About Us</a>
                        </div>
                    </div>
                </div>

                <!-- Contact -->
                <a href="/contact.html" class="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Contact</a>

                <!-- Content Management (Blog Editors/Contributors Only) -->
                <div id="cms-navigation" class="relative group hidden">
                    <button class="flex items-center space-x-1 text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                            aria-expanded="false" aria-haspopup="true">
                        <span>Content Management</span>
                        <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="py-1" role="menu">
                            <a href="/dashboard/content-management.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Blog Dashboard</a>
                            <a href="/dashboard/content-management.html#create" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Create New Post</a>
                            <a href="/dashboard/content-management.html#manage" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Manage Content</a>
                            <a href="/blog/content-guidelines.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Content Guidelines</a>
                        </div>
                    </div>
                </div>

                <!-- Dark Mode Toggle -->
                <button type="button" id="theme-toggle" class="text-slate-700 hover:text-blue-600 p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Toggle dark mode">
                    <!-- Sun Icon (shown in dark mode) -->
                    <svg id="theme-toggle-light-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
                    </svg>
                    <!-- Moon Icon (shown in light mode) -->
                    <svg id="theme-toggle-dark-icon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                </button>

                <!-- Authentication Buttons -->
                <div id="auth-buttons" class="flex items-center space-x-4">
                    <!-- Login Button (shown when not authenticated) -->
                    <a href="/auth/login.html" id="login-btn" class="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Login</a>

                    <!-- Get Started Free Button - More Prominent -->
                    <a href="/auth/register.html" id="register-btn" class="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ring-2 ring-white/20">
                        Get Started Free
                        <svg class="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                    </a>

                    <!-- User Profile (shown when authenticated) -->
                    <div id="user-profile" class="hidden relative group">
                        <button class="flex items-center space-x-2 text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                                aria-expanded="false" aria-haspopup="true">
                            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center relative overflow-hidden ring-2 ring-white shadow-sm">
                                <!-- User Avatar Image -->
                                <img id="user-avatar-nav"
                                     class="w-full h-full object-cover rounded-full hidden"
                                     alt="User Avatar"
                                     onerror="this.style.display='none'; document.getElementById('user-avatar-fallback').style.display='flex';">
                                <!-- Fallback Icon -->
                                <svg id="user-avatar-fallback" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                            <span id="user-name">User</span>
                        </button>
                        <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div class="py-1" role="menu">
                                <a href="#" onclick="navigateToDashboard()" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Dashboard</a>
                                <a href="#" onclick="navigateToProfile()" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Profile</a>
                                <a href="#" onclick="navigateToSettings()" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Settings</a>
                                <hr class="my-1">
                                <button onclick="logout()" class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mobile menu button -->
            <div class="lg:hidden">
                <button type="button" 
                        class="mobile-menu-toggle inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:text-blue-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200" 
                        aria-controls="mobile-menu" 
                        aria-expanded="false"
                        aria-label="Toggle main menu">
                    <span class="sr-only">Open main menu</span>
                    <!-- Hamburger icon -->
                    <svg class="hamburger-icon block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <!-- Close icon -->
                    <svg class="close-icon hidden h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile menu -->
    <div class="mobile-menu lg:hidden hidden" id="mobile-menu">
        <div class="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-slate-200 shadow-lg">
            <!-- Home -->
            <a href="/" class="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">Home</a>

            <!-- For Buyers Mobile -->
            <div class="mobile-dropdown">
                <button type="button" class="mobile-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">
                    <span>For Buyers</span>
                    <svg class="mobile-dropdown-icon w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="mobile-dropdown-content hidden pl-4 space-y-1">
                    <a href="/for-buyers.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Buyer Overview</a>
                    <a href="/marketplace/listings.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Browse Listings</a>
                    <a href="/express-deal.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Express Deal Program</a>
                    <a href="/dashboard/buyer-dashboard.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Buyer Dashboard</a>
                </div>
            </div>

            <!-- For Sellers Mobile -->
            <div class="mobile-dropdown">
                <button type="button" class="mobile-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">
                    <span>For Sellers</span>
                    <svg class="mobile-dropdown-icon w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="mobile-dropdown-content hidden pl-4 space-y-1">
                    <a href="/for-sellers.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Seller Overview</a>
                    <a href="/marketplace/list-business.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">List Your Business</a>
                    <a href="/dashboard/seller-dashboard.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Seller Dashboard</a>
                </div>
            </div>

            <!-- For Vendors Mobile -->
            <div class="mobile-dropdown">
                <button type="button" class="mobile-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">
                    <span>For Vendors</span>
                    <svg class="mobile-dropdown-icon w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="mobile-dropdown-content hidden pl-4 space-y-1">
                    <a href="/vendor-portal/financial-institutions.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Financial Institutions</a>
                    <a href="/vendor-portal/legal-firms.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Legal Firms</a>
                    <a href="/vendor-portal/accounting-firms.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Accounting Firms</a>
                    <a href="/portals/lender-portal.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Lender Portal</a>
                </div>
            </div>

            <!-- Resources Mobile -->
            <div class="mobile-dropdown">
                <button type="button" class="mobile-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">
                    <span>Resources</span>
                    <svg class="mobile-dropdown-icon w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="mobile-dropdown-content hidden pl-4 space-y-1">
                    <a href="/free-resources.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Free Tools</a>
                    <a href="/blog/" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Blog</a>
                    <a href="/how-it-works.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">How It Works</a>
                    <a href="/about-us.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">About Us</a>
                </div>
            </div>

            <!-- Contact -->
            <a href="/contact.html" class="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">Contact</a>

            <!-- Content Management Mobile (Blog Editors/Contributors Only) -->
            <div id="mobile-cms-navigation" class="mobile-dropdown hidden">
                <button type="button" class="mobile-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">
                    <span>Content Management</span>
                    <svg class="mobile-dropdown-icon w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="mobile-dropdown-content hidden pl-4 space-y-1">
                    <a href="/dashboard/content-management.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Blog Dashboard</a>
                    <a href="/dashboard/content-management.html#create" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Create New Post</a>
                    <a href="/dashboard/content-management.html#manage" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Manage Content</a>
                    <a href="/blog/content-guidelines.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Content Guidelines</a>
                </div>
            </div>

            <!-- Dark Mode Toggle Mobile -->
            <div class="pt-4 border-t border-slate-200">
                <button type="button" id="mobile-theme-toggle" class="flex items-center w-full px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Toggle dark mode">
                    <svg id="mobile-theme-toggle-light-icon" class="hidden w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
                    </svg>
                    <svg id="mobile-theme-toggle-dark-icon" class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                    <span id="mobile-theme-toggle-text">Dark Mode</span>
                </button>
            </div>

            <!-- Authentication Buttons Mobile -->
            <div id="mobile-auth-buttons" class="pt-4 pb-2 space-y-3">
                <!-- Login Button (shown when not authenticated) -->
                <a href="/auth/login.html" id="mobile-login-btn" class="block w-full text-center border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md text-base font-medium transition-colors duration-200">
                    Login
                </a>

                <!-- Get Started Free Button - Mobile -->
                <a href="/auth/register.html" id="mobile-register-btn" class="block w-full text-center bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 shadow-lg">
                    Get Started Free
                    <svg class="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                </a>

                <!-- User Profile Mobile (shown when authenticated) -->
                <div id="mobile-user-profile" class="hidden pt-2 border-t border-slate-200">
                    <div class="flex items-center space-x-3 px-3 py-2 mb-2">
                        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center relative overflow-hidden ring-2 ring-white shadow-sm">
                            <!-- Mobile User Avatar Image -->
                            <img id="mobile-user-avatar-nav"
                                 class="w-full h-full object-cover rounded-full hidden"
                                 alt="User Avatar"
                                 onerror="this.style.display='none'; document.getElementById('mobile-user-avatar-fallback').style.display='flex';">
                            <!-- Mobile Fallback Icon -->
                            <svg id="mobile-user-avatar-fallback" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <span id="mobile-user-name" class="text-base font-medium text-slate-900">User</span>
                    </div>
                    <a href="/dashboard/" class="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">Dashboard</a>
                    <a href="/profile/" class="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">Profile</a>
                    <a href="/settings/" class="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">Settings</a>
                    <button onclick="logout()" class="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">Logout</button>
                </div>
            </div>
        </div>
    </div>
</nav>
`,

    // Initialize navigation component
    init: function(containerId = 'main-navigation-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.template;
            this.bindEvents();
            this.updateAuthState();
            this.initThemeToggle();
            this.setupAuthEventListeners();
        } else {
            console.error('Navigation container not found:', containerId);
        }
    },

    // Setup event listeners for authentication state changes
    setupAuthEventListeners: function() {
        console.log('🔗 Navigation: Setting up auth event listeners...');

        // Listen for authentication completion events from protected pages
        document.addEventListener('authenticationComplete', (event) => {
            console.log('✅ Navigation: Received authenticationComplete event');
            console.log('👤 Navigation: User data from event:', event.detail?.user);

            // Small delay to ensure storage is updated
            setTimeout(() => {
                this.updateAuthState();
            }, 100);
        });

        // Listen for custom auth state change events
        document.addEventListener('authStateChanged', (event) => {
            console.log('🔄 Navigation: Received authStateChanged event');
            this.updateAuthState();
        });

        // Listen for auth service ready events
        document.addEventListener('authServiceReady', function(event) {
            console.log('🔧 Navigation: Auth service is ready, updating state');
            window.ArdonieNavigation.updateAuthState();
        });

        // Listen for avatar update events
        document.addEventListener('avatarUpdated', function(event) {
            console.log('🖼️ Navigation: Received avatarUpdated event in event listener');
            console.log('🔍 Navigation: Checking ArdonieNavigation availability:', !!window.ArdonieNavigation);

            if (!window.ArdonieNavigation) {
                console.error('❌ Navigation: ArdonieNavigation object not available for avatarUpdated!');
                return;
            }

            console.log('🔄 Navigation: About to call refreshUserAvatar from avatarUpdated...');
            try {
                window.ArdonieNavigation.refreshUserAvatar();
                console.log('✅ Navigation: refreshUserAvatar call from avatarUpdated completed');
            } catch (error) {
                console.error('❌ Navigation: refreshUserAvatar call from avatarUpdated failed:', error);
            }
        });

        // Listen for profile update events
        document.addEventListener('profileUpdated', function(event) {
            console.log('👤 Navigation: Received profileUpdated event in event listener');
            console.log('📋 Profile update details:', event.detail);
            console.log('🔍 Navigation: Checking ArdonieNavigation availability:', !!window.ArdonieNavigation);

            if (!window.ArdonieNavigation) {
                console.error('❌ Navigation: ArdonieNavigation object not available!');
                return;
            }

            if (event.detail.type === 'personal_info') {
                console.log('🔄 Navigation: About to call updateDisplayName...');
                try {
                    window.ArdonieNavigation.updateDisplayName(event.detail.data);
                    console.log('✅ Navigation: updateDisplayName call completed');
                } catch (error) {
                    console.error('❌ Navigation: updateDisplayName call failed:', error);
                }
            } else if (event.detail.type === 'avatar') {
                console.log('🔄 Navigation: About to call refreshUserAvatar...');
                try {
                    window.ArdonieNavigation.refreshUserAvatar();
                    console.log('✅ Navigation: refreshUserAvatar call completed');
                } catch (error) {
                    console.error('❌ Navigation: refreshUserAvatar call failed:', error);
                }
            }
        });

        console.log('✅ Navigation: Auth event listeners setup complete');
    },

    // Bind event handlers
    bindEvents: function() {
        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const hamburgerIcon = document.querySelector('.hamburger-icon');
        const closeIcon = document.querySelector('.close-icon');

        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', function() {
                const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';

                // Toggle menu visibility
                mobileMenu.classList.toggle('hidden');

                // Update aria-expanded
                mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);

                // Toggle icons
                if (hamburgerIcon && closeIcon) {
                    hamburgerIcon.classList.toggle('hidden');
                    closeIcon.classList.toggle('hidden');
                }
            });
        }

        // Mobile dropdown toggles
        const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');

        mobileDropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const dropdown = this.closest('.mobile-dropdown');
                const content = dropdown.querySelector('.mobile-dropdown-content');
                const icon = dropdown.querySelector('.mobile-dropdown-icon');

                if (content && icon) {
                    // Toggle content visibility
                    content.classList.toggle('hidden');

                    // Rotate icon
                    icon.classList.toggle('rotate-180');

                    // Update aria-expanded
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    this.setAttribute('aria-expanded', !isExpanded);
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (mobileMenu && !mobileMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');

                    if (hamburgerIcon && closeIcon) {
                        hamburgerIcon.classList.remove('hidden');
                        closeIcon.classList.add('hidden');
                    }
                }
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');

                if (hamburgerIcon && closeIcon) {
                    hamburgerIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 1024 && mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');

                if (hamburgerIcon && closeIcon) {
                    hamburgerIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                }
            }
        });
    },

    // Update authentication state
    updateAuthState: function() {
        console.log('🔄 Navigation: Updating authentication state...');

        const user = localStorage.getItem('ardonie_user_session') || sessionStorage.getItem('ardonie_current_user');
        const authStatus = localStorage.getItem('ardonie_auth_status') || sessionStorage.getItem('ardonie_auth_status');
        const isAuthenticated = user !== null && authStatus === 'authenticated';

        console.log('🔍 Navigation: Auth check results:', {
            userDataExists: !!user,
            authStatus: authStatus,
            isAuthenticated: isAuthenticated
        });

        // Desktop authentication elements
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const userProfile = document.getElementById('user-profile');
        const userName = document.getElementById('user-name');

        // Mobile authentication elements
        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        const mobileRegisterBtn = document.getElementById('mobile-register-btn');
        const mobileUserProfile = document.getElementById('mobile-user-profile');
        const mobileUserName = document.getElementById('mobile-user-name');

        if (isAuthenticated) {
            // Parse user data
            let userData;
            try {
                userData = JSON.parse(user);
                console.log('👤 Navigation: Parsed user data:', {
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    userTypes: userData.userTypes
                });
            } catch (e) {
                console.error('❌ Navigation: Failed to parse user data:', e);
                userData = { firstName: 'User', lastName: '' };
            }

            // Construct display name from firstName and lastName
            const displayName = userData.firstName && userData.lastName
                ? `${userData.firstName} ${userData.lastName}`.trim()
                : userData.firstName || userData.lastName || userData.name || 'User';

            console.log('✅ Navigation: Showing authenticated state for:', displayName);

            // Desktop: Hide login/register, show profile
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (userProfile) userProfile.classList.remove('hidden');
            if (userName) userName.textContent = displayName;

            // Mobile: Hide login/register, show profile
            if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
            if (mobileRegisterBtn) mobileRegisterBtn.style.display = 'none';
            if (mobileUserProfile) mobileUserProfile.classList.remove('hidden');
            if (mobileUserName) mobileUserName.textContent = displayName;

            // Load user avatar
            this.loadUserAvatar(userData);

            // Update CMS navigation visibility based on user roles
            this.updateCMSNavigationVisibility(userData);
        } else {
            console.log('❌ Navigation: Showing unauthenticated state');

            // Desktop: Show login/register, hide profile
            if (loginBtn) loginBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'block';
            if (userProfile) userProfile.classList.add('hidden');

            // Mobile: Show login/register, hide profile
            if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
            if (mobileRegisterBtn) mobileRegisterBtn.style.display = 'block';
            if (mobileUserProfile) mobileUserProfile.classList.add('hidden');

            // Clear avatars when not authenticated
            this.clearUserAvatars();

            // Hide CMS navigation when not authenticated
            this.hideCMSNavigation();
        }
    },

    // Update CMS navigation visibility based on user roles
    updateCMSNavigationVisibility: function(userData) {
        console.log('📝 Navigation: Updating CMS navigation visibility...');

        const cmsNavigation = document.getElementById('cms-navigation');
        const mobileCmsNavigation = document.getElementById('mobile-cms-navigation');

        // Check if user has blog editor or contributor roles (but NOT admin roles)
        const hasBlogRoles = this.hasBlogEditorRoles(userData);
        const hasAdminRoles = this.hasAdminRoles(userData);

        // Show CMS navigation only for blog editors/contributors who are NOT admins
        const shouldShowCMS = hasBlogRoles && !hasAdminRoles;

        console.log('🔍 Navigation: CMS visibility check:', {
            hasBlogRoles: hasBlogRoles,
            hasAdminRoles: hasAdminRoles,
            shouldShowCMS: shouldShowCMS,
            userTypes: userData.userTypes
        });

        if (shouldShowCMS) {
            console.log('✅ Navigation: Showing CMS navigation for blog editor/contributor');
            if (cmsNavigation) cmsNavigation.classList.remove('hidden');
            if (mobileCmsNavigation) mobileCmsNavigation.classList.remove('hidden');
        } else {
            console.log('❌ Navigation: Hiding CMS navigation (not blog editor/contributor or is admin)');
            if (cmsNavigation) cmsNavigation.classList.add('hidden');
            if (mobileCmsNavigation) mobileCmsNavigation.classList.add('hidden');
        }
    },

    // Check if user has blog editor or contributor roles
    hasBlogEditorRoles: function(userData) {
        if (!userData || !userData.userTypes) return false;

        const userTypes = Array.isArray(userData.userTypes) ? userData.userTypes : [userData.userTypes];
        return userTypes.some(type =>
            type === 'Blog Editor' ||
            type === 'Blog Contributor' ||
            type === 'blog_editor' ||
            type === 'blog_contributor'
        );
    },

    // Check if user has admin roles
    hasAdminRoles: function(userData) {
        if (!userData || !userData.userTypes) return false;

        const userTypes = Array.isArray(userData.userTypes) ? userData.userTypes : [userData.userTypes];
        return userTypes.some(type =>
            type === 'admin' ||
            type === 'Admin' ||
            type === 'Company Admin' ||
            type === 'Super Admin' ||
            type === 'super_admin' ||
            type === 'company_admin'
        );
    },

    // Hide CMS navigation
    hideCMSNavigation: function() {
        const cmsNavigation = document.getElementById('cms-navigation');
        const mobileCmsNavigation = document.getElementById('mobile-cms-navigation');

        if (cmsNavigation) cmsNavigation.classList.add('hidden');
        if (mobileCmsNavigation) mobileCmsNavigation.classList.add('hidden');
    },

    // Load user avatar from Supabase
    loadUserAvatar: async function(userData) {
        console.log('🖼️ Navigation: loadUserAvatar method called!');
        console.log('👤 Navigation: User data for avatar loading:', userData);

        if (!userData || !userData.id) {
            console.log('⚠️ Navigation: No user data for avatar loading');
            return;
        }

        try {
            console.log('🔄 Navigation: Starting avatar loading process...');

            // Check if we have Supabase available
            if (typeof window.supabase === 'undefined') {
                console.log('⚠️ Navigation: Supabase not available, skipping avatar load');
                return;
            }

            // Initialize Supabase client
            const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

            const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

            // Fetch user profile with avatar URL
            const { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('avatar_url')
                .eq('user_id', userData.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('❌ Navigation: Error loading avatar:', error);
                return;
            }

            const avatarUrl = profile?.avatar_url;

            if (avatarUrl) {
                console.log('✅ Navigation: Avatar URL found, updating display');
                this.updateAvatarDisplay(avatarUrl);
            } else {
                console.log('ℹ️ Navigation: No avatar URL found, using default');
                this.clearUserAvatars();
            }

        } catch (error) {
            console.error('❌ Navigation: Failed to load user avatar:', error);
            this.clearUserAvatars();
        }
    },

    // Update avatar display in navigation
    updateAvatarDisplay: function(avatarUrl) {
        console.log('🖼️ Navigation: updateAvatarDisplay method called!');
        console.log('🔗 Navigation: Avatar URL to display:', avatarUrl);

        // Desktop avatar
        const desktopAvatar = document.getElementById('user-avatar-nav');
        const desktopFallback = document.getElementById('user-avatar-fallback');

        // Mobile avatar
        const mobileAvatar = document.getElementById('mobile-user-avatar-nav');
        const mobileFallback = document.getElementById('mobile-user-avatar-fallback');

        console.log('🔍 Navigation: Avatar elements found:', {
            desktopAvatar: !!desktopAvatar,
            desktopFallback: !!desktopFallback,
            mobileAvatar: !!mobileAvatar,
            mobileFallback: !!mobileFallback
        });

        if (avatarUrl) {
            // Add cache-busting parameter to ensure fresh image
            const cacheBustedUrl = `${avatarUrl}?t=${Date.now()}`;
            console.log('🔄 Navigation: Cache-busted URL:', cacheBustedUrl);

            // Desktop
            if (desktopAvatar && desktopFallback) {
                console.log('🖥️ Navigation: Updating desktop avatar...');
                desktopAvatar.src = cacheBustedUrl;
                desktopAvatar.style.display = 'block';
                desktopFallback.style.display = 'none';
                console.log('✅ Navigation: Desktop avatar updated');
            } else {
                console.error('❌ Navigation: Desktop avatar elements not found!');
            }

            // Mobile
            if (mobileAvatar && mobileFallback) {
                console.log('📱 Navigation: Updating mobile avatar...');
                mobileAvatar.src = cacheBustedUrl;
                mobileAvatar.style.display = 'block';
                mobileFallback.style.display = 'none';
                console.log('✅ Navigation: Mobile avatar updated');
            } else {
                console.error('❌ Navigation: Mobile avatar elements not found!');
            }

            console.log('✅ Navigation: Avatar display update completed');
        } else {
            console.log('🔄 Navigation: No avatar URL, clearing avatars...');
            window.ArdonieNavigation.clearUserAvatars();
        }
    },

    // Clear user avatars and show fallback icons
    clearUserAvatars: function() {
        console.log('🧹 Navigation: Clearing user avatars');

        // Desktop avatar
        const desktopAvatar = document.getElementById('user-avatar-nav');
        const desktopFallback = document.getElementById('user-avatar-fallback');

        // Mobile avatar
        const mobileAvatar = document.getElementById('mobile-user-avatar-nav');
        const mobileFallback = document.getElementById('mobile-user-avatar-fallback');

        // Desktop
        if (desktopAvatar && desktopFallback) {
            desktopAvatar.style.display = 'none';
            desktopAvatar.src = '';
            desktopFallback.style.display = 'flex';
        }

        // Mobile
        if (mobileAvatar && mobileFallback) {
            mobileAvatar.style.display = 'none';
            mobileAvatar.src = '';
            mobileFallback.style.display = 'flex';
        }
    },

    // Refresh user avatar (called when avatar is updated)
    refreshUserAvatar: function() {
        console.log('🔄 Navigation: refreshUserAvatar method called!');

        const user = localStorage.getItem('ardonie_user_session') || sessionStorage.getItem('ardonie_current_user');
        console.log('👤 Navigation: User session data found:', !!user);

        if (user) {
            try {
                const userData = JSON.parse(user);
                console.log('📋 Navigation: Parsed user data for avatar refresh:', {
                    id: userData.id,
                    email: userData.email
                });
                window.ArdonieNavigation.loadUserAvatar(userData);
            } catch (e) {
                console.error('❌ Navigation: Failed to parse user data for avatar refresh:', e);
            }
        } else {
            console.error('❌ Navigation: No user session data found for avatar refresh');
        }
    },

    // Update display name from profile data
    updateDisplayName: function(profileData) {
        console.log('👤 Navigation: updateDisplayName method called!');
        console.log('📋 Profile data for name update:', profileData);

        try {
            // Construct display name from profile data
            const displayName = profileData.first_name && profileData.last_name
                ? `${profileData.first_name} ${profileData.last_name}`.trim()
                : profileData.first_name || profileData.last_name || 'User';

            console.log('✨ Navigation: New display name constructed:', displayName);

            // Update desktop navigation
            const userName = document.getElementById('user-name');
            console.log('🔍 Navigation: Desktop user-name element:', userName);
            if (userName) {
                const oldName = userName.textContent;
                userName.textContent = displayName;
                console.log(`✅ Navigation: Desktop display name updated from "${oldName}" to "${displayName}"`);
            } else {
                console.error('❌ Navigation: Desktop user-name element not found!');
            }

            // Update mobile navigation
            const mobileUserName = document.getElementById('mobile-user-name');
            console.log('🔍 Navigation: Mobile mobile-user-name element:', mobileUserName);
            if (mobileUserName) {
                const oldMobileName = mobileUserName.textContent;
                mobileUserName.textContent = displayName;
                console.log(`✅ Navigation: Mobile display name updated from "${oldMobileName}" to "${displayName}"`);
            } else {
                console.error('❌ Navigation: Mobile mobile-user-name element not found!');
            }

            // Update localStorage user session with new name data
            window.ArdonieNavigation.updateUserSession(profileData);

        } catch (error) {
            console.error('❌ Navigation: Failed to update display name:', error);
            console.error('Error details:', error.stack);
        }
    },

    // Update user session data in localStorage
    updateUserSession: function(profileData) {
        try {
            console.log('💾 Navigation: Updating user session data...');

            const userSession = localStorage.getItem('ardonie_user_session') || sessionStorage.getItem('ardonie_current_user');
            if (userSession) {
                const userData = JSON.parse(userSession);

                // Update user data with new profile information
                const updatedUserData = {
                    ...userData,
                    firstName: profileData.first_name || userData.firstName,
                    lastName: profileData.last_name || userData.lastName,
                    phone: profileData.phone || userData.phone,
                    company: profileData.company || userData.company,
                    bio: profileData.bio || userData.bio,
                    website: profileData.website || userData.website,
                    linkedin_url: profileData.linkedin_url || userData.linkedin_url,
                    location: profileData.location || userData.location
                };

                // Save updated data back to storage
                if (localStorage.getItem('ardonie_user_session')) {
                    localStorage.setItem('ardonie_user_session', JSON.stringify(updatedUserData));
                }
                if (sessionStorage.getItem('ardonie_current_user')) {
                    sessionStorage.setItem('ardonie_current_user', JSON.stringify(updatedUserData));
                }

                console.log('✅ Navigation: User session data updated');
                console.log('📋 Updated user data:', {
                    firstName: updatedUserData.firstName,
                    lastName: updatedUserData.lastName,
                    email: updatedUserData.email
                });
            }
        } catch (error) {
            console.error('❌ Navigation: Failed to update user session:', error);
        }
    },

    // Debug function to test navigation methods
    debugTest: function() {
        console.log('🧪 Navigation: Debug test function called');
        console.log('🔍 Navigation: ArdonieNavigation object available:', !!window.ArdonieNavigation);

        // Test updateDisplayName
        console.log('🔄 Navigation: Testing updateDisplayName...');
        this.updateDisplayName({
            first_name: 'Debug',
            last_name: 'Test'
        });

        // Test updateAvatarDisplay
        console.log('🔄 Navigation: Testing updateAvatarDisplay...');
        const testAvatarUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEVTVDwvdGV4dD48L3N2Zz4=';
        this.updateAvatarDisplay(testAvatarUrl);

        console.log('✅ Navigation: Debug test completed');
    },

    // Initialize theme toggle functionality
    initThemeToggle: function() {
        const themeToggle = document.getElementById('theme-toggle');
        const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

        // Set initial theme based on localStorage or system preference
        this.setInitialTheme();

        // Bind desktop theme toggle
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }

        // Bind mobile theme toggle
        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }

        // Update theme icons
        this.updateThemeIcons();
    },

    // Set initial theme
    setInitialTheme: function() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    // Toggle theme
    toggleTheme: function() {
        const isDark = document.documentElement.classList.contains('dark');

        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }

        this.updateThemeIcons();

        // Dispatch custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: isDark ? 'light' : 'dark' }
        }));
    },

    // Update theme toggle icons
    updateThemeIcons: function() {
        const isDark = document.documentElement.classList.contains('dark');

        // Desktop icons
        const lightIcon = document.getElementById('theme-toggle-light-icon');
        const darkIcon = document.getElementById('theme-toggle-dark-icon');

        // Mobile icons and text
        const mobileLightIcon = document.getElementById('mobile-theme-toggle-light-icon');
        const mobileDarkIcon = document.getElementById('mobile-theme-toggle-dark-icon');
        const mobileText = document.getElementById('mobile-theme-toggle-text');

        if (isDark) {
            // Show sun icon (to switch to light)
            if (lightIcon) lightIcon.classList.remove('hidden');
            if (darkIcon) darkIcon.classList.add('hidden');
            if (mobileLightIcon) mobileLightIcon.classList.remove('hidden');
            if (mobileDarkIcon) mobileDarkIcon.classList.add('hidden');
            if (mobileText) mobileText.textContent = 'Light Mode';
        } else {
            // Show moon icon (to switch to dark)
            if (lightIcon) lightIcon.classList.add('hidden');
            if (darkIcon) darkIcon.classList.remove('hidden');
            if (mobileLightIcon) mobileLightIcon.classList.add('hidden');
            if (mobileDarkIcon) mobileDarkIcon.classList.remove('hidden');
            if (mobileText) mobileText.textContent = 'Dark Mode';
        }
    }
};

// Global logout function
function logout() {
    // Remove all auth-related data
    localStorage.removeItem('ardonie_user_session');
    localStorage.removeItem('ardonie_auth_status');
    sessionStorage.removeItem('ardonie_current_user');
    sessionStorage.removeItem('ardonie_auth_status');

    if (window.ArdonieNavigation) {
        window.ArdonieNavigation.updateAuthState();
    }

    // Redirect to login page
    window.location.href = '/auth/login.html';
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Navigation: DOM ready, initializing...');
    if (window.ArdonieNavigation) {
        window.ArdonieNavigation.init();

        // Also check auth state after a short delay to catch late-loading auth services
        setTimeout(() => {
            console.log('🔄 Navigation: Delayed auth state check...');
            window.ArdonieNavigation.updateAuthState();
        }, 1000);
    }
});

// Listen for storage changes to update auth state and theme across tabs
window.addEventListener('storage', function(e) {
    if ((e.key === 'ardonie_user_session' || e.key === 'ardonie_auth_status') && window.ArdonieNavigation) {
        window.ArdonieNavigation.updateAuthState();
    }
    if (e.key === 'theme' && window.ArdonieNavigation) {
        window.ArdonieNavigation.setInitialTheme();
        window.ArdonieNavigation.updateThemeIcons();
    }
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme') && window.ArdonieNavigation) {
        window.ArdonieNavigation.setInitialTheme();
        window.ArdonieNavigation.updateThemeIcons();
    }
});

// Navigation helper functions
function navigateToDashboard() {
    // Get current user role to determine which dashboard to navigate to
    const currentUser = getCurrentUserFromStorage();

    if (!currentUser) {
        window.location.href = '/auth/login.html';
        return;
    }

    const role = currentUser.role || 'buyer';
    let dashboardUrl = '/dashboard/buyer-dashboard.html';

    switch (role) {
        case 'buyer':
            dashboardUrl = '/dashboard/buyer-dashboard.html';
            break;
        case 'seller':
            dashboardUrl = '/dashboard/seller-dashboard.html';
            break;
        case 'admin':
            dashboardUrl = '/dashboard/super-admin-dashboard.html';
            break;
        default:
            dashboardUrl = '/dashboard/buyer-dashboard.html';
    }

    window.location.href = dashboardUrl;
}

function navigateToProfile() {
    window.location.href = '/dashboard/user-profile.html';
}

function navigateToSettings() {
    // For now, redirect to profile page with settings tab
    window.location.href = '/dashboard/user-profile.html#settings';
}

function getCurrentUserFromStorage() {
    try {
        const userSession = localStorage.getItem('ardonie_user_session');
        if (userSession) {
            return JSON.parse(userSession);
        }
        return null;
    } catch (error) {
        console.error('Error getting user from storage:', error);
        return null;
    }
}
