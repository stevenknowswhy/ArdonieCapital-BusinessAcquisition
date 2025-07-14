/**
 * Real-time Messaging Service
 * Handles all messaging functionality with Supabase real-time subscriptions
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

export class MessagingService {
    constructor() {
        this.client = null;
        this.subscriptions = new Map();
        this.messageCallbacks = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize messaging service
     */
    async init() {
        try {
            this.client = supabaseService.getClient();
            this.isInitialized = true;
            console.log('✅ Messaging service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize messaging service:', error);
            throw error;
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser() {
        try {
            const { data: { user } } = await this.client.auth.getUser();
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Get user profile
     */
    async getUserProfile(userId) {
        try {
            const { data, error } = await this.client
                .from('profiles')
                .select('id, first_name, last_name, avatar_url, company')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    /**
     * Send a message
     */
    async sendMessage(recipientId, content, subject = null, matchId = null) {
        try {
            if (!this.isInitialized) await this.init();

            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const userProfile = await this.getUserProfile(user.id);
            if (!userProfile) throw new Error('User profile not found');

            const messageData = {
                sender_id: userProfile.id,
                recipient_id: recipientId,
                content: content,
                subject: subject,
                match_id: matchId,
                status: 'sent',
                created_at: new Date().toISOString()
            };

            const { data, error } = await this.client
                .from('messages')
                .insert(messageData)
                .select(`
                    *,
                    sender:profiles!sender_id (
                        id, first_name, last_name, avatar_url, company
                    ),
                    recipient:profiles!recipient_id (
                        id, first_name, last_name, avatar_url, company
                    )
                `)
                .single();

            if (error) throw error;

            console.log('✅ Message sent successfully');
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error sending message:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get conversations for current user
     */
    async getConversations(limit = 20) {
        try {
            if (!this.isInitialized) await this.init();

            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const userProfile = await this.getUserProfile(user.id);
            if (!userProfile) throw new Error('User profile not found');

            // Get latest message for each conversation
            const { data, error } = await this.client
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id (
                        id, first_name, last_name, avatar_url, company
                    ),
                    recipient:profiles!recipient_id (
                        id, first_name, last_name, avatar_url, company
                    )
                `)
                .or(`sender_id.eq.${userProfile.id},recipient_id.eq.${userProfile.id}`)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // Group messages by conversation partner
            const conversations = new Map();
            
            data.forEach(message => {
                const partnerId = message.sender_id === userProfile.id 
                    ? message.recipient_id 
                    : message.sender_id;
                
                const partner = message.sender_id === userProfile.id 
                    ? message.recipient 
                    : message.sender;

                if (!conversations.has(partnerId)) {
                    conversations.set(partnerId, {
                        partnerId,
                        partner,
                        lastMessage: message,
                        unreadCount: 0,
                        messages: []
                    });
                }

                const conversation = conversations.get(partnerId);
                conversation.messages.push(message);

                // Count unread messages (messages sent to current user that haven't been read)
                if (message.recipient_id === userProfile.id && !message.read_at) {
                    conversation.unreadCount++;
                }
            });

            return { success: true, data: Array.from(conversations.values()) };
        } catch (error) {
            console.error('❌ Error getting conversations:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get messages for a specific conversation
     */
    async getConversationMessages(partnerId, limit = 50) {
        try {
            if (!this.isInitialized) await this.init();

            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const userProfile = await this.getUserProfile(user.id);
            if (!userProfile) throw new Error('User profile not found');

            const { data, error } = await this.client
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id (
                        id, first_name, last_name, avatar_url, company
                    ),
                    recipient:profiles!recipient_id (
                        id, first_name, last_name, avatar_url, company
                    )
                `)
                .or(`and(sender_id.eq.${userProfile.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userProfile.id})`)
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('❌ Error getting conversation messages:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark message as read
     */
    async markMessageAsRead(messageId) {
        try {
            if (!this.isInitialized) await this.init();

            const { data, error } = await this.client
                .from('messages')
                .update({ 
                    read_at: new Date().toISOString(),
                    status: 'read'
                })
                .eq('id', messageId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('❌ Error marking message as read:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark all messages in conversation as read
     */
    async markConversationAsRead(partnerId) {
        try {
            if (!this.isInitialized) await this.init();

            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const userProfile = await this.getUserProfile(user.id);
            if (!userProfile) throw new Error('User profile not found');

            const { data, error } = await this.client
                .from('messages')
                .update({ 
                    read_at: new Date().toISOString(),
                    status: 'read'
                })
                .eq('sender_id', partnerId)
                .eq('recipient_id', userProfile.id)
                .is('read_at', null);

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('❌ Error marking conversation as read:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Subscribe to real-time message updates
     */
    subscribeToMessages(callback) {
        try {
            if (!this.isInitialized) {
                console.warn('⚠️ Messaging service not initialized, initializing now...');
                this.init().then(() => this.subscribeToMessages(callback));
                return;
            }

            const channel = this.client
                .channel('messages_realtime')
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'messages' 
                    }, 
                    (payload) => {
                        console.log('📨 Real-time message update:', payload);
                        callback(payload);
                    }
                )
                .subscribe();

            this.subscriptions.set('messages', channel);
            console.log('✅ Subscribed to real-time messages');

            return channel;
        } catch (error) {
            console.error('❌ Error subscribing to messages:', error);
            return null;
        }
    }

    /**
     * Subscribe to user-specific message updates
     */
    async subscribeToUserMessages(callback) {
        try {
            if (!this.isInitialized) await this.init();

            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const userProfile = await this.getUserProfile(user.id);
            if (!userProfile) throw new Error('User profile not found');

            const channel = this.client
                .channel(`user_messages_${userProfile.id}`)
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'messages',
                        filter: `recipient_id=eq.${userProfile.id}`
                    }, 
                    (payload) => {
                        console.log('📨 User-specific message update:', payload);
                        callback(payload);
                    }
                )
                .subscribe();

            this.subscriptions.set(`user_messages_${userProfile.id}`, channel);
            console.log('✅ Subscribed to user-specific messages');

            return channel;
        } catch (error) {
            console.error('❌ Error subscribing to user messages:', error);
            return null;
        }
    }

    /**
     * Unsubscribe from real-time updates
     */
    unsubscribe(channelName) {
        try {
            const channel = this.subscriptions.get(channelName);
            if (channel) {
                this.client.removeChannel(channel);
                this.subscriptions.delete(channelName);
                console.log(`✅ Unsubscribed from ${channelName}`);
            }
        } catch (error) {
            console.error(`❌ Error unsubscribing from ${channelName}:`, error);
        }
    }

    /**
     * Unsubscribe from all channels
     */
    unsubscribeAll() {
        try {
            this.subscriptions.forEach((channel, name) => {
                this.client.removeChannel(channel);
                console.log(`✅ Unsubscribed from ${name}`);
            });
            this.subscriptions.clear();
        } catch (error) {
            console.error('❌ Error unsubscribing from all channels:', error);
        }
    }

    /**
     * Get unread message count
     */
    async getUnreadMessageCount() {
        try {
            if (!this.isInitialized) await this.init();

            const user = await this.getCurrentUser();
            if (!user) return { success: true, data: 0 };

            const userProfile = await this.getUserProfile(user.id);
            if (!userProfile) return { success: true, data: 0 };

            const { count, error } = await this.client
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('recipient_id', userProfile.id)
                .is('read_at', null);

            if (error) throw error;

            return { success: true, data: count || 0 };
        } catch (error) {
            console.error('❌ Error getting unread message count:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Search messages
     */
    async searchMessages(query, limit = 20) {
        try {
            if (!this.isInitialized) await this.init();

            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const userProfile = await this.getUserProfile(user.id);
            if (!userProfile) throw new Error('User profile not found');

            const { data, error } = await this.client
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id (
                        id, first_name, last_name, avatar_url, company
                    ),
                    recipient:profiles!recipient_id (
                        id, first_name, last_name, avatar_url, company
                    )
                `)
                .or(`sender_id.eq.${userProfile.id},recipient_id.eq.${userProfile.id}`)
                .ilike('content', `%${query}%`)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('❌ Error searching messages:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create singleton instance
let _messagingServiceInstance = null;

export const messagingService = {
    get instance() {
        if (!_messagingServiceInstance) {
            _messagingServiceInstance = new MessagingService();
        }
        return _messagingServiceInstance;
    },

    // Proxy methods for convenience
    async init() { return this.instance.init(); },
    async sendMessage(recipientId, content, subject, matchId) { 
        return this.instance.sendMessage(recipientId, content, subject, matchId); 
    },
    async getConversations(limit) { return this.instance.getConversations(limit); },
    async getConversationMessages(partnerId, limit) { 
        return this.instance.getConversationMessages(partnerId, limit); 
    },
    async markMessageAsRead(messageId) { return this.instance.markMessageAsRead(messageId); },
    async markConversationAsRead(partnerId) { return this.instance.markConversationAsRead(partnerId); },
    subscribeToMessages(callback) { return this.instance.subscribeToMessages(callback); },
    async subscribeToUserMessages(callback) { return this.instance.subscribeToUserMessages(callback); },
    unsubscribe(channelName) { return this.instance.unsubscribe(channelName); },
    unsubscribeAll() { return this.instance.unsubscribeAll(); },
    async getUnreadMessageCount() { return this.instance.getUnreadMessageCount(); },
    async searchMessages(query, limit) { return this.instance.searchMessages(query, limit); }
};
