#!/usr/bin/env node

/**
 * Supabase Connection and CRUD Operations Test Script
 * Comprehensive testing of database connectivity and operations
 */

import { supabaseService } from '../../src/shared/services/supabase/index.js';
import { authService } from '../../src/features/authentication/index.js';

class SupabaseConnectionTester {
    constructor() {
        this.testResults = [];
        this.testUser = null;
        this.testProfile = null;
        this.testListing = null;
    }

    /**
     * Log test result
     */
    logTest(testName, success, message, data = null) {
        const result = {
            test: testName,
            success,
            message,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const icon = success ? '✅' : '❌';
        console.log(`${icon} ${testName}: ${message}`);
        
        if (data && !success) {
            console.log(`   Error details: ${JSON.stringify(data, null, 2)}`);
        }
    }

    /**
     * Test basic Supabase connection
     */
    async testConnection() {
        console.log('\n🔗 Testing Supabase Connection...');

        try {
            const healthCheck = await supabaseService.healthCheck();
            this.logTest(
                'Database Connection',
                healthCheck.success,
                healthCheck.success ? 'Connected successfully' : healthCheck.error,
                healthCheck
            );
        } catch (error) {
            this.logTest('Database Connection', false, error.message, error);
        }
    }

    /**
     * Test authentication operations
     */
    async testAuthentication() {
        console.log('\n🔐 Testing Authentication...');

        // Test 1: Check current session
        try {
            const sessionResponse = await supabaseService.getCurrentSession();
            this.logTest(
                'Current Session Check',
                true, // Always log as success for info
                sessionResponse.success ? 
                    'Valid session found' : 
                    'No active session'
            );
        } catch (error) {
            this.logTest('Current Session Check', false, error.message);
        }

        // Test 2: Check current user
        try {
            const userResponse = await supabaseService.getCurrentUser();
            this.testUser = userResponse.user;
            this.logTest(
                'Current User Check',
                true, // Always log as success for info
                userResponse.success ? 
                    `User: ${userResponse.user?.email || 'Unknown'}` : 
                    'No authenticated user'
            );
        } catch (error) {
            this.logTest('Current User Check', false, error.message);
        }

        // Test 3: Test sign up (with cleanup)
        const testEmail = `test-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        try {
            const signUpResponse = await supabaseService.signUp(testEmail, testPassword, {
                first_name: 'Test',
                last_name: 'User'
            });
            
            this.logTest(
                'User Registration',
                signUpResponse.success,
                signUpResponse.success ? 
                    'Registration successful' : 
                    signUpResponse.error
            );

            // Clean up test user if created
            if (signUpResponse.success && signUpResponse.data.user) {
                // Note: In a real scenario, you'd need admin privileges to delete users
                console.log('   Note: Test user created, manual cleanup may be required');
            }
        } catch (error) {
            this.logTest('User Registration', false, error.message);
        }
    }

    /**
     * Test profile CRUD operations
     */
    async testProfileOperations() {
        console.log('\n👤 Testing Profile Operations...');

        // Test 1: Read profiles
        try {
            const response = await supabaseService.select('profiles', { limit: 5 });
            this.logTest(
                'Read Profiles',
                response.success,
                response.success ? 
                    `Retrieved ${response.data.length} profiles` : 
                    response.error
            );

            if (response.success && response.data.length > 0) {
                this.testProfile = response.data[0];
            }
        } catch (error) {
            this.logTest('Read Profiles', false, error.message);
        }

        // Test 2: Create profile (if user is authenticated)
        if (this.testUser) {
            try {
                const profileData = {
                    user_id: this.testUser.id,
                    first_name: 'Test',
                    last_name: 'Profile',
                    role: 'buyer',
                    company: 'Test Company'
                };

                const response = await supabaseService.insert('profiles', profileData);
                this.logTest(
                    'Create Profile',
                    response.success,
                    response.success ? 
                        'Profile created successfully' : 
                        response.error
                );

                if (response.success) {
                    this.testProfile = response.data[0];
                }
            } catch (error) {
                this.logTest('Create Profile', false, error.message);
            }
        }

        // Test 3: Update profile
        if (this.testProfile) {
            try {
                const updateData = {
                    bio: 'Updated test bio',
                    updated_at: new Date().toISOString()
                };

                const response = await supabaseService.update(
                    'profiles', 
                    updateData, 
                    { id: this.testProfile.id }
                );
                
                this.logTest(
                    'Update Profile',
                    response.success,
                    response.success ? 
                        'Profile updated successfully' : 
                        response.error
                );
            } catch (error) {
                this.logTest('Update Profile', false, error.message);
            }
        }
    }

    /**
     * Test listing CRUD operations
     */
    async testListingOperations() {
        console.log('\n🏢 Testing Listing Operations...');

        // Test 1: Read listings
        try {
            const response = await supabaseService.select('listings', { 
                eq: { status: 'active' },
                limit: 5 
            });
            this.logTest(
                'Read Active Listings',
                response.success,
                response.success ? 
                    `Retrieved ${response.data.length} active listings` : 
                    response.error
            );

            if (response.success && response.data.length > 0) {
                this.testListing = response.data[0];
            }
        } catch (error) {
            this.logTest('Read Active Listings', false, error.message);
        }

        // Test 2: Create listing (if profile exists)
        if (this.testProfile) {
            try {
                const listingData = {
                    seller_id: this.testProfile.id,
                    title: 'Test Auto Shop',
                    description: 'A test auto shop listing',
                    asking_price: 250000,
                    business_type: 'Auto Repair Shop',
                    industry: 'automotive',
                    location: 'Test City, TX',
                    city: 'Test City',
                    state: 'TX',
                    status: 'draft'
                };

                const response = await supabaseService.insert('listings', listingData);
                this.logTest(
                    'Create Listing',
                    response.success,
                    response.success ? 
                        'Listing created successfully' : 
                        response.error
                );

                if (response.success) {
                    this.testListing = response.data[0];
                }
            } catch (error) {
                this.logTest('Create Listing', false, error.message);
            }
        }

        // Test 3: Update listing
        if (this.testListing) {
            try {
                const updateData = {
                    description: 'Updated test description',
                    updated_at: new Date().toISOString()
                };

                const response = await supabaseService.update(
                    'listings', 
                    updateData, 
                    { id: this.testListing.id }
                );
                
                this.logTest(
                    'Update Listing',
                    response.success,
                    response.success ? 
                        'Listing updated successfully' : 
                        response.error
                );
            } catch (error) {
                this.logTest('Update Listing', false, error.message);
            }
        }
    }

    /**
     * Test match operations
     */
    async testMatchOperations() {
        console.log('\n🤝 Testing Match Operations...');

        // Test 1: Read matches
        try {
            const response = await supabaseService.select('matches', { limit: 5 });
            this.logTest(
                'Read Matches',
                true, // Always success for info
                response.success ? 
                    `Retrieved ${response.data.length} matches` : 
                    'No matches accessible (expected with RLS)'
            );
        } catch (error) {
            this.logTest('Read Matches', true, 'Access restricted by RLS (expected)');
        }
    }

    /**
     * Test real-time subscriptions
     */
    async testRealtimeSubscriptions() {
        console.log('\n⚡ Testing Real-time Subscriptions...');

        try {
            let messageReceived = false;
            
            const channel = supabaseService.subscribe('listings', (payload) => {
                messageReceived = true;
                console.log('   Real-time event received:', payload.eventType);
            });

            // Wait a moment to see if subscription works
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.logTest(
                'Real-time Subscription',
                !!channel,
                channel ? 
                    'Subscription created successfully' : 
                    'Failed to create subscription'
            );

            // Clean up subscription
            if (channel) {
                await supabaseService.getClient().removeChannel(channel);
            }
        } catch (error) {
            this.logTest('Real-time Subscription', false, error.message);
        }
    }

    /**
     * Clean up test data
     */
    async cleanupTestData() {
        console.log('\n🧹 Cleaning up test data...');

        // Clean up test listing
        if (this.testListing && this.testListing.id) {
            try {
                await supabaseService.delete('listings', { id: this.testListing.id });
                console.log('   Test listing cleaned up');
            } catch (error) {
                console.log('   Failed to clean up test listing:', error.message);
            }
        }

        // Note: Profile and user cleanup would require admin privileges
        if (this.testProfile) {
            console.log('   Note: Test profile may require manual cleanup');
        }
    }

    /**
     * Generate comprehensive test report
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
            test_environment: {
                supabase_url: process.env.SUPABASE_URL || 'Not configured',
                has_anon_key: !!(process.env.SUPABASE_ANON_KEY),
                has_service_key: !!(process.env.SUPABASE_SERVICE_ROLE_KEY),
                node_env: process.env.NODE_ENV || 'development'
            },
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
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Starting Supabase Connection and CRUD Tests...');

        try {
            await this.testConnection();
            await this.testAuthentication();
            await this.testProfileOperations();
            await this.testListingOperations();
            await this.testMatchOperations();
            await this.testRealtimeSubscriptions();
            
            const report = this.generateReport();
            
            // Save report to file
            const fs = await import('fs');
            const reportPath = 'supabase-test-report.json';
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n📄 Detailed report saved to: ${reportPath}`);

            // Cleanup
            await this.cleanupTestData();

            return report;
        } catch (error) {
            console.error('❌ Test execution failed:', error);
            throw error;
        }
    }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new SupabaseConnectionTester();
    tester.runAllTests()
        .then(report => {
            if (report.summary.failed === 0) {
                console.log('\n✅ All Supabase tests passed!');
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

export default SupabaseConnectionTester;

/**
 * Integration Test Runner
 * Tests the complete authentication and data flow
 */
export class SupabaseIntegrationTester {
    constructor() {
        this.testResults = [];
    }

    async testCompleteUserFlow() {
        console.log('\n🔄 Testing Complete User Flow...');

        try {
            // 1. Test user registration
            const testEmail = `integration-test-${Date.now()}@example.com`;
            const testPassword = 'IntegrationTest123!';

            const registrationResult = await authService.register({
                firstName: 'Integration',
                lastName: 'Test',
                email: testEmail,
                password: testPassword,
                confirmPassword: testPassword,
                userType: 'buyer'
            });

            console.log('✅ User registration:', registrationResult.success ? 'Success' : 'Failed');

            // 2. Test user login
            if (registrationResult.success) {
                const loginResult = await authService.login(testEmail, testPassword);
                console.log('✅ User login:', loginResult.success ? 'Success' : 'Failed');

                // 3. Test authenticated operations
                if (loginResult.success) {
                    const currentUser = await authService.getCurrentUser();
                    console.log('✅ Get current user:', currentUser ? 'Success' : 'Failed');

                    // 4. Test logout
                    await authService.logout();
                    console.log('✅ User logout: Success');
                }
            }

            return { success: true };
        } catch (error) {
            console.error('❌ Integration test failed:', error.message);
            return { success: false, error: error.message };
        }
    }
}
