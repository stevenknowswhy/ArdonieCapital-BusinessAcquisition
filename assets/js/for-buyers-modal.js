/**
 * For Buyers Modal System
 * Handles the Express Buyer application form modal functionality
 */

class ForBuyersModal {
    constructor() {
        this.modal = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
        this.hideOriginalForm();
    }

    hideOriginalForm() {
        // Hide the original form section
        const originalForm = document.querySelector('#apply');
        if (originalForm) {
            originalForm.style.display = 'none';
        }
    }

    createModal() {
        // Create modal HTML
        const modalHTML = `
            <div id="buyer-application-modal" class="fixed inset-0 z-50 hidden overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <!-- Background overlay -->
                <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                    <!-- Modal panel -->
                    <div class="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                        <!-- Modal header -->
                        <div class="bg-gradient-to-r from-primary-dark to-primary px-6 py-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <span class="text-2xl mr-3">🚖</span>
                                    <h3 class="text-xl font-bold text-white" id="modal-title">
                                        Apply for Express Buyer Badge
                                    </h3>
                                </div>
                                <button type="button" id="close-modal" class="text-white hover:text-blue-200 transition-colors" aria-label="Close modal">
                                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <!-- Modal content -->
                        <div class="px-6 py-6 max-h-96 overflow-y-auto">
                            <div class="mb-6">
                                <p class="text-slate-600 dark:text-slate-300 text-center">
                                    Join our exclusive Express Buyer program and get priority access to verified auto shop opportunities with guaranteed 34-day closing timelines.
                                </p>
                            </div>

                            <form id="buyer-application-form" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label for="modal-buyer-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                                        <input type="text" id="modal-buyer-name" name="buyer-name" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                                    </div>

                                    <div>
                                        <label for="modal-buyer-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address *</label>
                                        <input type="email" id="modal-buyer-email" name="buyer-email" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                                    </div>

                                    <div>
                                        <label for="modal-buyer-phone" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number *</label>
                                        <input type="tel" id="modal-buyer-phone" name="buyer-phone" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                                    </div>

                                    <div>
                                        <label for="modal-location" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preferred Location *</label>
                                        <select id="modal-location" name="location" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                                            <option value="">Select preferred area</option>
                                            <option value="dallas">Dallas</option>
                                            <option value="fort-worth">Fort Worth</option>
                                            <option value="plano">Plano</option>
                                            <option value="arlington">Arlington</option>
                                            <option value="irving">Irving</option>
                                            <option value="garland">Garland</option>
                                            <option value="grand-prairie">Grand Prairie</option>
                                            <option value="mesquite">Mesquite</option>
                                            <option value="carrollton">Carrollton</option>
                                            <option value="richardson">Richardson</option>
                                            <option value="dfw-wide">Entire DFW Area</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label for="modal-experience" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Automotive Experience</label>
                                        <select id="modal-experience" name="experience" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                                            <option value="">Select your background</option>
                                            <option value="none">No automotive experience</option>
                                            <option value="technician">Auto technician background</option>
                                            <option value="manager">Shop manager experience</option>
                                            <option value="owner">Previous shop owner</option>
                                            <option value="industry">Other automotive industry</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label for="modal-timeline" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Purchase Timeline *</label>
                                        <select id="modal-timeline" name="timeline" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                                            <option value="">Select timeline</option>
                                            <option value="asap">ASAP (Express Path)</option>
                                            <option value="3-months">Within 3 months</option>
                                            <option value="6-months">Within 6 months</option>
                                            <option value="1-year">Within 1 year</option>
                                            <option value="exploring">Just exploring</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shop Type Preferences</label>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <label class="flex items-center">
                                            <input type="checkbox" name="shop-types" value="full-service" class="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded">
                                            <span class="ml-2 text-sm text-slate-600 dark:text-slate-300">Full Service</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" name="shop-types" value="transmission" class="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded">
                                            <span class="ml-2 text-sm text-slate-600 dark:text-slate-300">Transmission</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" name="shop-types" value="body-shop" class="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded">
                                            <span class="ml-2 text-sm text-slate-600 dark:text-slate-300">Body Shop</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" name="shop-types" value="quick-lube" class="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded">
                                            <span class="ml-2 text-sm text-slate-600 dark:text-slate-300">Quick Lube</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label for="modal-budget-range" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Budget Range *</label>
                                    <select id="modal-budget-range" name="budget-range" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                                        <option value="">Select budget range</option>
                                        <option value="under-250k">Under $250,000</option>
                                        <option value="250k-500k">$250,000 - $500,000</option>
                                        <option value="500k-750k">$500,000 - $750,000</option>
                                        <option value="750k-1m">$750,000 - $1,000,000</option>
                                        <option value="1m-1.5m">$1,000,000 - $1,500,000</option>
                                        <option value="over-1.5m">Over $1,500,000</option>
                                    </select>
                                </div>

                                <div>
                                    <label for="modal-additional-info" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Additional Information</label>
                                    <textarea id="modal-additional-info" name="additional-info" rows="3" placeholder="Tell us about your background, goals, and what you're looking for in an auto shop..." class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"></textarea>
                                </div>

                                <div class="flex items-start">
                                    <input type="checkbox" id="modal-terms" name="terms" required class="mt-1 h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded">
                                    <label for="modal-terms" class="ml-2 text-sm text-slate-600 dark:text-slate-300">
                                        I agree to the <a href="terms-of-service.html" class="text-primary hover:underline" target="_blank">Terms of Service</a> and <a href="privacy-policy.html" class="text-primary hover:underline" target="_blank">Privacy Policy</a>. I understand that Express Buyer badge approval is subject to qualification review and financial verification. *
                                    </label>
                                </div>
                            </form>
                        </div>

                        <!-- Modal footer -->
                        <div class="bg-slate-50 dark:bg-slate-700 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div class="text-sm text-slate-500 dark:text-slate-400">
                                <span class="inline-flex items-center">
                                    <svg class="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                    </svg>
                                    Free consultation • Verified opportunities • 34-day guarantee
                                </span>
                            </div>
                            <div class="flex space-x-3">
                                <button type="button" id="cancel-application" class="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-all">
                                    Cancel
                                </button>
                                <button type="submit" form="buyer-application-form" id="submit-application" class="inline-flex items-center px-6 py-2 border border-transparent text-white bg-primary-dark hover:bg-primary rounded-md shadow-sm hover:shadow-lg transition-all">
                                    Submit Application
                                    <span class="ml-2">🚖</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('buyer-application-modal');
    }

    setupEventListeners() {
        // Modal trigger buttons
        const triggerButtons = document.querySelectorAll('[href="#apply"], .apply-trigger');
        triggerButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        });

        // Close modal events
        const closeButton = document.getElementById('close-modal');
        const cancelButton = document.getElementById('cancel-application');
        const overlay = this.modal?.querySelector('.bg-slate-500');

        closeButton?.addEventListener('click', () => this.closeModal());
        cancelButton?.addEventListener('click', () => this.closeModal());
        overlay?.addEventListener('click', () => this.closeModal());

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });

        // Form submission
        const form = document.getElementById('buyer-application-form');
        form?.addEventListener('submit', (e) => this.handleFormSubmission(e));

        // Mobile menu toggle (existing functionality)
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuButton?.addEventListener('click', () => {
            mobileMenu?.classList.toggle('hidden');
        });
    }

    openModal() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            this.isOpen = true;
            
            // Focus management for accessibility
            const firstInput = this.modal.querySelector('input, select, textarea');
            firstInput?.focus();
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            this.isOpen = false;
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Reset form
            const form = document.getElementById('buyer-application-form');
            form?.reset();
        }
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Get shop types (checkboxes)
        const shopTypes = Array.from(document.querySelectorAll('input[name="shop-types"]:checked'))
            .map(cb => cb.value);
        data.shopTypes = shopTypes;
        
        // Validate required fields
        if (!this.validateForm(data)) {
            return;
        }
        
        // Show loading state
        const submitButton = document.getElementById('submit-application');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = 'Submitting... <span class="ml-2">⏳</span>';
        submitButton.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.showSuccessMessage();
            this.closeModal();
            
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // In a real application, you would send this data to your backend
            console.log('Express Buyer Application Data:', data);
        }, 2000);
    }

    validateForm(data) {
        const requiredFields = ['buyer-name', 'buyer-email', 'buyer-phone', 'location', 'timeline', 'budget-range'];
        const missingFields = [];
        
        requiredFields.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                missingFields.push(field);
            }
        });
        
        if (!data.terms) {
            missingFields.push('terms');
        }
        
        if (missingFields.length > 0) {
            this.showErrorMessage('Please fill in all required fields.');
            return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data['buyer-email'])) {
            this.showErrorMessage('Please enter a valid email address.');
            return false;
        }
        
        return true;
    }

    showSuccessMessage() {
        this.showNotification(
            'Application submitted successfully! We\'ll review your information and contact you within 24 hours.',
            'success'
        );
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all transform translate-x-full max-w-md`;
        
        switch(type) {
            case 'success':
                notification.className += ' bg-green-500 text-white';
                break;
            case 'error':
                notification.className += ' bg-red-500 text-white';
                break;
            default:
                notification.className += ' bg-blue-500 text-white';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
}

// Initialize the modal system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ForBuyersModal();
});
