/**
 * Marketplace Listings Interactive Functionality
 * Handles filtering, sorting, search, and listing display for the marketplace
 */

class MarketplaceListings {
    constructor() {
        this.listings = [];
        this.filteredListings = [];
        this.currentFilters = {
            search: '',
            businessTypes: [],
            priceMin: null,
            priceMax: null,
            location: 'All DFW Area',
            revenue: null,
            expressOnly: false
        };
        this.currentSort = 'newest';
        this.currentView = 'grid';
        this.currentPage = 1;
        this.itemsPerPage = 9;
        
        this.init();
    }

    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.renderListings();
        this.updateResultsCount();
    }

    loadSampleData() {
        // Sample DFW auto repair shop data
        this.listings = [
            {
                id: 1,
                name: "Premier Auto Service Center",
                type: "Full Service Auto Repair",
                location: "Plano, TX",
                askingPrice: 850000,
                cashFlow: 285000,
                revenue: 1200000,
                description: "Established full-service auto repair shop with loyal customer base and modern equipment.",
                image: "https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["express-seller"],
                dateAdded: new Date('2024-01-15'),
                featured: true
            },
            {
                id: 2,
                name: "Elite Transmission Specialists",
                type: "Transmission Specialist",
                location: "Arlington, TX",
                askingPrice: 650000,
                cashFlow: 195000,
                revenue: 850000,
                description: "Specialized transmission repair shop with 25+ years in business and excellent reputation.",
                image: "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["hot-deal"],
                dateAdded: new Date('2024-01-10'),
                featured: true
            },
            {
                id: 3,
                name: "Dallas Auto Body Works",
                type: "Auto Body Shop",
                location: "Dallas, TX",
                askingPrice: 750000,
                cashFlow: 225000,
                revenue: 980000,
                description: "High-volume auto body shop with insurance contracts and state-of-the-art paint booth.",
                image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["verified"],
                dateAdded: new Date('2024-01-08'),
                featured: false
            },
            {
                id: 4,
                name: "Quick Lube Express",
                type: "Quick Lube",
                location: "Irving, TX",
                askingPrice: 425000,
                cashFlow: 145000,
                revenue: 650000,
                description: "Busy quick lube location with drive-through service and high customer volume.",
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["express-seller"],
                dateAdded: new Date('2024-01-05'),
                featured: false
            },
            {
                id: 5,
                name: "Fort Worth Tire Center",
                type: "Tire Shop",
                location: "Fort Worth, TX",
                askingPrice: 580000,
                cashFlow: 175000,
                revenue: 720000,
                description: "Full-service tire shop with alignment services and commercial accounts.",
                image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["financing-approved"],
                dateAdded: new Date('2024-01-03'),
                featured: false
            },
            {
                id: 6,
                name: "Garland Complete Auto Care",
                type: "Full Service Auto Repair",
                location: "Garland, TX",
                askingPrice: 920000,
                cashFlow: 310000,
                revenue: 1350000,
                description: "Large facility with multiple bays, towing service, and fleet maintenance contracts.",
                image: "https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["express-seller", "verified"],
                dateAdded: new Date('2024-01-01'),
                featured: true
            },
            {
                id: 7,
                name: "Mesquite Auto Specialists",
                type: "Full Service Auto Repair",
                location: "Mesquite, TX",
                askingPrice: 675000,
                cashFlow: 205000,
                revenue: 890000,
                description: "Family-owned shop with loyal customer base and excellent reputation in the community.",
                image: "https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["verified"],
                dateAdded: new Date('2023-12-28'),
                featured: false
            },
            {
                id: 8,
                name: "DFW Transmission Pro",
                type: "Transmission Specialist",
                location: "Dallas, TX",
                askingPrice: 485000,
                cashFlow: 155000,
                revenue: 620000,
                description: "Specialized transmission shop with modern diagnostic equipment and warranty programs.",
                image: "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["express-seller"],
                dateAdded: new Date('2023-12-25'),
                featured: false
            },
            {
                id: 9,
                name: "Irving Body & Paint",
                type: "Auto Body Shop",
                location: "Irving, TX",
                askingPrice: 825000,
                cashFlow: 265000,
                revenue: 1150000,
                description: "High-end collision repair facility with insurance partnerships and luxury car specialization.",
                image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["hot-deal", "verified"],
                dateAdded: new Date('2023-12-20'),
                featured: true
            },
            {
                id: 10,
                name: "Express Oil Change Plus",
                type: "Quick Lube",
                location: "Plano, TX",
                askingPrice: 395000,
                cashFlow: 125000,
                revenue: 580000,
                description: "High-traffic location with additional services like tire rotation and basic maintenance.",
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["financing-approved"],
                dateAdded: new Date('2023-12-18'),
                featured: false
            },
            {
                id: 11,
                name: "Arlington Tire & Service",
                type: "Tire Shop",
                location: "Arlington, TX",
                askingPrice: 640000,
                cashFlow: 195000,
                revenue: 785000,
                description: "Full-service tire center with wheel alignment, balancing, and commercial fleet services.",
                image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["express-seller"],
                dateAdded: new Date('2023-12-15'),
                featured: false
            },
            {
                id: 12,
                name: "Dallas Premium Auto Body",
                type: "Auto Body Shop",
                location: "Dallas, TX",
                askingPrice: 1250000,
                cashFlow: 385000,
                revenue: 1850000,
                description: "Premium collision center with state-of-the-art equipment and luxury vehicle specialization.",
                image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200&q=80",
                badges: ["hot-deal", "financing-approved"],
                dateAdded: new Date('2023-12-12'),
                featured: true
            }
        ];

        this.filteredListings = [...this.listings];
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.querySelector('input[placeholder="Search businesses..."]');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            }, 300));
        }

        // Business type checkboxes
        const businessTypeCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        businessTypeCheckboxes.forEach(checkbox => {
            const label = checkbox.nextElementSibling;
            if (label && !label.textContent.includes('Express Sellers')) {
                checkbox.addEventListener('change', (e) => {
                    const businessType = label.textContent.trim();
                    if (e.target.checked) {
                        this.currentFilters.businessTypes.push(businessType);
                    } else {
                        this.currentFilters.businessTypes = this.currentFilters.businessTypes.filter(type => type !== businessType);
                    }
                    this.applyFilters();
                });
            }
        });

        // Express sellers only checkbox
        const expressSpans = document.querySelectorAll('input[type="checkbox"] + span');
        expressSpans.forEach(span => {
            if (span.textContent.includes('Express Sellers')) {
                const checkbox = span.previousElementSibling;
                checkbox.addEventListener('change', (e) => {
                    this.currentFilters.expressOnly = e.target.checked;
                    this.applyFilters();
                });
            }
        });

        // Price range inputs
        const priceInputs = document.querySelectorAll('input[type="number"]');
        if (priceInputs.length >= 2) {
            priceInputs[0].addEventListener('input', this.debounce((e) => {
                this.currentFilters.priceMin = e.target.value ? parseInt(e.target.value) : null;
                this.applyFilters();
            }, 500));

            priceInputs[1].addEventListener('input', this.debounce((e) => {
                this.currentFilters.priceMax = e.target.value ? parseInt(e.target.value) : null;
                this.applyFilters();
            }, 500));
        }

        // Location dropdown
        const locationSelect = document.getElementById('location-filter');
        if (locationSelect) {
            locationSelect.addEventListener('change', (e) => {
                this.currentFilters.location = e.target.value;
                this.applyFilters();
            });
        }

        // Revenue radio buttons
        const revenueRadios = document.querySelectorAll('input[name="revenue"]');
        revenueRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.currentFilters.revenue = e.target.nextElementSibling.textContent.trim();
                    this.applyFilters();
                }
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = this.getSortKey(e.target.value);
                this.applySorting();
                this.renderListings();
            });
        }

        // View toggle buttons
        const gridViewBtn = document.querySelector('button[aria-label="Grid view"]');
        const listViewBtn = document.querySelector('button[aria-label="List view"]');
        
        if (gridViewBtn && listViewBtn) {
            gridViewBtn.addEventListener('click', () => this.setView('grid', gridViewBtn, listViewBtn));
            listViewBtn.addEventListener('click', () => this.setView('list', listViewBtn, gridViewBtn));
        }

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    applyFilters() {
        this.filteredListings = this.listings.filter(listing => {
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchableText = `${listing.name} ${listing.description} ${listing.location} ${listing.type}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Business type filter
            if (this.currentFilters.businessTypes.length > 0) {
                if (!this.currentFilters.businessTypes.includes(listing.type)) {
                    return false;
                }
            }

            // Price range filter
            if (this.currentFilters.priceMin && listing.askingPrice < this.currentFilters.priceMin) {
                return false;
            }
            if (this.currentFilters.priceMax && listing.askingPrice > this.currentFilters.priceMax) {
                return false;
            }

            // Location filter
            if (this.currentFilters.location !== 'All DFW Area') {
                if (!listing.location.includes(this.currentFilters.location)) {
                    return false;
                }
            }

            // Revenue filter
            if (this.currentFilters.revenue) {
                const revenueRange = this.parseRevenueRange(this.currentFilters.revenue);
                if (!this.isInRevenueRange(listing.revenue, revenueRange)) {
                    return false;
                }
            }

            // Express sellers only filter
            if (this.currentFilters.expressOnly) {
                if (!listing.badges.includes('express-seller')) {
                    return false;
                }
            }

            return true;
        });

        this.applySorting();
        this.currentPage = 1; // Reset to first page
        this.renderListings();
        this.updateResultsCount();
    }

    parseRevenueRange(revenueText) {
        const ranges = {
            '$300K - $500K': { min: 300000, max: 500000 },
            '$500K - $1M': { min: 500000, max: 1000000 },
            '$1M - $2M': { min: 1000000, max: 2000000 },
            '$2M+': { min: 2000000, max: Infinity }
        };
        return ranges[revenueText] || null;
    }

    isInRevenueRange(revenue, range) {
        if (!range) return true;
        return revenue >= range.min && revenue <= range.max;
    }

    getSortKey(sortText) {
        const sortMap = {
            'Sort by: Newest': 'newest',
            'Price: Low to High': 'price-asc',
            'Price: High to Low': 'price-desc',
            'Revenue: High to Low': 'revenue-desc',
            'Location': 'location'
        };
        return sortMap[sortText] || 'newest';
    }

    applySorting() {
        this.filteredListings.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return b.dateAdded - a.dateAdded;
                case 'price-asc':
                    return a.askingPrice - b.askingPrice;
                case 'price-desc':
                    return b.askingPrice - a.askingPrice;
                case 'revenue-desc':
                    return b.revenue - a.revenue;
                case 'location':
                    return a.location.localeCompare(b.location);
                default:
                    return 0;
            }
        });
    }

    setView(viewType, activeBtn, inactiveBtn) {
        this.currentView = viewType;

        // Update button styles
        activeBtn.classList.add('bg-primary', 'text-white');
        activeBtn.classList.remove('bg-white', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300');

        inactiveBtn.classList.remove('bg-primary', 'text-white');
        inactiveBtn.classList.add('bg-white', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300');

        this.renderListings();
    }

    clearAllFilters() {
        // Reset all filters
        this.currentFilters = {
            search: '',
            businessTypes: [],
            priceMin: null,
            priceMax: null,
            location: 'All DFW Area',
            revenue: null,
            expressOnly: false
        };

        // Reset form elements
        const searchInput = document.querySelector('input[placeholder="Search businesses..."]');
        if (searchInput) searchInput.value = '';

        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);

        const priceInputs = document.querySelectorAll('input[type="number"]');
        priceInputs.forEach(input => input.value = '');

        const locationSelect = document.getElementById('location-filter');
        if (locationSelect) locationSelect.value = 'All DFW Area';

        const revenueRadios = document.querySelectorAll('input[name="revenue"]');
        revenueRadios.forEach(radio => radio.checked = false);

        // Reapply filters (which will show all listings)
        this.applyFilters();
    }

    renderListings() {
        const container = document.querySelector('.grid');
        if (!container) return;

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedListings = this.filteredListings.slice(startIndex, endIndex);

        // Update grid classes based on view
        if (this.currentView === 'list') {
            container.className = 'grid grid-cols-1 gap-6';
        } else {
            container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
        }

        // Render listings
        container.innerHTML = paginatedListings.map(listing => this.renderListingCard(listing)).join('');

        // Setup card event listeners
        this.setupCardEventListeners();

        // Update pagination
        this.renderPagination();
    }

    renderListingCard(listing) {
        const badgeHtml = this.renderBadges(listing.badges);
        const priceFormatted = this.formatCurrency(listing.askingPrice);
        const cashFlowFormatted = this.formatCurrency(listing.cashFlow);
        const revenueFormatted = this.formatCurrency(listing.revenue);

        return `
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow" data-listing-id="${listing.id}">
                <div class="relative">
                    <img src="${listing.image}" alt="${listing.name}" class="w-full h-48 object-cover">
                    ${badgeHtml}
                    <button type="button" aria-label="Add to favorites" title="Add to favorites" class="favorite-btn absolute top-3 left-3 p-2 bg-white/80 rounded-full hover:bg-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
                <div class="p-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="bg-primary-light/20 text-primary-dark text-xs font-medium px-2 py-1 rounded">${listing.type}</span>
                        <div class="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            ${listing.location}
                        </div>
                    </div>
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">${listing.name}</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">${listing.description}</p>
                    <div class="space-y-1 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500 dark:text-slate-400">Asking Price:</span>
                            <span class="font-semibold text-slate-900 dark:text-white">${priceFormatted}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500 dark:text-slate-400">Cash Flow:</span>
                            <span class="font-semibold text-slate-900 dark:text-white">${cashFlowFormatted}/year</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500 dark:text-slate-400">Revenue:</span>
                            <span class="font-semibold text-slate-900 dark:text-white">${revenueFormatted}/year</span>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="view-details-btn flex-1 bg-primary-dark hover:bg-primary text-white text-sm font-medium py-2 px-3 rounded-md transition-all">
                            View Details
                        </button>
                        <button class="contact-btn bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium py-2 px-3 rounded-md transition-all">
                            Contact
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderBadges(badges) {
        if (!badges || badges.length === 0) return '';

        const badgeMap = {
            'express-seller': { text: '🚖 Express Seller', class: 'bg-accent text-white' },
            'hot-deal': { text: '🔥 Hot Deal', class: 'bg-orange-500 text-white' },
            'verified': { text: '✅ Verified', class: 'bg-green-500 text-white' },
            'financing-approved': { text: '🏅 Financing Approved', class: 'bg-blue-500 text-white' }
        };

        const primaryBadge = badges[0];
        const badgeConfig = badgeMap[primaryBadge];

        if (!badgeConfig) return '';

        return `
            <div class="absolute top-3 right-3 ${badgeConfig.class} text-xs font-bold px-2 py-1 rounded flex items-center">
                ${badgeConfig.text}
            </div>
        `;
    }

    formatCurrency(amount) {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${amount.toLocaleString()}`;
    }

    setupCardEventListeners() {
        // Favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(btn);
            });
        });

        // View details buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('[data-listing-id]');
                const listingId = parseInt(card.dataset.listingId);
                this.viewDetails(listingId);
            });
        });

        // Contact buttons
        document.querySelectorAll('.contact-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('[data-listing-id]');
                const listingId = parseInt(card.dataset.listingId);
                this.contactSeller(listingId);
            });
        });
    }

    toggleFavorite(btn) {
        const svg = btn.querySelector('svg');
        const path = svg.querySelector('path');

        if (path.getAttribute('fill') === 'currentColor') {
            // Remove from favorites
            path.setAttribute('fill', 'none');
            btn.classList.remove('text-red-500');
            btn.classList.add('text-slate-600');
            if (window.ArdonieCapital && window.ArdonieCapital.showToast) {
                window.ArdonieCapital.showToast('Removed from favorites', 'info');
            }
        } else {
            // Add to favorites
            path.setAttribute('fill', 'currentColor');
            btn.classList.add('text-red-500');
            btn.classList.remove('text-slate-600');
            if (window.ArdonieCapital && window.ArdonieCapital.showToast) {
                window.ArdonieCapital.showToast('Added to favorites', 'success');
            }
        }
    }

    viewDetails(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (!listing) return;

        // For now, show a modal with details (in a real app, this would navigate to a detail page)
        if (window.ArdonieCapital && window.ArdonieCapital.showToast) {
            window.ArdonieCapital.showToast(`Viewing details for ${listing.name}`, 'info');
        }

        // TODO: Implement detailed view modal or navigation
        console.log('View details for listing:', listing);
    }

    contactSeller(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (!listing) return;

        // For now, show a contact modal (in a real app, this would open a contact form)
        if (window.ArdonieCapital && window.ArdonieCapital.showToast) {
            window.ArdonieCapital.showToast(`Opening contact form for ${listing.name}`, 'info');
        }

        // TODO: Implement contact modal or form
        console.log('Contact seller for listing:', listing);
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredListings.length / this.itemsPerPage);
        const paginationContainer = document.querySelector('nav.flex.items-center.space-x-2');

        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';

        let paginationHtml = '';

        // Previous button
        paginationHtml += `
            <button class="pagination-btn px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ${this.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                    data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'disabled' : ''}>
                Previous
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHtml += `
                    <button class="px-3 py-2 text-sm bg-primary text-white rounded-md">${i}</button>
                `;
            } else {
                paginationHtml += `
                    <button class="pagination-btn px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" data-page="${i}">
                        ${i}
                    </button>
                `;
            }
        }

        // Next button
        paginationHtml += `
            <button class="pagination-btn px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ${this.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                    data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'disabled' : ''}>
                Next
            </button>
        `;

        paginationContainer.innerHTML = paginationHtml;

        // Setup pagination event listeners
        document.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.disabled) return;
                const page = parseInt(e.target.dataset.page);
                if (page >= 1 && page <= totalPages) {
                    this.currentPage = page;
                    this.renderListings();
                }
            });
        });
    }

    updateResultsCount() {
        const countElement = document.querySelector('p.text-slate-600');
        if (countElement) {
            const total = this.listings.length;
            const filtered = this.filteredListings.length;
            const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
            const endIndex = Math.min(startIndex + this.itemsPerPage - 1, filtered);

            if (filtered === 0) {
                countElement.textContent = 'No businesses found matching your criteria';
            } else if (filtered === total) {
                countElement.textContent = `Showing ${startIndex}-${endIndex} of ${total} auto repair shops`;
            } else {
                countElement.textContent = `Showing ${startIndex}-${endIndex} of ${filtered} filtered results (${total} total)`;
            }
        }
    }
}

// Initialize marketplace when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.marketplaceListings = new MarketplaceListings();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketplaceListings;
}
