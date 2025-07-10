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
                <!-- Main Pages -->
                <div class="relative group">
                    <button class="flex items-center space-x-1 text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200" 
                            aria-expanded="false" aria-haspopup="true">
                        <span>Main Pages</span>
                        <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="py-1" role="menu">
                            <a href="/" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Home</a>
                            <a href="/about-us.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">About Us</a>
                            <a href="/how-it-works.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">How It Works</a>
                            <a href="/blog/" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Blog</a>
                            <a href="/careers.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Careers</a>
                            <a href="/contact.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Contact</a>
                        </div>
                    </div>
                </div>

                <!-- Programs -->
                <div class="relative group">
                    <button class="flex items-center space-x-1 text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                            aria-expanded="false" aria-haspopup="true">
                        <span>Programs</span>
                        <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="py-1" role="menu">
                            <a href="/marketplace/listings.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Browse Listings</a>
                            <a href="/express-deal.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Express Deal</a>
                            <a href="/for-buyers.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">For Buyers</a>
                            <a href="/for-sellers.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">For Sellers</a>
                            <a href="/matchmaking/" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Matchmaking</a>
                            <a href="/prelaunch-express.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Prelaunch Express</a>
                        </div>
                    </div>
                </div>

                <!-- Services -->
                <div class="relative group">
                    <button class="flex items-center space-x-1 text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                            aria-expanded="false" aria-haspopup="true">
                        <span>Services</span>
                        <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="py-1" role="menu">
                            <a href="/vendor-portal/accounting-firms.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Accounting Firms</a>
                            <a href="/vendor-portal/financial-institutions.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Financial Institutions</a>
                            <a href="/vendor-portal/legal-firms.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Legal Firms</a>
                        </div>
                    </div>
                </div>

                <!-- Portals -->
                <div class="relative group">
                    <button class="flex items-center space-x-1 text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                            aria-expanded="false" aria-haspopup="true">
                        <span>Portals</span>
                        <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="py-1" role="menu">
                            <a href="/portals/accountant-portal.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Accountant Portal</a>
                            <a href="/portals/attorney-portal.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Attorney Portal</a>
                            <a href="/portals/buyer-portal.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Buyer Portal</a>
                            <a href="/dashboard/buyer-dashboard.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Buyer Dashboard</a>
                            <a href="/portals/seller-portal.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Seller Portal</a>
                            <a href="/dashboard/seller-dashboard.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Seller Dashboard</a>
                            <a href="/portals/lender-portal.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Lender Portal</a>
                        </div>
                    </div>
                </div>

                <!-- Top-level Navigation Links -->
                <a href="/free-resources.html" class="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Free Resources</a>
                <a href="/contact.html" class="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Contact</a>

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
                <div id="auth-buttons" class="flex items-center space-x-3">
                    <!-- Login Button (shown when not authenticated) -->
                    <a href="/auth/login.html" id="login-btn" class="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Login</a>

                    <!-- Get Started Button -->
                    <a href="/auth/register.html" id="register-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md">
                        Get Started
                    </a>

                    <!-- User Profile (shown when authenticated) -->
                    <div id="user-profile" class="hidden relative group">
                        <button class="flex items-center space-x-2 text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                                aria-expanded="false" aria-haspopup="true">
                            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                            <span id="user-name">User</span>
                        </button>
                        <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div class="py-1" role="menu">
                                <a href="/dashboard/" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Dashboard</a>
                                <a href="/profile/" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Profile</a>
                                <a href="/settings/" class="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150" role="menuitem">Settings</a>
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
            <!-- Main Pages Mobile -->
            <div class="mobile-dropdown">
                <button type="button" class="mobile-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">
                    <span>Main Pages</span>
                    <svg class="mobile-dropdown-icon w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="mobile-dropdown-content hidden pl-4 space-y-1">
                    <a href="/" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Home</a>
                    <a href="/about-us.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">About Us</a>
                    <a href="/how-it-works.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">How It Works</a>
                    <a href="/blog/" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Blog</a>
                    <a href="/careers.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Careers</a>
                    <a href="/contact.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Contact</a>
                </div>
            </div>

            <!-- Programs Mobile -->
            <div class="mobile-dropdown">
                <button type="button" class="mobile-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">
                    <span>Programs</span>
                    <svg class="mobile-dropdown-icon w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="mobile-dropdown-content hidden pl-4 space-y-1">
                    <a href="/marketplace/listings.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Browse Listings</a>
                    <a href="/express-deal.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Express Deal</a>
                    <a href="/for-buyers.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">For Buyers</a>
                    <a href="/for-sellers.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">For Sellers</a>
                    <a href="/matchmaking/" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Matchmaking</a>
                    <a href="/prelaunch-express.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Prelaunch Express</a>
                </div>
            </div>

            <!-- Services Mobile -->
            <div class="mobile-dropdown">
                <button type="button" class="mobile-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">
                    <span>Services</span>
                    <svg class="mobile-dropdown-icon w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="mobile-dropdown-content hidden pl-4 space-y-1">
                    <a href="/vendor-portal/accounting-firms.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Accounting Firms</a>
                    <a href="/vendor-portal/financial-institutions.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Financial Institutions</a>
                    <a href="/vendor-portal/legal-firms.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Legal Firms</a>
                </div>
            </div>

            <!-- Portals Mobile -->
            <div class="mobile-dropdown">
                <button type="button" class="mobile-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">
                    <span>Portals</span>
                    <svg class="mobile-dropdown-icon w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="mobile-dropdown-content hidden pl-4 space-y-1">
                    <a href="/portals/accountant-portal.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Accountant Portal</a>
                    <a href="/portals/attorney-portal.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Attorney Portal</a>
                    <a href="/portals/buyer-portal.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Buyer Portal</a>
                    <a href="/dashboard/buyer-dashboard.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Buyer Dashboard</a>
                    <a href="/portals/seller-portal.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Seller Portal</a>
                    <a href="/dashboard/seller-dashboard.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Seller Dashboard</a>
                    <a href="/portals/lender-portal.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Lender Portal</a>
                </div>
            </div>

            <!-- Business Documents Mobile -->
            <div class="mobile-dropdown">
                <button type="button" class="mobile-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">
                    <span>Business Documents</span>
                    <svg class="mobile-dropdown-icon w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="mobile-dropdown-content hidden pl-4 space-y-1">
                    <a href="/documents/business-plan.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Business Plan</a>
                    <a href="/documents/fi-pitch-deck.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">FI Pitch Deck</a>
                    <a href="/documents/legal-pitch-deck.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Legal Pitch Deck</a>
                    <a href="/documents/marketing-plan.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Marketing Plan</a>
                    <a href="/documents/one-page-pitch.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">One Page Pitch</a>
                </div>
            </div>

            <!-- Tools & Resources Mobile -->
            <div class="mobile-dropdown">
                <button type="button" class="mobile-dropdown-toggle w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">
                    <span>Tools & Resources</span>
                    <svg class="mobile-dropdown-icon w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="mobile-dropdown-content hidden pl-4 space-y-1">
                    <a href="/tools/due-diligence-checklist.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Due Diligence</a>
                    <a href="/learning-center.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Learning Center</a>
                    <a href="/tools/loan-calculator.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Loan Calculator</a>
                    <a href="/tools/valuation-tool.html" class="block px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150">Valuation Tool</a>
                </div>
            </div>

            <!-- Top-level Links Mobile -->
            <div class="pt-2 border-t border-slate-200">
                <a href="/free-resources.html" class="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">Free Resources</a>
                <a href="/contact.html" class="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors duration-200">Contact</a>

                <!-- Dark Mode Toggle Mobile -->
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
            <div id="mobile-auth-buttons" class="pt-4 pb-2 space-y-2">
                <!-- Login Button (shown when not authenticated) -->
                <a href="/auth/login.html" id="mobile-login-btn" class="block w-full text-center border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md text-base font-medium transition-colors duration-200">
                    Login
                </a>

                <!-- Get Started Button -->
                <a href="/auth/register.html" id="mobile-register-btn" class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-base font-medium transition-colors duration-200 shadow-sm hover:shadow-md">
                    Get Started
                </a>

                <!-- User Profile Mobile (shown when authenticated) -->
                <div id="mobile-user-profile" class="hidden pt-2 border-t border-slate-200">
                    <div class="flex items-center space-x-3 px-3 py-2 mb-2">
                        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        document.addEventListener('authServiceReady', (event) => {
            console.log('🔧 Navigation: Auth service is ready, updating state');
            this.updateAuthState();
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
        }
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
