/**
 * Content Management System (CMS) Feature Module
 * Comprehensive CMS for blogs, pages, resources, and dynamic content
 * Provides content creation, editing, publishing, comments, and analytics
 */

// Services
export { contentManagementService } from './services/content-management.service.js';
export { blogManagementService } from './services/blog-management.service.js';

// Components (to be created)
// export { ContentEditor } from './components/content-editor.component.js';
// export { BlogList } from './components/blog-list.component.js';
// export { BlogPost } from './components/blog-post.component.js';
// export { CommentSystem } from './components/comment-system.component.js';
// export { MediaLibrary } from './components/media-library.component.js';
// export { CategoryManager } from './components/category-manager.component.js';
// export { TagManager } from './components/tag-manager.component.js';

// Hooks (to be created)
// export { useContent } from './hooks/use-content.hook.js';
// export { useBlog } from './hooks/use-blog.hook.js';
// export { useComments } from './hooks/use-comments.hook.js';
// export { useMediaLibrary } from './hooks/use-media-library.hook.js';

// Utils (to be created)
// export { contentUtils } from './utils/content.utils.js';
// export { seoUtils } from './utils/seo.utils.js';
// export { editorUtils } from './utils/editor.utils.js';

// Constants
export const CONTENT_STATUSES = {
    DRAFT: 'draft',
    REVIEW: 'review',
    SCHEDULED: 'scheduled',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
    DELETED: 'deleted'
};

export const CONTENT_TYPES = {
    BLOG: 'blog',
    PAGE: 'page',
    RESOURCE: 'resource',
    GUIDE: 'guide',
    NEWS: 'news',
    FAQ: 'faq',
    ANNOUNCEMENT: 'announcement'
};

export const COMMENT_STATUSES = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SPAM: 'spam'
};

// Content type configurations
export const CONTENT_TYPE_CONFIGS = {
    [CONTENT_TYPES.BLOG]: {
        name: 'Blog Post',
        description: 'Blog articles and posts',
        supports_comments: true,
        supports_categories: true,
        supports_tags: true,
        supports_scheduling: true,
        default_status: 'draft',
        seo_important: true
    },
    [CONTENT_TYPES.PAGE]: {
        name: 'Page',
        description: 'Static pages and content',
        supports_comments: false,
        supports_categories: false,
        supports_tags: false,
        supports_scheduling: false,
        default_status: 'draft',
        seo_important: true
    },
    [CONTENT_TYPES.RESOURCE]: {
        name: 'Resource',
        description: 'Downloadable resources and guides',
        supports_comments: true,
        supports_categories: true,
        supports_tags: true,
        supports_scheduling: true,
        default_status: 'draft',
        seo_important: true
    },
    [CONTENT_TYPES.GUIDE]: {
        name: 'Guide',
        description: 'How-to guides and tutorials',
        supports_comments: true,
        supports_categories: true,
        supports_tags: true,
        supports_scheduling: true,
        default_status: 'draft',
        seo_important: true
    },
    [CONTENT_TYPES.NEWS]: {
        name: 'News',
        description: 'News articles and updates',
        supports_comments: true,
        supports_categories: true,
        supports_tags: true,
        supports_scheduling: true,
        default_status: 'draft',
        seo_important: false
    },
    [CONTENT_TYPES.FAQ]: {
        name: 'FAQ',
        description: 'Frequently asked questions',
        supports_comments: false,
        supports_categories: true,
        supports_tags: false,
        supports_scheduling: false,
        default_status: 'published',
        seo_important: false
    },
    [CONTENT_TYPES.ANNOUNCEMENT]: {
        name: 'Announcement',
        description: 'Platform announcements',
        supports_comments: false,
        supports_categories: false,
        supports_tags: false,
        supports_scheduling: true,
        default_status: 'draft',
        seo_important: false
    }
};

// Default content settings
export const DEFAULT_CONTENT_SETTINGS = {
    [CONTENT_TYPES.BLOG]: {
        allow_comments: true,
        show_author: true,
        show_date: true,
        show_reading_time: true,
        social_sharing: true,
        show_related: true,
        show_tags: true,
        show_category: true
    },
    [CONTENT_TYPES.PAGE]: {
        show_author: false,
        show_date: false,
        show_reading_time: false,
        social_sharing: false,
        show_breadcrumbs: true
    },
    [CONTENT_TYPES.RESOURCE]: {
        allow_comments: true,
        show_author: true,
        show_date: true,
        show_download_count: true,
        require_email: false,
        social_sharing: true
    },
    [CONTENT_TYPES.GUIDE]: {
        allow_comments: true,
        show_author: true,
        show_date: true,
        show_reading_time: true,
        show_difficulty: true,
        show_steps: true,
        social_sharing: true
    }
};

// SEO defaults
export const SEO_DEFAULTS = {
    meta_title_suffix: ' | BuyMartV1',
    meta_description_length: 160,
    meta_keywords_max: 10,
    og_image_default: '/images/og-default.jpg',
    twitter_card_type: 'summary_large_image'
};

// Editor configurations
export const EDITOR_CONFIGS = {
    toolbar: [
        'heading', 'bold', 'italic', 'underline', 'strikethrough',
        'link', 'bulletedList', 'numberedList', 'blockQuote',
        'insertTable', 'mediaEmbed', 'codeBlock', 'horizontalLine',
        'undo', 'redo'
    ],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
        ]
    },
    image: {
        toolbar: ['imageTextAlternative', 'imageStyle:full', 'imageStyle:side']
    },
    table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    }
};

// Media configurations
export const MEDIA_CONFIGS = {
    allowed_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    max_file_size: 10 * 1024 * 1024, // 10MB
    image_max_width: 1920,
    image_max_height: 1080,
    thumbnail_sizes: {
        small: { width: 150, height: 150 },
        medium: { width: 300, height: 300 },
        large: { width: 600, height: 400 }
    }
};

// Analytics event types
export const ANALYTICS_EVENTS = {
    CONTENT_CREATED: 'content_created',
    CONTENT_UPDATED: 'content_updated',
    CONTENT_PUBLISHED: 'content_published',
    CONTENT_VIEWED: 'content_viewed',
    CONTENT_SHARED: 'content_shared',
    CONTENT_LIKED: 'content_liked',
    CONTENT_DOWNLOADED: 'content_downloaded',
    COMMENT_CREATED: 'comment_created',
    COMMENT_LIKED: 'comment_liked',
    SEARCH_PERFORMED: 'search_performed'
};

// Utility functions
export const formatContentStatus = (status) => {
    const statusLabels = {
        draft: 'Draft',
        review: 'Under Review',
        scheduled: 'Scheduled',
        published: 'Published',
        archived: 'Archived',
        deleted: 'Deleted'
    };
    return statusLabels[status] || status;
};

export const getContentStatusColor = (status) => {
    const statusColors = {
        draft: 'gray',
        review: 'yellow',
        scheduled: 'blue',
        published: 'green',
        archived: 'orange',
        deleted: 'red'
    };
    return statusColors[status] || 'gray';
};

export const formatContentType = (type) => {
    return CONTENT_TYPE_CONFIGS[type]?.name || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
};

export const generateExcerpt = (content, maxLength = 160) => {
    // Strip HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');
    
    if (plainText.length <= maxLength) {
        return plainText;
    }

    // Find the last complete word within the limit
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

export const countWords = (content) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.trim().split(/\s+/).length;
};

export const calculateReadingTime = (content, wordsPerMinute = 200) => {
    const wordCount = countWords(content);
    return Math.ceil(wordCount / wordsPerMinute);
};

export const formatReadingTime = (minutes) => {
    if (minutes < 1) return 'Less than 1 min read';
    if (minutes === 1) return '1 min read';
    return `${minutes} min read`;
};

export const formatPublishDate = (dateString, format = 'long') => {
    const date = new Date(dateString);
    
    if (format === 'short') {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
    
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const isContentPublished = (content) => {
    return content.status === 'published' && 
           content.published_at && 
           new Date(content.published_at) <= new Date();
};

export const isContentScheduled = (content) => {
    return content.status === 'scheduled' && 
           content.scheduled_at && 
           new Date(content.scheduled_at) > new Date();
};

export const getContentUrl = (content, baseUrl = '') => {
    const typeUrls = {
        blog: '/blog',
        page: '',
        resource: '/resources',
        guide: '/guides',
        news: '/news',
        faq: '/faq',
        announcement: '/announcements'
    };
    
    const basePath = typeUrls[content.content_type] || '';
    return `${baseUrl}${basePath}/${content.slug}`;
};

export const validateContentData = (data) => {
    const errors = [];
    
    if (!data.title || data.title.trim().length < 3) {
        errors.push('Title must be at least 3 characters long');
    }
    
    if (data.title && data.title.length > 200) {
        errors.push('Title cannot exceed 200 characters');
    }
    
    if (!data.content || data.content.trim().length < 10) {
        errors.push('Content must be at least 10 characters long');
    }
    
    if (!data.content_type) {
        errors.push('Content type is required');
    }
    
    if (data.content_type && !Object.values(CONTENT_TYPES).includes(data.content_type)) {
        errors.push('Invalid content type');
    }
    
    if (data.meta_description && data.meta_description.length > SEO_DEFAULTS.meta_description_length) {
        errors.push(`Meta description cannot exceed ${SEO_DEFAULTS.meta_description_length} characters`);
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
};

export const sanitizeHtml = (html) => {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
};

export const generateSEOMetaTags = (content) => {
    const metaTags = [];
    
    // Title
    const title = content.meta_title || content.title + SEO_DEFAULTS.meta_title_suffix;
    metaTags.push({ name: 'title', content: title });
    
    // Description
    const description = content.meta_description || content.excerpt;
    if (description) {
        metaTags.push({ name: 'description', content: description });
    }
    
    // Keywords
    if (content.meta_keywords && content.meta_keywords.length > 0) {
        metaTags.push({ name: 'keywords', content: content.meta_keywords.join(', ') });
    }
    
    // Open Graph
    metaTags.push({ property: 'og:title', content: content.og_title || title });
    metaTags.push({ property: 'og:description', content: content.og_description || description });
    metaTags.push({ property: 'og:type', content: content.content_type === 'blog' ? 'article' : 'website' });
    metaTags.push({ property: 'og:url', content: getContentUrl(content, window.location.origin) });
    
    if (content.og_image || content.featured_image) {
        metaTags.push({ property: 'og:image', content: content.og_image || content.featured_image });
    }
    
    // Twitter Card
    metaTags.push({ name: 'twitter:card', content: SEO_DEFAULTS.twitter_card_type });
    metaTags.push({ name: 'twitter:title', content: title });
    metaTags.push({ name: 'twitter:description', content: description });
    
    if (content.featured_image) {
        metaTags.push({ name: 'twitter:image', content: content.featured_image });
    }
    
    // Canonical URL
    if (content.canonical_url) {
        metaTags.push({ rel: 'canonical', href: content.canonical_url });
    }
    
    return metaTags;
};
