/**
 * Contact Forms Modal System
 * Handles inquiry-specific modal forms for General, Buyer, and Seller inquiries
 */

class ContactFormsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Modal trigger buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-trigger]')) {
                const modalType = e.target.dataset.modalTrigger;
                this.openModal(modalType);
            }
        });

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-backdrop') || e.target.matches('.modal-close')) {
                this.closeModal();
            }
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('.contact-form')) {
                e.preventDefault();
                this.handleFormSubmission(e.target);
            }
        });
    }

    openModal(modalType) {
        const modal = this.createModal(modalType);
        document.body.appendChild(modal);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Animate in
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.modal-content').classList.remove('scale-95');
        }, 10);
    }

    closeModal() {
        const modal = document.querySelector('.modal-backdrop');
        if (modal) {
            modal.classList.add('opacity-0');
            modal.querySelector('.modal-content').classList.add('scale-95');
            
            setTimeout(() => {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }, 300);
        }
    }

    createModal(modalType) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 opacity-0 transition-opacity duration-300';
        
        let modalContent = '';
        
        switch (modalType) {
            case 'general':
                modalContent = this.createGeneralInquiryForm();
                break;
            case 'buyer':
                modalContent = this.createBuyerInquiryForm();
                break;
            case 'seller':
                modalContent = this.createSellerInquiryForm();
                break;
            default:
                modalContent = this.createGeneralInquiryForm();
        }
        
        modal.innerHTML = `
            <div class="modal-content bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-300">
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">${this.getModalTitle(modalType)}</h2>
                        <button type="button" class="modal-close text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    ${modalContent}
                </div>
            </div>
        `;
        
        return modal;
    }

    getModalTitle(modalType) {
        const titles = {
            general: 'General Inquiry',
            buyer: 'Buyer Inquiry',
            seller: 'Seller Inquiry'
        };
        return titles[modalType] || 'Contact Us';
    }

    createGeneralInquiryForm() {
        return `
            <form class="contact-form space-y-6" data-form-type="general">
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label for="general-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                        <input type="text" id="general-name" name="name" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                    </div>
                    
                    <div>
                        <label for="general-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address *</label>
                        <input type="email" id="general-email" name="email" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                    </div>
                </div>
                
                <div>
                    <label for="general-subject" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject *</label>
                    <select id="general-subject" name="subject" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                        <option value="">Select a subject</option>
                        <option value="platform-info">Platform Information</option>
                        <option value="express-path">Express Path Program</option>
                        <option value="pricing">Pricing & Fees</option>
                        <option value="technical-support">Technical Support</option>
                        <option value="media-inquiry">Media Inquiry</option>
                        <option value="partnership">Partnership Opportunities</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div>
                    <label for="general-message" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message *</label>
                    <textarea id="general-message" name="message" rows="5" required placeholder="Tell us how we can help you..." class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white"></textarea>
                </div>
                
                <div class="flex justify-end space-x-4">
                    <button type="button" class="modal-close px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="px-6 py-2 bg-primary-dark hover:bg-primary text-white rounded-md transition-colors">
                        Send Message
                    </button>
                </div>
            </form>
        `;
    }

    createBuyerInquiryForm() {
        return `
            <form class="contact-form space-y-6" data-form-type="buyer">
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label for="buyer-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                        <input type="text" id="buyer-name" name="name" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                    </div>
                    
                    <div>
                        <label for="buyer-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address *</label>
                        <input type="email" id="buyer-email" name="email" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                    </div>
                </div>
                
                <div>
                    <label for="buyer-phone" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number *</label>
                    <input type="tel" id="buyer-phone" name="phone" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label for="buyer-budget" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Budget Range *</label>
                        <select id="buyer-budget" name="budget" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            <option value="">Select budget range</option>
                            <option value="under-300k">Under $300K</option>
                            <option value="300k-500k">$300K - $500K</option>
                            <option value="500k-750k">$500K - $750K</option>
                            <option value="750k-1m">$750K - $1M</option>
                            <option value="1m-1.5m">$1M - $1.5M</option>
                            <option value="over-1.5m">Over $1.5M</option>
                        </select>
                    </div>
                    
                    <div>
                        <label for="buyer-location" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preferred Location *</label>
                        <select id="buyer-location" name="location" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            <option value="">Select preferred area</option>
                            <option value="dallas">Dallas</option>
                            <option value="fort-worth">Fort Worth</option>
                            <option value="plano">Plano</option>
                            <option value="arlington">Arlington</option>
                            <option value="irving">Irving</option>
                            <option value="garland">Garland</option>
                            <option value="mesquite">Mesquite</option>
                            <option value="richardson">Richardson</option>
                            <option value="any-dfw">Any DFW Area</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label for="buyer-timeline" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Timeline *</label>
                    <select id="buyer-timeline" name="timeline" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                        <option value="">Select timeline</option>
                        <option value="asap">ASAP (Express Path)</option>
                        <option value="1-3-months">1-3 months</option>
                        <option value="3-6-months">3-6 months</option>
                        <option value="6-12-months">6-12 months</option>
                        <option value="exploring">Just exploring</option>
                    </select>
                </div>
                
                <div>
                    <label for="buyer-requirements" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Specific Requirements</label>
                    <textarea id="buyer-requirements" name="requirements" rows="4" placeholder="Tell us about your specific needs, experience level, financing situation, business type preferences, etc." class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white"></textarea>
                </div>
                
                <div class="flex justify-end space-x-4">
                    <button type="button" class="modal-close px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="px-6 py-2 bg-accent hover:bg-accent-dark text-white rounded-md transition-colors">
                        Submit Buyer Inquiry
                    </button>
                </div>
            </form>
        `;
    }

    createSellerInquiryForm() {
        return `
            <form class="contact-form space-y-6" data-form-type="seller">
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label for="seller-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                        <input type="text" id="seller-name" name="name" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                    </div>

                    <div>
                        <label for="seller-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address *</label>
                        <input type="email" id="seller-email" name="email" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                    </div>
                </div>

                <div>
                    <label for="seller-phone" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number *</label>
                    <input type="tel" id="seller-phone" name="phone" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label for="seller-business-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Name *</label>
                        <input type="text" id="seller-business-name" name="businessName" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                    </div>

                    <div>
                        <label for="seller-business-type" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Type *</label>
                        <select id="seller-business-type" name="businessType" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            <option value="">Select business type</option>
                            <option value="full-service">Full Service Auto Repair</option>
                            <option value="transmission">Transmission Specialist</option>
                            <option value="auto-body">Auto Body Shop</option>
                            <option value="quick-lube">Quick Lube</option>
                            <option value="tire-shop">Tire Shop</option>
                            <option value="brake-specialist">Brake Specialist</option>
                            <option value="muffler-exhaust">Muffler & Exhaust</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label for="seller-asking-price" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Asking Price Range *</label>
                        <select id="seller-asking-price" name="askingPrice" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            <option value="">Select price range</option>
                            <option value="under-300k">Under $300K</option>
                            <option value="300k-500k">$300K - $500K</option>
                            <option value="500k-750k">$500K - $750K</option>
                            <option value="750k-1m">$750K - $1M</option>
                            <option value="1m-1.5m">$1M - $1.5M</option>
                            <option value="over-1.5m">Over $1.5M</option>
                            <option value="not-sure">Not sure yet</option>
                        </select>
                    </div>

                    <div>
                        <label for="seller-timeline" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Timeline *</label>
                        <select id="seller-timeline" name="timeline" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            <option value="">Select timeline</option>
                            <option value="asap">ASAP (Express Path)</option>
                            <option value="1-3-months">1-3 months</option>
                            <option value="3-6-months">3-6 months</option>
                            <option value="6-12-months">6-12 months</option>
                            <option value="retirement">Planning for retirement</option>
                            <option value="exploring">Just exploring</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label for="seller-reason" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reason for Selling *</label>
                    <select id="seller-reason" name="reason" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                        <option value="">Select reason</option>
                        <option value="retirement">Retirement</option>
                        <option value="health">Health reasons</option>
                        <option value="relocation">Relocation</option>
                        <option value="new-opportunity">New business opportunity</option>
                        <option value="financial">Financial reasons</option>
                        <option value="family">Family reasons</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label for="seller-details" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Additional Details</label>
                    <textarea id="seller-details" name="details" rows="4" placeholder="Tell us about your business - years in operation, annual revenue, number of employees, special equipment, lease details, etc." class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white"></textarea>
                </div>

                <div class="flex justify-end space-x-4">
                    <button type="button" class="modal-close px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors">
                        Submit Seller Inquiry
                    </button>
                </div>
            </form>
        `;
    }

    handleFormSubmission(form) {
        const formData = new FormData(form);
        const formType = form.dataset.formType;

        // Create inquiry object
        const inquiry = {
            type: formType,
            timestamp: new Date().toISOString(),
            data: {}
        };

        // Collect form data
        for (let [key, value] of formData.entries()) {
            inquiry.data[key] = value;
        }

        // Simulate form submission
        this.submitInquiry(inquiry);
    }

    submitInquiry(inquiry) {
        // Show loading state
        const submitBtn = document.querySelector('.contact-form button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Simulate API call
        setTimeout(() => {
            // In a real application, this would send to a server
            console.log('Inquiry submitted:', inquiry);

            // Store locally for demo
            const inquiries = JSON.parse(localStorage.getItem('contactInquiries') || '[]');
            inquiries.push(inquiry);
            localStorage.setItem('contactInquiries', JSON.stringify(inquiries));

            // Send email (simulated)
            this.sendInquiryEmail(inquiry);

            // Show success message
            this.showSuccessMessage(inquiry.type);

            // Close modal
            this.closeModal();

        }, 1500);
    }

    sendInquiryEmail(inquiry) {
        // In a real application, this would integrate with an email service
        const emailData = {
            to: 'contact@ardoniecapital.com',
            subject: `${inquiry.type.charAt(0).toUpperCase() + inquiry.type.slice(1)} Inquiry - ${inquiry.data.name}`,
            body: this.formatInquiryEmail(inquiry)
        };

        console.log('Sending inquiry email:', emailData);
    }

    formatInquiryEmail(inquiry) {
        let emailBody = `
New ${inquiry.type.charAt(0).toUpperCase() + inquiry.type.slice(1)} Inquiry Received

Contact Information:
- Name: ${inquiry.data.name}
- Email: ${inquiry.data.email}
- Phone: ${inquiry.data.phone || 'Not provided'}

`;

        if (inquiry.type === 'general') {
            emailBody += `
Subject: ${inquiry.data.subject}
Message: ${inquiry.data.message}
`;
        } else if (inquiry.type === 'buyer') {
            emailBody += `
Buyer Details:
- Budget Range: ${inquiry.data.budget}
- Preferred Location: ${inquiry.data.location}
- Timeline: ${inquiry.data.timeline}
- Requirements: ${inquiry.data.requirements || 'None specified'}
`;
        } else if (inquiry.type === 'seller') {
            emailBody += `
Business Details:
- Business Name: ${inquiry.data.businessName}
- Business Type: ${inquiry.data.businessType}
- Asking Price Range: ${inquiry.data.askingPrice}
- Timeline: ${inquiry.data.timeline}
- Reason for Selling: ${inquiry.data.reason}
- Additional Details: ${inquiry.data.details || 'None provided'}
`;
        }

        emailBody += `
Inquiry submitted on: ${new Date(inquiry.timestamp).toLocaleString()}
        `;

        return emailBody.trim();
    }

    showSuccessMessage(inquiryType) {
        const messages = {
            general: 'Your message has been sent successfully! We\'ll respond within 24 hours.',
            buyer: 'Your buyer inquiry has been submitted! Our team will contact you within 4-6 hours to discuss opportunities.',
            seller: 'Your seller inquiry has been received! We\'ll reach out within 4-6 hours to schedule a consultation.'
        };

        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-accent text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md transform translate-x-full transition-transform duration-300';
        message.innerHTML = `
            <div class="flex items-start">
                <svg class="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                    <h4 class="font-semibold mb-1">Success!</h4>
                    <p class="text-sm">${messages[inquiryType]}</p>
                </div>
            </div>
        `;

        document.body.appendChild(message);

        // Animate in
        setTimeout(() => {
            message.classList.remove('translate-x-full');
        }, 10);

        // Remove after 8 seconds
        setTimeout(() => {
            message.classList.add('translate-x-full');
            setTimeout(() => {
                if (message.parentNode) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 8000);
    }
}

// Initialize contact forms manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contactFormsManager = new ContactFormsManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactFormsManager;
}
