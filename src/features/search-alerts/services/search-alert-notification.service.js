/**
 * Search Alert Notification Service
 * Background service to check for new listings matching saved search criteria
 * Sends notifications to users when matches are found
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';
import { notificationService } from '../../notifications/services/notification.service.js';

class SearchAlertNotificationService {
    constructor() {
        this.savedSearchesTable = 'saved_searches';
        this.listingsTable = 'listings';
        this.notificationsTable = 'notifications';
        this.isInitialized = false;
        this.client = null;
        this.processingInterval = null;
        this.processingIntervalMs = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Initialize the service
     */
    async init() {
        try {
            this.client = supabaseService.getClient();
            this.isInitialized = true;
            console.log('✅ Search Alert Notification Service initialized');
        } catch (error) {
            console.error('❌ Search Alert Notification Service initialization failed:', error);
            throw error;
        }
    }

    /**
     * Start the background processing of search alerts
     */
    startProcessing() {
        if (this.processingInterval) {
            this.stopProcessing();
        }

        console.log('🔄 Starting search alert processing...');
        
        // Process immediately, then set interval
        this.processAllSearchAlerts();
        
        this.processingInterval = setInterval(() => {
            this.processAllSearchAlerts();
        }, this.processingIntervalMs);
    }

    /**
     * Stop the background processing
     */
    stopProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
            console.log('⏹️ Search alert processing stopped');
        }
    }

    /**
     * Process all active search alerts
     */
    async processAllSearchAlerts() {
        try {
            if (!this.isInitialized) await this.init();

            console.log('🔍 Processing search alerts...');

            // Get all active search alerts that need checking
            const alertsToProcess = await this.getAlertsToProcess();
            
            if (alertsToProcess.length === 0) {
                console.log('📭 No search alerts to process');
                return;
            }

            console.log(`📬 Processing ${alertsToProcess.length} search alerts`);

            // Process each alert
            for (const alert of alertsToProcess) {
                await this.processSearchAlert(alert);
                
                // Small delay between processing alerts to avoid overwhelming the system
                await this.delay(100);
            }

            console.log('✅ Search alert processing completed');

        } catch (error) {
            console.error('❌ Error processing search alerts:', error);
        }
    }

    /**
     * Get search alerts that need processing
     */
    async getAlertsToProcess() {
        try {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const { data, error } = await this.client
                .from(this.savedSearchesTable)
                .select(`
                    *,
                    user:profiles!user_id (
                        id, user_id, first_name, last_name, email
                    )
                `)
                .eq('is_active', true)
                .or(`
                    and(notification_frequency.eq.immediate,last_checked_at.lt.${oneHourAgo.toISOString()}),
                    and(notification_frequency.eq.daily,last_checked_at.lt.${oneDayAgo.toISOString()}),
                    and(notification_frequency.eq.weekly,last_checked_at.lt.${oneWeekAgo.toISOString()})
                `);

            if (error) throw error;

            return data || [];

        } catch (error) {
            console.error('Error getting alerts to process:', error);
            return [];
        }
    }

    /**
     * Process a single search alert
     */
    async processSearchAlert(alert) {
        try {
            console.log(`🔍 Processing alert: ${alert.search_name} for user ${alert.user.first_name}`);

            // Find new listings that match the alert criteria
            const matchingListings = await this.findMatchingListings(alert);

            if (matchingListings.length > 0) {
                console.log(`📧 Found ${matchingListings.length} new matches for alert: ${alert.search_name}`);
                
                // Send notification
                await this.sendAlertNotification(alert, matchingListings);
                
                // Update alert statistics
                await this.updateAlertStats(alert.id, matchingListings.length);
            } else {
                console.log(`📭 No new matches for alert: ${alert.search_name}`);
            }

            // Update last checked timestamp
            await this.updateLastChecked(alert.id);

        } catch (error) {
            console.error(`❌ Error processing alert ${alert.id}:`, error);
        }
    }

    /**
     * Find listings that match the search alert criteria
     */
    async findMatchingListings(alert) {
        try {
            let query = this.client
                .from(this.listingsTable)
                .select('*')
                .eq('status', 'active')
                .gte('created_at', alert.last_checked_at);

            // Apply text search if specified
            if (alert.search_query && alert.search_query.trim()) {
                query = query.textSearch('search_vector', alert.search_query.trim());
            }

            // Apply filters
            if (alert.filters && Object.keys(alert.filters).length > 0) {
                const filters = alert.filters;

                // Business type filter
                if (filters.business_type) {
                    query = query.eq('business_type', filters.business_type);
                }

                // Location filter
                if (filters.location) {
                    query = query.ilike('location', `%${filters.location}%`);
                }

                // Price range filters
                if (filters.price_min) {
                    query = query.gte('asking_price', filters.price_min);
                }
                if (filters.price_max) {
                    query = query.lte('asking_price', filters.price_max);
                }

                // Revenue range filters
                if (filters.revenue_min) {
                    query = query.gte('annual_revenue', filters.revenue_min);
                }
                if (filters.revenue_max) {
                    query = query.lte('annual_revenue', filters.revenue_max);
                }

                // Industry filter
                if (filters.industry) {
                    query = query.eq('industry', filters.industry);
                }
            }

            // Limit results based on alert preferences
            const maxResults = alert.max_results_per_notification || 10;
            query = query.limit(maxResults);

            // Order by creation date (newest first)
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            return data || [];

        } catch (error) {
            console.error('Error finding matching listings:', error);
            return [];
        }
    }

    /**
     * Send notification to user about matching listings
     */
    async sendAlertNotification(alert, matchingListings) {
        try {
            const user = alert.user;
            const listingCount = matchingListings.length;
            const maxDisplay = 3; // Show details for first 3 listings

            // Create notification title and message
            const title = `${listingCount} New Match${listingCount > 1 ? 'es' : ''} for "${alert.search_name}"`;
            
            let message = `We found ${listingCount} new business listing${listingCount > 1 ? 's' : ''} matching your search criteria:\n\n`;
            
            // Add details for first few listings
            const displayListings = matchingListings.slice(0, maxDisplay);
            displayListings.forEach((listing, index) => {
                message += `${index + 1}. ${listing.title}`;
                if (listing.asking_price) {
                    message += ` - $${listing.asking_price.toLocaleString()}`;
                }
                if (listing.location) {
                    message += ` (${listing.location})`;
                }
                message += '\n';
            });

            if (listingCount > maxDisplay) {
                message += `\n...and ${listingCount - maxDisplay} more listing${listingCount - maxDisplay > 1 ? 's' : ''}`;
            }

            message += '\n\nView all matches in your dashboard.';

            // Create notification data
            const notificationData = {
                type: 'search_alert',
                search_alert_id: alert.id,
                search_name: alert.search_name,
                listing_count: listingCount,
                listings: matchingListings.map(listing => ({
                    id: listing.id,
                    title: listing.title,
                    asking_price: listing.asking_price,
                    location: listing.location
                }))
            };

            // Send notification via notification service
            await notificationService.createNotification(
                user.id,
                'search_alert',
                title,
                message,
                notificationData
            );

            // If email notifications are enabled, send email
            if (alert.email_notifications) {
                await this.sendEmailNotification(user, alert, matchingListings);
            }

            console.log(`✅ Notification sent for alert: ${alert.search_name}`);

        } catch (error) {
            console.error('Error sending alert notification:', error);
        }
    }

    /**
     * Send email notification (placeholder for email service integration)
     */
    async sendEmailNotification(user, alert, matchingListings) {
        try {
            // This would integrate with an email service like SendGrid, Mailgun, etc.
            // For now, we'll just log the email that would be sent
            
            console.log(`📧 Email notification would be sent to: ${user.email}`);
            console.log(`Subject: ${matchingListings.length} New Matches for "${alert.search_name}"`);
            
            // In a real implementation, you would:
            // 1. Format the email template with listing details
            // 2. Send via email service API
            // 3. Track email delivery status
            
        } catch (error) {
            console.error('Error sending email notification:', error);
        }
    }

    /**
     * Update alert statistics
     */
    async updateAlertStats(alertId, newMatchCount) {
        try {
            const { error } = await this.client
                .from(this.savedSearchesTable)
                .update({
                    total_matches_found: this.client.raw(`total_matches_found + ${newMatchCount}`),
                    new_matches_since_last_check: newMatchCount,
                    last_notification_sent_at: new Date().toISOString()
                })
                .eq('id', alertId);

            if (error) throw error;

        } catch (error) {
            console.error('Error updating alert stats:', error);
        }
    }

    /**
     * Update last checked timestamp
     */
    async updateLastChecked(alertId) {
        try {
            const { error } = await this.client
                .from(this.savedSearchesTable)
                .update({
                    last_checked_at: new Date().toISOString()
                })
                .eq('id', alertId);

            if (error) throw error;

        } catch (error) {
            console.error('Error updating last checked timestamp:', error);
        }
    }

    /**
     * Utility function to add delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Manual trigger for processing a specific alert (for testing)
     */
    async processSpecificAlert(alertId) {
        try {
            if (!this.isInitialized) await this.init();

            const { data: alert, error } = await this.client
                .from(this.savedSearchesTable)
                .select(`
                    *,
                    user:profiles!user_id (
                        id, user_id, first_name, last_name, email
                    )
                `)
                .eq('id', alertId)
                .single();

            if (error) throw error;

            if (alert) {
                await this.processSearchAlert(alert);
                return { success: true, message: 'Alert processed successfully' };
            } else {
                return { success: false, error: 'Alert not found' };
            }

        } catch (error) {
            console.error('Error processing specific alert:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create and export singleton instance
const searchAlertNotificationService = new SearchAlertNotificationService();
export { searchAlertNotificationService };
