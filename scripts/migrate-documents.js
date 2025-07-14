#!/usr/bin/env node

/**
 * Documents Migration Script
 * Migrates static HTML documents to the database
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

// Document metadata
const DOCUMENTS = [
    {
        filename: 'business-plan.html',
        title: 'Business Plan Template',
        description: 'Comprehensive business plan template for auto repair shops',
        category: 'Templates',
        access_level: 'public',
        file_type: 'text/html'
    },
    {
        filename: 'company-strategy.html',
        title: 'Company Strategy Guide',
        description: 'Strategic planning guide for auto repair businesses',
        category: 'Strategy',
        access_level: 'authenticated',
        file_type: 'text/html'
    },
    {
        filename: 'financial-projections.html',
        title: 'Financial Projections Template',
        description: 'Financial modeling and projections template',
        category: 'Financial',
        access_level: 'authenticated',
        file_type: 'text/html'
    },
    {
        filename: 'founding-member.html',
        title: 'Founding Member Agreement',
        description: 'Legal template for founding member agreements',
        category: 'Legal',
        access_level: 'premium',
        file_type: 'text/html'
    },
    {
        filename: 'marketing-plan.html',
        title: 'Marketing Plan Template',
        description: 'Comprehensive marketing strategy template',
        category: 'Marketing',
        access_level: 'authenticated',
        file_type: 'text/html'
    },
    {
        filename: 'nda.html',
        title: 'Non-Disclosure Agreement',
        description: 'Standard NDA template for business transactions',
        category: 'Legal',
        access_level: 'public',
        file_type: 'text/html'
    },
    {
        filename: 'one-page-pitch.html',
        title: 'One Page Pitch Template',
        description: 'Concise business pitch template',
        category: 'Templates',
        access_level: 'public',
        file_type: 'text/html'
    },
    {
        filename: 'pitch-deck-fi.html',
        title: 'Financial Institution Pitch Deck',
        description: 'Specialized pitch deck for financial institutions',
        category: 'Financial',
        access_level: 'premium',
        file_type: 'text/html'
    },
    {
        filename: 'pitch-deck-legal.html',
        title: 'Legal Firm Pitch Deck',
        description: 'Specialized pitch deck for legal firms',
        category: 'Legal',
        access_level: 'premium',
        file_type: 'text/html'
    },
    {
        filename: 'templates.html',
        title: 'Document Templates Collection',
        description: 'Collection of business document templates',
        category: 'Templates',
        access_level: 'public',
        file_type: 'text/html'
    },
    {
        filename: 'vendor-accounting.html',
        title: 'Vendor Accounting Guide',
        description: 'Accounting guidelines for vendor partnerships',
        category: 'Accounting',
        access_level: 'authenticated',
        file_type: 'text/html'
    },
    {
        filename: 'vendor-financial.html',
        title: 'Vendor Financial Requirements',
        description: 'Financial requirements for vendor partnerships',
        category: 'Financial',
        access_level: 'authenticated',
        file_type: 'text/html'
    },
    {
        filename: 'vendor-legal.html',
        title: 'Vendor Legal Framework',
        description: 'Legal framework for vendor partnerships',
        category: 'Legal',
        access_level: 'authenticated',
        file_type: 'text/html'
    }
];

/**
 * Extract content from HTML document
 */
function extractDocumentContent(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf8');
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Extract title from h1 or title tag
        let title = document.querySelector('h1')?.textContent?.trim() ||
                   document.querySelector('title')?.textContent?.trim() ||
                   '';

        // Extract meta description
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

        // Extract main content
        const contentSelectors = [
            'main .container',
            '.document-content',
            '.content',
            'main',
            'body'
        ];

        let content = '';
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                // Remove navigation and header elements
                const elementsToRemove = element.querySelectorAll('nav, header, .breadcrumb, .navigation');
                elementsToRemove.forEach(el => el.remove());
                
                content = element.innerHTML;
                break;
            }
        }

        // Clean up the content
        content = content
            .replace(/class="[^"]*"/g, '') // Remove class attributes
            .replace(/id="[^"]*"/g, '') // Remove id attributes
            .replace(/style="[^"]*"/g, '') // Remove inline styles
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        // Calculate file size
        const stats = fs.statSync(filePath);
        const fileSize = stats.size;

        return {
            title,
            content,
            description: metaDescription,
            file_size: fileSize
        };
    } catch (error) {
        console.error(`Error extracting content from ${filePath}:`, error);
        return { title: '', content: '', description: '', file_size: 0 };
    }
}

/**
 * Create virtual file path for database storage
 */
function createVirtualFilePath(filename, category) {
    const timestamp = new Date().toISOString().split('T')[0];
    return `/documents/${category.toLowerCase()}/${timestamp}-${filename}`;
}

/**
 * Migrate documents
 */
async function migrateDocuments() {
    console.log('📄 Migrating documents...');
    
    const documentsDir = path.join(__dirname, '..', 'documents');
    let successCount = 0;
    let errorCount = 0;
    
    for (const docMeta of DOCUMENTS) {
        try {
            console.log(`\n📄 Processing: ${docMeta.title}`);
            
            const filePath = path.join(documentsDir, docMeta.filename);
            
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️ File not found: ${filePath}`);
                errorCount++;
                continue;
            }
            
            // Extract content from HTML
            const { title, content, description, file_size } = extractDocumentContent(filePath);
            
            if (!content) {
                console.log(`⚠️ No content extracted from ${docMeta.filename}`);
                errorCount++;
                continue;
            }
            
            // Create virtual file path
            const virtualFilePath = createVirtualFilePath(docMeta.filename, docMeta.category);
            
            // Prepare document data
            const documentData = {
                title: title || docMeta.title,
                description: description || docMeta.description,
                file_path: virtualFilePath,
                file_type: docMeta.file_type,
                file_size: file_size,
                category: docMeta.category,
                access_level: docMeta.access_level,
                content: content, // Store HTML content in a content field if it exists
                download_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Insert into database
            const { data, error } = await supabase
                .from('documents')
                .upsert(documentData, { onConflict: 'file_path' });
            
            if (error) {
                console.error(`❌ Error migrating ${docMeta.title}:`, error);
                errorCount++;
            } else {
                console.log(`✅ Successfully migrated: ${docMeta.title}`);
                console.log(`   📁 Virtual path: ${virtualFilePath}`);
                console.log(`   🔒 Access level: ${docMeta.access_level}`);
                console.log(`   📊 File size: ${file_size} bytes`);
                successCount++;
            }
            
        } catch (error) {
            console.error(`❌ Exception migrating ${docMeta.title}:`, error);
            errorCount++;
        }
    }
    
    console.log(`\n📊 Documents Migration Summary:`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📄 Total: ${DOCUMENTS.length}`);
}

/**
 * Create document categories summary
 */
async function createCategorySummary() {
    console.log('\n📋 Document Categories Summary:');
    
    const categories = [...new Set(DOCUMENTS.map(doc => doc.category))];
    
    for (const category of categories) {
        const categoryDocs = DOCUMENTS.filter(doc => doc.category === category);
        console.log(`\n📁 ${category}:`);
        categoryDocs.forEach(doc => {
            console.log(`   • ${doc.title} (${doc.access_level})`);
        });
    }
}

/**
 * Verify migration
 */
async function verifyMigration() {
    console.log('\n🔍 Verifying migration...');
    
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('title, category, access_level, file_size')
            .order('category', { ascending: true });
        
        if (error) {
            console.error('❌ Error verifying migration:', error);
            return;
        }
        
        console.log(`\n✅ Found ${data.length} documents in database:`);
        
        const categoryCounts = {};
        data.forEach(doc => {
            categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
        });
        
        Object.entries(categoryCounts).forEach(([category, count]) => {
            console.log(`   📁 ${category}: ${count} documents`);
        });
        
        // Check access levels
        const accessLevels = {};
        data.forEach(doc => {
            accessLevels[doc.access_level] = (accessLevels[doc.access_level] || 0) + 1;
        });
        
        console.log('\n🔒 Access Level Distribution:');
        Object.entries(accessLevels).forEach(([level, count]) => {
            console.log(`   ${level}: ${count} documents`);
        });
        
    } catch (error) {
        console.error('❌ Exception during verification:', error);
    }
}

/**
 * Main migration function
 */
async function main() {
    console.log('🚀 Starting documents migration...');
    console.log('=====================================');
    
    try {
        // Test database connection
        const { data, error } = await supabase.from('documents').select('count').limit(1);
        if (error) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
        console.log('✅ Database connection successful');
        
        // Show category summary
        await createCategorySummary();
        
        // Migrate documents
        await migrateDocuments();
        
        // Verify migration
        await verifyMigration();
        
        console.log('\n🎉 Documents migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main as migrateDocuments };
