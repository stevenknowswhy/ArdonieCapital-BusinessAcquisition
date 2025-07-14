#!/usr/bin/env node

/**
 * Data Migration Orchestrator
 * Runs all data migrations with backup and rollback capabilities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { migrateBlogPosts } from './migrate-blog-posts.js';
import { migrateDocuments } from './migrate-documents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = 'https://pbydepsqcypwqbicnsco.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Create backup of existing data
 */
async function createBackup() {
    console.log('💾 Creating backup of existing data...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups', `migration-backup-${timestamp}`);
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    try {
        // Backup blog categories
        const { data: categories, error: catError } = await supabase
            .from('blog_categories')
            .select('*');
        
        if (!catError && categories) {
            fs.writeFileSync(
                path.join(backupDir, 'blog_categories.json'),
                JSON.stringify(categories, null, 2)
            );
            console.log(`✅ Backed up ${categories.length} blog categories`);
        }
        
        // Backup content pages
        const { data: posts, error: postsError } = await supabase
            .from('content_pages')
            .select('*');
        
        if (!postsError && posts) {
            fs.writeFileSync(
                path.join(backupDir, 'content_pages.json'),
                JSON.stringify(posts, null, 2)
            );
            console.log(`✅ Backed up ${posts.length} content pages`);
        }
        
        // Backup documents
        const { data: documents, error: docsError } = await supabase
            .from('documents')
            .select('*');
        
        if (!docsError && documents) {
            fs.writeFileSync(
                path.join(backupDir, 'documents.json'),
                JSON.stringify(documents, null, 2)
            );
            console.log(`✅ Backed up ${documents.length} documents`);
        }
        
        // Create backup metadata
        const backupMetadata = {
            timestamp: new Date().toISOString(),
            tables: ['blog_categories', 'content_pages', 'documents'],
            counts: {
                blog_categories: categories?.length || 0,
                content_pages: posts?.length || 0,
                documents: documents?.length || 0
            }
        };
        
        fs.writeFileSync(
            path.join(backupDir, 'backup-metadata.json'),
            JSON.stringify(backupMetadata, null, 2)
        );
        
        console.log(`✅ Backup created at: ${backupDir}`);
        return backupDir;
        
    } catch (error) {
        console.error('❌ Error creating backup:', error);
        throw error;
    }
}

/**
 * Restore from backup
 */
async function restoreFromBackup(backupDir) {
    console.log(`🔄 Restoring from backup: ${backupDir}`);
    
    try {
        // Restore blog categories
        const categoriesPath = path.join(backupDir, 'blog_categories.json');
        if (fs.existsSync(categoriesPath)) {
            const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
            
            // Clear existing categories
            await supabase.from('blog_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            
            // Restore categories
            if (categories.length > 0) {
                const { error } = await supabase.from('blog_categories').insert(categories);
                if (error) throw error;
                console.log(`✅ Restored ${categories.length} blog categories`);
            }
        }
        
        // Restore content pages
        const postsPath = path.join(backupDir, 'content_pages.json');
        if (fs.existsSync(postsPath)) {
            const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
            
            // Clear existing posts
            await supabase.from('content_pages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            
            // Restore posts
            if (posts.length > 0) {
                const { error } = await supabase.from('content_pages').insert(posts);
                if (error) throw error;
                console.log(`✅ Restored ${posts.length} content pages`);
            }
        }
        
        // Restore documents
        const documentsPath = path.join(backupDir, 'documents.json');
        if (fs.existsSync(documentsPath)) {
            const documents = JSON.parse(fs.readFileSync(documentsPath, 'utf8'));
            
            // Clear existing documents
            await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            
            // Restore documents
            if (documents.length > 0) {
                const { error } = await supabase.from('documents').insert(documents);
                if (error) throw error;
                console.log(`✅ Restored ${documents.length} documents`);
            }
        }
        
        console.log('✅ Backup restoration completed successfully');
        
    } catch (error) {
        console.error('❌ Error restoring from backup:', error);
        throw error;
    }
}

/**
 * Validate migration results
 */
async function validateMigration() {
    console.log('🔍 Validating migration results...');
    
    try {
        // Check blog categories
        const { data: categories, error: catError } = await supabase
            .from('blog_categories')
            .select('id, name, slug');
        
        if (catError) throw catError;
        
        // Check content pages
        const { data: posts, error: postsError } = await supabase
            .from('content_pages')
            .select('id, title, slug, status, category_id');
        
        if (postsError) throw postsError;
        
        // Check documents
        const { data: documents, error: docsError } = await supabase
            .from('documents')
            .select('id, title, category, access_level');
        
        if (docsError) throw docsError;
        
        console.log('\n📊 Migration Validation Results:');
        console.log('================================');
        console.log(`📁 Blog Categories: ${categories.length}`);
        console.log(`📝 Content Pages: ${posts.length}`);
        console.log(`📄 Documents: ${documents.length}`);
        
        // Validate relationships
        const postsWithCategories = posts.filter(post => post.category_id);
        console.log(`🔗 Posts with categories: ${postsWithCategories.length}/${posts.length}`);
        
        // Check for published posts
        const publishedPosts = posts.filter(post => post.status === 'published');
        console.log(`📢 Published posts: ${publishedPosts.length}/${posts.length}`);
        
        // Validate document access levels
        const accessLevels = {};
        documents.forEach(doc => {
            accessLevels[doc.access_level] = (accessLevels[doc.access_level] || 0) + 1;
        });
        
        console.log('\n🔒 Document Access Levels:');
        Object.entries(accessLevels).forEach(([level, count]) => {
            console.log(`   ${level}: ${count}`);
        });
        
        return {
            categories: categories.length,
            posts: posts.length,
            documents: documents.length,
            publishedPosts: publishedPosts.length,
            postsWithCategories: postsWithCategories.length
        };
        
    } catch (error) {
        console.error('❌ Error validating migration:', error);
        throw error;
    }
}

/**
 * Generate migration report
 */
function generateMigrationReport(results, backupDir) {
    const report = {
        timestamp: new Date().toISOString(),
        migration_type: 'static_to_database',
        backup_location: backupDir,
        results: results,
        status: 'completed',
        tables_migrated: ['blog_categories', 'content_pages', 'documents'],
        next_steps: [
            'Update navigation links to point to dynamic blog',
            'Test CMS functionality',
            'Update SEO redirects',
            'Train content managers on new system'
        ]
    };
    
    const reportPath = path.join(__dirname, '..', 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📋 Migration report saved to: ${reportPath}`);
    return report;
}

/**
 * Main migration function
 */
async function main() {
    console.log('🚀 Starting comprehensive data migration...');
    console.log('==========================================');
    
    let backupDir = null;
    
    try {
        // Test database connection
        const { data, error } = await supabase.from('content_pages').select('count').limit(1);
        if (error) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
        console.log('✅ Database connection successful');
        
        // Create backup
        backupDir = await createBackup();
        
        // Run blog posts migration
        console.log('\n📝 Starting blog posts migration...');
        await migrateBlogPosts();
        
        // Run documents migration
        console.log('\n📄 Starting documents migration...');
        await migrateDocuments();
        
        // Validate migration
        const results = await validateMigration();
        
        // Generate report
        const report = generateMigrationReport(results, backupDir);
        
        console.log('\n🎉 Data migration completed successfully!');
        console.log('\n📋 Next Steps:');
        console.log('1. Test the dynamic blog at /blog/dynamic-blog.html');
        console.log('2. Update navigation links to point to new dynamic pages');
        console.log('3. Set up SEO redirects from old static pages');
        console.log('4. Train content managers on the new CMS');
        console.log(`5. Backup location: ${backupDir}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        
        if (backupDir) {
            console.log('\n🔄 Attempting to restore from backup...');
            try {
                await restoreFromBackup(backupDir);
                console.log('✅ Successfully restored from backup');
            } catch (restoreError) {
                console.error('❌ Failed to restore from backup:', restoreError);
                console.log(`💾 Manual restore may be needed from: ${backupDir}`);
            }
        }
        
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--rollback')) {
    const backupPath = args[args.indexOf('--rollback') + 1];
    if (!backupPath) {
        console.error('❌ Please provide backup path: --rollback <backup-directory>');
        process.exit(1);
    }
    restoreFromBackup(backupPath).then(() => {
        console.log('✅ Rollback completed');
    }).catch(error => {
        console.error('❌ Rollback failed:', error);
        process.exit(1);
    });
} else if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main as runDataMigration, restoreFromBackup };
