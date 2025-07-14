#!/usr/bin/env node

/**
 * Database Validation Test Script
 * Node.js compatible version for comprehensive database testing
 */

import { createClient } from '@supabase/supabase-js';

class DatabaseValidator {
    constructor() {
        this.supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';
        this.supabase = null;
        this.testResults = [];
    }

    logTest(testName, success, message, details = null) {
        const result = {
            test: testName,
            success,
            message,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const icon = success ? '✅' : '❌';
        console.log(`${icon} ${testName}: ${message}`);
        
        if (details && !success) {
            console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
        }
    }

    async initializeClient() {
        console.log('🔧 Initializing Supabase client...');
        
        try {
            this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
            this.logTest('Client Initialization', true, 'Supabase client created successfully');
            return true;
        } catch (error) {
            this.logTest('Client Initialization', false, 'Failed to create Supabase client', error.message);
            return false;
        }
    }

    async testDatabaseSchema() {
        console.log('\n📊 Testing Database Schema...');
        
        const coreTables = ['profiles', 'listings', 'matches', 'messages'];
        const cmsTables = ['content_pages', 'blog_categories', 'documents', 'deals', 'vendors', 'vendor_reviews'];
        const allTables = [...coreTables, ...cmsTables];
        
        let accessibleTables = 0;
        
        for (const tableName of allTables) {
            try {
                const { data, error } = await this.supabase
                    .from(tableName)
                    .select('id')
                    .limit(1);

                if (error) {
                    if (error.message.includes('infinite recursion')) {
                        this.logTest(`Table ${tableName}`, false, 'INFINITE RECURSION detected in RLS policies', error.message);
                    } else if (error.message.includes('does not exist')) {
                        this.logTest(`Table ${tableName}`, false, 'Table does not exist', error.message);
                    } else {
                        this.logTest(`Table ${tableName}`, false, `Access error: ${error.message}`, error);
                    }
                } else {
                    this.logTest(`Table ${tableName}`, true, `Accessible (${data.length} records tested)`);
                    accessibleTables++;
                }
            } catch (error) {
                this.logTest(`Table ${tableName}`, false, `Exception: ${error.message}`, error);
            }
        }
        
        console.log(`\n📈 Schema Summary: ${accessibleTables}/${allTables.length} tables accessible`);
        return accessibleTables === allTables.length;
    }

    async testCMSFunctionality() {
        console.log('\n🧪 Testing CMS Functionality...');
        
        const cmsTests = [
            { table: 'blog_categories', operation: 'SELECT categories' },
            { table: 'content_pages', operation: 'SELECT content pages' },
            { table: 'documents', operation: 'SELECT documents' },
            { table: 'deals', operation: 'SELECT deals' },
            { table: 'vendors', operation: 'SELECT vendors' },
            { table: 'vendor_reviews', operation: 'SELECT vendor reviews' }
        ];
        
        let successfulTests = 0;
        
        for (const test of cmsTests) {
            try {
                const { data, error } = await this.supabase
                    .from(test.table)
                    .select('*')
                    .limit(5);

                if (error) {
                    this.logTest(test.operation, false, error.message, error);
                } else {
                    this.logTest(test.operation, true, `Retrieved ${data.length} records`);
                    successfulTests++;
                }
            } catch (error) {
                this.logTest(test.operation, false, `Exception: ${error.message}`, error);
            }
        }
        
        console.log(`\n📈 CMS Summary: ${successfulTests}/${cmsTests.length} operations successful`);
        return successfulTests === cmsTests.length;
    }

    async testServiceIntegration() {
        console.log('\n🔧 Testing Service Integration...');
        
        try {
            // Test authentication service
            const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
            if (sessionError) {
                this.logTest('Auth Service', false, `Session error: ${sessionError.message}`, sessionError);
            } else {
                this.logTest('Auth Service', true, session ? `Active session: ${session.user.email}` : 'No active session (normal)');
            }

            // Test basic database operations
            const { data: profiles, error: profileError } = await this.supabase
                .from('profiles')
                .select('id')
                .limit(1);

            if (profileError) {
                this.logTest('Database Service', false, `Profile access error: ${profileError.message}`, profileError);
            } else {
                this.logTest('Database Service', true, 'Basic database operations working');
            }

            return !sessionError && !profileError;
        } catch (error) {
            this.logTest('Service Integration', false, `Exception: ${error.message}`, error);
            return false;
        }
    }

    async testRLSPolicies() {
        console.log('\n🔒 Testing RLS Policies...');
        
        const testTables = ['profiles', 'listings', 'content_pages', 'blog_categories'];
        let rlsIssues = 0;
        
        for (const tableName of testTables) {
            try {
                const { data, error } = await this.supabase
                    .from(tableName)
                    .select('id')
                    .limit(1);

                if (error && error.message.includes('infinite recursion')) {
                    this.logTest(`RLS ${tableName}`, false, 'INFINITE RECURSION in RLS policy', error.message);
                    rlsIssues++;
                } else if (error) {
                    this.logTest(`RLS ${tableName}`, false, `RLS error: ${error.message}`, error);
                    rlsIssues++;
                } else {
                    this.logTest(`RLS ${tableName}`, true, 'RLS policies working correctly');
                }
            } catch (error) {
                this.logTest(`RLS ${tableName}`, false, `Exception: ${error.message}`, error);
                rlsIssues++;
            }
        }
        
        console.log(`\n🔒 RLS Summary: ${rlsIssues} issues detected`);
        return rlsIssues === 0;
    }

    generateFinalReport() {
        console.log('\n📋 FINAL VALIDATION REPORT');
        console.log('=' .repeat(50));
        
        const successes = this.testResults.filter(r => r.success).length;
        const failures = this.testResults.filter(r => !r.success).length;
        const total = this.testResults.length;
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${successes}`);
        console.log(`Failed: ${failures}`);
        console.log(`Success Rate: ${((successes / total) * 100).toFixed(1)}%`);
        
        if (failures === 0) {
            console.log('\n🎉 ALL TESTS PASSED - Database is fully operational!');
            return true;
        } else {
            console.log('\n❌ ISSUES DETECTED - Review failed tests above');
            
            // Show critical failures
            const criticalFailures = this.testResults.filter(r => 
                !r.success && (
                    r.message.includes('infinite recursion') ||
                    r.message.includes('does not exist') ||
                    r.test.includes('Client Initialization')
                )
            );
            
            if (criticalFailures.length > 0) {
                console.log('\n🚨 CRITICAL ISSUES:');
                criticalFailures.forEach(failure => {
                    console.log(`   - ${failure.test}: ${failure.message}`);
                });
            }
            
            return false;
        }
    }

    async runFullValidation() {
        console.log('🚀 Starting Comprehensive Database Validation...');
        console.log('Project: BuyMartV1');
        console.log('Supabase Project: pbydepsqcypwqbicnsco');
        console.log('Timestamp:', new Date().toISOString());
        console.log('=' .repeat(50));
        
        try {
            const clientInit = await this.initializeClient();
            if (!clientInit) {
                console.log('❌ Cannot proceed without Supabase client');
                return false;
            }

            await this.testDatabaseSchema();
            await this.testCMSFunctionality();
            await this.testServiceIntegration();
            await this.testRLSPolicies();
            
            return this.generateFinalReport();
        } catch (error) {
            console.error('❌ Validation failed with exception:', error);
            return false;
        }
    }
}

// Run validation if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new DatabaseValidator();
    validator.runFullValidation()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { DatabaseValidator };
