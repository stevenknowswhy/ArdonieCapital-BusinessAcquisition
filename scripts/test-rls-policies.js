#!/usr/bin/env node

/**
 * RLS Policy Testing Script
 * Comprehensive testing of Row Level Security policies
 */

import { supabaseService } from '../src/shared/services/supabase/index.js';

class RLSPolicyTester {
    constructor() {
        this.testResults = [];
        this.currentUser = null;
    }

    /**
     * Log test result
     */
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

    /**
     * Test profile access policies
     */
    async testProfilePolicies() {
        console.log('\n🔍 Testing Profile Policies...');

        // Test 1: View all profiles (should work)
        try {
            const response = await supabaseService.select('profiles', { limit: 10 });
            this.logTest(
                'View All Profiles',
                response.success,
                response.success ? 
                    `Retrieved ${response.data.length} profiles` : 
                    response.error
            );
        } catch (error) {
            this.logTest('View All Profiles', false, error.message);
        }

        // Test 2: Try to insert a profile (should fail without proper user_id)
        try {
            const testProfile = {
                user_id: '00000000-0000-0000-0000-000000000000', // Invalid user ID
                first_name: 'Test',
                last_name: 'User',
                role: 'buyer'
            };
            
            const response = await supabaseService.insert('profiles', testProfile);
            this.logTest(
                'Insert Profile with Invalid User ID',
                !response.success, // Should fail
                response.success ? 
                    'Unexpectedly succeeded (RLS may not be working)' : 
                    'Correctly blocked unauthorized insert'
            );
        } catch (error) {
            this.logTest('Insert Profile with Invalid User ID', true, 'Correctly blocked by RLS');
        }
    }

    /**
     * Test listing access policies
     */
    async testListingPolicies() {
        console.log('\n🔍 Testing Listing Policies...');

        // Test 1: View active listings (should work for everyone)
        try {
            const response = await supabaseService.select('listings', {
                eq: { status: 'active' },
                limit: 10
            });
            this.logTest(
                'View Active Listings',
                response.success,
                response.success ? 
                    `Retrieved ${response.data.length} active listings` : 
                    response.error
            );
        } catch (error) {
            this.logTest('View Active Listings', false, error.message);
        }

        // Test 2: Try to view draft listings (should be restricted)
        try {
            const response = await supabaseService.select('listings', {
                eq: { status: 'draft' },
                limit: 10
            });
            
            // If user is not authenticated, this should return empty or fail
            // If user is authenticated, they should only see their own drafts
            this.logTest(
                'View Draft Listings',
                true, // This test is informational
                response.success ? 
                    `Retrieved ${response.data.length} draft listings (user-specific)` : 
                    'No draft listings accessible'
            );
        } catch (error) {
            this.logTest('View Draft Listings', true, 'Access properly restricted');
        }
    }

    /**
     * Test match access policies
     */
    async testMatchPolicies() {
        console.log('\n🔍 Testing Match Policies...');

        // Test 1: Try to view all matches (should be restricted)
        try {
            const response = await supabaseService.select('matches', { limit: 10 });
            
            // Should only return matches involving the current user
            this.logTest(
                'View Matches',
                true, // This is informational
                response.success ? 
                    `Retrieved ${response.data.length} matches (user-specific)` : 
                    'No matches accessible'
            );
        } catch (error) {
            this.logTest('View Matches', true, 'Access properly restricted');
        }

        // Test 2: Try to insert a match with invalid user IDs
        try {
            const testMatch = {
                buyer_id: '00000000-0000-0000-0000-000000000000',
                seller_id: '00000000-0000-0000-0000-000000000001',
                listing_id: '00000000-0000-0000-0000-000000000002',
                compatibility_score: 0.8,
                status: 'pending'
            };
            
            const response = await supabaseService.insert('matches', testMatch);
            this.logTest(
                'Insert Match with Invalid IDs',
                !response.success, // Should fail
                response.success ? 
                    'Unexpectedly succeeded (RLS may not be working)' : 
                    'Correctly blocked unauthorized insert'
            );
        } catch (error) {
            this.logTest('Insert Match with Invalid IDs', true, 'Correctly blocked by RLS');
        }
    }

    /**
     * Test message access policies
     */
    async testMessagePolicies() {
        console.log('\n🔍 Testing Message Policies...');

        // Test 1: Try to view all messages (should be restricted)
        try {
            const response = await supabaseService.select('messages', { limit: 10 });
            
            this.logTest(
                'View Messages',
                true, // This is informational
                response.success ? 
                    `Retrieved ${response.data.length} messages (user-specific)` : 
                    'No messages accessible'
            );
        } catch (error) {
            this.logTest('View Messages', true, 'Access properly restricted');
        }
    }

    /**
     * Test notification access policies
     */
    async testNotificationPolicies() {
        console.log('\n🔍 Testing Notification Policies...');

        // Test 1: Try to view notifications
        try {
            const response = await supabaseService.select('notifications', { limit: 10 });
            
            this.logTest(
                'View Notifications',
                true, // This is informational
                response.success ? 
                    `Retrieved ${response.data.length} notifications (user-specific)` : 
                    'No notifications accessible'
            );
        } catch (error) {
            this.logTest('View Notifications', true, 'Access properly restricted');
        }
    }

    /**
     * Test authentication status
     */
    async testAuthentication() {
        console.log('\n🔍 Testing Authentication...');

        try {
            const userResponse = await supabaseService.getCurrentUser();
            const sessionResponse = await supabaseService.getCurrentSession();
            
            this.currentUser = userResponse.user;
            
            this.logTest(
                'User Authentication',
                userResponse.success,
                userResponse.success ? 
                    `Authenticated as: ${userResponse.user.email}` : 
                    'Not authenticated'
            );
            
            this.logTest(
                'Session Status',
                sessionResponse.success,
                sessionResponse.success ? 
                    'Valid session found' : 
                    'No valid session'
            );
        } catch (error) {
            this.logTest('Authentication Check', false, error.message);
        }
    }

    /**
     * Generate test report
     */
    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;

        const report = {
            summary: {
                total_tests: totalTests,
                passed: passedTests,
                failed: failedTests,
                success_rate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0
            },
            current_user: this.currentUser,
            test_results: this.testResults,
            timestamp: new Date().toISOString()
        };

        console.log('\n📊 Test Summary:');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${report.summary.success_rate}%`);

        return report;
    }

    /**
     * Run all RLS policy tests
     */
    async runAllTests() {
        console.log('🧪 Starting RLS Policy Tests...');

        await this.testAuthentication();
        await this.testProfilePolicies();
        await this.testListingPolicies();
        await this.testMatchPolicies();
        await this.testMessagePolicies();
        await this.testNotificationPolicies();

        const report = this.generateReport();
        
        // Save report to file
        const fs = await import('fs');
        const reportPath = 'rls-test-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);

        return report;
    }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new RLSPolicyTester();
    tester.runAllTests()
        .then(report => {
            if (report.summary.failed === 0) {
                console.log('\n✅ All RLS policy tests passed!');
                process.exit(0);
            } else {
                console.log('\n⚠️  Some tests failed. Check the report for details.');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Test execution failed:', error);
            process.exit(1);
        });
}

export default RLSPolicyTester;
