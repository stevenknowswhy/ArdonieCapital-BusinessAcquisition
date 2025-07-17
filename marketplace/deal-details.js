// Deal Details Management System with Supabase Integration
class DealDetailsManager {
    constructor() {
        this.dealId = this.getDealIdFromURL();
        this.dealData = null;
        this.documents = {};
        this.timeline = [];
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
            await this.loadDealDataFromSupabase();
            await this.loadDocumentsFromSupabase();
            await this.loadTimelineFromSupabase();

            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();

            // Render data
            this.renderDealHeader();
            this.renderDocuments();
            this.renderTimeline();

            this.showLoading(false);
            console.log('✅ Deal Details Manager initialized with Supabase');
        } catch (error) {
            console.error('❌ Failed to initialize Deal Details Manager:', error);
            this.showLoading(false);
            // Fallback to sample data
            this.loadDealData();
            this.loadDocuments();
            this.loadTimeline();
            this.renderDealHeader();
            this.renderDocuments();
            this.renderTimeline();
        }
    }

    getDealIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || 'DEAL-001';
    }

    /**
     * Load deal data from Supabase
     */
    async loadDealDataFromSupabase() {
        try {
            const deal = await this.supabaseService.getDeal(this.dealId);

            if (!deal) {
                throw new Error('Deal not found');
            }

            // Transform Supabase data to match UI expectations
            this.dealData = {
                id: deal.id,
                dealNumber: deal.deal_number,
                businessName: deal.business_name,
                location: deal.location,
                purchasePrice: deal.purchase_price,
                status: deal.status,
                priority: deal.priority,
                progress: deal.progress_percentage || 0,
                daysToClosing: deal.days_to_closing || this.calculateDaysToClosing(deal.closing_date),
                buyer: deal.buyer ? `${deal.buyer.first_name} ${deal.buyer.last_name}` : 'Unknown',
                seller: deal.seller ? `${deal.seller.first_name} ${deal.seller.last_name}` : 'Unknown',
                assignedTo: deal.agent ? `${deal.agent.first_name} ${deal.agent.last_name}` : 'Unassigned',
                buyerContact: deal.buyer || {},
                sellerContact: deal.seller || {},
                agentContact: deal.agent || {},
                nextMilestone: deal.next_milestone || 'TBD',
                createdAt: deal.created_at,
                updatedAt: deal.updated_at,
                documents: {
                    total: deal.documents?.length || 0,
                    completed: deal.documents?.filter(doc => doc.status === 'completed').length || 0,
                    pending: deal.documents?.filter(doc => doc.status !== 'completed').length || 0
                }
            };

            console.log('✅ Deal data loaded from Supabase:', this.dealData);
        } catch (error) {
            console.error('❌ Error loading deal data from Supabase:', error);
            // Fallback to sample data
            this.loadDealData();
        }
    }

    /**
     * Load documents from Supabase
     */
    async loadDocumentsFromSupabase() {
        try {
            const documents = await this.supabaseService.getDocuments(this.dealId);

            // Group documents by category
            this.documents = {
                purchase: documents.filter(doc => doc.category === 'purchase'),
                dueDiligence: documents.filter(doc => doc.category === 'due-diligence'),
                financing: documents.filter(doc => doc.category === 'financing'),
                legal: documents.filter(doc => doc.category === 'legal')
            };

            console.log('✅ Documents loaded from Supabase:', this.documents);
        } catch (error) {
            console.error('❌ Error loading documents from Supabase:', error);
            // Fallback to sample data
            this.loadDocuments();
        }
    }

    /**
     * Load timeline from Supabase
     */
    async loadTimelineFromSupabase() {
        try {
            const activities = await this.supabaseService.getActivities(this.dealId);

            this.timeline = activities.map(activity => ({
                date: new Date(activity.created_at).toLocaleDateString(),
                time: new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: activity.title,
                description: activity.description,
                status: this.mapActivityTypeToStatus(activity.activity_type),
                user: activity.user ? `${activity.user.first_name} ${activity.user.last_name}` : 'System'
            }));

            console.log('✅ Timeline loaded from Supabase:', this.timeline);
        } catch (error) {
            console.error('❌ Error loading timeline from Supabase:', error);
            // Fallback to sample data
            this.loadTimeline();
        }
    }

    /**
     * Map activity type to timeline status
     */
    mapActivityTypeToStatus(activityType) {
        const statusMap = {
            'created': 'completed',
            'updated': 'in-progress',
            'uploaded': 'completed',
            'reviewed': 'completed',
            'approved': 'completed',
            'rejected': 'completed',
            'signed': 'completed'
        };
        return statusMap[activityType] || 'in-progress';
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
     * Setup real-time subscriptions
     */
    setupRealtimeSubscriptions() {
        try {
            // Subscribe to document changes for this deal
            const documentsSubscription = this.supabaseService.subscribeToDocuments(this.dealId, (payload) => {
                console.log('Real-time documents update:', payload);
                this.handleDocumentsUpdate(payload);
            });

            // Subscribe to activity changes for this deal
            const activitiesSubscription = this.supabaseService.subscribeToActivities(this.dealId, (payload) => {
                console.log('Real-time activities update:', payload);
                this.handleActivitiesUpdate(payload);
            });

            if (documentsSubscription) {
                this.subscriptions.push(documentsSubscription);
            }
            if (activitiesSubscription) {
                this.subscriptions.push(activitiesSubscription);
            }

            console.log('✅ Real-time subscriptions setup complete for deal:', this.dealId);
        } catch (error) {
            console.error('❌ Error setting up real-time subscriptions:', error);
        }
    }

    /**
     * Handle real-time document updates
     */
    handleDocumentsUpdate(payload) {
        // Reload documents and re-render
        this.loadDocumentsFromSupabase().then(() => {
            this.renderDocuments();
            this.updateProgressFromDocuments();
        });
    }

    /**
     * Handle real-time activity updates
     */
    handleActivitiesUpdate(payload) {
        // Reload timeline and re-render
        this.loadTimelineFromSupabase().then(() => {
            this.renderTimeline();
        });
    }

    /**
     * Update progress based on documents
     */
    updateProgressFromDocuments() {
        if (this.dealData && this.documents) {
            const allDocs = Object.values(this.documents).flat();
            const totalDocs = allDocs.length;
            const completedDocs = allDocs.filter(doc => doc.status === 'completed').length;
            const progress = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

            this.dealData.progress = progress;
            this.dealData.documents = {
                total: totalDocs,
                completed: completedDocs,
                pending: totalDocs - completedDocs
            };

            // Update progress display
            const progressElement = document.getElementById('progressPercentage');
            const progressCircle = document.querySelector('.progress-circle');
            const documentsProgress = document.getElementById('documentsProgress');

            if (progressElement) progressElement.textContent = `${progress}%`;
            if (progressCircle) progressCircle.style.strokeDasharray = `${progress}, 100`;
            if (documentsProgress) documentsProgress.textContent = `${completedDocs} of ${totalDocs} documents completed`;
        }
    }

    /**
     * Show/hide loading state
     */
    showLoading(show) {
        this.isLoading = show;
        // You can add loading indicators here
    }

    /**
     * Fallback sample data (kept for offline/error scenarios)
     */
    loadDealData() {
        const deals = {
            'DEAL-001': {
                id: 'DEAL-001',
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
                assignedTo: 'Sarah Wilson',
                documents: { total: 15, completed: 11, pending: 4 }
            }
        };
        this.dealData = deals[this.dealId] || deals['DEAL-001'];
    }

    loadDocuments() {
        // Sample documents data
        this.documents = {
            purchase: [
                { name: 'Asset Purchase Agreement', status: 'completed', required: true, lastModified: '2024-01-15', size: '2.3 MB' },
                { name: 'Bill of Sale', status: 'completed', required: true, lastModified: '2024-01-15', size: '1.1 MB' },
                { name: 'Escrow Agreement', status: 'pending', required: true, lastModified: null, size: null },
                { name: 'Closing Statement', status: 'pending', required: true, lastModified: null, size: null }
            ],
            dueDiligence: [
                { name: 'Financial Statements (3 years)', status: 'completed', required: true, lastModified: '2024-01-10', size: '5.2 MB' },
                { name: 'Tax Returns', status: 'completed', required: true, lastModified: '2024-01-10', size: '3.8 MB' },
                { name: 'Equipment List & Valuations', status: 'completed', required: true, lastModified: '2024-01-12', size: '1.9 MB' },
                { name: 'Customer Contracts', status: 'in-review', required: true, lastModified: '2024-01-14', size: '2.1 MB' },
                { name: 'Employee Records', status: 'pending', required: true, lastModified: null, size: null }
            ],
            financing: [
                { name: 'Loan Application', status: 'completed', required: true, lastModified: '2024-01-08', size: '1.5 MB' },
                { name: 'Personal Financial Statement', status: 'completed', required: true, lastModified: '2024-01-08', size: '0.8 MB' },
                { name: 'Bank Commitment Letter', status: 'in-review', required: true, lastModified: '2024-01-16', size: '0.5 MB' },
                { name: 'SBA Forms', status: 'pending', required: false, lastModified: null, size: null }
            ],
            legal: [
                { name: 'Business License', status: 'completed', required: true, lastModified: '2024-01-05', size: '0.3 MB' },
                { name: 'Environmental Compliance', status: 'completed', required: true, lastModified: '2024-01-07', size: '1.2 MB' },
                { name: 'Insurance Policies', status: 'in-review', required: true, lastModified: '2024-01-13', size: '2.7 MB' },
                { name: 'Lease Agreement', status: 'pending', required: true, lastModified: null, size: null }
            ]
        };
    }

    loadTimeline() {
        // Sample timeline data
        this.timeline = [
            {
                date: '2024-01-16',
                time: '2:30 PM',
                title: 'Bank commitment letter received',
                description: 'Financing documents updated',
                status: 'completed',
                user: 'Mark Thompson'
            },
            {
                date: '2024-01-15',
                time: '11:45 AM',
                title: 'Purchase agreement signed',
                description: 'Both parties have executed the agreement',
                status: 'completed',
                user: 'Sarah Wilson'
            },
            {
                date: '2024-01-14',
                time: '4:15 PM',
                title: 'Customer contracts review',
                description: 'Legal team reviewing customer agreements',
                status: 'in-progress',
                user: 'Legal Team'
            },
            {
                date: '2024-01-12',
                time: '9:00 AM',
                title: 'Equipment valuation completed',
                description: 'Third-party appraisal finalized',
                status: 'completed',
                user: 'Appraiser'
            },
            {
                date: '2024-01-18',
                time: 'TBD',
                title: 'Final walkthrough scheduled',
                description: 'Pre-closing inspection of premises',
                status: 'upcoming',
                user: 'Sarah Wilson'
            }
        ];
    }

    renderDealHeader() {
        if (!this.dealData) return;

        document.getElementById('dealBreadcrumb').textContent = this.dealData.businessName;
        document.getElementById('businessName').textContent = this.dealData.businessName;
        document.getElementById('dealId').textContent = this.dealData.id;
        document.getElementById('location').textContent = this.dealData.location;
        document.getElementById('purchasePrice').textContent = `$${this.dealData.purchasePrice.toLocaleString()}`;
        document.getElementById('buyer').textContent = this.dealData.buyer;
        document.getElementById('seller').textContent = this.dealData.seller;
        document.getElementById('assignedTo').textContent = this.dealData.assignedTo;
        document.getElementById('daysToClosing').textContent = this.dealData.daysToClosing;

        // Update status badge
        const statusBadge = document.getElementById('statusBadge');
        const statusColors = {
            'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            'pending-review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            'completed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            'on-hold': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        };
        statusBadge.className = `px-3 py-1 text-sm font-medium rounded-full ${statusColors[this.dealData.status]}`;
        statusBadge.textContent = this.dealData.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

        // Update priority badge
        const priorityBadge = document.getElementById('priorityBadge');
        const priorityColors = {
            'high': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            'low': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        };
        priorityBadge.className = `px-2 py-1 text-xs font-medium rounded ${priorityColors[this.dealData.priority]}`;
        priorityBadge.textContent = `${this.dealData.priority.toUpperCase()} PRIORITY`;

        // Update progress
        document.getElementById('progressPercentage').textContent = `${this.dealData.progress}%`;
        document.getElementById('documentsProgress').textContent = 
            `${this.dealData.documents.completed} of ${this.dealData.documents.required} documents completed`;

        // Update progress circle
        const progressCircle = document.querySelector('.progress-circle');
        progressCircle.style.strokeDasharray = `${this.dealData.progress}, 100`;

        // Update contacts
        document.getElementById('buyerContact').textContent = this.dealData.buyer;
        document.getElementById('sellerContact').textContent = this.dealData.seller;
        document.getElementById('agentContact').textContent = this.dealData.assignedTo;
    }

    renderDocuments() {
        this.renderDocumentCategory('purchaseDocuments', this.documents.purchase);
        this.renderDocumentCategory('dueDiligenceDocuments', this.documents.dueDiligence);
        this.renderDocumentCategory('financingDocuments', this.documents.financing);
        this.renderDocumentCategory('legalDocuments', this.documents.legal);
    }

    renderDocumentCategory(containerId, documents) {
        const container = document.getElementById(containerId);
        
        container.innerHTML = documents.map(doc => this.renderDocumentItem(doc)).join('');
    }

    renderDocumentItem(doc) {
        const statusColors = {
            'completed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            'in-review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            'pending': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
        };

        const statusIcons = {
            'completed': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
            'in-review': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
            'pending': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
        };

        return `
            <div class="document-item p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3 flex-1">
                        <div class="flex-shrink-0">
                            <svg class="w-5 h-5 ${doc.status === 'completed' ? 'text-green-600' : doc.status === 'in-review' ? 'text-yellow-600' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${statusIcons[doc.status]}
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2">
                                <p class="text-sm font-medium text-slate-900 dark:text-white truncate">${doc.name}</p>
                                ${doc.required ? '<span class="text-xs text-red-600 dark:text-red-400">Required</span>' : ''}
                            </div>
                            <div class="flex items-center space-x-4 mt-1">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[doc.status]}">
                                    ${doc.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                ${doc.lastModified ? `<span class="text-xs text-slate-500 dark:text-slate-400">Modified: ${doc.lastModified}</span>` : ''}
                                ${doc.size ? `<span class="text-xs text-slate-500 dark:text-slate-400">${doc.size}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${doc.status === 'completed' ? `
                            <button class="text-primary hover:text-primary-dark">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                            </button>
                        ` : `
                            <button class="text-accent hover:text-accent-dark">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                </svg>
                            </button>
                        `}
                        <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTimeline() {
        const timelineContainer = document.getElementById('dealTimeline');
        
        // Sort timeline by date
        const sortedTimeline = this.timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        timelineContainer.innerHTML = sortedTimeline.map(item => this.renderTimelineItem(item)).join('');
    }

    renderTimelineItem(item) {
        const statusColors = {
            'completed': 'bg-green-600',
            'in-progress': 'bg-yellow-600',
            'upcoming': 'bg-slate-400'
        };

        const statusIcons = {
            'completed': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
            'in-progress': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
            'upcoming': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4a2 2 0 00-2-2H10a2 2 0 00-2 2z"/>'
        };

        return `
            <div class="timeline-step flex items-start space-x-3">
                <div class="flex-shrink-0 w-8 h-8 ${statusColors[item.status]} rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${statusIcons[item.status]}
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-slate-900 dark:text-white">${item.title}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">${item.time}</p>
                    </div>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">${item.description}</p>
                    <div class="flex items-center justify-between mt-2">
                        <p class="text-xs text-slate-500 dark:text-slate-400">${item.user}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">${item.date}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the deal details manager when the page loads
let dealDetailsManager;
document.addEventListener('DOMContentLoaded', function() {
    dealDetailsManager = new DealDetailsManager();
});
