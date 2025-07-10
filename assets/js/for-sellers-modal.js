/**
 * For Sellers Modal System
 * Handles the Express Seller application form modal functionality
 */

class ForSellersModal {
    constructor() {
        this.modal = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
        this.hideOriginalForm();
        this.fixButtonFunctionality();
    }

    hideOriginalForm() {
        // Hide the original form section
        const originalFormSection = document.querySelector('section:has(.bg-white.dark\\:bg-slate-800.rounded-lg.shadow-lg.p-8)');
        if (originalFormSection) {
            originalFormSection.style.display = 'none';
        }
    }

    fixButtonFunctionality() {
        // Fix all "Get Started" buttons to trigger the modal
        const getStartedButtons = document.querySelectorAll('a[href="#"]:has-text("Get Started"), .get-started-btn');
        getStartedButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        });

        // Fix navigation buttons
        const navButtons = document.querySelectorAll('nav a, .mobile-menu a');
        navButtons.forEach(button => {
            if (button.getAttribute('href') && button.getAttribute('href') !== '#') {
                // Ensure navigation buttons work properly
                button.addEventListener('click', (e) => {
                    const href = button.getAttribute('href');
                    if (href.startsWith('#')) {
                        e.preventDefault();
                        if (href === '#apply' || href === '#get-started') {
                            this.openModal();
                        }
                    }
                });
            }
        });
    }

    createModal() {
        // Create modal HTML
        const modalHTML = `
            <div id="seller-application-modal" class="fixed inset-0 z-50 hidden overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <!-- Background overlay -->
                <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                    <!-- Modal panel -->
                    <div class="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                        <!-- Modal header -->
                        <div class="bg-gradient-to-r from-accent to-accent-dark px-6 py-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <span class="text-2xl mr-3">🚖</span>
                                    <h3 class="text-xl font-bold text-white" id="modal-title">
                                        Apply for Express Seller Badge
                                    </h3>
                                </div>
                                <button type="button" id="close-modal" class="text-white hover:text-green-200 transition-colors" aria-label="Close modal">
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
                                    Join our exclusive Express Seller program and get priority placement, verified buyer access, and guaranteed 34-day closing timelines.
                                </p>
                            </div>

                            <form id="seller-application-form" class="space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label for="modal-owner-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Owner Name *</label>
                                        <input type="text" id="modal-owner-name" name="owner-name" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                                    </div>

                                    <div>
                                        <label for="modal-business-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Name *</label>
                                        <input type="text" id="modal-business-name" name="business-name" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                                    </div>

                                    <div>
                                        <label for="modal-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address *</label>
                                        <input type="email" id="modal-email" name="email" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                                    </div>

                                    <div>
                                        <label for="modal-phone" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number *</label>
                                        <input type="tel" id="modal-phone" name="phone" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                                    </div>

                                    <div>
                                        <label for="modal-location" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shop Location *</label>
                                        <select id="modal-location" name="location" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                                            <option value="">Select location</option>
                                            <option value="dallas">Dallas, TX</option>
                                            <option value="fort-worth">Fort Worth, TX</option>
                                            <option value="plano">Plano, TX</option>
                                            <option value="arlington">Arlington, TX</option>
                                            <option value="irving">Irving, TX</option>
                                            <option value="garland">Garland, TX</option>
                                            <option value="grand-prairie">Grand Prairie, TX</option>
                                            <option value="mesquite">Mesquite, TX</option>
                                            <option value="carrollton">Carrollton, TX</option>
                                            <option value="richardson">Richardson, TX</option>
                                            <option value="other-dfw">Other DFW Area</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label for="modal-shop-type" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shop Type *</label>
                                        <select id="modal-shop-type" name="shop-type" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                                            <option value="">Select shop type</option>
                                            <option value="full-service">Full Service Auto Repair</option>
                                            <option value="transmission">Transmission Specialist</option>
                                            <option value="body-shop">Auto Body Shop</option>
                                            <option value="brake-muffler">Brake & Muffler</option>
                                            <option value="quick-lube">Quick Lube</option>
                                            <option value="tire-shop">Tire Shop</option>
                                            <option value="engine-repair">Engine Repair</option>
                                            <option value="import-specialist">Import Specialist</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label for="modal-years-operation" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Years in Operation *</label>
                                        <select id="modal-years-operation" name="years-operation" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                                            <option value="">Select years</option>
                                            <option value="1-2">1-2 years</option>
                                            <option value="3-5">3-5 years</option>
                                            <option value="6-10">6-10 years</option>
                                            <option value="11-20">11-20 years</option>
                                            <option value="20+">20+ years</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label for="modal-annual-revenue" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Annual Revenue *</label>
                                        <select id="modal-annual-revenue" name="annual-revenue" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                                            <option value="">Select revenue range</option>
                                            <option value="under-300k">Under $300K</option>
                                            <option value="300k-500k">$300K - $500K</option>
                                            <option value="500k-750k">$500K - $750K</option>
                                            <option value="750k-1m">$750K - $1M</option>
                                            <option value="1m-2m">$1M - $2M</option>
                                            <option value="2m+">$2M+</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label for="modal-asking-price" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Desired Asking Price</label>
                                    <select id="modal-asking-price" name="asking-price" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                                        <option value="">Select price range</option>
                                        <option value="under-250k">Under $250,000</option>
                                        <option value="250k-500k">$250,000 - $500,000</option>
                                        <option value="500k-750k">$500,000 - $750,000</option>
                                        <option value="750k-1m">$750,000 - $1,000,000</option>
                                        <option value="1m-1.5m">$1,000,000 - $1,500,000</option>
                                        <option value="over-1.5m">Over $1,500,000</option>
                                        <option value="negotiable">Negotiable</option>
                                    </select>
                                </div>

                                <div>
                                    <label for="modal-timeline" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Desired Sale Timeline *</label>
                                    <select id="modal-timeline" name="timeline" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                                        <option value="">Select timeline</option>
                                        <option value="asap">ASAP (Express Path)</option>
                                        <option value="3-months">Within 3 months</option>
                                        <option value="6-months">Within 6 months</option>
                                        <option value="1-year">Within 1 year</option>
                                        <option value="flexible">Flexible</option>
                                    </select>
                                </div>

                                <div>
                                    <label for="modal-additional-info" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Additional Information</label>
                                    <textarea id="modal-additional-info" name="additional-info" rows="3" placeholder="Tell us more about your shop, special equipment, customer base, etc." class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"></textarea>
                                </div>

                                <div class="flex items-start">
                                    <input type="checkbox" id="modal-terms" name="terms" required class="mt-1 h-4 w-4 text-accent focus:ring-accent border-slate-300 rounded">
                                    <label for="modal-terms" class="ml-2 text-sm text-slate-600 dark:text-slate-300">
                                        I agree to the <a href="terms-of-service.html" class="text-accent hover:underline" target="_blank">Terms of Service</a> and <a href="privacy-policy.html" class="text-accent hover:underline" target="_blank">Privacy Policy</a>. I understand that Express Seller badge approval is subject to qualification review. *
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
                                    Priority placement • Verified buyers • 34-day guarantee
                                </span>
                            </div>
                            <div class="flex space-x-3">
                                <button type="button" id="cancel-application" class="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-all">
                                    Cancel
                                </button>
                                <button type="submit" form="seller-application-form" id="submit-application" class="inline-flex items-center px-6 py-2 border border-transparent text-white bg-accent hover:bg-accent-dark rounded-md shadow-sm hover:shadow-lg transition-all">
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
        this.modal = document.getElementById('seller-application-modal');
    }

    setupEventListeners() {
        // Modal trigger buttons
        const triggerButtons = document.querySelectorAll('[href="#apply"], [href="#get-started"], .apply-trigger, .get-started-btn');
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
        const form = document.getElementById('seller-application-form');
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
            const form = document.getElementById('seller-application-form');
            form?.reset();
        }
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
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
            console.log('Express Seller Application Data:', data);
        }, 2000);
    }

    validateForm(data) {
        const requiredFields = ['owner-name', 'business-name', 'email', 'phone', 'location', 'shop-type', 'years-operation', 'annual-revenue', 'timeline'];
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
        if (!emailRegex.test(data.email)) {
            this.showErrorMessage('Please enter a valid email address.');
            return false;
        }
        
        return true;
    }

    showSuccessMessage() {
        this.showNotification(
            'Application submitted successfully! We\'ll review your information and contact you within 24 hours to discuss your Express Seller badge.',
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
    new ForSellersModal();
});
