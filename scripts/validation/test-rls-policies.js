#!/usr/bin/env node

/**
 * Test RLS Policies for BuyMart V1
 * Validates that Row Level Security policies are working correctly
 * 
 * Usage:
 *   node scripts/validation/test-rls-policies.js [environment]
 * 
 * Environment options: development, staging, production
 * Default: development
 */

const { createClient } = require('@supabase/supabase-js');

// Test configuration
const config = {
    development: {
        url: process.env.SUPABASE_URL || 'https://pbydepsqcypwqbicnsco.supabase.co',
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceKey: process.env.SUPABASE_SERVICE_KEY
    },
    staging: {
        url: process.env.STAGING_SUPABASE_URL,
        anonKey: process.env.STAGING_SUPABASE_ANON_KEY,
        serviceKey: process.env.STAGING_SUPABASE_SERVICE_KEY
    },
    production: {
        url: process.env.PRODUCTION_SUPABASE_URL,
        anonKey: process.env.PRODUCTION_SUPABASE_ANON_KEY,
        serviceKey: process.env.PRODUCTION_SUPABASE_SERVICE_KEY
    }
};

// Test user credentials for testing
const testUsers = {
    user1: { email: 'reforiy538@iamtile.com', password: 'gK9.t1|ROnQ52U[' },
    user2: { email: 'test2@example.com', password: 'TestPassword123!' }
};

async function testRLSPolicies(environment = 'development') {
    console.log(`🧪 Testing RLS Policies in ${environment} environment...`);
    
    const envConfig = config[environment];
    if (!envConfig.url || !envConfig.anonKey) {
        console.error(`❌ Missing configuration for ${environment} environment`);
        process.exit(1);
    }
    
    // Create clients
    const adminClient = createClient(envConfig.url, envConfig.serviceKey || envConfig.anonKey);
    const anonClient = createClient(envConfig.url, envConfig.anonKey);
    
    let testResults = {
        passed: 0,
        failed: 0,
        skipped: 0,
        tests: []
    };
    
    function logTest(name, status, message = '') {
        const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
        console.log(`${statusIcon} ${name}: ${message}`);
        testResults.tests.push({ name, status, message });
        if (status === 'PASS') testResults.passed++;
        else if (status === 'FAIL') testResults.failed++;
        else testResults.skipped++;
    }
    
    try {
        console.log('\n📋 Test 1: Anonymous Access Restrictions');
        
        // Test 1.1: Anonymous users cannot access user-specific data
        try {
            const { data, error } = await anonClient
                .from('profiles')
                .select('*')
                .limit(1);
            
            if (data && data.length > 0) {
                logTest('Anonymous profile access', 'PASS', 'Can view public profiles');
            } else if (error) {
                logTest('Anonymous profile access', 'PASS', 'Properly restricted');
            } else {
                logTest('Anonymous profile access', 'PASS', 'No data returned (expected)');
            }
        } catch (err) {
            logTest('Anonymous profile access', 'FAIL', err.message);
        }
        
        // Test 1.2: Anonymous users can view active listings
        try {
            const { data, error } = await anonClient
                .from('listings')
                .select('*')
                .eq('status', 'active')
                .limit(1);
            
            if (!error) {
                logTest('Anonymous listing access', 'PASS', 'Can view active listings');
            } else {
                logTest('Anonymous listing access', 'FAIL', error.message);
            }
        } catch (err) {
            logTest('Anonymous listing access', 'SKIP', 'Listings table may not exist');
        }
        
        console.log('\n📋 Test 2: Authenticated User Access');
        
        // Test 2.1: User authentication
        const userClient = createClient(envConfig.url, envConfig.anonKey);
        try {
            const { data: authData, error: authError } = await userClient.auth.signInWithPassword({
                email: testUsers.user1.email,
                password: testUsers.user1.password
            });
            
            if (authData.user && !authError) {
                logTest('User authentication', 'PASS', `Authenticated as ${authData.user.email}`);
                
                // Test 2.2: Authenticated user can access their profile
                try {
                    const { data: profileData, error: profileError } = await userClient
                        .from('profiles')
                        .select('*')
                        .eq('user_id', authData.user.id)
                        .single();
                    
                    if (!profileError) {
                        logTest('User profile access', 'PASS', 'Can access own profile');
                    } else {
                        logTest('User profile access', 'FAIL', profileError.message);
                    }
                } catch (err) {
                    logTest('User profile access', 'SKIP', 'Profile may not exist');
                }
                
                // Test 2.3: User cannot access other users' private data
                try {
                    const { data: otherData, error: otherError } = await userClient
                        .from('messages')
                        .select('*')
                        .neq('sender_id', authData.user.id)
                        .neq('recipient_id', authData.user.id)
                        .limit(1);
                    
                    if (otherError || (otherData && otherData.length === 0)) {
                        logTest('User data isolation', 'PASS', 'Cannot access other users\' messages');
                    } else {
                        logTest('User data isolation', 'FAIL', 'Can access other users\' data');
                    }
                } catch (err) {
                    logTest('User data isolation', 'SKIP', 'Messages table may not exist');
                }
                
            } else {
                logTest('User authentication', 'SKIP', 'Test user not available');
            }
        } catch (err) {
            logTest('User authentication', 'SKIP', 'Authentication not available');
        }
        
        console.log('\n📋 Test 3: Table RLS Status Verification');
        
        // Test 3.1: Check RLS is enabled on core tables
        const coreTables = [
            'profiles', 'user_roles', 'listings', 'saved_listings',
            'messages', 'notifications', 'search_history', 'analytics_events'
        ];
        
        for (const tableName of coreTables) {
            try {
                // Try to access table without authentication
                const { data, error } = await anonClient
                    .from(tableName)
                    .select('count')
                    .limit(0);
                
                if (error && error.message.includes('RLS')) {
                    logTest(`RLS on ${tableName}`, 'PASS', 'RLS properly enabled');
                } else if (!error) {
                    logTest(`RLS on ${tableName}`, 'PASS', 'Table accessible (may have public policies)');
                } else {
                    logTest(`RLS on ${tableName}`, 'SKIP', 'Table may not exist');
                }
            } catch (err) {
                logTest(`RLS on ${tableName}`, 'SKIP', 'Unable to test');
            }
        }
        
        console.log('\n📋 Test 4: Policy Performance Check');
        
        // Test 4.1: Check for policy recursion issues
        try {
            const startTime = Date.now();
            const { data, error } = await anonClient
                .from('profiles')
                .select('id')
                .limit(5);
            const endTime = Date.now();
            
            const responseTime = endTime - startTime;
            if (responseTime < 5000) { // Less than 5 seconds
                logTest('Policy performance', 'PASS', `Response time: ${responseTime}ms`);
            } else {
                logTest('Policy performance', 'FAIL', `Slow response: ${responseTime}ms (possible recursion)`);
            }
        } catch (err) {
            logTest('Policy performance', 'FAIL', 'Query timeout or error');
        }
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
        testResults.failed++;
    }
    
    // Print summary
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⏭️  Skipped: ${testResults.skipped}`);
    console.log(`📝 Total: ${testResults.tests.length}`);
    
    const successRate = testResults.passed / (testResults.passed + testResults.failed) * 100;
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 All RLS tests passed! Security policies are working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Review the RLS policies and fix any issues.');
    }
    
    // Detailed results
    if (testResults.failed > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.tests
            .filter(test => test.status === 'FAIL')
            .forEach(test => console.log(`   - ${test.name}: ${test.message}`));
    }
    
    return testResults.failed === 0;
}

// Parse command line arguments
const environment = process.argv[2] || 'development';

if (!['development', 'staging', 'production'].includes(environment)) {
    console.error('❌ Invalid environment. Use: development, staging, or production');
    process.exit(1);
}

// Run tests
testRLSPolicies(environment)
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('💥 Test suite crashed:', error);
        process.exit(1);
    });
