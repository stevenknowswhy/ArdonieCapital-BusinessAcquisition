/**
 * Enhanced Chat Integration for Buyer Dashboard
 * Replaces messaging system with comprehensive chat functionality
 * Integrates with new chat database schema and real-time features
 */

console.log('💬 Loading Enhanced Chat Integration...');

/**
 * Enhanced Chat Integration Service
 * Provides comprehensive chat functionality for the buyer dashboard
 */
const EnhancedChatIntegration = {
    // Service instances
    supabaseClient: null,
    currentUser: null,
    userProfile: null,
    isInitialized: false,
    
    // Current state
    conversations: [],
    currentConversation: null,
    unreadCount: 0,
    
    // Real-time subscriptions
    subscriptions: [],
    
    // Cache for performance
    cache: new Map(),
    cacheTimeout: 2 * 60 * 1000, // 2 minutes for chat

    /**
     * Initialize the chat integration
     */
    async init() {
        try {
            console.log('🔄 Initializing Enhanced Chat Integration...');
            
            // Get Supabase client from global or buyer dashboard integration
            if (window.BuyerDashboardSupabase && window.BuyerDashboardSupabase.supabaseClient) {
                this.supabaseClient = window.BuyerDashboardSupabase.supabaseClient;
                this.currentUser = window.BuyerDashboardSupabase.currentUser;
                this.userProfile = window.BuyerDashboardSupabase.userProfile;
            } else if (window.supabase) {
                this.supabaseClient = window.supabase;
                const { data: { user }, error } = await this.supabaseClient.auth.getUser();
                if (!error && user) {
                    this.currentUser = user;
                    await this.loadUserProfile();
                }
            } else {
                throw new Error('Supabase client not available');
            }

            if (!this.currentUser) {
                console.warn('⚠️ No authenticated user for chat');
                return false;
            }
            
            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();
            
            this.isInitialized = true;
            console.log('✅ Enhanced Chat Integration initialized');
            
            // Load initial data
            await this.loadConversations();
            await this.updateUnreadCount();
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Chat Integration:', error);
            return false;
        }
    },

    /**
     * Load user profile from database
     */
    async loadUserProfile() {
        try {
            const { data, error } = await this.supabaseClient
                .from('profiles')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) throw error;
            this.userProfile = data;
        } catch (error) {
            console.error('❌ Error loading user profile for chat:', error);
        }
    },

    /**
     * Setup real-time subscriptions for chat
     */
    setupRealtimeSubscriptions() {
        try {
            // Subscribe to chat messages for real-time updates
            const chatSubscription = this.supabaseClient
                .channel('enhanced-chat')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'chat_messages'
                }, (payload) => {
                    console.log('💬 Chat message update received:', payload);
                    this.handleChatUpdate(payload);
                })
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'chat_message_reads'
                }, (payload) => {
                    console.log('👁️ Chat read status update received:', payload);
                    this.handleReadStatusUpdate(payload);
                })
                .subscribe();

            this.subscriptions.push(chatSubscription);
            console.log('✅ Real-time chat subscriptions setup');
        } catch (error) {
            console.error('❌ Error setting up chat subscriptions:', error);
        }
    },

    /**
     * Handle real-time chat updates
     */
    async handleChatUpdate(payload) {
        const { eventType, new: newMessage } = payload;
        
        if (eventType === 'INSERT') {
            // Check if this message involves the current user
            const isRelevant = await this.isMessageRelevantToUser(newMessage);
            if (isRelevant) {
                await this.updateUnreadCount();
                await this.loadConversations();
                this.showChatNotification(newMessage);
            }
        }
    },

    /**
     * Handle read status updates
     */
    async handleReadStatusUpdate(payload) {
        const { eventType, new: readStatus } = payload;
        
        if (eventType === 'INSERT' && readStatus.user_id === this.currentUser.id) {
            await this.updateUnreadCount();
        }
    },

    /**
     * Check if message is relevant to current user
     */
    async isMessageRelevantToUser(message) {
        try {
            const { data, error } = await this.supabaseClient
                .from('chat_participants')
                .select('id')
                .eq('conversation_id', message.conversation_id)
                .eq('user_id', this.currentUser.id)
                .eq('is_active', true)
                .single();

            return !error && data;
        } catch (error) {
            return false;
        }
    },

    /**
     * Load conversations from database
     */
    async loadConversations() {
        try {
            // Get conversations where user is a participant
            const { data, error } = await this.supabaseClient
                .from('chat_conversations')
                .select(`
                    id,
                    title,
                    conversation_type,
                    created_at,
                    updated_at,
                    last_message_at,
                    chat_participants!inner (
                        user_id,
                        role,
                        last_read_at,
                        profiles (
                            id,
                            first_name,
                            last_name,
                            avatar_url,
                            company
                        )
                    )
                `)
                .eq('chat_participants.user_id', this.currentUser.id)
                .eq('chat_participants.is_active', true)
                .eq('is_active', true)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            // Process conversations to get other participants and last messages
            this.conversations = await Promise.all(data.map(async (conv) => {
                // Get other participants (not current user)
                const otherParticipants = conv.chat_participants.filter(p => p.user_id !== this.currentUser.id);
                
                // Get last message
                const { data: lastMessage } = await this.supabaseClient
                    .from('chat_messages')
                    .select(`
                        id,
                        message_content,
                        created_at,
                        sender_id,
                        profiles!chat_messages_sender_id_fkey (
                            first_name,
                            last_name
                        )
                    `)
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Get unread count for this conversation
                const unreadCount = await this.getUnreadCountForConversation(conv.id);

                return {
                    ...conv,
                    other_participants: otherParticipants,
                    last_message: lastMessage,
                    unread_count: unreadCount
                };
            }));

            this.renderConversationsList();
            console.log(`✅ Loaded ${this.conversations.length} chat conversations`);
        } catch (error) {
            console.error('❌ Error loading chat conversations:', error);
        }
    },

    /**
     * Get unread count for a specific conversation
     */
    async getUnreadCountForConversation(conversationId) {
        try {
            const { data, error } = await this.supabaseClient
                .from('chat_messages')
                .select(`
                    id,
                    chat_message_reads!left (
                        id
                    )
                `)
                .eq('conversation_id', conversationId)
                .neq('sender_id', this.currentUser.id)
                .is('chat_message_reads.id', null);

            if (error) throw error;
            return data.length;
        } catch (error) {
            console.error('❌ Error getting unread count for conversation:', error);
            return 0;
        }
    },

    /**
     * Render conversations list in dashboard
     */
    renderConversationsList() {
        const container = document.getElementById('chat-container');
        if (!container) return;

        if (this.conversations.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-slate-500 dark:text-slate-400">
                    <div class="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                    </div>
                    <p class="font-medium">No chat conversations yet</p>
                    <p class="text-sm mt-1">Start chatting with sellers to see conversations here</p>
                    <button onclick="window.location.href='../chat/compose.html'" class="mt-4 bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-dark transition-colors">
                        Start New Chat
                    </button>
                </div>
            `;
            return;
        }

        // Show only the 5 most recent conversations in dashboard
        const recentConversations = this.conversations.slice(0, 5);

        container.innerHTML = recentConversations.map(conversation => {
            const otherParticipant = conversation.other_participants[0];
            const lastMessage = conversation.last_message;
            const isUnread = conversation.unread_count > 0;
            
            const participantName = otherParticipant ? 
                `${otherParticipant.profiles.first_name} ${otherParticipant.profiles.last_name}`.trim() : 
                'Unknown User';
            
            const participantCompany = otherParticipant?.profiles?.company || '';
            
            return `
                <div class="chat-conversation-item p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer rounded-lg border border-slate-200 dark:border-slate-600 transition-colors ${isUnread ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''}"
                     onclick="EnhancedChatIntegration.openConversation('${conversation.id}')">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-sm font-medium text-white">
                                ${participantName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <h4 class="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    ${participantName}
                                </h4>
                                <span class="text-xs text-slate-500 dark:text-slate-400">
                                    ${this.formatChatTime(conversation.last_message_at)}
                                </span>
                            </div>
                            ${participantCompany ? `
                                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${participantCompany}</p>
                            ` : ''}
                            <p class="text-sm text-slate-600 dark:text-slate-300 truncate mt-1">
                                ${lastMessage ? 
                                    (lastMessage.sender_id === this.currentUser.id ? 'You: ' : '') + lastMessage.message_content :
                                    'No messages yet'
                                }
                            </p>
                            ${isUnread ? `
                                <div class="flex items-center justify-between mt-2">
                                    <span class="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                        ${conversation.unread_count} unread
                                    </span>
                                    <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Update unread chat count
     */
    async updateUnreadCount() {
        try {
            // Use the helper function from database
            const { data, error } = await this.supabaseClient
                .rpc('get_unread_chat_count', { user_uuid: this.currentUser.id });

            if (error) throw error;

            this.unreadCount = data || 0;

            // Update UI elements
            const unreadBadge = document.querySelector('[data-unread-count]');
            if (unreadBadge) {
                unreadBadge.textContent = this.unreadCount;
                unreadBadge.style.display = this.unreadCount > 0 ? 'block' : 'none';
            }

            // Update KPI card
            const kpiElement = document.querySelector('[data-kpi="unreadChat"] .kpi-value');
            if (kpiElement) {
                kpiElement.textContent = this.unreadCount;
            }

            // Update dashboard overview if available
            if (window.BuyerDashboardSupabase && window.BuyerDashboardSupabase.updateUnreadMessagesCount) {
                // Update the buyer dashboard integration with new count
                const element = document.querySelector('[data-kpi="unreadMessages"] .kpi-value');
                if (element) element.textContent = this.unreadCount;
            }

        } catch (error) {
            console.error('❌ Error updating unread chat count:', error);
        }
    },

    /**
     * Open a conversation (navigate to full chat interface)
     */
    openConversation(conversationId) {
        // Navigate to full chat interface with conversation selected
        window.location.href = `../chat/index.html?conversation=${conversationId}`;
    },

    /**
     * Show chat notification
     */
    showChatNotification(message) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                </div>
                <div class="flex-1">
                    <p class="font-medium text-sm">New Chat Message</p>
                    <p class="text-xs opacity-90 mt-1 truncate">${message.message_content}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    },

    /**
     * Format chat timestamp
     */
    formatChatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    },

    /**
     * Update dashboard UI with chat data
     */
    async updateDashboardChatUI() {
        try {
            console.log('🔄 Updating dashboard chat UI...');
            
            // Update conversations list
            await this.loadConversations();
            
            // Update unread count
            await this.updateUnreadCount();
            
            console.log('✅ Dashboard chat UI updated');
        } catch (error) {
            console.error('❌ Error updating dashboard chat UI:', error);
        }
    },

    /**
     * Cleanup subscriptions
     */
    cleanup() {
        this.subscriptions.forEach(subscription => {
            this.supabaseClient.removeChannel(subscription);
        });
        this.subscriptions = [];
        this.cache.clear();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for buyer dashboard to initialize first
    setTimeout(async () => {
        try {
            const initialized = await EnhancedChatIntegration.init();
            if (initialized) {
                console.log('✅ Enhanced Chat Integration ready');
                
                // Update dashboard UI
                await EnhancedChatIntegration.updateDashboardChatUI();
                
                // Set up periodic updates
                setInterval(() => {
                    EnhancedChatIntegration.updateDashboardChatUI();
                }, 30000); // Update every 30 seconds
            }
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Chat Integration:', error);
        }
    }, 1500); // Wait a bit longer for buyer dashboard
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    EnhancedChatIntegration.cleanup();
});

// Make available globally
window.EnhancedChatIntegration = EnhancedChatIntegration;
