/**
 * Content API Service
 * RESTful API endpoints for content management
 * @author Ardonie Capital Development Team
 */

import { blogCMSService } from './blog-cms.service.js';

export class ContentAPIService {
    constructor() {
        this.baseUrl = '/api/content';
        this.endpoints = {
            posts: '/posts',
            categories: '/categories',
            upload: '/upload',
            media: '/media'
        };
    }

    /**
     * Initialize the content API service
     */
    async init() {
        try {
            // Ensure blog CMS service is initialized
            if (!blogCMSService.isInitialized) {
                await blogCMSService.initializeService();
            }
            console.log('Content API service initialized');
        } catch (error) {
            console.error('Failed to initialize content API service:', error);
            throw error;
        }
    }

    /**
     * Posts API endpoints
     */
    async getAllPosts(params = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                category,
                tag,
                search,
                status = 'published',
                sortBy = 'published_at',
                sortOrder = 'desc',
                includeUnpublished = false
            } = params;

            const result = await blogCMSService.getPosts({
                page: parseInt(page),
                limit: parseInt(limit),
                category,
                tag,
                search,
                status,
                sortBy,
                sortOrder,
                includeUnpublished: includeUnpublished === 'true'
            });

            return this.formatAPIResponse(result);
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }

    async getPostBySlug(slug) {
        try {
            const result = await blogCMSService.getPost(slug);
            return this.formatAPIResponse(result);
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }

    async createPost(postData) {
        try {
            const result = await blogCMSService.createPost(postData);
            return this.formatAPIResponse(result);
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }

    async updatePost(postId, postData) {
        try {
            const result = await blogCMSService.updatePost(postId, postData);
            return this.formatAPIResponse(result);
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }

    async deletePost(postId) {
        try {
            const result = await blogCMSService.deletePost(postId);
            return this.formatAPIResponse(result);
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }

    async getFeaturedPosts(limit = 3) {
        try {
            const result = await blogCMSService.getFeaturedPosts(parseInt(limit));
            return this.formatAPIResponse(result);
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }

    async searchPosts(query, options = {}) {
        try {
            const result = await blogCMSService.searchPosts(query, options);
            return this.formatAPIResponse(result);
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }

    /**
     * Categories API endpoints
     */
    async getAllCategories() {
        try {
            const result = await blogCMSService.getCategories();
            return this.formatAPIResponse(result);
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }

    async getCategories() {
        try {
            const result = await blogCMSService.getCategories();
            return this.formatAPIResponse(result);
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }

    async createCategory(categoryData) {
        try {
            const result = await blogCMSService.createCategory(categoryData);
            return this.formatAPIResponse(result);
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }

    /**
     * Content management utilities
     */
    async validatePostData(postData) {
        const errors = [];

        // Required fields validation
        if (!postData.title || postData.title.trim().length === 0) {
            errors.push('Title is required');
        }

        if (!postData.content || postData.content.trim().length === 0) {
            errors.push('Content is required');
        }

        // Title length validation
        if (postData.title && postData.title.length > 200) {
            errors.push('Title must be less than 200 characters');
        }

        // Slug validation
        if (postData.slug) {
            const slugPattern = /^[a-z0-9-]+$/;
            if (!slugPattern.test(postData.slug)) {
                errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
            }
        }

        // Status validation
        const validStatuses = ['draft', 'published', 'archived'];
        if (postData.status && !validStatuses.includes(postData.status)) {
            errors.push('Status must be one of: draft, published, archived');
        }

        // Meta description length validation
        if (postData.meta_description && postData.meta_description.length > 160) {
            errors.push('Meta description should be less than 160 characters for SEO');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    async validateCategoryData(categoryData) {
        const errors = [];

        // Required fields validation
        if (!categoryData.name || categoryData.name.trim().length === 0) {
            errors.push('Category name is required');
        }

        // Name length validation
        if (categoryData.name && categoryData.name.length > 100) {
            errors.push('Category name must be less than 100 characters');
        }

        // Slug validation
        if (categoryData.slug) {
            const slugPattern = /^[a-z0-9-]+$/;
            if (!slugPattern.test(categoryData.slug)) {
                errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
            }
        }

        // Color validation
        if (categoryData.color) {
            const colorPattern = /^#[0-9A-Fa-f]{6}$/;
            if (!colorPattern.test(categoryData.color)) {
                errors.push('Color must be a valid hex color code (e.g., #3B82F6)');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Content processing utilities
     */
    async processContentForSave(content) {
        try {
            // Sanitize HTML content
            const sanitizedContent = this.sanitizeHTML(content);
            
            // Extract and optimize images
            const processedContent = await this.processImages(sanitizedContent);
            
            return processedContent;
        } catch (error) {
            console.error('Failed to process content:', error);
            return content; // Return original content if processing fails
        }
    }

    sanitizeHTML(html) {
        // Basic HTML sanitization - in production, use a proper library like DOMPurify
        const allowedTags = [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'
        ];
        
        // This is a simplified sanitization - implement proper sanitization in production
        return html;
    }

    async processImages(content) {
        // Extract image URLs and process them
        // This would typically involve:
        // 1. Uploading images to Supabase Storage
        // 2. Replacing local URLs with CDN URLs
        // 3. Generating different sizes for responsive images
        
        return content;
    }

    /**
     * Response formatting utilities
     */
    formatAPIResponse(result) {
        if (result.success) {
            return {
                success: true,
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                    fromCache: result.fromCache || false
                }
            };
        } else {
            return {
                success: false,
                error: result.error,
                code: this.getErrorCode(result.error)
            };
        }
    }

    formatErrorResponse(error) {
        return {
            success: false,
            error: error.message || 'An unexpected error occurred',
            code: 'INTERNAL_ERROR'
        };
    }

    getErrorCode(errorMessage) {
        if (errorMessage.includes('not found')) return 'NOT_FOUND';
        if (errorMessage.includes('permission')) return 'FORBIDDEN';
        if (errorMessage.includes('authenticated')) return 'UNAUTHORIZED';
        if (errorMessage.includes('validation')) return 'VALIDATION_ERROR';
        return 'INTERNAL_ERROR';
    }

    /**
     * Bulk operations
     */
    async bulkUpdatePosts(postIds, updateData) {
        try {
            const results = [];
            
            for (const postId of postIds) {
                const result = await blogCMSService.updatePost(postId, updateData);
                results.push({ postId, result });
            }

            const successCount = results.filter(r => r.result.success).length;
            const failureCount = results.length - successCount;

            return {
                success: true,
                data: {
                    total: results.length,
                    successful: successCount,
                    failed: failureCount,
                    results
                }
            };
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }

    async bulkDeletePosts(postIds) {
        try {
            const results = [];
            
            for (const postId of postIds) {
                const result = await blogCMSService.deletePost(postId);
                results.push({ postId, result });
            }

            const successCount = results.filter(r => r.result.success).length;
            const failureCount = results.length - successCount;

            return {
                success: true,
                data: {
                    total: results.length,
                    successful: successCount,
                    failed: failureCount,
                    results
                }
            };
        } catch (error) {
            return this.formatErrorResponse(error);
        }
    }
}

// Export singleton instance
export const contentAPIService = new ContentAPIService();
