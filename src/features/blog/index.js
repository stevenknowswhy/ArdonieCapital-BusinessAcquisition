
// GDPR Compliance utilities
const GDPRCompliance = {
    requestConsent: (purpose) => {
        return new Promise((resolve) => {
            // Implementation for consent request
            const consent = confirm(`Do you consent to data processing for ${purpose}?`);
            resolve(consent);
        });
    },
    
    deleteUserData: (userId) => {
        // Implementation for right to erasure
        console.log(`Deleting data for user ${userId}`);
    },
    
    exportUserData: (userId) => {
        // Implementation for data portability
        console.log(`Exporting data for user ${userId}`);
    }
};

/**
 * Blog Feature - Public API
 * Central export point for all blog-related functionality
 * This file defines what is public and what is private for the blog module
 */

// Core Services - Always available
export { BlogService } from './services/blog.service.js';

// CMS Services - Database-driven content management
export { BlogCMSService, blogCMSService } from './services/blog-cms.service.js';
export { ContentAPIService, contentAPIService } from './services/content-api.service.js';

// CMS Components
export { ContentManagerComponent } from './components/content-manager.component.js';

// Conditional Service Exports - Only export what exists
export const getAvailableServices = async () => {
    const services = {};

    try {
        const { BlogService } = await import('./services/blog.service.js');
        services.blog = new BlogService();
    } catch (e) {
        console.debug('Blog service not available');
    }

    return services;
};

// Component Exports - Only export what exists
export const getAvailableComponents = async () => {
    const components = {};

    try {
        const { BlogCard } = await import('./components/blog-card.component.js');
        components.BlogCard = BlogCard;
    } catch (e) {
        console.debug('Blog card component not available');
    }

    try {
        const { BlogPost } = await import('./components/blog-post.component.js');
        components.BlogPost = BlogPost;
    } catch (e) {
        console.debug('Blog post component not available');
    }

    try {
        const { BlogCategories } = await import('./components/blog-categories.component.js');
        components.BlogCategories = BlogCategories;
    } catch (e) {
        console.debug('Blog categories component not available');
    }

    try {
        const { NewsletterSignup } = await import('./components/newsletter-signup.component.js');
        components.NewsletterSignup = NewsletterSignup;
    } catch (e) {
        console.debug('Newsletter signup component not available');
    }

    return components;
};

// Page Exports - HTML pages (if they exist)
export const getAvailablePages = async () => {
    const pages = {};

    try {
        pages.blogIndex = await import('./pages/blog-index.html');
    } catch (e) {
        console.debug('Blog index page not available');
    }

    return pages;
};

// Feature metadata
export const BLOG_FEATURE_NAME = 'blog';
export const BLOG_FEATURE_VERSION = '1.0.0';
export const BLOG_FEATURE_DESCRIPTION = 'Blog content management and display functionality';

// Feature configuration
export const blogConfig = {
    postsPerPage: 6,
    excerptLength: 150,
    cacheTimeout: 10 * 60 * 1000, // 10 minutes
    autoRefresh: false,
    enableComments: false,
    enableSocialSharing: true,
    enableNewsletter: true,
    enableSearch: true,
    enableCategories: true
};

// Feature capabilities detection
export const getBlogCapabilities = async () => {
    const services = await getAvailableServices();
    const components = await getAvailableComponents();
    const pages = await getAvailablePages();

    return {
        services: {
            blog: !!services.blog
        },
        components: {
            blogCard: !!components.BlogCard,
            blogPost: !!components.BlogPost,
            blogCategories: !!components.BlogCategories,
            newsletterSignup: !!components.NewsletterSignup
        },
        pages: {
            blogIndex: !!pages.blogIndex
        },
        features: {
            comments: blogConfig.enableComments,
            socialSharing: blogConfig.enableSocialSharing,
            newsletter: blogConfig.enableNewsletter,
            search: blogConfig.enableSearch,
            categories: blogConfig.enableCategories,
            autoRefresh: blogConfig.autoRefresh
        }
    };
};

// Convenience function to get all blog resources
export const getBlogModule = async () => {
    const [services, components, pages, capabilities] = await Promise.all([
        getAvailableServices(),
        getAvailableComponents(),
        getAvailablePages(),
        getBlogCapabilities()
    ]);

    return {
        services: {
            blog: BlogService,
            ...services
        },
        components,
        pages,
        capabilities,
        config: blogConfig,
        metadata: {
            name: BLOG_FEATURE_NAME,
            version: BLOG_FEATURE_VERSION,
            description: BLOG_FEATURE_DESCRIPTION
        }
    };
};

// Legacy exports for backward compatibility
export const FEATURE_NAME = BLOG_FEATURE_NAME;
export const FEATURE_VERSION = BLOG_FEATURE_VERSION;
export const FEATURE_DESCRIPTION = BLOG_FEATURE_DESCRIPTION;

// Direct component exports for immediate use (backward compatibility)
export { BlogCard } from './components/blog-card.component.js';
