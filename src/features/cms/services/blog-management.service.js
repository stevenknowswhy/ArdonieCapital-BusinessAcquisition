/**
 * Blog Management Service
 * Specialized service for blog content management
 * Provides blog-specific features like comments, social sharing, and SEO optimization
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';
import { contentManagementService } from './content-management.service.js';

class BlogManagementService {
    constructor() {
        this.contentTable = 'cms_content';
        this.commentsTable = 'cms_comments';
        this.categoriesTable = 'cms_categories';
        this.tagsTable = 'cms_tags';
        this.analyticsTable = 'cms_analytics';
        this.contentType = 'blog';
    }

    /**
     * Create new blog post
     */
    async createBlogPost(blogData) {
        try {
            const blogPost = {
                ...blogData,
                content_type: this.contentType,
                settings: {
                    allow_comments: blogData.allow_comments !== false,
                    show_author: blogData.show_author !== false,
                    show_date: blogData.show_date !== false,
                    show_reading_time: blogData.show_reading_time !== false,
                    social_sharing: blogData.social_sharing !== false,
                    ...blogData.settings
                }
            };

            return await contentManagementService.createContent(blogPost);
        } catch (error) {
            console.error('Create blog post error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get published blog posts for public display
     */
    async getPublishedBlogPosts(filters = {}, pagination = {}) {
        try {
            const blogFilters = {
                ...filters,
                content_type: this.contentType,
                status: 'published'
            };

            const result = await contentManagementService.getContentList(blogFilters, pagination);

            if (result.success) {
                // Add blog-specific data
                for (const post of result.data.content) {
                    post.comment_count = await this.getCommentCount(post.id);
                    post.view_count = await this.getViewCount(post.id);
                }
            }

            return result;
        } catch (error) {
            console.error('Get published blog posts error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get blog post by slug for public display
     */
    async getBlogPostBySlug(slug) {
        try {
            const result = await supabaseService.select(this.contentTable, {
                select: `
                    *,
                    author:profiles!author_id (
                        id, first_name, last_name, avatar_url, bio
                    ),
                    category:cms_categories (
                        id, name, slug, color, description
                    ),
                    tags:cms_content_tags (
                        tag:cms_tags (
                            id, name, slug, color
                        )
                    )
                `,
                eq: { 
                    slug: slug, 
                    content_type: this.contentType,
                    status: 'published'
                },
                single: true
            });

            if (result.success && result.data) {
                // Flatten tags
                result.data.tags = result.data.tags?.map(ct => ct.tag) || [];
                
                // Add blog-specific data
                result.data.comments = await this.getPostComments(result.data.id);
                result.data.comment_count = result.data.comments.length;
                result.data.view_count = await this.getViewCount(result.data.id);
                result.data.related_posts = await this.getRelatedPosts(result.data.id, 3);

                // Track view
                await this.trackBlogView(result.data.id);
            }

            return result;
        } catch (error) {
            console.error('Get blog post by slug error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get blog categories with post counts
     */
    async getBlogCategories() {
        try {
            const result = await supabaseService.select(this.categoriesTable, {
                select: `
                    *,
                    post_count:cms_content(count)
                `,
                eq: { content_type: this.contentType },
                order: { column: 'name', ascending: true }
            });

            return result;
        } catch (error) {
            console.error('Get blog categories error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get popular blog tags
     */
    async getPopularTags(limit = 20) {
        try {
            // This would typically be done with a more complex query
            // For now, get all tags and count their usage
            const result = await supabaseService.select(this.tagsTable, {
                select: `
                    *,
                    usage_count:cms_content_tags(count)
                `,
                order: { column: 'usage_count', ascending: false },
                limit: limit
            });

            return result;
        } catch (error) {
            console.error('Get popular tags error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Add comment to blog post
     */
    async addComment(postId, commentData) {
        try {
            // Get current user
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in to comment');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Validate comment
            if (!commentData.content || commentData.content.trim().length < 3) {
                throw new Error('Comment must be at least 3 characters long');
            }

            if (commentData.content.length > 1000) {
                throw new Error('Comment cannot exceed 1000 characters');
            }

            // Check if post allows comments
            const post = await supabaseService.select(this.contentTable, {
                eq: { id: postId },
                single: true
            });

            if (!post.success || !post.data) {
                throw new Error('Blog post not found');
            }

            if (!post.data.settings?.allow_comments) {
                throw new Error('Comments are not allowed on this post');
            }

            // Create comment
            const commentRecord = {
                content_id: postId,
                author_id: userProfile.data.id,
                content: commentData.content.trim(),
                parent_id: commentData.parent_id || null,
                status: 'approved', // Auto-approve for now, could add moderation
                ip_address: commentData.ip_address || null,
                user_agent: commentData.user_agent || null
            };

            const result = await supabaseService.insert(this.commentsTable, commentRecord);

            if (result.success) {
                // Track analytics
                await this.trackBlogEvent('comment_created', {
                    content_id: postId,
                    comment_id: result.data.id,
                    author_id: userProfile.data.id
                });

                // Get comment with author info
                return await this.getCommentById(result.data.id);
            }

            return result;
        } catch (error) {
            console.error('Add comment error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get comments for a blog post
     */
    async getPostComments(postId, includeReplies = true) {
        try {
            let query = {
                select: `
                    *,
                    author:profiles!author_id (
                        id, first_name, last_name, avatar_url
                    )
                `,
                eq: { 
                    content_id: postId,
                    status: 'approved'
                },
                order: { column: 'created_at', ascending: true }
            };

            if (!includeReplies) {
                query.eq.parent_id = null;
            }

            const result = await supabaseService.select(this.commentsTable, query);

            if (result.success && includeReplies) {
                // Organize comments into threads
                result.data = this.organizeCommentsIntoThreads(result.data);
            }

            return result;
        } catch (error) {
            console.error('Get post comments error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get comment by ID
     */
    async getCommentById(commentId) {
        try {
            return await supabaseService.select(this.commentsTable, {
                select: `
                    *,
                    author:profiles!author_id (
                        id, first_name, last_name, avatar_url
                    )
                `,
                eq: { id: commentId },
                single: true
            });
        } catch (error) {
            console.error('Get comment by ID error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get related blog posts
     */
    async getRelatedPosts(postId, limit = 5) {
        try {
            // Get current post to find related posts
            const currentPost = await supabaseService.select(this.contentTable, {
                select: `
                    category_id,
                    tags:cms_content_tags (
                        tag_id
                    )
                `,
                eq: { id: postId },
                single: true
            });

            if (!currentPost.success) {
                return [];
            }

            const tagIds = currentPost.data.tags?.map(t => t.tag_id) || [];

            // Find posts with same category or tags
            let relatedPosts = [];

            if (currentPost.data.category_id) {
                const categoryPosts = await supabaseService.select(this.contentTable, {
                    select: `
                        id, title, slug, excerpt, featured_image, published_at,
                        author:profiles!author_id (
                            first_name, last_name
                        )
                    `,
                    eq: { 
                        category_id: currentPost.data.category_id,
                        content_type: this.contentType,
                        status: 'published'
                    },
                    neq: { id: postId },
                    limit: limit,
                    order: { column: 'published_at', ascending: false }
                });

                if (categoryPosts.success) {
                    relatedPosts = categoryPosts.data;
                }
            }

            // If we need more posts, find by tags
            if (relatedPosts.length < limit && tagIds.length > 0) {
                const tagPosts = await supabaseService.select(this.contentTable, {
                    select: `
                        id, title, slug, excerpt, featured_image, published_at,
                        author:profiles!author_id (
                            first_name, last_name
                        )
                    `,
                    eq: { 
                        content_type: this.contentType,
                        status: 'published'
                    },
                    neq: { id: postId },
                    limit: limit - relatedPosts.length,
                    order: { column: 'published_at', ascending: false }
                });

                if (tagPosts.success) {
                    // Filter posts that share tags (simplified approach)
                    relatedPosts = [...relatedPosts, ...tagPosts.data];
                }
            }

            return relatedPosts.slice(0, limit);
        } catch (error) {
            console.error('Get related posts error:', error);
            return [];
        }
    }

    /**
     * Search blog posts
     */
    async searchBlogPosts(searchQuery, filters = {}, pagination = {}) {
        try {
            const searchFilters = {
                ...filters,
                content_type: this.contentType,
                status: 'published',
                search: searchQuery
            };

            return await contentManagementService.getContentList(searchFilters, pagination);
        } catch (error) {
            console.error('Search blog posts error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get blog archive (posts by month/year)
     */
    async getBlogArchive() {
        try {
            const result = await supabaseService.select(this.contentTable, {
                select: 'published_at',
                eq: { 
                    content_type: this.contentType,
                    status: 'published'
                },
                order: { column: 'published_at', ascending: false }
            });

            if (result.success) {
                // Group by year and month
                const archive = {};
                
                result.data.forEach(post => {
                    const date = new Date(post.published_at);
                    const year = date.getFullYear();
                    const month = date.getMonth();
                    
                    if (!archive[year]) {
                        archive[year] = {};
                    }
                    
                    if (!archive[year][month]) {
                        archive[year][month] = 0;
                    }
                    
                    archive[year][month]++;
                });

                return { success: true, data: archive };
            }

            return result;
        } catch (error) {
            console.error('Get blog archive error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Track blog view
     */
    async trackBlogView(postId) {
        try {
            await this.trackBlogEvent('content_viewed', {
                content_id: postId,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Track blog view error:', error);
        }
    }

    /**
     * Track blog event
     */
    async trackBlogEvent(eventType, eventData) {
        try {
            await supabaseService.insert(this.analyticsTable, {
                event_type: eventType,
                event_data: eventData,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Track blog event error:', error);
        }
    }

    /**
     * Get comment count for a post
     */
    async getCommentCount(postId) {
        try {
            const result = await supabaseService.select(this.commentsTable, {
                eq: { 
                    content_id: postId,
                    status: 'approved'
                },
                count: 'exact'
            });

            return result.success ? result.count : 0;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Get view count for a post
     */
    async getViewCount(postId) {
        try {
            const result = await supabaseService.select(this.analyticsTable, {
                eq: { 
                    event_type: 'content_viewed',
                    'event_data->>content_id': postId
                },
                count: 'exact'
            });

            return result.success ? result.count : 0;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Organize comments into threaded structure
     */
    organizeCommentsIntoThreads(comments) {
        const commentMap = new Map();
        const rootComments = [];

        // First pass: create map and identify root comments
        comments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [] });
            
            if (!comment.parent_id) {
                rootComments.push(comment.id);
            }
        });

        // Second pass: build reply structure
        comments.forEach(comment => {
            if (comment.parent_id && commentMap.has(comment.parent_id)) {
                commentMap.get(comment.parent_id).replies.push(commentMap.get(comment.id));
            }
        });

        // Return root comments with nested replies
        return rootComments.map(id => commentMap.get(id));
    }

    /**
     * Generate blog post sitemap data
     */
    async generateSitemapData() {
        try {
            const result = await supabaseService.select(this.contentTable, {
                select: 'slug, updated_at, published_at',
                eq: { 
                    content_type: this.contentType,
                    status: 'published'
                },
                order: { column: 'published_at', ascending: false }
            });

            if (result.success) {
                return result.data.map(post => ({
                    url: `/blog/${post.slug}`,
                    lastModified: post.updated_at || post.published_at,
                    changeFrequency: 'weekly',
                    priority: 0.7
                }));
            }

            return [];
        } catch (error) {
            console.error('Generate sitemap data error:', error);
            return [];
        }
    }

    /**
     * Get blog RSS feed data
     */
    async getRSSFeedData(limit = 20) {
        try {
            const result = await supabaseService.select(this.contentTable, {
                select: `
                    title, slug, excerpt, content, published_at,
                    author:profiles!author_id (
                        first_name, last_name
                    )
                `,
                eq: { 
                    content_type: this.contentType,
                    status: 'published'
                },
                order: { column: 'published_at', ascending: false },
                limit: limit
            });

            return result;
        } catch (error) {
            console.error('Get RSS feed data error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
export const blogManagementService = new BlogManagementService();
