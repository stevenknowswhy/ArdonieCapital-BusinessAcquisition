
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
 * Blog Service
 * Handles blog content management, fetching, and caching
 */

export class BlogService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
        this.baseUrl = '/api/blog';
        this.isInitialized = false;
    }

    /**
     * Initialize the blog service
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('Initializing Blog Service...');
            this.isInitialized = true;
            console.log('✅ Blog Service initialized successfully');
        } catch (error) {
            console.error('❌ Blog Service initialization failed:', error);
            throw error;
        }
    }

    /**
     * Get all blog posts with optional filtering
     */
    async getPosts(options = {}) {
        const {
            page = 1,
            limit = 6,
            category = null,
            tag = null,
            search = null,
            sortBy = 'publishedAt',
            sortOrder = 'desc'
        } = options;

        const cacheKey = `posts_${JSON.stringify(options)}`;
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached.data, total: cached.total, fromCache: true };
        }

        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy,
                sortOrder
            });

            if (category) queryParams.append('category', category);
            if (tag) queryParams.append('tag', tag);
            if (search) queryParams.append('search', search);

            const response = await fetch(`${this.baseUrl}/posts?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Cache the result
            this.setCachedData(cacheKey, {
                data: result.data,
                total: result.total
            });

            return {
                success: true,
                data: result.data,
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            };

        } catch (error) {
            console.error('Error fetching blog posts:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
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
            const response = await fetch(`${this.baseUrl}/posts/${slug}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return { success: false, error: 'Post not found' };
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const post = await response.json();
            
            // Cache the result
            this.setCachedData(cacheKey, post);

            return { success: true, data: post };

        } catch (error) {
            console.error('Error fetching blog post:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get blog categories
     */
    async getCategories() {
        const cacheKey = 'categories';
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }

        try {
            const response = await fetch(`${this.baseUrl}/categories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const categories = await response.json();
            
            // Cache the result
            this.setCachedData(cacheKey, categories);

            return { success: true, data: categories };

        } catch (error) {
            console.error('Error fetching blog categories:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Get featured posts
     */
    async getFeaturedPosts(limit = 3) {
        const cacheKey = `featured_${limit}`;
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }

        try {
            const response = await fetch(`${this.baseUrl}/posts/featured?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const posts = await response.json();
            
            // Cache the result
            this.setCachedData(cacheKey, posts);

            return { success: true, data: posts };

        } catch (error) {
            console.error('Error fetching featured posts:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Search blog posts
     */
    async searchPosts(query, options = {}) {
        const { limit = 10, category = null } = options;
        
        if (!query || query.trim().length < 2) {
            return { success: false, error: 'Search query must be at least 2 characters' };
        }

        try {
            const queryParams = new URLSearchParams({
                q: query.trim(),
                limit: limit.toString()
            });

            if (category) queryParams.append('category', category);

            const response = await fetch(`${this.baseUrl}/search?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const results = await response.json();

            return {
                success: true,
                data: results.data,
                total: results.total,
                query
            };

        } catch (error) {
            console.error('Error searching blog posts:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Subscribe to newsletter
     */
    async subscribeNewsletter(email) {
        if (!this.isValidEmail(email)) {
            return { success: false, error: 'Invalid email address' };
        }

        try {
            const response = await fetch(`${this.baseUrl}/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            return {
                success: true,
                message: result.message || 'Successfully subscribed to newsletter'
            };

        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get related posts
     */
    async getRelatedPosts(postId, limit = 3) {
        const cacheKey = `related_${postId}_${limit}`;
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            return { success: true, data: cached, fromCache: true };
        }

        try {
            const response = await fetch(`${this.baseUrl}/posts/${postId}/related?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const posts = await response.json();
            
            // Cache the result
            this.setCachedData(cacheKey, posts);

            return { success: true, data: posts };

        } catch (error) {
            console.error('Error fetching related posts:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Cache management
     */
    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getCachedData(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clearCache() {
        this.cache.clear();
    }

    /**
     * Utility methods
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Format post excerpt
     */
    formatExcerpt(content, maxLength = 150) {
        if (!content) return '';
        
        // Strip HTML tags
        const textContent = content.replace(/<[^>]*>/g, '');
        
        if (textContent.length <= maxLength) {
            return textContent;
        }
        
        return textContent.substring(0, maxLength).trim() + '...';
    }

    /**
     * Format post date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Get reading time estimate
     */
    getReadingTime(content) {
        if (!content) return 0;
        
        const wordsPerMinute = 200;
        const textContent = content.replace(/<[^>]*>/g, '');
        const wordCount = textContent.split(/\s+/).length;
        
        return Math.ceil(wordCount / wordsPerMinute);
    }
}
