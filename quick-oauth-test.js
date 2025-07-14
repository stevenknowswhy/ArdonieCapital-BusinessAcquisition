/**
 * Quick OAuth Configuration Test
 * Tests if OAuth providers are properly configured
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pbydepsqcypwqbicnsco.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NzI2NzQsImV4cCI6MjA1MDI0ODY3NH0.Ej5c8dJONhqJmJyJcPONzqJQZ5zJQZ5zJQZ5zJQZ5zI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testOAuthProviders() {
    console.log('🔗 QUICK OAUTH CONFIGURATION TEST');
    console.log('='.repeat(50));
    
    try {
        // Test Google OAuth
        console.log('\n🔍 Testing Google OAuth...');
        const { data: googleData, error: googleError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://localhost:8000/test-oauth-authentication.html'
            }
        });
        
        if (googleError) {
            console.log('❌ Google OAuth Error:', googleError.message);
        } else if (googleData?.url) {
            console.log('✅ Google OAuth URL generated successfully');
            console.log('   URL starts with:', googleData.url.substring(0, 50) + '...');
        } else {
            console.log('❌ Google OAuth: No URL generated');
        }
        
        // Test Microsoft OAuth
        console.log('\n🔍 Testing Microsoft OAuth...');
        const { data: microsoftData, error: microsoftError } = await supabase.auth.signInWithOAuth({
            provider: 'azure',
            options: {
                redirectTo: 'http://localhost:8000/test-oauth-authentication.html'
            }
        });
        
        if (microsoftError) {
            console.log('❌ Microsoft OAuth Error:', microsoftError.message);
        } else if (microsoftData?.url) {
            console.log('✅ Microsoft OAuth URL generated successfully');
            console.log('   URL starts with:', microsoftData.url.substring(0, 50) + '...');
        } else {
            console.log('❌ Microsoft OAuth: No URL generated');
        }
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 OAUTH TEST SUMMARY');
        console.log('='.repeat(50));
        
        const googleWorking = !googleError && googleData?.url;
        const microsoftWorking = !microsoftError && microsoftData?.url;
        
        console.log(`Google OAuth: ${googleWorking ? '✅ Working' : '❌ Failed'}`);
        console.log(`Microsoft OAuth: ${microsoftWorking ? '✅ Working' : '❌ Failed'}`);
        
        if (!googleWorking || !microsoftWorking) {
            console.log('\n🔧 CONFIGURATION FIXES NEEDED:');
            if (!googleWorking) {
                console.log('   • Check Google provider configuration in Supabase dashboard');
                console.log('   • Verify Google Client ID and Secret are correct');
            }
            if (!microsoftWorking) {
                console.log('   • Check Microsoft provider configuration in Supabase dashboard');
                console.log('   • Verify Microsoft Client ID, Secret, and Tenant ID are correct');
                console.log('   • Ensure you use the SECRET VALUE, not the Secret ID');
            }
        } else {
            console.log('\n🎉 Both OAuth providers are configured correctly!');
        }
        
    } catch (error) {
        console.error('❌ OAuth test failed:', error.message);
    }
}

testOAuthProviders();
