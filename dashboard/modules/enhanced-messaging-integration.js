/**
 * Enhanced Messaging Integration for Buyer Dashboard
 * Consolidates and improves messaging functionality with real-time updates
 * Integrates with existing Supabase messaging system
 */

console.log('💬 Loading Enhanced Messaging Integration...');

/**
 * Enhanced Messaging Integration Service
 * Provides comprehensive messaging functionality for the buyer dashboard
 */
const EnhancedMessagingIntegration = {
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
    cacheTimeout: 2 * 60 * 1000, // 2 minutes for messages

    /**
     * Initialize the messaging integration
     */
    async init() {
        try {
            console.log('🔄 Initializing Enhanced Messaging Integration...');
            
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
                console.warn('⚠️ No authenticated user for messaging');
                return false;
            }
            
            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Enhanced Messaging Integration initialized');
            
            // Load initial data
            await this.loadConversations();
            await this.updateUnreadCount();
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Messaging Integration:', error);
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
            console.error('❌ Error loading user profile for messaging:', error);
        }
    },

    /**
     * Setup real-time subscriptions for messaging
     */
    setupRealtimeSubscriptions() {
        try {
            // Subscribe to messages for real-time updates
            const messagesSubscription = this.supabaseClient
                .channel('enhanced-messaging')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `or(sender_id.eq.${this.currentUser.id},recipient_id.eq.${this.currentUser.id})`
                }, (payload) => {
                    console.log('💬 Message update received:', payload);
                    this.handleMessageUpdate(payload);
                })
                .subscribe();

            this.subscriptions.push(messagesSubscription);
            console.log('✅ Real-time messaging subscriptions setup');
        } catch (error) {
            console.error('❌ Error setting up messaging subscriptions:', error);
        }
    },

    /**
     * Handle real-time message updates
     */
    async handleMessageUpdate(payload) {
        const { eventType, new: newMessage, old: oldMessage } = payload;
        
        switch (eventType) {
            case 'INSERT':
                // New message received
                if (newMessage.recipient_id === this.currentUser.id) {
                    await this.updateUnreadCount();
                    this.showMessageNotification(newMessage);
                }
                
                // Update conversations list
                await this.loadConversations();
                
                // If viewing the conversation, add the message
                if (this.currentConversation && 
                    (newMessage.sender_id === this.currentConversation.other_user_id || 
                     newMessage.recipient_id === this.currentConversation.other_user_id)) {
                    await this.loadConversationMessages(this.currentConversation.id);
                }
                break;
                
            case 'UPDATE':
                // Message status updated (read, etc.)
                if (oldMessage.is_read !== newMessage.is_read) {
                    await this.updateUnreadCount();
                }
                break;
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Message compose button
        const composeBtn = document.getElementById('compose-message-btn');
        if (composeBtn) {
            composeBtn.addEventListener('click', () => this.openComposeModal());
        }

        // Send message button
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Message input enter key
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Search conversations
        const searchInput = document.getElementById('search-messages');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterConversations(e.target.value);
            });
        }
    },

    /**
     * Load conversations from database
     */
    async loadConversations() {
        try {
            // Get all conversations for the current user
            const { data, error } = await this.supabaseClient
                .from('messages')
                .select(`
                    id,
                    sender_id,
                    recipient_id,
                    subject,
                    content,
                    is_read,
                    created_at,
                    sender:profiles!messages_sender_id_fkey (
                        id,
                        first_name,
                        last_name,
                        avatar_url,
                        company
                    ),
                    recipient:profiles!messages_recipient_id_fkey (
                        id,
                        first_name,
                        last_name,
                        avatar_url,
                        company
                    )
                `)
                .or(`sender_id.eq.${this.currentUser.id},recipient_id.eq.${this.currentUser.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Group messages by conversation
            const conversationMap = new Map();
            
            data.forEach(message => {
                const isFromCurrentUser = message.sender_id === this.currentUser.id;
                const otherUserId = isFromCurrentUser ? message.recipient_id : message.sender_id;
                const otherUser = isFromCurrentUser ? message.recipient : message.sender;
                
                const conversationKey = `${Math.min(this.currentUser.id, otherUserId)}-${Math.max(this.currentUser.id, otherUserId)}`;
                
                if (!conversationMap.has(conversationKey)) {
                    conversationMap.set(conversationKey, {
                        id: conversationKey,
                        other_user_id: otherUserId,
                        other_user: otherUser,
                        last_message: message,
                        unread_count: 0,
                        messages: []
                    });
                }
                
                const conversation = conversationMap.get(conversationKey);
                conversation.messages.push(message);
                
                // Count unread messages from other user
                if (!isFromCurrentUser && !message.is_read) {
                    conversation.unread_count++;
                }
            });

            this.conversations = Array.from(conversationMap.values());
            this.renderConversationsList();
            
            console.log(`✅ Loaded ${this.conversations.length} conversations`);
        } catch (error) {
            console.error('❌ Error loading conversations:', error);
        }
    },

    /**
     * Render conversations list
     */
    renderConversationsList() {
        const container = document.getElementById('conversations-list');
        if (!container) return;

        if (this.conversations.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p>No conversations yet</p>
                    <p class="text-sm">Start messaging sellers to see conversations here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.conversations.map(conversation => {
            const otherUser = conversation.other_user;
            const lastMessage = conversation.last_message;
            const isUnread = conversation.unread_count > 0;
            
            return `
                <div class="conversation-item p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-200 dark:border-slate-600 ${isUnread ? 'bg-blue-50 dark:bg-blue-900/20' : ''}"
                     onclick="EnhancedMessagingIntegration.selectConversation('${conversation.id}')">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
                                ${otherUser?.first_name?.[0] || 'U'}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <h4 class="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    ${otherUser?.first_name} ${otherUser?.last_name}
                                </h4>
                                <span class="text-xs text-slate-500 dark:text-slate-400">
                                    ${this.formatMessageTime(lastMessage.created_at)}
                                </span>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-slate-300 truncate">
                                ${lastMessage.subject || lastMessage.content}
                            </p>
                            ${isUnread ? `
                                <div class="flex items-center justify-between mt-1">
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
     * Select and load a conversation
     */
    async selectConversation(conversationId) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation) return;

        this.currentConversation = conversation;
        
        // Mark messages as read
        await this.markConversationAsRead(conversation);
        
        // Load and display messages
        await this.loadConversationMessages(conversationId);
        
        // Show message input area
        const inputArea = document.getElementById('message-input-area');
        if (inputArea) {
            inputArea.classList.remove('hidden');
        }
        
        // Update conversation list to remove unread indicators
        this.renderConversationsList();
    },

    /**
     * Load messages for a specific conversation
     */
    async loadConversationMessages(conversationId) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation) return;

        const messagesArea = document.getElementById('messages-area');
        if (!messagesArea) return;

        // Sort messages by creation time
        const sortedMessages = conversation.messages.sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
        );

        messagesArea.innerHTML = sortedMessages.map(message => {
            const isFromCurrentUser = message.sender_id === this.currentUser.id;
            const user = isFromCurrentUser ? message.sender : message.recipient;
            
            return `
                <div class="flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}" data-message-id="${message.id}">
                    <div class="max-w-xs lg:max-w-md">
                        <div class="flex items-end space-x-2 ${isFromCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}">
                            ${!isFromCurrentUser ? `
                                <div class="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span class="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        ${user?.first_name?.[0] || 'U'}
                                    </span>
                                </div>
                            ` : ''}
                            <div class="px-4 py-2 rounded-lg ${isFromCurrentUser 
                                ? 'bg-primary text-white' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                            }">
                                ${message.subject ? `<p class="text-xs font-medium mb-1 opacity-75">${message.subject}</p>` : ''}
                                <p class="text-sm">${message.content}</p>
                                <p class="text-xs mt-1 opacity-75">
                                    ${this.formatMessageTime(message.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        messagesArea.scrollTop = messagesArea.scrollHeight;
    },

    /**
     * Mark conversation as read
     */
    async markConversationAsRead(conversation) {
        try {
            const unreadMessageIds = conversation.messages
                .filter(msg => msg.recipient_id === this.currentUser.id && !msg.is_read)
                .map(msg => msg.id);

            if (unreadMessageIds.length === 0) return;

            const { error } = await this.supabaseClient
                .from('messages')
                .update({ is_read: true })
                .in('id', unreadMessageIds);

            if (error) throw error;

            // Update local state
            conversation.messages.forEach(msg => {
                if (unreadMessageIds.includes(msg.id)) {
                    msg.is_read = true;
                }
            });
            conversation.unread_count = 0;

            // Update global unread count
            await this.updateUnreadCount();

        } catch (error) {
            console.error('❌ Error marking conversation as read:', error);
        }
    },

    /**
     * Send a new message
     */
    async sendMessage() {
        if (!this.currentConversation) return;

        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;

        const content = messageInput.value.trim();
        if (!content) return;

        try {
            const { data, error } = await this.supabaseClient
                .from('messages')
                .insert({
                    sender_id: this.currentUser.id,
                    recipient_id: this.currentConversation.other_user_id,
                    content: content,
                    is_read: false
                })
                .select(`
                    *,
                    sender:profiles!messages_sender_id_fkey (
                        id, first_name, last_name, avatar_url
                    ),
                    recipient:profiles!messages_recipient_id_fkey (
                        id, first_name, last_name, avatar_url
                    )
                `)
                .single();

            if (error) throw error;

            // Clear input
            messageInput.value = '';

            // Add message to current conversation
            this.currentConversation.messages.push(data);
            this.currentConversation.last_message = data;

            // Reload conversation messages
            await this.loadConversationMessages(this.currentConversation.id);

            console.log('✅ Message sent successfully');

        } catch (error) {
            console.error('❌ Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    },

    /**
     * Update unread messages count
     */
    async updateUnreadCount() {
        try {
            const { count, error } = await this.supabaseClient
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('recipient_id', this.currentUser.id)
                .eq('is_read', false);

            if (error) throw error;

            this.unreadCount = count || 0;

            // Update UI elements
            const unreadBadge = document.querySelector('[data-unread-count]');
            if (unreadBadge) {
                unreadBadge.textContent = this.unreadCount;
                unreadBadge.style.display = this.unreadCount > 0 ? 'block' : 'none';
            }

            // Update KPI card if available
            const kpiElement = document.querySelector('[data-kpi="unreadMessages"] .kpi-value');
            if (kpiElement) {
                kpiElement.textContent = this.unreadCount;
            }

        } catch (error) {
            console.error('❌ Error updating unread count:', error);
        }
    },

    /**
     * Show message notification
     */
    showMessageNotification(message) {
        // Only show notification if not currently viewing the conversation
        if (this.currentConversation && 
            message.sender_id === this.currentConversation.other_user_id) {
            return;
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span>New message received</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    /**
     * Format message timestamp
     */
    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    },

    /**
     * Filter conversations by search term
     */
    filterConversations(searchTerm) {
        const items = document.querySelectorAll('.conversation-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(searchTerm.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    },

    /**
     * Open compose message modal
     */
    openComposeModal() {
        // This would open a modal to compose a new message
        // For now, redirect to the compose page
        window.location.href = '../messages/compose.html';
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
            const initialized = await EnhancedMessagingIntegration.init();
            if (initialized) {
                console.log('✅ Enhanced Messaging Integration ready');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Messaging Integration:', error);
        }
    }, 1000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    EnhancedMessagingIntegration.cleanup();
});

// Make available globally
window.EnhancedMessagingIntegration = EnhancedMessagingIntegration;
