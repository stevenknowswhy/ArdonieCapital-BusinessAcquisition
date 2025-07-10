/**
 * Dashboard Events Module
 * Event listeners and user interaction handlers
 * @author Ardonie Capital Development Team
 */

console.log('🎯 Loading Dashboard Events Module...');

/**
 * Dashboard event handling functions
 * Manages all user interactions and event listeners
 */
const DashboardEvents = {
    /**
     * Setup all event listeners for the dashboard
     * Initializes navigation, mobile menu, and section-specific events
     */
    setupEventListeners() {
        console.log('🔄 Setting up dashboard event listeners...');
        
        // Setup navigation events
        this.setupNavigationEvents();
        
        // Setup mobile menu events
        this.setupMobileMenuEvents();
        
        // Setup section-specific events
        this.setupActiveDealsEventListeners();
        this.setupMessagesEventListeners();
        
        // Setup global events
        this.setupGlobalEvents();
        
        console.log('✅ Dashboard event listeners setup complete');
    },

    /**
     * Setup navigation event listeners
     * Handles sidebar navigation and section switching
     */
    setupNavigationEvents() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.dashboard-nav-item');
            if (navItem) {
                e.preventDefault();
                
                const section = navItem.getAttribute('data-section') || 
                               navItem.getAttribute('href')?.substring(1);
                
                if (section) {
                    this.showSection(section);
                }
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                const keyMap = {
                    '1': 'overview',
                    '2': 'active-deals',
                    '3': 'express-listings',
                    '4': 'saved-listings',
                    '5': 'messages',
                    '6': 'profile',
                    '7': 'settings'
                };
                
                if (keyMap[e.key]) {
                    e.preventDefault();
                    this.showSection(keyMap[e.key]);
                }
            }
        });

        console.log('✅ Navigation events setup complete');
    },

    /**
     * Setup mobile menu event listeners
     * Handles mobile sidebar toggle and responsive behavior
     */
    setupMobileMenuEvents() {
        const mobileMenuToggle = document.getElementById('mobile-sidebar-toggle');
        const sidebar = document.getElementById('dashboard-sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (mobileMenuToggle && sidebar) {
            mobileMenuToggle.addEventListener('click', () => {
                const isOpen = sidebar.classList.contains('mobile-open');
                
                if (isOpen) {
                    this.closeMobileSidebar();
                } else {
                    this.openMobileSidebar();
                }
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 1024) {
                const isClickInsideSidebar = sidebar && sidebar.contains(e.target);
                const isClickOnToggle = mobileMenuToggle && mobileMenuToggle.contains(e.target);

                if (!isClickInsideSidebar && !isClickOnToggle && sidebar && sidebar.classList.contains('mobile-open')) {
                    this.closeMobileSidebar();
                }
            }
        });

        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileSidebar();
            }
        });

        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth >= 1024) {
                this.closeMobileSidebar();
                this.updateFooterLayout(false); // Reset footer for desktop
            } else {
                const isOpen = sidebar && sidebar.classList.contains('mobile-open');
                this.updateFooterLayout(isOpen);
            }
        }, 250));

        // Initialize footer layout on page load
        setTimeout(() => {
            this.updateFooterLayout(false);
        }, 100);

        console.log('✅ Mobile menu events setup complete');
    },

    /**
     * Open mobile sidebar
     */
    openMobileSidebar() {
        const sidebar = document.getElementById('dashboard-sidebar');
        const toggle = document.getElementById('mobile-sidebar-toggle');

        if (sidebar) {
            sidebar.classList.add('mobile-open');
        }

        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
            this.animateHamburgerToX(toggle);
        }

        // Update footer layout for mobile sidebar
        this.updateFooterLayout(true);

        // Prevent body scroll on mobile
        if (window.innerWidth < 1024) {
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Close mobile sidebar
     */
    closeMobileSidebar() {
        const sidebar = document.getElementById('dashboard-sidebar');
        const toggle = document.getElementById('mobile-sidebar-toggle');

        if (sidebar) {
            sidebar.classList.remove('mobile-open');
        }

        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            this.animateHamburgerFromX(toggle);
        }

        // Update footer layout for mobile sidebar
        this.updateFooterLayout(false);

        // Restore body scroll
        document.body.style.overflow = '';
    },

    /**
     * Update footer layout based on sidebar state
     * @param {boolean} sidebarOpen - Whether the sidebar is open
     */
    updateFooterLayout(sidebarOpen) {
        const footer = document.getElementById('footer-container');
        if (!footer) return;

        if (window.innerWidth >= 1024) {
            // Desktop: Footer always accounts for sidebar
            footer.style.marginLeft = '16rem'; // 256px sidebar width
            footer.style.transition = 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        } else {
            // Mobile: Footer adjusts based on sidebar state
            if (sidebarOpen) {
                footer.style.marginLeft = '16rem';
                footer.style.transition = 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            } else {
                footer.style.marginLeft = '0';
                footer.style.transition = 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        }
    },

    /**
     * Animate hamburger menu to X shape
     * @param {Element} toggle - The toggle button element
     */
    animateHamburgerToX(toggle) {
        const lines = toggle.querySelectorAll('.hamburger-line');
        if (lines.length >= 3) {
            lines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        }
    },

    /**
     * Animate hamburger menu from X shape back to hamburger
     * @param {Element} toggle - The toggle button element
     */
    animateHamburgerFromX(toggle) {
        const lines = toggle.querySelectorAll('.hamburger-line');
        if (lines.length >= 3) {
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';
        }
    },

    /**
     * Setup Active Deals event listeners
     * Handles deal card interactions, filtering, and detail views
     */
    setupActiveDealsEventListeners() {
        // Deal card click handlers
        document.addEventListener('click', (e) => {
            const dealCard = e.target.closest('.deal-card');
            if (dealCard) {
                const dealId = dealCard.getAttribute('data-deal-id');
                if (dealId && typeof this.showDealDetail === 'function') {
                    this.showDealDetail(dealId);
                }
            }
        });

        // Search functionality
        const searchInput = document.getElementById('deals-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                if (typeof this.filterDeals === 'function') {
                    this.filterDeals();
                }
            }, 300));
        }

        // Filter functionality
        const statusFilter = document.getElementById('status-filter');
        const valueFilter = document.getElementById('value-filter');
        const clearFilters = document.getElementById('clear-filters');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                if (typeof this.filterDeals === 'function') {
                    this.filterDeals();
                }
            });
        }

        if (valueFilter) {
            valueFilter.addEventListener('change', () => {
                if (typeof this.filterDeals === 'function') {
                    this.filterDeals();
                }
            });
        }

        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (statusFilter) statusFilter.value = '';
                if (valueFilter) valueFilter.value = '';
                if (typeof this.filterDeals === 'function') {
                    this.filterDeals();
                }
            });
        }

        console.log('✅ Active deals event listeners setup complete');
    },

    /**
     * Setup Messages event listeners
     * Handles messaging interface interactions
     */
    setupMessagesEventListeners() {
        // Compose message modal
        const composeBtn = document.getElementById('compose-message-btn');
        const composeModal = document.getElementById('compose-modal');
        const closeModalBtn = document.getElementById('close-compose-modal');
        const cancelBtn = document.getElementById('cancel-compose');

        if (composeBtn && composeModal) {
            composeBtn.addEventListener('click', () => {
                composeModal.classList.remove('hidden');
            });
        }

        if (closeModalBtn && composeModal) {
            closeModalBtn.addEventListener('click', () => {
                composeModal.classList.add('hidden');
            });
        }

        if (cancelBtn && composeModal) {
            cancelBtn.addEventListener('click', () => {
                composeModal.classList.add('hidden');
            });
        }

        // Compose form submission
        const composeForm = document.getElementById('compose-form');
        if (composeForm) {
            composeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (typeof this.sendNewMessage === 'function') {
                    this.sendNewMessage();
                }
            });
        }

        // Message input auto-resize and send
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                this.autoResizeTextarea(messageInput);
                this.toggleSendButton();
            });

            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (typeof this.sendMessage === 'function') {
                        this.sendMessage();
                    }
                }
            });
        }

        // Send message button
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                if (typeof this.sendMessage === 'function') {
                    this.sendMessage();
                }
            });
        }

        // File attachment
        const attachBtn = document.getElementById('attach-file-btn');
        const fileInput = document.getElementById('file-input');
        
        if (attachBtn && fileInput) {
            attachBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                if (typeof this.handleFileAttachment === 'function') {
                    this.handleFileAttachment(e.target.files);
                }
            });
        }

        // Search and filter functionality
        const messagesSearch = document.getElementById('messages-search');
        if (messagesSearch) {
            messagesSearch.addEventListener('input', this.debounce(() => {
                if (typeof this.filterConversations === 'function') {
                    this.filterConversations();
                }
            }, 300));
        }

        const messageFilter = document.getElementById('message-filter');
        if (messageFilter) {
            messageFilter.addEventListener('change', () => {
                if (typeof this.filterConversations === 'function') {
                    this.filterConversations();
                }
            });
        }

        console.log('✅ Messages event listeners setup complete');
    },

    /**
     * Setup global event listeners
     * Handles document-wide events and shortcuts
     */
    setupGlobalEvents() {
        // Handle clicks outside modals to close them
        document.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal, [id$="-modal"]');
            modals.forEach(modal => {
                if (modal.classList.contains('hidden')) return;
                
                if (!modal.contains(e.target) && !e.target.closest('[data-modal-trigger]')) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Handle global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });

        console.log('✅ Global event listeners setup complete');
    },

    /**
     * Toggle send button state based on message input
     */
    toggleSendButton() {
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-message-btn');
        
        if (messageInput && sendBtn) {
            const hasContent = messageInput.value.trim().length > 0;
            sendBtn.disabled = !hasContent;
        }
    }
};

// Extend BuyerDashboard prototype with event methods
console.log('🔄 Attempting to extend BuyerDashboard with events methods...');
console.log('🔍 window.BuyerDashboard available:', !!window.BuyerDashboard);
console.log('🔍 DashboardEvents object keys:', Object.keys(DashboardEvents));

if (typeof window !== 'undefined' && window.BuyerDashboard) {
    try {
        Object.assign(window.BuyerDashboard.prototype, DashboardEvents);
        console.log('✅ Dashboard Events methods added to BuyerDashboard prototype');

        // Verify methods were added
        const testInstance = new window.BuyerDashboard();
        const addedMethods = Object.keys(DashboardEvents).filter(key =>
            typeof testInstance[key] === 'function'
        );
        console.log('✅ Verified events methods added:', addedMethods);
    } catch (error) {
        console.error('❌ Failed to extend BuyerDashboard prototype with events:', error);
    }
} else {
    console.warn('⚠️ BuyerDashboard not available, events methods not added');
}

// Update loading status
if (window.dashboardLoadingStatus) {
    window.dashboardLoadingStatus.modulesLoaded.events = true;
}

console.log('✅ Dashboard Events Module loaded');

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardEvents };
}
