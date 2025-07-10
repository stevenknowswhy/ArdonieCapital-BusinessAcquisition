/**
 * Comprehensive Matchmaking System for Ardonie Capital
 * Handles filtering, pagination, preferences, and interactive match cards
 */

class MatchmakingSystem {
    constructor() {
        this.matches = [];
        this.filteredMatches = [];
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.filters = {
            businessType: '',
            priceMin: '',
            priceMax: '',
            location: '',
            revenueRange: '',
            yearsInBusiness: ''
        };
        this.userPreferences = this.loadPreferences();
        this.favoriteMatches = this.loadFavorites();
        this.interestedMatches = this.loadInterested();

        this.init();
    }

    init() {
        this.generateSampleMatches();
        this.setupEventListeners();
        this.renderFilters();
        this.applyFilters();
        this.updateStatistics();
    }

    generateSampleMatches() {
        this.matches = [
            {
                id: 1,
                name: "Premier Auto Service Center",
                type: "Full Service",
                location: "Plano, TX",
                askingPrice: 850000,
                revenue: 1200000,
                cashFlow: 285000,
                yearsInBusiness: 15,
                matchScore: 95,
                isExpress: true,
                description: "Established full-service auto repair shop with loyal customer base, modern equipment, and excellent reputation.",
                image: "https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 2,
                matchReasons: ["Within budget range", "Preferred location", "Full-service type", "Strong financials"]
            },
            {
                id: 2,
                name: "Elite Transmission Specialists",
                type: "Transmission",
                location: "Arlington, TX",
                askingPrice: 650000,
                revenue: 850000,
                cashFlow: 195000,
                yearsInBusiness: 25,
                matchScore: 82,
                isExpress: false,
                description: "Specialized transmission repair shop with 25+ years in business and excellent reputation in the Arlington area.",
                image: "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 5,
                matchReasons: ["Specialized expertise", "Established reputation", "Good location"]
            },
            {
                id: 3,
                name: "Quick Fix Auto Body",
                type: "Auto Body",
                location: "Dallas, TX",
                askingPrice: 425000,
                revenue: 680000,
                cashFlow: 125000,
                yearsInBusiness: 12,
                matchScore: 78,
                isExpress: false,
                description: "Established auto body shop with insurance partnerships and steady workflow. Great opportunity for expansion.",
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 7,
                matchReasons: ["Insurance partnerships", "Growth potential", "Affordable price"]
            },
            {
                id: 4,
                name: "DFW Tire & Alignment",
                type: "Tire Shop",
                location: "Fort Worth, TX",
                askingPrice: 320000,
                revenue: 520000,
                cashFlow: 98000,
                yearsInBusiness: 8,
                matchScore: 74,
                isExpress: true,
                description: "Modern tire shop with alignment services, strong customer base, and excellent location on busy commercial street.",
                image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 3,
                matchReasons: ["High traffic location", "Modern equipment", "Express seller"]
            },
            {
                id: 5,
                name: "Precision Engine Works",
                type: "Engine Repair",
                location: "Richardson, TX",
                askingPrice: 780000,
                revenue: 1050000,
                cashFlow: 245000,
                yearsInBusiness: 18,
                matchScore: 88,
                isExpress: true,
                description: "Specialized engine repair and rebuilding shop with advanced diagnostic equipment and skilled technicians.",
                image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 1,
                matchReasons: ["Specialized services", "High revenue", "Skilled workforce", "Express seller"]
            },
            {
                id: 6,
                name: "Metro Quick Lube",
                type: "Quick Lube",
                location: "Garland, TX",
                askingPrice: 280000,
                revenue: 450000,
                cashFlow: 85000,
                yearsInBusiness: 6,
                matchScore: 71,
                isExpress: false,
                description: "Fast-service oil change and basic maintenance shop with drive-through service and loyal customer base.",
                image: "https://images.unsplash.com/photo-1609205264511-b0b3b8b6b8b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 4,
                matchReasons: ["Fast service model", "Drive-through convenience", "Entry-level investment"]
            },
            {
                id: 7,
                name: "Advanced Auto Diagnostics",
                type: "Full Service",
                location: "Irving, TX",
                askingPrice: 920000,
                revenue: 1350000,
                cashFlow: 315000,
                yearsInBusiness: 22,
                matchScore: 91,
                isExpress: true,
                description: "State-of-the-art diagnostic center with full-service capabilities, serving luxury and import vehicles.",
                image: "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 6,
                matchReasons: ["Luxury market", "Advanced equipment", "High revenue", "Express seller"]
            },
            {
                id: 8,
                name: "Collision Center Plus",
                type: "Auto Body",
                location: "Mesquite, TX",
                askingPrice: 550000,
                revenue: 780000,
                cashFlow: 165000,
                yearsInBusiness: 14,
                matchScore: 79,
                isExpress: false,
                description: "Full-service collision repair center with paint booth, frame straightening, and insurance direct repair partnerships.",
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 8,
                matchReasons: ["Insurance partnerships", "Complete services", "Frame equipment"]
            },
            {
                id: 9,
                name: "Brake Masters DFW",
                type: "Brake Service",
                location: "Grand Prairie, TX",
                askingPrice: 380000,
                revenue: 590000,
                cashFlow: 125000,
                yearsInBusiness: 10,
                matchScore: 76,
                isExpress: true,
                description: "Specialized brake service center with quick turnaround times and warranty programs.",
                image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 5,
                matchReasons: ["Specialized niche", "Quick service", "Warranty programs", "Express seller"]
            },
            {
                id: 10,
                name: "European Auto Specialists",
                type: "Import Service",
                location: "Addison, TX",
                askingPrice: 1100000,
                revenue: 1580000,
                cashFlow: 385000,
                yearsInBusiness: 20,
                matchScore: 93,
                isExpress: true,
                description: "Premium European vehicle service center specializing in BMW, Mercedes, Audi, and Porsche.",
                image: "https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 2,
                matchReasons: ["Premium market", "Specialized expertise", "High margins", "Express seller"]
            },
            {
                id: 11,
                name: "Fleet Service Solutions",
                type: "Fleet Service",
                location: "Carrollton, TX",
                askingPrice: 750000,
                revenue: 980000,
                cashFlow: 220000,
                yearsInBusiness: 16,
                matchScore: 84,
                isExpress: false,
                description: "Commercial fleet maintenance facility serving local businesses and government contracts.",
                image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 9,
                matchReasons: ["Commercial contracts", "Steady revenue", "B2B focus"]
            },
            {
                id: 12,
                name: "Performance Plus Tuning",
                type: "Performance",
                location: "Lewisville, TX",
                askingPrice: 480000,
                revenue: 720000,
                cashFlow: 155000,
                yearsInBusiness: 9,
                matchScore: 77,
                isExpress: true,
                description: "Performance tuning and modification shop specializing in sports cars and racing vehicles.",
                image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100&q=80",
                addedDays: 3,
                matchReasons: ["Niche market", "High margins", "Enthusiast customer base", "Express seller"]
            }
        ];
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('match-filter')?.addEventListener('change', (e) => {
            this.handleQuickFilter(e.target.value);
        });

        document.getElementById('match-sort')?.addEventListener('change', (e) => {
            this.handleSort(e.target.value);
        });

        // Advanced filters
        document.getElementById('business-type-filter')?.addEventListener('change', (e) => {
            this.filters.businessType = e.target.value;
            this.applyFilters();
        });

        document.getElementById('price-min')?.addEventListener('input', (e) => {
            this.filters.priceMin = e.target.value;
            this.applyFilters();
        });

        document.getElementById('price-max')?.addEventListener('input', (e) => {
            this.filters.priceMax = e.target.value;
            this.applyFilters();
        });

        document.getElementById('location-filter')?.addEventListener('change', (e) => {
            this.filters.location = e.target.value;
            this.applyFilters();
        });

        // Load more button
        document.getElementById('load-more-btn')?.addEventListener('click', () => {
            this.loadMore();
        });

        // Update preferences button
        document.getElementById('update-preferences-btn')?.addEventListener('click', () => {
            this.showPreferencesModal();
        });

        // Clear filters button
        document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
            this.clearFilters();
        });
    }

    handleQuickFilter(filterValue) {
        switch(filterValue) {
            case 'Express Sellers Only':
                this.filteredMatches = this.matches.filter(match => match.isExpress);
                break;
            case 'High Match Score (90%+)':
                this.filteredMatches = this.matches.filter(match => match.matchScore >= 90);
                break;
            case 'New This Week':
                this.filteredMatches = this.matches.filter(match => match.addedDays <= 7);
                break;
            default:
                this.filteredMatches = [...this.matches];
        }
        this.currentPage = 1;
        this.renderMatches();
        this.updateStatistics();
    }

    handleSort(sortValue) {
        switch(sortValue) {
            case 'Sort by: Match Score':
                this.filteredMatches.sort((a, b) => b.matchScore - a.matchScore);
                break;
            case 'Sort by: Date Added':
                this.filteredMatches.sort((a, b) => a.addedDays - b.addedDays);
                break;
            case 'Sort by: Price':
                this.filteredMatches.sort((a, b) => a.askingPrice - b.askingPrice);
                break;
            case 'Sort by: Revenue':
                this.filteredMatches.sort((a, b) => b.revenue - a.revenue);
                break;
        }
        this.renderMatches();
    }

    applyFilters() {
        this.filteredMatches = this.matches.filter(match => {
            // Business type filter
            if (this.filters.businessType && match.type !== this.filters.businessType) {
                return false;
            }

            // Price range filter
            if (this.filters.priceMin && match.askingPrice < parseInt(this.filters.priceMin)) {
                return false;
            }
            if (this.filters.priceMax && match.askingPrice > parseInt(this.filters.priceMax)) {
                return false;
            }

            // Location filter
            if (this.filters.location && !match.location.includes(this.filters.location)) {
                return false;
            }

            return true;
        });

        this.currentPage = 1;
        this.renderMatches();
        this.updateStatistics();
    }

    clearFilters() {
        this.filters = {
            businessType: '',
            priceMin: '',
            priceMax: '',
            location: '',
            revenueRange: '',
            yearsInBusiness: ''
        };

        // Reset form elements
        document.getElementById('match-filter').value = 'All Matches';
        document.getElementById('match-sort').value = 'Sort by: Match Score';
        document.getElementById('business-type-filter').value = '';
        document.getElementById('price-min').value = '';
        document.getElementById('price-max').value = '';
        document.getElementById('location-filter').value = '';

        this.filteredMatches = [...this.matches];
        this.currentPage = 1;
        this.renderMatches();
        this.updateStatistics();
    }

    renderFilters() {
        const advancedFiltersHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Advanced Filters</h3>
                    <button id="clear-filters-btn" class="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-dark transition-colors">
                        Clear All Filters
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label for="business-type-filter" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Type</label>
                        <select id="business-type-filter" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                            <option value="">All Types</option>
                            <option value="Full Service">Full Service</option>
                            <option value="Transmission">Transmission</option>
                            <option value="Auto Body">Auto Body</option>
                            <option value="Tire Shop">Tire Shop</option>
                            <option value="Engine Repair">Engine Repair</option>
                            <option value="Quick Lube">Quick Lube</option>
                            <option value="Import Service">Import Service</option>
                            <option value="Fleet Service">Fleet Service</option>
                            <option value="Performance">Performance</option>
                            <option value="Brake Service">Brake Service</option>
                        </select>
                    </div>
                    <div>
                        <label for="price-min" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Price</label>
                        <input type="number" id="price-min" placeholder="$0" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                    </div>
                    <div>
                        <label for="price-max" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Price</label>
                        <input type="number" id="price-max" placeholder="$2,000,000" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                    </div>
                    <div>
                        <label for="location-filter" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                        <select id="location-filter" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                            <option value="">All Locations</option>
                            <option value="Dallas">Dallas</option>
                            <option value="Plano">Plano</option>
                            <option value="Arlington">Arlington</option>
                            <option value="Fort Worth">Fort Worth</option>
                            <option value="Richardson">Richardson</option>
                            <option value="Garland">Garland</option>
                            <option value="Irving">Irving</option>
                            <option value="Mesquite">Mesquite</option>
                            <option value="Grand Prairie">Grand Prairie</option>
                            <option value="Addison">Addison</option>
                            <option value="Carrollton">Carrollton</option>
                            <option value="Lewisville">Lewisville</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        // Insert advanced filters after the basic filter section
        const filterSection = document.querySelector('.flex.flex-col.sm\\:flex-row.justify-between');
        if (filterSection) {
            filterSection.insertAdjacentHTML('afterend', advancedFiltersHTML);
        }
    }

    renderMatches() {
        const matchesContainer = document.querySelector('.space-y-6');
        if (!matchesContainer) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const matchesToShow = this.filteredMatches.slice(0, endIndex);

        matchesContainer.innerHTML = '';

        matchesToShow.forEach(match => {
            const matchCard = this.createMatchCard(match);
            matchesContainer.appendChild(matchCard);
        });

        // Update load more button
        this.updateLoadMoreButton();
    }

    createMatchCard(match) {
        const card = document.createElement('div');
        const isHighPriority = match.matchScore >= 90;
        const isFavorite = this.favoriteMatches.includes(match.id);
        const isInterested = this.interestedMatches.includes(match.id);

        card.className = isHighPriority
            ? 'bg-white dark:bg-slate-800 rounded-lg shadow-sm border-2 border-accent dark:border-accent/50 overflow-hidden'
            : 'bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6';

        const priorityHeader = isHighPriority ? `
            <div class="bg-gradient-to-r from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 px-6 py-3 border-b border-accent/20">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-accent-dark font-semibold">🎯 High Priority Match</span>
                        ${match.isExpress ? '<span class="bg-accent text-white text-xs font-bold px-2 py-1 rounded">🚖 Express Seller</span>' : ''}
                    </div>
                    <span class="text-2xl font-bold text-accent-dark">${match.matchScore}% Match</span>
                </div>
            </div>
        ` : '';

        card.innerHTML = `
            ${priorityHeader}
            <div class="${isHighPriority ? 'p-6' : ''}">
                <div class="flex items-start space-x-6">
                    <img src="${match.image}" alt="${match.name}" class="w-32 h-24 object-cover rounded-lg">
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-xl font-semibold text-slate-900 dark:text-white">${match.name}</h3>
                            <div class="flex items-center space-x-2">
                                ${!isHighPriority ? `<span class="text-lg font-bold text-primary-dark">${match.matchScore}% Match</span>` : ''}
                                <button type="button" data-match-id="${match.id}" class="favorite-btn p-2 text-slate-400 hover:text-accent-dark transition-all ${isFavorite ? 'text-accent-dark' : ''}" aria-label="Add to favorites" title="Add to favorites">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="${isFavorite ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4 mb-3">
                            <span class="bg-primary-light/20 text-primary-dark text-xs font-medium px-2 py-1 rounded">${match.type}</span>
                            ${match.isExpress && !isHighPriority ? '<span class="bg-accent text-white text-xs font-bold px-2 py-1 rounded">🚖 Express</span>' : ''}
                            <div class="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                ${match.location}
                            </div>
                            <span class="text-sm text-slate-500 dark:text-slate-400">Added ${match.addedDays} day${match.addedDays !== 1 ? 's' : ''} ago</span>
                        </div>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">${match.description}</p>

                        ${isHighPriority && match.matchReasons ? `
                            <div class="mb-4">
                                <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-2">Why this is a great match:</h4>
                                <div class="flex flex-wrap gap-2">
                                    ${match.matchReasons.map(reason => `<span class="bg-accent/10 text-accent-dark text-xs px-2 py-1 rounded">✓ ${reason}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <div class="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <span class="text-sm text-slate-500 dark:text-slate-400">Asking Price</span>
                                <div class="font-semibold text-slate-900 dark:text-white">$${this.formatNumber(match.askingPrice)}</div>
                            </div>
                            <div>
                                <span class="text-sm text-slate-500 dark:text-slate-400">Annual Revenue</span>
                                <div class="font-semibold text-slate-900 dark:text-white">$${this.formatNumber(match.revenue)}</div>
                            </div>
                            <div>
                                <span class="text-sm text-slate-500 dark:text-slate-400">Cash Flow</span>
                                <div class="font-semibold text-slate-900 dark:text-white">$${this.formatNumber(match.cashFlow)}</div>
                            </div>
                        </div>

                        <div class="flex space-x-3">
                            ${isHighPriority ? `
                                <button class="express-interest-btn bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-md transition-all" data-match-id="${match.id}">
                                    ${isInterested ? 'Interest Expressed' : 'Express Interest'}
                                </button>
                            ` : ''}
                            <button class="view-details-btn bg-primary-dark hover:bg-primary text-white font-medium py-2 px-4 rounded-md transition-all" data-match-id="${match.id}">
                                View Details
                            </button>
                            <button class="message-seller-btn bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-md transition-all" data-match-id="${match.id}">
                                ${isHighPriority ? 'Message Seller' : 'Contact Seller'}
                            </button>
                            ${!isHighPriority ? `
                                <button class="not-interested-btn bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-md transition-all" data-match-id="${match.id}">
                                    Not Interested
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners to the card buttons
        this.addCardEventListeners(card, match);

        return card;
    }

    addCardEventListeners(card, match) {
        // Favorite button
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn?.addEventListener('click', () => {
            this.toggleFavorite(match.id);
        });

        // Express interest button
        const expressInterestBtn = card.querySelector('.express-interest-btn');
        expressInterestBtn?.addEventListener('click', () => {
            this.expressInterest(match.id);
        });

        // View details button
        const viewDetailsBtn = card.querySelector('.view-details-btn');
        viewDetailsBtn?.addEventListener('click', () => {
            this.viewDetails(match.id);
        });

        // Message seller button
        const messageSellerBtn = card.querySelector('.message-seller-btn');
        messageSellerBtn?.addEventListener('click', () => {
            this.messageSeller(match.id);
        });

        // Not interested button
        const notInterestedBtn = card.querySelector('.not-interested-btn');
        notInterestedBtn?.addEventListener('click', () => {
            this.markNotInterested(match.id);
        });
    }

    toggleFavorite(matchId) {
        const index = this.favoriteMatches.indexOf(matchId);
        if (index > -1) {
            this.favoriteMatches.splice(index, 1);
        } else {
            this.favoriteMatches.push(matchId);
        }
        this.saveFavorites();
        this.renderMatches();
    }

    expressInterest(matchId) {
        if (!this.interestedMatches.includes(matchId)) {
            this.interestedMatches.push(matchId);
            this.saveInterested();
        }

        // Show success message
        this.showNotification('Interest expressed! The seller will be notified.', 'success');
        this.renderMatches();
    }

    viewDetails(matchId) {
        // In a real application, this would navigate to a detailed view
        window.location.href = `../marketplace/listing-details.html?id=${matchId}`;
    }

    messageSeller(matchId) {
        // In a real application, this would open a messaging interface
        this.showNotification('Opening message interface...', 'info');
        setTimeout(() => {
            window.location.href = `../dashboard/messages.html?new=${matchId}`;
        }, 1000);
    }

    markNotInterested(matchId) {
        // Remove from current view
        this.filteredMatches = this.filteredMatches.filter(match => match.id !== matchId);
        this.renderMatches();
        this.updateStatistics();
        this.showNotification('Match removed from your list.', 'info');
    }

    loadMore() {
        this.currentPage++;
        this.renderMatches();
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (!loadMoreBtn) return;

        const totalShown = this.currentPage * this.itemsPerPage;
        const hasMore = totalShown < this.filteredMatches.length;

        if (hasMore) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = `Load More Matches (${this.filteredMatches.length - totalShown} remaining)`;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    updateStatistics() {
        // Update total matches
        const totalMatchesEl = document.querySelector('[data-stat="total-matches"]');
        if (totalMatchesEl) {
            totalMatchesEl.textContent = this.filteredMatches.length;
        }

        // Update express sellers count
        const expressCount = this.filteredMatches.filter(match => match.isExpress).length;
        const expressSellersEl = document.querySelector('[data-stat="express-sellers"]');
        if (expressSellersEl) {
            expressSellersEl.textContent = expressCount;
        }

        // Update average match score
        const avgScore = this.filteredMatches.length > 0
            ? Math.round(this.filteredMatches.reduce((sum, match) => sum + match.matchScore, 0) / this.filteredMatches.length)
            : 0;
        const avgScoreEl = document.querySelector('[data-stat="avg-score"]');
        if (avgScoreEl) {
            avgScoreEl.textContent = `${avgScore}%`;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all transform translate-x-full`;

        switch(type) {
            case 'success':
                notification.className += ' bg-green-500 text-white';
                break;
            case 'error':
                notification.className += ' bg-red-500 text-white';
                break;
            default:
                notification.className += ' bg-blue-500 text-white';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }

    // Local storage methods
    loadPreferences() {
        const saved = localStorage.getItem('matchmaking-preferences');
        return saved ? JSON.parse(saved) : {};
    }

    savePreferences() {
        localStorage.setItem('matchmaking-preferences', JSON.stringify(this.userPreferences));
    }

    loadFavorites() {
        const saved = localStorage.getItem('favorite-matches');
        return saved ? JSON.parse(saved) : [];
    }

    saveFavorites() {
        localStorage.setItem('favorite-matches', JSON.stringify(this.favoriteMatches));
    }

    loadInterested() {
        const saved = localStorage.getItem('interested-matches');
        return saved ? JSON.parse(saved) : [];
    }

    saveInterested() {
        localStorage.setItem('interested-matches', JSON.stringify(this.interestedMatches));
    }

    showPreferencesModal() {
        // In a real application, this would show a modal for updating preferences
        this.showNotification('Preferences modal would open here', 'info');
    }
}

// Initialize the matchmaking system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MatchmakingSystem();
});