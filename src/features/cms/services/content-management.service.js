/**
 * Content Management Service
 * Comprehensive CMS for blogs, resources, and dynamic content
 * Provides content creation, editing, publishing, and management capabilities
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

class ContentManagementService {
    constructor() {
        this.contentTable = 'cms_content';
        this.categoriesTable = 'cms_categories';
        this.tagsTable = 'cms_tags';
        this.contentTagsTable = 'cms_content_tags';
        this.revisionsTable = 'cms_content_revisions';
        this.commentsTable = 'cms_comments';
        this.analyticsTable = 'cms_analytics';
    }

    /**
     * Create new content
     */
    async createContent(contentData) {
        try {
            // Get current user
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in to create content');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Validate content data
            const validation = this.validateContentData(contentData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Generate slug if not provided
            const slug = contentData.slug || this.generateSlug(contentData.title);

            // Check slug uniqueness
            const existingContent = await supabaseService.select(this.contentTable, {
                eq: { slug: slug, content_type: contentData.content_type },
                single: true
            });

            if (existingContent.success && existingContent.data) {
                throw new Error('Content with this slug already exists');
            }

            // Prepare content record
            const contentRecord = {
                title: contentData.title,
                slug: slug,
                content_type: contentData.content_type,
                content: contentData.content,
                excerpt: contentData.excerpt || this.generateExcerpt(contentData.content),
                status: contentData.status || 'draft',
                author_id: userProfile.data.id,
                category_id: contentData.category_id || null,
                featured_image: contentData.featured_image || null,
                meta_title: contentData.meta_title || contentData.title,
                meta_description: contentData.meta_description || contentData.excerpt,
                meta_keywords: contentData.meta_keywords || [],
                published_at: contentData.status === 'published' ? new Date().toISOString() : null,
                scheduled_at: contentData.scheduled_at || null,
                settings: contentData.settings || {},
                metadata: {
                    word_count: this.countWords(contentData.content),
                    reading_time: this.calculateReadingTime(contentData.content),
                    created_by: userProfile.data.id,
                    ...contentData.metadata
                }
            };

            const result = await supabaseService.insert(this.contentTable, contentRecord);

            if (result.success) {
                // Handle tags
                if (contentData.tags && contentData.tags.length > 0) {
                    await this.assignTags(result.data.id, contentData.tags);
                }

                // Create initial revision
                await this.createRevision(result.data.id, contentRecord, 'Initial creation');

                // Track analytics
                await this.trackContentEvent('content_created', {
                    content_id: result.data.id,
                    content_type: contentData.content_type,
                    author_id: userProfile.data.id
                });

                return {
                    success: true,
                    data: {
                        ...result.data,
                        tags: contentData.tags || []
                    }
                };
            }

            return result;
        } catch (error) {
            console.error('Create content error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update existing content
     */
    async updateContent(contentId, updateData) {
        try {
            // Get current user
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in to update content');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Get existing content
            const existingContent = await supabaseService.select(this.contentTable, {
                eq: { id: contentId },
                single: true
            });

            if (!existingContent.success) {
                throw new Error('Content not found');
            }

            const content = existingContent.data;

            // Check permissions
            if (!this.canEditContent(userProfile.data, content)) {
                throw new Error('Insufficient permissions to edit this content');
            }

            // Validate update data
            if (updateData.title || updateData.content) {
                const validation = this.validateContentData({
                    title: updateData.title || content.title,
                    content: updateData.content || content.content,
                    content_type: content.content_type
                });
                if (!validation.valid) {
                    throw new Error(validation.error);
                }
            }

            // Prepare update data
            const updateRecord = {
                ...updateData,
                updated_at: new Date().toISOString()
            };

            // Update slug if title changed
            if (updateData.title && updateData.title !== content.title) {
                updateRecord.slug = updateData.slug || this.generateSlug(updateData.title);
            }

            // Update excerpt if content changed
            if (updateData.content && updateData.content !== content.content) {
                updateRecord.excerpt = updateData.excerpt || this.generateExcerpt(updateData.content);
                updateRecord.metadata = {
                    ...content.metadata,
                    word_count: this.countWords(updateData.content),
                    reading_time: this.calculateReadingTime(updateData.content),
                    last_modified_by: userProfile.data.id
                };
            }

            // Handle status changes
            if (updateData.status && updateData.status !== content.status) {
                if (updateData.status === 'published' && content.status !== 'published') {
                    updateRecord.published_at = new Date().toISOString();
                } else if (updateData.status !== 'published') {
                    updateRecord.published_at = null;
                }
            }

            const result = await supabaseService.update(this.contentTable, updateRecord, { id: contentId });

            if (result.success) {
                // Handle tags update
                if (updateData.tags !== undefined) {
                    await this.updateContentTags(contentId, updateData.tags);
                }

                // Create revision
                await this.createRevision(contentId, { ...content, ...updateRecord }, 'Content updated');

                // Track analytics
                await this.trackContentEvent('content_updated', {
                    content_id: contentId,
                    content_type: content.content_type,
                    author_id: userProfile.data.id,
                    changes: Object.keys(updateData)
                });

                return await this.getContentById(contentId);
            }

            return result;
        } catch (error) {
            console.error('Update content error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get content by ID with full details
     */
    async getContentById(contentId) {
        try {
            const result = await supabaseService.select(this.contentTable, {
                select: `
                    *,
                    author:profiles!author_id (
                        id, first_name, last_name, avatar_url
                    ),
                    category:cms_categories (
                        id, name, slug, color
                    ),
                    tags:cms_content_tags (
                        tag:cms_tags (
                            id, name, slug, color
                        )
                    )
                `,
                eq: { id: contentId },
                single: true
            });

            if (result.success) {
                // Flatten tags
                result.data.tags = result.data.tags?.map(ct => ct.tag) || [];
                
                // Get analytics
                result.data.analytics = await this.getContentAnalytics(contentId);
            }

            return result;
        } catch (error) {
            console.error('Get content by ID error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get content list with filtering and pagination
     */
    async getContentList(filters = {}, pagination = {}) {
        try {
            let query = {
                select: `
                    *,
                    author:profiles!author_id (
                        id, first_name, last_name, avatar_url
                    ),
                    category:cms_categories (
                        id, name, slug, color
                    )
                `,
                order: { column: filters.sort_by || 'created_at', ascending: filters.sort_order === 'asc' }
            };

            // Apply filters
            if (filters.content_type) {
                query.eq = { content_type: filters.content_type };
            }

            if (filters.status) {
                query.eq = { ...query.eq, status: filters.status };
            }

            if (filters.category_id) {
                query.eq = { ...query.eq, category_id: filters.category_id };
            }

            if (filters.author_id) {
                query.eq = { ...query.eq, author_id: filters.author_id };
            }

            if (filters.search) {
                query.or = `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`;
            }

            if (filters.date_from) {
                query.gte = { created_at: filters.date_from };
            }

            if (filters.date_to) {
                query.lte = { created_at: filters.date_to };
            }

            // Apply pagination
            if (pagination.limit) {
                query.limit = pagination.limit;
            }

            if (pagination.offset) {
                query.offset = pagination.offset;
            }

            const result = await supabaseService.select(this.contentTable, query);

            if (result.success) {
                // Get total count for pagination
                const countQuery = { ...query };
                delete countQuery.select;
                delete countQuery.limit;
                delete countQuery.offset;
                delete countQuery.order;
                countQuery.count = 'exact';

                const countResult = await supabaseService.select(this.contentTable, countQuery);
                
                return {
                    success: true,
                    data: {
                        content: result.data,
                        total: countResult.success ? countResult.count : 0,
                        pagination: {
                            limit: pagination.limit || result.data.length,
                            offset: pagination.offset || 0,
                            has_more: countResult.success ? 
                                (pagination.offset || 0) + result.data.length < countResult.count : false
                        }
                    }
                };
            }

            return result;
        } catch (error) {
            console.error('Get content list error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Publish content
     */
    async publishContent(contentId) {
        try {
            return await this.updateContent(contentId, {
                status: 'published',
                published_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Publish content error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Unpublish content
     */
    async unpublishContent(contentId) {
        try {
            return await this.updateContent(contentId, {
                status: 'draft',
                published_at: null
            });
        } catch (error) {
            console.error('Unpublish content error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete content
     */
    async deleteContent(contentId) {
        try {
            // Get current user
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in to delete content');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Get existing content
            const existingContent = await supabaseService.select(this.contentTable, {
                eq: { id: contentId },
                single: true
            });

            if (!existingContent.success) {
                throw new Error('Content not found');
            }

            const content = existingContent.data;

            // Check permissions
            if (!this.canDeleteContent(userProfile.data, content)) {
                throw new Error('Insufficient permissions to delete this content');
            }

            // Soft delete by updating status
            const result = await supabaseService.update(this.contentTable, {
                status: 'deleted',
                deleted_at: new Date().toISOString(),
                deleted_by: userProfile.data.id
            }, { id: contentId });

            if (result.success) {
                // Track analytics
                await this.trackContentEvent('content_deleted', {
                    content_id: contentId,
                    content_type: content.content_type,
                    author_id: userProfile.data.id
                });
            }

            return result;
        } catch (error) {
            console.error('Delete content error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Validation and utility methods
     */
    validateContentData(data) {
        if (!data.title || data.title.trim().length < 3) {
            return { valid: false, error: 'Title must be at least 3 characters long' };
        }

        if (data.title.length > 200) {
            return { valid: false, error: 'Title cannot exceed 200 characters' };
        }

        if (!data.content || data.content.trim().length < 10) {
            return { valid: false, error: 'Content must be at least 10 characters long' };
        }

        if (!data.content_type) {
            return { valid: false, error: 'Content type is required' };
        }

        const validContentTypes = ['blog', 'page', 'resource', 'guide', 'news', 'faq'];
        if (!validContentTypes.includes(data.content_type)) {
            return { valid: false, error: 'Invalid content type' };
        }

        return { valid: true };
    }

    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    generateExcerpt(content, maxLength = 160) {
        // Strip HTML tags and get plain text
        const plainText = content.replace(/<[^>]*>/g, '');
        
        if (plainText.length <= maxLength) {
            return plainText;
        }

        // Find the last complete word within the limit
        const truncated = plainText.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    }

    countWords(content) {
        const plainText = content.replace(/<[^>]*>/g, '');
        return plainText.trim().split(/\s+/).length;
    }

    calculateReadingTime(content, wordsPerMinute = 200) {
        const wordCount = this.countWords(content);
        return Math.ceil(wordCount / wordsPerMinute);
    }

    canEditContent(user, content) {
        // Content author can edit
        if (content.author_id === user.id) return true;
        
        // Admins and editors can edit
        if (['admin', 'editor'].includes(user.role)) return true;
        
        return false;
    }

    canDeleteContent(user, content) {
        // Content author can delete their own drafts
        if (content.author_id === user.id && content.status === 'draft') return true;
        
        // Admins can delete any content
        if (user.role === 'admin') return true;
        
        return false;
    }

    async assignTags(contentId, tags) {
        try {
            // Process tags and create if needed
            const tagIds = [];
            
            for (const tagName of tags) {
                let tag = await supabaseService.select(this.tagsTable, {
                    eq: { name: tagName },
                    single: true
                });

                if (!tag.success || !tag.data) {
                    // Create new tag
                    const newTag = await supabaseService.insert(this.tagsTable, {
                        name: tagName,
                        slug: this.generateSlug(tagName)
                    });
                    
                    if (newTag.success) {
                        tagIds.push(newTag.data.id);
                    }
                } else {
                    tagIds.push(tag.data.id);
                }
            }

            // Create content-tag relationships
            const contentTags = tagIds.map(tagId => ({
                content_id: contentId,
                tag_id: tagId
            }));

            if (contentTags.length > 0) {
                await supabaseService.insert(this.contentTagsTable, contentTags);
            }
        } catch (error) {
            console.error('Assign tags error:', error);
        }
    }

    async updateContentTags(contentId, tags) {
        try {
            // Remove existing tags
            await supabaseService.delete(this.contentTagsTable, { content_id: contentId });
            
            // Add new tags
            if (tags && tags.length > 0) {
                await this.assignTags(contentId, tags);
            }
        } catch (error) {
            console.error('Update content tags error:', error);
        }
    }

    async createRevision(contentId, contentData, changeNote) {
        try {
            await supabaseService.insert(this.revisionsTable, {
                content_id: contentId,
                content_snapshot: contentData,
                change_note: changeNote,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Create revision error:', error);
        }
    }

    async trackContentEvent(eventType, eventData) {
        try {
            await supabaseService.insert(this.analyticsTable, {
                event_type: eventType,
                event_data: eventData,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Track content event error:', error);
        }
    }

    async getContentAnalytics(contentId) {
        try {
            const result = await supabaseService.select(this.analyticsTable, {
                eq: { 'event_data->>content_id': contentId },
                order: { column: 'created_at', ascending: false }
            });

            if (result.success) {
                const events = result.data;
                return {
                    total_views: events.filter(e => e.event_type === 'content_viewed').length,
                    total_shares: events.filter(e => e.event_type === 'content_shared').length,
                    total_comments: events.filter(e => e.event_type === 'comment_created').length,
                    last_viewed: events.find(e => e.event_type === 'content_viewed')?.created_at
                };
            }

            return { total_views: 0, total_shares: 0, total_comments: 0, last_viewed: null };
        } catch (error) {
            console.error('Get content analytics error:', error);
            return { total_views: 0, total_shares: 0, total_comments: 0, last_viewed: null };
        }
    }
}

// Export singleton instance
export const contentManagementService = new ContentManagementService();
