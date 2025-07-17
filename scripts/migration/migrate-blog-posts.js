#!/usr/bin/env node

/**
 * Blog Posts Migration Script
 * Migrates static HTML blog posts to the database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = 'https://pbydepsqcypwqbicnsco.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Blog post metadata
const BLOG_POSTS = [
    {
        filename: 'auto-shop-valuation-factors.html',
        slug: 'auto-shop-valuation-factors',
        title: '5 Key Factors That Determine Auto Shop Value',
        author: 'Sarah Johnson',
        date: '2024-01-15',
        category: 'Valuation Guide',
        tags: ['valuation', 'auto-shop', 'business-analysis'],
        featured_image: 'https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80'
    },
    {
        filename: 'dfw-market-trends-2024.html',
        slug: 'dfw-market-trends-2024',
        title: 'DFW Auto Repair Market Trends 2024',
        author: 'Michael Chen',
        date: '2024-02-01',
        category: 'Market Analysis',
        tags: ['market-trends', 'dfw', 'auto-repair', '2024'],
        featured_image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80'
    },
    {
        filename: 'due-diligence-checklist.html',
        slug: 'due-diligence-checklist',
        title: 'Complete Due Diligence Checklist for Auto Shop Buyers',
        author: 'Jennifer Martinez',
        date: '2024-02-15',
        category: 'Buyer Guide',
        tags: ['due-diligence', 'checklist', 'buyer-guide'],
        featured_image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80'
    },
    {
        filename: 'financing-options-auto-shops.html',
        slug: 'financing-options-auto-shops',
        title: 'Financing Options for Auto Shop Acquisitions',
        author: 'David Rodriguez',
        date: '2024-03-01',
        category: 'Financing',
        tags: ['financing', 'loans', 'acquisition', 'funding'],
        featured_image: 'https://images.unsplash.com/photo-1554224154-26032fced8bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80'
    },
    {
        filename: 'preparing-auto-shop-for-sale.html',
        slug: 'preparing-auto-shop-for-sale',
        title: 'How to Prepare Your Auto Shop for Sale',
        author: 'Lisa Thompson',
        date: '2024-03-15',
        category: 'Seller Guide',
        tags: ['selling', 'preparation', 'seller-guide', 'valuation'],
        featured_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80'
    },
    {
        filename: 'express-deal-success-stories.html',
        slug: 'express-deal-success-stories',
        title: 'Express Deal Success Stories: Real Transactions',
        author: 'Robert Kim',
        date: '2024-04-01',
        category: 'Success Stories',
        tags: ['express-deal', 'success-stories', 'case-studies'],
        featured_image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80'
    }
];

// Blog categories to create
const BLOG_CATEGORIES = [
    { name: 'Valuation Guide', slug: 'valuation-guide', description: 'Expert guidance on business valuation', color: '#10b981' },
    { name: 'Market Analysis', slug: 'market-analysis', description: 'Industry trends and market insights', color: '#3b82f6' },
    { name: 'Buyer Guide', slug: 'buyer-guide', description: 'Resources for potential buyers', color: '#8b5cf6' },
    { name: 'Seller Guide', slug: 'seller-guide', description: 'Resources for business sellers', color: '#f59e0b' },
    { name: 'Financing', slug: 'financing', description: 'Funding and financing options', color: '#ef4444' },
    { name: 'Success Stories', slug: 'success-stories', description: 'Real transaction case studies', color: '#06b6d4' }
];

/**
 * Extract content from HTML file
 */
function extractContentFromHTML(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf8');
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Extract meta description
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

        // Extract main content (everything inside the article content section)
        const contentSection = document.querySelector('section .prose, .article-content, main .container');
        let content = '';
        
        if (contentSection) {
            // Remove navigation and header elements
            const elementsToRemove = contentSection.querySelectorAll('nav, header, .breadcrumb');
            elementsToRemove.forEach(el => el.remove());
            
            content = contentSection.innerHTML;
        } else {
            // Fallback: extract from main tag
            const mainContent = document.querySelector('main');
            if (mainContent) {
                content = mainContent.innerHTML;
            }
        }

        // Clean up the content
        content = content
            .replace(/class="[^"]*"/g, '') // Remove class attributes
            .replace(/id="[^"]*"/g, '') // Remove id attributes
            .replace(/style="[^"]*"/g, '') // Remove inline styles
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        return {
            content,
            meta_description: metaDescription,
            excerpt: generateExcerpt(content)
        };
    } catch (error) {
        console.error(`Error extracting content from ${filePath}:`, error);
        return { content: '', meta_description: '', excerpt: '' };
    }
}

/**
 * Generate excerpt from content
 */
function generateExcerpt(content, maxLength = 200) {
    // Strip HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    
    if (plainText.length <= maxLength) {
        return plainText;
    }
    
    // Find the last complete sentence within the limit
    const truncated = plainText.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > maxLength * 0.7) {
        return truncated.substring(0, lastSentence + 1);
    }
    
    return truncated + '...';
}

/**
 * Calculate reading time
 */
function calculateReadingTime(content) {
    const plainText = content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    return readingTime;
}

/**
 * Create blog categories
 */
async function createBlogCategories() {
    console.log('🏷️ Creating blog categories...');
    
    for (const category of BLOG_CATEGORIES) {
        try {
            const { data, error } = await supabase
                .from('blog_categories')
                .upsert(category, { onConflict: 'slug' });
            
            if (error) {
                console.error(`❌ Error creating category ${category.name}:`, error);
            } else {
                console.log(`✅ Created/updated category: ${category.name}`);
            }
        } catch (error) {
            console.error(`❌ Exception creating category ${category.name}:`, error);
        }
    }
}

/**
 * Get category ID by name
 */
async function getCategoryId(categoryName) {
    const { data, error } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('name', categoryName)
        .single();
    
    if (error) {
        console.error(`Error getting category ID for ${categoryName}:`, error);
        return null;
    }
    
    return data?.id;
}

/**
 * Migrate blog posts
 */
async function migrateBlogPosts() {
    console.log('📝 Migrating blog posts...');
    
    const blogDir = path.join(__dirname, '..', 'blog');
    let successCount = 0;
    let errorCount = 0;
    
    for (const postMeta of BLOG_POSTS) {
        try {
            console.log(`\n📄 Processing: ${postMeta.title}`);
            
            const filePath = path.join(blogDir, postMeta.filename);
            
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️ File not found: ${filePath}`);
                errorCount++;
                continue;
            }
            
            // Extract content from HTML
            const { content, meta_description, excerpt } = extractContentFromHTML(filePath);
            
            if (!content) {
                console.log(`⚠️ No content extracted from ${postMeta.filename}`);
                errorCount++;
                continue;
            }
            
            // Get category ID
            const categoryId = await getCategoryId(postMeta.category);
            
            // Prepare post data
            const postData = {
                title: postMeta.title,
                slug: postMeta.slug,
                content: content,
                excerpt: excerpt || meta_description,
                meta_description: meta_description,
                meta_keywords: postMeta.tags,
                author_name: postMeta.author,
                status: 'published',
                featured_image: postMeta.featured_image,
                tags: postMeta.tags,
                category_id: categoryId,
                reading_time: calculateReadingTime(content),
                published_at: new Date(postMeta.date).toISOString(),
                created_at: new Date(postMeta.date).toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Insert into database
            const { data, error } = await supabase
                .from('content_pages')
                .upsert(postData, { onConflict: 'slug' });
            
            if (error) {
                console.error(`❌ Error migrating ${postMeta.title}:`, error);
                errorCount++;
            } else {
                console.log(`✅ Successfully migrated: ${postMeta.title}`);
                successCount++;
            }
            
        } catch (error) {
            console.error(`❌ Exception migrating ${postMeta.title}:`, error);
            errorCount++;
        }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total: ${BLOG_POSTS.length}`);
}

/**
 * Main migration function
 */
async function main() {
    console.log('🚀 Starting blog posts migration...');
    console.log('=====================================');
    
    try {
        // Test database connection
        const { data, error } = await supabase.from('content_pages').select('count').limit(1);
        if (error) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
        console.log('✅ Database connection successful');
        
        // Create categories first
        await createBlogCategories();
        
        // Migrate blog posts
        await migrateBlogPosts();
        
        console.log('\n🎉 Blog migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main as migrateBlogPosts };
