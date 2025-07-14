/**
 * Blog CMS Service
 * Database-driven content management system for blog posts
 * @author Ardonie Capital Development Team
 */

import { supabaseService } from '../../../shared/services/supabase/index.js';

export class BlogCMSService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
        this.isInitialized = false;
        this.currentUser = null;
        
        // Initialize Supabase connection
        this.initializeService();
    }

    /**
     * Initialize the blog CMS service
     */
    async initializeService() {
        try {
            if (!supabaseService.isInitialized) {
                await supabaseService.init();
            }
            this.isInitialized = true;
            console.log('Blog CMS service initialized with Supabase');
        } catch (error) {
            console.error('Failed to initialize blog CMS service:', error);
            throw error;
        }
    }

    /**
     * Get current user for content management operations
     */
    async getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }

        try {
            const userResponse = await supabaseService.getCurrentUser();
            if (!userResponse.success || !userResponse.user) {
                return null;
            }

            const user = userResponse.user;
            
            // Get user profile from profiles table
            const profileResponse = await supabaseService.select('profiles', {
                eq: { user_id: user.id }
            });

            if (profileResponse.success && profileResponse.data.length > 0) {
                this.currentUser = {
                    ...user,
                    profile: profileResponse.data[0]
                };
                return this.currentUser;
            }

            return null;
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }

    /**
     * Check if user has content management permissions
     */
    async hasContentPermissions(user = null) {
        try {
            const currentUser = user || await this.getCurrentUser();
            if (!currentUser) return false;

            // Allow admin users and blog editors to manage content
            const allowedRoles = ['admin', 'blog_editor', 'blog_contributor'];
            return allowedRoles.includes(currentUser.profile.role);
        } catch (error) {
            console.error('Failed to check content permissions:', error);
            return false;
        }
    }

    /**
     * Get all blog posts with filtering and pagination
     */
    async getPosts(options = {}) {
        const {
            page = 1,
            limit = 6,
            category = null,
            tag = null,
            search = null,
            status = 'published',
            sortBy = 'published_at',
            sortOrder = 'desc',
            includeUnpublished = false
        } = options;

        const cacheKey = `posts_${JSON.stringify(options)}`;
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached.data, total: cached.total, fromCache: true };
        }

        try {
            let query = {
                select: `
                    *,
                    author:profiles!author_id (
                        id, first_name, last_name, avatar_url
                    ),
                    category:blog_categories!category_id (
                        id, name, slug, color
                    )
                `,
                order: { column: sortBy, ascending: sortOrder === 'asc' },
                range: { from: (page - 1) * limit, to: page * limit - 1 }
            };

            // Add status filter
            if (!includeUnpublished) {
                query.eq = { status: status };
            }

            // Add category filter (handle both UUID and slug)
            if (category) {
                // Check if category is a UUID or slug
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);

                if (isUUID) {
                    // Direct UUID match
                    query.eq = { ...query.eq, category_id: category };
                } else {
                    // Slug match - need to join with blog_categories table
                    query.select = `
                        *,
                        author:profiles!author_id (
                            id, first_name, last_name, avatar_url, bio
                        ),
                        category:blog_categories!category_id (
                            id, name, slug, color, description
                        )
                    `;
                    // Add slug filter to the join
                    query.eq = {
                        ...query.eq,
                        'category.slug': category
                    };
                }
            }

            // Add search filter
            if (search) {
                query.textSearch = { column: 'title,content', query: search };
            }

            // Add tag filter
            if (tag) {
                query.contains = { tags: [tag] };
            }

            const result = await supabaseService.select('content_pages', query);

            if (result.success) {
                // Get total count for pagination
                const countResult = await supabaseService.select('content_pages', {
                    select: 'id',
                    eq: query.eq
                });

                const totalCount = countResult.success ? countResult.data.length : 0;

                // Process posts data
                const processedPosts = result.data.map(post => this.processPostData(post));

                // Cache the result
                this.setCachedData(cacheKey, {
                    data: processedPosts,
                    total: totalCount
                });

                return {
                    success: true,
                    data: processedPosts,
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit)
                };
            }

            return result;
        } catch (error) {
            console.error('Failed to get posts:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get a single blog post by slug
     */
    async getPost(slug) {
        const cacheKey = `post_${slug}`;
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }

        try {
            const result = await supabaseService.select('content_pages', {
                select: `
                    *,
                    author:profiles!author_id (
                        id, first_name, last_name, avatar_url, bio
                    ),
                    category:blog_categories!category_id (
                        id, name, slug, color, description
                    )
                `,
                eq: { slug: slug }
            });

            if (result.success && result.data.length > 0) {
                const post = this.processPostData(result.data[0]);
                
                // Increment view count
                await this.incrementViewCount(post.id);
                
                // Cache the result
                this.setCachedData(cacheKey, post);

                return { success: true, data: post };
            }

            return { success: false, error: 'Post not found' };
        } catch (error) {
            console.error('Failed to get post:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create a new blog post
     */
    async createPost(postData) {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                return { success: false, error: 'User not authenticated' };
            }

            const hasPermission = await this.hasContentPermissions(user);
            if (!hasPermission) {
                return { success: false, error: 'Insufficient permissions to create content' };
            }

            // Generate slug from title if not provided
            const slug = postData.slug || this.generateSlug(postData.title);

            // Calculate reading time
            const readingTime = this.calculateReadingTime(postData.content);

            // Generate excerpt if not provided
            const excerpt = postData.excerpt || this.generateExcerpt(postData.content);

            const newPost = {
                title: postData.title,
                slug: slug,
                content: postData.content,
                excerpt: excerpt,
                meta_description: postData.meta_description || excerpt,
                meta_keywords: postData.meta_keywords || [],
                author_id: user.profile.id,
                status: postData.status || 'draft',
                featured_image: postData.featured_image || null,
                tags: postData.tags || [],
                category_id: postData.category_id || null,
                reading_time: readingTime,
                published_at: postData.status === 'published' ? new Date().toISOString() : null
            };

            const result = await supabaseService.insert('content_pages', newPost);

            if (result.success) {
                // Clear cache
                this.clearCache();
                
                return { success: true, data: result.data[0] };
            }

            return result;
        } catch (error) {
            console.error('Failed to create post:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update an existing blog post
     */
    async updatePost(postId, postData) {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                return { success: false, error: 'User not authenticated' };
            }

            const hasPermission = await this.hasContentPermissions(user);
            if (!hasPermission) {
                return { success: false, error: 'Insufficient permissions to update content' };
            }

            // Get existing post to check ownership
            const existingPost = await supabaseService.select('content_pages', {
                eq: { id: postId }
            });

            if (!existingPost.success || existingPost.data.length === 0) {
                return { success: false, error: 'Post not found' };
            }

            const post = existingPost.data[0];

            // Check if user can edit this post (author or admin)
            if (post.author_id !== user.profile.id && user.profile.role !== 'admin') {
                return { success: false, error: 'Insufficient permissions to edit this post' };
            }

            // Prepare update data
            const updateData = { ...postData };

            // Update slug if title changed
            if (postData.title && postData.title !== post.title) {
                updateData.slug = postData.slug || this.generateSlug(postData.title);
            }

            // Recalculate reading time if content changed
            if (postData.content && postData.content !== post.content) {
                updateData.reading_time = this.calculateReadingTime(postData.content);
                updateData.excerpt = postData.excerpt || this.generateExcerpt(postData.content);
            }

            // Set published_at if status changed to published
            if (postData.status === 'published' && post.status !== 'published') {
                updateData.published_at = new Date().toISOString();
            }

            const result = await supabaseService.update('content_pages', updateData, { id: postId });

            if (result.success) {
                // Clear cache
                this.clearCache();
                
                return { success: true, data: result.data[0] };
            }

            return result;
        } catch (error) {
            console.error('Failed to update post:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete a blog post
     */
    async deletePost(postId) {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                return { success: false, error: 'User not authenticated' };
            }

            const hasPermission = await this.hasContentPermissions(user);
            if (!hasPermission) {
                return { success: false, error: 'Insufficient permissions to delete content' };
            }

            // Get existing post to check ownership
            const existingPost = await supabaseService.select('content_pages', {
                eq: { id: postId }
            });

            if (!existingPost.success || existingPost.data.length === 0) {
                return { success: false, error: 'Post not found' };
            }

            const post = existingPost.data[0];

            // Check if user can delete this post (author or admin)
            if (post.author_id !== user.profile.id && user.profile.role !== 'admin') {
                return { success: false, error: 'Insufficient permissions to delete this post' };
            }

            const result = await supabaseService.delete('content_pages', { id: postId });

            if (result.success) {
                // Clear cache
                this.clearCache();
                
                return { success: true };
            }

            return result;
        } catch (error) {
            console.error('Failed to delete post:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get blog categories
     */
    async getCategories() {
        const cacheKey = 'blog_categories';

        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }

        try {
            const result = await supabaseService.select('blog_categories', {
                eq: { is_active: true },
                order: { column: 'sort_order', ascending: true }
            });

            if (result.success) {
                // Cache the result
                this.setCachedData(cacheKey, result.data);

                return { success: true, data: result.data };
            }

            return result;
        } catch (error) {
            console.error('Failed to get categories:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create a new blog category
     */
    async createCategory(categoryData) {
        try {
            const user = await this.getCurrentUser();
            if (!user) {
                return { success: false, error: 'User not authenticated' };
            }

            const hasPermission = await this.hasContentPermissions(user);
            if (!hasPermission) {
                return { success: false, error: 'Insufficient permissions to create categories' };
            }

            // Generate slug from name if not provided
            const slug = categoryData.slug || this.generateSlug(categoryData.name);

            const newCategory = {
                name: categoryData.name,
                slug: slug,
                description: categoryData.description || null,
                color: categoryData.color || '#3B82F6',
                icon: categoryData.icon || null,
                parent_id: categoryData.parent_id || null,
                sort_order: categoryData.sort_order || 0,
                is_active: categoryData.is_active !== false
            };

            const result = await supabaseService.insert('blog_categories', newCategory);

            if (result.success) {
                // Clear cache
                this.clearCache();

                return { success: true, data: result.data[0] };
            }

            return result;
        } catch (error) {
            console.error('Failed to create category:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get featured posts
     */
    async getFeaturedPosts(limit = 3) {
        const cacheKey = `featured_posts_${limit}`;

        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }

        try {
            const result = await supabaseService.select('content_pages', {
                select: `
                    *,
                    author:profiles!author_id (
                        id, first_name, last_name, avatar_url
                    ),
                    category:blog_categories!category_id (
                        id, name, slug, color
                    )
                `,
                eq: { status: 'published' },
                order: { column: 'view_count', ascending: false },
                limit: limit
            });

            if (result.success) {
                const processedPosts = result.data.map(post => this.processPostData(post));

                // Cache the result
                this.setCachedData(cacheKey, processedPosts);

                return { success: true, data: processedPosts };
            }

            return result;
        } catch (error) {
            console.error('Failed to get featured posts:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Search posts
     */
    async searchPosts(query, options = {}) {
        const {
            limit = 10,
            category = null,
            tags = null
        } = options;

        try {
            let searchQuery = {
                select: `
                    *,
                    author:profiles!author_id (
                        id, first_name, last_name, avatar_url
                    ),
                    category:blog_categories!category_id (
                        id, name, slug, color
                    )
                `,
                eq: { status: 'published' },
                textSearch: { column: 'title,content,excerpt', query: query },
                order: { column: 'published_at', ascending: false },
                limit: limit
            };

            // Add category filter (handle both UUID and slug)
            if (category) {
                // Check if category is a UUID or slug
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);

                if (isUUID) {
                    // Direct UUID match
                    searchQuery.eq.category_id = category;
                } else {
                    // Slug match - need to join with blog_categories table and filter by slug
                    searchQuery.select = `
                        *,
                        author:profiles!author_id (
                            id, first_name, last_name, avatar_url
                        ),
                        category:blog_categories!category_id (
                            id, name, slug, color
                        )
                    `;
                    searchQuery.eq['category.slug'] = category;
                }
            }

            // Add tag filter
            if (tags && tags.length > 0) {
                searchQuery.contains = { tags: tags };
            }

            const result = await supabaseService.select('content_pages', searchQuery);

            if (result.success) {
                const processedPosts = result.data.map(post => this.processPostData(post));

                return { success: true, data: processedPosts };
            }

            return result;
        } catch (error) {
            console.error('Failed to search posts:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Increment view count for a post
     */
    async incrementViewCount(postId) {
        try {
            // Get current view count
            const result = await supabaseService.select('content_pages', {
                select: 'view_count',
                eq: { id: postId }
            });

            if (result.success && result.data.length > 0) {
                const currentCount = result.data[0].view_count || 0;

                // Update view count
                await supabaseService.update('content_pages',
                    { view_count: currentCount + 1 },
                    { id: postId }
                );
            }
        } catch (error) {
            console.error('Failed to increment view count:', error);
            // Don't throw error for view count failures
        }
    }

    /**
     * Utility methods
     */
    processPostData(post) {
        return {
            ...post,
            author_name: post.author ? `${post.author.first_name} ${post.author.last_name}` : 'Unknown Author',
            category_name: post.category ? post.category.name : null,
            formatted_date: this.formatDate(post.published_at || post.created_at),
            excerpt: post.excerpt || this.generateExcerpt(post.content),
            reading_time: post.reading_time || this.calculateReadingTime(post.content)
        };
    }

    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    generateExcerpt(content, maxLength = 150) {
        if (!content) return '';

        // Strip HTML tags
        const textContent = content.replace(/<[^>]*>/g, '');

        if (textContent.length <= maxLength) {
            return textContent;
        }

        return textContent.substring(0, maxLength).trim() + '...';
    }

    calculateReadingTime(content) {
        if (!content) return 0;

        const wordsPerMinute = 200;
        const textContent = content.replace(/<[^>]*>/g, '');
        const wordCount = textContent.split(/\s+/).length;

        return Math.ceil(wordCount / wordsPerMinute);
    }

    formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Cache management
     */
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
        // Also clear current user cache
        this.currentUser = null;
    }
}

// Export singleton instance
export const blogCMSService = new BlogCMSService();
