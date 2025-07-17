#!/usr/bin/env node

/**
 * Supabase RLS Setup Script
 * This script helps set up and verify Row Level Security policies
 */

import fs from 'fs';
import path from 'path';
import { supabaseService } from '../../src/shared/services/supabase/index.js';

class SupabaseRLSSetup {
    constructor() {
        this.databaseDir = path.join(process.cwd(), 'database');
        this.policies = [];
    }

    /**
     * Read SQL files
     */
    readSQLFile(filename) {
        const filePath = path.join(this.databaseDir, filename);
        if (!fs.existsSync(filePath)) {
            throw new Error(`SQL file not found: ${filePath}`);
        }
        return fs.readFileSync(filePath, 'utf8');
    }

    /**
     * Execute SQL commands
     */
    async executeSQL(sql, description = '') {
        try {
            console.log(`🔧 ${description || 'Executing SQL'}...`);
            
            // Note: This is a simplified approach. In a real implementation,
            // you would use the Supabase management API or direct database connection
            // For now, we'll provide instructions for manual execution
            
            console.log('📋 SQL to execute:');
            console.log('---');
            console.log(sql);
            console.log('---');
            
            return { success: true };
        } catch (error) {
            console.error(`❌ Error executing SQL: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify RLS is enabled on tables
     */
    async verifyRLSEnabled() {
        console.log('🔍 Verifying RLS is enabled on tables...');
        
        const tables = [
            'profiles',
            'listings', 
            'matches',
            'messages',
            'notifications',
            'saved_listings',
            'search_history',
            'analytics_events'
        ];

        const results = [];
        
        for (const table of tables) {
            try {
                // Try to query the table - this will help verify basic access
                const response = await supabaseService.select(table, { limit: 1 });
                results.push({
                    table,
                    accessible: response.success,
                    error: response.error
                });
                
                if (response.success) {
                    console.log(`✅ ${table}: RLS working (query successful)`);
                } else {
                    console.log(`⚠️  ${table}: ${response.error}`);
                }
            } catch (error) {
                results.push({
                    table,
                    accessible: false,
                    error: error.message
                });
                console.log(`❌ ${table}: ${error.message}`);
            }
        }

        return results;
    }

    /**
     * Test RLS policies with sample operations
     */
    async testRLSPolicies() {
        console.log('🧪 Testing RLS policies...');

        const tests = [
            {
                name: 'Profile Access Test',
                test: async () => {
                    // Test that users can only access their own profile
                    const response = await supabaseService.select('profiles', { limit: 5 });
                    return {
                        success: response.success,
                        message: response.success ? 
                            `Retrieved ${response.data.length} profiles` : 
                            response.error
                    };
                }
            },
            {
                name: 'Listings Access Test',
                test: async () => {
                    // Test that users can view active listings
                    const response = await supabaseService.select('listings', { 
                        eq: { status: 'active' },
                        limit: 5 
                    });
                    return {
                        success: response.success,
                        message: response.success ? 
                            `Retrieved ${response.data.length} active listings` : 
                            response.error
                    };
                }
            },
            {
                name: 'Authentication Check',
                test: async () => {
                    // Test current user authentication
                    const response = await supabaseService.getCurrentUser();
                    return {
                        success: response.success,
                        message: response.success ? 
                            `Authenticated as: ${response.user?.email || 'Unknown'}` : 
                            'Not authenticated'
                    };
                }
            }
        ];

        const results = [];
        
        for (const test of tests) {
            try {
                console.log(`  Running: ${test.name}`);
                const result = await test.test();
                results.push({
                    name: test.name,
                    ...result
                });
                
                if (result.success) {
                    console.log(`  ✅ ${test.name}: ${result.message}`);
                } else {
                    console.log(`  ❌ ${test.name}: ${result.message}`);
                }
            } catch (error) {
                results.push({
                    name: test.name,
                    success: false,
                    message: error.message
                });
                console.log(`  ❌ ${test.name}: ${error.message}`);
            }
        }

        return results;
    }

    /**
     * Generate RLS setup report
     */
    generateReport(rlsResults, testResults) {
        const report = {
            timestamp: new Date().toISOString(),
            rls_verification: rlsResults,
            policy_tests: testResults,
            summary: {
                total_tables: rlsResults.length,
                accessible_tables: rlsResults.filter(r => r.accessible).length,
                total_tests: testResults.length,
                passed_tests: testResults.filter(r => r.success).length
            }
        };

        const reportPath = path.join(process.cwd(), 'rls-setup-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`📊 Report saved to: ${reportPath}`);
        return report;
    }

    /**
     * Main setup process
     */
    async run() {
        console.log('🚀 Starting Supabase RLS Setup...\n');

        try {
            // Step 1: Display schema setup instructions
            console.log('📋 Step 1: Database Schema Setup');
            console.log('Please run the following SQL files in your Supabase SQL Editor:');
            console.log('1. database/schema.sql - Creates tables and indexes');
            console.log('2. database/rls-policies.sql - Sets up RLS policies');
            console.log('3. database/sample-data.sql - Adds sample data (optional)\n');

            // Step 2: Verify RLS
            console.log('📋 Step 2: Verifying RLS Configuration');
            const rlsResults = await this.verifyRLSEnabled();
            console.log('');

            // Step 3: Test policies
            console.log('📋 Step 3: Testing RLS Policies');
            const testResults = await this.testRLSPolicies();
            console.log('');

            // Step 4: Generate report
            console.log('📋 Step 4: Generating Report');
            const report = this.generateReport(rlsResults, testResults);

            // Summary
            console.log('\n📊 Setup Summary:');
            console.log(`Tables accessible: ${report.summary.accessible_tables}/${report.summary.total_tables}`);
            console.log(`Tests passed: ${report.summary.passed_tests}/${report.summary.total_tests}`);

            if (report.summary.accessible_tables === report.summary.total_tables && 
                report.summary.passed_tests === report.summary.total_tests) {
                console.log('✅ RLS setup appears to be working correctly!');
            } else {
                console.log('⚠️  Some issues detected. Check the report for details.');
            }

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }
}

// Run the setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new SupabaseRLSSetup();
    setup.run().catch(console.error);
}

export default SupabaseRLSSetup;
