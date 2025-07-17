// Closing Documents Management System with Supabase Integration
class ClosingDocumentsManager {
    constructor() {
        this.deals = [];
        this.filteredDeals = [];
        this.activities = [];
        this.currentFilters = {
            search: '',
            status: '',
            priority: ''
        };
        this.supabaseService = null;
        this.subscriptions = [];
        this.isLoading = false;
        this.init();
    }

    async init() {
        try {
            this.showLoading(true);

            // Initialize Supabase service
            this.supabaseService = window.supabaseClosingDocs;
            await this.supabaseService.init();

            // Load real data from Supabase
            await this.loadDealsFromSupabase();
            await this.loadActivitiesFromSupabase();

            // Setup event listeners
            this.setupEventListeners();

            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();

            // Render initial data
            this.renderDeals();
            this.renderRecentActivity();
            this.updateStats();

            this.showLoading(false);
            console.log('✅ Closing Documents Manager initialized with Supabase');
        } catch (error) {
            console.error('❌ Failed to initialize Closing Documents Manager:', error);
            this.showLoading(false);
            // Fallback to sample data if Supabase fails
            this.loadSampleData();
            this.setupEventListeners();
            this.renderDeals();
            this.renderRecentActivity();
            this.updateStats();
        }
    }

    /**
     * Load deals from Supabase
     */
    async loadDealsFromSupabase() {
        try {
            const deals = await this.supabaseService.getDeals(this.currentFilters);

            // Transform Supabase data to match UI expectations
            this.deals = deals.map(deal => ({
                id: deal.id,
                dealNumber: deal.deal_number,
                businessName: deal.business_name,
                location: deal.location,
                purchasePrice: deal.purchase_price,
                status: deal.status,
                priority: deal.priority,
                progress: deal.progress || 0,
                daysToClosing: deal.days_to_closing || this.calculateDaysToClosing(deal.closing_date),
                buyer: deal.buyer ? `${deal.buyer.first_name} ${deal.buyer.last_name}` : 'Unknown',
                seller: deal.seller ? `${deal.seller.first_name} ${deal.seller.last_name}` : 'Unknown',
                assignedTo: deal.agent ? `${deal.agent.first_name} ${deal.agent.last_name}` : 'Unassigned',
                documents: deal.documents || { total: 0, completed: 0, pending: 0 },
                lastActivity: this.formatRelativeTime(deal.updated_at),
                nextMilestone: deal.next_milestone || 'TBD',
                createdAt: deal.created_at,
                updatedAt: deal.updated_at
            }));

            this.filteredDeals = [...this.deals];
            console.log(`✅ Loaded ${this.deals.length} deals from Supabase`);
        } catch (error) {
            console.error('❌ Error loading deals from Supabase:', error);
            // Fallback to sample data
            this.loadSampleData();
        }
    }

    /**
     * Load recent activities from Supabase
     */
    async loadActivitiesFromSupabase() {
        try {
            // Get activities for all deals (limit to recent)
            const allActivities = [];

            for (const deal of this.deals.slice(0, 5)) { // Limit to first 5 deals for performance
                try {
                    const activities = await this.supabaseService.getActivities(deal.id, 10);
                    allActivities.push(...activities);
                } catch (error) {
                    console.warn(`Failed to load activities for deal ${deal.id}:`, error);
                }
            }

            // Sort by creation time and take most recent
            this.activities = allActivities
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 10)
                .map(activity => ({
                    action: activity.title,
                    deal: activity.deal_id,
                    user: activity.user ? `${activity.user.first_name} ${activity.user.last_name}` : 'System',
                    time: this.formatRelativeTime(activity.created_at),
                    type: activity.activity_type,
                    description: activity.description
                }));

            console.log(`✅ Loaded ${this.activities.length} activities from Supabase`);
        } catch (error) {
            console.error('❌ Error loading activities from Supabase:', error);
            // Fallback to sample activities
            this.loadSampleActivities();
        }
    }

    /**
     * Calculate days to closing from closing date
     */
    calculateDaysToClosing(closingDate) {
        if (!closingDate) return null;

        const today = new Date();
        const closing = new Date(closingDate);
        const diffTime = closing - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    }

    /**
     * Format relative time (e.g., "2 hours ago")
     */
    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} minutes ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hours ago`;
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    /**
     * Setup real-time subscriptions
     */
    setupRealtimeSubscriptions() {
        try {
            // Subscribe to deals changes
            const dealsSubscription = this.supabaseService.subscribeToDeals((payload) => {
                console.log('Real-time deals update:', payload);
                this.handleDealsUpdate(payload);
            });

            if (dealsSubscription) {
                this.subscriptions.push(dealsSubscription);
            }

            console.log('✅ Real-time subscriptions setup complete');
        } catch (error) {
            console.error('❌ Error setting up real-time subscriptions:', error);
        }
    }

    /**
     * Handle real-time deals updates
     */
    handleDealsUpdate(payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        switch (eventType) {
            case 'INSERT':
                this.loadDealsFromSupabase(); // Reload all deals
                break;
            case 'UPDATE':
                this.loadDealsFromSupabase(); // Reload all deals
                break;
            case 'DELETE':
                this.deals = this.deals.filter(deal => deal.id !== oldRecord.id);
                this.applyFilters();
                break;
        }

        this.updateStats();
    }

    /**
     * Show/hide loading state
     */
    showLoading(show) {
        this.isLoading = show;
        const dealsList = document.getElementById('dealsList');

        if (show) {
            dealsList.innerHTML = `
                <div class="p-8 text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p class="text-slate-500 dark:text-slate-400">Loading deals...</p>
                </div>
            `;
        }
    }

    /**
     * Fallback sample data (kept for offline/error scenarios)
     */
    loadSampleData() {
        this.deals = [
            {
                id: 'SAMPLE-001',
                dealNumber: 'DEAL-001',
                businessName: 'Premier Auto Service',
                location: 'Dallas, TX',
                purchasePrice: 850000,
                status: 'in-progress',
                priority: 'high',
                progress: 75,
                daysToClosing: 12,
                buyer: 'John Smith',
                seller: 'Mike Johnson',
                documents: { total: 15, completed: 11, pending: 4 },
                lastActivity: '2 hours ago',
                nextMilestone: 'Final walkthrough',
                assignedTo: 'Sarah Wilson'
            }
        ];
        this.filteredDeals = [...this.deals];
    }

    /**
     * Fallback sample activities
     */
    loadSampleActivities() {
        this.activities = [
            {
                action: 'Document uploaded',
                deal: 'Premier Auto Service',
                user: 'Sarah Wilson',
                time: '2 hours ago',
                type: 'upload'
            }
        ];
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.applyFilters();
        });

        // Status filter
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.applyFilters();
        });

        // Priority filter
        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.currentFilters.priority = e.target.value;
            this.applyFilters();
        });

        // Button actions
        document.getElementById('newDealBtn').addEventListener('click', () => {
            this.showNewDealModal();
        });

        document.getElementById('bulkActionsBtn').addEventListener('click', () => {
            this.showBulkActionsModal();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });
    }

    async applyFilters() {
        if (this.supabaseService && this.supabaseService.isInitialized) {
            // Apply filters via Supabase query for better performance
            try {
                await this.loadDealsFromSupabase();
                this.renderDeals();
                return;
            } catch (error) {
                console.error('Error applying filters via Supabase:', error);
                // Fall back to client-side filtering
            }
        }

        // Client-side filtering (fallback)
        this.filteredDeals = this.deals.filter(deal => {
            const matchesSearch = !this.currentFilters.search ||
                deal.businessName.toLowerCase().includes(this.currentFilters.search.toLowerCase()) ||
                deal.buyer.toLowerCase().includes(this.currentFilters.search.toLowerCase()) ||
                deal.seller.toLowerCase().includes(this.currentFilters.search.toLowerCase()) ||
                (deal.dealNumber && deal.dealNumber.toLowerCase().includes(this.currentFilters.search.toLowerCase()));

            const matchesStatus = !this.currentFilters.status || deal.status === this.currentFilters.status;
            const matchesPriority = !this.currentFilters.priority || deal.priority === this.currentFilters.priority;

            return matchesSearch && matchesStatus && matchesPriority;
        });

        this.renderDeals();
    }

    renderDeals() {
        const dealsList = document.getElementById('dealsList');
        
        if (this.filteredDeals.length === 0) {
            dealsList.innerHTML = `
                <div class="p-8 text-center">
                    <svg class="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p class="text-slate-500 dark:text-slate-400">No deals found matching your criteria</p>
                </div>
            `;
            return;
        }

        dealsList.innerHTML = this.filteredDeals.map(deal => this.renderDealCard(deal)).join('');
    }

    renderDealCard(deal) {
        const statusColors = {
            'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            'pending-review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            'completed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            'on-hold': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        };

        const priorityColors = {
            'high': 'text-red-600 dark:text-red-400',
            'medium': 'text-yellow-600 dark:text-yellow-400',
            'low': 'text-green-600 dark:text-green-400'
        };

        return `
            <div class="document-card p-6 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer" onclick="closingDocsManager.viewDealDetails('${deal.id}')">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">${deal.businessName}</h3>
                            <span class="status-badge px-2 py-1 text-xs font-medium rounded-full ${statusColors[deal.status]}">
                                ${deal.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span class="text-xs font-medium ${priorityColors[deal.priority]}">
                                ${deal.priority.toUpperCase()} PRIORITY
                            </span>
                        </div>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mb-1">${deal.location} • Deal ID: ${deal.id}</p>
                        <p class="text-sm text-slate-600 dark:text-slate-400">Purchase Price: $${deal.purchasePrice.toLocaleString()}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-slate-900 dark:text-white">${deal.daysToClosing} days to closing</p>
                        <p class="text-xs text-slate-600 dark:text-slate-400">Assigned to ${deal.assignedTo}</p>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Document Progress</span>
                        <span class="text-sm text-slate-600 dark:text-slate-400">${deal.documents.completed}/${deal.documents.required} completed</span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div class="bg-primary h-2 rounded-full transition-all duration-300" style="width: ${deal.progress}%"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center space-x-4">
                        <span class="text-slate-600 dark:text-slate-400">Buyer: <span class="font-medium text-slate-900 dark:text-white">${deal.buyer}</span></span>
                        <span class="text-slate-600 dark:text-slate-400">Seller: <span class="font-medium text-slate-900 dark:text-white">${deal.seller}</span></span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-slate-500 dark:text-slate-400">Next: ${deal.nextMilestone}</span>
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    }

    renderRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');

        if (!this.activities || this.activities.length === 0) {
            activityContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
                </div>
            `;
            return;
        }

        activityContainer.innerHTML = this.activities.map(activity => `
            <div class="timeline-item flex items-start space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${this.getActivityIcon(activity.type)}
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${activity.action}</p>
                    <p class="text-sm text-slate-600 dark:text-slate-400">${activity.deal} • ${activity.user}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">${activity.time}</p>
                    ${activity.description ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${activity.description}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            upload: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>',
            review: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
            status: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>',
            create: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>'
        };
        return icons[type] || icons.create;
    }

    updateStats() {
        const stats = {
            active: this.deals.filter(d => d.status === 'in-progress').length,
            completed: this.deals.filter(d => d.status === 'completed').length,
            pending: this.deals.filter(d => d.status === 'pending-review').length,
            issues: this.deals.filter(d => d.status === 'on-hold' || d.priority === 'high').length
        };

        document.getElementById('activeDealsCount').textContent = stats.active;
        document.getElementById('completedDealsCount').textContent = stats.completed;
        document.getElementById('pendingReviewCount').textContent = stats.pending;
        document.getElementById('issuesCount').textContent = stats.issues;
    }

    viewDealDetails(dealId) {
        const deal = this.deals.find(d => d.id === dealId);
        if (deal) {
            // Navigate to deal details page
            window.location.href = `deal-details.html?id=${dealId}`;
        }
    }

    showNewDealModal() {
        // TODO: Implement new deal creation modal with Supabase integration
        alert('New Deal Modal - This would open a modal to create a new deal');
    }

    showBulkActionsModal() {
        // TODO: Implement bulk actions modal
        alert('Bulk Actions Modal - This would open a modal for bulk operations');
    }

    async exportData() {
        try {
            // TODO: Implement data export functionality
            alert('Export functionality - This would export the current data to CSV/PDF');
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error exporting data. Please try again.');
        }
    }

    async refreshData() {
        const refreshBtn = document.getElementById('refreshBtn');
        const originalHTML = refreshBtn.innerHTML;

        refreshBtn.innerHTML = `
            <svg class="w-5 h-5 inline mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refreshing...
        `;

        try {
            if (this.supabaseService && this.supabaseService.isInitialized) {
                await this.loadDealsFromSupabase();
                await this.loadActivitiesFromSupabase();
            } else {
                // Fallback refresh
                this.loadSampleData();
                this.loadSampleActivities();
            }

            this.renderDeals();
            this.renderRecentActivity();
            this.updateStats();

            console.log('✅ Data refreshed successfully');
        } catch (error) {
            console.error('❌ Error refreshing data:', error);
        } finally {
            setTimeout(() => {
                refreshBtn.innerHTML = originalHTML;
            }, 1000);
        }
    }

    /**
     * Cleanup when page is unloaded
     */
    destroy() {
        if (this.supabaseService) {
            this.supabaseService.unsubscribeAll();
        }

        // Clean up subscriptions
        this.subscriptions.forEach(subscription => {
            if (subscription && subscription.unsubscribe) {
                subscription.unsubscribe();
            }
        });

        console.log('🧹 Closing Documents Manager cleaned up');
    }
}

// Initialize the closing documents manager when the page loads
let closingDocsManager;
document.addEventListener('DOMContentLoaded', function() {
    closingDocsManager = new ClosingDocumentsManager();
});
