/**
 * Search Alert Service
 * Manages saved search alerts for users - create, read, update, delete operations
 * Integrates with Supabase for data persistence and real-time updates
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';
import { notificationService } from '../../notifications/services/notification.service.js';

class SearchAlertService {
    constructor() {
        this.tableName = 'saved_searches';
        this.isInitialized = false;
        this.client = null;
        this.currentUser = null;
        this.userProfile = null;
    }

    /**
     * Initialize the service
     */
    async init() {
        try {
            this.client = supabaseService.getClient();
            this.currentUser = await this.getCurrentUser();
            
            if (this.currentUser) {
                this.userProfile = await this.getUserProfile(this.currentUser.id);
            }
            
            this.isInitialized = true;
            console.log('✅ Search Alert Service initialized');
        } catch (error) {
            console.error('❌ Search Alert Service initialization failed:', error);
            throw error;
        }
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.client.auth.getUser();
            if (error) throw error;
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
                .select('*')
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
     * Save a new search alert
     */
    async saveSearchAlert(searchData) {
        try {
            if (!this.isInitialized) await this.init();
            
            if (!this.userProfile) {
                throw new Error('User not authenticated');
            }

            // Validate required fields
            if (!searchData.search_name || searchData.search_name.trim() === '') {
                throw new Error('Search name is required');
            }

            const alertData = {
                user_id: this.userProfile.id,
                search_name: searchData.search_name.trim(),
                search_query: searchData.search_query || '',
                filters: searchData.filters || {},
                notification_frequency: searchData.notification_frequency || 'daily',
                email_notifications: searchData.email_notifications !== false,
                push_notifications: searchData.push_notifications || false,
                max_results_per_notification: searchData.max_results_per_notification || 10,
                min_match_score: searchData.min_match_score || 70,
                metadata: searchData.metadata || {},
                is_active: true
            };

            const { data, error } = await this.client
                .from(this.tableName)
                .insert(alertData)
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error('A search alert with this name already exists');
                }
                throw error;
            }

            // Send confirmation notification
            await notificationService.createNotification(
                this.userProfile.id,
                'search_alert',
                'Search Alert Created',
                `Your search alert "${alertData.search_name}" has been saved and is now active.`,
                { search_alert_id: data.id, search_name: alertData.search_name }
            );

            console.log('✅ Search alert saved successfully:', data.id);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Error saving search alert:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all search alerts for current user
     */
    async getUserSearchAlerts(options = {}) {
        try {
            if (!this.isInitialized) await this.init();
            
            if (!this.userProfile) {
                throw new Error('User not authenticated');
            }

            const { 
                limit = 50, 
                offset = 0, 
                active_only = false,
                order_by = 'created_at',
                order_direction = 'desc'
            } = options;

            let query = this.client
                .from(this.tableName)
                .select('*')
                .eq('user_id', this.userProfile.id);

            if (active_only) {
                query = query.eq('is_active', true);
            }

            query = query
                .order(order_by, { ascending: order_direction === 'asc' })
                .range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) throw error;

            console.log(`✅ Retrieved ${data.length} search alerts`);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Error getting search alerts:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get a specific search alert by ID
     */
    async getSearchAlert(alertId) {
        try {
            if (!this.isInitialized) await this.init();
            
            if (!this.userProfile) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await this.client
                .from(this.tableName)
                .select('*')
                .eq('id', alertId)
                .eq('user_id', this.userProfile.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Search alert not found');
                }
                throw error;
            }

            return { success: true, data };

        } catch (error) {
            console.error('❌ Error getting search alert:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update a search alert
     */
    async updateSearchAlert(alertId, updateData) {
        try {
            if (!this.isInitialized) await this.init();
            
            if (!this.userProfile) {
                throw new Error('User not authenticated');
            }

            // Remove fields that shouldn't be updated directly
            const allowedFields = [
                'search_name', 'search_query', 'filters', 'is_active',
                'notification_frequency', 'email_notifications', 'push_notifications',
                'max_results_per_notification', 'min_match_score', 'metadata'
            ];

            const filteredData = {};
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredData[key] = updateData[key];
                }
            });

            const { data, error } = await this.client
                .from(this.tableName)
                .update(filteredData)
                .eq('id', alertId)
                .eq('user_id', this.userProfile.id)
                .select()
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error('Search alert not found');
                }
                if (error.code === '23505') {
                    throw new Error('A search alert with this name already exists');
                }
                throw error;
            }

            console.log('✅ Search alert updated successfully:', alertId);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Error updating search alert:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete a search alert
     */
    async deleteSearchAlert(alertId) {
        try {
            if (!this.isInitialized) await this.init();
            
            if (!this.userProfile) {
                throw new Error('User not authenticated');
            }

            const { error } = await this.client
                .from(this.tableName)
                .delete()
                .eq('id', alertId)
                .eq('user_id', this.userProfile.id);

            if (error) throw error;

            console.log('✅ Search alert deleted successfully:', alertId);
            return { success: true };

        } catch (error) {
            console.error('❌ Error deleting search alert:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Toggle search alert active status
     */
    async toggleSearchAlert(alertId, isActive) {
        try {
            return await this.updateSearchAlert(alertId, { is_active: isActive });
        } catch (error) {
            console.error('❌ Error toggling search alert:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get search alert statistics for user
     */
    async getSearchAlertStats() {
        try {
            if (!this.isInitialized) await this.init();
            
            if (!this.userProfile) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await this.client
                .from(this.tableName)
                .select('is_active, total_matches_found, new_matches_since_last_check')
                .eq('user_id', this.userProfile.id);

            if (error) throw error;

            const stats = {
                total_alerts: data.length,
                active_alerts: data.filter(alert => alert.is_active).length,
                inactive_alerts: data.filter(alert => !alert.is_active).length,
                total_matches: data.reduce((sum, alert) => sum + (alert.total_matches_found || 0), 0),
                new_matches: data.reduce((sum, alert) => sum + (alert.new_matches_since_last_check || 0), 0)
            };

            return { success: true, data: stats };

        } catch (error) {
            console.error('❌ Error getting search alert stats:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Extract search criteria from current page/form
     */
    extractCurrentSearchCriteria() {
        try {
            const criteria = {
                search_query: '',
                filters: {}
            };

            // Extract search query from search input
            const searchInput = document.querySelector('#search-input, [name="search"], .search-input');
            if (searchInput && searchInput.value.trim()) {
                criteria.search_query = searchInput.value.trim();
            }

            // Extract filters from form elements
            const filterElements = document.querySelectorAll('[data-filter], .filter-input, .filter-select');
            filterElements.forEach(element => {
                const filterName = element.dataset.filter || element.name;
                const filterValue = element.type === 'checkbox' ? element.checked : element.value;
                
                if (filterName && filterValue !== '' && filterValue !== false) {
                    criteria.filters[filterName] = filterValue;
                }
            });

            // Extract specific business search filters if they exist
            const businessType = document.querySelector('#business-type, [name="business_type"]');
            if (businessType && businessType.value) {
                criteria.filters.business_type = businessType.value;
            }

            const location = document.querySelector('#location, [name="location"]');
            if (location && location.value) {
                criteria.filters.location = location.value;
            }

            const priceMin = document.querySelector('#price-min, [name="price_min"]');
            const priceMax = document.querySelector('#price-max, [name="price_max"]');
            if (priceMin && priceMin.value) {
                criteria.filters.price_min = parseFloat(priceMin.value);
            }
            if (priceMax && priceMax.value) {
                criteria.filters.price_max = parseFloat(priceMax.value);
            }

            return criteria;

        } catch (error) {
            console.error('❌ Error extracting search criteria:', error);
            return { search_query: '', filters: {} };
        }
    }
}

// Create and export singleton instance
const searchAlertService = new SearchAlertService();
export { searchAlertService };
