/**
 * Search Alerts Dashboard Component
 * Provides interface for users to view, edit, and manage their saved search alerts
 * Integrates with the search alert service for CRUD operations
 */

import { searchAlertService } from '../services/search-alert.service.js';
import { saveSearchAlertModal } from './save-search-alert-modal.js';

class SearchAlertsDashboard {
    constructor() {
        this.containerId = 'search-alerts-dashboard';
        this.alerts = [];
        this.isLoading = false;
        this.currentPage = 1;
        this.itemsPerPage = 10;
    }

    /**
     * Initialize and render the dashboard
     */
    async init(containerId = null) {
        if (containerId) {
            this.containerId = containerId;
        }

        await this.loadSearchAlerts();
        this.render();
        this.bindEvents();
    }

    /**
     * Load search alerts from the service
     */
    async loadSearchAlerts() {
        try {
            this.isLoading = true;
            this.updateLoadingState();

            const result = await searchAlertService.getUserSearchAlerts({
                limit: this.itemsPerPage * this.currentPage,
                order_by: 'created_at',
                order_direction: 'desc'
            });

            if (result.success) {
                this.alerts = result.data;
                console.log(`✅ Loaded ${this.alerts.length} search alerts`);
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('❌ Error loading search alerts:', error);
            this.showError('Failed to load search alerts. Please refresh the page.');
        } finally {
            this.isLoading = false;
            this.updateLoadingState();
        }
    }

    /**
     * Render the dashboard HTML
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID ${this.containerId} not found`);
            return;
        }

        container.innerHTML = `
            <div class="search-alerts-dashboard">
                <!-- Header -->
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Search Alerts</h2>
                        <p class="text-slate-600 dark:text-slate-300 mt-1">
                            Manage your saved search criteria and notification preferences
                        </p>
                    </div>
                    <button id="create-new-alert-btn" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Create Alert
                    </button>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400" id="total-alerts-count">
                            ${this.alerts.length}
                        </div>
                        <div class="text-sm text-slate-600 dark:text-slate-400">Total Alerts</div>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div class="text-2xl font-bold text-green-600 dark:text-green-400" id="active-alerts-count">
                            ${this.alerts.filter(alert => alert.is_active).length}
                        </div>
                        <div class="text-sm text-slate-600 dark:text-slate-400">Active Alerts</div>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400" id="total-matches-count">
                            ${this.alerts.reduce((sum, alert) => sum + (alert.total_matches_found || 0), 0)}
                        </div>
                        <div class="text-sm text-slate-600 dark:text-slate-400">Total Matches</div>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div class="text-2xl font-bold text-orange-600 dark:text-orange-400" id="new-matches-count">
                            ${this.alerts.reduce((sum, alert) => sum + (alert.new_matches_since_last_check || 0), 0)}
                        </div>
                        <div class="text-sm text-slate-600 dark:text-slate-400">New Matches</div>
                    </div>
                </div>

                <!-- Alerts List -->
                <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Your Search Alerts</h3>
                    </div>
                    
                    <div id="alerts-loading" class="hidden p-8 text-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p class="text-slate-600 dark:text-slate-400 mt-2">Loading alerts...</p>
                    </div>

                    <div id="alerts-error" class="hidden p-8 text-center">
                        <div class="text-red-600 dark:text-red-400">
                            <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                            </svg>
                            <p class="text-lg font-medium">Error Loading Alerts</p>
                            <p class="text-sm mt-1">Please try refreshing the page</p>
                        </div>
                    </div>

                    <div id="alerts-list">
                        ${this.renderAlertsList()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the alerts list
     */
    renderAlertsList() {
        if (this.alerts.length === 0) {
            return `
                <div class="p-8 text-center">
                    <svg class="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">No Search Alerts</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-4">
                        Create your first search alert to get notified when new listings match your criteria.
                    </p>
                    <button id="create-first-alert-btn" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Create Your First Alert
                    </button>
                </div>
            `;
        }

        return this.alerts.map(alert => this.renderAlertCard(alert)).join('');
    }

    /**
     * Render a single alert card
     */
    renderAlertCard(alert) {
        const lastChecked = alert.last_checked_at ? new Date(alert.last_checked_at).toLocaleDateString() : 'Never';
        const created = new Date(alert.created_at).toLocaleDateString();
        
        const statusBadge = alert.is_active 
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Inactive</span>';

        const frequencyBadge = {
            'immediate': '<span class="text-xs text-orange-600 dark:text-orange-400">Immediate</span>',
            'daily': '<span class="text-xs text-blue-600 dark:text-blue-400">Daily</span>',
            'weekly': '<span class="text-xs text-purple-600 dark:text-purple-400">Weekly</span>'
        }[alert.notification_frequency] || '<span class="text-xs text-gray-600 dark:text-gray-400">Unknown</span>';

        return `
            <div class="p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0" data-alert-id="${alert.id}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h4 class="text-lg font-medium text-slate-900 dark:text-white">${alert.search_name}</h4>
                            ${statusBadge}
                            ${frequencyBadge}
                        </div>
                        
                        ${alert.search_query ? `
                            <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                <strong>Search:</strong> "${alert.search_query}"
                            </p>
                        ` : ''}
                        
                        ${Object.keys(alert.filters || {}).length > 0 ? `
                            <div class="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                <strong>Filters:</strong> ${this.formatFilters(alert.filters)}
                            </div>
                        ` : ''}
                        
                        <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span>Created: ${created}</span>
                            <span>Last checked: ${lastChecked}</span>
                            <span>Matches: ${alert.total_matches_found || 0}</span>
                            ${alert.new_matches_since_last_check > 0 ? `
                                <span class="text-orange-600 dark:text-orange-400 font-medium">
                                    ${alert.new_matches_since_last_check} new
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2 ml-4">
                        <button class="toggle-alert-btn p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            data-alert-id="${alert.id}" data-active="${alert.is_active}"
                            title="${alert.is_active ? 'Pause alert' : 'Activate alert'}">
                            ${alert.is_active ? `
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            ` : `
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2 4H7a2 2 0 01-2-2V8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2z"/>
                                </svg>
                            `}
                        </button>
                        
                        <button class="edit-alert-btn p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            data-alert-id="${alert.id}" title="Edit alert">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        
                        <button class="delete-alert-btn p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            data-alert-id="${alert.id}" title="Delete alert">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Format filters for display
     */
    formatFilters(filters) {
        const formatted = [];
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                formatted.push(`${displayKey}: ${value}`);
            }
        });
        
        return formatted.join(', ') || 'None';
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Create new alert button
        document.getElementById('create-new-alert-btn')?.addEventListener('click', () => {
            this.showCreateAlertModal();
        });

        // Create first alert button (in empty state)
        document.getElementById('create-first-alert-btn')?.addEventListener('click', () => {
            this.showCreateAlertModal();
        });

        // Toggle alert buttons
        document.querySelectorAll('.toggle-alert-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = e.currentTarget.dataset.alertId;
                const isActive = e.currentTarget.dataset.active === 'true';
                this.toggleAlert(alertId, !isActive);
            });
        });

        // Edit alert buttons
        document.querySelectorAll('.edit-alert-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = e.currentTarget.dataset.alertId;
                this.editAlert(alertId);
            });
        });

        // Delete alert buttons
        document.querySelectorAll('.delete-alert-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = e.currentTarget.dataset.alertId;
                this.deleteAlert(alertId);
            });
        });
    }

    /**
     * Show create alert modal
     */
    showCreateAlertModal() {
        saveSearchAlertModal.show(null, (savedAlert) => {
            this.loadSearchAlerts().then(() => {
                this.render();
                this.bindEvents();
            });
        });
    }

    /**
     * Toggle alert active status
     */
    async toggleAlert(alertId, isActive) {
        try {
            const result = await searchAlertService.toggleSearchAlert(alertId, isActive);
            
            if (result.success) {
                await this.loadSearchAlerts();
                this.render();
                this.bindEvents();
                
                const action = isActive ? 'activated' : 'paused';
                this.showToast(`Search alert ${action} successfully`, 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error toggling alert:', error);
            this.showToast('Failed to update alert status', 'error');
        }
    }

    /**
     * Edit alert (placeholder - would open edit modal)
     */
    async editAlert(alertId) {
        try {
            const result = await searchAlertService.getSearchAlert(alertId);
            
            if (result.success) {
                // For now, just show a message. In a full implementation,
                // you would open an edit modal with the alert data
                this.showToast('Edit functionality coming soon', 'info');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error loading alert for edit:', error);
            this.showToast('Failed to load alert details', 'error');
        }
    }

    /**
     * Delete alert with confirmation
     */
    async deleteAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return;

        if (confirm(`Are you sure you want to delete the search alert "${alert.search_name}"? This action cannot be undone.`)) {
            try {
                const result = await searchAlertService.deleteSearchAlert(alertId);
                
                if (result.success) {
                    await this.loadSearchAlerts();
                    this.render();
                    this.bindEvents();
                    
                    this.showToast('Search alert deleted successfully', 'success');
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('Error deleting alert:', error);
                this.showToast('Failed to delete search alert', 'error');
            }
        }
    }

    /**
     * Update loading state
     */
    updateLoadingState() {
        const loadingEl = document.getElementById('alerts-loading');
        const errorEl = document.getElementById('alerts-error');
        
        if (loadingEl) {
            loadingEl.classList.toggle('hidden', !this.isLoading);
        }
        if (errorEl) {
            errorEl.classList.add('hidden');
        }
    }

    /**
     * Show error state
     */
    showError(message) {
        const errorEl = document.getElementById('alerts-error');
        if (errorEl) {
            errorEl.classList.remove('hidden');
            const messageEl = errorEl.querySelector('p:last-child');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };

        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Export singleton instance
const searchAlertsDashboard = new SearchAlertsDashboard();
export { searchAlertsDashboard };
