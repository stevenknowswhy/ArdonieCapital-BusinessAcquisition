// Document Templates Management System with Supabase Integration
class DocumentTemplatesManager {
    constructor() {
        this.templates = [];
        this.filteredTemplates = [];
        this.currentCategory = 'all';
        this.currentView = 'grid';
        this.currentFilters = {
            search: '',
            type: '',
            format: ''
        };
        this.supabaseService = null;
        this.isLoading = false;
        this.init();
    }

    async init() {
        try {
            this.showLoading(true);

            // Initialize Supabase service
            this.supabaseService = window.supabaseClosingDocs;
            await this.supabaseService.init();

            // Load templates from Supabase
            await this.loadTemplatesFromSupabase();

            // Setup event listeners
            this.setupEventListeners();

            // Render templates
            this.renderTemplates();

            this.showLoading(false);
            console.log('✅ Document Templates Manager initialized with Supabase');
        } catch (error) {
            console.error('❌ Failed to initialize Document Templates Manager:', error);
            this.showLoading(false);
            // Fallback to sample data
            this.loadTemplates();
            this.setupEventListeners();
            this.renderTemplates();
        }
    }

    /**
     * Load templates from Supabase
     */
    async loadTemplatesFromSupabase() {
        try {
            const filters = {
                ...this.currentFilters,
                category: this.currentCategory === 'all' ? null : this.currentCategory
            };

            const templates = await this.supabaseService.getTemplates(filters);

            // Transform Supabase data to match UI expectations
            this.templates = templates.map(template => ({
                id: template.id,
                name: template.name,
                description: template.description,
                category: template.category,
                type: template.type,
                format: template.format,
                size: this.formatFileSize(template.file_size),
                downloads: template.download_count || 0,
                rating: template.rating || 0,
                lastUpdated: new Date(template.updated_at).toLocaleDateString(),
                author: template.author ? `${template.author.first_name} ${template.author.last_name}` : 'System',
                tags: template.tags || [],
                preview: template.preview_content || template.description,
                filePath: template.file_path,
                createdAt: template.created_at,
                updatedAt: template.updated_at
            }));

            this.filteredTemplates = [...this.templates];
            console.log(`✅ Loaded ${this.templates.length} templates from Supabase`);
        } catch (error) {
            console.error('❌ Error loading templates from Supabase:', error);
            // Fallback to sample data
            this.loadTemplates();
        }
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (!bytes) return 'Unknown';

        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Show/hide loading state
     */
    showLoading(show) {
        this.isLoading = show;
        const container = document.getElementById('templatesContainer');
        const emptyState = document.getElementById('emptyState');

        if (show) {
            container.classList.add('hidden');
            emptyState.classList.add('hidden');

            // Show loading spinner
            const loadingHTML = `
                <div class="col-span-full flex items-center justify-center py-12">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p class="text-slate-500 dark:text-slate-400">Loading templates...</p>
                    </div>
                </div>
            `;
            container.innerHTML = loadingHTML;
            container.classList.remove('hidden');
        }
    }

    /**
     * Fallback sample data (kept for offline/error scenarios)
     */
    loadTemplates() {
        this.templates = [
            {
                id: 'TPL-001',
                name: 'Asset Purchase Agreement',
                description: 'Comprehensive agreement for purchasing auto repair shop assets',
                category: 'purchase',
                type: 'contract',
                format: 'pdf',
                size: '2.3 MB',
                downloads: 156,
                rating: 4.8,
                lastUpdated: '2024-01-15',
                author: 'Legal Team',
                tags: ['purchase', 'assets', 'contract'],
                preview: 'This comprehensive Asset Purchase Agreement template covers all essential terms for acquiring auto repair shop assets...'
            },
            {
                id: 'TPL-002',
                name: 'Due Diligence Checklist',
                description: 'Complete checklist for auto repair shop due diligence',
                category: 'due-diligence',
                type: 'checklist',
                format: 'html',
                size: '1.1 MB',
                downloads: 203,
                rating: 4.9,
                lastUpdated: '2024-01-12',
                author: 'Operations Team',
                tags: ['due-diligence', 'checklist', 'review'],
                preview: 'Comprehensive due diligence checklist covering financial, operational, and legal aspects...'
            },
            {
                id: 'TPL-003',
                name: 'SBA Loan Application Package',
                description: 'Complete SBA loan application forms and documentation',
                category: 'financing',
                type: 'form',
                format: 'pdf',
                size: '3.7 MB',
                downloads: 89,
                rating: 4.6,
                lastUpdated: '2024-01-10',
                author: 'Finance Team',
                tags: ['sba', 'loan', 'financing'],
                preview: 'Complete SBA loan application package with all required forms and supporting documentation...'
            },
            {
                id: 'TPL-004',
                name: 'Employment Agreement Template',
                description: 'Standard employment agreement for auto repair technicians',
                category: 'employment',
                type: 'contract',
                format: 'docx',
                size: '0.8 MB',
                downloads: 134,
                rating: 4.7,
                lastUpdated: '2024-01-08',
                author: 'HR Team',
                tags: ['employment', 'contract', 'technician'],
                preview: 'Professional employment agreement template specifically designed for auto repair shop employees...'
            },
            {
                id: 'TPL-005',
                name: 'Business License Application',
                description: 'Auto repair shop business license application forms',
                category: 'legal',
                type: 'form',
                format: 'pdf',
                size: '1.5 MB',
                downloads: 67,
                rating: 4.5,
                lastUpdated: '2024-01-05',
                author: 'Legal Team',
                tags: ['license', 'legal', 'application'],
                preview: 'Complete business license application forms for auto repair shop operations...'
            },
            {
                id: 'TPL-006',
                name: 'Financial Statement Template',
                description: 'Standardized financial statement format for auto repair shops',
                category: 'due-diligence',
                type: 'form',
                format: 'docx',
                size: '1.2 MB',
                downloads: 178,
                rating: 4.8,
                lastUpdated: '2024-01-14',
                author: 'Finance Team',
                tags: ['financial', 'statement', 'template'],
                preview: 'Professional financial statement template designed specifically for auto repair businesses...'
            },
            {
                id: 'TPL-007',
                name: 'Non-Disclosure Agreement',
                description: 'Mutual NDA for business acquisition discussions',
                category: 'legal',
                type: 'contract',
                format: 'pdf',
                size: '0.6 MB',
                downloads: 245,
                rating: 4.9,
                lastUpdated: '2024-01-16',
                author: 'Legal Team',
                tags: ['nda', 'confidentiality', 'legal'],
                preview: 'Comprehensive mutual non-disclosure agreement for protecting confidential information...'
            },
            {
                id: 'TPL-008',
                name: 'Equipment Valuation Form',
                description: 'Detailed form for valuing auto repair equipment',
                category: 'due-diligence',
                type: 'form',
                format: 'html',
                size: '0.9 MB',
                downloads: 112,
                rating: 4.6,
                lastUpdated: '2024-01-11',
                author: 'Operations Team',
                tags: ['equipment', 'valuation', 'assessment'],
                preview: 'Comprehensive equipment valuation form for accurate asset assessment...'
            }
        ];

        this.filteredTemplates = [...this.templates];
    }

    setupEventListeners() {
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.applyFilters();
        });

        // Filter dropdowns
        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.currentFilters.type = e.target.value;
            this.applyFilters();
        });

        document.getElementById('formatFilter').addEventListener('change', (e) => {
            this.currentFilters.format = e.target.value;
            this.applyFilters();
        });

        // View toggle buttons
        document.getElementById('gridViewBtn').addEventListener('click', () => {
            this.switchView('grid');
        });

        document.getElementById('listViewBtn').addEventListener('click', () => {
            this.switchView('list');
        });

        // Modal functionality
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('templateModal').addEventListener('click', (e) => {
            if (e.target.id === 'templateModal') {
                this.closeModal();
            }
        });

        // Action buttons
        document.getElementById('uploadTemplateBtn').addEventListener('click', () => {
            this.showUploadModal();
        });

        document.getElementById('createTemplateBtn').addEventListener('click', () => {
            this.showCreateModal();
        });
    }

    async switchCategory(category) {
        this.currentCategory = category;

        // Update tab appearance
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.category === category) {
                tab.classList.add('active');
            }
        });

        await this.applyFilters();
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button appearance
        const gridBtn = document.getElementById('gridViewBtn');
        const listBtn = document.getElementById('listViewBtn');
        
        if (view === 'grid') {
            gridBtn.classList.add('bg-primary', 'text-white');
            gridBtn.classList.remove('bg-slate-200', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-400');
            listBtn.classList.remove('bg-primary', 'text-white');
            listBtn.classList.add('bg-slate-200', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-400');
        } else {
            listBtn.classList.add('bg-primary', 'text-white');
            listBtn.classList.remove('bg-slate-200', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-400');
            gridBtn.classList.remove('bg-primary', 'text-white');
            gridBtn.classList.add('bg-slate-200', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-400');
        }

        this.renderTemplates();
    }

    async applyFilters() {
        if (this.supabaseService && this.supabaseService.isInitialized) {
            // Apply filters via Supabase query for better performance
            try {
                await this.loadTemplatesFromSupabase();
                this.renderTemplates();
                return;
            } catch (error) {
                console.error('Error applying filters via Supabase:', error);
                // Fall back to client-side filtering
            }
        }

        // Client-side filtering (fallback)
        this.filteredTemplates = this.templates.filter(template => {
            const matchesCategory = this.currentCategory === 'all' || template.category === this.currentCategory;

            const matchesSearch = !this.currentFilters.search ||
                template.name.toLowerCase().includes(this.currentFilters.search.toLowerCase()) ||
                template.description.toLowerCase().includes(this.currentFilters.search.toLowerCase()) ||
                template.tags.some(tag => tag.toLowerCase().includes(this.currentFilters.search.toLowerCase()));

            const matchesType = !this.currentFilters.type || template.type === this.currentFilters.type;
            const matchesFormat = !this.currentFilters.format || template.format === this.currentFilters.format;

            return matchesCategory && matchesSearch && matchesType && matchesFormat;
        });

        this.renderTemplates();
    }

    renderTemplates() {
        const container = document.getElementById('templatesContainer');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredTemplates.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        container.classList.remove('hidden');
        emptyState.classList.add('hidden');

        if (this.currentView === 'grid') {
            container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
            container.innerHTML = this.filteredTemplates.map(template => this.renderTemplateCard(template)).join('');
        } else {
            container.className = 'space-y-4';
            container.innerHTML = this.filteredTemplates.map(template => this.renderTemplateListItem(template)).join('');
        }
    }

    renderTemplateCard(template) {
        const formatIcons = {
            'pdf': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>',
            'docx': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
            'html': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>'
        };

        return `
            <div class="template-card bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 cursor-pointer" onclick="templatesManager.viewTemplate('${template.id}')">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-primary/10 rounded-lg">
                            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${formatIcons[template.format]}
                            </svg>
                        </div>
                        <div>
                            <span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">${template.format}</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-1">
                        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">${template.rating}</span>
                    </div>
                </div>

                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">${template.name}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">${template.description}</p>

                <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <span>${template.downloads} downloads</span>
                    <span>${template.size}</span>
                </div>

                <div class="flex flex-wrap gap-1 mb-4">
                    ${template.tags.slice(0, 3).map(tag => `
                        <span class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded">${tag}</span>
                    `).join('')}
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-500 dark:text-slate-400">Updated ${template.lastUpdated}</span>
                    <button class="text-primary hover:text-primary-dark text-sm font-medium">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    renderTemplateListItem(template) {
        return `
            <div class="template-card bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 cursor-pointer" onclick="templatesManager.viewTemplate('${template.id}')">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4 flex-1">
                        <div class="p-2 bg-primary/10 rounded-lg">
                            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">${template.name}</h3>
                            <p class="text-sm text-slate-600 dark:text-slate-400">${template.description}</p>
                            <div class="flex items-center space-x-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                <span>${template.format.toUpperCase()}</span>
                                <span>${template.downloads} downloads</span>
                                <span>${template.size}</span>
                                <span>★ ${template.rating}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <button class="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-md text-sm transition-colors">
                            Download
                        </button>
                        <button class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm transition-colors">
                            Use Template
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    viewTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        document.getElementById('modalTitle').textContent = template.name;
        document.getElementById('modalContent').innerHTML = `
            <div class="space-y-6">
                <div class="flex items-start space-x-4">
                    <div class="p-3 bg-primary/10 rounded-lg">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">${template.name}</h3>
                        <p class="text-slate-600 dark:text-slate-400 mb-4">${template.description}</p>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span class="font-medium text-slate-700 dark:text-slate-300">Format:</span>
                                <span class="text-slate-600 dark:text-slate-400 ml-1">${template.format.toUpperCase()}</span>
                            </div>
                            <div>
                                <span class="font-medium text-slate-700 dark:text-slate-300">Size:</span>
                                <span class="text-slate-600 dark:text-slate-400 ml-1">${template.size}</span>
                            </div>
                            <div>
                                <span class="font-medium text-slate-700 dark:text-slate-300">Downloads:</span>
                                <span class="text-slate-600 dark:text-slate-400 ml-1">${template.downloads}</span>
                            </div>
                            <div>
                                <span class="font-medium text-slate-700 dark:text-slate-300">Rating:</span>
                                <span class="text-slate-600 dark:text-slate-400 ml-1">★ ${template.rating}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-slate-900 dark:text-white mb-2">Preview</h4>
                    <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                        <p class="text-slate-700 dark:text-slate-300">${template.preview}</p>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-slate-900 dark:text-white mb-2">Tags</h4>
                    <div class="flex flex-wrap gap-2">
                        ${template.tags.map(tag => `
                            <span class="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">${tag}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('templateModal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('templateModal').classList.add('hidden');
    }

    showUploadModal() {
        alert('Upload Template Modal - This would open a modal to upload new templates');
    }

    showCreateModal() {
        alert('Create Template Modal - This would open a template creation interface');
    }
}

// Initialize the templates manager when the page loads
let templatesManager;
document.addEventListener('DOMContentLoaded', function() {
    templatesManager = new DocumentTemplatesManager();
});
