/**
 * Dashboard Real-time Messages Module
 * Integrates real-time messaging with dashboard
 */

import { messagingService } from '../../src/features/messaging/services/messaging.service.js';
import RealtimeMessagingComponent from '../../src/features/messaging/components/realtime-messaging.component.js';

/**
 * Real-time Messages Dashboard Integration
 */
const DashboardRealtimeMessages = {
    messagingComponent: null,
    isInitialized: false,
    unreadCount: 0,

    /**
     * Initialize real-time messaging in dashboard
     */
    async init() {
        try {
            console.log('🚀 Initializing real-time messaging...');
            
            // Initialize messaging service
            await messagingService.init();
            
            this.isInitialized = true;
            console.log('✅ Real-time messaging initialized');
            
            // Setup unread count monitoring
            this.setupUnreadCountMonitoring();
            
        } catch (error) {
            console.error('❌ Failed to initialize real-time messaging:', error);
            throw error;
        }
    },

    /**
     * Create enhanced messages section with real-time capabilities
     */
    async createMessagesSection() {
        console.log('🔄 Creating real-time messages section...');
        
        const container = document.getElementById('dashboard-sections');
        if (!container) {
            console.error('❌ Dashboard sections container not found!');
            return;
        }

        // Remove existing messages section if it exists
        const existingSection = document.getElementById('messages-section');
        if (existingSection) {
            existingSection.remove();
        }

        const section = document.createElement('div');
        section.id = 'messages-section';
        section.className = 'dashboard-section h-full';
        section.style.display = 'none';

        try {
            // Create container for real-time messaging
            section.innerHTML = '<div id="realtime-messaging-container" class="h-full min-h-[600px]"></div>';
            container.appendChild(section);
            
            // Initialize real-time messaging component
            this.messagingComponent = new RealtimeMessagingComponent('realtime-messaging-container');
            await this.messagingComponent.init();
            
            // Setup message update callbacks
            this.setupMessageUpdateCallbacks();
            
            console.log('✅ Real-time messages section created');
            
        } catch (error) {
            console.error('❌ Failed to create real-time messages section:', error);
            
            // Fallback to basic messaging interface
            section.innerHTML = this.createFallbackMessagesHTML();
            container.appendChild(section);
            
            console.log('⚠️ Using fallback messaging interface');
        }
    },

    /**
     * Setup message update callbacks
     */
    setupMessageUpdateCallbacks() {
        if (!this.messagingComponent) return;

        this.messagingComponent.onMessageUpdate(async (payload) => {
            console.log('📨 Message update received:', payload);
            
            // Update unread count
            await this.updateUnreadCount();
            
            // Show notification for new messages
            if (payload.eventType === 'INSERT') {
                this.showMessageNotification(payload.new);
            }
        });
    },

    /**
     * Setup unread count monitoring
     */
    setupUnreadCountMonitoring() {
        // Update unread count every 30 seconds
        setInterval(async () => {
            await this.updateUnreadCount();
        }, 30000);

        // Initial load
        this.updateUnreadCount();
    },

    /**
     * Update unread message count
     */
    async updateUnreadCount() {
        try {
            const result = await messagingService.getUnreadMessageCount();
            
            if (result.success) {
                this.unreadCount = result.data;
                this.updateUnreadBadges(this.unreadCount);
            }
        } catch (error) {
            console.error('Error updating unread count:', error);
        }
    },

    /**
     * Update unread badges in UI
     */
    updateUnreadBadges(count) {
        // Update messages navigation item
        const messagesNavItems = document.querySelectorAll('[data-section="messages"]');
        messagesNavItems.forEach(navItem => {
            let badge = navItem.querySelector('.unread-badge');
            
            if (count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'unread-badge bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2 min-w-[20px] text-center';
                    navItem.appendChild(badge);
                }
                badge.textContent = count > 99 ? '99+' : count.toString();
                badge.style.display = 'inline-block';
            } else if (badge) {
                badge.style.display = 'none';
            }
        });

        // Update dashboard KPI cards
        this.updateMessagesKPI(count);
    },

    /**
     * Update messages KPI card
     */
    updateMessagesKPI(count) {
        // Update unread messages KPI
        const messagesKPIValue = document.getElementById('messages-kpi-value');
        if (messagesKPIValue) {
            messagesKPIValue.textContent = count.toString();
        }

        // Update messages KPI in buyer dashboard
        const buyerMessagesKPI = document.querySelector('.kpi-card[data-kpi="messages"] .kpi-value');
        if (buyerMessagesKPI) {
            buyerMessagesKPI.textContent = count.toString();
        }

        // Update messages KPI in seller dashboard
        const sellerMessagesKPI = document.querySelector('.kpi-card[data-kpi="unread-messages"] .kpi-value');
        if (sellerMessagesKPI) {
            sellerMessagesKPI.textContent = count.toString();
        }
    },

    /**
     * Show message notification
     */
    showMessageNotification(message) {
        // Check if notifications are supported and permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('New Message', {
                body: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
                icon: '/favicon.ico',
                tag: 'new-message'
            });

            notification.onclick = () => {
                window.focus();
                // Switch to messages section
                const messagesNavItem = document.querySelector('[data-section="messages"]');
                if (messagesNavItem) {
                    messagesNavItem.click();
                }
                notification.close();
            };

            // Auto-close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        }

        // Show in-app notification
        this.showInAppNotification(message);
    },

    /**
     * Show in-app notification
     */
    showInAppNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 max-w-sm z-50 transform translate-x-full transition-transform duration-300';
        
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 dark:text-white">New Message</p>
                    <p class="text-sm text-slate-600 dark:text-slate-300 truncate">${message.content}</p>
                </div>
                <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Click to open messages
        notification.addEventListener('click', () => {
            const messagesNavItem = document.querySelector('[data-section="messages"]');
            if (messagesNavItem) {
                messagesNavItem.click();
            }
            notification.remove();
        });
    },

    /**
     * Request notification permission
     */
    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    },

    /**
     * Create fallback messages HTML (when real-time fails)
     */
    createFallbackMessagesHTML() {
        return `
            <div class="p-6 text-center">
                <div class="mb-4">
                    <svg class="w-16 h-16 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">Messages</h3>
                <p class="text-slate-600 dark:text-slate-400 mb-4">Real-time messaging is currently unavailable.</p>
                <button onclick="location.reload()" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
                    Retry Connection
                </button>
            </div>
        `;
    },

    /**
     * Get messaging component instance
     */
    getMessagingComponent() {
        return this.messagingComponent;
    },

    /**
     * Get current unread count
     */
    getUnreadCount() {
        return this.unreadCount;
    },

    /**
     * Cleanup
     */
    destroy() {
        if (this.messagingComponent) {
            this.messagingComponent.destroy();
            this.messagingComponent = null;
        }
        this.isInitialized = false;
    }
};

// Auto-initialize when module loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await DashboardRealtimeMessages.init();
        
        // Request notification permission
        await DashboardRealtimeMessages.requestNotificationPermission();
        
    } catch (error) {
        console.warn('⚠️ Real-time messaging initialization failed:', error);
    }
});

// Export for use in dashboard
window.DashboardRealtimeMessages = DashboardRealtimeMessages;

export default DashboardRealtimeMessages;
