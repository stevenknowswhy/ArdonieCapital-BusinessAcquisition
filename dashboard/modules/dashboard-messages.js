/**
 * Dashboard Messages Module
 * Enhanced messaging functionality with real-time capabilities
 * @author Ardonie Capital Development Team
 */

console.log('💬 Loading Dashboard Messages Module...');

/**
 * Messages management functions
 * Handles messaging interface, conversations, and file sharing
 */
const DashboardMessages = {
    /**
     * Create Enhanced Messages Section
     */
    createMessagesSection() {
        console.log('🔄 Creating enhanced messages section...');
        const container = document.getElementById('dashboard-sections');
        if (!container) {
            console.error('❌ Dashboard sections container not found!');
            return;
        }

        const section = document.createElement('div');
        section.id = 'messages-section';
        section.className = 'dashboard-section';
        section.style.display = 'none';

        section.innerHTML = this.createMessagesHTML();
        container.appendChild(section);

        // Load messages data
        this.loadMessagesData();

        console.log('✅ Enhanced messages section created');
    },

    /**
     * Create Messages HTML structure
     * @returns {string} HTML content for messages section
     */
    createMessagesHTML() {
        return `
            <!-- Messages Header -->
            <div class="mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Messages</h2>
                        <p class="text-slate-600 dark:text-slate-400">Communicate with sellers, brokers, and team members</p>
                    </div>
                    <div class="mt-4 lg:mt-0">
                        <button type="button" id="compose-message-btn" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            New Message
                        </button>
                    </div>
                </div>
            </div>

            <!-- Messages Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                <!-- Conversations List -->
                <div class="lg:col-span-1">
                    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                        <!-- Search and Filters -->
                        <div class="p-4 border-b border-slate-200 dark:border-slate-700">
                            <div class="relative mb-3">
                                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                                <input type="text"
                                       id="messages-search"
                                       placeholder="Search conversations..."
                                       class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm">
                            </div>
                            <div class="flex space-x-2">
                                <select id="message-filter" class="flex-1 px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                    <option value="">All Messages</option>
                                    <option value="unread">Unread</option>
                                    <option value="deals">Deal Related</option>
                                    <option value="support">Support</option>
                                </select>
                            </div>
                        </div>

                        <!-- Conversations List -->
                        <div id="conversations-list" class="flex-1 overflow-y-auto">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>
                </div>

                <!-- Message Thread -->
                <div class="lg:col-span-2">
                    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                        <!-- Thread Header -->
                        <div id="thread-header" class="p-4 border-b border-slate-200 dark:border-slate-700 hidden">
                            <!-- Will be populated when conversation is selected -->
                        </div>

                        <!-- Messages Area -->
                        <div id="messages-area" class="flex-1 overflow-y-auto p-4 space-y-4">
                            <!-- Default state -->
                            <div id="no-conversation-selected" class="h-full flex items-center justify-center text-center">
                                <div>
                                    <svg class="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                    <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">Select a conversation</h3>
                                    <p class="text-slate-600 dark:text-slate-400">Choose a conversation from the list to start messaging</p>
                                </div>
                            </div>
                        </div>

                        <!-- Message Composer -->
                        <div id="message-composer" class="p-4 border-t border-slate-200 dark:border-slate-700 hidden">
                            <div class="flex items-end space-x-3">
                                <!-- File Upload -->
                                <button type="button" id="attach-file-btn" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Attach File">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                    </svg>
                                </button>

                                <!-- Message Input -->
                                <div class="flex-1">
                                    <textarea id="message-input"
                                              placeholder="Type your message..."
                                              rows="1"
                                              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"></textarea>

                                    <!-- File Upload Preview -->
                                    <div id="file-preview" class="mt-2 hidden">
                                        <!-- File preview will be shown here -->
                                    </div>
                                </div>

                                <!-- Send Button -->
                                <button type="button" id="send-message-btn" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hidden file input -->
            <input type="file" id="file-input" class="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" multiple>

            <!-- Compose Message Modal -->
            <div id="compose-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">New Message</h3>
                                <button type="button" id="close-compose-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>

                            <form id="compose-form">
                                <div class="mb-4">
                                    <label for="recipient-select" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">To:</label>
                                    <select id="recipient-select" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                                        <option value="">Select recipient...</option>
                                        <option value="seller-1">Sarah Johnson (Premier Auto Service)</option>
                                        <option value="seller-2">David Wilson (Elite Collision Center)</option>
                                        <option value="broker-1">Amanda Foster (Business Broker)</option>
                                        <option value="support">Support Team</option>
                                    </select>
                                </div>

                                <div class="mb-4">
                                    <label for="subject-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject:</label>
                                    <input type="text" id="subject-input" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Enter subject...">
                                </div>

                                <div class="mb-6">
                                    <label for="message-content" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message:</label>
                                    <textarea id="message-content" rows="4" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Type your message..."></textarea>
                                </div>

                                <div class="flex justify-end space-x-3">
                                    <button type="button" id="cancel-compose" class="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">Send Message</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Load messages data
     */
    loadMessagesData() {
        const conversations = this.getMockConversationsData();
        this.renderConversationsList(conversations);
        console.log('✅ Messages data loaded');
    },

    /**
     * Render conversations list
     * @param {Array} conversations - Array of conversation objects
     */
    renderConversationsList(conversations) {
        const container = document.getElementById('conversations-list');
        if (!container) return;

        container.innerHTML = conversations.map(conv => this.createConversationItemHTML(conv)).join('');

        // Add click listeners to conversation items
        container.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const convId = item.getAttribute('data-conversation-id');
                this.selectConversation(convId);
            });
        });
    },

    /**
     * Create conversation item HTML
     * @param {Object} conversation - Conversation object
     * @returns {string} HTML for conversation item
     */
    createConversationItemHTML(conversation) {
        const timeAgo = this.formatTimeAgo(conversation.lastMessage.timestamp);
        const isUnread = conversation.unreadCount > 0;

        return `
            <div class="conversation-item p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors ${isUnread ? 'bg-blue-50 dark:bg-blue-900/20' : ''}"
                 data-conversation-id="${conversation.id}">
                <div class="flex items-start space-x-3">
                    <!-- Avatar -->
                    <div class="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
                            ${conversation.participant.name.split(' ').map(n => n[0]).join('')}
                        </span>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                            <h4 class="text-sm font-medium text-slate-900 dark:text-white truncate">
                                ${conversation.participant.name}
                            </h4>
                            <div class="flex items-center space-x-2">
                                ${conversation.dealRelated ? '<span class="w-2 h-2 bg-green-500 rounded-full" title="Deal Related"></span>' : ''}
                                ${isUnread ? `<span class="bg-primary text-white text-xs px-2 py-1 rounded-full">${conversation.unreadCount}</span>` : ''}
                            </div>
                        </div>

                        <p class="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            ${conversation.participant.role} • ${conversation.participant.business}
                        </p>

                        <p class="text-sm text-slate-600 dark:text-slate-400 truncate">
                            ${conversation.lastMessage.sender === 'you' ? 'You: ' : ''}${conversation.lastMessage.content}
                        </p>

                        <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            ${timeAgo}
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Select and display conversation
     * @param {string} conversationId - ID of conversation to select
     */
    selectConversation(conversationId) {
        // Update active state
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('bg-primary/10', 'border-primary');
        });

        const selectedItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('bg-primary/10', 'border-primary');
        }

        // Load conversation messages
        const conversation = this.getMockConversationsData().find(c => c.id === conversationId);
        if (conversation) {
            this.displayConversation(conversation);
        }

        console.log('📱 Selected conversation:', conversationId);
    },

    /**
     * Display conversation in message area
     * @param {Object} conversation - Conversation object
     */
    displayConversation(conversation) {
        // Show thread header
        const threadHeader = document.getElementById('thread-header');
        const noConversation = document.getElementById('no-conversation-selected');
        const messageComposer = document.getElementById('message-composer');

        if (threadHeader && noConversation && messageComposer) {
            threadHeader.classList.remove('hidden');
            noConversation.style.display = 'none';
            messageComposer.classList.remove('hidden');

            // Update header
            threadHeader.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
                                ${conversation.participant.name.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-900 dark:text-white">${conversation.participant.name}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-400">${conversation.participant.role} • ${conversation.participant.business}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${conversation.dealRelated ? `
                            <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                                Deal Related
                            </span>
                        ` : ''}
                        <button type="button" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="More Options">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            // Load and display messages
            this.loadConversationMessages(conversation.id);
        }
    },

    /**
     * Load conversation messages
     * @param {string} conversationId - ID of conversation
     */
    loadConversationMessages(conversationId) {
        const messages = this.getMockMessagesData(conversationId);
        this.renderMessages(messages);
    },

    /**
     * Render messages in the conversation
     * @param {Array} messages - Array of message objects
     */
    renderMessages(messages) {
        const messagesArea = document.getElementById('messages-area');
        if (!messagesArea) return;

        messagesArea.innerHTML = messages.map(message => this.createMessageHTML(message)).join('');

        // Scroll to bottom
        messagesArea.scrollTop = messagesArea.scrollHeight;
    },

    /**
     * Create message HTML
     * @param {Object} message - Message object
     * @returns {string} HTML for message
     */
    createMessageHTML(message) {
        const isYou = message.sender === 'you';
        const timeFormatted = this.formatTime(message.timestamp);

        return `
            <div class="flex ${isYou ? 'justify-end' : 'justify-start'}">
                <div class="max-w-xs lg:max-w-md">
                    <div class="flex items-end space-x-2 ${isYou ? 'flex-row-reverse space-x-reverse' : ''}">
                        ${!isYou ? `
                            <div class="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span class="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    ${message.sender === 'them' ? 'T' : 'S'}
                                </span>
                            </div>
                        ` : ''}

                        <div class="flex flex-col space-y-1">
                            <div class="px-4 py-2 rounded-lg ${isYou
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                            }">
                                <p class="text-sm">${message.content}</p>
                            </div>

                            ${message.attachments && message.attachments.length > 0 ? `
                                <div class="space-y-1">
                                    ${message.attachments.map(attachment => `
                                        <div class="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border ${isYou ? 'border-primary/20' : 'border-slate-200 dark:border-slate-600'}">
                                            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                            </svg>
                                            <div class="flex-1 min-w-0">
                                                <p class="text-xs font-medium text-slate-900 dark:text-white truncate">${attachment.name}</p>
                                                <p class="text-xs text-slate-500">${attachment.size}</p>
                                            </div>
                                            <button type="button" class="text-primary hover:text-primary-dark text-xs">Download</button>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}

                            <p class="text-xs text-slate-500 ${isYou ? 'text-right' : 'text-left'}">${timeFormatted}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Send message
     */
    sendMessage() {
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-message-btn');

        if (!messageInput || !sendBtn) return;

        const content = messageInput.value.trim();
        if (!content) return;

        // Disable send button temporarily
        sendBtn.disabled = true;

        // Create new message
        const newMessage = {
            id: `msg-${Date.now()}`,
            sender: 'you',
            content: content,
            timestamp: new Date(),
            attachments: []
        };

        // Add message to current conversation
        const messagesArea = document.getElementById('messages-area');
        if (messagesArea) {
            const messageHTML = this.createMessageHTML(newMessage);
            messagesArea.insertAdjacentHTML('beforeend', messageHTML);
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }

        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';

        // Re-enable send button
        sendBtn.disabled = false;
        this.toggleSendButton();

        // Simulate response
        setTimeout(() => {
            this.simulateResponse();
        }, 1000 + Math.random() * 2000);

        console.log('📤 Message sent:', content);
    },

    /**
     * Send new message from compose modal
     */
    sendNewMessage() {
        const recipientSelect = document.getElementById('recipient-select');
        const subjectInput = document.getElementById('subject-input');
        const messageContent = document.getElementById('message-content');
        const composeModal = document.getElementById('compose-modal');

        if (!recipientSelect || !subjectInput || !messageContent) return;

        const recipient = recipientSelect.value;
        const subject = subjectInput.value.trim();
        const content = messageContent.value.trim();

        if (!recipient || !content) {
            alert('Please select a recipient and enter a message.');
            return;
        }

        console.log('📤 New message sent:', { recipient, subject, content });

        // Clear form
        recipientSelect.value = '';
        subjectInput.value = '';
        messageContent.value = '';

        // Close modal
        if (composeModal) {
            composeModal.classList.add('hidden');
        }

        // Show success message
        this.showNotification('Message sent successfully!', 'success');
    },

    /**
     * Simulate response message
     */
    simulateResponse() {
        const responses = [
            "Thank you for your message. I'll get back to you shortly.",
            "That sounds great! Let me check my calendar and get back to you.",
            "I appreciate your interest. I'll prepare the documents you requested.",
            "Perfect! I'll coordinate with my team and send you an update."
        ];

        const responseMessage = {
            id: `msg-${Date.now()}`,
            sender: 'them',
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
            attachments: []
        };

        const messagesArea = document.getElementById('messages-area');
        if (messagesArea) {
            const messageHTML = this.createMessageHTML(responseMessage);
            messagesArea.insertAdjacentHTML('beforeend', messageHTML);
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }

        // Show notification
        this.showNotification('New message received', 'info');
    },

    /**
     * Handle file attachment
     * @param {FileList} files - Files to attach
     */
    handleFileAttachment(files) {
        if (!files || files.length === 0) return;

        const filePreview = document.getElementById('file-preview');
        if (!filePreview) return;

        // Show file preview
        filePreview.classList.remove('hidden');
        filePreview.innerHTML = Array.from(files).map(file => `
            <div class="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 dark:text-white truncate">${file.name}</p>
                    <p class="text-xs text-slate-500">${this.formatFileSize(file.size)}</p>
                </div>
                <button type="button" class="text-red-500 hover:text-red-700 text-xs" onclick="this.parentElement.remove()">Remove</button>
            </div>
        `).join('');

        console.log('📎 Files attached:', Array.from(files).map(f => f.name));
    },

    /**
     * Filter conversations
     */
    filterConversations() {
        const searchTerm = document.getElementById('messages-search')?.value.toLowerCase() || '';
        const filter = document.getElementById('message-filter')?.value || '';

        const conversations = this.getMockConversationsData();
        const filteredConversations = conversations.filter(conv => {
            // Search filter
            const matchesSearch = !searchTerm ||
                conv.participant.name.toLowerCase().includes(searchTerm) ||
                conv.participant.business.toLowerCase().includes(searchTerm) ||
                conv.lastMessage.content.toLowerCase().includes(searchTerm);

            // Category filter
            let matchesFilter = true;
            switch (filter) {
                case 'unread':
                    matchesFilter = conv.unreadCount > 0;
                    break;
                case 'deals':
                    matchesFilter = conv.dealRelated;
                    break;
                case 'support':
                    matchesFilter = conv.participant.role === 'Support';
                    break;
            }

            return matchesSearch && matchesFilter;
        });

        this.renderConversationsList(filteredConversations);
        console.log(`🔍 Filtered conversations: ${filteredConversations.length} of ${conversations.length} shown`);
    },

    /**
     * Toggle send button state
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

// Extend BuyerDashboard prototype with messages methods
if (typeof window !== 'undefined' && window.BuyerDashboard) {
    Object.assign(window.BuyerDashboard.prototype, DashboardMessages);
    console.log('✅ Dashboard Messages methods added to BuyerDashboard prototype');
} else {
    console.warn('⚠️ BuyerDashboard not available, messages methods not added');
}

// Update loading status
if (window.dashboardLoadingStatus) {
    window.dashboardLoadingStatus.modulesLoaded.messages = true;
}

console.log('✅ Dashboard Messages Module loaded');

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardMessages };
}