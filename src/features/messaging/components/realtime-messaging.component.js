/**
 * Real-time Messaging Component
 * Handles real-time messaging UI with Supabase integration
 */

import { messagingService } from '../services/messaging.service.js';

export class RealtimeMessagingComponent {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.currentConversation = null;
        this.conversations = [];
        this.isInitialized = false;
        this.messageUpdateCallbacks = [];
    }

    /**
     * Initialize the messaging component
     */
    async init() {
        try {
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                throw new Error(`Container with ID ${this.containerId} not found`);
            }

            await messagingService.init();
            this.render();
            this.setupEventListeners();
            this.setupRealtimeSubscriptions();
            await this.loadConversations();

            this.isInitialized = true;
            console.log('✅ Real-time messaging component initialized');
        } catch (error) {
            console.error('❌ Failed to initialize messaging component:', error);
            throw error;
        }
    }

    /**
     * Render the messaging interface
     */
    render() {
        this.container.innerHTML = `
            <div class="messaging-container h-full flex">
                <!-- Conversations Sidebar -->
                <div class="conversations-sidebar w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Messages</h3>
                            <button id="compose-message-btn" class="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary-dark transition-colors">
                                New
                            </button>
                        </div>
                        <div class="relative">
                            <input type="text" id="search-messages" placeholder="Search conversations..." 
                                   class="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                            <svg class="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <div id="conversations-list" class="flex-1 overflow-y-auto">
                        <div class="p-4 text-center text-slate-500 dark:text-slate-400">
                            Loading conversations...
                        </div>
                    </div>
                </div>

                <!-- Message Area -->
                <div class="message-area flex-1 flex flex-col">
                    <div id="conversation-header" class="p-4 border-b border-slate-200 dark:border-slate-700 hidden">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center mr-3">
                                <span id="partner-avatar" class="text-sm font-medium text-slate-700 dark:text-slate-300"></span>
                            </div>
                            <div>
                                <h4 id="partner-name" class="font-medium text-slate-900 dark:text-white"></h4>
                                <p id="partner-company" class="text-sm text-slate-500 dark:text-slate-400"></p>
                            </div>
                        </div>
                    </div>

                    <div id="messages-area" class="flex-1 overflow-y-auto p-4 space-y-4">
                        <div class="text-center text-slate-500 dark:text-slate-400">
                            Select a conversation to start messaging
                        </div>
                    </div>

                    <div id="message-input-area" class="p-4 border-t border-slate-200 dark:border-slate-700 hidden">
                        <div class="flex space-x-2">
                            <input type="text" id="message-input" placeholder="Type your message..." 
                                   class="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                            <button id="send-message-btn" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Send message
        const sendBtn = document.getElementById('send-message-btn');
        const messageInput = document.getElementById('message-input');

        if (sendBtn && messageInput) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Search messages
        const searchInput = document.getElementById('search-messages');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchConversations(e.target.value);
            });
        }

        // Compose new message
        const composeBtn = document.getElementById('compose-message-btn');
        if (composeBtn) {
            composeBtn.addEventListener('click', () => this.showComposeModal());
        }
    }

    /**
     * Setup real-time subscriptions
     */
    setupRealtimeSubscriptions() {
        // Subscribe to user-specific messages
        messagingService.subscribeToUserMessages((payload) => {
            this.handleRealtimeMessage(payload);
        });

        console.log('✅ Real-time subscriptions setup complete');
    }

    /**
     * Handle real-time message updates
     */
    handleRealtimeMessage(payload) {
        console.log('📨 Real-time message received:', payload);

        if (payload.eventType === 'INSERT') {
            // New message received
            this.handleNewMessage(payload.new);
        } else if (payload.eventType === 'UPDATE') {
            // Message updated (e.g., marked as read)
            this.handleMessageUpdate(payload.new);
        }

        // Notify callbacks
        this.messageUpdateCallbacks.forEach(callback => {
            try {
                callback(payload);
            } catch (error) {
                console.error('Error in message update callback:', error);
            }
        });
    }

    /**
     * Handle new message
     */
    async handleNewMessage(message) {
        // Reload conversations to update unread counts
        await this.loadConversations();

        // If this message is for the current conversation, add it to the display
        if (this.currentConversation && 
            (message.sender_id === this.currentConversation.partnerId || 
             message.recipient_id === this.currentConversation.partnerId)) {
            
            await this.loadConversationMessages(this.currentConversation.partnerId);
            
            // Mark as read if conversation is open
            if (message.recipient_id !== this.currentConversation.partnerId) {
                await messagingService.markMessageAsRead(message.id);
            }
        }

        // Show notification for new messages
        this.showMessageNotification(message);
    }

    /**
     * Handle message update
     */
    handleMessageUpdate(message) {
        // Update message status in UI if needed
        const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageElement && message.read_at) {
            messageElement.classList.add('read');
        }
    }

    /**
     * Load conversations
     */
    async loadConversations() {
        try {
            const result = await messagingService.getConversations();
            
            if (result.success) {
                this.conversations = result.data;
                this.renderConversations();
            } else {
                console.error('Failed to load conversations:', result.error);
                this.showError('Failed to load conversations');
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.showError('Error loading conversations');
        }
    }

    /**
     * Render conversations list
     */
    renderConversations() {
        const conversationsList = document.getElementById('conversations-list');
        if (!conversationsList) return;

        if (this.conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="p-4 text-center text-slate-500 dark:text-slate-400">
                    No conversations yet
                </div>
            `;
            return;
        }

        conversationsList.innerHTML = this.conversations.map(conversation => {
            const partner = conversation.partner;
            const lastMessage = conversation.lastMessage;
            const unreadCount = conversation.unreadCount;
            
            return `
                <div class="conversation-item p-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${this.currentConversation?.partnerId === conversation.partnerId ? 'bg-primary/10' : ''}"
                     data-partner-id="${conversation.partnerId}">
                    <div class="flex items-start space-x-3">
                        <div class="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
                                ${partner.first_name?.[0] || 'U'}${partner.last_name?.[0] || ''}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <h4 class="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    ${partner.first_name} ${partner.last_name}
                                </h4>
                                ${unreadCount > 0 ? `
                                    <span class="bg-primary text-white text-xs rounded-full px-2 py-1 ml-2">
                                        ${unreadCount}
                                    </span>
                                ` : ''}
                            </div>
                            ${partner.company ? `
                                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    ${partner.company}
                                </p>
                            ` : ''}
                            <p class="text-sm text-slate-600 dark:text-slate-300 truncate mt-1">
                                ${lastMessage.content}
                            </p>
                            <p class="text-xs text-slate-400 mt-1">
                                ${this.formatTime(lastMessage.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners to conversation items
        conversationsList.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const partnerId = item.dataset.partnerId;
                this.openConversation(partnerId);
            });
        });
    }

    /**
     * Open a conversation
     */
    async openConversation(partnerId) {
        try {
            const conversation = this.conversations.find(c => c.partnerId === partnerId);
            if (!conversation) return;

            this.currentConversation = conversation;
            
            // Update UI
            this.showConversationHeader(conversation.partner);
            await this.loadConversationMessages(partnerId);
            this.showMessageInputArea();

            // Mark conversation as read
            await messagingService.markConversationAsRead(partnerId);
            
            // Update conversations list to remove unread indicators
            await this.loadConversations();

        } catch (error) {
            console.error('Error opening conversation:', error);
            this.showError('Error opening conversation');
        }
    }

    /**
     * Load messages for a conversation
     */
    async loadConversationMessages(partnerId) {
        try {
            const result = await messagingService.getConversationMessages(partnerId);
            
            if (result.success) {
                this.renderMessages(result.data);
            } else {
                console.error('Failed to load messages:', result.error);
                this.showError('Failed to load messages');
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showError('Error loading messages');
        }
    }

    /**
     * Render messages
     */
    renderMessages(messages) {
        const messagesArea = document.getElementById('messages-area');
        if (!messagesArea) return;

        if (messages.length === 0) {
            messagesArea.innerHTML = `
                <div class="text-center text-slate-500 dark:text-slate-400">
                    No messages yet. Start the conversation!
                </div>
            `;
            return;
        }

        messagesArea.innerHTML = messages.map(message => {
            const isCurrentUser = message.sender_id !== this.currentConversation.partnerId;
            
            return `
                <div class="flex ${isCurrentUser ? 'justify-end' : 'justify-start'}" data-message-id="${message.id}">
                    <div class="max-w-xs lg:max-w-md">
                        <div class="flex items-end space-x-2 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}">
                            ${!isCurrentUser ? `
                                <div class="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span class="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        ${message.sender.first_name?.[0] || 'U'}
                                    </span>
                                </div>
                            ` : ''}
                            <div class="px-4 py-2 rounded-lg ${isCurrentUser 
                                ? 'bg-primary text-white' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                            }">
                                <p class="text-sm">${message.content}</p>
                                <p class="text-xs mt-1 ${isCurrentUser ? 'text-primary-light' : 'text-slate-500 dark:text-slate-400'}">
                                    ${this.formatTime(message.created_at)}
                                    ${message.read_at && isCurrentUser ? ' • Read' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    /**
     * Send a message
     */
    async sendMessage() {
        try {
            const messageInput = document.getElementById('message-input');
            const sendBtn = document.getElementById('send-message-btn');
            
            if (!messageInput || !sendBtn || !this.currentConversation) return;

            const content = messageInput.value.trim();
            if (!content) return;

            // Disable input temporarily
            sendBtn.disabled = true;
            messageInput.disabled = true;

            const result = await messagingService.sendMessage(
                this.currentConversation.partnerId,
                content
            );

            if (result.success) {
                messageInput.value = '';
                // Message will be added via real-time subscription
            } else {
                console.error('Failed to send message:', result.error);
                this.showError('Failed to send message');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Error sending message');
        } finally {
            // Re-enable input
            const messageInput = document.getElementById('message-input');
            const sendBtn = document.getElementById('send-message-btn');
            if (messageInput && sendBtn) {
                sendBtn.disabled = false;
                messageInput.disabled = false;
                messageInput.focus();
            }
        }
    }

    /**
     * Show conversation header
     */
    showConversationHeader(partner) {
        const header = document.getElementById('conversation-header');
        const partnerAvatar = document.getElementById('partner-avatar');
        const partnerName = document.getElementById('partner-name');
        const partnerCompany = document.getElementById('partner-company');

        if (header && partnerAvatar && partnerName && partnerCompany) {
            partnerAvatar.textContent = `${partner.first_name?.[0] || 'U'}${partner.last_name?.[0] || ''}`;
            partnerName.textContent = `${partner.first_name} ${partner.last_name}`;
            partnerCompany.textContent = partner.company || '';
            header.classList.remove('hidden');
        }
    }

    /**
     * Show message input area
     */
    showMessageInputArea() {
        const inputArea = document.getElementById('message-input-area');
        if (inputArea) {
            inputArea.classList.remove('hidden');
        }
    }

    /**
     * Search conversations
     */
    async searchConversations(query) {
        if (!query.trim()) {
            this.renderConversations();
            return;
        }

        try {
            const result = await messagingService.searchMessages(query);
            
            if (result.success) {
                // Group search results by conversation
                const searchResults = new Map();
                
                result.data.forEach(message => {
                    const partnerId = message.sender_id === this.currentConversation?.partnerId 
                        ? message.recipient_id 
                        : message.sender_id;
                    
                    if (!searchResults.has(partnerId)) {
                        searchResults.set(partnerId, {
                            partnerId,
                            partner: message.sender_id === this.currentConversation?.partnerId 
                                ? message.recipient 
                                : message.sender,
                            lastMessage: message,
                            unreadCount: 0
                        });
                    }
                });

                this.conversations = Array.from(searchResults.values());
                this.renderConversations();
            }
        } catch (error) {
            console.error('Error searching conversations:', error);
        }
    }

    /**
     * Show compose modal
     */
    showComposeModal() {
        // TODO: Implement compose modal for new conversations
        console.log('Compose modal not yet implemented');
    }

    /**
     * Show message notification
     */
    showMessageNotification(message) {
        // TODO: Implement browser notifications
        console.log('New message notification:', message);
    }

    /**
     * Show error message
     */
    showError(message) {
        // TODO: Implement proper error display
        console.error('Messaging error:', message);
    }

    /**
     * Format time for display
     */
    formatTime(timestamp) {
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
    }

    /**
     * Add message update callback
     */
    onMessageUpdate(callback) {
        this.messageUpdateCallbacks.push(callback);
    }

    /**
     * Get unread message count
     */
    async getUnreadCount() {
        return await messagingService.getUnreadMessageCount();
    }

    /**
     * Cleanup
     */
    destroy() {
        messagingService.unsubscribeAll();
        this.messageUpdateCallbacks = [];
        this.isInitialized = false;
    }
}

export default RealtimeMessagingComponent;
