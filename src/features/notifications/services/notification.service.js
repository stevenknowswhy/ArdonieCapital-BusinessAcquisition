/**
 * Notification Service
 * Handles real-time notifications using Supabase
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

export class NotificationService {
    constructor() {
        this.client = null;
        this.subscriptions = new Map();
        this.notificationCallbacks = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize notification service
     */
    async init() {
        try {
            this.client = supabaseService.getClient();
            this.isInitialized = true;
            console.log('✅ Notification service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize notification service:', error);
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
                .select('id, first_name, last_name, avatar_url')
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
     * Create a notification
     */
    async createNotification(userId, type, title, message, data = null) {
        try {
            if (!this.isInitialized) await this.init();

            const notificationData = {
                user_id: userId,
                type: type,
                title: title,
                message: message,
                data: data,
                read: false,
                created_at: new Date().toISOString()
            };

            const { data, error } = await this.client
                .from('notifications')
                .insert(notificationData)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Notification created successfully');
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error creating notification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get notifications for current user
     */
    async getNotifications(limit = 20, unreadOnly = false) {
        try {
            if (!this.isInitialized) await this.init();

            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const userProfile = await this.getUserProfile(user.id);
            if (!userProfile) throw new Error('User profile not found');

            let query = this.client
                .from('notifications')
                .select('*')
                .eq('user_id', userProfile.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (unreadOnly) {
                query = query.eq('read', false);
            }

            const { data, error } = await query;

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('❌ Error getting notifications:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        try {
            if (!this.isInitialized) await this.init();

            const { data, error } = await this.client
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        try {
            if (!this.isInitialized) await this.init();

            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const userProfile = await this.getUserProfile(user.id);
            if (!userProfile) throw new Error('User profile not found');

            const { data, error } = await this.client
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userProfile.id)
                .eq('read', false);

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('❌ Error marking all notifications as read:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId) {
        try {
            if (!this.isInitialized) await this.init();

            const { error } = await this.client
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting notification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount() {
        try {
            if (!this.isInitialized) await this.init();

            const user = await this.getCurrentUser();
            if (!user) return { success: true, data: 0 };

            const userProfile = await this.getUserProfile(user.id);
            if (!userProfile) return { success: true, data: 0 };

            const { count, error } = await this.client
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userProfile.id)
                .eq('read', false);

            if (error) throw error;

            return { success: true, data: count || 0 };
        } catch (error) {
            console.error('❌ Error getting unread count:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Subscribe to real-time notification updates
     */
    async subscribeToNotifications(callback) {
        try {
            if (!this.isInitialized) await this.init();

            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const userProfile = await this.getUserProfile(user.id);
            if (!userProfile) throw new Error('User profile not found');

            const channel = this.client
                .channel(`user_notifications_${userProfile.id}`)
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'notifications',
                        filter: `user_id=eq.${userProfile.id}`
                    }, 
                    (payload) => {
                        console.log('🔔 Real-time notification update:', payload);
                        callback(payload);
                    }
                )
                .subscribe();

            this.subscriptions.set(`user_notifications_${userProfile.id}`, channel);
            console.log('✅ Subscribed to user notifications');

            return channel;
        } catch (error) {
            console.error('❌ Error subscribing to notifications:', error);
            return null;
        }
    }

    /**
     * Unsubscribe from notifications
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
     * Send notification to user
     */
    async sendNotificationToUser(userId, type, title, message, data = null) {
        return await this.createNotification(userId, type, title, message, data);
    }

    /**
     * Send message notification
     */
    async sendMessageNotification(recipientId, senderName, messageContent) {
        const title = `New message from ${senderName}`;
        const message = messageContent.length > 100 
            ? messageContent.substring(0, 100) + '...' 
            : messageContent;

        return await this.createNotification(
            recipientId,
            'message',
            title,
            message,
            { type: 'message', sender: senderName }
        );
    }

    /**
     * Send match notification
     */
    async sendMatchNotification(userId, matchData) {
        const title = 'New Match Found!';
        const message = `You have a new match for ${matchData.listingTitle}`;

        return await this.createNotification(
            userId,
            'match',
            title,
            message,
            { type: 'match', matchId: matchData.id }
        );
    }

    /**
     * Send listing notification
     */
    async sendListingNotification(userId, listingData, action) {
        let title, message;

        switch (action) {
            case 'approved':
                title = 'Listing Approved';
                message = `Your listing "${listingData.title}" has been approved and is now live.`;
                break;
            case 'rejected':
                title = 'Listing Needs Review';
                message = `Your listing "${listingData.title}" needs some updates before approval.`;
                break;
            case 'inquiry':
                title = 'New Inquiry';
                message = `Someone is interested in your listing "${listingData.title}".`;
                break;
            default:
                title = 'Listing Update';
                message = `Your listing "${listingData.title}" has been updated.`;
        }

        return await this.createNotification(
            userId,
            'listing',
            title,
            message,
            { type: 'listing', listingId: listingData.id, action }
        );
    }
}

// Create singleton instance
let _notificationServiceInstance = null;

export const notificationService = {
    get instance() {
        if (!_notificationServiceInstance) {
            _notificationServiceInstance = new NotificationService();
        }
        return _notificationServiceInstance;
    },

    // Proxy methods for convenience
    async init() { return this.instance.init(); },
    async createNotification(userId, type, title, message, data) { 
        return this.instance.createNotification(userId, type, title, message, data); 
    },
    async getNotifications(limit, unreadOnly) { return this.instance.getNotifications(limit, unreadOnly); },
    async markAsRead(notificationId) { return this.instance.markAsRead(notificationId); },
    async markAllAsRead() { return this.instance.markAllAsRead(); },
    async deleteNotification(notificationId) { return this.instance.deleteNotification(notificationId); },
    async getUnreadCount() { return this.instance.getUnreadCount(); },
    async subscribeToNotifications(callback) { return this.instance.subscribeToNotifications(callback); },
    unsubscribe(channelName) { return this.instance.unsubscribe(channelName); },
    unsubscribeAll() { return this.instance.unsubscribeAll(); },
    async sendNotificationToUser(userId, type, title, message, data) { 
        return this.instance.sendNotificationToUser(userId, type, title, message, data); 
    },
    async sendMessageNotification(recipientId, senderName, messageContent) { 
        return this.instance.sendMessageNotification(recipientId, senderName, messageContent); 
    },
    async sendMatchNotification(userId, matchData) { 
        return this.instance.sendMatchNotification(userId, matchData); 
    },
    async sendListingNotification(userId, listingData, action) { 
        return this.instance.sendListingNotification(userId, listingData, action); 
    }
};
