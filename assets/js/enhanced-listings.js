/**
 * Enhanced Featured Listings Functionality
 * Handles interactive filters, Quick Match Quiz, favorites, and authentication gating
 */

class EnhancedListings {
    constructor() {
        this.listings = [];
        this.filteredListings = [];
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        this.isAuthenticated = false; // Will be updated by auth service
        this.quizStep = 0;
        this.quizAnswers = {};
        
        this.init();
    }

    init() {
        this.loadListings();
        this.setupEventListeners();
        this.updateFavoriteButtons();
        this.checkAuthStatus();
        this.setupRoleIntegration();
        this.setupWelcomeModal();
    }

    setupRoleIntegration() {
        // Listen for role selection events
        window.addEventListener('roleSelected', (e) => {
            this.currentRole = e.detail.role;
            this.adaptToRole(e.detail.role, e.detail.data);
        });

        window.addEventListener('roleReset', () => {
            this.currentRole = null;
            this.resetToDefault();
        });
    }

    adaptToRole(role, roleData) {
        // Adapt listings display based on selected role
        if (role === 'buyer') {
            this.prioritizeBuyerContent();
        } else if (role === 'seller') {
            this.prioritizeSellerContent();
        } else if (role === 'vendor') {
            this.prioritizeVendorContent();
        }

        // Update quiz questions based on role
        this.updateQuizForRole(role);
    }

    prioritizeBuyerContent() {
        // Show investment-focused filters and content
        const expressToggle = document.getElementById('express-only');
        if (expressToggle) {
            expressToggle.checked = true;
            this.updateExpressToggle();
            this.applyFilters();
        }

        // Update listing card emphasis for buyers
        document.querySelectorAll('.listing-card').forEach(card => {
            const cashFlowInfo = card.querySelector('.absolute.bottom-4');
            if (cashFlowInfo) {
                cashFlowInfo.style.display = 'block';
            }
        });
    }

    prioritizeSellerContent() {
        // Show seller-focused content and success stories
        const quizBtn = document.getElementById('start-quiz-btn');
        if (quizBtn) {
            const quizText = quizBtn.querySelector('span:last-child');
            if (quizText) quizText.textContent = 'Seller Readiness Quiz';
        }

        // Update listings to show seller success metrics
        this.showSellerMetrics();
    }

    prioritizeVendorContent() {
        // Show vendor-focused deal pipeline
        const listingsTitle = document.getElementById('featured-listings-title');
        if (listingsTitle) {
            listingsTitle.textContent = 'Active Deal Pipeline for Vendors';
        }

        // Update listings to show vendor opportunities
        this.showVendorOpportunities();
    }

    resetToDefault() {
        // Reset all role-specific adaptations
        const expressToggle = document.getElementById('express-only');
        if (expressToggle) {
            expressToggle.checked = false;
            this.updateExpressToggle();
            this.applyFilters();
        }

        // Reset quiz text
        const quizBtn = document.getElementById('start-quiz-btn');
        if (quizBtn) {
            const quizText = quizBtn.querySelector('span:last-child');
            if (quizText) quizText.textContent = 'Quick Match Quiz';
        }
    }

    loadListings() {
        // Get listings from DOM data attributes
        const listingCards = document.querySelectorAll('.listing-card');
        this.listings = Array.from(listingCards).map((card, index) => ({
            id: index + 1,
            element: card,
            price: parseInt(card.dataset.price) || 0,
            location: card.dataset.location || '',
            type: card.dataset.type || '',
            express: card.dataset.express === 'true'
        }));
        this.filteredListings = [...this.listings];
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('price-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('location-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('type-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('express-only')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('clear-filters')?.addEventListener('click', () => this.clearFilters());

        // Quick Match Quiz
        document.getElementById('start-quiz-btn')?.addEventListener('click', () => this.startQuiz());

        // Listing interactions
        document.querySelectorAll('.save-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFavorite(e));
        });

        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleViewDetails(e));
        });

        document.querySelectorAll('.contact-seller-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleContactSeller(e));
        });

        // Save search alert
        document.getElementById('save-search-btn')?.addEventListener('click', () => this.handleSaveSearch());

        // Dashboard preview
        document.getElementById('dashboard-preview-btn')?.addEventListener('click', () => this.handleDashboardPreview());
        document.getElementById('schedule-demo-btn')?.addEventListener('click', () => this.handleScheduleDemo());

        // Free resources
        document.getElementById('download-report-btn')?.addEventListener('click', () => this.handleDownloadReport());
        document.getElementById('premium-access-form')?.addEventListener('submit', (e) => this.handlePremiumAccess(e));

        // Testimonials slider
        this.setupTestimonialsSlider();
    }

    applyFilters() {
        const priceFilter = document.getElementById('price-filter')?.value || '';
        const locationFilter = document.getElementById('location-filter')?.value || '';
        const typeFilter = document.getElementById('type-filter')?.value || '';
        const expressOnly = document.getElementById('express-only')?.checked || false;

        this.filteredListings = this.listings.filter(listing => {
            // Price filter
            if (priceFilter) {
                if (priceFilter === '1000000+') {
                    if (listing.price < 1000000) return false;
                } else {
                    const [min, max] = priceFilter.split('-').map(Number);
                    if (listing.price < min || (max && listing.price > max)) return false;
                }
            }

            // Location filter
            if (locationFilter && listing.location !== locationFilter) return false;

            // Type filter
            if (typeFilter && listing.type !== typeFilter) return false;

            // Express only filter
            if (expressOnly && !listing.express) return false;

            return true;
        });

        this.updateListingsDisplay();
        this.updateActiveFilters();
    }

    updateListingsDisplay() {
        this.listings.forEach(listing => {
            const isVisible = this.filteredListings.includes(listing);
            listing.element.style.display = isVisible ? 'block' : 'none';
            
            if (isVisible) {
                listing.element.style.animation = 'fadeInUp 0.5s ease-out';
            }
        });
    }

    updateActiveFilters() {
        const activeFiltersDiv = document.getElementById('active-filters');
        const filterTagsDiv = document.getElementById('filter-tags');
        
        if (!activeFiltersDiv || !filterTagsDiv) return;

        const filters = [];
        const priceFilter = document.getElementById('price-filter')?.value;
        const locationFilter = document.getElementById('location-filter')?.value;
        const typeFilter = document.getElementById('type-filter')?.value;
        const expressOnly = document.getElementById('express-only')?.checked;

        if (priceFilter) filters.push(`Price: ${this.formatPriceRange(priceFilter)}`);
        if (locationFilter) filters.push(`Location: ${locationFilter}`);
        if (typeFilter) filters.push(`Type: ${typeFilter.replace('-', ' ')}`);
        if (expressOnly) filters.push('Express Sellers Only');

        if (filters.length > 0) {
            activeFiltersDiv.classList.remove('hidden');
            filterTagsDiv.innerHTML = filters.map(filter => 
                `<span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">${filter}</span>`
            ).join('');
        } else {
            activeFiltersDiv.classList.add('hidden');
        }
    }

    formatPriceRange(range) {
        if (range === '1000000+') return '$1M+';
        const [min, max] = range.split('-');
        const formatPrice = (price) => {
            const num = parseInt(price);
            if (num >= 1000000) return `$${num / 1000000}M`;
            if (num >= 1000) return `$${num / 1000}K`;
            return `$${num}`;
        };
        return max ? `${formatPrice(min)} - ${formatPrice(max)}` : formatPrice(min);
    }

    clearFilters() {
        document.getElementById('price-filter').value = '';
        document.getElementById('location-filter').value = '';
        document.getElementById('type-filter').value = '';
        document.getElementById('express-only').checked = false;
        this.updateExpressToggle();
        this.applyFilters();
    }

    updateExpressToggle() {
        const checkbox = document.getElementById('express-only');
        const toggle = checkbox.parentElement.querySelector('div');
        const slider = toggle.querySelector('div');
        
        if (checkbox.checked) {
            toggle.classList.add('bg-emerald-500');
            toggle.classList.remove('bg-slate-300', 'dark:bg-slate-600');
            slider.classList.add('translate-x-4');
        } else {
            toggle.classList.remove('bg-emerald-500');
            toggle.classList.add('bg-slate-300', 'dark:bg-slate-600');
            slider.classList.remove('translate-x-4');
        }
    }

    startQuiz() {
        if (!this.isAuthenticated) {
            this.showAuthPrompt('Take the Quick Match Quiz to find your perfect auto shop investment!');
            return;
        }

        // Create quiz modal
        this.showQuizModal();
    }

    showQuizModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full">
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quick Match Quiz</h3>
                    <p class="text-slate-600 dark:text-slate-300">Find your perfect auto shop investment</p>
                </div>
                <div id="quiz-content">
                    <!-- Quiz questions will be inserted here -->
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.renderQuizStep();
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                this.quizStep = 0;
                this.quizAnswers = {};
            }
        });
    }

    renderQuizStep() {
        const content = document.getElementById('quiz-content');
        const questions = [
            {
                question: "What's your investment budget?",
                options: [
                    { value: '0-300000', label: 'Under $300K' },
                    { value: '300000-600000', label: '$300K - $600K' },
                    { value: '600000-1000000', label: '$600K - $1M' },
                    { value: '1000000+', label: '$1M+' }
                ]
            },
            {
                question: "Preferred location in DFW?",
                options: [
                    { value: 'dallas', label: 'Dallas' },
                    { value: 'plano', label: 'Plano' },
                    { value: 'arlington', label: 'Arlington' },
                    { value: 'any', label: 'Any DFW Area' }
                ]
            },
            {
                question: "What type of auto business interests you most?",
                options: [
                    { value: 'full-service', label: 'Full Service Repair' },
                    { value: 'transmission', label: 'Transmission Specialist' },
                    { value: 'quick-lube', label: 'Quick Lube' },
                    { value: 'any', label: 'Open to All Types' }
                ]
            }
        ];

        if (this.quizStep < questions.length) {
            const question = questions[this.quizStep];
            content.innerHTML = `
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-sm text-slate-500">Question ${this.quizStep + 1} of ${questions.length}</span>
                        <div class="w-24 bg-slate-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${((this.quizStep + 1) / questions.length) * 100}%"></div>
                        </div>
                    </div>
                    <h4 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">${question.question}</h4>
                    <div class="space-y-3">
                        ${question.options.map(option => `
                            <button type="button" class="quiz-option w-full text-left p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-value="${option.value}">
                                ${option.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;

            // Add event listeners to options
            content.querySelectorAll('.quiz-option').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.quizAnswers[`question${this.quizStep}`] = e.target.dataset.value;
                    this.quizStep++;
                    this.renderQuizStep();
                });
            });
        } else {
            this.showQuizResults();
        }
    }

    showQuizResults() {
        const content = document.getElementById('quiz-content');
        content.innerHTML = `
            <div class="text-center">
                <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Perfect Matches Found!</h4>
                <p class="text-slate-600 dark:text-slate-300 mb-6">Based on your preferences, we've filtered the listings to show your best matches.</p>
                <button type="button" id="apply-quiz-filters" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                    View My Matches
                </button>
            </div>
        `;

        document.getElementById('apply-quiz-filters').addEventListener('click', () => {
            this.applyQuizFilters();
            document.querySelector('.fixed.inset-0').remove();
            this.quizStep = 0;
            this.quizAnswers = {};
        });
    }

    applyQuizFilters() {
        // Apply filters based on quiz answers
        if (this.quizAnswers.question0 && this.quizAnswers.question0 !== 'any') {
            document.getElementById('price-filter').value = this.quizAnswers.question0;
        }
        if (this.quizAnswers.question1 && this.quizAnswers.question1 !== 'any') {
            document.getElementById('location-filter').value = this.quizAnswers.question1;
        }
        if (this.quizAnswers.question2 && this.quizAnswers.question2 !== 'any') {
            document.getElementById('type-filter').value = this.quizAnswers.question2;
        }
        
        this.applyFilters();
        
        // Scroll to listings
        document.getElementById('listings-grid').scrollIntoView({ behavior: 'smooth' });
        
        // Show success message
        this.showToast('Filters applied based on your quiz results!', 'success');
    }

    handleFavorite(e) {
        e.stopPropagation();
        
        if (!this.isAuthenticated) {
            this.showAuthPrompt('Sign up to save your favorite listings and get notified of new matches!');
            return;
        }

        const btn = e.currentTarget;
        const listingId = btn.dataset.listingId;
        const svg = btn.querySelector('svg path');
        
        if (this.favorites.includes(listingId)) {
            // Remove from favorites
            this.favorites = this.favorites.filter(id => id !== listingId);
            svg.setAttribute('fill', 'none');
            btn.classList.remove('text-red-500');
            btn.classList.add('text-slate-600');
            this.showToast('Removed from favorites', 'info');
        } else {
            // Add to favorites
            this.favorites.push(listingId);
            svg.setAttribute('fill', 'currentColor');
            btn.classList.add('text-red-500');
            btn.classList.remove('text-slate-600');
            this.showToast('Added to favorites', 'success');
        }
        
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    handleViewDetails(e) {
        const listingId = e.currentTarget.dataset.listingId;
        
        if (!this.isAuthenticated) {
            this.showAuthPrompt('Sign up to view detailed financial information, photos, and seller contact details!');
            return;
        }
        
        // Navigate to details page
        window.location.href = `/marketplace/listing-details.html?id=${listingId}`;
    }

    handleContactSeller(e) {
        const listingId = e.currentTarget.dataset.listingId;
        
        if (!this.isAuthenticated) {
            this.showAuthPrompt('Sign up to contact sellers directly and start your acquisition journey!');
            return;
        }
        
        // Open contact modal or navigate to messaging
        this.showToast('Opening secure messaging...', 'info');
        // TODO: Implement messaging functionality
    }

    handleSaveSearch() {
        if (!this.isAuthenticated) {
            this.showAuthPrompt('Sign up to save search alerts and get notified when new listings match your criteria!');
            return;
        }

        this.showToast('Search alert saved! You\'ll be notified of new matches.', 'success');
        // TODO: Implement search alert functionality
    }

    handleDashboardPreview() {
        if (!this.isAuthenticated) {
            this.showAuthPrompt('Sign up to access your personalized dashboard with real-time insights and deal management tools!');
            return;
        }

        // Redirect to dashboard
        window.location.href = '/dashboard/';
    }

    handleScheduleDemo() {
        // Open demo scheduling modal
        this.showDemoModal();
    }

    showDemoModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Schedule Your Demo</h3>
                    <p class="text-slate-600 dark:text-slate-300">Get a personalized walkthrough of the platform</p>
                </div>
                <form id="demo-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                        <input type="text" required class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                        <input type="email" required class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                        <select required class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                            <option value="">Select your role</option>
                            <option value="buyer">Business Buyer</option>
                            <option value="seller">Business Seller</option>
                            <option value="vendor">Professional Vendor</option>
                        </select>
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                            Schedule Demo
                        </button>
                        <button type="button" class="flex-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 py-3 px-6 rounded-lg font-semibold transition-colors" onclick="this.closest('.fixed').remove()">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        modal.querySelector('#demo-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.showToast('Demo scheduled! We\'ll contact you within 24 hours.', 'success');
            modal.remove();
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    updateFavoriteButtons() {
        document.querySelectorAll('.save-favorite').forEach(btn => {
            const listingId = btn.dataset.listingId;
            const svg = btn.querySelector('svg path');
            
            if (this.favorites.includes(listingId)) {
                svg.setAttribute('fill', 'currentColor');
                btn.classList.add('text-red-500');
                btn.classList.remove('text-slate-600');
            }
        });
    }

    checkAuthStatus() {
        // Check if user is authenticated (integrate with your auth system)
        // For now, check if there's a token or user data
        this.isAuthenticated = !!localStorage.getItem('authToken') || !!localStorage.getItem('user');
        
        // Hide signup prompt if authenticated
        if (this.isAuthenticated) {
            const signupPrompt = document.getElementById('signup-prompt');
            if (signupPrompt) {
                signupPrompt.style.display = 'none';
            }
        }
    }

    showAuthPrompt(message) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Sign Up Required</h3>
                <p class="text-slate-600 dark:text-slate-300 mb-6">${message}</p>
                <div class="flex gap-3">
                    <button type="button" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors" onclick="window.location.href='/auth/register.html'">
                        Sign Up Free
                    </button>
                    <button type="button" class="flex-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 py-3 px-6 rounded-lg font-semibold transition-colors" onclick="this.closest('.fixed').remove()">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showSellerMetrics() {
        // Show seller-focused metrics in listings
        document.querySelectorAll('.listing-card').forEach(card => {
            const statsGrid = card.querySelector('.grid.grid-cols-3');
            if (statsGrid) {
                // Add seller-focused metrics
                const sellerMetric = document.createElement('div');
                sellerMetric.className = 'text-center';
                sellerMetric.innerHTML = `
                    <div class="font-semibold text-emerald-600">Fast</div>
                    <div class="text-xs">Sale</div>
                `;
                statsGrid.appendChild(sellerMetric);
            }
        });
    }

    showVendorOpportunities() {
        // Show vendor-focused opportunities
        document.querySelectorAll('.listing-card').forEach(card => {
            const cardContent = card.querySelector('.p-6');
            if (cardContent) {
                // Add vendor opportunity indicator
                const vendorBadge = document.createElement('div');
                vendorBadge.className = 'inline-flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium mb-2';
                vendorBadge.innerHTML = `
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H6a2 2 0 00-2-2V6m8 0H8m8 0v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6"></path>
                    </svg>
                    Services Needed
                `;
                cardContent.insertBefore(vendorBadge, cardContent.firstChild);
            }
        });
    }

    updateQuizForRole(role) {
        // Update quiz questions based on role
        this.roleSpecificQuizQuestions = this.getQuizQuestionsForRole(role);
    }

    getQuizQuestionsForRole(role) {
        const baseQuestions = [
            {
                question: "What's your investment budget?",
                options: [
                    { value: '0-300000', label: 'Under $300K' },
                    { value: '300000-600000', label: '$300K - $600K' },
                    { value: '600000-1000000', label: '$600K - $1M' },
                    { value: '1000000+', label: '$1M+' }
                ]
            },
            {
                question: "Preferred location in DFW?",
                options: [
                    { value: 'dallas', label: 'Dallas' },
                    { value: 'plano', label: 'Plano' },
                    { value: 'arlington', label: 'Arlington' },
                    { value: 'any', label: 'Any DFW Area' }
                ]
            },
            {
                question: "What type of auto business interests you most?",
                options: [
                    { value: 'full-service', label: 'Full Service Repair' },
                    { value: 'transmission', label: 'Transmission Specialist' },
                    { value: 'quick-lube', label: 'Quick Lube' },
                    { value: 'any', label: 'Open to All Types' }
                ]
            }
        ];

        if (role === 'seller') {
            return [
                {
                    question: "What's your business's annual revenue?",
                    options: [
                        { value: '0-500000', label: 'Under $500K' },
                        { value: '500000-1000000', label: '$500K - $1M' },
                        { value: '1000000-2000000', label: '$1M - $2M' },
                        { value: '2000000+', label: '$2M+' }
                    ]
                },
                {
                    question: "How quickly do you want to sell?",
                    options: [
                        { value: 'immediate', label: 'Within 30 days' },
                        { value: 'fast', label: '1-3 months' },
                        { value: 'flexible', label: '3-6 months' },
                        { value: 'planning', label: 'Just exploring' }
                    ]
                },
                {
                    question: "What's most important to you?",
                    options: [
                        { value: 'price', label: 'Maximum sale price' },
                        { value: 'speed', label: 'Quick closing' },
                        { value: 'buyer-quality', label: 'Right buyer fit' },
                        { value: 'support', label: 'Full-service support' }
                    ]
                }
            ];
        } else if (role === 'vendor') {
            return [
                {
                    question: "What services do you provide?",
                    options: [
                        { value: 'legal', label: 'Legal Services' },
                        { value: 'financial', label: 'Financial/CPA' },
                        { value: 'lending', label: 'Lending/Financing' },
                        { value: 'consulting', label: 'Business Consulting' }
                    ]
                },
                {
                    question: "What's your capacity for new clients?",
                    options: [
                        { value: 'high', label: 'Actively seeking' },
                        { value: 'medium', label: 'Selective opportunities' },
                        { value: 'low', label: 'Referral only' },
                        { value: 'full', label: 'Just networking' }
                    ]
                },
                {
                    question: "What deal size interests you most?",
                    options: [
                        { value: 'small', label: 'Under $500K' },
                        { value: 'medium', label: '$500K - $2M' },
                        { value: 'large', label: '$2M+' },
                        { value: 'any', label: 'Any size' }
                    ]
                }
            ];
        }

        return baseQuestions;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

        toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    handleDownloadReport() {
        // Show email capture modal for report download
        this.showEmailCaptureModal(
            'Download DFW Market Report',
            'Get instant access to our quarterly market analysis with trends, valuations, and opportunities in the Dallas-Fort Worth auto repair market.',
            'Download Report',
            (email) => {
                this.showToast('Report sent to your email! Check your inbox in a few minutes.', 'success');
                // TODO: Implement actual report delivery
            }
        );
    }

    handlePremiumAccess(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;

        if (!email) {
            this.showToast('Please enter a valid email address.', 'error');
            return;
        }

        // Simulate premium access signup
        this.showToast('Welcome! Check your email for premium access instructions.', 'success');
        e.target.reset();

        // TODO: Implement actual premium access signup
    }

    showEmailCaptureModal(title, description, buttonText, onSubmit) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">${title}</h3>
                    <p class="text-slate-600 dark:text-slate-300">${description}</p>
                </div>
                <form id="email-capture-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                        <input type="email" required class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white" placeholder="your@email.com">
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                            ${buttonText}
                        </button>
                        <button type="button" class="flex-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 py-3 px-6 rounded-lg font-semibold transition-colors" onclick="this.closest('.fixed').remove()">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        modal.querySelector('#email-capture-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            onSubmit(email);
            modal.remove();
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    setupWelcomeModal() {
        // Check if user has seen welcome modal before
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
        const isFirstVisit = !localStorage.getItem('hasVisited');

        // Show welcome modal for first-time visitors or if they haven't seen it
        if (!hasSeenWelcome && isFirstVisit) {
            // Delay showing modal to let page load
            setTimeout(() => {
                this.showWelcomeModal();
            }, 2000);
        }

        // Mark as visited
        localStorage.setItem('hasVisited', 'true');
    }

    showWelcomeModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 12v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </div>
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Welcome to Ardonie Capital!</h2>
                    <p class="text-xl text-slate-600 dark:text-slate-300 mb-6">
                        We help connect buyers, sellers, and vendors in the DFW auto repair market. Let us personalize your experience.
                    </p>
                    <p class="text-lg text-slate-500 dark:text-slate-400">
                        What brings you here today?
                    </p>
                </div>

                <!-- Role Selection Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button type="button" class="welcome-role-card group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 text-left" data-role="buyer">
                        <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">I'm a Buyer</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-300">Looking to acquire an auto repair business</p>
                    </button>

                    <button type="button" class="welcome-role-card group bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl p-6 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-200 text-left" data-role="seller">
                        <div class="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">I'm a Seller</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-300">Ready to sell my auto repair business</p>
                    </button>

                    <button type="button" class="welcome-role-card group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-6 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200 text-left" data-role="vendor">
                        <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">I'm a Vendor</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-300">Professional service provider (CPA, Attorney, etc.)</p>
                    </button>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-4">
                    <button type="button" id="browse-without-role" class="flex-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 py-3 px-6 rounded-lg font-semibold transition-colors">
                        Browse Without Personalization
                    </button>
                    <button type="button" id="close-welcome-modal" class="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                        Maybe Later
                    </button>
                </div>

                <!-- Don't show again option -->
                <div class="mt-6 text-center">
                    <label class="inline-flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <input type="checkbox" id="dont-show-again" class="mr-2 rounded">
                        Don't show this again
                    </label>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle role selection
        modal.querySelectorAll('.welcome-role-card').forEach(card => {
            card.addEventListener('click', () => {
                const role = card.dataset.role;
                this.handleWelcomeRoleSelection(role);
                this.closeWelcomeModal(modal);
            });
        });

        // Handle browse without role
        modal.querySelector('#browse-without-role').addEventListener('click', () => {
            this.handleWelcomeRoleSelection('general');
            this.closeWelcomeModal(modal);
        });

        // Handle close modal
        modal.querySelector('#close-welcome-modal').addEventListener('click', () => {
            this.closeWelcomeModal(modal);
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeWelcomeModal(modal);
            }
        });
    }

    handleWelcomeRoleSelection(role) {
        // Store user's role preference
        localStorage.setItem('userRolePreference', role);

        // Track analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'welcome_role_selection', {
                'role': role,
                'source': 'welcome_modal'
            });
        }

        // Trigger role selection if enhanced role segmentation is available
        if (window.EnhancedRoleSegmentation) {
            // Simulate role selection
            const roleCards = document.querySelectorAll('.role-selection-card');
            const targetCard = Array.from(roleCards).find(card => card.dataset.role === role);
            if (targetCard) {
                targetCard.click();
            }
        }

        this.showToast(`Welcome! Your experience has been personalized for ${role === 'general' ? 'general browsing' : role + 's'}.`, 'success');
    }

    closeWelcomeModal(modal) {
        const dontShowAgain = modal.querySelector('#dont-show-again').checked;

        if (dontShowAgain) {
            localStorage.setItem('hasSeenWelcomeModal', 'true');
        }

        modal.remove();
    }

    setupTestimonialsSlider() {
        this.currentTestimonialSlide = 0;
        this.totalTestimonialSlides = 3;

        // Navigation buttons
        document.getElementById('testimonials-prev')?.addEventListener('click', () => {
            this.previousTestimonial();
        });

        document.getElementById('testimonials-next')?.addEventListener('click', () => {
            this.nextTestimonial();
        });

        // Dot navigation
        document.querySelectorAll('.testimonial-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToTestimonial(index);
            });
        });

        // Auto-play slider
        this.startTestimonialAutoplay();

        // Pause on hover
        const slider = document.getElementById('testimonials-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.pauseTestimonialAutoplay());
            slider.addEventListener('mouseleave', () => this.startTestimonialAutoplay());
        }

        // Initialize first slide
        this.updateTestimonialSlider();
    }

    nextTestimonial() {
        this.currentTestimonialSlide = (this.currentTestimonialSlide + 1) % this.totalTestimonialSlides;
        this.updateTestimonialSlider();
    }

    previousTestimonial() {
        this.currentTestimonialSlide = (this.currentTestimonialSlide - 1 + this.totalTestimonialSlides) % this.totalTestimonialSlides;
        this.updateTestimonialSlider();
    }

    goToTestimonial(index) {
        this.currentTestimonialSlide = index;
        this.updateTestimonialSlider();
    }

    updateTestimonialSlider() {
        const track = document.getElementById('testimonials-track');
        const dots = document.querySelectorAll('.testimonial-dot');

        if (track) {
            const translateX = -this.currentTestimonialSlide * 100;
            track.style.transform = `translateX(${translateX}%)`;
        }

        // Update dots
        dots.forEach((dot, index) => {
            if (index === this.currentTestimonialSlide) {
                dot.classList.remove('bg-white/50');
                dot.classList.add('bg-white');
            } else {
                dot.classList.remove('bg-white');
                dot.classList.add('bg-white/50');
            }
        });
    }

    startTestimonialAutoplay() {
        this.pauseTestimonialAutoplay(); // Clear any existing interval
        this.testimonialAutoplayInterval = setInterval(() => {
            this.nextTestimonial();
        }, 5000); // Change slide every 5 seconds
    }

    pauseTestimonialAutoplay() {
        if (this.testimonialAutoplayInterval) {
            clearInterval(this.testimonialAutoplayInterval);
            this.testimonialAutoplayInterval = null;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedListings();
});

// Add CSS animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;
document.head.appendChild(animationStyles);
