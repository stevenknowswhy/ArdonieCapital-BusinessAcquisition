/**
 * Deal Dashboard Component
 * Displays comprehensive deal overview with timeline, documents, and progress tracking
 * Provides real-time updates and interactive deal management interface
 */

class DealDashboard {
    constructor(containerId, dealId) {
        this.containerId = containerId;
        this.dealId = dealId;
        this.deal = null;
        this.timeline = null;
        this.documents = null;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Container with ID ${this.containerId} not found`);
            return;
        }

        await this.loadDealData();
        this.render();
        this.attachEventListeners();
    }

    async loadDealData() {
        this.isLoading = true;
        this.renderLoading();

        try {
            // Import services dynamically
            const { dealManagementService, timelineTrackingService, documentManagementService } = 
                await import('../index.js');

            // Load deal data in parallel
            const [dealResult, timelineResult, documentsResult] = await Promise.all([
                dealManagementService.getDealById(this.dealId),
                timelineTrackingService.getDealTimeline(this.dealId),
                documentManagementService.getDealDocumentsByType(this.dealId)
            ]);

            if (dealResult.success) {
                this.deal = dealResult.data;
            }

            if (timelineResult.success) {
                this.timeline = timelineResult.data;
            }

            if (documentsResult.success) {
                this.documents = documentsResult.data;
            }
        } catch (error) {
            console.error('Error loading deal data:', error);
            this.renderError('Failed to load deal data');
            return;
        }

        this.isLoading = false;
    }

    render() {
        if (this.isLoading) {
            this.renderLoading();
            return;
        }

        if (!this.deal) {
            this.renderError('Deal not found');
            return;
        }

        this.container.innerHTML = `
            <div class="deal-dashboard bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <!-- Deal Header -->
                <div class="deal-header p-6 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex justify-between items-start">
                        <div>
                            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
                                ${this.deal.deal_number || 'Deal Dashboard'}
                            </h1>
                            <p class="text-slate-600 dark:text-slate-400 mt-1">
                                ${this.deal.listing?.title || 'Business Acquisition'}
                            </p>
                        </div>
                        <div class="flex items-center space-x-4">
                            ${this.renderStatusBadge()}
                            ${this.renderPriorityBadge()}
                        </div>
                    </div>
                    
                    <!-- Deal Metrics -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        ${this.renderDealMetrics()}
                    </div>
                </div>

                <!-- Main Content -->
                <div class="deal-content p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Timeline Column -->
                        <div class="lg:col-span-2">
                            ${this.renderTimeline()}
                        </div>
                        
                        <!-- Sidebar -->
                        <div class="space-y-6">
                            ${this.renderDealInfo()}
                            ${this.renderDocuments()}
                            ${this.renderParticipants()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStatusBadge() {
        const statusColors = {
            'initial_interest': 'bg-blue-100 text-blue-800',
            'nda_signed': 'bg-indigo-100 text-indigo-800',
            'due_diligence': 'bg-yellow-100 text-yellow-800',
            'negotiation': 'bg-orange-100 text-orange-800',
            'financing': 'bg-purple-100 text-purple-800',
            'legal_review': 'bg-pink-100 text-pink-800',
            'closing': 'bg-green-100 text-green-800',
            'completed': 'bg-emerald-100 text-emerald-800',
            'cancelled': 'bg-red-100 text-red-800',
            'expired': 'bg-gray-100 text-gray-800'
        };

        const colorClass = statusColors[this.deal.status] || 'bg-gray-100 text-gray-800';
        const statusText = this.deal.status.replace('_', ' ').toUpperCase();

        return `
            <span class="px-3 py-1 rounded-full text-sm font-medium ${colorClass}">
                ${statusText}
            </span>
        `;
    }

    renderPriorityBadge() {
        const priorityColors = {
            'low': 'bg-gray-100 text-gray-800',
            'medium': 'bg-blue-100 text-blue-800',
            'high': 'bg-orange-100 text-orange-800',
            'urgent': 'bg-red-100 text-red-800'
        };

        const colorClass = priorityColors[this.deal.priority] || 'bg-gray-100 text-gray-800';

        return `
            <span class="px-3 py-1 rounded-full text-sm font-medium ${colorClass}">
                ${this.deal.priority.toUpperCase()} PRIORITY
            </span>
        `;
    }

    renderDealMetrics() {
        const metrics = this.timeline?.metrics || {};
        
        return `
            <div class="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <div class="text-2xl font-bold text-slate-900 dark:text-white">
                    ${metrics.progress_percentage || 0}%
                </div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Progress</div>
            </div>
            
            <div class="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <div class="text-2xl font-bold text-slate-900 dark:text-white">
                    ${metrics.remaining_days || 0}
                </div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Days Left</div>
            </div>
            
            <div class="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <div class="text-2xl font-bold text-slate-900 dark:text-white">
                    ${this.formatCurrency(this.deal.current_offer || this.deal.initial_offer)}
                </div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Current Offer</div>
            </div>
            
            <div class="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <div class="text-2xl font-bold text-slate-900 dark:text-white">
                    ${metrics.completed_milestones || 0}/${metrics.total_milestones || 0}
                </div>
                <div class="text-sm text-slate-600 dark:text-slate-400">Milestones</div>
            </div>
        `;
    }

    renderTimeline() {
        if (!this.timeline?.milestones) {
            return '<div class="text-center py-8 text-slate-500">No timeline data available</div>';
        }

        const milestones = this.timeline.milestones;
        
        return `
            <div class="timeline-section">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    34-Day Acquisition Timeline
                </h3>
                
                <div class="space-y-4">
                    ${milestones.map(milestone => this.renderMilestone(milestone)).join('')}
                </div>
            </div>
        `;
    }

    renderMilestone(milestone) {
        const isCompleted = milestone.is_completed;
        const isOverdue = !isCompleted && new Date(milestone.due_date) < new Date();
        const isCritical = milestone.is_critical;

        let statusClass = 'bg-gray-100 text-gray-600';
        let iconClass = 'text-gray-400';

        if (isCompleted) {
            statusClass = 'bg-green-100 text-green-800';
            iconClass = 'text-green-500';
        } else if (isOverdue) {
            statusClass = 'bg-red-100 text-red-800';
            iconClass = 'text-red-500';
        } else if (isCritical) {
            statusClass = 'bg-orange-100 text-orange-800';
            iconClass = 'text-orange-500';
        }

        return `
            <div class="milestone-item flex items-start space-x-4 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                <div class="milestone-icon flex-shrink-0">
                    <div class="w-8 h-8 rounded-full ${statusClass} flex items-center justify-center">
                        ${isCompleted ? '✓' : '○'}
                    </div>
                </div>
                
                <div class="milestone-content flex-grow">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-medium text-slate-900 dark:text-white">
                                ${milestone.milestone_name}
                            </h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                ${milestone.description}
                            </p>
                        </div>
                        
                        <div class="text-right">
                            <div class="text-sm font-medium text-slate-900 dark:text-white">
                                ${this.formatDate(milestone.due_date)}
                            </div>
                            ${isOverdue ? '<div class="text-xs text-red-600">Overdue</div>' : ''}
                        </div>
                    </div>
                    
                    ${milestone.notes ? `
                        <div class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            ${milestone.notes}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderDealInfo() {
        return `
            <div class="deal-info bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <h3 class="font-semibold text-slate-900 dark:text-white mb-3">Deal Information</h3>
                
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-slate-600 dark:text-slate-400">Offer Date:</span>
                        <span class="text-slate-900 dark:text-white">${this.formatDate(this.deal.offer_date)}</span>
                    </div>
                    
                    <div class="flex justify-between">
                        <span class="text-slate-600 dark:text-slate-400">Target Close:</span>
                        <span class="text-slate-900 dark:text-white">${this.formatDate(this.deal.closing_date)}</span>
                    </div>
                    
                    <div class="flex justify-between">
                        <span class="text-slate-600 dark:text-slate-400">Initial Offer:</span>
                        <span class="text-slate-900 dark:text-white">${this.formatCurrency(this.deal.initial_offer)}</span>
                    </div>
                    
                    ${this.deal.current_offer && this.deal.current_offer !== this.deal.initial_offer ? `
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-slate-400">Current Offer:</span>
                            <span class="text-slate-900 dark:text-white">${this.formatCurrency(this.deal.current_offer)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderDocuments() {
        const docCount = this.documents?.total_count || 0;
        
        return `
            <div class="documents-section bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-semibold text-slate-900 dark:text-white">Documents</h3>
                    <span class="text-sm text-slate-600 dark:text-slate-400">${docCount} files</span>
                </div>
                
                <div class="space-y-2">
                    <button class="w-full px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                        Upload Document
                    </button>
                    
                    <button class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        View All Documents
                    </button>
                </div>
            </div>
        `;
    }

    renderParticipants() {
        return `
            <div class="participants-section bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <h3 class="font-semibold text-slate-900 dark:text-white mb-3">Participants</h3>
                
                <div class="space-y-3">
                    <div class="participant">
                        <div class="text-sm font-medium text-slate-900 dark:text-white">Buyer</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400">
                            ${this.deal.buyer?.first_name} ${this.deal.buyer?.last_name}
                        </div>
                        ${this.deal.buyer?.company ? `
                            <div class="text-xs text-slate-500">${this.deal.buyer.company}</div>
                        ` : ''}
                    </div>
                    
                    <div class="participant">
                        <div class="text-sm font-medium text-slate-900 dark:text-white">Seller</div>
                        <div class="text-sm text-slate-600 dark:text-slate-400">
                            ${this.deal.seller?.first_name} ${this.deal.seller?.last_name}
                        </div>
                        ${this.deal.seller?.company ? `
                            <div class="text-xs text-slate-500">${this.deal.seller.company}</div>
                        ` : ''}
                    </div>
                    
                    ${this.deal.assigned ? `
                        <div class="participant">
                            <div class="text-sm font-medium text-slate-900 dark:text-white">Assigned To</div>
                            <div class="text-sm text-slate-600 dark:text-slate-400">
                                ${this.deal.assigned.first_name} ${this.deal.assigned.last_name}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderLoading() {
        this.container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span class="ml-3 text-slate-600 dark:text-slate-400">Loading deal data...</span>
            </div>
        `;
    }

    renderError(message) {
        this.container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-red-600 dark:text-red-400 mb-2">Error</div>
                <div class="text-slate-600 dark:text-slate-400">${message}</div>
            </div>
        `;
    }

    attachEventListeners() {
        // Add event listeners for interactive elements
        // This would include milestone updates, document uploads, etc.
    }

    formatCurrency(amount) {
        if (!amount) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}

// Export for use in other modules
export { DealDashboard };
