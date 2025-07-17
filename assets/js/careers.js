/**
 * Careers Page Interactive Functionality
 * Handles job listings, applications, and admin management
 */

class CareersManager {
    constructor() {
        this.jobs = [];
        this.applications = [];
        this.currentUser = null;
        this.isAdmin = false;
        this.currentFilters = {
            department: 'all',
            location: 'all',
            type: 'all',
            search: ''
        };

        this.init();
    }

    init() {
        this.loadSampleJobs();
        this.loadApplications();
        this.checkUserAuth();
        this.setupEventListeners();
        this.setupFilters();
        this.renderJobListings();
        this.updateJobStats();
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
        const noJobsMessage = document.getElementById('no-jobs-message');

        if (!container) {
            return;
        }

        const activeJobs = this.filterJobs();

        if (activeJobs.length === 0) {
            // Show no jobs message
            container.innerHTML = '';
            if (noJobsMessage) {
                noJobsMessage.classList.remove('hidden');
            }
        } else {
            // Show job listings
            container.innerHTML = activeJobs.map(job => this.renderJobCard(job)).join('');
            if (noJobsMessage) {
                noJobsMessage.classList.add('hidden');
            }
        }

        // Update job statistics
        this.updateJobStats();
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
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">${job.type}</span>
                    <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">${job.location}</span>
                    <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">${job.salaryRange}</span>
                    <span class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">${job.department}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">View Details →</span>
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
        modal.className = 'modal-backdrop modal-backdrop-enhanced fixed inset-0 bg-black flex items-center justify-center p-4 z-50 opacity-0 transition-opacity duration-300';
        
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
        modal.className = 'modal-backdrop modal-backdrop-enhanced fixed inset-0 bg-black flex items-center justify-center p-4 z-50 opacity-0 transition-opacity duration-300';

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

                            <div class="admin-form-group">
                                <label for="fullName" class="admin-label">Full Name *</label>
                                <input type="text" id="fullName" name="fullName" required class="admin-input w-full" placeholder="Enter your full name">
                            </div>

                            <div class="admin-form-group">
                                <label for="email" class="admin-label">Email Address *</label>
                                <input type="email" id="email" name="email" required class="admin-input w-full" placeholder="Enter your email address">
                            </div>

                            <div class="admin-form-group">
                                <label for="phone" class="admin-label">Phone Number *</label>
                                <input type="tel" id="phone" name="phone" required class="admin-input w-full" placeholder="Enter your phone number">
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

                            <div class="admin-form-group">
                                <label for="startDate" class="admin-label">Desired Start Date *</label>
                                <input type="date" id="startDate" name="startDate" required class="admin-input w-full">
                            </div>

                            <div class="admin-form-group">
                                <label for="salaryExpectation" class="admin-label">Salary Expectations</label>
                                <input type="text" id="salaryExpectation" name="salaryExpectation" placeholder="e.g., $60,000 - $70,000" class="admin-input w-full">
                            </div>

                            <div class="admin-form-group">
                                <label for="resume" class="admin-label">Resume *</label>
                                <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" required class="admin-input w-full">
                                <p class="admin-help-text">PDF or DOC format, max 5MB</p>
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
                        <label class="flex items-start space-x-3">
                            <input type="checkbox" id="agreeTerms" name="agreeTerms" required class="admin-checkbox mt-1">
                            <span class="admin-label mb-0 cursor-pointer">
                                I agree to the <a href="#" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">Terms and Conditions</a> and consent to the processing of my personal data for recruitment purposes.
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
        modal.className = 'modal-backdrop modal-backdrop-enhanced fixed inset-0 bg-black flex items-center justify-center p-4 z-50 opacity-0 transition-opacity duration-300';

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
                            <div class="admin-form-group">
                                <label for="jobTitle" class="admin-label">Job Title *</label>
                                <input type="text" id="jobTitle" name="jobTitle" required class="admin-input w-full" placeholder="Enter job title">
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

                            <div class="admin-form-group">
                                <label for="location" class="admin-label">Location *</label>
                                <input type="text" id="location" name="location" required placeholder="e.g., Dallas, TX or Remote" class="admin-input w-full">
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

                            <div class="admin-form-group">
                                <label for="salaryRange" class="admin-label">Salary Range</label>
                                <input type="text" id="salaryRange" name="salaryRange" placeholder="e.g., $60,000 - $80,000" class="admin-input w-full">
                            </div>

                            <div class="admin-form-group">
                                <label for="deadline" class="admin-label">Application Deadline *</label>
                                <input type="date" id="deadline" name="deadline" required class="admin-input w-full">
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

    // Enhanced Job Management Methods

    loadApplications() {
        this.applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    }

    setupFilters() {
        this.createFilterInterface();
        this.attachFilterListeners();
    }

    createFilterInterface() {
        const container = document.getElementById('job-listings-container');
        if (!container) return;

        const filterHTML = `
            <div id="job-filters" class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
                <div class="flex flex-wrap items-center gap-4">
                    <div class="flex-1 min-w-64">
                        <input type="text" id="job-search" placeholder="Search jobs..."
                               class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                    </div>
                    <div>
                        <select id="department-filter" class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                            <option value="all">All Departments</option>
                            <option value="Sales">Sales</option>
                            <option value="Operations">Operations</option>
                            <option value="Technology">Technology</option>
                            <option value="Finance">Finance</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>
                    <div>
                        <select id="location-filter" class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                            <option value="all">All Locations</option>
                            <option value="Dallas, TX">Dallas, TX</option>
                            <option value="Plano, TX">Plano, TX</option>
                            <option value="Remote">Remote</option>
                        </select>
                    </div>
                    <div>
                        <select id="type-filter" class="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                            <option value="all">All Types</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                        </select>
                    </div>
                    ${this.isAdmin ? `
                        <div class="ml-auto">
                            <button id="admin-dashboard-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                                Admin Dashboard
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div id="job-stats" class="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    <!-- Job statistics will be populated here -->
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforebegin', filterHTML);
    }

    attachFilterListeners() {
        const searchInput = document.getElementById('job-search');
        const departmentFilter = document.getElementById('department-filter');
        const locationFilter = document.getElementById('location-filter');
        const typeFilter = document.getElementById('type-filter');
        const adminDashboardBtn = document.getElementById('admin-dashboard-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.renderJobListings();
            });
        }

        if (departmentFilter) {
            departmentFilter.addEventListener('change', (e) => {
                this.currentFilters.department = e.target.value;
                this.renderJobListings();
            });
        }

        if (locationFilter) {
            locationFilter.addEventListener('change', (e) => {
                this.currentFilters.location = e.target.value;
                this.renderJobListings();
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.currentFilters.type = e.target.value;
                this.renderJobListings();
            });
        }

        if (adminDashboardBtn) {
            adminDashboardBtn.addEventListener('click', () => {
                this.showAdminDashboard();
            });
        }
    }

    filterJobs() {
        return this.jobs.filter(job => {
            if (!job.isActive) return false;

            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search;
                const searchableText = `${job.title} ${job.description} ${job.department} ${job.location}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) return false;
            }

            // Department filter
            if (this.currentFilters.department !== 'all' && job.department !== this.currentFilters.department) {
                return false;
            }

            // Location filter
            if (this.currentFilters.location !== 'all' && job.location !== this.currentFilters.location) {
                return false;
            }

            // Type filter
            if (this.currentFilters.type !== 'all' && job.type !== this.currentFilters.type) {
                return false;
            }

            return true;
        });
    }

    updateJobStats() {
        const statsContainer = document.getElementById('job-stats');
        if (!statsContainer) return;

        const filteredJobs = this.filterJobs();
        const totalJobs = this.jobs.filter(job => job.isActive).length;
        const totalApplications = this.applications.length;

        statsContainer.innerHTML = `
            Showing ${filteredJobs.length} of ${totalJobs} open positions
            ${this.isAdmin ? ` • ${totalApplications} total applications received` : ''}
        `;
    }

    showAdminDashboard() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';

        modal.innerHTML = `
            <div class="modal-content bg-white dark:bg-slate-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Job Management Dashboard</h2>
                        <button type="button" class="close-modal text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onclick="careersManager.closeModal()">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="p-6">
                    <!-- Dashboard Tabs -->
                    <div class="border-b border-slate-200 dark:border-slate-700 mb-6">
                        <nav class="-mb-px flex space-x-8">
                            <button class="dashboard-tab active py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm" data-tab="overview">
                                Overview
                            </button>
                            <button class="dashboard-tab py-2 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm" data-tab="jobs">
                                Manage Jobs
                            </button>
                            <button class="dashboard-tab py-2 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm" data-tab="applications">
                                Applications
                            </button>
                            <button class="dashboard-tab py-2 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm" data-tab="analytics">
                                Analytics
                            </button>
                        </nav>
                    </div>

                    <!-- Tab Content -->
                    <div id="dashboard-content">
                        ${this.renderDashboardOverview()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupDashboardTabs(modal);
    }

    setupDashboardTabs(modal) {
        const tabs = modal.querySelectorAll('.dashboard-tab');
        const content = modal.querySelector('#dashboard-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => {
                    t.classList.remove('active', 'border-blue-500', 'text-blue-600');
                    t.classList.add('border-transparent', 'text-slate-500');
                });
                tab.classList.add('active', 'border-blue-500', 'text-blue-600');
                tab.classList.remove('border-transparent', 'text-slate-500');

                // Update content
                const tabName = tab.dataset.tab;
                switch(tabName) {
                    case 'overview':
                        content.innerHTML = this.renderDashboardOverview();
                        break;
                    case 'jobs':
                        content.innerHTML = this.renderJobsManagement();
                        break;
                    case 'applications':
                        content.innerHTML = this.renderApplicationsManagement();
                        break;
                    case 'analytics':
                        content.innerHTML = this.renderAnalytics();
                        break;
                }
            });
        });
    }

    renderDashboardOverview() {
        const totalJobs = this.jobs.length;
        const activeJobs = this.jobs.filter(job => job.isActive).length;
        const totalApplications = this.applications.length;
        const recentApplications = this.applications.filter(app => {
            const appDate = new Date(app.submittedAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return appDate >= weekAgo;
        }).length;

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM8 14v.01M12 14v.01M16 14v.01"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-blue-600 dark:text-blue-400">Total Jobs</p>
                            <p class="text-2xl font-semibold text-blue-900 dark:text-blue-100">${totalJobs}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-green-600 dark:text-green-400">Active Jobs</p>
                            <p class="text-2xl font-semibold text-green-900 dark:text-green-100">${activeJobs}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-purple-600 dark:text-purple-400">Total Applications</p>
                            <p class="text-2xl font-semibold text-purple-900 dark:text-purple-100">${totalApplications}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                            <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-orange-600 dark:text-orange-400">This Week</p>
                            <p class="text-2xl font-semibold text-orange-900 dark:text-orange-100">${recentApplications}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white dark:bg-slate-700 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Applications</h3>
                    <div class="space-y-3">
                        ${this.applications.slice(0, 5).map(app => `
                            <div class="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-600 rounded-lg">
                                <div>
                                    <p class="font-medium text-slate-900 dark:text-white">${app.name}</p>
                                    <p class="text-sm text-slate-600 dark:text-slate-300">${app.jobTitle}</p>
                                </div>
                                <span class="text-sm text-slate-500 dark:text-slate-400">
                                    ${new Date(app.submittedAt).toLocaleDateString()}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-700 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Job Performance</h3>
                    <div class="space-y-3">
                        ${this.jobs.filter(job => job.isActive).slice(0, 5).map(job => {
                            const jobApplications = this.applications.filter(app => app.jobId === job.id).length;
                            return `
                                <div class="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-600 rounded-lg">
                                    <div>
                                        <p class="font-medium text-slate-900 dark:text-white">${job.title}</p>
                                        <p class="text-sm text-slate-600 dark:text-slate-300">${job.department}</p>
                                    </div>
                                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                        ${jobApplications} applications
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderJobsManagement() {
        return `
            <div class="mb-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Manage Jobs</h3>
                    <button onclick="careersManager.showAddJobForm()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                        Add New Job
                    </button>
                </div>
            </div>

            <div class="bg-white dark:bg-slate-700 rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-600">
                        <thead class="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Job Title</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Department</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Location</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Applications</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-slate-700 divide-y divide-slate-200 dark:divide-slate-600">
                            ${this.jobs.map(job => {
                                const jobApplications = this.applications.filter(app => app.jobId === job.id).length;
                                return `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm font-medium text-slate-900 dark:text-white">${job.title}</div>
                                            <div class="text-sm text-slate-500 dark:text-slate-400">${job.type}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">${job.department}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">${job.location}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">${jobApplications}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                                ${job.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onclick="careersManager.editJob('${job.id}')" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                            <button onclick="careersManager.toggleJobStatus('${job.id}')" class="text-${job.isActive ? 'red' : 'green'}-600 hover:text-${job.isActive ? 'red' : 'green'}-900 mr-3">
                                                ${job.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button onclick="careersManager.deleteJob('${job.id}')" class="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Enhanced Job Management Methods
    showAddJobForm() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';

        modal.innerHTML = `
            <div class="modal-content bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Add New Job Posting</h2>
                        <button type="button" class="close-modal text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onclick="careersManager.closeModal()">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <form id="add-job-form" class="p-6 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Job Title -->
                        <div class="md:col-span-2">
                            <label for="job-title" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Title *</label>
                            <input type="text" id="job-title" name="title" required
                                   class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                        </div>

                        <!-- Department -->
                        <div>
                            <label for="job-department" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Department *</label>
                            <select id="job-department" name="department" required
                                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                <option value="">Select Department</option>
                                <option value="Sales">Sales</option>
                                <option value="Operations">Operations</option>
                                <option value="Technology">Technology</option>
                                <option value="Finance">Finance</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Human Resources">Human Resources</option>
                            </select>
                        </div>

                        <!-- Location -->
                        <div>
                            <label for="job-location" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location *</label>
                            <select id="job-location" name="location" required
                                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                <option value="">Select Location</option>
                                <option value="Dallas, TX">Dallas, TX</option>
                                <option value="Plano, TX">Plano, TX</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>

                        <!-- Job Type -->
                        <div>
                            <label for="job-type" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Type *</label>
                            <select id="job-type" name="type" required
                                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                <option value="">Select Type</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Temporary">Temporary</option>
                            </select>
                        </div>

                        <!-- Salary Range -->
                        <div>
                            <label for="job-salary" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Salary Range *</label>
                            <input type="text" id="job-salary" name="salaryRange" required placeholder="e.g., $50,000 - $70,000"
                                   class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                        </div>

                        <!-- Application Deadline -->
                        <div class="md:col-span-2">
                            <label for="job-deadline" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Application Deadline *</label>
                            <input type="date" id="job-deadline" name="deadline" required
                                   class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                        </div>
                    </div>

                    <!-- Job Description -->
                    <div>
                        <label for="job-description" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Description *</label>
                        <textarea id="job-description" name="description" rows="4" required
                                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                  placeholder="Provide a detailed description of the role, responsibilities, and what the candidate will be doing..."></textarea>
                    </div>

                    <!-- Requirements -->
                    <div>
                        <label for="job-requirements" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Requirements *</label>
                        <textarea id="job-requirements" name="requirements" rows="4" required
                                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                  placeholder="List each requirement on a new line..."></textarea>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter each requirement on a separate line</p>
                    </div>

                    <!-- Benefits -->
                    <div>
                        <label for="job-benefits" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Benefits *</label>
                        <textarea id="job-benefits" name="benefits" rows="4" required
                                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                  placeholder="List each benefit on a new line..."></textarea>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter each benefit on a separate line</p>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onclick="careersManager.closeModal()"
                                class="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                            Cancel
                        </button>
                        <button type="submit"
                                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                            Create Job Posting
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Set minimum date to today
        const deadlineInput = document.getElementById('job-deadline');
        const today = new Date().toISOString().split('T')[0];
        deadlineInput.min = today;

        // Handle form submission
        document.getElementById('add-job-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddJob(e.target);
        });
    }

    editJob(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        const modal = document.createElement('div');
        modal.className = 'modal-backdrop modal-backdrop-enhanced fixed inset-0 bg-black flex items-center justify-center p-4 z-50';

        modal.innerHTML = `
            <div class="modal-content bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Edit Job Posting</h2>
                        <button type="button" class="close-modal text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onclick="careersManager.closeModal()">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <form id="edit-job-form" class="p-6 space-y-6">
                    <input type="hidden" name="jobId" value="${job.id}">

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Job Title -->
                        <div class="md:col-span-2">
                            <label for="edit-job-title" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Title *</label>
                            <input type="text" id="edit-job-title" name="title" value="${job.title}" required
                                   class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                        </div>

                        <!-- Department -->
                        <div>
                            <label for="edit-job-department" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Department *</label>
                            <select id="edit-job-department" name="department" required
                                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                <option value="Sales" ${job.department === 'Sales' ? 'selected' : ''}>Sales</option>
                                <option value="Operations" ${job.department === 'Operations' ? 'selected' : ''}>Operations</option>
                                <option value="Technology" ${job.department === 'Technology' ? 'selected' : ''}>Technology</option>
                                <option value="Finance" ${job.department === 'Finance' ? 'selected' : ''}>Finance</option>
                                <option value="Marketing" ${job.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                                <option value="Human Resources" ${job.department === 'Human Resources' ? 'selected' : ''}>Human Resources</option>
                            </select>
                        </div>

                        <!-- Location -->
                        <div>
                            <label for="edit-job-location" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location *</label>
                            <select id="edit-job-location" name="location" required
                                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                <option value="Dallas, TX" ${job.location === 'Dallas, TX' ? 'selected' : ''}>Dallas, TX</option>
                                <option value="Plano, TX" ${job.location === 'Plano, TX' ? 'selected' : ''}>Plano, TX</option>
                                <option value="Remote" ${job.location === 'Remote' ? 'selected' : ''}>Remote</option>
                                <option value="Hybrid" ${job.location === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                            </select>
                        </div>

                        <!-- Job Type -->
                        <div>
                            <label for="edit-job-type" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Type *</label>
                            <select id="edit-job-type" name="type" required
                                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                <option value="Full-time" ${job.type === 'Full-time' ? 'selected' : ''}>Full-time</option>
                                <option value="Part-time" ${job.type === 'Part-time' ? 'selected' : ''}>Part-time</option>
                                <option value="Contract" ${job.type === 'Contract' ? 'selected' : ''}>Contract</option>
                                <option value="Internship" ${job.type === 'Internship' ? 'selected' : ''}>Internship</option>
                                <option value="Temporary" ${job.type === 'Temporary' ? 'selected' : ''}>Temporary</option>
                            </select>
                        </div>

                        <!-- Salary Range -->
                        <div>
                            <label for="edit-job-salary" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Salary Range *</label>
                            <input type="text" id="edit-job-salary" name="salaryRange" value="${job.salaryRange}" required
                                   class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                        </div>

                        <!-- Application Deadline -->
                        <div class="md:col-span-2">
                            <label for="edit-job-deadline" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Application Deadline *</label>
                            <input type="date" id="edit-job-deadline" name="deadline" value="${job.deadline}" required
                                   class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                        </div>
                    </div>

                    <!-- Job Description -->
                    <div>
                        <label for="edit-job-description" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Description *</label>
                        <textarea id="edit-job-description" name="description" rows="4" required
                                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">${job.description}</textarea>
                    </div>

                    <!-- Requirements -->
                    <div>
                        <label for="edit-job-requirements" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Requirements *</label>
                        <textarea id="edit-job-requirements" name="requirements" rows="4" required
                                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">${job.requirements ? job.requirements.join('\n') : ''}</textarea>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter each requirement on a separate line</p>
                    </div>

                    <!-- Benefits -->
                    <div>
                        <label for="edit-job-benefits" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Benefits *</label>
                        <textarea id="edit-job-benefits" name="benefits" rows="4" required
                                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">${job.benefits ? job.benefits.join('\n') : ''}</textarea>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter each benefit on a separate line</p>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onclick="careersManager.closeModal()"
                                class="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                            Cancel
                        </button>
                        <button type="submit"
                                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                            Update Job Posting
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        document.getElementById('edit-job-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditJob(e.target);
        });
    }

    toggleJobStatus(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (job) {
            job.isActive = !job.isActive;
            this.saveJobs();
            this.showAdminDashboard(); // Refresh dashboard
        }
    }

    deleteJob(jobId) {
        if (confirm('Are you sure you want to delete this job?')) {
            this.jobs = this.jobs.filter(j => j.id !== jobId);
            this.saveJobs();
            this.showAdminDashboard(); // Refresh dashboard
        }
    }

    // Application Management Methods
    updateApplicationStatus(appId, newStatus) {
        const application = this.applications.find(app => app.id === appId);
        if (application) {
            application.status = newStatus;
            this.saveApplications();
        }
    }

    viewApplication(appId) {
        const application = this.applications.find(app => app.id === appId);
        if (!application) return;

        const modal = document.createElement('div');
        modal.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';

        modal.innerHTML = `
            <div class="modal-content bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Application Details</h2>
                        <button type="button" class="close-modal text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onclick="careersManager.closeModal()">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="p-6 space-y-6">
                    <!-- Application Status -->
                    <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">${application.name}</h3>
                                <p class="text-slate-600 dark:text-slate-300">Applied for: ${application.jobTitle}</p>
                            </div>
                            <div class="text-right">
                                <span class="inline-flex px-3 py-1 rounded-full text-sm font-medium ${this.getStatusBadgeClass(application.status)}">
                                    ${application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    ${new Date(application.submittedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="text-lg font-medium text-slate-900 dark:text-white mb-3">Contact Information</h4>
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                                    <p class="text-slate-900 dark:text-white">${application.email}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-slate-400">Phone</label>
                                    <p class="text-slate-900 dark:text-white">${application.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-slate-400">LinkedIn</label>
                                    <p class="text-slate-900 dark:text-white">${application.linkedin || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 class="text-lg font-medium text-slate-900 dark:text-white mb-3">Application Details</h4>
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-slate-400">Experience Level</label>
                                    <p class="text-slate-900 dark:text-white">${application.experience || 'Not specified'}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-slate-400">Salary Expectation</label>
                                    <p class="text-slate-900 dark:text-white">${application.salaryExpectation || 'Not specified'}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-slate-400">Start Date</label>
                                    <p class="text-slate-900 dark:text-white">${application.startDate || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cover Letter -->
                    ${application.coverLetter ? `
                        <div>
                            <h4 class="text-lg font-medium text-slate-900 dark:text-white mb-3">Cover Letter</h4>
                            <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                <p class="text-slate-900 dark:text-white whitespace-pre-wrap">${application.coverLetter}</p>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Resume -->
                    <div>
                        <h4 class="text-lg font-medium text-slate-900 dark:text-white mb-3">Resume</h4>
                        <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                            ${application.resumeFile ? `
                                <div class="flex items-center space-x-3">
                                    <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                                    </svg>
                                    <div>
                                        <p class="font-medium text-slate-900 dark:text-white">${application.resumeFile.name}</p>
                                        <p class="text-sm text-slate-500 dark:text-slate-400">${this.formatFileSize(application.resumeFile.size)}</p>
                                    </div>
                                    <button onclick="careersManager.downloadResume('${appId}')"
                                            class="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                                        Download
                                    </button>
                                </div>
                            ` : `
                                <p class="text-slate-500 dark:text-slate-400">No resume uploaded</p>
                            `}
                        </div>
                    </div>

                    <!-- Status Management -->
                    <div class="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <h4 class="text-lg font-medium text-slate-900 dark:text-white mb-3">Update Status</h4>
                        <div class="flex items-center space-x-4">
                            <select id="status-update-${appId}" class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                                <option value="pending" ${application.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="reviewing" ${application.status === 'reviewing' ? 'selected' : ''}>Reviewing</option>
                                <option value="interview" ${application.status === 'interview' ? 'selected' : ''}>Interview</option>
                                <option value="accepted" ${application.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                                <option value="rejected" ${application.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                            </select>
                            <button onclick="careersManager.updateApplicationStatusFromModal('${appId}')"
                                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                                Update Status
                            </button>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button onclick="careersManager.closeModal()"
                                class="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                            Close
                        </button>
                        <button onclick="careersManager.deleteApplication('${appId}'); careersManager.closeModal();"
                                class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                            Delete Application
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    getStatusBadgeClass(status) {
        const classes = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'reviewing': 'bg-blue-100 text-blue-800',
            'interview': 'bg-purple-100 text-purple-800',
            'accepted': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateApplicationStatusFromModal(appId) {
        const select = document.getElementById(`status-update-${appId}`);
        const newStatus = select.value;
        this.updateApplicationStatus(appId, newStatus);
        this.showNotification('Application status updated successfully!', 'success');

        // Update the status badge in the modal
        const statusBadge = document.querySelector('.modal-content .inline-flex');
        if (statusBadge) {
            statusBadge.className = `inline-flex px-3 py-1 rounded-full text-sm font-medium ${this.getStatusBadgeClass(newStatus)}`;
            statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        }
    }

    downloadResume(appId) {
        // Implementation for resume download
        alert(`Download Resume for Application ${appId} - To be implemented`);
    }

    deleteApplication(appId) {
        if (confirm('Are you sure you want to delete this application?')) {
            this.applications = this.applications.filter(app => app.id !== appId);
            this.saveApplications();
            this.showAdminDashboard(); // Refresh dashboard
        }
    }

    renderAnalytics() {
        const departmentStats = {};
        const locationStats = {};
        const statusStats = {};
        const monthlyStats = this.calculateMonthlyStats();

        // Calculate department statistics
        this.jobs.forEach(job => {
            if (!departmentStats[job.department]) {
                departmentStats[job.department] = { jobs: 0, applications: 0, activeJobs: 0 };
            }
            departmentStats[job.department].jobs++;
            if (job.isActive) departmentStats[job.department].activeJobs++;
            departmentStats[job.department].applications += this.applications.filter(app => app.jobId === job.id).length;
        });

        // Calculate location statistics
        this.jobs.forEach(job => {
            if (!locationStats[job.location]) {
                locationStats[job.location] = { jobs: 0, applications: 0, activeJobs: 0 };
            }
            locationStats[job.location].jobs++;
            if (job.isActive) locationStats[job.location].activeJobs++;
            locationStats[job.location].applications += this.applications.filter(app => app.jobId === job.id).length;
        });

        // Calculate application status statistics
        this.applications.forEach(app => {
            statusStats[app.status] = (statusStats[app.status] || 0) + 1;
        });

        return `
            <div class="space-y-8">
                <!-- Key Metrics -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM8 14v.01M12 14v.01M16 14v.01"></path>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-blue-600 dark:text-blue-400">Total Jobs</p>
                                <p class="text-2xl font-semibold text-blue-900 dark:text-blue-100">${this.jobs.length}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-green-600 dark:text-green-400">Active Jobs</p>
                                <p class="text-2xl font-semibold text-green-900 dark:text-green-100">${this.jobs.filter(job => job.isActive).length}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-purple-600 dark:text-purple-400">Applications</p>
                                <p class="text-2xl font-semibold text-purple-900 dark:text-purple-100">${this.applications.length}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                        <div class="flex items-center">
                            <div class="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                                <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                </svg>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-orange-600 dark:text-orange-400">Avg per Job</p>
                                <p class="text-2xl font-semibold text-orange-900 dark:text-orange-100">${this.jobs.length > 0 ? Math.round(this.applications.length / this.jobs.length * 10) / 10 : 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts and Statistics -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Department Statistics -->
                    <div class="bg-white dark:bg-slate-700 rounded-lg p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Department Performance</h3>
                            <button onclick="careersManager.exportDepartmentData()" class="text-sm text-blue-600 hover:text-blue-800">Export</button>
                        </div>
                        <div class="space-y-3">
                            ${Object.entries(departmentStats).map(([dept, stats]) => `
                                <div class="p-3 bg-slate-50 dark:bg-slate-600 rounded-lg">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="font-medium text-slate-900 dark:text-white">${dept}</span>
                                        <span class="text-sm text-slate-500 dark:text-slate-400">${stats.applications} applications</span>
                                    </div>
                                    <div class="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                                        <span>${stats.activeJobs} active / ${stats.jobs} total jobs</span>
                                        <span>${stats.jobs > 0 ? Math.round(stats.applications / stats.jobs * 10) / 10 : 0} avg per job</span>
                                    </div>
                                    <div class="mt-2 bg-slate-200 dark:bg-slate-500 rounded-full h-2">
                                        <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(100, (stats.applications / Math.max(...Object.values(departmentStats).map(s => s.applications))) * 100)}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Location Statistics -->
                    <div class="bg-white dark:bg-slate-700 rounded-lg p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Location Performance</h3>
                            <button onclick="careersManager.exportLocationData()" class="text-sm text-blue-600 hover:text-blue-800">Export</button>
                        </div>
                        <div class="space-y-3">
                            ${Object.entries(locationStats).map(([location, stats]) => `
                                <div class="p-3 bg-slate-50 dark:bg-slate-600 rounded-lg">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="font-medium text-slate-900 dark:text-white">${location}</span>
                                        <span class="text-sm text-slate-500 dark:text-slate-400">${stats.applications} applications</span>
                                    </div>
                                    <div class="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                                        <span>${stats.activeJobs} active / ${stats.jobs} total jobs</span>
                                        <span>${stats.jobs > 0 ? Math.round(stats.applications / stats.jobs * 10) / 10 : 0} avg per job</span>
                                    </div>
                                    <div class="mt-2 bg-slate-200 dark:bg-slate-500 rounded-full h-2">
                                        <div class="bg-green-500 h-2 rounded-full" style="width: ${Math.min(100, (stats.applications / Math.max(...Object.values(locationStats).map(s => s.applications))) * 100)}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Application Status Distribution -->
                <div class="bg-white dark:bg-slate-700 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Application Status Distribution</h3>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                        ${Object.entries(statusStats).map(([status, count]) => `
                            <div class="text-center p-4 bg-slate-50 dark:bg-slate-600 rounded-lg">
                                <div class="text-2xl font-bold text-slate-900 dark:text-white">${count}</div>
                                <div class="text-sm text-slate-600 dark:text-slate-300 capitalize">${status}</div>
                                <div class="text-xs text-slate-500 dark:text-slate-400">${Math.round(count / this.applications.length * 100)}%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    calculateMonthlyStats() {
        const monthlyData = {};
        this.applications.forEach(app => {
            const month = new Date(app.submittedAt).toISOString().slice(0, 7); // YYYY-MM
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });
        return monthlyData;
    }

    exportDepartmentData() {
        const data = this.jobs.map(job => ({
            title: job.title,
            department: job.department,
            location: job.location,
            type: job.type,
            applications: this.applications.filter(app => app.jobId === job.id).length,
            status: job.isActive ? 'Active' : 'Inactive',
            posted: new Date(job.postedDate).toLocaleDateString()
        }));

        this.downloadCSV(data, 'department-statistics.csv');
    }

    exportLocationData() {
        const data = this.jobs.map(job => ({
            title: job.title,
            location: job.location,
            department: job.department,
            applications: this.applications.filter(app => app.jobId === job.id).length,
            status: job.isActive ? 'Active' : 'Inactive'
        }));

        this.downloadCSV(data, 'location-statistics.csv');
    }

    downloadCSV(data, filename) {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification(`${filename} downloaded successfully!`, 'success');
    }

    // Utility Methods
    saveJobs() {
        localStorage.setItem('careers_jobs', JSON.stringify(this.jobs));
    }

    saveApplications() {
        localStorage.setItem('jobApplications', JSON.stringify(this.applications));
    }

    handleAddJob(form) {
        try {
            // Security check - authorize action
            if (window.securityManager) {
                window.securityManager.authorizeAction('job.create');
            }

            const formData = new FormData(form);

            // Sanitize and validate input data
            const jobData = this.sanitizeJobData(formData);
            const validation = this.validateJobData(jobData);

            if (!validation.isValid) {
                alert(`Validation Error: ${validation.errors.join(', ')}`);
                return;
            }

        // Create new job object
        const newJob = {
            id: Math.max(...this.jobs.map(j => j.id), 0) + 1,
            title: formData.get('title').trim(),
            department: formData.get('department'),
            location: formData.get('location'),
            type: formData.get('type'),
            salaryRange: formData.get('salaryRange').trim(),
            description: formData.get('description').trim(),
            requirements: formData.get('requirements').split('\n').map(req => req.trim()).filter(req => req),
            benefits: formData.get('benefits').split('\n').map(benefit => benefit.trim()).filter(benefit => benefit),
            deadline: formData.get('deadline'),
            postedDate: new Date(),
            isActive: true
        };

        // Add to jobs array
        this.jobs.push(newJob);
        this.saveJobs();

        // Close modal and refresh dashboard
        this.closeModal();
        this.showAdminDashboard();
        this.renderJobListings(); // Refresh main listings

        // Show success message
        this.showNotification('Job posting created successfully!', 'success');
        } catch (error) {
            console.error('Error adding job:', error);
            this.showNotification('Error creating job posting. Please try again.', 'error');
        }
    }

    handleEditJob(form) {
        try {
            const formData = new FormData(form);
            const jobId = parseInt(formData.get('jobId'));

            // Security check - authorize action
            if (window.securityManager) {
                window.securityManager.authorizeAction('job.update', jobId);
            }

            // Find the job to edit
            const jobIndex = this.jobs.findIndex(j => j.id === jobId);
            if (jobIndex === -1) {
                alert('Job not found!');
                return;
            }

            // Sanitize and validate input data
            const jobData = this.sanitizeJobData(formData);
            const validation = this.validateJobData(jobData);

            if (!validation.isValid) {
                alert(`Validation Error: ${validation.errors.join(', ')}`);
                return;
            }

        // Update job object
        this.jobs[jobIndex] = {
            ...this.jobs[jobIndex],
            title: formData.get('title').trim(),
            department: formData.get('department'),
            location: formData.get('location'),
            type: formData.get('type'),
            salaryRange: formData.get('salaryRange').trim(),
            description: formData.get('description').trim(),
            requirements: formData.get('requirements').split('\n').map(req => req.trim()).filter(req => req),
            benefits: formData.get('benefits').split('\n').map(benefit => benefit.trim()).filter(benefit => benefit),
            deadline: formData.get('deadline'),
            updatedAt: new Date()
        };

        this.saveJobs();

        // Close modal and refresh dashboard
        this.closeModal();
        this.showAdminDashboard();
        this.renderJobListings(); // Refresh main listings

        // Show success message
        this.showNotification('Job posting updated successfully!', 'success');
        } catch (error) {
            console.error('Error editing job:', error);
            this.showNotification('Error updating job posting. Please try again.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;

        const bgColor = {
            'success': 'bg-green-500',
            'error': 'bg-red-500',
            'warning': 'bg-yellow-500',
            'info': 'bg-blue-500'
        }[type] || 'bg-blue-500';

        notification.className += ` ${bgColor} text-white`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // =============================================================================
    // SECURITY AND VALIDATION METHODS
    // =============================================================================

    /**
     * Sanitize job data input
     */
    sanitizeJobData(formData) {
        const sanitizedData = {};

        // Text fields that need sanitization
        const textFields = ['title', 'department', 'location', 'type', 'salaryRange', 'description'];
        textFields.forEach(field => {
            const value = formData.get(field);
            if (value && window.securityManager) {
                sanitizedData[field] = window.securityManager.sanitizeInput(value, 'text');
            } else {
                sanitizedData[field] = value ? value.trim() : '';
            }
        });

        // Array fields (requirements, benefits)
        const arrayFields = ['requirements', 'benefits'];
        arrayFields.forEach(field => {
            const value = formData.get(field);
            if (value) {
                const items = value.split('\n').map(item => {
                    const trimmed = item.trim();
                    return window.securityManager ?
                        window.securityManager.sanitizeInput(trimmed, 'text') :
                        trimmed;
                }).filter(item => item.length > 0);
                sanitizedData[field] = items;
            } else {
                sanitizedData[field] = [];
            }
        });

        // Date field
        sanitizedData.deadline = formData.get('deadline');

        return sanitizedData;
    }

    /**
     * Validate job data
     */
    validateJobData(jobData) {
        const errors = [];

        // Required field validation
        if (!jobData.title || jobData.title.length < 3) {
            errors.push('Job title must be at least 3 characters long');
        }

        if (!jobData.department) {
            errors.push('Department is required');
        }

        if (!jobData.location) {
            errors.push('Location is required');
        }

        if (!jobData.type) {
            errors.push('Job type is required');
        }

        if (!jobData.salaryRange) {
            errors.push('Salary range is required');
        }

        if (!jobData.description || jobData.description.length < 50) {
            errors.push('Job description must be at least 50 characters long');
        }

        if (!jobData.requirements || jobData.requirements.length === 0) {
            errors.push('At least one requirement is needed');
        }

        if (!jobData.benefits || jobData.benefits.length === 0) {
            errors.push('At least one benefit is needed');
        }

        if (!jobData.deadline) {
            errors.push('Application deadline is required');
        } else {
            const deadline = new Date(jobData.deadline);
            const today = new Date();
            if (deadline <= today) {
                errors.push('Application deadline must be in the future');
            }
        }

        // Content validation
        if (jobData.title && jobData.title.length > 100) {
            errors.push('Job title must be less than 100 characters');
        }

        if (jobData.description && jobData.description.length > 5000) {
            errors.push('Job description must be less than 5000 characters');
        }

        // Salary range validation
        if (jobData.salaryRange && !this.validateSalaryRange(jobData.salaryRange)) {
            errors.push('Invalid salary range format');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate salary range format
     */
    validateSalaryRange(salaryRange) {
        // Accept formats like: $50,000 - $70,000, $50k - $70k, 50000-70000
        const patterns = [
            /^\$?[\d,]+\s*-\s*\$?[\d,]+$/,  // $50,000 - $70,000
            /^\$?[\d,]+k?\s*-\s*\$?[\d,]+k?$/,  // $50k - $70k
            /^\$?[\d,]+\+?$/,  // $50,000+ or $50k+
            /^competitive$/i,  // Competitive
            /^negotiable$/i    // Negotiable
        ];

        return patterns.some(pattern => pattern.test(salaryRange.trim()));
    }

    /**
     * Sanitize application data
     */
    sanitizeApplicationData(applicationData) {
        if (!window.securityManager) {
            return applicationData; // Fallback if security manager not available
        }

        return {
            firstName: window.securityManager.sanitizeInput(applicationData.firstName, 'text'),
            lastName: window.securityManager.sanitizeInput(applicationData.lastName, 'text'),
            email: window.securityManager.sanitizeInput(applicationData.email, 'email'),
            phone: applicationData.phone ? window.securityManager.sanitizeInput(applicationData.phone, 'phone') : null,
            coverLetter: window.securityManager.sanitizeInput(applicationData.coverLetter, 'text'),
            linkedin: applicationData.linkedin ? window.securityManager.sanitizeInput(applicationData.linkedin, 'url') : null
        };
    }

    /**
     * Check user permissions for admin actions
     */
    checkAdminPermissions() {
        if (window.securityManager) {
            const session = window.securityManager.validateSession();
            if (!session) {
                throw new Error('Authentication required');
            }

            const hasAdminRole = window.securityManager.hasRole('super_admin') ||
                               window.securityManager.hasRole('company_admin') ||
                               window.securityManager.hasRole('hr_manager');

            if (!hasAdminRole) {
                throw new Error('Administrative privileges required');
            }

            return true;
        }

        // Fallback check (basic implementation)
        return this.isAdmin;
    }

    /**
     * Log security events for job management actions
     */
    logSecurityEvent(action, details) {
        if (window.securityManager) {
            window.securityManager.logSecurityEvent(`JOB_MANAGEMENT_${action}`, details);
        }
    }

    closeModal() {
        const modal = document.querySelector('.modal-backdrop');
        if (modal) {
            modal.remove();
        }
    }
}

// Global function for scrolling to job listings
function scrollToJobListings() {
    const jobSection = document.getElementById('job-listings-container');
    if (jobSection) {
        jobSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
function initializeCareersManager() {
    if (!window.careersManager) {
        window.careersManager = new CareersManager();
        console.log('👔 Careers Manager initialized');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCareersManager);
} else {
    // DOM is already loaded
    initializeCareersManager();
}

// Also provide a manual initialization function for testing
window.initializeCareersManager = initializeCareersManager;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CareersManager;
}
