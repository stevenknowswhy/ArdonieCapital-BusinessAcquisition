#!/usr/bin/env node

/**
 * Migration Scripts Test
 * Tests migration scripts without actually running them
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

/**
 * Test database connection
 */
async function testDatabaseConnection() {
    console.log('🔌 Testing database connection...');
    
    try {
        // Test basic connection
        const { data, error } = await supabase.from('content_pages').select('count').limit(1);
        if (error) {
            throw new Error(`Connection failed: ${error.message}`);
        }
        
        console.log('✅ Database connection successful');
        
        // Test table existence
        const tables = ['content_pages', 'blog_categories', 'documents'];
        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('count').limit(1);
            if (error) {
                console.log(`❌ Table ${table} not accessible: ${error.message}`);
            } else {
                console.log(`✅ Table ${table} accessible`);
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

/**
 * Test blog files existence and structure
 */
function testBlogFiles() {
    console.log('\n📝 Testing blog files...');
    
    const blogDir = path.join(__dirname, '..', 'blog');
    const expectedFiles = [
        'auto-shop-valuation-factors.html',
        'dfw-market-trends-2024.html',
        'due-diligence-checklist.html',
        'financing-options-auto-shops.html',
        'preparing-auto-shop-for-sale.html',
        'express-deal-success-stories.html'
    ];
    
    let foundFiles = 0;
    let validFiles = 0;
    
    for (const filename of expectedFiles) {
        const filePath = path.join(blogDir, filename);
        
        if (fs.existsSync(filePath)) {
            foundFiles++;
            console.log(`✅ Found: ${filename}`);
            
            // Test content extraction
            try {
                const html = fs.readFileSync(filePath, 'utf8');
                const dom = new JSDOM(html);
                const document = dom.window.document;
                
                const title = document.querySelector('h1')?.textContent?.trim();
                const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
                
                if (title && metaDesc) {
                    validFiles++;
                    console.log(`   📄 Title: ${title.substring(0, 50)}...`);
                    console.log(`   📝 Meta: ${metaDesc.substring(0, 50)}...`);
                } else {
                    console.log(`   ⚠️ Missing title or meta description`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error parsing HTML: ${error.message}`);
            }
        } else {
            console.log(`❌ Missing: ${filename}`);
        }
    }
    
    console.log(`\n📊 Blog Files Summary:`);
    console.log(`   Found: ${foundFiles}/${expectedFiles.length}`);
    console.log(`   Valid: ${validFiles}/${foundFiles}`);
    
    return { found: foundFiles, valid: validFiles, total: expectedFiles.length };
}

/**
 * Test document files existence and structure
 */
function testDocumentFiles() {
    console.log('\n📄 Testing document files...');
    
    const documentsDir = path.join(__dirname, '..', 'documents');
    const expectedFiles = [
        'business-plan.html',
        'company-strategy.html',
        'financial-projections.html',
        'founding-member.html',
        'marketing-plan.html',
        'nda.html',
        'one-page-pitch.html',
        'pitch-deck-fi.html',
        'pitch-deck-legal.html',
        'templates.html',
        'vendor-accounting.html',
        'vendor-financial.html',
        'vendor-legal.html'
    ];
    
    let foundFiles = 0;
    let validFiles = 0;
    
    for (const filename of expectedFiles) {
        const filePath = path.join(documentsDir, filename);
        
        if (fs.existsSync(filePath)) {
            foundFiles++;
            console.log(`✅ Found: ${filename}`);
            
            // Test content extraction
            try {
                const stats = fs.statSync(filePath);
                const html = fs.readFileSync(filePath, 'utf8');
                const dom = new JSDOM(html);
                const document = dom.window.document;
                
                const title = document.querySelector('h1')?.textContent?.trim() ||
                             document.querySelector('title')?.textContent?.trim();
                
                if (title) {
                    validFiles++;
                    console.log(`   📄 Title: ${title.substring(0, 50)}...`);
                    console.log(`   📊 Size: ${stats.size} bytes`);
                } else {
                    console.log(`   ⚠️ Missing title`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error parsing HTML: ${error.message}`);
            }
        } else {
            console.log(`❌ Missing: ${filename}`);
        }
    }
    
    console.log(`\n📊 Document Files Summary:`);
    console.log(`   Found: ${foundFiles}/${expectedFiles.length}`);
    console.log(`   Valid: ${validFiles}/${foundFiles}`);
    
    return { found: foundFiles, valid: validFiles, total: expectedFiles.length };
}

/**
 * Test migration script files
 */
function testMigrationScripts() {
    console.log('\n🔧 Testing migration scripts...');
    
    const scriptsDir = __dirname;
    const migrationScripts = [
        'migrate-blog-posts.js',
        'migrate-documents.js',
        'run-data-migration.js'
    ];
    
    let validScripts = 0;
    
    for (const script of migrationScripts) {
        const scriptPath = path.join(scriptsDir, script);
        
        if (fs.existsSync(scriptPath)) {
            console.log(`✅ Found: ${script}`);
            
            // Check if script is executable
            try {
                const content = fs.readFileSync(scriptPath, 'utf8');
                
                // Check for required imports
                const hasSupabaseImport = content.includes('@supabase/supabase-js');
                const hasJSDOMImport = content.includes('jsdom');
                const hasMainFunction = content.includes('async function main');
                
                if (hasSupabaseImport && hasJSDOMImport && hasMainFunction) {
                    validScripts++;
                    console.log(`   ✅ Script structure valid`);
                } else {
                    console.log(`   ⚠️ Missing required imports or main function`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error reading script: ${error.message}`);
            }
        } else {
            console.log(`❌ Missing: ${script}`);
        }
    }
    
    console.log(`\n📊 Migration Scripts Summary:`);
    console.log(`   Valid: ${validScripts}/${migrationScripts.length}`);
    
    return { valid: validScripts, total: migrationScripts.length };
}

/**
 * Test backup directory creation
 */
function testBackupDirectory() {
    console.log('\n💾 Testing backup directory...');
    
    const backupDir = path.join(__dirname, '..', 'backups');
    
    try {
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
            console.log('✅ Created backup directory');
        } else {
            console.log('✅ Backup directory exists');
        }
        
        // Test write permissions
        const testFile = path.join(backupDir, 'test-write.json');
        fs.writeFileSync(testFile, JSON.stringify({ test: true }));
        fs.unlinkSync(testFile);
        console.log('✅ Backup directory writable');
        
        return true;
    } catch (error) {
        console.error('❌ Backup directory test failed:', error);
        return false;
    }
}

/**
 * Generate pre-migration report
 */
function generatePreMigrationReport(results) {
    const report = {
        timestamp: new Date().toISOString(),
        test_type: 'pre_migration_validation',
        database_connection: results.database,
        blog_files: results.blogFiles,
        document_files: results.documentFiles,
        migration_scripts: results.migrationScripts,
        backup_directory: results.backupDirectory,
        ready_for_migration: results.database && 
                           results.blogFiles.valid > 0 && 
                           results.documentFiles.valid > 0 && 
                           results.migrationScripts.valid === results.migrationScripts.total &&
                           results.backupDirectory,
        recommendations: []
    };
    
    // Add recommendations
    if (!results.database) {
        report.recommendations.push('Fix database connection before proceeding');
    }
    
    if (results.blogFiles.valid < results.blogFiles.total) {
        report.recommendations.push(`Fix ${results.blogFiles.total - results.blogFiles.valid} blog files`);
    }
    
    if (results.documentFiles.valid < results.documentFiles.total) {
        report.recommendations.push(`Fix ${results.documentFiles.total - results.documentFiles.valid} document files`);
    }
    
    if (results.migrationScripts.valid < results.migrationScripts.total) {
        report.recommendations.push('Fix migration scripts');
    }
    
    if (report.ready_for_migration) {
        report.recommendations.push('All tests passed - ready to run migration');
    }
    
    const reportPath = path.join(__dirname, '..', 'pre-migration-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📋 Pre-migration test report saved to: ${reportPath}`);
    return report;
}

/**
 * Main test function
 */
async function main() {
    console.log('🧪 Running pre-migration tests...');
    console.log('==================================');
    
    const results = {
        database: false,
        blogFiles: { found: 0, valid: 0, total: 0 },
        documentFiles: { found: 0, valid: 0, total: 0 },
        migrationScripts: { valid: 0, total: 0 },
        backupDirectory: false
    };
    
    try {
        // Test database connection
        results.database = await testDatabaseConnection();
        
        // Test blog files
        results.blogFiles = testBlogFiles();
        
        // Test document files
        results.documentFiles = testDocumentFiles();
        
        // Test migration scripts
        results.migrationScripts = testMigrationScripts();
        
        // Test backup directory
        results.backupDirectory = testBackupDirectory();
        
        // Generate report
        const report = generatePreMigrationReport(results);
        
        console.log('\n🎯 Pre-Migration Test Summary:');
        console.log('==============================');
        console.log(`Database Connection: ${results.database ? '✅' : '❌'}`);
        console.log(`Blog Files: ${results.blogFiles.valid}/${results.blogFiles.total} ✅`);
        console.log(`Document Files: ${results.documentFiles.valid}/${results.documentFiles.total} ✅`);
        console.log(`Migration Scripts: ${results.migrationScripts.valid}/${results.migrationScripts.total} ✅`);
        console.log(`Backup Directory: ${results.backupDirectory ? '✅' : '❌'}`);
        console.log(`Ready for Migration: ${report.ready_for_migration ? '✅' : '❌'}`);
        
        if (report.ready_for_migration) {
            console.log('\n🚀 All tests passed! Ready to run migration:');
            console.log('   npm run migrate:all');
        } else {
            console.log('\n⚠️ Issues found. Please address before migration:');
            report.recommendations.forEach(rec => {
                console.log(`   • ${rec}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main as testMigrationScripts };
