/**
 * Save Search Alert Modal Component
 * Provides UI for users to save their current search criteria as an alert
 * Includes notification preferences and alert configuration options
 */

import { searchAlertService } from '../services/search-alert.service.js';

class SaveSearchAlertModal {
    constructor() {
        this.modalId = 'save-search-alert-modal';
        this.isVisible = false;
        this.currentSearchCriteria = null;
        this.onSaveCallback = null;
    }

    /**
     * Show the save search alert modal
     */
    show(searchCriteria = null, onSaveCallback = null) {
        this.currentSearchCriteria = searchCriteria || searchAlertService.extractCurrentSearchCriteria();
        this.onSaveCallback = onSaveCallback;
        
        this.createModal();
        this.bindEvents();
        this.populateSearchPreview();
        this.isVisible = true;
    }

    /**
     * Hide the modal
     */
    hide() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.remove();
        }
        this.isVisible = false;
    }

    /**
     * Create the modal HTML structure
     */
    createModal() {
        // Remove existing modal if present
        this.hide();

        const modalHTML = `
            <div id="${this.modalId}" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <!-- Background overlay -->
                    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                    <!-- Modal panel -->
                    <div class="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div class="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                                    <!-- Bell icon -->
                                    <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                        Save Search Alert
                                    </h3>
                                    <div class="mt-2">
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            Get notified when new listings match your search criteria.
                                        </p>
                                    </div>

                                    <!-- Search Preview -->
                                    <div class="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Current Search:</h4>
                                        <div id="search-preview" class="text-sm text-gray-600 dark:text-gray-300">
                                            <!-- Search criteria will be populated here -->
                                        </div>
                                    </div>

                                    <!-- Alert Configuration Form -->
                                    <form id="save-search-alert-form" class="mt-4 space-y-4">
                                        <!-- Alert Name -->
                                        <div>
                                            <label for="alert-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Alert Name *
                                            </label>
                                            <input type="text" id="alert-name" name="alert_name" required
                                                class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm"
                                                placeholder="e.g., Tech Startups in California">
                                        </div>

                                        <!-- Notification Frequency -->
                                        <div>
                                            <label for="notification-frequency" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Notification Frequency
                                            </label>
                                            <select id="notification-frequency" name="notification_frequency"
                                                class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm">
                                                <option value="immediate">Immediate (as soon as new matches are found)</option>
                                                <option value="daily" selected>Daily Summary</option>
                                                <option value="weekly">Weekly Summary</option>
                                            </select>
                                        </div>

                                        <!-- Notification Preferences -->
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Notification Methods
                                            </label>
                                            <div class="space-y-2">
                                                <label class="flex items-center">
                                                    <input type="checkbox" id="email-notifications" name="email_notifications" checked
                                                        class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Email notifications</span>
                                                </label>
                                                <label class="flex items-center">
                                                    <input type="checkbox" id="push-notifications" name="push_notifications"
                                                        class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Push notifications</span>
                                                </label>
                                            </div>
                                        </div>

                                        <!-- Advanced Options -->
                                        <div class="border-t dark:border-gray-600 pt-4">
                                            <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Advanced Options</h4>
                                            
                                            <div class="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label for="max-results" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Max Results per Alert
                                                    </label>
                                                    <input type="number" id="max-results" name="max_results" value="10" min="1" max="50"
                                                        class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm">
                                                </div>
                                                
                                                <div>
                                                    <label for="min-match-score" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Min Match Score (%)
                                                    </label>
                                                    <input type="number" id="min-match-score" name="min_match_score" value="70" min="0" max="100"
                                                        class="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white sm:text-sm">
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Error Message -->
                                        <div id="alert-error-message" class="hidden p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
                                            <p class="text-sm text-red-600 dark:text-red-400"></p>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <!-- Modal Actions -->
                        <div class="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button type="button" id="save-alert-btn"
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                <span class="save-btn-text">Save Alert</span>
                                <span class="save-btn-loading hidden">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            </button>
                            <button type="button" id="cancel-alert-btn"
                                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        const modal = document.getElementById(this.modalId);
        const saveBtn = document.getElementById('save-alert-btn');
        const cancelBtn = document.getElementById('cancel-alert-btn');
        const form = document.getElementById('save-search-alert-form');
        const overlay = modal.querySelector('.bg-gray-500');

        // Save button click
        saveBtn.addEventListener('click', () => this.handleSave());

        // Cancel button click
        cancelBtn.addEventListener('click', () => this.hide());

        // Overlay click to close
        overlay.addEventListener('click', () => this.hide());

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSave();
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * Populate the search preview section
     */
    populateSearchPreview() {
        const previewContainer = document.getElementById('search-preview');
        const criteria = this.currentSearchCriteria;

        let previewHTML = '';

        if (criteria.search_query) {
            previewHTML += `<div class="mb-2"><strong>Search:</strong> "${criteria.search_query}"</div>`;
        }

        if (criteria.filters && Object.keys(criteria.filters).length > 0) {
            previewHTML += '<div><strong>Filters:</strong></div><ul class="list-disc list-inside ml-4 mt-1">';
            
            Object.entries(criteria.filters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    previewHTML += `<li>${displayKey}: ${value}</li>`;
                }
            });
            
            previewHTML += '</ul>';
        }

        if (!criteria.search_query && (!criteria.filters || Object.keys(criteria.filters).length === 0)) {
            previewHTML = '<div class="text-gray-500 dark:text-gray-400 italic">No specific search criteria detected. Alert will notify you of all new listings.</div>';
        }

        previewContainer.innerHTML = previewHTML;

        // Auto-generate alert name based on criteria
        this.generateAlertName();
    }

    /**
     * Generate a suggested alert name based on search criteria
     */
    generateAlertName() {
        const alertNameInput = document.getElementById('alert-name');
        const criteria = this.currentSearchCriteria;
        
        let suggestedName = '';

        if (criteria.search_query) {
            suggestedName = criteria.search_query;
        }

        if (criteria.filters) {
            const parts = [];
            
            if (criteria.filters.business_type) {
                parts.push(criteria.filters.business_type);
            }
            
            if (criteria.filters.location) {
                parts.push(`in ${criteria.filters.location}`);
            }
            
            if (criteria.filters.price_max) {
                parts.push(`under $${criteria.filters.price_max.toLocaleString()}`);
            }

            if (parts.length > 0) {
                suggestedName = suggestedName ? `${suggestedName} - ${parts.join(' ')}` : parts.join(' ');
            }
        }

        if (!suggestedName) {
            suggestedName = 'New Business Listings';
        }

        alertNameInput.value = suggestedName;
    }

    /**
     * Handle save alert action
     */
    async handleSave() {
        const saveBtn = document.getElementById('save-alert-btn');
        const saveBtnText = saveBtn.querySelector('.save-btn-text');
        const saveBtnLoading = saveBtn.querySelector('.save-btn-loading');
        const errorContainer = document.getElementById('alert-error-message');
        const errorText = errorContainer.querySelector('p');

        try {
            // Show loading state
            saveBtn.disabled = true;
            saveBtnText.classList.add('hidden');
            saveBtnLoading.classList.remove('hidden');
            errorContainer.classList.add('hidden');

            // Collect form data
            const formData = new FormData(document.getElementById('save-search-alert-form'));
            
            const alertData = {
                search_name: formData.get('alert_name'),
                search_query: this.currentSearchCriteria.search_query,
                filters: this.currentSearchCriteria.filters,
                notification_frequency: formData.get('notification_frequency'),
                email_notifications: formData.has('email_notifications'),
                push_notifications: formData.has('push_notifications'),
                max_results_per_notification: parseInt(formData.get('max_results')) || 10,
                min_match_score: parseInt(formData.get('min_match_score')) || 70
            };

            // Save the alert
            const result = await searchAlertService.saveSearchAlert(alertData);

            if (result.success) {
                // Success - call callback and close modal
                if (this.onSaveCallback) {
                    this.onSaveCallback(result.data);
                }
                
                this.showSuccessToast(`Search alert "${alertData.search_name}" saved successfully!`);
                this.hide();
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Error saving search alert:', error);
            
            // Show error message
            errorText.textContent = error.message || 'Failed to save search alert. Please try again.';
            errorContainer.classList.remove('hidden');
        } finally {
            // Reset button state
            saveBtn.disabled = false;
            saveBtnText.classList.remove('hidden');
            saveBtnLoading.classList.add('hidden');
        }
    }

    /**
     * Show success toast notification
     */
    showSuccessToast(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Export singleton instance
const saveSearchAlertModal = new SaveSearchAlertModal();
export { saveSearchAlertModal };
