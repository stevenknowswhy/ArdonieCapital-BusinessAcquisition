/**
 * Careers Page Interactive Functionality
 * Handles job listings, applications, and admin management
 */

class CareersManager {
    constructor() {
        this.jobs = [];
        this.currentUser = null;
        this.isAdmin = false;
        
        this.init();
    }

    init() {
        this.loadSampleJobs();
        this.checkUserAuth();
        this.setupEventListeners();
        this.renderJobListings();
    }

    loadSampleJobs() {
        this.jobs = [
            {
                id: 1,
                title: "Business Development Manager",
                department: "Sales",
                location: "Dallas, TX",
                type: "Full-time",
                salaryRange: "$70,000 - $90,000",
                description: "Lead our expansion efforts in the DFW auto repair market. Build relationships with shop owners and industry professionals to grow our Express Deal program.",
                requirements: [
                    "Bachelor's degree in Business, Marketing, or related field",
                    "3+ years of B2B sales experience",
                    "Experience in automotive industry preferred",
                    "Strong communication and relationship-building skills",
                    "Ability to travel within DFW area",
                    "CRM software experience"
                ],
                benefits: [
                    "Competitive base salary plus commission",
                    "Health, dental, and vision insurance",
                    "401(k) with company match",
                    "Flexible work arrangements",
                    "Professional development opportunities",
                    "Company car allowance"
                ],
                deadline: "2024-02-15",
                postedDate: new Date('2024-01-15'),
                isActive: true
            },
            {
                id: 2,
                title: "Financial Analyst",
                department: "Finance",
                location: "Remote",
                type: "Full-time",
                salaryRange: "$60,000 - $80,000",
                description: "Analyze auto shop valuations and financial performance. Support our Express Deal program with data-driven insights and financial modeling.",
                requirements: [
                    "Bachelor's degree in Finance, Accounting, or Economics",
                    "2+ years of financial analysis experience",
                    "Advanced Excel and financial modeling skills",
                    "Experience with business valuation preferred",
                    "Strong analytical and problem-solving abilities",
                    "CPA or CFA certification a plus"
                ],
                benefits: [
                    "Competitive salary",
                    "Remote work flexibility",
                    "Health and wellness benefits",
                    "401(k) retirement plan",
                    "Professional certification support",
                    "Annual performance bonuses"
                ],
                deadline: "2024-02-28",
                postedDate: new Date('2024-01-10'),
                isActive: true
            },
            {
                id: 3,
                title: "Marketing Specialist",
                department: "Marketing",
                location: "Hybrid",
                type: "Full-time",
                salaryRange: "$50,000 - $70,000",
                description: "Drive digital marketing campaigns to attract auto shop buyers and sellers. Manage our online presence and content strategy across multiple channels.",
                requirements: [
                    "Bachelor's degree in Marketing, Communications, or related field",
                    "2+ years of digital marketing experience",
                    "Experience with Google Ads, Facebook Ads, and SEO",
                    "Content creation and copywriting skills",
                    "Analytics and data interpretation abilities",
                    "Graphic design skills a plus"
                ],
                benefits: [
                    "Competitive salary",
                    "Hybrid work model",
                    "Health insurance coverage",
                    "Professional development budget",
                    "Creative project opportunities",
                    "Team collaboration events"
                ],
                deadline: "2024-03-15",
                postedDate: new Date('2024-01-05'),
                isActive: true
            },
            {
                id: 4,
                title: "Transaction Coordinator",
                department: "Operations",
                location: "Dallas, TX",
                type: "Full-time",
                salaryRange: "$45,000 - $60,000",
                description: "Coordinate and manage the Express Deal transaction process from initial contact through closing. Ensure smooth communication between all parties.",
                requirements: [
                    "Associate's degree or equivalent experience",
                    "2+ years of project coordination experience",
                    "Strong organizational and communication skills",
                    "Experience with CRM and project management tools",
                    "Detail-oriented with excellent follow-up skills",
                    "Real estate or business transaction experience preferred"
                ],
                benefits: [
                    "Competitive salary",
                    "Health and dental insurance",
                    "Paid time off and holidays",
                    "Training and development opportunities",
                    "Collaborative work environment",
                    "Performance-based bonuses"
                ],
                deadline: "2024-02-20",
                postedDate: new Date('2024-01-08'),
                isActive: true
            },
            {
                id: 5,
                title: "Senior Software Developer",
                department: "Technology",
                location: "Remote",
                type: "Full-time",
                salaryRange: "$90,000 - $120,000",
                description: "Lead development of our marketplace platform and Express Deal technology. Build scalable solutions to support our growing business.",
                requirements: [
                    "Bachelor's degree in Computer Science or related field",
                    "5+ years of full-stack development experience",
                    "Proficiency in JavaScript, React, Node.js",
                    "Experience with cloud platforms (AWS/Azure)",
                    "Database design and optimization skills",
                    "Agile development methodology experience"
                ],
                benefits: [
                    "Competitive salary and equity",
                    "Fully remote work",
                    "Top-tier health benefits",
                    "Latest technology and equipment",
                    "Flexible schedule",
                    "Conference and training budget"
                ],
                deadline: "2024-03-01",
                postedDate: new Date('2024-01-12'),
                isActive: true
            }
        ];
    }

    checkUserAuth() {
        // Check if user is logged in and if they're an admin
        // This would integrate with the existing auth system
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.isAdmin = this.currentUser.role === 'admin';
        }
        
        // Show/hide admin controls
        this.toggleAdminControls();
    }

    toggleAdminControls() {
        const adminControls = document.getElementById('admin-controls');
        if (adminControls) {
            adminControls.style.display = this.isAdmin ? 'block' : 'none';
        }
    }

    setupEventListeners() {
        // Job listing click handlers
        document.addEventListener('click', (e) => {
            if (e.target.closest('.job-card')) {
                const jobId = parseInt(e.target.closest('.job-card').dataset.jobId);
                this.showJobDetails(jobId);
            }
        });

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeModal();
            }
        });

        // Admin add job button
        const addJobBtn = document.getElementById('add-job-btn');
        if (addJobBtn) {
            addJobBtn.addEventListener('click', () => this.showAddJobForm());
        }

        // Application form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'job-application-form') {
                e.preventDefault();
                this.submitApplication(e.target);
            }
            if (e.target.id === 'add-job-form') {
                e.preventDefault();
                this.addNewJob(e.target);
            }
        });
    }

    renderJobListings() {
        const container = document.getElementById('job-listings-container');
        if (!container) return;

        const activeJobs = this.jobs.filter(job => job.isActive);
        
        container.innerHTML = activeJobs.map(job => this.renderJobCard(job)).join('');
    }

    renderJobCard(job) {
        const daysAgo = Math.floor((new Date() - job.postedDate) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="job-card bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-lg transition-shadow" data-job-id="${job.id}">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">${job.title}</h3>
                        <p class="text-slate-600 dark:text-slate-300 mb-4">${job.description.substring(0, 120)}...</p>
                    </div>
                    <div class="text-right">
                        <span class="text-sm text-slate-500 dark:text-slate-400">${daysAgo} days ago</span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="bg-primary/10 text-primary-dark px-3 py-1 rounded-full text-sm">${job.type}</span>
                    <span class="bg-accent/10 text-accent-dark px-3 py-1 rounded-full text-sm">${job.location}</span>
                    <span class="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">${job.salaryRange}</span>
                    <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">${job.department}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-primary-dark hover:text-primary font-medium">View Details →</span>
                    <span class="text-sm text-slate-500 dark:text-slate-400">Deadline: ${new Date(job.deadline).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }

    showJobDetails(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        const modal = this.createJobDetailsModal(job);
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.modal-content').classList.remove('scale-95');
        }, 10);
    }

    createJobDetailsModal(job) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 opacity-0 transition-opacity duration-300';
        
        modal.innerHTML = `
            <div class="modal-content bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-300">
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">${job.title}</h2>
                            <div class="flex flex-wrap gap-2">
                                <span class="bg-primary/10 text-primary-dark px-3 py-1 rounded-full text-sm">${job.type}</span>
                                <span class="bg-accent/10 text-accent-dark px-3 py-1 rounded-full text-sm">${job.location}</span>
                                <span class="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">${job.salaryRange}</span>
                                <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">${job.department}</span>
                            </div>
                        </div>
                        <button type="button" class="close-modal text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onclick="careersManager.closeModal()">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    <div class="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Job Description</h3>
                            <p class="text-slate-700 dark:text-slate-300 mb-6">${job.description}</p>
                            
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Requirements</h3>
                            <ul class="list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-2 mb-6">
                                ${job.requirements.map(req => `<li>${req}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Benefits</h3>
                            <ul class="list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-2 mb-6">
                                ${job.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                            </ul>
                            
                            <div class="bg-accent/10 p-4 rounded-lg mb-6">
                                <h4 class="font-semibold text-accent-dark mb-2">Application Deadline</h4>
                                <p class="text-slate-700 dark:text-slate-300">${new Date(job.deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            
                            <button type="button" onclick="careersManager.showApplicationForm(${job.id})" class="w-full bg-primary-dark hover:bg-primary text-white font-medium py-3 px-6 rounded-md transition-colors">
                                Apply for This Position
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    showApplicationForm(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        this.closeModal(); // Close job details modal first

        const modal = this.createApplicationModal(job);
        document.body.appendChild(modal);

        // Animate in
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.modal-content').classList.remove('scale-95');
        }, 10);
    }

    createApplicationModal(job) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 opacity-0 transition-opacity duration-300';

        modal.innerHTML = `
            <div class="modal-content bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-300">
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Apply for ${job.title}</h2>
                        <button type="button" class="close-modal text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onclick="careersManager.closeModal()">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <form id="job-application-form" class="p-6" data-job-id="${job.id}">
                    <div class="grid md:grid-cols-2 gap-6">
                        <!-- Personal Information -->
                        <div>
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Personal Information</h3>

                            <div class="mb-4">
                                <label for="fullName" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
                                <input type="text" id="fullName" name="fullName" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            </div>

                            <div class="mb-4">
                                <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address *</label>
                                <input type="email" id="email" name="email" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            </div>

                            <div class="mb-4">
                                <label for="phone" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number *</label>
                                <input type="tel" id="phone" name="phone" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            </div>

                            <div class="mb-4">
                                <label for="address" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mailing Address</label>
                                <textarea id="address" name="address" rows="3" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white"></textarea>
                            </div>
                        </div>

                        <!-- Employment Details -->
                        <div>
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Employment Details</h3>

                            <div class="mb-4">
                                <label for="currentStatus" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Employment Status *</label>
                                <select id="currentStatus" name="currentStatus" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                                    <option value="">Select status</option>
                                    <option value="employed">Currently Employed</option>
                                    <option value="unemployed">Unemployed</option>
                                    <option value="student">Student</option>
                                    <option value="freelance">Freelancer/Contractor</option>
                                </select>
                            </div>

                            <div class="mb-4">
                                <label for="startDate" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Desired Start Date *</label>
                                <input type="date" id="startDate" name="startDate" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            </div>

                            <div class="mb-4">
                                <label for="salaryExpectation" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Salary Expectations</label>
                                <input type="text" id="salaryExpectation" name="salaryExpectation" placeholder="e.g., $60,000 - $70,000" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            </div>

                            <div class="mb-4">
                                <label for="resume" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Resume *</label>
                                <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF or DOC format, max 5MB</p>
                            </div>
                        </div>
                    </div>

                    <!-- Cover Letter -->
                    <div class="mt-6">
                        <label for="coverLetter" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cover Letter (Optional)</label>
                        <textarea id="coverLetter" name="coverLetter" rows="6" placeholder="Tell us why you're interested in this position and what makes you a great fit..." class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white"></textarea>
                    </div>

                    <!-- Terms and Conditions -->
                    <div class="mt-6">
                        <label class="flex items-start">
                            <input type="checkbox" id="agreeTerms" name="agreeTerms" required class="mt-1 mr-3">
                            <span class="text-sm text-slate-700 dark:text-slate-300">
                                I agree to the <a href="#" class="text-primary-dark hover:text-primary">Terms and Conditions</a> and consent to the processing of my personal data for recruitment purposes.
                            </span>
                        </label>
                    </div>

                    <!-- Submit Button -->
                    <div class="mt-8 flex justify-end space-x-4">
                        <button type="button" onclick="careersManager.closeModal()" class="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-6 py-2 bg-primary-dark hover:bg-primary text-white rounded-md transition-colors">
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        `;

        return modal;
    }

    submitApplication(form) {
        const formData = new FormData(form);
        const jobId = form.dataset.jobId;
        const job = this.jobs.find(j => j.id === parseInt(jobId));

        // Validate file size
        const resumeFile = formData.get('resume');
        if (resumeFile && resumeFile.size > 5 * 1024 * 1024) { // 5MB
            alert('Resume file size must be less than 5MB');
            return;
        }

        // Create application object
        const application = {
            jobId: parseInt(jobId),
            jobTitle: job.title,
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            currentStatus: formData.get('currentStatus'),
            startDate: formData.get('startDate'),
            salaryExpectation: formData.get('salaryExpectation'),
            coverLetter: formData.get('coverLetter'),
            submittedAt: new Date().toISOString(),
            resumeFileName: resumeFile ? resumeFile.name : null
        };

        // In a real application, this would send to a server
        this.sendApplicationEmail(application, resumeFile);

        // Show success message
        this.showSuccessMessage();
        this.closeModal();
    }

    sendApplicationEmail(application, resumeFile) {
        // In a real application, this would integrate with an email service
        // For demo purposes, we'll simulate the email sending
        console.log('Sending application email:', {
            to: 'careers@ardoniecapital.com',
            subject: `Job Application - ${application.jobTitle} - ${application.fullName}`,
            body: this.formatApplicationEmail(application),
            attachment: resumeFile
        });

        // Store application locally for demo
        const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        applications.push(application);
        localStorage.setItem('jobApplications', JSON.stringify(applications));
    }

    formatApplicationEmail(application) {
        return `
New Job Application Received

Position: ${application.jobTitle}
Applicant: ${application.fullName}
Email: ${application.email}
Phone: ${application.phone}
Address: ${application.address}

Employment Details:
- Current Status: ${application.currentStatus}
- Desired Start Date: ${application.startDate}
- Salary Expectations: ${application.salaryExpectation || 'Not specified'}

Cover Letter:
${application.coverLetter || 'No cover letter provided'}

Application submitted on: ${new Date(application.submittedAt).toLocaleString()}
Resume attached: ${application.resumeFileName || 'No resume attached'}
        `.trim();
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-accent text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        message.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Application submitted successfully!
            </div>
        `;

        document.body.appendChild(message);

        // Animate in
        setTimeout(() => {
            message.classList.remove('translate-x-full');
        }, 10);

        // Remove after 5 seconds
        setTimeout(() => {
            message.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 5000);
    }

    // Admin functionality
    showAddJobForm() {
        if (!this.isAdmin) {
            alert('Access denied. Admin privileges required.');
            return;
        }

        const modal = this.createAddJobModal();
        document.body.appendChild(modal);

        // Animate in
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.modal-content').classList.remove('scale-95');
        }, 10);
    }

    createAddJobModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 opacity-0 transition-opacity duration-300';

        modal.innerHTML = `
            <div class="modal-content bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-300">
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Add New Job Listing</h2>
                        <button type="button" class="close-modal text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onclick="careersManager.closeModal()">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <form id="add-job-form" class="p-6">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <div class="mb-4">
                                <label for="jobTitle" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Title *</label>
                                <input type="text" id="jobTitle" name="jobTitle" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            </div>

                            <div class="mb-4">
                                <label for="department" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Department *</label>
                                <select id="department" name="department" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                                    <option value="">Select department</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Human Resources">Human Resources</option>
                                </select>
                            </div>

                            <div class="mb-4">
                                <label for="location" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location *</label>
                                <input type="text" id="location" name="location" required placeholder="e.g., Dallas, TX or Remote" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            </div>

                            <div class="mb-4">
                                <label for="jobType" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Type *</label>
                                <select id="jobType" name="jobType" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                                    <option value="">Select type</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>

                            <div class="mb-4">
                                <label for="salaryRange" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Salary Range</label>
                                <input type="text" id="salaryRange" name="salaryRange" placeholder="e.g., $60,000 - $80,000" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            </div>

                            <div class="mb-4">
                                <label for="deadline" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Application Deadline *</label>
                                <input type="date" id="deadline" name="deadline" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white">
                            </div>
                        </div>

                        <div>
                            <div class="mb-4">
                                <label for="description" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Description *</label>
                                <textarea id="description" name="description" rows="6" required class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white"></textarea>
                            </div>

                            <div class="mb-4">
                                <label for="requirements" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Requirements (one per line) *</label>
                                <textarea id="requirements" name="requirements" rows="6" required placeholder="Bachelor's degree in relevant field&#10;3+ years of experience&#10;Strong communication skills" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white"></textarea>
                            </div>

                            <div class="mb-4">
                                <label for="benefits" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Benefits (one per line) *</label>
                                <textarea id="benefits" name="benefits" rows="6" required placeholder="Health insurance&#10;401(k) matching&#10;Flexible work arrangements" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark dark:bg-slate-700 dark:text-white"></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 flex justify-end space-x-4">
                        <button type="button" onclick="careersManager.closeModal()" class="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-6 py-2 bg-primary-dark hover:bg-primary text-white rounded-md transition-colors">
                            Add Job Listing
                        </button>
                    </div>
                </form>
            </div>
        `;

        return modal;
    }

    addNewJob(form) {
        const formData = new FormData(form);

        const newJob = {
            id: Math.max(...this.jobs.map(j => j.id)) + 1,
            title: formData.get('jobTitle'),
            department: formData.get('department'),
            location: formData.get('location'),
            type: formData.get('jobType'),
            salaryRange: formData.get('salaryRange'),
            description: formData.get('description'),
            requirements: formData.get('requirements').split('\n').filter(req => req.trim()),
            benefits: formData.get('benefits').split('\n').filter(benefit => benefit.trim()),
            deadline: formData.get('deadline'),
            postedDate: new Date(),
            isActive: true
        };

        this.jobs.push(newJob);
        this.renderJobListings();
        this.closeModal();

        // Show success message
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-accent text-white px-6 py-4 rounded-lg shadow-lg z-50';
        message.textContent = 'Job listing added successfully!';
        document.body.appendChild(message);

        setTimeout(() => {
            document.body.removeChild(message);
        }, 3000);
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal-backdrop');
        modals.forEach(modal => {
            modal.classList.add('opacity-0');
            modal.querySelector('.modal-content').classList.add('scale-95');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        });
    }
}

// Initialize careers manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.careersManager = new CareersManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CareersManager;
}
