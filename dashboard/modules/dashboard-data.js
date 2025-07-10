/**
 * Dashboard Data Module
 * Mock data and data management methods for the dashboard
 * @author Ardonie Capital Development Team
 */

console.log('📊 Loading Dashboard Data Module...');

/**
 * Dashboard data management functions
 * Provides mock data and data manipulation methods
 */
const DashboardData = {
    /**
     * Get mock overview data for KPI cards
     * @returns {Object} Overview data object
     */
    getMockOverviewData() {
        return {
            totalDeals: {
                value: 12,
                change: '+3',
                trend: 'up'
            },
            activeListings: {
                value: 47,
                change: '+8',
                trend: 'up'
            },
            avgDealValue: {
                value: 425000,
                change: '+12%',
                trend: 'up'
            },
            completionRate: {
                value: 78,
                change: '+5%',
                trend: 'up'
            }
        };
    },

    /**
     * Get mock deals data for Active Deals section
     * @returns {Array} Array of deal objects
     */
    getMockDealsData() {
        return [
            {
                id: 'deal-001',
                businessName: 'Premier Auto Service',
                location: 'Dallas, TX',
                industry: 'Auto Repair',
                dealValue: 425000,
                askingPrice: 450000,
                negotiatedPrice: 425000,
                revenue: 650000,
                ebitda: 95000,
                status: 'due-diligence',
                progress: 30,
                startDate: '2024-11-15',
                expectedClosing: '2025-02-15',
                lastActivity: '2 hours ago',
                teamMembers: {
                    broker: 'Amanda Foster',
                    attorney: 'Michael Chen',
                    accountant: 'Sarah Williams'
                }
            },
            {
                id: 'deal-002',
                businessName: 'Elite Collision Center',
                location: 'Fort Worth, TX',
                industry: 'Auto Body',
                dealValue: 680000,
                askingPrice: 720000,
                negotiatedPrice: 680000,
                revenue: 920000,
                ebitda: 142000,
                status: 'negotiation',
                progress: 50,
                startDate: '2024-10-20',
                expectedClosing: '2025-01-30',
                lastActivity: '1 day ago',
                teamMembers: {
                    broker: 'David Wilson',
                    attorney: 'Jennifer Lopez',
                    accountant: 'Robert Johnson'
                }
            },
            {
                id: 'deal-003',
                businessName: 'Quick Lube Express',
                location: 'Plano, TX',
                industry: 'Quick Lube',
                dealValue: 275000,
                askingPrice: 295000,
                negotiatedPrice: 275000,
                revenue: 380000,
                ebitda: 72000,
                status: 'financing',
                progress: 70,
                startDate: '2024-09-10',
                expectedClosing: '2025-01-15',
                lastActivity: '3 days ago',
                teamMembers: {
                    broker: 'Lisa Martinez',
                    attorney: 'Thomas Anderson',
                    accountant: 'Emily Davis'
                }
            }
        ];
    },

    /**
     * Get mock conversations data for Messages section
     * @returns {Array} Array of conversation objects
     */
    getMockConversationsData() {
        return [
            {
                id: 'conv-001',
                participant: {
                    name: 'Sarah Johnson',
                    role: 'Seller',
                    business: 'Premier Auto Service',
                    avatar: null
                },
                lastMessage: {
                    content: 'Thank you for your interest! I would be happy to discuss the business with you.',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                    sender: 'them'
                },
                unreadCount: 2,
                dealRelated: true,
                dealId: 'deal-001'
            },
            {
                id: 'conv-002',
                participant: {
                    name: 'David Wilson',
                    role: 'Business Broker',
                    business: 'Elite Collision Center',
                    avatar: null
                },
                lastMessage: {
                    content: 'I have the financial documents ready for your review.',
                    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                    sender: 'them'
                },
                unreadCount: 0,
                dealRelated: true,
                dealId: 'deal-002'
            },
            {
                id: 'conv-003',
                participant: {
                    name: 'Amanda Foster',
                    role: 'Business Broker',
                    business: 'Foster Business Solutions',
                    avatar: null
                },
                lastMessage: {
                    content: 'The inspection is scheduled for next Tuesday at 10 AM.',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                    sender: 'you'
                },
                unreadCount: 1,
                dealRelated: true,
                dealId: 'deal-003'
            },
            {
                id: 'conv-004',
                participant: {
                    name: 'Support Team',
                    role: 'Support',
                    business: 'Ardonie Capital',
                    avatar: null
                },
                lastMessage: {
                    content: 'Your account verification has been completed successfully.',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                    sender: 'them'
                },
                unreadCount: 0,
                dealRelated: false,
                dealId: null
            }
        ];
    },

    /**
     * Get mock messages data for a specific conversation
     * @param {string} conversationId - ID of the conversation
     * @returns {Array} Array of message objects
     */
    getMockMessagesData(conversationId) {
        const messagesByConversation = {
            'conv-001': [
                {
                    id: 'msg-001',
                    sender: 'you',
                    content: 'Hi Sarah, I am very interested in your auto repair shop listing. Could we schedule a time to discuss the details and possibly arrange a visit?',
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                    attachments: []
                },
                {
                    id: 'msg-002',
                    sender: 'them',
                    content: 'Thank you for your interest! I would be happy to discuss the business with you. Are you available for a call this week?',
                    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                    attachments: []
                },
                {
                    id: 'msg-003',
                    sender: 'them',
                    content: 'I can also provide you with our financial statements from the last 3 years if that would be helpful.',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    attachments: [
                        { name: 'Financial_Statements_2021-2023.pdf', size: '2.4 MB', type: 'pdf' }
                    ]
                }
            ],
            'conv-002': [
                {
                    id: 'msg-004',
                    sender: 'them',
                    content: 'I have the financial documents ready for your review. Please let me know when you would like to schedule a meeting.',
                    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                    attachments: []
                }
            ],
            'conv-003': [
                {
                    id: 'msg-005',
                    sender: 'you',
                    content: 'The inspection is scheduled for next Tuesday at 10 AM. Please confirm if this works for you.',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    attachments: []
                }
            ],
            'conv-004': [
                {
                    id: 'msg-006',
                    sender: 'them',
                    content: 'Your account verification has been completed successfully. You now have access to all premium features.',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    attachments: []
                }
            ]
        };

        return messagesByConversation[conversationId] || [];
    },

    /**
     * Get mock recent activity data
     * @returns {Array} Array of activity objects
     */
    getMockRecentActivity() {
        return [
            {
                id: 'activity-001',
                type: 'deal_update',
                title: 'Deal status updated',
                description: 'Premier Auto Service moved to Due Diligence phase',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                icon: 'deal'
            },
            {
                id: 'activity-002',
                type: 'message',
                title: 'New message received',
                description: 'Sarah Johnson sent you a message about the listing',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                icon: 'message'
            },
            {
                id: 'activity-003',
                type: 'listing',
                title: 'New listing match',
                description: 'Found 3 new listings matching your criteria',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                icon: 'listing'
            },
            {
                id: 'activity-004',
                type: 'document',
                title: 'Document uploaded',
                description: 'Financial statements received for Elite Collision Center',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
                icon: 'document'
            }
        ];
    },

    /**
     * Get mock saved listings data
     * @returns {Array} Array of saved listing objects
     */
    getMockSavedListings() {
        return [
            {
                id: 'listing-001',
                businessName: 'AutoCare Plus',
                location: 'San Antonio, TX',
                askingPrice: 425000,
                revenue: 650000,
                industry: 'Auto Repair',
                savedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                notes: 'Interested in this location, need to verify lease terms'
            },
            {
                id: 'listing-002',
                businessName: 'Precision Motors',
                location: 'Fort Worth, TX',
                askingPrice: 680000,
                revenue: 920000,
                industry: 'Auto Repair',
                savedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                notes: 'Good cash flow, consider for portfolio'
            }
        ];
    },

    /**
     * Load overview data for the dashboard
     * Populates KPI cards and overview section
     */
    async loadOverviewData() {
        try {
            console.log('🔄 Loading overview data...');

            const overviewData = this.getMockOverviewData();

            // Update KPI cards
            this.updateKPICard('total-deals', overviewData.totalDeals);
            this.updateKPICard('active-listings', overviewData.activeListings);
            this.updateKPICard('avg-deal-value', overviewData.avgDealValue);
            this.updateKPICard('completion-rate', overviewData.completionRate);

            // Load recent activity
            const recentActivity = this.getMockRecentActivity();
            this.updateRecentActivity(recentActivity);

            console.log('✅ Overview data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load overview data:', error);
        }
    },

    /**
     * Load messages data for the dashboard
     * Populates messages section and conversation list
     */
    async loadMessagesData() {
        try {
            console.log('🔄 Loading messages data...');

            const conversations = this.getMockConversationsData();
            this.updateConversationsList(conversations);

            console.log('✅ Messages data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load messages data:', error);
        }
    },

    /**
     * Update KPI card with new data
     * @param {string} cardId - ID of the KPI card
     * @param {Object} data - Data object with value, change, and trend
     */
    updateKPICard(cardId, data) {
        const card = document.getElementById(cardId);
        if (!card) return;

        const valueElement = card.querySelector('.kpi-value');
        const changeElement = card.querySelector('.kpi-change');

        if (valueElement) {
            if (cardId === 'avg-deal-value') {
                valueElement.textContent = `$${data.value.toLocaleString()}`;
            } else if (cardId === 'completion-rate') {
                valueElement.textContent = `${data.value}%`;
            } else {
                valueElement.textContent = data.value;
            }
        }

        if (changeElement) {
            changeElement.textContent = data.change;
            changeElement.className = `kpi-change ${data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`;
        }
    },

    /**
     * Update recent activity list
     * @param {Array} activities - Array of activity objects
     */
    updateRecentActivity(activities) {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        container.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="flex items-start space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 dark:text-white">${activity.title}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">${activity.description}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">${activity.timestamp}</p>
                </div>
            </div>
        `).join('');
    },

    /**
     * Update conversations list in messages section
     * @param {Array} conversations - Array of conversation objects
     */
    updateConversationsList(conversations) {
        const container = document.getElementById('conversations-list');
        if (!container) return;

        container.innerHTML = conversations.slice(0, 10).map(conv => `
            <div class="conversation-item p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-200 dark:border-slate-700"
                 data-conversation-id="${conv.id}">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            ${conv.participant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <p class="text-sm font-medium text-slate-900 dark:text-white truncate">${conv.participant.name}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400">${conv.lastMessage.timestamp}</p>
                        </div>
                        <p class="text-sm text-slate-600 dark:text-slate-300 truncate">${conv.lastMessage.preview}</p>
                        ${conv.unreadCount > 0 ? `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">${conv.unreadCount} new</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
};

// Extend BuyerDashboard prototype with data methods
console.log('🔄 Attempting to extend BuyerDashboard with data methods...');
console.log('🔍 window.BuyerDashboard available:', !!window.BuyerDashboard);
console.log('🔍 DashboardData object keys:', Object.keys(DashboardData));

if (typeof window !== 'undefined' && window.BuyerDashboard) {
    try {
        Object.assign(window.BuyerDashboard.prototype, DashboardData);
        console.log('✅ Dashboard Data methods added to BuyerDashboard prototype');

        // Verify methods were added
        const testInstance = new window.BuyerDashboard();
        const addedMethods = Object.keys(DashboardData).filter(key =>
            typeof testInstance[key] === 'function'
        );
        console.log('✅ Verified data methods added:', addedMethods);
    } catch (error) {
        console.error('❌ Failed to extend BuyerDashboard prototype with data:', error);
    }
} else {
    console.warn('⚠️ BuyerDashboard not available, data methods not added');
}

// Update loading status
if (window.dashboardLoadingStatus) {
    window.dashboardLoadingStatus.modulesLoaded.data = true;
}

console.log('✅ Dashboard Data Module loaded');

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardData };
}
