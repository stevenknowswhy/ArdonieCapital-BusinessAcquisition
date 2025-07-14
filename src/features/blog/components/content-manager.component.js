/**
 * Content Manager Component
 * Dashboard interface for managing blog content
 * @author Ardonie Capital Development Team
 */

import { blogCMSService } from '../services/blog-cms.service.js';
import { contentAPIService } from '../services/content-api.service.js';

export class ContentManagerComponent {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.isInitialized = false;
        this.currentView = 'posts'; // posts, categories, editor
        this.currentPost = null;
        this.posts = [];
        this.categories = [];
        
        this.init();
    }

    /**
     * Initialize the content manager
     */
    async init() {
        try {
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                throw new Error(`Container with ID '${this.containerId}' not found`);
            }

            // Initialize services
            await contentAPIService.init();

            // Check user permissions
            const hasPermissions = await blogCMSService.hasContentPermissions();
            if (!hasPermissions) {
                this.renderNoPermissions();
                return;
            }

            // Load initial data
            await this.loadData();

            // Render the interface
            this.render();

            this.isInitialized = true;
            console.log('Content Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Content Manager:', error);
            this.renderError(error.message);
        }
    }

    /**
     * Load data from the API
     */
    async loadData() {
        try {
            // Load posts and categories in parallel
            const [postsResult, categoriesResult] = await Promise.all([
                contentAPIService.getAllPosts({ includeUnpublished: true, limit: 50 }),
                contentAPIService.getAllCategories()
            ]);

            if (postsResult.success) {
                this.posts = postsResult.data;
            }

            if (categoriesResult.success) {
                this.categories = categoriesResult.data;
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }

    /**
     * Render the main interface
     */
    render() {
        this.container.innerHTML = `
            <div class="content-manager">
                ${this.renderHeader()}
                ${this.renderNavigation()}
                ${this.renderMainContent()}
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Render the header section
     */
    renderHeader() {
        return `
            <div class="content-manager__header bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Content Manager</h1>
                        <p class="text-slate-600 dark:text-slate-400 mt-1">Manage blog posts and content</p>
                    </div>
                    <div class="flex space-x-3">
                        ${this.currentView === 'posts' ? `
                            <button id="new-post-btn" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                New Post
                            </button>
                        ` : ''}
                        ${this.currentView === 'categories' ? `
                            <button id="new-category-btn" class="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors">
                                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                New Category
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the navigation tabs
     */
    renderNavigation() {
        const tabs = [
            { id: 'posts', label: 'Posts', count: this.posts.length },
            { id: 'categories', label: 'Categories', count: this.categories.length },
            { id: 'editor', label: 'Editor', hidden: this.currentView !== 'editor' }
        ];

        return `
            <div class="content-manager__nav bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <div class="flex space-x-1 p-4">
                    ${tabs.filter(tab => !tab.hidden).map(tab => `
                        <button 
                            class="nav-tab px-4 py-2 rounded-lg transition-colors ${
                                this.currentView === tab.id 
                                    ? 'bg-white dark:bg-slate-800 text-primary border border-slate-200 dark:border-slate-700' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }" 
                            data-view="${tab.id}"
                        >
                            ${tab.label}
                            ${tab.count !== undefined ? `<span class="ml-2 text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">${tab.count}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render the main content area
     */
    renderMainContent() {
        switch (this.currentView) {
            case 'posts':
                return this.renderPostsList();
            case 'categories':
                return this.renderCategoriesList();
            case 'editor':
                return this.renderEditor();
            default:
                return this.renderPostsList();
        }
    }

    /**
     * Render the posts list view
     */
    renderPostsList() {
        return `
            <div class="content-manager__posts p-6">
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">All Posts</h2>
                        <div class="flex space-x-2">
                            <select id="status-filter" class="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800">
                                <option value="">All Status</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                            <input type="text" id="search-posts" placeholder="Search posts..." 
                                   class="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800">
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-slate-50 dark:bg-slate-900">
                                <tr>
                                    <th class="text-left p-4 font-medium text-slate-900 dark:text-white">Title</th>
                                    <th class="text-left p-4 font-medium text-slate-900 dark:text-white">Status</th>
                                    <th class="text-left p-4 font-medium text-slate-900 dark:text-white">Category</th>
                                    <th class="text-left p-4 font-medium text-slate-900 dark:text-white">Author</th>
                                    <th class="text-left p-4 font-medium text-slate-900 dark:text-white">Date</th>
                                    <th class="text-left p-4 font-medium text-slate-900 dark:text-white">Views</th>
                                    <th class="text-left p-4 font-medium text-slate-900 dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.posts.map(post => this.renderPostRow(post)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render a single post row
     */
    renderPostRow(post) {
        const statusColors = {
            published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        };

        return `
            <tr class="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900">
                <td class="p-4">
                    <div>
                        <div class="font-medium text-slate-900 dark:text-white">${this.escapeHtml(post.title)}</div>
                        <div class="text-sm text-slate-500 dark:text-slate-400">${post.slug}</div>
                    </div>
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[post.status] || statusColors.draft}">
                        ${post.status}
                    </span>
                </td>
                <td class="p-4 text-slate-600 dark:text-slate-400">
                    ${post.category_name || 'Uncategorized'}
                </td>
                <td class="p-4 text-slate-600 dark:text-slate-400">
                    ${post.author_name}
                </td>
                <td class="p-4 text-slate-600 dark:text-slate-400">
                    ${post.formatted_date}
                </td>
                <td class="p-4 text-slate-600 dark:text-slate-400">
                    ${post.view_count || 0}
                </td>
                <td class="p-4">
                    <div class="flex space-x-2">
                        <button class="edit-post-btn text-primary hover:text-primary-dark" data-post-id="${post.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="delete-post-btn text-red-600 hover:text-red-800" data-post-id="${post.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Render the categories list view
     */
    renderCategoriesList() {
        return `
            <div class="content-manager__categories p-6">
                <div class="mb-6">
                    <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Categories</h2>
                </div>

                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${this.categories.map(category => this.renderCategoryCard(category)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render a single category card
     */
    renderCategoryCard(category) {
        return `
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                        <div class="w-4 h-4 rounded-full mr-3" style="background-color: ${category.color}"></div>
                        <h3 class="font-medium text-slate-900 dark:text-white">${this.escapeHtml(category.name)}</h3>
                    </div>
                    <span class="text-sm text-slate-500 dark:text-slate-400">${category.post_count || 0} posts</span>
                </div>
                ${category.description ? `
                    <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">${this.escapeHtml(category.description)}</p>
                ` : ''}
                <div class="flex justify-between items-center">
                    <span class="text-xs text-slate-500 dark:text-slate-400">${category.slug}</span>
                    <div class="flex space-x-2">
                        <button class="edit-category-btn text-primary hover:text-primary-dark" data-category-id="${category.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the post editor
     */
    renderEditor() {
        const isEditing = this.currentPost !== null;
        const post = this.currentPost || {};

        return `
            <div class="content-manager__editor p-6">
                <form id="post-editor-form" class="max-w-4xl mx-auto">
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
                        <input type="text" id="post-title" value="${this.escapeHtml(post.title || '')}" 
                               class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800" 
                               placeholder="Enter post title..." required>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Slug</label>
                        <input type="text" id="post-slug" value="${this.escapeHtml(post.slug || '')}" 
                               class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800" 
                               placeholder="post-url-slug">
                    </div>

                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                            <select id="post-category" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800">
                                <option value="">Select category...</option>
                                ${this.categories.map(cat => `
                                    <option value="${cat.id}" ${post.category_id === cat.id ? 'selected' : ''}>
                                        ${this.escapeHtml(cat.name)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                            <select id="post-status" class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800">
                                <option value="draft" ${post.status === 'draft' ? 'selected' : ''}>Draft</option>
                                <option value="published" ${post.status === 'published' ? 'selected' : ''}>Published</option>
                                <option value="archived" ${post.status === 'archived' ? 'selected' : ''}>Archived</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content</label>
                        <textarea id="post-content" rows="20" 
                                  class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800" 
                                  placeholder="Write your post content here...">${this.escapeHtml(post.content || '')}</textarea>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Excerpt</label>
                        <textarea id="post-excerpt" rows="3" 
                                  class="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800" 
                                  placeholder="Brief description of the post...">${this.escapeHtml(post.excerpt || '')}</textarea>
                    </div>

                    <div class="flex justify-between">
                        <button type="button" id="cancel-edit-btn" class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            Cancel
                        </button>
                        <div class="space-x-3">
                            <button type="button" id="save-draft-btn" class="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700">
                                Save Draft
                            </button>
                            <button type="submit" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
                                ${isEditing ? 'Update Post' : 'Create Post'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Navigation tabs
        this.container.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // New post button
        const newPostBtn = this.container.querySelector('#new-post-btn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => this.createNewPost());
        }

        // New category button
        const newCategoryBtn = this.container.querySelector('#new-category-btn');
        if (newCategoryBtn) {
            newCategoryBtn.addEventListener('click', () => this.createNewCategory());
        }

        // Edit post buttons
        this.container.querySelectorAll('.edit-post-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.target.closest('.edit-post-btn').dataset.postId;
                this.editPost(postId);
            });
        });

        // Delete post buttons
        this.container.querySelectorAll('.delete-post-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.target.closest('.delete-post-btn').dataset.postId;
                this.deletePost(postId);
            });
        });

        // Post editor form
        const editorForm = this.container.querySelector('#post-editor-form');
        if (editorForm) {
            editorForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
        }

        // Cancel edit button
        const cancelBtn = this.container.querySelector('#cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }

        // Save draft button
        const saveDraftBtn = this.container.querySelector('#save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        // Auto-generate slug from title
        const titleInput = this.container.querySelector('#post-title');
        const slugInput = this.container.querySelector('#post-slug');
        if (titleInput && slugInput) {
            titleInput.addEventListener('input', (e) => {
                if (!slugInput.value || slugInput.value === this.generateSlug(titleInput.dataset.previousValue || '')) {
                    slugInput.value = this.generateSlug(e.target.value);
                }
                titleInput.dataset.previousValue = e.target.value;
            });
        }
    }

    /**
     * Switch between different views
     */
    switchView(view) {
        this.currentView = view;
        this.render();
    }

    /**
     * Create a new post
     */
    createNewPost() {
        this.currentPost = null;
        this.switchView('editor');
    }

    /**
     * Edit an existing post
     */
    async editPost(postId) {
        try {
            const post = this.posts.find(p => p.id === postId);
            if (post) {
                this.currentPost = post;
                this.switchView('editor');
            }
        } catch (error) {
            console.error('Failed to edit post:', error);
            this.showNotification('Failed to load post for editing', 'error');
        }
    }

    /**
     * Delete a post
     */
    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            const result = await contentAPIService.deletePost(postId);

            if (result.success) {
                this.showNotification('Post deleted successfully', 'success');
                await this.loadData();
                this.render();
            } else {
                this.showNotification(result.error || 'Failed to delete post', 'error');
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
            this.showNotification('Failed to delete post', 'error');
        }
    }

    /**
     * Handle post form submission
     */
    async handlePostSubmit(e) {
        e.preventDefault();

        try {
            const formData = this.getFormData();
            const validation = await contentAPIService.validatePostData(formData);

            if (!validation.isValid) {
                this.showValidationErrors(validation.errors);
                return;
            }

            let result;
            if (this.currentPost) {
                // Update existing post
                result = await contentAPIService.updatePost(this.currentPost.id, formData);
            } else {
                // Create new post
                result = await contentAPIService.createPost(formData);
            }

            if (result.success) {
                this.showNotification(
                    this.currentPost ? 'Post updated successfully' : 'Post created successfully',
                    'success'
                );
                await this.loadData();
                this.switchView('posts');
            } else {
                this.showNotification(result.error || 'Failed to save post', 'error');
            }
        } catch (error) {
            console.error('Failed to submit post:', error);
            this.showNotification('Failed to save post', 'error');
        }
    }

    /**
     * Utility methods
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showValidationErrors(errors) {
        const errorMessage = 'Please fix the following errors:\n' + errors.join('\n');
        alert(errorMessage);
    }

    /**
     * Get form data
     */
    getFormData() {
        return {
            title: this.container.querySelector('#post-title').value.trim(),
            slug: this.container.querySelector('#post-slug').value.trim(),
            content: this.container.querySelector('#post-content').value.trim(),
            excerpt: this.container.querySelector('#post-excerpt').value.trim(),
            category_id: this.container.querySelector('#post-category').value || null,
            status: this.container.querySelector('#post-status').value,
            tags: [],
            meta_description: this.container.querySelector('#post-excerpt').value.trim()
        };
    }

    /**
     * Save post as draft
     */
    async saveDraft() {
        try {
            const formData = this.getFormData();
            formData.status = 'draft';

            let result;
            if (this.currentPost) {
                result = await contentAPIService.updatePost(this.currentPost.id, formData);
            } else {
                result = await contentAPIService.createPost(formData);
            }

            if (result.success) {
                this.showNotification('Draft saved successfully', 'success');
                this.currentPost = result.data;
                await this.loadData();
            } else {
                this.showNotification(result.error || 'Failed to save draft', 'error');
            }
        } catch (error) {
            console.error('Failed to save draft:', error);
            this.showNotification('Failed to save draft', 'error');
        }
    }

    /**
     * Cancel editing
     */
    cancelEdit() {
        this.currentPost = null;
        this.switchView('posts');
    }

    /**
     * Create new category
     */
    async createNewCategory() {
        const name = prompt('Enter category name:');
        if (!name) return;

        try {
            const categoryData = {
                name: name.trim(),
                description: '',
                color: '#3B82F6'
            };

            const validation = await contentAPIService.validateCategoryData(categoryData);
            if (!validation.isValid) {
                alert('Validation errors:\n' + validation.errors.join('\n'));
                return;
            }

            const result = await contentAPIService.createCategory(categoryData);

            if (result.success) {
                this.showNotification('Category created successfully', 'success');
                await this.loadData();
                this.render();
            } else {
                this.showNotification(result.error || 'Failed to create category', 'error');
            }
        } catch (error) {
            console.error('Failed to create category:', error);
            this.showNotification('Failed to create category', 'error');
        }
    }
}
