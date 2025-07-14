
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
 * Blog Card Component
 * Displays a blog post in card format for listings and grids
 */

export class BlogCard {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            showExcerpt: true,
            showAuthor: true,
            showDate: true,
            showCategory: true,
            showReadingTime: true,
            excerptLength: 150,
            imageAspectRatio: '16:9',
            ...options
        };
        this.post = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the blog card component
     */
    init() {
        if (this.isInitialized) return;
        
        if (!this.container) {
            throw new Error(`Blog card container not found: ${this.containerId}`);
        }

        this.isInitialized = true;
        console.log('✅ Blog Card component initialized');
    }

    /**
     * Render the blog card with post data
     */
    render(post) {
        if (!this.isInitialized) {
            this.init();
        }

        this.post = post;
        
        try {
            this.container.innerHTML = this.generateCardHTML(post);
            this.attachEventListeners();
            console.log('✅ Blog card rendered successfully');
        } catch (error) {
            console.error('❌ Error rendering blog card:', error);
            this.renderError('Failed to render blog post');
        }
    }

    /**
     * Generate the HTML for the blog card
     */
    generateCardHTML(post) {
        const {
            id,
            title,
            slug,
            excerpt,
            content,
            author,
            publishedAt,
            category,
            tags = [],
            featuredImage,
            readingTime
        } = post;

        const formattedDate = this.formatDate(publishedAt);
        const postExcerpt = excerpt || this.generateExcerpt(content);
        const estimatedReadingTime = readingTime || this.calculateReadingTime(content);
        const postUrl = `/blog/${slug}`;

        return `
            <article class="blog-card" data-post-id="${id}">
                ${this.generateImageSection(featuredImage, title, postUrl)}
                
                <div class="blog-card__content">
                    ${this.options.showCategory && category ? this.generateCategoryBadge(category) : ''}
                    
                    <h3 class="blog-card__title">
                        <a href="${postUrl}" class="blog-card__title-link">
                            ${this.escapeHtml(title)}
                        </a>
                    </h3>
                    
                    ${this.options.showExcerpt ? this.generateExcerptSection(postExcerpt) : ''}
                    
                    <div class="blog-card__meta">
                        ${this.options.showAuthor && author ? this.generateAuthorSection(author) : ''}
                        ${this.options.showDate ? this.generateDateSection(formattedDate) : ''}
                        ${this.options.showReadingTime ? this.generateReadingTimeSection(estimatedReadingTime) : ''}
                    </div>
                    
                    ${tags.length > 0 ? this.generateTagsSection(tags) : ''}
                    
                    <div class="blog-card__actions">
                        <a href="${postUrl}" class="blog-card__read-more">
                            Read More
                            <svg class="blog-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8.293 1.293a1 1 0 0 1 1.414 0l6 6a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414L12.586 9H2a1 1 0 1 1 0-2h10.586L8.293 2.707a1 1 0 0 1 0-1.414z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Generate image section
     */
    generateImageSection(featuredImage, title, postUrl) {
        if (!featuredImage) {
            return `
                <div class="blog-card__image-placeholder">
                    <svg class="blog-card__placeholder-icon" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                </div>
            `;
        }

        return `
            <div class="blog-card__image">
                <a href="${postUrl}">
                    <img 
                        src="${featuredImage.url}" 
                        alt="${this.escapeHtml(featuredImage.alt || title)}"
                        class="blog-card__image-img"
                        loading="lazy"
                    />
                </a>
            </div>
        `;
    }

    /**
     * Generate category badge
     */
    generateCategoryBadge(category) {
        return `
            <div class="blog-card__category">
                <span class="blog-card__category-badge">
                    ${this.escapeHtml(category.name || category)}
                </span>
            </div>
        `;
    }

    /**
     * Generate excerpt section
     */
    generateExcerptSection(excerpt) {
        return `
            <div class="blog-card__excerpt">
                <p>${this.escapeHtml(excerpt)}</p>
            </div>
        `;
    }

    /**
     * Generate author section
     */
    generateAuthorSection(author) {
        const authorName = typeof author === 'string' ? author : author.name;
        const authorAvatar = typeof author === 'object' ? author.avatar : null;

        return `
            <div class="blog-card__author">
                ${authorAvatar ? `
                    <img 
                        src="${authorAvatar}" 
                        alt="${this.escapeHtml(authorName)}"
                        class="blog-card__author-avatar"
                    />
                ` : ''}
                <span class="blog-card__author-name">${this.escapeHtml(authorName)}</span>
            </div>
        `;
    }

    /**
     * Generate date section
     */
    generateDateSection(formattedDate) {
        return `
            <div class="blog-card__date">
                <svg class="blog-card__date-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                <span class="blog-card__date-text">${formattedDate}</span>
            </div>
        `;
    }

    /**
     * Generate reading time section
     */
    generateReadingTimeSection(readingTime) {
        return `
            <div class="blog-card__reading-time">
                <svg class="blog-card__reading-time-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span class="blog-card__reading-time-text">${readingTime} min read</span>
            </div>
        `;
    }

    /**
     * Generate tags section
     */
    generateTagsSection(tags) {
        const tagElements = tags.slice(0, 3).map(tag => {
            const tagName = typeof tag === 'string' ? tag : tag.name;
            return `<span class="blog-card__tag">${this.escapeHtml(tagName)}</span>`;
        }).join('');

        return `
            <div class="blog-card__tags">
                ${tagElements}
                ${tags.length > 3 ? `<span class="blog-card__tag-more">+${tags.length - 3}</span>` : ''}
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const card = this.container.querySelector('.blog-card');
        if (!card) return;

        // Track card clicks for analytics
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                this.trackCardClick(this.post);
            }
        });

        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.classList.add('blog-card--hovered');
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('blog-card--hovered');
        });
    }

    /**
     * Track card click for analytics
     */
    trackCardClick(post) {
        try {
            // Send analytics event
            if (window.gtag) {
                window.gtag('event', 'blog_card_click', {
                    blog_post_id: post.id,
                    blog_post_title: post.title,
                    blog_category: post.category?.name || 'uncategorized'
                });
            }

            console.log('📊 Blog card click tracked:', post.title);
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
    }

    /**
     * Render error state
     */
    renderError(message) {
        this.container.innerHTML = `
            <div class="blog-card blog-card--error">
                <div class="blog-card__error">
                    <svg class="blog-card__error-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p class="blog-card__error-message">${this.escapeHtml(message)}</p>
                </div>
            </div>
        `;
    }

    /**
     * Utility methods
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    generateExcerpt(content) {
        if (!content) return '';
        
        // Strip HTML tags
        const textContent = content.replace(/<[^>]*>/g, '');
        
        if (textContent.length <= this.options.excerptLength) {
            return textContent;
        }
        
        return textContent.substring(0, this.options.excerptLength).trim() + '...';
    }

    calculateReadingTime(content) {
        if (!content) return 0;
        
        const wordsPerMinute = 200;
        const textContent = content.replace(/<[^>]*>/g, '');
        const wordCount = textContent.split(/\s+/).length;
        
        return Math.ceil(wordCount / wordsPerMinute);
    }

    /**
     * Update card with new post data
     */
    update(post) {
        this.render(post);
    }

    /**
     * Destroy the component
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.isInitialized = false;
    }
}
